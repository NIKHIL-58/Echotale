from django.urls import path
from apps.reviews import views
urlpatterns = [
    path('stories/<str:story_id>/', views.story_reviews),
    path('<str:review_id>/', views.delete_review),
]
