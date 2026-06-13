from django.urls import path
from apps.authors import views

urlpatterns = [
    path('', views.authors),
    path('<str:author_id>/', views.author_detail),
    path('<str:author_id>/stories/', views.author_stories),
]
