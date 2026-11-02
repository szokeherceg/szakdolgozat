import logging

from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.utils import translation
from django.utils.http import urlsafe_base64_decode
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import User
from ..serializers import UserSerializer
from ..services.email import send_password_reset_email, user_lang

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user:
            try:
                send_password_reset_email(user)
            except Exception:
                logger.exception("Password reset email could not be sent")
                return Response(
                    {"error": "email-send-failed"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response({"message": "email_sent"})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            uid = urlsafe_base64_decode(str(request.data["uid"])).decode()
            user = User.objects.get(pk=uid, is_active=True)
            token = str(request.data["token"])
            password = str(request.data["password"])
        except (KeyError, ValueError, TypeError, User.DoesNotExist):
            return Response(
                {"error": "invalid-reset-request"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "invalid-or-expired-token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with translation.override(user_lang(user)):
                validate_password(password, user)
        except ValidationError as error:
            return Response(
                {"error": error.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=["password"])

        return Response({"message": "password-reset-success"})
