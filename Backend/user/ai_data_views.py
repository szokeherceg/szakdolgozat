from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import HorseDataSerializer
from .models import HorseData

class HorseDataView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            print("Request data:", request.data)
            serializer = HorseDataSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Horse data saved successfully!"}, status=status.HTTP_201_CREATED)
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)

    def get(self, request):
        try:
            horses = HorseData.objects.all()
            serializer = HorseDataSerializer(horses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)