from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import UserHorse, HorseData
from .serializers import  UserHorseSerializer

class UserHorseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        horse_id = request.data.get('horse_id')

        if not horse_id:
            return Response({"error": "Horse ID is required!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            horse = HorseData.objects.get(id=horse_id)
        except HorseData.DoesNotExist:
            return Response({"error": "Horse not found!"}, status=status.HTTP_404_NOT_FOUND)

        user_horse = UserHorse.objects.create(user=user, horse=horse)

        serializer = UserHorseSerializer(user_horse)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

