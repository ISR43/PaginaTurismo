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
    chatMessages.scrollTop = chatMessages.scrollHeight;
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

async function sendToWebhook(message) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                timestamp: new Date().toISOString(),
                source: 'web_chat_carri',
                userAgent: navigator.userAgent
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Webhook error:', err);
        return null;
    }
}

function showToast(type, title, msg) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-xmark'}"></i><div><strong>${title}</strong><br><span style="color:var(--text-muted);font-size:0.8rem">${msg}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';
    chatSend.disabled = true;

    sendToWebhook(text);

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
