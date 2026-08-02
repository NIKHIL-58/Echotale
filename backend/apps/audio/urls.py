from django.urls import path
from apps.audio import views
urlpatterns=[path('chapters/',views.chapters),path('stories/<str:story_id>/chapters/',views.story_chapters),path('progress/',views.progress),path('progress/sync/',views.sync_progress),path('continue-listening/',views.continue_listening),path('notes/',views.notes),path('notes/<str:note_id>/',views.delete_note),path('downloads/',views.downloads),path('downloads/<str:story_id>/',views.delete_download)]
