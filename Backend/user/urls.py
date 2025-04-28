from rest_framework_simplejwt.views import TokenObtainPairView
from django.urls import path
from django.conf.urls.static import static
from animal_main import settings
from .registration_views import RegisterView
from .ai_data_views import HorseDataView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('horse-data/', HorseDataView.as_view(), name='horse-data'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
