from django.urls import path
from apps.stories import views

urlpatterns = [
    path("", views.story_list),
    path("create/", views.create_story),
    path("my-stories/", views.my_stories),
    path("<str:story_id>/regenerate-audio-parts/", views.regenerate_story_audio_parts),
    path("<str:story_id>/", views.story_detail),
]