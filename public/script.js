// --- DOM Element References ---
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// --- Chat Logic ---
form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage('customer', userMessage);
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    const botMessageElement = appendMessage('chef', 'loading');
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // --- Gemini API Call ---
        let chatHistory = [{ role: "user", parts: [{ text: "You are Chef Gemini, a friendly, enthusiastic, and slightly quirky pixel art character in a retro cooking game. You provide recipes and approximate calorie counts. Your tone is encouraging and fun. Always start your response with a cheerful greeting like 'Voila!' or 'Hot stuff coming through!'." }] }, { role: "model", parts: [{ text: "Got it! I'm Chef Gemini, ready to cook up some fun recipes and calorie info with a pixel-perfect personality!" }] }];
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

       const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        // Check for non-successful responses
        if (!response.ok) {
            // Create a more specific error message based on the status code
            let errorMsg = `API error: ${response.status}`;
            if (response.status === 403) {
                errorMsg = 'API Key is invalid or forbidden. Please check that the Gemini API is enabled in your Google Cloud project and that the key is configured correctly.';
            }
            throw new Error(errorMsg);
        }

        const result = await response.json();
        
        let botReply = result.reply?.replace(/\n/g, '<br>') || "My oven is acting up! Please try again.";
        
        botMessageElement.innerHTML = `<p class="text-xs sm:text-sm">${botReply}</p>`;

    } catch (error) {
        // Log the detailed error to the console for debugging
        console.error('Error during API call:', error);
        // Display a user-friendly error message in the chat
        botMessageElement.innerHTML = `<p class="text-xs sm:text-sm text-red-400">Error: ${error.message}</p>`;
    } finally {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

/**
 * Appends a message to the chat box.
 * @param {string} role - The role of the sender ('customer' or 'chef').
 * @param {string} content - The message content or 'loading'.
 * @returns {HTMLElement} The content container element of the new message.
 */
function appendMessage(role, content) {
    const messageWrapper = document.createElement('div');
    const isCustomer = role === 'customer';

    const chefAvatar = `<div class="flex-shrink-0 w-12 h-12 pixel-border bg-gray-700 flex items-center justify-center self-end"><div class="w-8 h-8 text-pink-400 text-2xl">🧑‍🍳</div></div>`;
    const customerAvatar = `<div class="flex-shrink-0 w-12 h-12 pixel-border bg-blue-900 flex items-center justify-center self-end"><div class="w-8 h-8 text-orange-300 text-2xl">😀</div></div>`;
    
    const loadingSpinner = `<div class="text-sm">Cooking...</div>`;

    messageWrapper.className = `flex gap-3 ${isCustomer ? 'justify-end' : 'justify-start'}`;
    
    const contentContainer = document.createElement('div');
    contentContainer.className = `chat-bubble pixel-border max-w-lg ${isCustomer ? 'chat-bubble-patient' : ''}`;
    
    if (content === 'loading') {
        contentContainer.innerHTML = loadingSpinner;
    } else {
        contentContainer.innerHTML = `<p class="text-xs sm:text-sm">${content}</p>`;
    }

    if (isCustomer) {
        messageWrapper.append(contentContainer);
        messageWrapper.insertAdjacentHTML('beforeend', customerAvatar);
    } else {
        messageWrapper.insertAdjacentHTML('afterbegin', chefAvatar);
        messageWrapper.append(contentContainer);
    }
    
    chatBox.appendChild(messageWrapper);
    return contentContainer;
}

// --- 2D Pixel Art Background ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

// Emojis to use as particles
const foodEmojis = ['🍕', '🍔', '🍟', '🍩', '🥤', '🍓', '🥕'];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticle() {
    const x = Math.random() * canvas.width;
    const y = canvas.height + 20;
    const size = Math.random() * 20 + 20; // 20-40px
    const speed = Math.random() * 2 + 1; // 1-3 pixels/frame
    const emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
    particles.push({ x, y, size, speed, emoji });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        p.y -= p.speed;
        ctx.font = `${p.size}px 'Press Start 2P'`;
        ctx.fillText(p.emoji, p.x, p.y);

        // Remove particle if it's off-screen
        if (p.y < -p.size) {
            particles.splice(index, 1);
        }
    });
}

function gameLoop() {
    // Add a new particle periodically
    if (Math.random() < 0.1) {
        createParticle();
    }
    animateParticles();
    requestAnimationFrame(gameLoop);
}

window.onload = () => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    gameLoop();
};
