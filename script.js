document.addEventListener('DOMContentLoaded', () => {
    const chatbox = document.getElementById('chatbox');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-button');
    const historyList = document.getElementById('history-list');
    const themeToggle = document.getElementById('theme-toggle');
    const uploadToggle = document.getElementById('upload-toggle');
    const uploadDropdown = document.getElementById('upload-dropdown');
    const imageUpload = document.getElementById('image-upload');
    const fileUpload = document.getElementById('file-upload');
    const statusIndicator = document.querySelector('.status-indicator');
    const clearHistoryButton = document.getElementById('clear-history-button');

    let conversations = [];
    let currentConversation = [];
    let currentConversationId = null;

    // --- Helper Functions ---

    function saveConversations() {
        localStorage.setItem('chat-conversations', JSON.stringify(conversations));
    }

    function loadConversations() {
        const storedConversations = localStorage.getItem('chat-conversations');
        if (storedConversations) {
            conversations = JSON.parse(storedConversations);
            conversations.forEach(conv => addChatToHistory(conv.title, conv.id));
        }
    }

    function addMessage(content, sender, type = 'text') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        if (type === 'text') {
            messageElement.textContent = content;
        } else if (type === 'image') {
            const imgElement = document.createElement('img');
            imgElement.src = content;
            imgElement.classList.add('chat-image');
            messageElement.appendChild(imgElement);
        }

        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function addChatToHistory(title, conversationId) {
        const historyItem = document.createElement('li');
        historyItem.classList.add('history-item');
        historyItem.textContent = title;
        historyItem.dataset.chatId = conversationId;
        historyList.prepend(historyItem);
    }

    function saveCurrentConversation() {
        if (currentConversation.length > 0) {
            const firstMessageText = currentConversation[0].content;
            let conversationId;
            if (currentConversationId) {
                conversationId = currentConversationId;
                const index = conversations.findIndex(conv => conv.id === conversationId);
                if (index !== -1) {
                    conversations[index].messages = [...currentConversation];
                }
            } else {
                conversationId = Date.now();
                const newChat = {
                    id: conversationId,
                    title: firstMessageText.substring(0, 20) + '...',
                    messages: [...currentConversation]
                };
                conversations.push(newChat);
                addChatToHistory(newChat.title, newChat.id);
            }
            currentConversationId = conversationId;
            saveConversations();
        }
    }

    function loadConversation(conversationId) {
        saveCurrentConversation();
        chatbox.innerHTML = '';
        currentConversation = [];
        const conversation = conversations.find(conv => conv.id === parseInt(conversationId));
        if (conversation) {
            currentConversation = [...conversation.messages];
            currentConversationId = conversation.id;
            currentConversation.forEach(msg => {
                addMessage(msg.content, msg.sender, msg.type);
            });
        }
    }

    function clearAllHistory() {
        if (confirm("Are you sure you want to delete all recent history? This action cannot be undone.")) {
            localStorage.removeItem('chat-conversations');
            conversations = [];
            currentConversation = [];
            currentConversationId = null;
            chatbox.innerHTML = '';
            historyList.innerHTML = '';
        }
    }

    // --- Our Frontend "Agent" ---
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'assistant', 'typing');
        typingIndicator.innerHTML = '<span class="typing-indicator"></span><span class="typing-indicator"></span><span class="typing-indicator"></span>';
        chatbox.appendChild(typingIndicator);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function sendMessageToAgent(messageContent, messageType) {
        messageInput.disabled = true;
        sendButton.disabled = true;
        uploadToggle.disabled = true;
        statusIndicator.style.animationPlayState = 'running';

        showTypingIndicator();

        let response = '';
        if (messageType === 'text') {
            const lowerCaseMessage = messageContent.toLowerCase();
            if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
                response = 'Hello there! How can I help you today?';
            } else if (lowerCaseMessage.includes('how are you')) {
                response = 'I am a JavaScript-based AI, running perfectly on your browser!';
            } else if (lowerCaseMessage.includes('what is your name')) {
                response = 'I am a simple AI assistant, built with HTML, CSS, and JavaScript.';
            } else {
                response = 'This is a simple response from my client-side agent. I am not connected to a server.';
            }
        } else if (messageType === 'image') {
            response = 'Thank you for the image! Since I am a client-side agent, I cannot "see" it, but I can display it for you.';
        }

        setTimeout(() => {
            hideTypingIndicator();
            addMessage(response, 'assistant', 'text');
            currentConversation.push({ content: response, sender: 'assistant', type: 'text' });
            saveConversations();

            messageInput.disabled = false;
            sendButton.disabled = false;
            uploadToggle.disabled = false;
            statusIndicator.style.animationPlayState = 'paused';
            messageInput.focus();
        }, 1500);
    }

    // --- Event Listeners ---
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message && !messageInput.disabled) {
            addMessage(message, 'user', 'text');
            currentConversation.push({ content: message, sender: 'user', type: 'text' });
            messageInput.value = '';
            sendMessageToAgent(message, 'text');
        }
    });

    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !messageInput.disabled) {
            event.preventDefault();
            sendButton.click();
        }
    });

    newChatButton.addEventListener('click', () => {
        saveCurrentConversation();
        chatbox.innerHTML = '';
        currentConversation = [];
        currentConversationId = null;
    });

    clearHistoryButton.addEventListener('click', clearAllHistory);

    historyList.addEventListener('click', (event) => {
        const historyItem = event.target.closest('.history-item');
        if (historyItem) {
            const chatId = historyItem.dataset.chatId;
            loadConversation(chatId);
        }
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');
        themeToggle.textContent = isLightMode ? '☀️' : '🌙';
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    });

    uploadToggle.addEventListener('click', () => {
        uploadDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!uploadToggle.contains(event.target) && !uploadDropdown.contains(event.target)) {
            uploadDropdown.classList.remove('show');
        }
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                addMessage(imageUrl, 'user', 'image');
                currentConversation.push({ content: imageUrl, sender: 'user', type: 'image' });
                sendMessageToAgent(null, 'image');
            };
            reader.readAsDataURL(file);
            uploadDropdown.classList.remove('show');
        }
    });

    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            addMessage(`File uploaded: ${file.name}`, 'user', 'text');
            currentConversation.push({ content: `File uploaded: ${file.name}`, sender: 'user', type: 'text' });
            uploadDropdown.classList.remove('show');
            sendMessageToAgent(null, 'file');
        }
    });

    // --- Initialization ---
    loadConversations();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
});