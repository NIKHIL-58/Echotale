from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'EchoTale API'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/authors/', include('apps.authors.urls')),
    path('api/stories/', include('apps.stories.urls')),
    path('api/audio/', include('apps.audio.urls')),
    path('api/library/', include('apps.library.urls')),
    path('api/bookmarks/', include('apps.bookmarks.urls')),
    path('api/history/', include('apps.history.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
