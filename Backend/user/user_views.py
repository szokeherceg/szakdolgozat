from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import UserDetailSerializer
from django.contrib.auth import authenticate

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data.copy()

        password = data.get("password", None)
        if password:
            user.set_password(password)
            user.save()
            data.pop("password")

        name = data.get("name", None)
        lang = data.get("lang", None)

        if name:
            user.name = name
        if lang:
            user.lang = lang

        user.save()

        serializer = UserDetailSerializer(user)
        return Response(serializer.data)
