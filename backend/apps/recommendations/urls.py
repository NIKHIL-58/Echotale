from django.urls import path
from apps.recommendations import views
urlpatterns=[path('', views.recommended), path('trending/', views.trending)]
