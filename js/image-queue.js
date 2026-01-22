/**
 * Image Queue Module - Parallel image generation with queue management
 */

const ImageQueue = {
    // Queue state
    jobs: [],
    results: [],
    isRunning: false,
    isCancelled: false,
    activeJobs: 0,

    // Callbacks
    onProgress: null,
    onJobComplete: null,
    onComplete: null,

    // Settings
    maxWorkers: 6,
    maxRetries: 4,
    baseBackoff: 1000, // ms

    /**
     * Initialize the queue with jobs
     */
    init(jobs, options = {}) {
        this.jobs = [...jobs];
        this.results = [];
        this.isRunning = false;
        this.isCancelled = false;
        this.activeJobs = 0;

        this.maxWorkers = options.maxWorkers || 6;
        this.maxRetries = options.maxRetries || 4;
        this.baseBackoff = options.baseBackoff || 1000;

        this.onProgress = options.onProgress || null;
        this.onJobComplete = options.onJobComplete || null;
        this.onComplete = options.onComplete || null;

        return this;
    },

    /**
     * Start processing the queue
     */
    async start(provider, apiKey) {
        if (this.isRunning) {
            console.warn('Queue is already running');
            return;
        }

        this.isRunning = true;
        this.isCancelled = false;
        this.results = [];

        const jobQueue = [...this.jobs];
        const promises = [];

        const stats = {
            total: jobQueue.length,
            completed: 0,
            success: 0,
            error: 0,
            pending: jobQueue.length
        };

        // Report initial progress
        this.reportProgress(stats);

        // Worker function
        const processJob = async () => {
            while (jobQueue.length > 0 && !this.isCancelled) {
                const job = jobQueue.shift();
                if (!job) break;

                this.activeJobs++;
                stats.pending--;
                this.reportProgress(stats);

                try {
                    const result = await this.executeJob(job, provider, apiKey);
                    this.results.push(result);

                    stats.completed++;
                    if (result.error) {
                        stats.error++;
                    } else {
                        stats.success++;
                    }

                    if (this.onJobComplete) {
                        this.onJobComplete(result, stats);
                    }
                } catch (error) {
                    const result = {
                        id: job.id,
                        displayName: job.displayName,
                        error: error.message,
                        blob: null
                    };
                    this.results.push(result);

                    stats.completed++;
                    stats.error++;

                    if (this.onJobComplete) {
                        this.onJobComplete(result, stats);
                    }
                }

                this.activeJobs--;
                this.reportProgress(stats);
            }
        };

        // Start workers
        const workerCount = Math.min(this.maxWorkers, jobQueue.length);
        for (let i = 0; i < workerCount; i++) {
            promises.push(processJob());
        }

        // Wait for all workers to complete
        await Promise.all(promises);

        this.isRunning = false;

        if (this.onComplete) {
            this.onComplete(this.results, stats);
        }

        return this.results;
    },

    /**
     * Execute a single job with retries
     */
    async executeJob(job, provider, apiKey) {
        let lastError = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            if (this.isCancelled) {
                return {
                    id: job.id,
                    displayName: job.displayName,
                    error: 'Cancelled',
                    blob: null
                };
            }

            try {
                const blob = await ApiProviders.call(provider, job, apiKey);

                return {
                    id: job.id,
                    displayName: job.displayName,
                    error: null,
                    blob: blob
                };
            } catch (error) {
                lastError = error;

                // Check if it's a retryable error
                const errorStr = error.message || '';
                const isRateLimited = errorStr.includes('429') || errorStr.includes('Rate limit');
                const isRetryable =
                    isRateLimited ||
                    errorStr.includes('500') ||
                    errorStr.includes('502') ||
                    errorStr.includes('503') ||
                    errorStr.includes('504') ||
                    errorStr.includes('network') ||
                    errorStr.includes('timeout');

                if (!isRetryable || attempt === this.maxRetries) {
                    break;
                }

                // Exponential backoff with longer delays for rate limiting
                const baseDelay = isRateLimited ? 5000 : this.baseBackoff; // 5s for rate limit
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await this.sleep(delay);
            }
        }

        return {
            id: job.id,
            displayName: job.displayName,
            error: lastError ? lastError.message : 'Unknown error',
            blob: null
        };
    },

    /**
     * Cancel the queue
     */
    cancel() {
        this.isCancelled = true;
    },

    /**
     * Report progress to callback
     */
    reportProgress(stats) {
        if (this.onProgress) {
            this.onProgress({
                total: stats.total,
                completed: stats.completed,
                success: stats.success,
                error: stats.error,
                pending: stats.pending,
                active: this.activeJobs,
                percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
            });
        }
    },

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Create a ZIP file from results
     */
    async createZip(results) {
        // Simple ZIP implementation without external dependencies
        // Uses JSZip-compatible format

        const encoder = new TextEncoder();
        const files = [];

        for (const result of results) {
            if (result.blob) {
                const name = VariableParser.sanitizeFilename(result.displayName) + '.png';
                const data = await result.blob.arrayBuffer();
                files.push({ name, data: new Uint8Array(data) });
            }
        }

        // Build ZIP file
        const zip = new ZipBuilder();
        for (const file of files) {
            zip.addFile(file.name, file.data);
        }

        return zip.build();
    }
};

/**
 * Simple ZIP file builder (no compression for simplicity)
 */
class ZipBuilder {
    constructor() {
        this.files = [];
        this.offset = 0;
    }

    addFile(name, data) {
        this.files.push({ name, data });
    }

    build() {
        const localHeaders = [];
        const centralHeaders = [];
        let offset = 0;

        // Build local file headers and data
        for (const file of this.files) {
            const nameBytes = new TextEncoder().encode(file.name);
            const localHeader = this.buildLocalHeader(nameBytes, file.data);
            localHeaders.push(localHeader, nameBytes, file.data);

            const centralHeader = this.buildCentralHeader(nameBytes, file.data, offset);
            centralHeaders.push(centralHeader, nameBytes);

            offset += localHeader.length + nameBytes.length + file.data.length;
        }

        const centralDirOffset = offset;
        let centralDirSize = 0;
        for (const header of centralHeaders) {
            centralDirSize += header.length;
        }

        const endRecord = this.buildEndRecord(this.files.length, centralDirSize, centralDirOffset);

        // Combine all parts
        const totalSize = offset + centralDirSize + endRecord.length;
        const result = new Uint8Array(totalSize);
        let pos = 0;

        for (const part of localHeaders) {
            result.set(part, pos);
            pos += part.length;
        }

        for (const part of centralHeaders) {
            result.set(part, pos);
            pos += part.length;
        }

        result.set(endRecord, pos);

        return new Blob([result], { type: 'application/zip' });
    }

    buildLocalHeader(name, data) {
        const header = new Uint8Array(30);
        const view = new DataView(header.buffer);

        // Signature
        view.setUint32(0, 0x04034b50, true);
        // Version needed
        view.setUint16(4, 20, true);
        // General purpose flag
        view.setUint16(6, 0, true);
        // Compression method (none)
        view.setUint16(8, 0, true);
        // Mod time
        view.setUint16(10, 0, true);
        // Mod date
        view.setUint16(12, 0, true);
        // CRC32 (0 for stored files without CRC)
        view.setUint32(14, this.crc32(data), true);
        // Compressed size
        view.setUint32(18, data.length, true);
        // Uncompressed size
        view.setUint32(22, data.length, true);
        // Filename length
        view.setUint16(26, name.length, true);
        // Extra field length
        view.setUint16(28, 0, true);

        return header;
    }

    buildCentralHeader(name, data, offset) {
        const header = new Uint8Array(46);
        const view = new DataView(header.buffer);

        // Signature
        view.setUint32(0, 0x02014b50, true);
        // Version made by
        view.setUint16(4, 20, true);
        // Version needed
        view.setUint16(6, 20, true);
        // General purpose flag
        view.setUint16(8, 0, true);
        // Compression method
        view.setUint16(10, 0, true);
        // Mod time
        view.setUint16(12, 0, true);
        // Mod date
        view.setUint16(14, 0, true);
        // CRC32
        view.setUint32(16, this.crc32(data), true);
        // Compressed size
        view.setUint32(20, data.length, true);
        // Uncompressed size
        view.setUint32(24, data.length, true);
        // Filename length
        view.setUint16(28, name.length, true);
        // Extra field length
        view.setUint16(30, 0, true);
        // Comment length
        view.setUint16(32, 0, true);
        // Disk number start
        view.setUint16(34, 0, true);
        // Internal attributes
        view.setUint16(36, 0, true);
        // External attributes
        view.setUint32(38, 0, true);
        // Relative offset
        view.setUint32(42, offset, true);

        return header;
    }

    buildEndRecord(fileCount, centralDirSize, centralDirOffset) {
        const record = new Uint8Array(22);
        const view = new DataView(record.buffer);

        // Signature
        view.setUint32(0, 0x06054b50, true);
        // Disk number
        view.setUint16(4, 0, true);
        // Central dir disk
        view.setUint16(6, 0, true);
        // Entries on disk
        view.setUint16(8, fileCount, true);
        // Total entries
        view.setUint16(10, fileCount, true);
        // Central dir size
        view.setUint32(12, centralDirSize, true);
        // Central dir offset
        view.setUint32(16, centralDirOffset, true);
        // Comment length
        view.setUint16(20, 0, true);

        return record;
    }

    crc32(data) {
        // CRC32 lookup table
        if (!ZipBuilder.crcTable) {
            ZipBuilder.crcTable = new Uint32Array(256);
            for (let i = 0; i < 256; i++) {
                let c = i;
                for (let j = 0; j < 8; j++) {
                    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
                }
                ZipBuilder.crcTable[i] = c;
            }
        }

        let crc = 0xffffffff;
        for (let i = 0; i < data.length; i++) {
            crc = ZipBuilder.crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
        }
        return (crc ^ 0xffffffff) >>> 0;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImageQueue, ZipBuilder };
}
