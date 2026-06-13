from django.urls import path
from apps.history import views
urlpatterns=[path('', views.history)]
