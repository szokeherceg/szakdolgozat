from rest_framework import status
from rest_framework.response import Response

from .models import HorseData, HorseMeasurement

HORSE_NOT_FOUND = "Horse not found"
MEASUREMENT_NOT_FOUND = "Measurement not found"


def _to_id(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def user_horses(user):
    return HorseData.objects.filter(users=user).distinct()


def get_user_horse(user, horse_id):
    horse_id = _to_id(horse_id)
    if horse_id is None:
        return None

    return user_horses(user).filter(id=horse_id).first()


def get_user_measurement(user, measurement_id):
    measurement_id = _to_id(measurement_id)
    if measurement_id is None:
        return None

    return (
        HorseMeasurement.objects.select_related("horse")
        .filter(id=measurement_id, horse__users=user)
        .first()
    )


def not_found(message):
    return Response({"error": message}, status=status.HTTP_404_NOT_FOUND)
