from django.http import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .serializers import HorseDataSerializer
from .models import  UserHorse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import HorseData

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
        
class HorseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, id):
        try:
            horse = HorseData.objects.get(id=id)
            serializer = HorseDataSerializer(horse)
            return Response(serializer.data)
        except HorseData.DoesNotExist:
            return Response({"error": "Horse not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, id):
        try:
            horse = HorseData.objects.get(id=id)
            serializer = HorseDataSerializer(horse, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except HorseData.DoesNotExist:
            return Response({"error": "Horse not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, id):
        try:
            horse = HorseData.objects.get(id=id)
            horse.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except HorseData.DoesNotExist:
            return Response({"error": "Horse not found"}, status=status.HTTP_404_NOT_FOUND)
