from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .registration_views import RegisterView
from .login_views import LoginView
from .ai_data_views import HorseDataView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('horse-data/', HorseDataView.as_view(), name='horse-data')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)