import logging
from django.shortcuts import render
from django.http import JsonResponse
from .rag_system import process_question
import json

# Set up logger
logger = logging.getLogger(__name__)

def chat_view(request):
    # For GET requests, render the chat interface
    logger.debug('Rendering chat interface for GET request')
    return render(request, 'chatbot/chat.html')

def ask_chatbot(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)
            user_query = data.get('message', '')
            context_history = data.get('context_history', '')

            logger.debug(f'Received POST request with message: {user_query} and context: {context_history}')

            # Process the query and get the response
            response_text = process_question(user_query, context_history)
            
            # Log the response
            logger.debug(f'Response generated: {response_text}')

            # Return the response as JSON
            return JsonResponse({'response': response_text})

        except json.JSONDecodeError:
            logger.error('Invalid JSON data received')
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            logger.error(f'Error processing request: {e}')
            return JsonResponse({'error': str(e)}, status=500)
    else:
        logger.error('Invalid request method received')
        return JsonResponse({'error': 'Invalid request method'}, status=405)
