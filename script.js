// ── Chat session ID ──
function getChatId() {
    let id = sessionStorage.getItem('carri_chat_id');
    if (!id) {
        id = 'chat_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('carri_chat_id', id);
    }
    return id;
}
const CHAT_ID = getChatId();
console.log('Carri Chat ID:', CHAT_ID);

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Mobile menu toggle ──
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── CHAT LOGIC ──
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const WEBHOOK_URL = 'https://paneln8n.carri.online/webhook/israel';

function scrollChatToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

function getTime() {
    const now = new Date();
    return now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function addMessage(text, sender) {
    const isBot = sender === 'bot';
    const msg = document.createElement('div');
    msg.className = `msg ${isBot ? 'bot' : 'user'}`;
    msg.innerHTML = `
        <div class="msg-avatar">
            <i class="fa-solid ${isBot ? 'fa-robot' : 'fa-user'}"></i>
        </div>
        <div>
            <div class="msg-bubble">${text}</div>
            <div class="msg-time">${getTime()}</div>
        </div>
    `;
    chatMessages.appendChild(msg);
    scrollChatToBottom();
}

function addTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'msg bot';
    typing.id = 'typingMsg';
    typing.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div>
            <div class="typing-indicator active">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typing);
    scrollChatToBottom();
}

function removeTypingIndicator() {
    const typing = document.getElementById('typingMsg');
    if (typing) typing.remove();
}

async function sendToWebhook(message) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: CHAT_ID,
                message: message,
                timestamp: new Date().toISOString(),
                source: 'web_chat_carri',
                userAgent: navigator.userAgent
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (err) {
        console.error('Webhook error:', err);
        return null;
    }
}

function extractReply(data) {
    if (!data) return null;
    if (data.reply) return data.reply;
    if (data.output) return data.output;
    if (data.text) return data.text;
    if (data.message) return data.message;
    if (typeof data === 'string') return data;
    if (Array.isArray(data) && data.length > 0 && data[0].output) return data[0].output;
    if (Array.isArray(data) && data.length > 0 && data[0].text) return data[0].text;
    return null;
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';
    chatSend.disabled = true;

    addTypingIndicator();

    const webhookResponse = await sendToWebhook(text);

    removeTypingIndicator();

    const reply = extractReply(webhookResponse);
    if (reply) {
        addMessage(reply, 'bot');
    }

    chatSend.disabled = false;
    chatInput.focus();
}

chatSend.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// ── Intersection Observer for animations ──
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .stat-item, .cta-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

scrollChatToBottom();
