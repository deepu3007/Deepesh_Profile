# blog_upload/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_post, name='upload_post'),
]
