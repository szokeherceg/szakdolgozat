import base64
import resend

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import User


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = User.objects.filter(
            email__iexact=request.data.get("email", "").strip(),
            is_active=True,
        ).first()

        if user:
            uid = base64.urlsafe_b64encode(str(user.pk).encode()).decode()
            token = default_token_generator.make_token(user)

            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": "LovasAI <onboarding@resend.dev>",
                "to": [user.email],
                "subject": "LovasAI – Jelszó visszaállítása",
                "html": f"""
                    <h2>Jelszó visszaállítása</h2>
                    <p>A LovasAI-fiókodhoz új jelszót igényeltél.</p>
                    <p><a href="{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}">
                    Új jelszó beállítása</a></p>
                    <p>A link 30 percig érvényes.</p>
                    <p>Ha nem te kérted, hagyd figyelmen kívül ezt az e-mailt.</p>
                """,
            })

        return Response({
            "message": "Ha a címhez aktív fiók tartozik, elküldtük az e-mailt."
        })


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            uid = base64.urlsafe_b64decode(request.data["uid"]).decode()
            user = User.objects.get(pk=uid, is_active=True)
            token = request.data["token"]
            password = request.data["password"]

            if not default_token_generator.check_token(user, token):
                return Response({"error": "invalid-or-expired-token"}, status=400)

            validate_password(password, user)
            user.set_password(password)
            user.save(update_fields=["password"])

            return Response({"message": "password-reset-success"})

        except (KeyError, ValueError, TypeError, User.DoesNotExist):
            return Response({"error": "invalid-reset-request"}, status=400)
        except ValidationError as error:
            return Response({"error": error.messages}, status=400)