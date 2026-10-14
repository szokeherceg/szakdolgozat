import base64
import resend

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import translation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import User

EMAIL_TEXTS = {
    "hu": {
        "subject": "LovasAI – Jelszó visszaállítása",
        "title": "Jelszó visszaállítása",
        "message": "A LovasAI-fiókodhoz új jelszót igényeltél.",
        "button": "Új jelszó beállítása",
        "expiry": "A link 30 percig érvényes.",
        "ignore": "Ha nem te kérted, hagyd figyelmen kívül ezt az e-mailt.",
    },
    "en": {
        "subject": "LovasAI – Password reset",
        "title": "Password reset",
        "message": "You requested a password reset for your LovasAI account.",
        "button": "Set a new password",
        "expiry": "This link is valid for 30 minutes.",
        "ignore": "If you did not request this, you can ignore this email.",
    },
}


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()

        user = User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if user:
            lang = user.lang if user.lang in EMAIL_TEXTS else "hu"
            texts = EMAIL_TEXTS[lang]

            uid = base64.urlsafe_b64encode(str(user.pk).encode()).decode()

            token = default_token_generator.make_token(user)

            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password" f"?uid={uid}&token={token}"
            )

            resend.api_key = settings.RESEND_API_KEY

            resend.Emails.send(
                {
                    "from": "LovasAI <onboarding@resend.dev>",
                    "to": [user.email],
                    "subject": texts["subject"],
                    "html": f"""
                    <h2>{texts["title"]}</h2>
                    <p>{texts["message"]}</p>
                    <p>
                        <a href="{reset_url}">{texts["button"]}</a>
                    </p>
                    <p>{texts["expiry"]}</p>
                    <p>{texts["ignore"]}</p>
                """,
                }
            )

        return Response({"message": "email_sent"})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            uid = base64.urlsafe_b64decode(request.data["uid"]).decode()

            user = User.objects.get(
                pk=uid,
                is_active=True,
            )

            token = request.data["token"]
            password = request.data["password"]

            if not default_token_generator.check_token(user, token):
                return Response(
                    {"error": "invalid-or-expired-token"},
                    status=400,
                )

            lang = user.lang if user.lang in EMAIL_TEXTS else "hu"

            with translation.override(lang):
                validate_password(password, user)

            user.set_password(password)
            user.save(update_fields=["password"])

            return Response({"message": "password-reset-success"})

        except (KeyError, ValueError, TypeError, User.DoesNotExist):
            return Response(
                {"error": "invalid-reset-request"},
                status=400,
            )

        except ValidationError as error:
            return Response(
                {"error": error.messages},
                status=400,
            )
