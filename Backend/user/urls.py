from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    HorseDataView,
    HorseDetailView,
    HorseMeasurementAIView,
    HorseMeasurementDetailView,
    HorseMeasurementView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    UserDetailView,
    UserHorseView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user_details/", UserDetailView.as_view(), name="user_detail"),
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password_reset",
    ),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
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
    path("user-horses/", UserHorseView.as_view(), name="user_horses"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
