/**
 * I18n Module - Handling Internationalization
 */

const I18n = {
    // Current language
    lang: 'tr',

    // Translations
    translations: {
        tr: {
            // Meta
            title: "Pixsemble - Paralel Görüntü Oluşturma",
            description: "Değişken şablonlarla paralel olarak yüzlerce AI görseli oluşturun.",

            // API Modal
            apiModalTitle: "Pixsemble",
            apiModalSubtitle: "Paralel AI Görüntü Oluşturma",
            apiKeyLabel: "API Anahtarı",
            apiKeyPlaceholder: "API anahtarınızı girin...",
            startCreating: "Oluşturmaya Başla",
            howToGetKeys: "API anahtarı nasıl alınır?",
            googleAiStudio: "Google AI Studio",
            openaiPlatform: "OpenAI Platform",
            clickCreateKey: "\"Create API Key\" butonuna tıklayın",
            createNewSecret: "Yeni bir gizli anahtar oluşturun",
            copyPaste: "Kopyalayıp yukarıya yapıştırın",

            // Header
            modeGenerate: "Oluştur",
            modeEdit: "Düzenle",
            settingsTitle: "Ayarlar",

            // Sidebar - Prompt
            panelPrompt: "Prompt",
            promptPlaceholder: "Oluşturmak istediğiniz görseli tarif edin...\n\nŞunun gibi [değişkenler] kullanın:\n[stil] sanat tarzında [renk] bir [hayvan]",
            charCount: "karakter",
            tipVariables: "İpucu: Değişkenler için [köşeli parantez] kullanın",

            // Sidebar - Variables
            panelVariables: "Değişkenler",
            varModeCombination: "Tüm kombinasyonlar",
            varModeLinked: "Satır satır",
            modeDescCombo: "Her değişken değeri diğerleriyle kombinasyon oluşturur.",
            modeDescLinked: "Her satır bir görsel oluşturur. Değerler sırayla eşleşir.",
            enterValue: "Değer girin...",
            addRow: "Satır Ekle",
            importCsv: "CSV/Excel İçe Aktar",
            imagesWillBeGenerated: "görsel oluşturulacak",

            // Sidebar - Inputs
            panelInputImages: "Girdi Görselleri",
            dropImages: "Görselleri buraya sürükleyin veya <span class='browse-link'>göz atın</span>",

            // Sidebar - Reference
            panelStyleRef: "Stil Referansı",
            optionalBadge: "İsteğe Bağlı",
            addStyleRef: "Stil referansı ekle",

            // Sidebar - Quality
            panelQuality: "Kalite",
            qualityStandard: "Standart",
            qualityStandardDesc: "1K/2K • Hızlı",
            quality4k: "4K",
            quality4kDesc: "Yüksek detay",
            qualityHd: "HD",
            qualityHdDesc: "Yüksek detay",

            // Sidebar - Performance
            panelPerformance: "Performans",
            parallelWorkers: "Paralel Çalışanlar",

            // Sidebar - Generate
            estimatedCost: "Tahmini maliyet:",
            btnGenerate: "Görselleri Oluştur",

            // Results
            panelResults: "Sonuçlar",
            downloadAll: "Tümünü İndir (ZIP)",
            statusGenerating: "Oluşturuluyor...",
            btnCancel: "İptal",
            emptyStateTitle: "Henüz görsel yok",
            emptyStateDesc: "Bir prompt yazın ve görsel oluşturmak için Oluştur'a tıklayın",

            // Settings Modal
            settingsHeader: "Ayarlar",
            sectionApi: "API Yapılandırması",
            currentProvider: "Mevcut Sağlayıcı:",
            proxyLabel: "Nano Banana Proxy URL",
            proxyHint: "Google AI Studio uç noktaları tarayıcı CORS'unu engeller. İstekleri iletmek için bir proxy URL sağlayın.",
            changeApiBtn: "API Anahtarını / Sağlayıcıyı Değiştir",
            sectionLanguage: "Dil",
            languageLabel: "Uygulama Dili",
            sectionAbout: "Hakkında",
            aboutText: "Pixsemble v2.0 - Paralel AI Görüntü Oluşturma",
            aboutSub: "NanoApp'ten esinlenen modern bir web uygulaması",

            // Javascript / Dynamic
            saved: "Ayarlar kaydedildi!",
            errorNoKey: "Lütfen bir API anahtarı girin",
            importedRows: "satır içe aktarıldı",
            noDataFile: "Dosyada veri bulunamadı",
            errorParsing: "Dosya ayrıştırma hatası",
            rateLimit: "Hız sınırı aşıldı. Lütfen ayarlardan 'Paralel Çalışanlar'ı azaltın.",
            requestBlocked: "İstek engellendi (CORS). Ayarlardan Proxy yapılandırın.",
            noImageResponse: "Yanıtta görsel verisi yok",
            unknownError: "Bilinmeyen hata",
            cancelled: "İptal edildi",
            modelNanoFast: "Nano Banana (Hızlı)",
            modelNanoPro: "Nano Banana Pro",
            sizeLandscape: "1792×1024 (Yatay)",
            sizePortrait: "1024×1792 (Dikey)",
            auto: "Otomatik"
        },
        en: {
            // Meta
            title: "Pixsemble - Parallel Image Generation",
            description: "Generate hundreds of AI images in parallel with variable templates.",

            // API Modal
            apiModalTitle: "Pixsemble",
            apiModalSubtitle: "Parallel AI Image Generation",
            apiKeyLabel: "API Key",
            apiKeyPlaceholder: "Enter your API key...",
            startCreating: "Start Creating",
            howToGetKeys: "How to get API keys?",
            googleAiStudio: "Google AI Studio",
            openaiPlatform: "OpenAI Platform",
            clickCreateKey: "Click \"Create API Key\"",
            createNewSecret: "Create new secret key",
            copyPaste: "Copy and paste above",

            // Header
            modeGenerate: "Generate",
            modeEdit: "Edit",
            settingsTitle: "Settings",

            // Sidebar - Prompt
            panelPrompt: "Prompt",
            promptPlaceholder: "Describe the image you want to generate...\n\nUse [variables] like:\nA [color] [animal] in a [style] art style",
            charCount: "characters",
            tipVariables: "Tip: Use [brackets] for variables",

            // Sidebar - Variables
            panelVariables: "Variables",
            varModeCombination: "All combinations",
            varModeLinked: "Row by row",
            modeDescCombo: "Each variable value creates combinations with all others.",
            modeDescLinked: "Each row creates one image. Values are matched by position.",
            enterValue: "Enter value...",
            addRow: "Add Row",
            importCsv: "Import CSV/Excel",
            imagesWillBeGenerated: "images will be generated",

            // Sidebar - Inputs
            panelInputImages: "Input Images",
            dropImages: "Drop images here or <span class='browse-link'>browse</span>",

            // Sidebar - Reference
            panelStyleRef: "Style Reference",
            optionalBadge: "Optional",
            addStyleRef: "Add style reference",

            // Sidebar - Quality
            panelQuality: "Quality",
            qualityStandard: "Standard",
            qualityStandardDesc: "1K/2K • Fast",
            quality4k: "4K",
            quality4kDesc: "High detail",
            qualityHd: "HD",
            qualityHdDesc: "High detail",

            // Sidebar - Performance
            panelPerformance: "Performance",
            parallelWorkers: "Parallel Workers",

            // Sidebar - Generate
            estimatedCost: "Estimated cost:",
            btnGenerate: "Generate Images",

            // Results
            panelResults: "Results",
            downloadAll: "Download All (ZIP)",
            statusGenerating: "Generating...",
            btnCancel: "Cancel",
            emptyStateTitle: "No images yet",
            emptyStateDesc: "Write a prompt and click Generate to create images",

            // Settings Modal
            settingsHeader: "Settings",
            sectionApi: "API Configuration",
            currentProvider: "Current Provider:",
            proxyLabel: "Nano Banana Proxy URL",
            proxyHint: "Google AI Studio endpoints block browser CORS. Provide a proxy URL to relay requests.",
            changeApiBtn: "Change API Key / Provider",
            sectionLanguage: "Language",
            languageLabel: "App Language",
            sectionAbout: "About",
            aboutText: "Pixsemble v2.0 - Parallel AI Image Generation",
            aboutSub: "A modern web app inspired by NanoApp",

            // Javascript / Dynamic
            saved: "Settings saved!",
            errorNoKey: "Please enter an API key",
            importedRows: "rows imported",
            noDataFile: "No data found in file",
            errorParsing: "Error parsing file",
            rateLimit: "Rate limit exceeded. Please reduce 'Parallel Workers' in settings.",
            requestBlocked: "Request blocked (CORS). Configure Proxy in Settings.",
            noImageResponse: "No image data in response",
            unknownError: "Unknown error",
            cancelled: "Cancelled",
            modelNanoFast: "Nano Banana (Fast)",
            modelNanoPro: "Nano Banana Pro",
            sizeLandscape: "1792×1024 (Landscape)",
            sizePortrait: "1024×1792 (Portrait)",
            auto: "Auto"
        }
    },

    /**
     * Initialize I18n
     */
    init() {
        // Try to get from storage, then browser, then default to 'tr'
        const savedLang = localStorage.getItem('pixsemble_lang');
        const browserLang = navigator.language.startsWith('tr') ? 'tr' : 'en';

        // Per user request, "native olarak türkçe yap" -> implied default is tr
        this.lang = savedLang || 'tr';

        this.updatePage();
    },

    /**
     * Change language
     */
    setLang(lang) {
        if (!this.translations[lang]) return;
        this.lang = lang;
        localStorage.setItem('pixsemble_lang', lang);
        this.updatePage();
    },

    /**
     * Get translation
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.lang];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    },

    /**
     * Update all elements with data-i18n attribute
     */
    updatePage() {
        // Update static elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.getAttribute('placeholder')) {
                    el.placeholder = translation;
                }
            } else {
                el.innerHTML = translation;
            }
        });

        // Update document title
        document.title = this.t('title');

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.t('description');
        }

        // Trigger an event so other components can update
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.lang } }));
    }
};
