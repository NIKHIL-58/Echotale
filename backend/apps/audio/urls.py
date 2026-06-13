from django.urls import path
from apps.audio import views

urlpatterns = [
    path('chapters/', views.chapters),
    path('progress/', views.save_progress),
    path('continue-listening/', views.continue_listening),
]
