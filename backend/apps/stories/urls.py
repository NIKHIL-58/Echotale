from django.urls import path
from apps.stories import views
from apps.audio.views import story_chapters
from apps.reviews.views import story_reviews

urlpatterns = [
    path('', views.stories),
    path('categories/', views.categories),
    path('<str:story_id>/', views.story_detail),
    path('<str:story_id>/chapters/', story_chapters),
    path('<str:story_id>/reviews/', story_reviews),
]
