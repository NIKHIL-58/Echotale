from django.urls import path
from apps.subscriptions import views
urlpatterns=[path('plans/',views.plans), path('subscribe/',views.subscribe), path('current/',views.current)]
