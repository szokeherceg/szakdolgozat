from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import UserHorse, HorseData
from .serializers import  UserHorseSerializer
from django.utils.dateparse import parse_date


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

    def delete(self, request, horse_id):
        user = request.user

        try:
            user_horse = UserHorse.objects.get(user=user, horse_id=horse_id)
            user_horse.delete()
            return Response({"message": "Horse removed from user successfully!"}, status=status.HTTP_204_NO_CONTENT)
        except UserHorse.DoesNotExist:
            return Response({"error": "Horse not found in user's list!"}, status=status.HTTP_404_NOT_FOUND)
        
    def get(self, request):
        user = request.user
        qs = UserHorse.objects.filter(user=user)

        start_date_str = request.query_params.get('created_at__gte')
        end_date_str = request.query_params.get('created_at__lte')

        if start_date_str:
            start_date = parse_date(start_date_str)
            if start_date:
                qs = qs.filter(created_at__date__gte=start_date)
        if end_date_str:
            end_date = parse_date(end_date_str)
            if end_date:
                qs = qs.filter(created_at__date__lte=end_date)

        serializer = UserHorseSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)