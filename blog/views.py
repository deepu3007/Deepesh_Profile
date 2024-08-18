from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import credentials, firestore
import json
import uuid
from django.core.mail import send_mail
from django.http import JsonResponse
from django.core.mail import send_mail

# Initialize Firebase only if it's not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate('blog/credentials/firebase-adminsdk.json')  # Update path
    firebase_admin.initialize_app(cred)

db = firestore.client()

def fetch_blog_posts(request):
    try:
        posts_ref = db.collection('posts')
        docs = posts_ref.stream()

        posts = []
        for doc in docs:
            post = doc.to_dict()
            post['id'] = doc.id  # Add document ID to the post
            posts.append(post)

        return JsonResponse(posts, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def update_likes(request, post_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_likes = data.get('likes')
            user_liked = data.get('userLiked')

            post_ref = db.collection('posts').document(post_id)
            post_ref.update({
                'likes': new_likes
            })

            return JsonResponse({'success': True})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def add_comment(request, post_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            text = data.get('text')
            timestamp = data.get('timestamp')

            if not all([name, text, timestamp]):
                return JsonResponse({'error': 'Missing fields'}, status=400)

            # Generate a unique ID for the new comment
            comment_id = str(uuid.uuid4())

            post_ref = db.collection('posts').document(post_id)
            post_ref.update({
                'comments': {
                    **post_ref.get().to_dict().get('comments', {}),
                    comment_id: {
                        'name': name,
                        'text': text,
                        'timestamp': timestamp
                    }
                }
            })

            return JsonResponse({'success': True})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def contact_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')

        try:
            # Send email
            send_mail(
                subject=f'Contact Form Submission from {name}',
                message=f'Name: {name}\nEmail: {email}\n\nMessage:\n{message}',
                from_email=email,
                recipient_list=['g.v.deepesh004@gmail.com'],
                fail_silently=False,
            )
            # Return JSON response
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
