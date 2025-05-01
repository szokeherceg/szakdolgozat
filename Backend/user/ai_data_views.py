from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import HorseDataSerializer
from .models import  UserHorse

class HorseDataView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print("Request data:", request.data)
            serializer = HorseDataSerializer(data=request.data)
            if serializer.is_valid():
                horse = serializer.save() 
                return Response({"message": "Horse data saved successfully!", "id": horse.id}, status=status.HTTP_201_CREATED)
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)

    def get(self, request):
        user = request.user
        try:
            user_horses = UserHorse.objects.filter(user=user)
            horses = [user_horse.horse for user_horse in user_horses]
            serializer = HorseDataSerializer(horses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)

    def delete(self, request, horse_id):
        user = request.user
        try:
            user_horse = UserHorse.objects.filter(user=user, horse_id=horse_id).first()
            if user_horse:
                user_horse.delete()
                return Response({"message": "Horse data deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Horse not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)
        
    def patch(self, request, horse_id):
        user = request.user
        try:
            user_horse = UserHorse.objects.filter(user=user, horse_id=horse_id).first()
            if not user_horse:
                return Response({"error": "Horse not found or not associated with user"}, status=status.HTTP_404_NOT_FOUND)

            horse = user_horse.horse
            serializer = HorseDataSerializer(horse, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)