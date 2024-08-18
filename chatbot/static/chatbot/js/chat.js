document.addEventListener('DOMContentLoaded', () => {
    // Function to get CSRF token from cookies
    function getCookie(name) {
        const cookie = document.cookie.split('; ').find(row => row.startsWith(name + '='));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
    }

    // Retrieve CSRF token
    const csrftoken = getCookie('csrftoken');
    console.log('CSRF token retrieved:', csrftoken);

    const toggleButton = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const closeButton = document.getElementById('chatbot-close');
    const sendButton = document.getElementById('chat-send-button');
    const inputField = document.getElementById('chat-input-field');
    const chatContent = document.getElementById('chatbot-content');

    // Flag to check if it's the first time the chat is opened
    let isFirstTime = true;

    // Function to send a message
    function sendMessage(message, isUser = true) {
        const messageDiv = document.createElement('div');

        // Set up base styles
        messageDiv.style.display = 'flex';
        messageDiv.style.alignItems = 'center';
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '10px';
        messageDiv.style.maxWidth = '80%';
        messageDiv.style.wordWrap = 'break-word';
        messageDiv.style.marginBottom = '10px';

        const profilePic = document.createElement('img');
        profilePic.style.width = '32px';
        profilePic.style.height = '32px';
        profilePic.style.borderRadius = '50%';
        profilePic.style.marginRight = '10px';

        if (isUser) {
            // User message styles
            messageDiv.style.backgroundColor = '#ecf0f1';
            messageDiv.style.alignSelf = 'flex-end';
            messageDiv.style.color = '#2c3e50';
            messageDiv.style.justifyContent = 'flex-end';

            // User profile picture
            profilePic.src = '/static/chatbot/images/user-icon.png'; // Replace with the actual path to the user profile picture
            messageDiv.innerHTML = `<div>${message}</div>`;
            messageDiv.appendChild(profilePic);
        } else {
            // Chatbot message styles
            messageDiv.style.backgroundColor = '#e6f7f8';
            messageDiv.style.alignSelf = 'flex-start';
            messageDiv.style.color = '#1abc9c';
            messageDiv.style.justifyContent = 'flex-start';

            // Bot profile picture
            profilePic.src = '/static/chatbot/images/chat-icon.png'; // Replace with the actual path to the bot profile picture
            messageDiv.appendChild(profilePic);
            messageDiv.innerHTML += `<div>${message}</div>`;
        }

        chatContent.appendChild(messageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
        console.log('Message sent:', message, 'Is user:', isUser);
    }

    // Function to handle user message and fetch response from the server
    function handleUserMessage() {
        const message = inputField.value.trim();
        if (message) {
            sendMessage(message);
            inputField.value = '';

            fetch('/chatbot/ask_chatbot/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ message: message }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                if (data.response) {
                    sendMessage(data.response, false);
                } else {
                    console.warn('No response field in server response');
                }
            })
            .catch(error => {
                console.error('Error fetching response from server:', error);
            });
        } else {
            console.warn('Empty message submitted');
        }
    }

    // Send message on button click with debounce
    let debounceTimeout;
    sendButton.addEventListener('click', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(handleUserMessage, 300);
        console.log('Send button clicked');
    });

    // Send message on Enter key press
    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();  // Prevent default form submission
            handleUserMessage();
            console.log('Enter key pressed');
        }
    });

    // Toggle chat window visibility and send initial chatbot message
    toggleButton.addEventListener('click', () => {
        const isChatWindowHidden = chatWindow.style.display === 'none';
        chatWindow.style.display = isChatWindowHidden ? 'block' : 'none';

        if (isFirstTime && isChatWindowHidden) {
            sendMessage("Hello! I am VeerBot an AI assistant. I am here to assist you to know more about Veera Deepesh Gondimalla.", false);
            isFirstTime = false;  // Set the flag to false after the first message is sent
            console.log('First-time message sent');
        }
    });

    // Close chat window
    closeButton.addEventListener('click', () => {
        chatWindow.style.display = 'none';
        console.log('Chat window closed');
    });
});
