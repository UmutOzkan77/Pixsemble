/**
 * Prompt Studio - AI Chat Interface
 */
class PromptStudio {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentAttachment = null;
        this.isTyping = false;

        // Cache DOM elements
        this.els = {
            btn: null, // Will be created
            modal: null, // Will be created/cached
            messagesContainer: null,
            input: null,
            sendBtn: null,
            attachBtn: null,
            fileInput: null,
            previewArea: null
        };

        this.systemPrompt = `You are a professional Prompt Engineer for AI Image Generation (Midjourney, DALL-E, Gemini, Stable Diffusion).
Your goal is to help the user create the perfect prompt.
1. Ask clarifying questions if the user's request is vague (e.g., style, lighting, mood, composition).
2. If the user provides an image, use it as a reference for style or composition.
3. Keep your responses concise and helpful.
4. IMPORTANT: When you have enough information or when the user asks to generate/create, you MUST output 3 distinct prompt options.
5. You MUST format the options using this JSON block at the ENTIRE END of your message:

\`\`\`json
{
  "options": [
    {"label": "Option 1 Title", "prompt": "Full prompt text here..."},
    {"label": "Option 2 Title", "prompt": "Full prompt text here..."},
    {"label": "Option 3 Title", "prompt": "Full prompt text here..."}
  ]
}
\`\`\`

The user might use Turkish or English. Detect the language and respond in the same language.
If in Turkish, format the JSON labels in Turkish but keep the prompts in English (as most AIs understand English prompts better), unless the user specifically asks for Turkish prompts. Actually, for consistency, PROVIDE PROMPTS IN ENGLISH always, as Pixsemble works best with English prompts, but explain in Turkish.
`;
    }

    init() {
        this.injectUI();
        this.bindEvents();
    }

    injectUI() {
        // 1. Add "Prompt Studio" button to the prompt container
        const promptContainer = document.querySelector('.prompt-editor-container');
        if (promptContainer && !document.querySelector('.prompt-studio-btn')) {
            const btn = document.createElement('button');
            btn.className = 'prompt-studio-btn';
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>Prompt Studio</span>
            `;
            btn.type = 'button';
            promptContainer.appendChild(btn);
            this.els.btn = btn;
        }

        // 2. Add Modal HTML body
        if (!document.getElementById('prompt-studio-modal')) {
            const modalHtml = `
                <div id="prompt-studio-modal" class="modal hidden">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content glass-card modal-chat">
                        <div class="chat-header">
                            <div class="chat-title">
                                <h3>
                                    <span style="font-size: 1.5rem;">🎨</span>
                                    Prompt Studio
                                </h3>
                                <p class="chat-subtitle" data-i18n="chatSubtitle">AI ile mükemmel promptu oluşturun</p>
                            </div>
                            <button class="modal-close" id="close-studio">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        
                        <div id="chat-messages" class="chat-messages">
                            <!-- Welcome Message -->
                            <div class="message ai initial-ai">
                                <div class="avatar">🤖</div>
                                <div class="message-content">
                                    <p data-i18n="chatWelcome">Merhaba! Ben Prompt Asistanınızım. Nasıl bir görsel oluşturmak istediğinizi anlatın, size en iyi promptları hazırlayayım. Referans görsel de yükleyebilirsiniz.</p>
                                </div>
                            </div>
                        </div>

                        <div id="attachment-preview-area"></div>

                        <div class="chat-input-area">
                            <input type="file" id="studio-file-input" accept="image/*" hidden>
                            <button id="studio-attach-btn" class="attachment-btn" title="Görsel Ekle">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                            </button>
                            <textarea id="studio-input" class="chat-textarea" placeholder="Bir kedi resmi istiyorum..." rows="1"></textarea>
                            <button id="studio-send-btn" class="send-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        // Cache new elements
        this.els.modal = document.getElementById('prompt-studio-modal');
        this.els.messagesContainer = document.getElementById('chat-messages');
        this.els.input = document.getElementById('studio-input');
        this.els.sendBtn = document.getElementById('studio-send-btn');
        this.els.attachBtn = document.getElementById('studio-attach-btn');
        this.els.fileInput = document.getElementById('studio-file-input');
        this.els.previewArea = document.getElementById('attachment-preview-area');
        this.els.closeBtn = document.getElementById('close-studio');
    }

    bindEvents() {
        // Open Modal
        if (this.els.btn) {
            this.els.btn.addEventListener('click', () => this.open());
        }

        // Close Modal
        this.els.closeBtn.addEventListener('click', () => this.close());
        this.els.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.close());

        // Input height auto-adjust
        this.els.input.addEventListener('input', () => {
            this.els.input.style.height = 'auto';
            this.els.input.style.height = Math.min(this.els.input.scrollHeight, 120) + 'px';
        });

        // Send (Enter key)
        this.els.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        this.els.sendBtn.addEventListener('click', () => this.handleSend());

        // File Attachment
        this.els.attachBtn.addEventListener('click', () => this.els.fileInput.click());
        this.els.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
    }

    open() {
        this.els.modal.classList.remove('hidden');
        this.scrollToBottom();
        this.els.input.focus();
    }

    close() {
        this.els.modal.classList.add('hidden');
    }

    scrollToBottom() {
        this.els.messagesContainer.scrollTop = this.els.messagesContainer.scrollHeight;
    }

    handleFileSelect(file) {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert(I18n.t('errorFileSize') || 'File too large (max 5MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentAttachment = {
                data: e.target.result, // Data URL
                file: file
            };
            this.renderAttachmentPreview();
        };
        reader.readAsDataURL(file);
    }

    renderAttachmentPreview() {
        const area = this.els.previewArea;
        if (!this.currentAttachment) {
            area.innerHTML = '';
            this.els.attachBtn.classList.remove('active');
            return;
        }

        area.innerHTML = `
            <div class="attachment-preview">
                <img src="${this.currentAttachment.data}" class="preview-thumb">
                <button class="remove-attachment">&times;</button>
            </div>
        `;

        this.els.attachBtn.classList.add('active');
        const removeBtn = area.querySelector('.remove-attachment');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.currentAttachment = null;
                this.els.fileInput.value = ''; // Reset input
                this.renderAttachmentPreview();
            });
        }
    }

    async handleSend() {
        const text = this.els.input.value.trim();
        if (!text && !this.currentAttachment) return;
        if (this.isTyping) return;

        // Add User Message
        this.addMessage('user', text, this.currentAttachment);

        // Clear Input
        this.els.input.value = '';
        this.els.input.style.height = '44px';
        const attachmentToSend = this.currentAttachment; // Capture for sending
        this.currentAttachment = null;
        this.renderAttachmentPreview();

        // AI Thinking
        this.isTyping = true;
        const loadingId = this.addLoadingMessage();

        try {
            // Call API
            const response = await this.callChatApi(text, attachmentToSend);

            // Remove loading
            this.removeMessage(loadingId);

            // Add AI Message
            this.addMessage('ai', response);

        } catch (error) {
            console.error(error);
            this.removeMessage(loadingId);
            this.addMessage('ai', 'Error: ' + error.message);
        } finally {
            this.isTyping = false;
        }
    }

    addMessage(role, text, attachment = null) {
        const div = document.createElement('div');
        div.className = `message ${role}`;

        let contentHtml = '';

        if (attachment) {
            contentHtml += `<img src="${attachment.data}" class="message-image">`;
        }

        // Check for JSON block in AI response
        const jsonRegex = /```json\n([\s\S]*?)\n```/;
        const jsonMatch = text.match(jsonRegex);
        let displayText = text;
        let optionsHtml = '';

        if (role === 'ai' && jsonMatch) {
            try {
                const jsonStr = jsonMatch[1];
                const data = JSON.parse(jsonStr);

                // Remove the JSON block from display text
                displayText = text.replace(jsonMatch[0], '').trim();

                if (data.options && Array.isArray(data.options)) {
                    optionsHtml = `<div class="generated-options">`;
                    data.options.forEach((opt, idx) => {
                        const safePrompt = this.escapeHtml(opt.prompt).replace(/'/g, "\\'");
                        optionsHtml += `
                            <div class="option-card" onclick="window.promptStudio.selectOption('${safePrompt}', ${idx})">
                                <div class="option-header"><strong>${this.escapeHtml(opt.label)}</strong></div>
                                <div class="option-text">${this.escapeHtml(opt.prompt)}</div>
                                <div class="option-actions">
                                    <button class="btn-select">Seç / Select</button>
                                </div>
                            </div>
                        `;
                    });
                    optionsHtml += `</div>`;
                }
            } catch (e) {
                console.warn("Failed to parse options JSON", e);
            }
        }

        // Convert newlines to breaks for display
        displayText = this.escapeHtml(displayText).replace(/\n/g, '<br>');

        contentHtml += `<p>${displayText}</p>${optionsHtml}`;

        div.innerHTML = `
            <div class="avatar">${role === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">${contentHtml}</div>
        `;

        this.els.messagesContainer.appendChild(div);
        this.scrollToBottom();

        // Save history
        this.messages.push({
            role: role === 'user' ? 'user' : 'model',
            parts: attachment ? [
                { text: text || ' ' },
                { inlineData: { mimeType: attachment.file.type, data: attachment.data.split(',')[1] } }
            ] : [
                { text: text }
            ]
        });

        return div;
    }

    addLoadingMessage() {
        const id = 'msg-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'message ai';
        div.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        this.els.messagesContainer.appendChild(div);
        this.scrollToBottom();
        return id;
    }

    removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Called from HTML onclick
    selectOption(promptText, index) {
        // 1. Update main prompt
        const promptInput = document.getElementById('prompt-input');
        if (promptInput) {
            promptInput.value = promptText;
            // Trigger input event to update char count and vars
            promptInput.dispatchEvent(new Event('input'));
        }

        // 2. Handle Reference Image
        const lastAttachmentMsg = [...this.messages].reverse().find(m => m.role === 'user' && m.parts.some(p => p.inlineData));

        if (lastAttachmentMsg) {
            try {
                const part = lastAttachmentMsg.parts.find(p => p.inlineData);
                const base64 = part.inlineData.data;
                const mime = part.inlineData.mimeType;

                // Convert back to blob/file
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mime });
                const file = new File([blob], "reference_image.png", { type: mime });

                if (window.App && window.App.handleRefFile) {
                    window.App.handleRefFile(file);
                }
            } catch (e) {
                console.error("Error setting reference image", e);
            }
        }

        // 3. Close modal
        this.close();

        // 4. Show success toast
        if (window.App && window.App.showToast) {
            window.App.showToast('Prompt selected!', 'success');
        }
    }

    async callChatApi(text, attachment) {
        // Use Gemini 1.5 Flash (free/cheap/fast and good text)
        const apiKey = Storage.getApiKey('nanoBanana');
        if (!apiKey) {
            throw new Error('API Key not found inside prompt studio. Please set Nano Banana API Key in settings.');
        }

        // Use the configured proxy
        const proxyUrl = Storage.getProxyUrl();
        const model = 'gemini-1.5-flash';
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let finalUrl = targetUrl;
        if (proxyUrl) {
            const trimmed = proxyUrl.replace(/\/$/, '');
            finalUrl = `${trimmed}?target=${encodeURIComponent(targetUrl)}`;
        }

        // Construct history parts
        const contents = [
            { role: 'user', parts: [{ text: this.systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] },
            ...this.messages
        ];

        const payload = {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(finalUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error ${response.status}: ${errText.substring(0, 100)}`);
        }

        const data = await response.json();

        // Extract text
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const parts = data.candidates[0].content.parts;
            return parts.map(p => p.text).join('');
        }

        throw new Error('No content in response');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.promptStudio = new PromptStudio();
    // Defer init slightly to ensure App is ready and DOM is settled
    setTimeout(() => window.promptStudio.init(), 1000);
});
