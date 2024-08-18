# blog_upload/views.py
from django.shortcuts import render, redirect
from .forms import BlogPostForm
import firebase_admin
from firebase_admin import credentials, firestore, storage
import uuid
import os
#http://localhost:8000/blog_upload/upload/
# Initialize Firebase only if it's not already initialized
if not firebase_admin._apps:
    cred_path = 'blog_upload/credentials/firebase-adminsdk.json'
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'redvelvet-aution-system.appspot.com'  # Ensure this matches your bucket name
        })
    else:
        raise FileNotFoundError(f"Firebase credentials file not found at {cred_path}")

# Access the Firestore service
db = firestore.client()

# Explicitly specify the bucket
bucket_name = 'redvelvet-aution-system.appspot.com'  # Ensure this matches your bucket name
bucket = storage.bucket(bucket_name)

def upload_post(request):
    if request.method == 'POST':
        form = BlogPostForm(request.POST, request.FILES)
        if form.is_valid():
            title = form.cleaned_data['title']
            content = form.cleaned_data['content']
            image = request.FILES.get('image')

            # Handle image upload
            image_url = None
            if image:
                file_name = f'images/{uuid.uuid4()}/{image.name}'
                blob = bucket.blob(file_name)
                blob.upload_from_file(image)
                blob.make_public()
                image_url = blob.public_url

            # Save the blog post to Firebase Firestore
            db.collection('posts').add({
                'title': title,
                'content': content,
                'imageUrl': image_url,
                'likes': 0,
                'comments': {}
            })

            return redirect('upload_post')  # Redirect or show a success message
    else:
        form = BlogPostForm()

    return render(request, 'blog_upload/upload_post.html', {'form': form})
