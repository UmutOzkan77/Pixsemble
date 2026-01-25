/**
 * Storage Module - Handles localStorage for API keys and preferences
 */

const Storage = {
    KEYS: {
        PROVIDER: 'pixsemble_provider',
        API_KEY_NANO: 'pixsemble_api_nano',
        API_KEY_GPT: 'pixsemble_api_gpt',
        MODEL_NANO: 'pixsemble_model_nano',
        MODEL_GPT: 'pixsemble_model_gpt',
        SIZE_GPT: 'pixsemble_size_gpt',
        QUALITY: 'pixsemble_quality',
        WORKERS: 'pixsemble_workers',
        MODE: 'pixsemble_mode',
        PROXY_URL: 'pixsemble_proxy_url'
    },

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? value : defaultValue;
        } catch (e) {
            console.warn('Storage.get error:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn('Storage.set error:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Storage.remove error:', e);
            return false;
        }
    },

    // Convenience methods
    getProvider() {
        return this.get(this.KEYS.PROVIDER, 'nanoBanana');
    },

    setProvider(provider) {
        return this.set(this.KEYS.PROVIDER, provider);
    },

    getApiKey(provider) {
        const key = provider === 'gptImage' ? this.KEYS.API_KEY_GPT : this.KEYS.API_KEY_NANO;
        return this.get(key, '');
    },

    setApiKey(provider, apiKey) {
        const key = provider === 'gptImage' ? this.KEYS.API_KEY_GPT : this.KEYS.API_KEY_NANO;
        return this.set(key, apiKey);
    },

    hasApiKey(provider) {
        return !!this.getApiKey(provider);
    },

    getModel(provider) {
        if (provider === 'gptImage') {
            return this.get(this.KEYS.MODEL_GPT, 'dall-e-3');
        }
        return this.get(this.KEYS.MODEL_NANO, 'gemini-3-pro-image-preview');
    },

    setModel(provider, model) {
        const key = provider === 'gptImage' ? this.KEYS.MODEL_GPT : this.KEYS.MODEL_NANO;
        return this.set(key, model);
    },

    getGptSize() {
        return this.get(this.KEYS.SIZE_GPT, '1024x1024');
    },

    setGptSize(size) {
        return this.set(this.KEYS.SIZE_GPT, size);
    },

    getQuality() {
        return this.get(this.KEYS.QUALITY, 'standard');
    },

    setQuality(quality) {
        return this.set(this.KEYS.QUALITY, quality);
    },

    getWorkers() {
        return parseInt(this.get(this.KEYS.WORKERS, '6'), 10);
    },

    setWorkers(workers) {
        return this.set(this.KEYS.WORKERS, workers.toString());
    },

    getMode() {
        return this.get(this.KEYS.MODE, 'generate');
    },

    setMode(mode) {
        return this.set(this.KEYS.MODE, mode);
    },

    getProxyUrl() {
        return this.get(this.KEYS.PROXY_URL, 'https://pixsemble3.mehmetumut2005.workers.dev');
    },

    setProxyUrl(url) {
        return this.set(this.KEYS.PROXY_URL, url);
    },

    // Clear all stored data
    clearAll() {
        Object.values(this.KEYS).forEach(key => this.remove(key));
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
