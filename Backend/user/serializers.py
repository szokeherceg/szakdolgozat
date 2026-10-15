from rest_framework import serializers
from .models import User, HorseData, UserHorse
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


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
        # ezek később bővíthetőek más jelszavakkal is
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
        lang = validated_data.get("lang", "hu")

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data["name"],
            lang=lang,
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)

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
            "weight",
            "height",
            "girth",
            "cannon_girth",
            "breed",
            "age",
            "image",
            "ai_image",
            "desc",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "ai_image",
            "created_at",
            "updated_at",
        ]

    def update(self, instance, validated_data):
        validated_data.pop("chip_number", None)
        validated_data.pop("studbook_number", None)

        return super().update(instance, validated_data)



class UserHorseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    horse = HorseDataSerializer(read_only=True)

    class Meta:
        model = UserHorse
        fields = ["user", "horse", "created_at"]
