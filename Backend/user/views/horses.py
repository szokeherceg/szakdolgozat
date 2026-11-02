from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..access import HORSE_NOT_FOUND, get_user_horse, not_found, user_horses
from ..models import UserHorse
from ..serializers import HorseDataSerializer, UserHorseSerializer
from .helpers import save_or_400


class HorseDataView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = HorseDataSerializer(user_horses(request.user), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = HorseDataSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        horse = serializer.save()
        UserHorse.objects.create(user=request.user, horse=horse)

        return Response(
            {"message": "Horse data saved successfully!", "id": horse.id},
            status=status.HTTP_201_CREATED,
        )


class HorseDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        horse = get_user_horse(request.user, id)
        if horse is None:
            return not_found(HORSE_NOT_FOUND)

        return Response(HorseDataSerializer(horse).data)

    def patch(self, request, id):
        horse = get_user_horse(request.user, id)
        if horse is None:
            return not_found(HORSE_NOT_FOUND)

        serializer = HorseDataSerializer(horse, data=request.data, partial=True)
        return save_or_400(serializer)

    def delete(self, request, id):
        horse = get_user_horse(request.user, id)
        if horse is None:
            return not_found(HORSE_NOT_FOUND)

        horse.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserHorseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_horse_links = UserHorse.objects.filter(user=request.user)

        start_date = parse_date(request.query_params.get("created_at__gte") or "")
        end_date = parse_date(request.query_params.get("created_at__lte") or "")

        if start_date:
            user_horse_links = user_horse_links.filter(created_at__date__gte=start_date)
        if end_date:
            user_horse_links = user_horse_links.filter(created_at__date__lte=end_date)

        return Response(UserHorseSerializer(user_horse_links, many=True).data)

    def post(self, request):
        horse = get_user_horse(request.user, request.data.get("horse_id"))
        if horse is None:
            return not_found(HORSE_NOT_FOUND)

        user_horse = UserHorse.objects.filter(
            user=request.user,
            horse=horse,
        ).first() or UserHorse.objects.create(user=request.user, horse=horse)

        return Response(
            UserHorseSerializer(user_horse).data,
            status=status.HTTP_201_CREATED,
        )
