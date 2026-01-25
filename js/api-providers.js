/**
 * API Providers Module - Abstractions for different image generation APIs
 */

const ApiProviders = {
    proxyUrl: 'https://pixsemble3.mehmetumut2005.workers.dev',
    // Nano Banana (Gemini) configuration
    nanoBanana: {
        name: 'Nano Banana',
        icon: '🍌',
        models: {
            'gemini-2.0-flash-image-preview': {
                name: 'Nano Banana (Fast)',
                price: 0.039,
                qualities: ['standard']
            },
            'gemini-3-pro-image-preview': {
                name: 'Nano Banana Pro',
                priceStandard: [0.040, 0.040], // Estimate for Imagen 3
                price4k: [0.080, 0.080],
                qualities: ['standard']
            }
        },
        qualityLabels: {
            'standard': '1K/2K (Fast)',
            '4k': '4K (High Detail)'
        },
        qualitySuffix: {
            'standard': '\n\nOutput quality: 1K/2K resolution, fast and economical generation.',
            '4k': '\n\nOutput quality: 4K resolution, maximum detail and quality.'
        },
        refSuffix: '\n\nNOTE: A reference (style) image has been provided. Please generate the output with a similar overall style (color palette, line style, texture/lighting, composition) to this reference image. However, do not compromise content accuracy or the instructions in the prompt.'
    },

    // GPT Image (OpenAI/DALL-E) configuration
    gptImage: {
        name: 'GPT Image',
        icon: '🤖',
        models: {
            'dall-e-3': {
                name: 'DALL-E 3',
                priceStandard: { '1024x1024': 0.04, '1792x1024': 0.08, '1024x1792': 0.08 },
                priceHD: { '1024x1024': 0.08, '1792x1024': 0.12, '1024x1792': 0.12 }
            },
            'gpt-image-1': {
                name: 'GPT Image',
                priceStandard: { '1024x1024': 0.011, '1536x1024': 0.016, '1024x1536': 0.016, 'auto': 0.011 },
                priceHD: { '1024x1024': 0.016, '1536x1024': 0.024, '1024x1536': 0.024, 'auto': 0.016 }
            }
        },
        sizes: {
            'dall-e-3': ['1024x1024', '1792x1024', '1024x1792'],
            'gpt-image-1': ['1024x1024', '1536x1024', '1024x1536', 'auto']
        },
        qualityLabels: {
            'standard': 'Standard',
            'hd': 'HD (High Detail)'
        }
    },

    /**
     * Get price estimate for a job
     */
    getPrice(provider, model, quality, size = '1024x1024') {
        const config = this[provider];
        if (!config) return 0;

        const modelConfig = config.models[model];
        if (!modelConfig) return 0;

        if (provider === 'nanoBanana') {
            if (model === 'gemini-2.0-flash-image-preview') {
                return modelConfig.price;
            }
            if (quality === '4k') {
                const [lo, hi] = modelConfig.price4k;
                return (lo + hi) / 2;
            }
            const [lo, hi] = modelConfig.priceStandard;
            return (lo + hi) / 2;
        }

        if (provider === 'gptImage') {
            const priceMap = quality === 'hd' ? modelConfig.priceHD : modelConfig.priceStandard;
            return priceMap[size] || 0;
        }

        return 0;
    },

    /**
     * Call Nano Banana (Gemini) API
     */
    async callNanoBanana(job, apiKey) {
        // Handle Imagen 3 specifically (starts with 'imagen')
        if (job.model.startsWith('imagen')) {
            return this.callImagen3(job, apiKey);
        }

        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${job.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const url = this.getProxyUrl(targetUrl);

        // Build prompt with quality suffix
        const config = this.nanoBanana;
        let promptText = job.prompt;
        promptText += config.qualitySuffix[job.quality] || '';
        if (job.refImage) {
            promptText += config.refSuffix;
        }

        // Build parts array
        const parts = [{ text: promptText }];

        // Add reference image if provided
        if (job.refImage) {
            parts.push({
                inlineData: {
                    mimeType: job.refImage.type || 'image/png',
                    data: await this.toBase64(job.refImage.data)
                }
            });
        }

        // Add input image for edit mode
        if (job.mode === 'edit' && job.inputImage) {
            parts.push({
                inlineData: {
                    mimeType: job.inputImage.type || 'image/png',
                    data: await this.toBase64(job.inputImage.data)
                }
            });
        }

        const payload = {
            contents: [{ parts }],
            generationConfig: { responseModalities: ['IMAGE'] }
        };

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error('Request blocked by the browser (CORS). Configure a Nano Banana proxy in Settings.');
        }

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Reduce parallel workers or wait a few minutes.');
            }
            if (response.status === 400) {
                throw new Error('Invalid request. Check your prompt or API key.');
            }
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();
        return this.extractImageFromGemini(data);
    },

    /**
     * Call Imagen 3 (via Generative Language API)
     */
    async callImagen3(job, apiKey) {
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${job.model}:predict?key=${encodeURIComponent(apiKey)}`;
        const url = this.getProxyUrl(targetUrl);

        // Imagen 3 uses a different payload structure via predict endpoint
        const payload = {
            instances: [
                { prompt: job.prompt }
            ],
            parameters: {
                sampleCount: 1
            }
        };

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error('Request blocked by the browser (CORS). Configure a Nano Banana proxy in Settings.');
        }

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Reduce parallel workers or wait a few minutes.');
            }
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();

        const image = this.extractImageFromImagen(data);
        if (image) {
            return image;
        }

        throw new Error('No image data in Imagen response');
    },

    /**
     * Call GPT Image (OpenAI) API
     */
    async callGptImage(job, apiKey) {
        const model = job.model;

        // Different endpoints for DALL-E 3 vs GPT Image
        if (model === 'dall-e-3') {
            return this.callDallE3(job, apiKey);
        } else {
            return this.callGptImage1(job, apiKey);
        }
    },

    async callDallE3(job, apiKey) {
        const url = 'https://api.openai.com/v1/images/generations';

        const payload = {
            model: 'dall-e-3',
            prompt: job.prompt,
            n: 1,
            size: job.size || '1024x1024',
            quality: job.quality === 'hd' ? 'hd' : 'standard',
            response_format: 'b64_json'
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Reduce parallel workers or wait a few minutes.');
            }
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();

        if (data.data && data.data[0]) {
            if (data.data[0].b64_json) {
                return this.base64ToBlob(data.data[0].b64_json, 'image/png');
            }
            if (data.data[0].url) {
                return this.fetchImageBlob(data.data[0].url);
            }
        }

        throw new Error('No image data in response');
    },

    async callGptImage1(job, apiKey) {
        const url = 'https://api.openai.com/v1/images/generations';

        const payload = {
            model: 'gpt-image-1',
            prompt: job.prompt,
            n: 1,
            size: job.size || '1024x1024',
            quality: job.quality === 'hd' ? 'high' : 'low',
            response_format: 'b64_json'
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Reduce parallel workers or wait a few minutes.');
            }
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();

        if (data.data && data.data[0]) {
            if (data.data[0].b64_json) {
                return this.base64ToBlob(data.data[0].b64_json, 'image/png');
            }
            if (data.data[0].url) {
                return this.fetchImageBlob(data.data[0].url);
            }
        }

        throw new Error('No image data in response');
    },

    /**
     * Fetch image blob from a URL (fallback for URL-based responses)
     */
    async fetchImageBlob(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: HTTP ${response.status}`);
        }
        return response.blob();
    },

    /**
     * Extract image from Gemini response
     */
    extractImageFromGemini(responseJson) {
        for (const candidate of (responseJson.candidates || [])) {
            const content = candidate.content || {};
            for (const part of (content.parts || [])) {
                const inline = part.inlineData || part.inline_data;
                if (inline && inline.data) {
                    return this.base64ToBlob(inline.data, inline.mimeType || 'image/png');
                }
            }
        }
        throw new Error('No image data in response');
    },

    /**
     * Extract image from Imagen response
     */
    extractImageFromImagen(responseJson) {
        const imageCandidates = [
            responseJson.generatedImages?.[0],
            responseJson.images?.[0],
            responseJson.predictions?.[0]
        ].filter(Boolean);

        for (const candidate of imageCandidates) {
            const b64 =
                candidate.bytesBase64Encoded ||
                candidate.b64_json ||
                candidate.image ||
                candidate.data;
            if (b64) {
                const mimeType = candidate.mimeType || 'image/png';
                return this.base64ToBlob(b64, mimeType);
            }
        }

        return null;
    },

    /**
     * Convert ArrayBuffer or Blob to base64
     */
    async toBase64(data) {
        if (typeof data === 'string') {
            return data; // Already base64
        }

        if (data instanceof Blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result;
                    // Remove data URL prefix if present
                    const base64 = result.replace(/^data:[^;]+;base64,/, '');
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(data);
            });
        }

        if (data instanceof ArrayBuffer) {
            const bytes = new Uint8Array(data);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }

        throw new Error('Unsupported data type for base64 conversion');
    },

    /**
     * Convert base64 to Blob
     */
    base64ToBlob(base64, mimeType = 'image/png') {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new Blob([bytes], { type: mimeType });
    },

    /**
     * Main call function that routes to correct provider
     */
    async call(provider, job, apiKey) {
        if (provider === 'nanoBanana') {
            return this.callNanoBanana(job, apiKey);
        } else if (provider === 'gptImage') {
            return this.callGptImage(job, apiKey);
        }
        throw new Error(`Unknown provider: ${provider}`);
    },

    setProxyUrl(url) {
        this.proxyUrl = url ? url.trim() : '';
    },

    getProxyUrl(targetUrl) {
        if (!this.proxyUrl) {
            return targetUrl;
        }
        const trimmed = this.proxyUrl.replace(/\/$/, '');
        return `${trimmed}?target=${encodeURIComponent(targetUrl)}`;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiProviders;
}
