from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import UserDetailSerializer, validate_user_password

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserDetailSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        password = request.data.get("password")

        if password:
            try:
                validate_user_password(password, user)
            except serializers.ValidationError as error:
                return Response(
                    {"error": error.detail},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        data = {
            field: request.data[field]
            for field in ("email", "name", "lang")
            if request.data.get(field)
        }
        serializer = UserDetailSerializer(user, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if password:
            user.set_password(password)

        serializer.save()
        return Response(serializer.data)
