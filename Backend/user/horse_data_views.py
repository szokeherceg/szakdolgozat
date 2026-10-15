from django.http import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .serializers import HorseDataSerializer
from .models import UserHorse, HorseData
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from django.conf import settings
from .horse_height import measure_horse
from django.core.files import File
from pathlib import Path


class HorseDataView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print("Request data:", request.data)

            serializer = HorseDataSerializer(data=request.data)

            if serializer.is_valid():
                horse = serializer.save()

                return Response(
                    {"message": "Horse data saved successfully!", "id": horse.id},
                    status=status.HTTP_201_CREATED,
                )

            print("Validation errors:", serializer.errors)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print("Unexpected error:", str(e))

            return JsonResponse(
                {"error": "Internal Server Error", "details": str(e)}, status=500
            )

    def get(self, request):
        user = request.user

        try:
            user_horses = UserHorse.objects.filter(user=user)
            horses = [user_horse.horse for user_horse in user_horses]

            serializer = HorseDataSerializer(horses, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print("Unexpected error:", str(e))

            return JsonResponse(
                {"error": "Internal Server Error", "details": str(e)}, status=500
            )


class HorseDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_horse(self, request, id):
        try:
            horse = HorseData.objects.get(id=id)
        except HorseData.DoesNotExist:
            return None

        has_access = (
            UserHorse.objects.filter(
                user=request.user,
                horse=horse,
            ).exists()
            or horse.users.filter(id=request.user.id).exists()
        )

        if not has_access:
            return None

        return horse

    def get(self, request, id):
        horse = self.get_horse(request, id)

        if horse is None:
            return Response(
                {"error": "Horse not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HorseDataSerializer(horse)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        horse = self.get_horse(request, id)

        if horse is None:
            return Response(
                {"error": "Horse not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HorseDataSerializer(
            horse,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, id):
        horse = self.get_horse(request, id)

        if horse is None:
            return Response(
                {"error": "Horse not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        horse.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AI_View(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            horse = HorseData.objects.get(id=id)
            height, result_path = measure_horse(horse.image.path)

            if height is None:
                return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)

            horse.height = height

            with result_path.open("rb") as image:
                horse.ai_image.save(result_path.name, File(image), save=False)

            horse.save(update_fields=["height", "ai_image", "updated_at"])

            return Response({
                "success": True,
                "height": horse.height,
                "image": horse.ai_image.url,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)