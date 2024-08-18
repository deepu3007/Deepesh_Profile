# chatbot/forms.py
from django import forms

class QueryForm(forms.Form):
    query = forms.CharField(label='Ask a question', max_length=1000, widget=forms.TextInput(attrs={'placeholder': 'Ask a question...', 'class': 'query-input'}))
