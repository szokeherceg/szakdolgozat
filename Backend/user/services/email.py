import resend
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

DEFAULT_LANG = "hu"

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


def user_lang(user):
    return user.lang if user.lang in EMAIL_TEXTS else DEFAULT_LANG


def build_reset_url(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"


def build_reset_email(user, reset_url):
    texts = EMAIL_TEXTS[user_lang(user)]

    return {
        "from": settings.DEFAULT_FROM_EMAIL,
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


def send_password_reset_email(user):
    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send(build_reset_email(user, build_reset_url(user)))
