from django.urls import path
from apps.library import views
urlpatterns=[path('', views.library), path('<str:story_id>/', views.remove_library_item)]
