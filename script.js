class EnhancedChatBot {
    constructor() {
        // API key langsung dimasukkan ke dalam kode
        this.apiKey = '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';
        this.selectedModel = localStorage.getItem('selected_model') || 'openrouter/horizon-beta';
        this.temperature = parseFloat(localStorage.getItem('temperature')) || 0.7;
        this.theme = localStorage.getItem('theme') || 'dark';
        this.fontSize = localStorage.getItem('fontSize') || 'medium';
        
        this.currentChatId = null;
        this.chats = JSON.parse(localStorage.getItem('chat_history')) || [];
        this.currentMessages = [];
        this.isTyping = false;
        this.messageCount = 0;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeTooltips();
        this.loadSettings();
        this.loadChatHistory();
        this.createNewChat();
        this.setupKeyboardShortcuts();
    }
    
    initializeElements() {
        // Main elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.charCount = document.getElementById('charCount');
        this.currentModel = document.getElementById('currentModel');
        
        // Sidebar elements
        this.historyList = document.getElementById('historyList');
        this.historyEmpty = document.getElementById('historyEmpty');
        this.searchInput = document.getElementById('searchInput');
        this.searchClear = document.getElementById('searchClear');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // Header elements
        this.currentChatTitle = document.getElementById('currentChatTitle');
        this.chatStatus = document.getElementById('chatStatus');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.modelSelectBtn = document.getElementById('modelSelectBtn');
        this.exportChatBtn = document.getElementById('exportChatBtn');
        
        // Enhanced elements
        this.themeToggle = document.getElementById('themeToggle');
        this.attachBtn = document.getElementById('attachBtn');
        this.emojiBtn = document.getElementById('emojiBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.messageCountEl = document.getElementById('messageCount');
        
        // File upload modal elements
        this.fileUploadModal = document.getElementById('fileUploadModal');
        this.closeFileUploadBtn = document.getElementById('closeFileUploadBtn');
        this.cancelUploadBtn = document.getElementById('cancelUploadBtn');
        this.uploadFilesBtn = document.getElementById('uploadFilesBtn');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadedFiles = document.getElementById('uploadedFiles');
        this.fileList = document.getElementById('fileList');
        
        // Voice modal elements
        this.voiceModal = document.getElementById('voiceModal');
        this.closeVoiceBtn = document.getElementById('closeVoiceBtn');
        this.cancelVoiceBtn = document.getElementById('cancelVoiceBtn');
        this.recordBtn = document.getElementById('recordBtn');
        this.useVoiceBtn = document.getElementById('useVoiceBtn');
        this.voiceVisualizer = document.getElementById('voiceVisualizer');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.voiceTranscript = document.getElementById('voiceTranscript');
        
        // Settings modal
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.modelSelect = document.getElementById('modelSelect');
        this.temperatureSlider = document.getElementById('temperatureSlider');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Tab system
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.themeOptions = document.querySelectorAll('.theme-option');
        this.fontSizeBtns = document.querySelectorAll('.font-size-btn');
        this.quickActions = document.querySelectorAll('.quick-action');
        
        // Containers
        this.tooltipContainer = document.getElementById('tooltipContainer');
        this.notificationContainer = document.getElementById('notificationContainer');
    }
    
    bindEvents() {
        // Message sending
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        
        // Sidebar actions
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.clearAllBtn.addEventListener('click', () => this.clearAllChats());
        this.searchClear.addEventListener('click', () => this.clearSearch());
        
        // Header actions
        if (this.clearChatBtn) this.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        if (this.modelSelectBtn) this.modelSelectBtn.addEventListener('click', () => this.openSettings());
        this.exportChatBtn.addEventListener('click', () => this.exportCurrentChat());
        
        // Enhanced actions
        if (this.themeToggle) this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.attachBtn.addEventListener('click', () => this.openFileUpload());
        this.emojiBtn.addEventListener('click', () => this.showEmojiPicker());
        
        // Voice input
        if (this.voiceBtn) this.voiceBtn.addEventListener('click', () => this.openVoiceInput());
        if (this.voiceInputBtn) this.voiceInputBtn.addEventListener('click', () => this.openVoiceInput());
        
        // File upload modal
        if (this.closeFileUploadBtn) this.closeFileUploadBtn.addEventListener('click', () => this.closeFileUpload());
        if (this.cancelUploadBtn) this.cancelUploadBtn.addEventListener('click', () => this.closeFileUpload());
        if (this.uploadFilesBtn) this.uploadFilesBtn.addEventListener('click', () => this.uploadFiles());
        
        // Voice modal
        if (this.closeVoiceBtn) this.closeVoiceBtn.addEventListener('click', () => this.closeVoiceInput());
        if (this.cancelVoiceBtn) this.cancelVoiceBtn.addEventListener('click', () => this.closeVoiceInput());
        if (this.recordBtn) this.recordBtn.addEventListener('click', () => this.toggleRecording());
        if (this.useVoiceBtn) this.useVoiceBtn.addEventListener('click', () => this.useVoiceText());
        
        // File drag and drop
        this.setupFileDragDrop();
        
        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.cancelBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetBtn.addEventListener('click', () => this.resetSettings());
        
        // Tab system
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Theme options
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => this.selectTheme(option.dataset.theme));
        });
        
        // Font size options
        this.fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectFontSize(btn.dataset.size));
        });
        
        // Quick actions
        this.quickActions.forEach(action => {
            action.addEventListener('click', () => this.handleQuickAction(action));
        });
        
        // Temperature slider
        this.temperatureSlider.addEventListener('input', (e) => {
            this.temperature = parseFloat(e.target.value);
        });
        
        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.createNewChat();
            }
            
            if (e.key === 'Escape') {
                this.closeSettings();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }
    
    initializeTooltips() {
        document.querySelectorAll('.tooltip').forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e));
            element.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }
    
    showTooltip(e) {
        const tooltip = e.currentTarget.dataset.tooltip;
        if (!tooltip) return;
        
        this.tooltipContainer.textContent = tooltip;
        this.tooltipContainer.classList.add('show');
        
        const rect = e.currentTarget.getBoundingClientRect();
        this.tooltipContainer.style.left = rect.left + rect.width / 2 - this.tooltipContainer.offsetWidth / 2 + 'px';
        this.tooltipContainer.style.top = rect.bottom + 8 + 'px';
    }
    
    hideTooltip() {
        this.tooltipContainer.classList.remove('show');
    }
    
    loadSettings() {
        document.body.className = this.theme === 'light' ? 'light-theme' : 'dark-theme';
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${this.fontSize}`);
        this.updateModelDisplay();
        this.updateThemeToggleIcon();
    }
    
    updateModelDisplay() {
        const modelNames = {
            'openrouter/horizon-beta': 'Horizon Beta',
            'anthropic/claude-3-haiku': 'Claude 3 Haiku',
            'anthropic/claude-3-sonnet': 'Claude 3 Sonnet',
            'openai/gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'openai/gpt-4': 'GPT-4'
        };
        
        this.currentModel.textContent = modelNames[this.selectedModel] || 'Unknown Model';
    }
    
    updateThemeToggleIcon() {
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.loadSettings();
        localStorage.setItem('theme', this.theme);
        this.showNotification('Theme changed successfully!', 'success');
    }
    
    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    handleInputChange() {
        this.updateCharCount();
        this.updateSendButton();
    }
    
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = `${count}/2000`;
        
        if (count > 1800) {
            this.charCount.style.color = '#f56565';
        } else if (count > 1500) {
            this.charCount.style.color = '#ed8936';
        } else {
            this.charCount.style.color = 'var(--text-muted)';
        }
    }
    
    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || this.isTyping;
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    createNewChat() {
        const chatId = 'chat_' + Date.now();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.chats.unshift(newChat);
        this.currentChatId = chatId;
        this.currentMessages = [];
        this.messageCount = 0;
        this.updateMessageCount();
        this.saveChatHistory();
        this.loadChatHistory();
        this.clearMessages();
        this.showWelcomeMessage();
        this.updateChatTitle('New Chat');
        this.showNotification('New chat created!', 'success');
    }
    
    clearAllChats() {
        if (this.chats.length === 0) return;
        
        if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            this.chats = [];
            this.currentChatId = null;
            this.currentMessages = [];
            this.saveChatHistory();
            this.loadChatHistory();
            this.createNewChat();
            this.showNotification('All chats cleared!', 'success');
        }
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.searchClear.style.display = 'none';
        this.searchChats('');
        this.clearMessageHighlights();
    }
    
    searchChats(query) {
        this.searchClear.style.display = query ? 'block' : 'none';
        
        const items = document.querySelectorAll('.history-item');
        let visibleCount = 0;
        
        items.forEach(item => {
            const title = item.querySelector('.history-title').textContent.toLowerCase();
            const preview = item.querySelector('.history-preview').textContent.toLowerCase();
            const matches = title.includes(query.toLowerCase()) || preview.includes(query.toLowerCase());
            item.style.display = matches ? 'flex' : 'none';
            if (matches) visibleCount++;
        });
        
        this.historyEmpty.style.display = visibleCount === 0 && this.chats.length > 0 ? 'block' : 'none';
    }
    
    exportCurrentChat() {
        if (!this.currentChatId || this.currentMessages.length === 0) {
            this.showNotification('No messages to export!', 'warning');
            return;
        }
        
        const chat = this.chats.find(c => c.id === this.currentChatId);
        const exportData = {
            title: chat.title,
            createdAt: chat.createdAt,
            messages: this.currentMessages,
            model: this.selectedModel,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Chat exported successfully!', 'success');
    }
    
    updateMessageCount() {
        if (this.messageCountEl) {
            this.messageCountEl.textContent = `${this.messageCount} messages`;
        }
    }
    
    openFileUpload() {
        if (this.fileUploadModal) {
            this.fileUploadModal.classList.add('active');
        }
    }
    
    closeFileUpload() {
        if (this.fileUploadModal) {
            this.fileUploadModal.classList.remove('active');
            this.resetFileUpload();
        }
    }
    
    resetFileUpload() {
        if (this.fileInput) this.fileInput.value = '';
        if (this.uploadedFiles) this.uploadedFiles.style.display = 'none';
        if (this.fileList) this.fileList.innerHTML = '';
        if (this.uploadFilesBtn) this.uploadFilesBtn.disabled = true;
    }
    
    setupFileDragDrop() {
        if (!this.uploadArea) return;
        
        this.uploadArea.addEventListener('click', () => {
            if (this.fileInput) this.fileInput.click();
        });
        
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }
    }
    
    handleFiles(files) {
        if (!files.length) return;
        
        this.fileList.innerHTML = '';
        Array.from(files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileIcon = this.getFileIcon(file.type);
            const fileSize = this.formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
                <button class="file-remove" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            this.fileList.appendChild(fileItem);
        });
        
        this.uploadedFiles.style.display = 'block';
        this.uploadFilesBtn.disabled = false;
    }
    
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fas fa-image';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word')) return 'fas fa-file-word';
        if (fileType.includes('text')) return 'fas fa-file-alt';
        return 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    uploadFiles() {
        this.showNotification('File upload feature coming soon!', 'info');
        this.closeFileUpload();
    }
    
    openVoiceInput() {
        if (!this.voiceModal) return;
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showNotification('Voice input not supported in this browser', 'error');
            return;
        }
        
        this.voiceModal.classList.add('active');
        this.resetVoiceInput();
    }
    
    closeVoiceInput() {
        if (this.voiceModal) {
            this.voiceModal.classList.remove('active');
            this.stopRecording();
        }
    }
    
    resetVoiceInput() {
        this.isRecording = false;
        if (this.voiceStatus) this.voiceStatus.textContent = 'Click to start recording';
        if (this.voiceTranscript) {
            this.voiceTranscript.style.display = 'none';
            this.voiceTranscript.textContent = '';
        }
        if (this.useVoiceBtn) this.useVoiceBtn.style.display = 'none';
        if (this.recordBtn) {
            this.recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
            this.recordBtn.classList.remove('recording');
        }
        if (this.voiceVisualizer) this.voiceVisualizer.classList.remove('active');
    }
    
    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.processAudioBlob(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            if (this.voiceStatus) this.voiceStatus.textContent = 'Recording... Click to stop';
            if (this.recordBtn) {
                this.recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
                this.recordBtn.classList.add('recording');
            }
            if (this.voiceVisualizer) this.voiceVisualizer.classList.add('active');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showNotification('Could not access microphone', 'error');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        this.isRecording = false;
        if (this.voiceStatus) this.voiceStatus.textContent = 'Processing audio...';
        if (this.recordBtn) {
            this.recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
            this.recordBtn.classList.remove('recording');
        }
        if (this.voiceVisualizer) this.voiceVisualizer.classList.remove('active');
    }
    
    processAudioBlob(audioBlob) {
        setTimeout(() => {
            const mockTranscript = "This is a mock transcription. Speech-to-text integration would go here.";
            if (this.voiceTranscript) {
                this.voiceTranscript.textContent = mockTranscript;
                this.voiceTranscript.style.display = 'block';
            }
            if (this.voiceStatus) this.voiceStatus.textContent = 'Transcription complete';
            if (this.useVoiceBtn) this.useVoiceBtn.style.display = 'inline-flex';
        }, 1500);
    }
    
    useVoiceText() {
        if (this.voiceTranscript && this.messageInput) {
            this.messageInput.value = this.voiceTranscript.textContent;
            this.handleInputChange();
            this.messageInput.focus();
        }
        this.closeVoiceInput();
    }
    
    showEmojiPicker() {
        const emojis = ['😊', '👍', '❤️', '😂', '🤔', '👏', '🔥', '💡', '✨', '🚀'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        this.messageInput.value += randomEmoji;
        this.handleInputChange();
        this.messageInput.focus();
    }
    
    handleQuickAction(action) {
        const prompts = {
            0: "Can you help me with coding? I need assistance with ",
            1: "I'd like help with creative writing. Can you help me write ",
            2: "Can you explain ",
            3: "Please translate this text: "
        };
        
        const index = Array.from(this.quickActions).indexOf(action);
        const prompt = prompts[index];
        
        if (prompt) {
            this.messageInput.value = prompt;
            this.messageInput.focus();
            this.messageInput.setSelectionRange(prompt.length, prompt.length);
            this.handleInputChange();
        }
    }
    
    switchTab(tabName) {
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }
    
    selectTheme(theme) {
        this.themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
        this.theme = theme;
    }
    
    selectFontSize(size) {
        this.fontSizeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === size);
        });
        this.fontSize = size;
    }
    
    openSettings() {
        this.modelSelect.value = this.selectedModel;
        this.temperatureSlider.value = this.temperature;
        
        this.themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === this.theme);
        });
        
        this.fontSizeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.fontSize);
        });
        
        this.settingsModal.classList.add('active');
    }
    
    closeSettings() {
        this.settingsModal.classList.remove('active');
    }
    
    saveSettings() {
        this.selectedModel = this.modelSelect.value;
        this.temperature = parseFloat(this.temperatureSlider.value);
        
        localStorage.setItem('selected_model', this.selectedModel);
        localStorage.setItem('temperature', this.temperature);
        localStorage.setItem('theme', this.theme);
        localStorage.setItem('fontSize', this.fontSize);
        
        this.loadSettings();
        this.closeSettings();
        this.showNotification('Settings saved successfully!', 'success');
    }
    
    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            this.selectedModel = 'openrouter/horizon-beta';
            this.temperature = 0.7;
            this.theme = 'dark';
            this.fontSize = 'medium';
            
            localStorage.removeItem('selected_model');
            localStorage.removeItem('temperature');
            localStorage.removeItem('theme');
            localStorage.removeItem('fontSize');
            
            this.loadSettings();
            this.openSettings();
            this.showNotification('Settings reset to default!', 'success');
        }
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.chatStatus.innerHTML = '<i class="fas fa-circle status-dot typing-dot"></i>AI is typing...';
        this.isTyping = true;
        this.updateSendButton();
        
        if (this.chatStatus) {
            const statusDot = this.chatStatus.querySelector('.typing-dot');
            if (statusDot) {
                statusDot.style.animation = 'pulse 1.5s infinite';
            }
        }
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
        this.chatStatus.innerHTML = `<i class="fas fa-circle status-dot"></i>Online • ${this.currentModel.textContent} Model`;
        this.isTyping = false;
        this.updateSendButton();
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.updateCharCount();
        this.updateSendButton();
        this.autoResizeTextarea();
        
        this.showTypingIndicator();
        
        try {
            const response = await this.callOpenRouterAPI(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            this.showNotification('Failed to get AI response', 'error');
        } finally {
            this.hideTypingIndicator();
        }
    }
    
    async callOpenRouterAPI(message) {
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.'
            },
            ...this.currentMessages.slice(-10).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        ];
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Chatbot Pro'
            },
            body: JSON.stringify({
                model: this.selectedModel,
                messages: messages,
                temperature: this.temperature,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    loadChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        this.currentMessages = [...chat.messages];
        this.clearMessages();
        
        if (chat.messages.length === 0) {
            this.showWelcomeMessage();
        } else {
            chat.messages.forEach(msg => {
                this.displayMessage(msg.content, msg.sender, false);
            });
        }
        
        this.updateChatTitle(chat.title);
        this.updateActiveChat(chatId);
    }
    
    updateActiveChat(chatId) {
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    
    clearCurrentChat() {
        if (!this.currentChatId) return;
        
        if (confirm('Clear this chat? This action cannot be undone.')) {
            const chat = this.chats.find(c => c.id === this.currentChatId);
            if (chat) {
                chat.messages = [];
                chat.title = 'New Chat';
                chat.updatedAt = new Date().toISOString();
            }
            
            this.currentMessages = [];
            this.clearMessages();
            this.showWelcomeMessage();
            this.updateChatTitle('New Chat');
            this.saveChatHistory();
            this.loadChatHistory();
            this.showNotification('Chat cleared!', 'success');
        }
    }
    
    clearMessages() {
        this.messagesContainer.innerHTML = '';
    }
    
    showWelcomeMessage() {
        this.messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-avatar gradient-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="welcome-content">
                    <h3>Welcome to AI Assistant Pro! 🚀</h3>
                    <p>I'm your advanced AI companion, powered by cutting-edge language models. I can help you with:</p>
                    <div class="feature-grid">
                        <div class="feature-item">
                            <i class="fas fa-code"></i>
                            <span>Code & Programming</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-pen-fancy"></i>
                            <span>Creative Writing</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>Problem Solving</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-language"></i>
                            <span>Language Translation</span>
                        </div>
                    </div>
                    <p class="welcome-cta">What would you like to explore today?</p>
                </div>
            </div>
        `;
    }
    
    updateChatTitle(title) {
        this.currentChatTitle.textContent = title;
    }
    
    addMessage(content, sender) {
        const message = { content, sender, timestamp: new Date().toISOString() };
        this.currentMessages.push(message);
        
        if (this.currentMessages.length === 1 && sender === 'user') {
            const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
            this.updateChatTitle(title);
            
            const chat = this.chats.find(c => c.id === this.currentChatId);
            if (chat) {
                chat.title = title;
            }
        }
        
        const chat = this.chats.find(c => c.id === this.currentChatId);
        if (chat) {
            chat.messages = [...this.currentMessages];
            chat.updatedAt = new Date().toISOString();
        }
        
        this.displayMessage(content, sender, true);
        this.saveChatHistory();
        this.loadChatHistory();
    }
    
    displayMessage(content, sender, animate = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        if (animate) {
            messageDiv.style.opacity = '0';
        }
        
        const formattedContent = this.formatMessage(content);
        const time = this.getCurrentTime();
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${formattedContent}</div>
                <div class="message-actions">
                    <button class="message-copy-btn tooltip" data-tooltip="Copy message" onclick="chatBot.copyMessage(this)">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        const welcomeMsg = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        this.messagesContainer.appendChild(messageDiv);
        
        if (animate) {
            setTimeout(() => {
                messageDiv.style.opacity = '1';
            }, 100);
        }
        
        this.scrollToBottom();
    }
    
    formatMessage(content) {
        let formatted = content
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'text';
                return `<div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="code-copy-btn" onclick="chatBot.copyCode(this)" data-tooltip="Copy code">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>
                </div>`;
            })
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
            
        return formatted;
    }
    
    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    loadChatHistory() {
        this.historyList.innerHTML = '';
        
        if (this.chats.length === 0) {
            this.historyEmpty.style.display = 'block';
            return;
        }
        
        this.historyEmpty.style.display = 'none';
        
        this.chats.forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.chatId = chat.id;
            
            const lastMessage = chat.messages[chat.messages.length - 1];
            const preview = lastMessage ?
                (lastMessage.content.length > 50 ? lastMessage.content.substring(0, 50) + '...' : lastMessage.content) :
                'No messages yet';
            
            const timeAgo = this.getTimeAgo(chat.updatedAt);
            
            historyItem.innerHTML = `
                <div class="history-avatar">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="history-content">
                    <div class="history-title">${chat.title}</div>
                    <div class="history-preview">${preview}</div>
                </div>
                <div class="history-time">${timeAgo}</div>
            `;
            
            historyItem.addEventListener('click', () => this.loadChat(chat.id));
            this.historyList.appendChild(historyItem);
        });
        
        this.updateActiveChat(this.currentChatId);
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return `${Math.floor(diffInMinutes / 1440)}d`;
    }
    
    saveChatHistory() {
        localStorage.setItem('chat_history', JSON.stringify(this.chats));
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${icons[type]}"></i>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    // High Priority Features Implementation
    
    copyMessage(button) {
        const messageContentParent = button.closest('.message-content');
        if (!messageContentParent) {
            this.showNotification('Unable to find message content', 'error');
            return;
        }
        
        const messageContent = messageContentParent.querySelector('.message-text');
        if (!messageContent) {
            this.showNotification('Unable to find message text', 'error');
            return;
        }
        
        const textToCopy = messageContent.textContent || messageContent.innerText;
        
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showNotification('Message copied to clipboard!', 'success');
                this.updateCopyButtonIcon(button);
            }).catch(() => {
                // Fallback to legacy method
                this.fallbackCopyText(textToCopy, button);
            });
        } else {
            // Use fallback method for older browsers or non-secure contexts
            this.fallbackCopyText(textToCopy, button);
        }
    }
    
    fallbackCopyText(text, button) {
        try {
            // Create temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // Execute copy command
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showNotification('Message copied to clipboard!', 'success');
                this.updateCopyButtonIcon(button);
            } else {
                this.showNotification('Failed to copy message', 'error');
            }
        } catch (err) {
            console.error('Copy failed:', err);
            this.showNotification('Copy not supported in this browser', 'error');
        }
    }
    
    updateCopyButtonIcon(button) {
        if (button) {
            const icon = button.querySelector('i');
            if (icon) {
                const originalClass = icon.className;
                icon.className = 'fas fa-check';
                setTimeout(() => {
                    icon.className = originalClass;
                }, 1000);
            }
        }
    }
    
    initializeMessageSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                this.searchMessages(query);
            } else {
                this.searchChats(query);
                this.clearMessageHighlights();
            }
        });
    }
    
    searchMessages(query) {
        const messages = document.querySelectorAll('.message');
        let foundCount = 0;
        
        messages.forEach(message => {
            const messageText = message.querySelector('.message-text');
            if (messageText) {
                const text = messageText.textContent.toLowerCase();
                const matches = text.includes(query);
                
                if (matches) {
                    foundCount++;
                    message.style.display = 'flex';
                    this.highlightText(messageText, query);
                } else {
                    message.style.display = 'none';
                }
            }
        });
        
        if (foundCount === 0 && query.length > 0) {
            this.showNotification(`No messages found for "${query}"`, 'info');
        }
    }
    
    highlightText(element, query) {
        const text = element.textContent;
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedText = text.replace(regex, '<mark style="background: var(--primary-color); color: white; padding: 2px 4px; border-radius: 3px;">$1</mark>');
        element.innerHTML = highlightedText;
    }
    
    clearMessageHighlights() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.style.display = 'flex';
            const messageText = message.querySelector('.message-text');
            if (messageText) {
                const text = messageText.innerHTML;
                messageText.innerHTML = text.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
            }
        });
    }
    
    // Smart suggestions feature removed to prevent display issues
    initializeSmartSuggestions() {
        // Feature disabled to prevent text cutoff issues
        console.log('Smart suggestions feature disabled');
    }
    
    copyCode(button) {
        const codeBlockParent = button.closest('.code-block');
        if (!codeBlockParent) {
            this.showNotification('Unable to find code block', 'error');
            return;
        }
        
        const codeBlock = codeBlockParent.querySelector('code');
        if (!codeBlock) {
            this.showNotification('Unable to find code content', 'error');
            return;
        }
        
        const codeToCopy = codeBlock.textContent || codeBlock.innerText;
        
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(codeToCopy).then(() => {
                this.showNotification('Code copied to clipboard!', 'success');
                this.updateCopyButtonIcon(button);
            }).catch(() => {
                // Fallback to legacy method
                this.fallbackCopyTextForCode(codeToCopy, button);
            });
        } else {
            // Use fallback method for older browsers or non-secure contexts
            this.fallbackCopyTextForCode(codeToCopy, button);
        }
    }
    
    fallbackCopyTextForCode(text, button) {
        try {
            // Create temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // Execute copy command
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showNotification('Code copied to clipboard!', 'success');
                this.updateCopyButtonIcon(button);
            } else {
                this.showNotification('Failed to copy code', 'error');
            }
        } catch (err) {
            console.error('Copy failed:', err);
            this.showNotification('Copy not supported in this browser', 'error');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make chatBot globally accessible for onclick handlers
let chatBot;

// Initialize the enhanced chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    chatBot = new EnhancedChatBot();
    
    // Initialize high priority features
    chatBot.initializeMessageSearch();
    chatBot.initializeSmartSuggestions();
});

// Add enhanced CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes notificationSlideIn {
        from {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }
    
    .font-small { font-size: 13px; }
    .font-medium { font-size: 14px; }
    .font-large { font-size: 16px; }
`;
document.head.appendChild(style);