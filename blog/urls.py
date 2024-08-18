from django.urls import path
from .views import fetch_blog_posts, update_likes, add_comment, contact_view


urlpatterns = [
    path('fetch-blog-posts/', fetch_blog_posts, name='fetch_blog_posts'),
    path('update-likes/<str:post_id>/', update_likes, name='update_likes'),
    path('add-comment/<str:post_id>/', add_comment, name='add_comment'),
    path('contact/', contact_view, name='contact'),
]
