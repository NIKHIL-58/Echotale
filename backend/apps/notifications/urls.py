from django.urls import path
from apps.notifications import views
urlpatterns=[path('', views.notifications), path('<str:notification_id>/read/', views.mark_read)]
