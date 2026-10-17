from django.core.files import File
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import HorseData, HorseMeasurement, UserHorse
from .serializers import HorseDataSerializer, HorseMeasurementSerializer
from .horse_height import measure_horse


def user_has_horse_access(user, horse):
    return (
        UserHorse.objects.filter(user=user, horse=horse).exists()
        or horse.users.filter(id=user.id).exists()
    )


class HorseDataView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        horses = HorseData.objects.filter(
            Q(users=request.user)
            | Q(
                id__in=UserHorse.objects.filter(user=request.user).values_list(
                    "horse_id", flat=True
                )
            )
        ).distinct()

        serializer = HorseDataSerializer(horses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HorseDataSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        horse = serializer.save()
        horse.users.add(request.user)

        UserHorse.objects.get_or_create(
            user=request.user,
            horse=horse,
        )

        return Response(
            {
                "message": "Horse data saved successfully!",
                "id": horse.id,
            },
            status=status.HTTP_201_CREATED,
        )


class HorseDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_horse(self, request, id):
        try:
            horse = HorseData.objects.get(id=id)
        except HorseData.DoesNotExist:
            return None

        if not user_has_horse_access(request.user, horse):
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

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        horse = self.get_horse(request, id)

        if horse is None:
            return Response(
                {"error": "Horse not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        horse.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HorseMeasurementView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_horse(self, request, horse_id):
        try:
            horse = HorseData.objects.get(id=horse_id)
        except HorseData.DoesNotExist:
            return None

        if not user_has_horse_access(request.user, horse):
            return None

        return horse

    def get(self, request, horse_id):
        horse = self.get_horse(request, horse_id)

        if horse is None:
            return Response(
                {"error": "Horse not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        measurements = horse.measurements.order_by("-measured_at")
        serializer = HorseMeasurementSerializer(measurements, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, horse_id):
        horse = self.get_horse(request, horse_id)

        if horse is None:
            return Response(
                {"error": "Horse not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HorseMeasurementSerializer(
            data=request.data,
            context={
                "request": request,
                "horse": horse,
            },
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        measurement = serializer.save(horse=horse)

        return Response(
            HorseMeasurementSerializer(measurement).data,
            status=status.HTTP_201_CREATED,
        )


class HorseMeasurementDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_measurement(self, request, id):
        try:
            measurement = HorseMeasurement.objects.select_related("horse").get(id=id)
        except HorseMeasurement.DoesNotExist:
            return None

        if not user_has_horse_access(request.user, measurement.horse):
            return None

        return measurement

    def get(self, request, id):
        measurement = self.get_measurement(request, id)

        if measurement is None:
            return Response(
                {"error": "Measurement not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HorseMeasurementSerializer(measurement)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        measurement = self.get_measurement(request, id)

        if measurement is None:
            return Response(
                {"error": "Measurement not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HorseMeasurementSerializer(
            measurement,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        measurement = self.get_measurement(request, id)

        if measurement is None:
            return Response(
                {"error": "Measurement not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        measurement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HorseMeasurementAIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            measurement = HorseMeasurement.objects.select_related("horse").get(id=id)
        except HorseMeasurement.DoesNotExist:
            return Response(
                {"error": "Measurement not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user_has_horse_access(request.user, measurement.horse):
            return Response(
                {"error": "Measurement not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not measurement.image:
            return Response(
                {"error": "A measurement image is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            height, result_path = measure_horse(measurement.image.path)

            if height is None:
                return Response(
                    {"success": False},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with result_path.open("rb") as image:
                measurement.ai_image.save(
                    result_path.name,
                    File(image),
                    save=False,
                )

            measurement.height = height
            measurement.save(update_fields=["height", "ai_image"])

            return Response(
                {
                    "success": True,
                    "height": measurement.height,
                    "image": measurement.ai_image.url,
                },
                status=status.HTTP_200_OK,
            )

        except Exception:
            return Response(
                {"error": "The measurement could not be processed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
