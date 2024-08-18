# blog_upload/forms.py
from django import forms

class BlogPostForm(forms.Form):
    title = forms.CharField(label='Title', max_length=100)
    content = forms.CharField(label='Content', widget=forms.Textarea)
    image = forms.ImageField(label='Image', required=False)
