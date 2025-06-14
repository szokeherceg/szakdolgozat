from rest_framework_simplejwt.views import TokenObtainPairView
from django.urls import path
from django.conf.urls.static import static

from .user_views import UserDetailView
from .user_horse_view import UserHorseView
from animal_main import settings
from .registration_views import RegisterView
from .horse_data_views import HorseDataView, HorseDetailView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('horse-data/', HorseDataView.as_view(), name='horse-data'),
    path("horse-data/<int:id>/", HorseDetailView.as_view()),
    path('user_details/', UserDetailView.as_view(), name='user_detail'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user-horses/', UserHorseView.as_view(), name='user_horses'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
