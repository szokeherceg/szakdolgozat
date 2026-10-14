from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserDetailSerializer, UserSerializer


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data.copy()

        password = data.get("password")

        if password:
            password_serializer = UserSerializer(
                user,
                data={"password": password},
                partial=True,
            )

            if not password_serializer.is_valid():
                return Response(
                    {"error": password_serializer.errors["password"]},
                    status=400,
                )

            user.set_password(password)

        name = data.get("name", None)
        lang = data.get("lang", None)

        if name:
            user.name = name
        if lang:
            user.lang = lang

        user.save()

        serializer = UserDetailSerializer(user)
        return Response(serializer.data)
