/**
 * Prompt Studio - AI-Powered Prompt Generator
 * Premium chat interface with image support
 */

class PromptStudio {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.currentAttachment = null;

        // DOM elements (will be populated on init)
        this.overlay = null;
        this.modal = null;
        this.messagesContainer = null;
        this.input = null;
        this.sendBtn = null;
        this.attachBtn = null;
        this.fileInput = null;
        this.attachmentPreview = null;

        // System prompt for the AI
        this.systemPrompt = `Sen profesyonel bir AI görsel oluşturma prompt mühendisisin (Midjourney, DALL-E, Gemini, Stable Diffusion için).
Görevin kullanıcının mükemmel promptlar oluşturmasına yardım etmek.

KURALLAR:
1. Kullanıcının isteğini anla ve eksik detaylar için sorular sor
2. Şu konularda netlik iste: stil, renk paleti, aydınlatma, atmosfer, kompozisyon, kamera açısı
3. Kullanıcı bir görsel paylaştıysa, onu referans olarak kullan
4. Yeterli bilgi topladığında veya kullanıcı "oluştur/hazırla/yap" dediğinde, 3 farklı prompt seçeneği sun
5. ZORUNLU: Prompt seçeneklerini mesajının EN SONUNDA şu JSON formatında ver:

\`\`\`json
{
  "prompts": [
    {"title": "Seçenek Başlığı 1", "prompt": "Detaylı İngilizce prompt..."},
    {"title": "Seçenek Başlığı 2", "prompt": "Detaylı İngilizce prompt..."},
    {"title": "Seçenek Başlığı 3", "prompt": "Detaylı İngilizce prompt..."}
  ]
}
\`\`\`

NOT: Promptlar İNGİLİZCE olmalı çünkü AI modelleri İngilizce'yi daha iyi anlıyor. Açıklamalarını Türkçe yap.
Kullanıcı hangi dilde yazarsa o dilde yanıt ver ama promptlar her zaman İngilizce olsun.`;
    }

    /**
     * Initialize the Prompt Studio
     */
    init() {
        this.createTriggerButton();
        this.createModal();
        this.bindEvents();
    }

    /**
     * Create the trigger button in the prompt footer
     */
    createTriggerButton() {
        const promptFooter = document.querySelector('.prompt-footer');
        if (!promptFooter) {
            console.warn('Prompt footer not found');
            return;
        }

        // Check if button already exists
        if (document.querySelector('.prompt-studio-trigger')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'prompt-studio-trigger';
        btn.innerHTML = `
            <svg class="sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
                <circle cx="12" cy="12" r="4"/>
            </svg>
            <span>Prompt Studio</span>
        `;

        promptFooter.appendChild(btn);
        this.triggerBtn = btn;
    }

    /**
     * Create the modal HTML
     */
    createModal() {
        // Remove existing modal if any
        const existing = document.getElementById('prompt-studio-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'prompt-studio-overlay';
        overlay.className = 'prompt-studio-overlay';

        overlay.innerHTML = `
            <div class="prompt-studio-modal">
                <!-- Header -->
                <div class="ps-header">
                    <div class="ps-header-left">
                        <div class="ps-logo">✨</div>
                        <div class="ps-title">
                            <h2>Prompt Studio</h2>
                            <p data-i18n="psSubtitle">AI ile mükemmel prompt oluştur</p>
                        </div>
                    </div>
                    <button class="ps-close" id="ps-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Messages -->
                <div class="ps-messages" id="ps-messages">
                    <div class="ps-message ai">
                        <div class="ps-avatar">🤖</div>
                        <div class="ps-bubble">
                            <p data-i18n="psWelcome">Merhaba! 👋 Ben Prompt Asistanınızım. Nasıl bir görsel oluşturmak istediğinizi anlatın, size en iyi promptları hazırlayayım.</p>
                            <p style="margin-top: 8px; opacity: 0.8; font-size: 0.85em;" data-i18n="psWelcome2">💡 İpucu: Referans görsel de yükleyebilirsiniz!</p>
                        </div>
                    </div>
                </div>
                
                <!-- Input Area -->
                <div class="ps-input-area">
                    <div class="ps-attachment-preview" id="ps-attachment-preview" style="display: none;">
                        <img src="" alt="Preview" id="ps-preview-img">
                        <span data-i18n="psImageAttached">Görsel eklendi</span>
                        <button type="button" id="ps-remove-attachment">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="ps-input-row">
                        <input type="file" id="ps-file-input" accept="image/*" hidden>
                        <button type="button" class="ps-attach-btn" id="ps-attach-btn" title="Görsel Ekle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </button>
                        <textarea 
                            id="ps-input" 
                            class="ps-text-input" 
                            placeholder="Bir kedi çizimi istiyorum..." 
                            rows="1"
                            data-i18n-placeholder="psInputPlaceholder"
                        ></textarea>
                        <button type="button" class="ps-send-btn" id="ps-send-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>
                    
                    <button type="button" class="ps-reset-btn" id="ps-reset-btn" data-i18n="psReset">
                        🔄 Sohbeti Sıfırla
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Cache elements
        this.overlay = overlay;
        this.modal = overlay.querySelector('.prompt-studio-modal');
        this.messagesContainer = document.getElementById('ps-messages');
        this.input = document.getElementById('ps-input');
        this.sendBtn = document.getElementById('ps-send-btn');
        this.attachBtn = document.getElementById('ps-attach-btn');
        this.fileInput = document.getElementById('ps-file-input');
        this.attachmentPreview = document.getElementById('ps-attachment-preview');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Open modal
        if (this.triggerBtn) {
            this.triggerBtn.addEventListener('click', () => this.open());
        }

        // Close modal
        document.getElementById('ps-close').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });

        // Send message
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
        });

        // File attachment
        this.attachBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleFileSelect(e.target.files[0]);
        });

        // Remove attachment
        document.getElementById('ps-remove-attachment').addEventListener('click', () => {
            this.clearAttachment();
        });

        // Reset chat
        document.getElementById('ps-reset-btn').addEventListener('click', () => {
            this.resetChat();
        });
    }

    /**
     * Open the modal
     */
    open() {
        this.isOpen = true;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.input.focus(), 300);
    }

    /**
     * Close the modal
     */
    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Handle file selection
     */
    handleFileSelect(file) {
        if (!file) return;

        // Check size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Dosya çok büyük (max 5MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentAttachment = {
                dataUrl: e.target.result,
                file: file,
                base64: e.target.result.split(',')[1],
                mimeType: file.type
            };

            // Show preview
            document.getElementById('ps-preview-img').src = e.target.result;
            this.attachmentPreview.style.display = 'flex';
            this.attachBtn.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Clear the current attachment
     */
    clearAttachment() {
        this.currentAttachment = null;
        this.fileInput.value = '';
        this.attachmentPreview.style.display = 'none';
        this.attachBtn.classList.remove('has-image');
    }

    /**
     * Handle send button click
     */
    async handleSend() {
        const text = this.input.value.trim();
        if (!text && !this.currentAttachment) return;
        if (this.isTyping) return;

        // Add user message to UI
        this.addMessage('user', text, this.currentAttachment);

        // Clear input
        this.input.value = '';
        this.input.style.height = 'auto';

        // Capture attachment before clearing
        const attachmentToSend = this.currentAttachment;
        this.clearAttachment();

        // Show typing indicator
        this.isTyping = true;
        const typingEl = this.addTypingIndicator();

        try {
            // Call API
            const response = await this.callChatAPI(text, attachmentToSend);

            // Remove typing indicator
            typingEl.remove();

            // Add AI response
            this.addMessage('ai', response);

        } catch (error) {
            console.error('Prompt Studio Error:', error);
            typingEl.remove();
            this.addMessage('ai', `❌ Hata: ${error.message}`);
        } finally {
            this.isTyping = false;
        }
    }

    /**
     * Add a message to the chat
     */
    addMessage(role, text, attachment = null) {
        const messageEl = document.createElement('div');
        messageEl.className = `ps-message ${role}`;

        let contentHtml = '';

        // Add image if present
        if (attachment && attachment.dataUrl) {
            contentHtml += `<img src="${attachment.dataUrl}" class="ps-message-image" alt="Attached image">`;
        }

        // Parse AI response for prompt options
        let displayText = text;
        let optionsHtml = '';

        if (role === 'ai') {
            const parsed = this.parsePromptOptions(text);
            displayText = parsed.text;

            if (parsed.options && parsed.options.length > 0) {
                optionsHtml = this.renderPromptOptions(parsed.options);
            }
        }

        // Escape and format text
        displayText = this.escapeHtml(displayText).replace(/\n/g, '<br>');

        contentHtml += `<p>${displayText}</p>${optionsHtml}`;

        messageEl.innerHTML = `
            <div class="ps-avatar">${role === 'user' ? '👤' : '🤖'}</div>
            <div class="ps-bubble">${contentHtml}</div>
        `;

        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();

        // Save to history for API context
        this.messages.push({
            role: role === 'user' ? 'user' : 'model',
            parts: this.buildMessageParts(text, attachment)
        });
    }

    /**
     * Build message parts for API
     */
    buildMessageParts(text, attachment) {
        const parts = [];

        if (text) {
            parts.push({ text: text });
        }

        if (attachment && attachment.base64) {
            parts.push({
                inlineData: {
                    mimeType: attachment.mimeType,
                    data: attachment.base64
                }
            });
        }

        return parts;
    }

    /**
     * Add typing indicator
     */
    addTypingIndicator() {
        const el = document.createElement('div');
        el.className = 'ps-message ai';
        el.innerHTML = `
            <div class="ps-avatar">🤖</div>
            <div class="ps-bubble">
                <div class="ps-typing">
                    <div class="ps-typing-dot"></div>
                    <div class="ps-typing-dot"></div>
                    <div class="ps-typing-dot"></div>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(el);
        this.scrollToBottom();
        return el;
    }

    /**
     * Scroll messages to bottom
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Parse prompt options from AI response
     */
    parsePromptOptions(text) {
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        if (!match) {
            return { text: text, options: null };
        }

        try {
            const data = JSON.parse(match[1]);
            const cleanText = text.replace(match[0], '').trim();

            if (data.prompts && Array.isArray(data.prompts)) {
                return { text: cleanText, options: data.prompts };
            }
        } catch (e) {
            console.warn('Failed to parse prompt options:', e);
        }

        return { text: text, options: null };
    }

    /**
     * Render prompt option cards
     */
    renderPromptOptions(options) {
        let html = '<div class="ps-options">';

        options.forEach((opt, idx) => {
            const safePrompt = this.escapeHtml(opt.prompt).replace(/'/g, "\\'").replace(/"/g, '\\"');
            const safeTitle = this.escapeHtml(opt.title);

            html += `
                <div class="ps-option" data-prompt="${safePrompt}">
                    <div class="ps-option-header">
                        <span class="ps-option-title">${safeTitle}</span>
                        <span class="ps-option-badge">${idx + 1}</span>
                    </div>
                    <div class="ps-option-text">${this.escapeHtml(opt.prompt)}</div>
                    <div class="ps-option-select">
                        <button type="button" onclick="window.promptStudio.selectPrompt('${safePrompt}')">
                            ✓ Bu Promptu Seç
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Select a prompt and transfer to main input
     */
    selectPrompt(promptText) {
        // Decode the prompt text
        const prompt = promptText.replace(/\\'/g, "'").replace(/\\"/g, '"');

        // Set in main prompt input
        const mainInput = document.getElementById('prompt-input');
        if (mainInput) {
            mainInput.value = prompt;
            mainInput.dispatchEvent(new Event('input'));
        }

        // Check if there was an image in the conversation - add as reference
        const lastUserAttachment = this.findLastUserAttachment();
        if (lastUserAttachment) {
            this.setReferenceImage(lastUserAttachment);
        }

        // Close modal
        this.close();

        // Show success toast
        this.showToast('Prompt seçildi! 🎉', 'success');
    }

    /**
     * Find the last user attachment in conversation
     */
    findLastUserAttachment() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const msg = this.messages[i];
            if (msg.role === 'user') {
                const imagePart = msg.parts.find(p => p.inlineData);
                if (imagePart) {
                    return imagePart.inlineData;
                }
            }
        }
        return null;
    }

    /**
     * Set reference image in main app
     */
    setReferenceImage(imageData) {
        try {
            // Convert base64 back to file
            const binary = atob(imageData.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: imageData.mimeType });
            const file = new File([blob], 'reference.png', { type: imageData.mimeType });

            // Use App's handleRefFile if available
            if (window.App && typeof window.App.handleRefFile === 'function') {
                window.App.handleRefFile(file);
            }
        } catch (e) {
            console.warn('Could not set reference image:', e);
        }
    }

    /**
     * Call the Gemini Chat API
     */
    async callChatAPI(text, attachment) {
        const apiKey = Storage.getApiKey('nanoBanana');
        if (!apiKey) {
            throw new Error('API anahtarı bulunamadı. Lütfen Ayarlar\'dan API anahtarınızı girin.');
        }

        const proxyUrl = Storage.getProxyUrl();
        // Updated to a specific version to ensure availability
        const model = 'gemini-flash-latest';
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        let finalUrl = targetUrl;
        if (proxyUrl) {
            const trimmed = proxyUrl.replace(/\/$/, '');
            finalUrl = `${trimmed}?target=${encodeURIComponent(targetUrl)}`;
        }

        // Build conversation history
        const contents = [
            { role: 'user', parts: [{ text: this.systemPrompt }] },
            { role: 'model', parts: [{ text: 'Anladım! Size yardım etmeye hazırım.' }] },
            ...this.messages
        ];

        // Add current message
        contents.push({
            role: 'user',
            parts: this.buildMessageParts(text, attachment)
        });

        const payload = {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        };

        const response = await fetch(finalUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('API Error Details:', errText);

            if (response.status === 429) {
                throw new Error('Çok fazla istek. Lütfen biraz bekleyin.');
            }
            // Include error text in the thrown error for better debugging
            throw new Error(`API Hatası: ${response.status} - ${errText.substring(0, 100)}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const parts = data.candidates[0].content.parts;
            return parts.map(p => p.text || '').join('');
        }

        throw new Error('API yanıtı boş.');
    }

    /**
     * Reset the chat
     */
    resetChat() {
        this.messages = [];
        this.messagesContainer.innerHTML = `
            <div class="ps-message ai">
                <div class="ps-avatar">🤖</div>
                <div class="ps-bubble">
                    <p>Merhaba! 👋 Ben Prompt Asistanınızım. Nasıl bir görsel oluşturmak istediğinizi anlatın, size en iyi promptları hazırlayayım.</p>
                    <p style="margin-top: 8px; opacity: 0.8; font-size: 0.85em;">💡 İpucu: Referans görsel de yükleyebilirsiniz!</p>
                </div>
            </div>
        `;
        this.clearAttachment();
        this.showToast('Sohbet sıfırlandı', 'info');
    }

    /**
     * Show a toast notification
     */
    showToast(message, type = 'info') {
        if (window.App && typeof window.App.showToast === 'function') {
            window.App.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.promptStudio = new PromptStudio();
    // Delay init to ensure other scripts are ready
    setTimeout(() => window.promptStudio.init(), 500);
});
