from django.urls import path
from apps.bookmarks import views
urlpatterns=[path('', views.bookmarks), path('<str:bookmark_id>/', views.delete_bookmark)]
