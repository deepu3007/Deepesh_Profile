from django.shortcuts import render
from django.http import JsonResponse
from .rag_system import process_question
import json

def chat_view(request):
    # For GET requests, render the chat interface
    return render(request, 'chatbot/chat.html')

def ask_chatbot(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)
            user_query = data.get('message', '')
            context_history = data.get('context_history', '')

            # Process the query and get the response
            response_text = process_question(user_query, context_history)
            
            # Return the response as JSON
            return JsonResponse({'response': response_text})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
