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
                        raise ValueError()

                    user = User.objects.get(id=user_id)
                    response.data["refresh"] = str(RefreshToken.for_user(user))

                except Exception:
                    return Response(
                        {"detail": "The authentication went wrong."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

        return response
