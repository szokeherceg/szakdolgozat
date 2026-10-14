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
            "weight",
            "height",
            "gender",
            "breed",
            "age",
            "image",
            "desc",
            "created_at",
            "updated_at",
        ]


class UserHorseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    horse = HorseDataSerializer(read_only=True)

    class Meta:
        model = UserHorse
        fields = ["user", "horse", "created_at"]
