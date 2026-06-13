from django.urls import path
from apps.reviews import views
urlpatterns=[path('<str:review_id>/', views.delete_review)]
