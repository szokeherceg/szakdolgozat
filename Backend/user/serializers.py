
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import User, HorseData, HorseMeasurement, UserHorse


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

    def validate_password(self, value):
        forbidden_words = [
            "jelszo",
            "password",
            "qwerty",
            "admin",
            "123",
            "1234",
            "123456789",
        ]

        if any(word in value.lower() for word in forbidden_words):
            raise serializers.ValidationError("week-password")

        user = self.instance

        if user is None:
            user = User(
                email=self.initial_data.get("email", ""),
                name=self.initial_data.get("name", ""),
            )

        try:
            validate_password(value, user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages)

        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data.get("name"),
            lang=validated_data.get("lang", "hu"),
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data.get("email"),
            password=data.get("password"),
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        return {"user": user}


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
            "color",
            "markings",
            "branding",
            "breeder",
            "owner",
            "father",
            "mother",
            "maternal_grandsire",
            "breed",
            "age",
            "image",
            "desc",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


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
        read_only_fields = [
            "id",
            "horse",
            "inserted_at",
            "ai_image",
        ]


class UserHorseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    horse = HorseDataSerializer(read_only=True)

    class Meta:
        model = UserHorse
        fields = ["user", "horse", "created_at"]
