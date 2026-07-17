from django.urls import path
from apps.accounts import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('forgot-password/', views.forgot_password),
    path('reset-password/', views.reset_password),
    path('me/', views.me),
    path('logout/', views.logout),
    path('profile/', views.profile),
]
