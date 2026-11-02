import logging
from pathlib import Path

from django.core.files import File
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..access import (
    HORSE_NOT_FOUND,
    MEASUREMENT_NOT_FOUND,
    get_user_horse,
    get_user_measurement,
    not_found,
)
from ..serializers import HorseMeasurementSerializer
from ..services.horse_height import measure_horse
from .helpers import save_or_400

logger = logging.getLogger(__name__)


class HorseMeasurementView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get(self, request, horse_id):
        horse = get_user_horse(request.user, horse_id)
        if horse is None:
            return not_found(HORSE_NOT_FOUND)

        measurements = horse.measurements.order_by("-measured_at")
        return Response(HorseMeasurementSerializer(measurements, many=True).data)

    def post(self, request, horse_id):
        horse = get_user_horse(request.user, horse_id)
        if horse is None:
            return not_found(HORSE_NOT_FOUND)

        serializer = HorseMeasurementSerializer(
            data=request.data,
            context={"horse": horse},
        )
        return save_or_400(
            serializer,
            success_status=status.HTTP_201_CREATED,
            horse=horse,
        )


class HorseMeasurementDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        measurement = get_user_measurement(request.user, id)
        if measurement is None:
            return not_found(MEASUREMENT_NOT_FOUND)

        return Response(HorseMeasurementSerializer(measurement).data)

    def patch(self, request, id):
        measurement = get_user_measurement(request.user, id)
        if measurement is None:
            return not_found(MEASUREMENT_NOT_FOUND)

        serializer = HorseMeasurementSerializer(
            measurement,
            data=request.data,
            partial=True,
        )
        return save_or_400(serializer)

    def delete(self, request, id):
        measurement = get_user_measurement(request.user, id)
        if measurement is None:
            return not_found(MEASUREMENT_NOT_FOUND)

        measurement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class HorseMeasurementAIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        measurement = get_user_measurement(request.user, id)
        if measurement is None:
            return not_found(MEASUREMENT_NOT_FOUND)

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

            result_path = Path(result_path)

            if measurement.ai_image and Path(measurement.ai_image.path) != result_path:
                measurement.ai_image.delete(save=False)

            with result_path.open("rb") as image:
                measurement.ai_image.save(result_path.name, File(image), save=False)

            if Path(measurement.ai_image.path) != result_path:
                result_path.unlink(missing_ok=True)

            measurement.height = height
            measurement.save(update_fields=["height", "ai_image"])

            return Response(
                {
                    "success": True,
                    "height": measurement.height,
                    "image": measurement.ai_image.url,
                },
            )

        except Exception:
            logger.exception("AI measurement failed for measurement %s", id)
            return Response(
                {"error": "The measurement could not be processed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
