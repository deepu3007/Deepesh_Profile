from django.db import models

class Comment(models.Model):
    blog_post = models.ForeignKey('BlogPost', related_name='comments', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} - {self.text[:20]}'

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    content = models.TextField()
    likes = models.IntegerField(default=0)

    def __str__(self):
        return self.title
