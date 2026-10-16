from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from django.conf.urls.static import static

from animal_main import settings
from .user_views import UserDetailView
from .user_horse_view import UserHorseView
from .registration_views import RegisterView
from .horse_data_views import (
    HorseDataView,
    HorseDetailView,
    HorseMeasurementView,
    HorseMeasurementDetailView,
    HorseMeasurementAIView,
)
from .mail import PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("horse-data/", HorseDataView.as_view(), name="horse-data"),
    path("horse-data/<int:id>/", HorseDetailView.as_view(), name="horse-detail"),
    path(
        "horse-data/<int:horse_id>/measurements/",
        HorseMeasurementView.as_view(),
        name="horse-measurements",
    ),
    path(
        "measurements/<int:id>/",
        HorseMeasurementDetailView.as_view(),
        name="measurement-detail",
    ),
    path(
        "measurements/<int:id>/ai/",
        HorseMeasurementAIView.as_view(),
        name="measurement-ai",
    ),
    path("user_details/", UserDetailView.as_view(), name="user_detail"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user-horses/", UserHorseView.as_view(), name="user_horses"),
    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
