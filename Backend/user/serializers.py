from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import HorseData, HorseMeasurement, User, UserHorse

WEAK_PASSWORD_PARTS = ("jelszo", "password", "qwerty", "admin", "123")


def validate_user_password(password, user):
    if any(part in password.lower() for part in WEAK_PASSWORD_PARTS):
        raise serializers.ValidationError("week-password")

    try:
        validate_password(password, user)
    except DjangoValidationError as error:
        raise serializers.ValidationError(error.messages)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "password",
            "lang",
            "date_joined",
            "is_active",
        ]
        read_only_fields = ["id", "date_joined", "is_active"]

    def validate_password(self, value):
        user = self.instance or User(
            email=self.initial_data.get("email", ""),
            name=self.initial_data.get("name", ""),
        )
        validate_user_password(value, user)
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data.get("name"),
            lang=validated_data.get("lang", "hu"),
        )


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "lang",
            "date_joined",
            "is_active",
        ]
        read_only_fields = ["id", "date_joined", "is_active"]


class HorseDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorseData
        fields = [
            "id",
            "name",
            "chip_number",
            "stable_name",
            "studbook_number",
            "birth_date",
            "gender",
            "is_healthy",
            "color",
            "markings",
            "branding",
            "breeder",
            "owner",
            "father",
            "mother",
            "maternal_grandsire",
            "breed",
            "image",
            "desc",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_chip_number(self, value):
        value = value.strip()

        duplicates = HorseData.objects.filter(chip_number=value)
        if self.instance:
            duplicates = duplicates.exclude(pk=self.instance.pk)

        if value and duplicates.exists():
            raise serializers.ValidationError(
                "Ez a chipazonosító már szerepel az adatbázisban."
            )

        return value


class HorseMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorseMeasurement
        fields = [
            "id",
            "horse",
            "measured_at",
            "inserted_at",
            "height",
            "weight",
            "girth",
            "cannon_girth",
            "image",
            "ai_image",
        ]
        read_only_fields = ["id", "horse", "inserted_at", "ai_image"]

    def validate(self, attrs):
        horse = self.context.get("horse") or getattr(self.instance, "horse", None)
        measured_at = attrs.get(
            "measured_at",
            getattr(self.instance, "measured_at", None),
        )

        if horse and horse.birth_date and measured_at:
            if timezone.is_aware(measured_at):
                measured_at = timezone.localtime(measured_at)

            if measured_at.date() < horse.birth_date:
                raise serializers.ValidationError(
                    {"measured_at": "measurement_before_birth"}
                )

        return attrs


class UserHorseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    horse = HorseDataSerializer(read_only=True)

    class Meta:
        model = UserHorse
        fields = ["user", "horse", "created_at"]
