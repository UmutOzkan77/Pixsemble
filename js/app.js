/**
 * Pixsemble - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // State
        currentProvider: 'nanoBanana',
        currentMode: 'generate',
        varMode: 'combination',
        variables: [],
        varValues: {},
        linkedRows: [],
        inputFiles: [],
        refFile: null,
        isGenerating: false,

        // DOM Elements
        els: {},

        /**
         * Initialize the application
         */
        init() {
            this.cacheElements();
            this.bindEvents();
            this.loadSettings();
            this.checkApiKey();
        },

        /**
         * Cache DOM elements
         */
        cacheElements() {
            this.els = {
                // Modals
                apiModal: document.getElementById('api-modal'),
                settingsModal: document.getElementById('settings-modal'),

                // App container
                app: document.getElementById('app'),

                // API Setup
                providerTabs: document.querySelectorAll('.provider-tab'),
                apiKeyInput: document.getElementById('api-key'),
                toggleVisibility: document.querySelector('.toggle-visibility'),
                nanoBananaOptions: document.getElementById('nanoBanana-options'),
                gptImageOptions: document.getElementById('gptImage-options'),
                nanoModel: document.getElementById('nano-model'),
                gptModel: document.getElementById('gpt-model'),
                gptSize: document.getElementById('gpt-size'),
                saveApiBtn: document.getElementById('save-api'),

                // Header
                modeButtons: document.querySelectorAll('.mode-btn'),
                settingsBtn: document.getElementById('settings-btn'),
                currentProviderBadge: document.getElementById('current-provider'),
                closeSettingsBtn: document.getElementById('close-settings'),
                changeApiBtn: document.getElementById('change-api-btn'),
                settingsProvider: document.getElementById('settings-provider'),
                proxyUrlInput: document.getElementById('proxy-url'),

                // Prompt
                promptInput: document.getElementById('prompt-input'),
                charCount: document.getElementById('char-count'),

                // Variables
                variablesSection: document.getElementById('variables-section'),
                varModeButtons: document.querySelectorAll('.var-mode-btn'),
                combinationMode: document.getElementById('combination-mode'),
                linkedMode: document.getElementById('linked-mode'),
                varInputs: document.getElementById('var-inputs'),
                linkedTable: document.getElementById('linked-table'),
                addRowBtn: document.getElementById('add-row-btn'),
                comboCount: document.getElementById('combo-count'),

                // Edit mode images
                editImagesSection: document.getElementById('edit-images-section'),
                inputDropzone: document.getElementById('input-dropzone'),
                inputFilesInput: document.getElementById('input-files'),
                inputPreview: document.getElementById('input-preview'),

                // Reference image
                refDropzone: document.getElementById('ref-dropzone'),
                refFileInput: document.getElementById('ref-file'),
                refPreview: document.getElementById('ref-preview'),

                // Quality & Performance
                qualityOptions: document.getElementById('quality-options'),
                quality4kOption: document.getElementById('quality-4k-option'),
                workersSlider: document.getElementById('workers-slider'),
                workersValue: document.getElementById('workers-value'),

                // Generate
                costValue: document.getElementById('cost-value'),
                generateBtn: document.getElementById('generate-btn'),

                // Results
                resultsActions: document.getElementById('results-actions'),
                downloadAllBtn: document.getElementById('download-all-btn'),
                progressSection: document.getElementById('progress-section'),
                progressStatus: document.getElementById('progress-status'),
                progressCount: document.getElementById('progress-count'),
                progressBar: document.getElementById('progress-bar'),
                statSuccess: document.getElementById('stat-success'),
                statError: document.getElementById('stat-error'),
                statPending: document.getElementById('stat-pending'),
                cancelBtn: document.getElementById('cancel-btn'),
                emptyState: document.getElementById('empty-state'),
                resultsGrid: document.getElementById('results-grid'),

                // Toast
                toastContainer: document.getElementById('toast-container')
            };
        },

        /**
         * Bind event handlers
         */
        bindEvents() {
            // Provider tabs
            this.els.providerTabs.forEach(tab => {
                tab.addEventListener('click', () => this.selectProvider(tab.dataset.provider));
            });

            // Toggle password visibility
            this.els.toggleVisibility.addEventListener('click', () => {
                const type = this.els.apiKeyInput.type === 'password' ? 'text' : 'password';
                this.els.apiKeyInput.type = type;
            });

            // Save API
            this.els.saveApiBtn.addEventListener('click', () => this.saveApiSettings());

            // Mode toggle
            this.els.modeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
            });

            // Settings
            this.els.settingsBtn.addEventListener('click', () => this.openSettings());
            this.els.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
            this.els.changeApiBtn.addEventListener('click', () => this.changeApi());
            this.els.proxyUrlInput.addEventListener('input', (event) => this.updateProxyUrl(event.target.value));

            // Close settings on backdrop click
            this.els.settingsModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeSettings());

            // Prompt input
            this.els.promptInput.addEventListener('input', () => this.onPromptChange());

            // Variable mode toggle
            this.els.varModeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.setVarMode(btn.dataset.varmode));
            });

            // Add row button
            this.els.addRowBtn.addEventListener('click', () => this.addLinkedRow());

            // Input file dropzone
            this.setupDropzone(this.els.inputDropzone, this.els.inputFilesInput, true);
            this.els.inputFilesInput.addEventListener('change', (e) => this.handleInputFiles(e.target.files));

            // Reference file dropzone
            this.setupDropzone(this.els.refDropzone, this.els.refFileInput, false);
            this.els.refFileInput.addEventListener('change', (e) => this.handleRefFile(e.target.files[0]));

            // Workers slider
            this.els.workersSlider.addEventListener('input', (e) => {
                this.els.workersValue.textContent = e.target.value;
                Storage.setWorkers(e.target.value);
                this.updateCostEstimate();
            });

            // Quality options
            this.els.qualityOptions.addEventListener('change', () => this.updateCostEstimate());

            // Generate button
            this.els.generateBtn.addEventListener('click', () => this.startGeneration());

            // Cancel button
            this.els.cancelBtn.addEventListener('click', () => this.cancelGeneration());

            // Download all
            this.els.downloadAllBtn.addEventListener('click', () => this.downloadAll());

            // Model change events
            this.els.nanoModel.addEventListener('change', () => this.onModelChange());
            this.els.gptModel.addEventListener('change', () => this.onGptModelChange());
        },

        /**
         * Setup dropzone
         */
        setupDropzone(dropzone, input, multiple) {
            dropzone.addEventListener('click', () => input.click());

            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-over');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('drag-over');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');

                const files = e.dataTransfer.files;
                if (multiple) {
                    this.handleInputFiles(files);
                } else {
                    this.handleRefFile(files[0]);
                }
            });
        },

        /**
         * Load saved settings
         */
        loadSettings() {
            // Migration: Fix broken Imagen model ID (Imagen/Flash -> Gemini 3 Pro)
            const savedModel = Storage.get(Storage.KEYS.MODEL_NANO);
            if (savedModel && (savedModel.startsWith('imagen') || savedModel === 'gemini-2.0-flash-exp')) {
                Storage.setModel('nanoBanana', 'gemini-3-pro-image-preview');
            }

            this.currentProvider = Storage.getProvider();
            this.currentMode = Storage.getMode();
            this.els.proxyUrlInput.value = Storage.getProxyUrl();
            ApiProviders.setProxyUrl(this.els.proxyUrlInput.value);

            // Update workers slider
            const workers = Storage.getWorkers();
            this.els.workersSlider.value = workers;
            this.els.workersValue.textContent = workers;

            // Update quality
            const quality = Storage.getQuality();
            const qualityInput = this.els.qualityOptions.querySelector(`input[value="${quality}"]`);
            if (qualityInput) qualityInput.checked = true;
        },

        /**
         * Check if API key exists
         */
        checkApiKey() {
            const hasKey = Storage.hasApiKey(this.currentProvider);

            if (hasKey) {
                this.showApp();
            } else {
                this.showApiModal();
            }
        },

        /**
         * Show API setup modal
         */
        showApiModal() {
            this.els.apiModal.classList.remove('hidden');
            this.els.app.classList.add('hidden');

            // Load saved values if any
            const key = Storage.getApiKey(this.currentProvider);
            this.els.apiKeyInput.value = key;

            this.selectProvider(this.currentProvider);
        },

        /**
         * Show main app
         */
        showApp() {
            this.els.apiModal.classList.add('hidden');
            this.els.app.classList.remove('hidden');

            // Update UI
            this.updateProviderBadge();
            this.updateModeUI();
            this.onPromptChange();
            this.updateCostEstimate();
        },

        /**
         * Select provider in modal
         */
        selectProvider(provider) {
            this.currentProvider = provider;

            // Update tabs
            this.els.providerTabs.forEach(tab => {
                tab.classList.toggle('active', tab.dataset.provider === provider);
            });

            // Show/hide options
            this.els.nanoBananaOptions.classList.toggle('hidden', provider !== 'nanoBanana');
            this.els.gptImageOptions.classList.toggle('hidden', provider !== 'gptImage');

            // Load saved API key
            this.els.apiKeyInput.value = Storage.getApiKey(provider);

            // Load saved model
            if (provider === 'nanoBanana') {
                this.els.nanoModel.value = Storage.getModel(provider);
            } else {
                this.els.gptModel.value = Storage.getModel(provider);
                this.els.gptSize.value = Storage.getGptSize();
            }
        },

        /**
         * Save API settings
         */
        saveApiSettings() {
            const apiKey = this.els.apiKeyInput.value.trim();

            if (!apiKey) {
                this.showToast('Please enter an API key', 'error');
                return;
            }

            Storage.setProvider(this.currentProvider);
            Storage.setApiKey(this.currentProvider, apiKey);

            if (this.currentProvider === 'nanoBanana') {
                Storage.setModel('nanoBanana', this.els.nanoModel.value);
            } else {
                Storage.setModel('gptImage', this.els.gptModel.value);
                Storage.setGptSize(this.els.gptSize.value);
            }

            this.showToast('API settings saved!', 'success');
            this.showApp();
        },

        updateProxyUrl(value) {
            Storage.setProxyUrl(value);
            ApiProviders.setProxyUrl(value);
        },

        /**
         * Update provider badge in header
         */
        updateProviderBadge() {
            const config = ApiProviders[this.currentProvider];
            this.els.currentProviderBadge.querySelector('.provider-icon').textContent = config.icon;
            this.els.currentProviderBadge.querySelector('.provider-name').textContent = config.name;
            this.els.settingsProvider.textContent = config.name;

            // Update quality options for provider
            this.updateQualityOptions();
        },

        /**
         * Update quality options based on provider/model
         */
        updateQualityOptions() {
            if (this.currentProvider === 'nanoBanana') {
                const model = Storage.getModel('nanoBanana');
                const modelConfig = ApiProviders.nanoBanana.models[model];

                if (modelConfig && modelConfig.qualities.includes('4k')) {
                    this.els.quality4kOption.classList.remove('hidden');
                } else {
                    this.els.quality4kOption.classList.add('hidden');
                    // Reset to standard if 4k was selected
                    this.els.qualityOptions.querySelector('input[value="standard"]').checked = true;
                }
            } else {
                // GPT Image uses hd instead of 4k
                this.els.quality4kOption.querySelector('.quality-name').textContent = 'HD';
                this.els.quality4kOption.querySelector('.quality-desc').textContent = 'High detail';
                this.els.quality4kOption.querySelector('input').value = 'hd';
                this.els.quality4kOption.classList.remove('hidden');
            }
        },

        /**
         * Handle model change
         */
        onModelChange() {
            Storage.setModel('nanoBanana', this.els.nanoModel.value);
            this.updateQualityOptions();
            this.updateCostEstimate();
        },

        /**
         * Handle GPT model change
         */
        onGptModelChange() {
            const model = this.els.gptModel.value;
            Storage.setModel('gptImage', model);

            // Update size options based on model
            const sizes = ApiProviders.gptImage.sizes[model] || ['1024x1024'];
            this.els.gptSize.innerHTML = sizes.map(s =>
                `<option value="${s}">${s === 'auto' ? 'Auto' : s}</option>`
            ).join('');

            this.updateCostEstimate();
        },

        /**
         * Set generation mode
         */
        setMode(mode) {
            this.currentMode = mode;
            Storage.setMode(mode);
            this.updateModeUI();
            this.updateCostEstimate();
        },

        /**
         * Update mode UI
         */
        updateModeUI() {
            // Update buttons
            this.els.modeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === this.currentMode);
            });

            // Show/hide edit images section
            this.els.editImagesSection.classList.toggle('hidden', this.currentMode !== 'edit');
        },

        /**
         * Handle prompt change
         */
        onPromptChange() {
            const prompt = this.els.promptInput.value;
            this.els.charCount.textContent = prompt.length;

            // Find variables
            this.variables = VariableParser.findVariables(prompt);

            // Show/hide variables section
            this.els.variablesSection.classList.toggle('hidden', this.variables.length === 0);

            if (this.variables.length > 0) {
                this.updateVariableInputs();
            }

            this.updateCostEstimate();
        },

        /**
         * Update variable inputs
         */
        updateVariableInputs() {
            // Clear existing inputs
            this.els.varInputs.innerHTML = '';

            // Initialize varValues for new variables
            for (const varName of this.variables) {
                if (!this.varValues[varName]) {
                    this.varValues[varName] = [];
                }
            }

            // Create inputs for each variable
            for (const varName of this.variables) {
                const group = document.createElement('div');
                group.className = 'var-input-group';
                group.innerHTML = `
                    <label><span>[${varName}]</span></label>
                    <div class="var-input-row">
                        <input type="text" placeholder="Enter value..." data-var="${varName}">
                        <button type="button" data-var="${varName}">+</button>
                    </div>
                    <div class="var-tags" data-var="${varName}"></div>
                `;

                // Bind events
                const input = group.querySelector('input');
                const addBtn = group.querySelector('button');

                addBtn.addEventListener('click', () => this.addVarValue(varName, input));
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addVarValue(varName, input);
                    }
                });

                this.els.varInputs.appendChild(group);

                // Render existing tags
                this.renderVarTags(varName);
            }

            // Update linked table
            this.updateLinkedTable();
        },

        /**
         * Add a value for a variable
         */
        addVarValue(varName, input) {
            const value = input.value.trim();
            if (!value) return;

            if (!this.varValues[varName]) {
                this.varValues[varName] = [];
            }

            if (!this.varValues[varName].includes(value)) {
                this.varValues[varName].push(value);
                this.renderVarTags(varName);
                this.updateCostEstimate();
            }

            input.value = '';
        },

        /**
         * Remove a variable value
         */
        removeVarValue(varName, value) {
            if (this.varValues[varName]) {
                this.varValues[varName] = this.varValues[varName].filter(v => v !== value);
                this.renderVarTags(varName);
                this.updateCostEstimate();
            }
        },

        /**
         * Render variable tags
         */
        renderVarTags(varName) {
            const container = this.els.varInputs.querySelector(`.var-tags[data-var="${varName}"]`);
            if (!container) return;

            const values = this.varValues[varName] || [];
            container.innerHTML = values.map(v => `
                <span class="var-tag">
                    ${this.escapeHtml(v)}
                    <button type="button" data-var="${varName}" data-value="${this.escapeHtml(v)}">&times;</button>
                </span>
            `).join('');

            // Bind remove events
            container.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.removeVarValue(btn.dataset.var, btn.dataset.value);
                });
            });
        },

        /**
         * Set variable mode
         */
        setVarMode(mode) {
            this.varMode = mode;

            this.els.varModeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.varmode === mode);
            });

            this.els.combinationMode.classList.toggle('hidden', mode !== 'combination');
            this.els.linkedMode.classList.toggle('hidden', mode !== 'linked');

            if (mode === 'linked') {
                this.updateLinkedTable();
            }

            this.updateCostEstimate();
        },

        /**
         * Update linked table
         */
        updateLinkedTable() {
            const thead = this.els.linkedTable.querySelector('thead');
            const tbody = this.els.linkedTable.querySelector('tbody');

            // Build header
            thead.innerHTML = `
                <tr>
                    ${this.variables.map(v => `<th>[${v}]</th>`).join('')}
                    <th></th>
                </tr>
            `;

            // Initialize rows if needed
            if (this.linkedRows.length === 0) {
                this.linkedRows = [{}, {}, {}];
            }

            // Ensure each row has all variables
            this.linkedRows = this.linkedRows.map(row => {
                const newRow = {};
                this.variables.forEach(v => {
                    newRow[v] = row[v] || '';
                });
                return newRow;
            });

            // Build body
            this.renderLinkedRows();
        },

        /**
         * Render linked table rows
         */
        renderLinkedRows() {
            const tbody = this.els.linkedTable.querySelector('tbody');
            tbody.innerHTML = this.linkedRows.map((row, idx) => `
                <tr data-row="${idx}">
                    ${this.variables.map(v => `
                        <td>
                            <input type="text" value="${this.escapeHtml(row[v] || '')}" data-var="${v}">
                        </td>
                    `).join('')}
                    <td>
                        <button class="row-delete" data-row="${idx}">&times;</button>
                    </td>
                </tr>
            `).join('');

            // Bind events
            tbody.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const row = parseInt(e.target.closest('tr').dataset.row);
                    const varName = e.target.dataset.var;
                    this.linkedRows[row][varName] = e.target.value;
                    this.updateCostEstimate();
                });
            });

            tbody.querySelectorAll('.row-delete').forEach(btn => {
                btn.addEventListener('click', () => {
                    const row = parseInt(btn.dataset.row);
                    this.deleteLinkedRow(row);
                });
            });
        },

        /**
         * Add linked row
         */
        addLinkedRow() {
            const newRow = {};
            this.variables.forEach(v => newRow[v] = '');
            this.linkedRows.push(newRow);
            this.renderLinkedRows();
        },

        /**
         * Delete linked row
         */
        deleteLinkedRow(index) {
            if (this.linkedRows.length > 1) {
                this.linkedRows.splice(index, 1);
                this.renderLinkedRows();
                this.updateCostEstimate();
            }
        },

        /**
         * Handle input files
         */
        handleInputFiles(fileList) {
            const validExts = ['.png', '.jpg', '.jpeg', '.webp'];
            const newFiles = Array.from(fileList).filter(f => {
                const ext = '.' + f.name.split('.').pop().toLowerCase();
                return validExts.includes(ext);
            });

            this.inputFiles = [...this.inputFiles, ...newFiles];
            this.renderInputPreviews();
            this.updateCostEstimate();
        },

        /**
         * Render input file previews
         */
        renderInputPreviews() {
            this.els.inputPreview.innerHTML = this.inputFiles.map((file, idx) => `
                <div class="preview-item">
                    <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                    <button class="remove-btn" data-idx="${idx}">&times;</button>
                </div>
            `).join('');

            // Bind remove events
            this.els.inputPreview.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.idx);
                    this.inputFiles.splice(idx, 1);
                    this.renderInputPreviews();
                    this.updateCostEstimate();
                });
            });
        },

        /**
         * Handle reference file
         */
        handleRefFile(file) {
            if (!file) return;

            const validExts = ['.png', '.jpg', '.jpeg', '.webp'];
            const ext = '.' + file.name.split('.').pop().toLowerCase();

            if (!validExts.includes(ext)) {
                this.showToast('Invalid file type', 'error');
                return;
            }

            this.refFile = file;
            this.renderRefPreview();
        },

        /**
         * Render reference preview
         */
        renderRefPreview() {
            if (!this.refFile) {
                this.els.refPreview.classList.add('hidden');
                this.els.refDropzone.classList.remove('hidden');
                return;
            }

            this.els.refDropzone.classList.add('hidden');
            this.els.refPreview.classList.remove('hidden');
            this.els.refPreview.innerHTML = `
                <img src="${URL.createObjectURL(this.refFile)}" alt="Reference">
                <button class="remove-btn">&times;</button>
            `;

            this.els.refPreview.querySelector('.remove-btn').addEventListener('click', () => {
                this.refFile = null;
                this.renderRefPreview();
            });
        },

        /**
         * Update cost estimate
         */
        updateCostEstimate() {
            const jobCount = this.getJobCount();
            const model = this.currentProvider === 'nanoBanana'
                ? Storage.getModel('nanoBanana')
                : Storage.getModel('gptImage');
            const quality = this.getSelectedQuality();
            const size = Storage.getGptSize();

            const unitPrice = ApiProviders.getPrice(this.currentProvider, model, quality, size);
            const totalPrice = unitPrice * jobCount;

            this.els.costValue.textContent = `$${totalPrice.toFixed(3)}`;
            this.els.comboCount.textContent = jobCount;
        },

        /**
         * Get job count
         */
        getJobCount() {
            if (this.variables.length === 0) {
                return this.currentMode === 'edit' ? this.inputFiles.length : 1;
            }

            if (this.varMode === 'combination') {
                const hasAllValues = this.variables.every(v =>
                    this.varValues[v] && this.varValues[v].length > 0
                );

                if (!hasAllValues) return 0;

                let count = 1;
                for (const v of this.variables) {
                    count *= this.varValues[v].length;
                }

                return this.currentMode === 'edit' ? count * this.inputFiles.length : count;
            } else {
                // Linked mode
                const { combos } = VariableParser.buildLinkedCombinations(this.linkedRows, this.variables);
                const count = combos.length;
                return this.currentMode === 'edit' ? count * this.inputFiles.length : count;
            }
        },

        /**
         * Get selected quality
         */
        getSelectedQuality() {
            const checked = this.els.qualityOptions.querySelector('input:checked');
            return checked ? checked.value : 'standard';
        },

        /**
         * Build jobs for generation
         */
        async buildJobs() {
            const prompt = this.els.promptInput.value;
            const model = this.currentProvider === 'nanoBanana'
                ? Storage.getModel('nanoBanana')
                : Storage.getModel('gptImage');
            const quality = this.getSelectedQuality();
            const size = Storage.getGptSize();

            // Get variable combinations
            let combos = [{}];

            if (this.variables.length > 0) {
                if (this.varMode === 'combination') {
                    combos = VariableParser.buildCombinations(this.varValues);
                } else {
                    const result = VariableParser.buildLinkedCombinations(this.linkedRows, this.variables);
                    combos = result.combos;
                }
            }

            const jobs = [];

            // Prepare reference image data
            let refImage = null;
            if (this.refFile) {
                refImage = {
                    type: this.refFile.type,
                    data: this.refFile
                };
            }

            if (this.currentMode === 'edit') {
                // Edit mode: for each input file and combo
                for (const file of this.inputFiles) {
                    for (const combo of combos) {
                        const resolvedPrompt = VariableParser.applyVariables(prompt, combo);
                        const displayName = VariableParser.makeDisplayName(file.name, combo);

                        jobs.push({
                            id: `${displayName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            displayName,
                            prompt: resolvedPrompt,
                            model,
                            quality,
                            size,
                            mode: 'edit',
                            inputImage: {
                                type: file.type,
                                data: file
                            },
                            refImage
                        });
                    }
                }
            } else {
                // Generate mode: for each combo
                for (const combo of combos) {
                    const resolvedPrompt = VariableParser.applyVariables(prompt, combo);
                    const displayName = VariableParser.makeDisplayName(null, combo);

                    jobs.push({
                        id: `${displayName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        displayName,
                        prompt: resolvedPrompt,
                        model,
                        quality,
                        size,
                        mode: 'generate',
                        inputImage: null,
                        refImage
                    });
                }
            }

            return jobs;
        },

        /**
         * Start generation
         */
        async startGeneration() {
            const prompt = this.els.promptInput.value.trim();

            if (!prompt) {
                this.showToast('Please enter a prompt', 'error');
                return;
            }

            if (this.currentMode === 'edit' && this.inputFiles.length === 0) {
                this.showToast('Please add input images for edit mode', 'error');
                return;
            }

            if (this.variables.length > 0) {
                if (this.varMode === 'combination') {
                    const hasAllValues = this.variables.every(v =>
                        this.varValues[v] && this.varValues[v].length > 0
                    );
                    if (!hasAllValues) {
                        this.showToast('Please add values for all variables', 'error');
                        return;
                    }
                } else {
                    const { combos } = VariableParser.buildLinkedCombinations(this.linkedRows, this.variables);
                    if (combos.length === 0) {
                        this.showToast('Please fill in the variable table', 'error');
                        return;
                    }
                }
            }

            const apiKey = Storage.getApiKey(this.currentProvider);
            if (!apiKey) {
                this.showToast('API key not found', 'error');
                this.showApiModal();
                return;
            }

            // Build jobs
            const jobs = await this.buildJobs();

            if (jobs.length === 0) {
                this.showToast('No jobs to process', 'error');
                return;
            }

            // Show progress
            this.isGenerating = true;
            this.els.emptyState.classList.add('hidden');
            this.els.progressSection.classList.remove('hidden');
            this.els.generateBtn.disabled = true;
            this.els.resultsGrid.innerHTML = '';
            this.results = [];

            // Create placeholders
            for (const job of jobs) {
                this.addResultPlaceholder(job);
            }

            // Initialize queue
            const workers = parseInt(this.els.workersSlider.value);

            ImageQueue.init(jobs, {
                maxWorkers: workers,
                onProgress: (stats) => this.updateProgress(stats),
                onJobComplete: (result, stats) => this.onJobComplete(result, stats),
                onComplete: (results, stats) => this.onGenerationComplete(results, stats)
            });

            // Start generation
            try {
                await ImageQueue.start(this.currentProvider, apiKey);
            } catch (error) {
                console.error('Generation error:', error);
                this.showToast('Generation failed: ' + error.message, 'error');
            }

            this.isGenerating = false;
            this.els.generateBtn.disabled = false;
        },

        /**
         * Add result placeholder
         */
        addResultPlaceholder(job) {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.dataset.jobId = job.id;
            item.innerHTML = `
                <div class="result-image">
                    <div class="status-overlay loading">
                        <div class="spinner"></div>
                    </div>
                </div>
                <div class="result-info">
                    <div class="result-name">${this.escapeHtml(job.displayName)}</div>
                </div>
            `;
            this.els.resultsGrid.appendChild(item);
        },

        /**
         * Update progress
         */
        updateProgress(stats) {
            this.els.progressBar.style.width = `${stats.percentage}%`;
            this.els.progressCount.textContent = `${stats.completed}/${stats.total}`;
            this.els.statSuccess.textContent = `✓ ${stats.success}`;
            this.els.statError.textContent = `✗ ${stats.error}`;
            this.els.statPending.textContent = `⏳ ${stats.pending}`;
        },

        /**
         * Handle job completion
         */
        onJobComplete(result, stats) {
            const item = this.els.resultsGrid.querySelector(`[data-job-id="${result.id}"]`);
            if (!item) return;

            const imageContainer = item.querySelector('.result-image');
            const overlay = item.querySelector('.status-overlay');

            if (result.error) {
                overlay.classList.remove('loading');
                overlay.classList.add('error');
                overlay.innerHTML = `<span style="color: white; font-size: 0.8rem; padding: 10px;">${this.escapeHtml(result.error.substring(0, 50))}</span>`;
            } else {
                overlay.remove();
                const img = document.createElement('img');
                img.src = URL.createObjectURL(result.blob);
                imageContainer.appendChild(img);

                // Add download button
                const info = item.querySelector('.result-info');
                info.innerHTML = `
                    <div class="result-name">${this.escapeHtml(result.displayName)}</div>
                    <div class="result-actions">
                        <button data-job-id="${result.id}">Download</button>
                    </div>
                `;

                info.querySelector('button').addEventListener('click', () => {
                    this.downloadSingle(result);
                });
            }

            this.results.push(result);
        },

        /**
         * Handle generation complete
         */
        onGenerationComplete(results, stats) {
            this.els.progressSection.classList.add('hidden');
            this.els.resultsActions.classList.remove('hidden');

            if (stats.success > 0) {
                this.showToast(`Generated ${stats.success} images successfully!`, 'success');
            }

            if (stats.error > 0) {
                this.showToast(`${stats.error} images failed`, 'warning');
            }
        },

        /**
         * Cancel generation
         */
        cancelGeneration() {
            ImageQueue.cancel();
            this.showToast('Generation cancelled', 'warning');
        },

        /**
         * Download single image
         */
        downloadSingle(result) {
            if (!result.blob) return;

            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = VariableParser.sanitizeFilename(result.displayName) + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        /**
         * Download all as ZIP
         */
        async downloadAll() {
            if (this.results.length === 0) {
                this.showToast('No results to download', 'error');
                return;
            }

            this.showToast('Creating ZIP file...', 'success');

            try {
                const zipBlob = await ImageQueue.createZip(this.results);

                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'pixsemble_output.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showToast('ZIP downloaded!', 'success');
            } catch (error) {
                console.error('ZIP creation error:', error);
                this.showToast('Failed to create ZIP', 'error');
            }
        },

        /**
         * Open settings modal
         */
        openSettings() {
            this.els.settingsModal.classList.remove('hidden');
        },

        /**
         * Close settings modal
         */
        closeSettings() {
            this.els.settingsModal.classList.add('hidden');
        },

        /**
         * Change API (reopen API modal)
         */
        changeApi() {
            this.closeSettings();
            this.showApiModal();
        },

        /**
         * Show toast notification
         */
        showToast(message, type = 'success') {
            const icons = {
                success: '✓',
                error: '✗',
                warning: '⚠'
            };

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${this.escapeHtml(message)}</span>
                <button class="toast-close">&times;</button>
            `;

            this.els.toastContainer.appendChild(toast);

            // Bind close
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.remove();
            });

            // Auto remove
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 5000);
        },

        /**
         * Escape HTML
         */
        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };

    // Initialize the app
    App.init();
});
