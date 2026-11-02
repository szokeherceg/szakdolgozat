from rest_framework import status
from rest_framework.response import Response


def save_or_400(serializer, success_status=status.HTTP_200_OK, **save_kwargs):
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save(**save_kwargs)
    return Response(serializer.data, status=success_status)
