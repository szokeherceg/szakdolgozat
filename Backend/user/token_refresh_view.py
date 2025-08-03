from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            old_refresh = request.data.get("refresh")
            if old_refresh:
                try:
                    token = RefreshToken(old_refresh)
                    user_id = token.payload.get("user_id")
                    if not user_id:
                        raise ValueError("Hiányzó user_id a tokenből")

                    user = User.objects.get(id=user_id)
                    new_refresh = str(RefreshToken.for_user(user))
                    response.data["refresh"] = new_refresh

                except Exception as e:
                    print("Refresh token generálás hiba:", e)
                    return Response(
                        {"detail": "Nem sikerült új refresh tokent generálni."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        return response
