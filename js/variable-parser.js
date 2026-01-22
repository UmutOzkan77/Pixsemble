/**
 * Variable Parser Module - Handles [variable] syntax parsing and combination generation
 */

const VariableParser = {
    // Pattern to match [variableName]
    PATTERN: /\[([A-Za-z0-9_]+)\]/g,

    /**
     * Find all unique variables in a prompt
     * @param {string} prompt - The prompt text
     * @returns {string[]} - Array of unique variable names (without brackets)
     */
    findVariables(prompt) {
        const seen = new Set();
        const result = [];
        let match;

        // Reset regex state
        this.PATTERN.lastIndex = 0;

        while ((match = this.PATTERN.exec(prompt)) !== null) {
            const varName = match[1];
            if (!seen.has(varName)) {
                seen.add(varName);
                result.push(varName);
            }
        }

        return result;
    },

    /**
     * Apply variable values to a prompt
     * @param {string} prompt - The prompt text with [variables]
     * @param {Object} varMap - Map of variableName -> value
     * @returns {string} - Prompt with variables replaced
     */
    applyVariables(prompt, varMap) {
        return prompt.replace(this.PATTERN, (match, varName) => {
            return varMap.hasOwnProperty(varName) ? varMap[varName] : match;
        });
    },

    /**
     * Generate all combinations from variable values (cartesian product)
     * @param {Object} varValues - Map of variableName -> array of values
     * @returns {Object[]} - Array of combination objects
     */
    buildCombinations(varValues) {
        const keys = Object.keys(varValues);

        if (keys.length === 0) {
            return [{}];
        }

        // Filter out empty arrays
        const validKeys = keys.filter(k => varValues[k] && varValues[k].length > 0);

        if (validKeys.length === 0) {
            return [{}];
        }

        // Build cartesian product
        const result = [];
        const maxIndex = validKeys.map(k => varValues[k].length);
        const indices = new Array(validKeys.length).fill(0);

        while (true) {
            // Create combination for current indices
            const combo = {};
            validKeys.forEach((key, i) => {
                combo[key] = varValues[key][indices[i]];
            });
            result.push(combo);

            // Increment indices (like counting in mixed radix)
            let pos = validKeys.length - 1;
            while (pos >= 0) {
                indices[pos]++;
                if (indices[pos] < maxIndex[pos]) {
                    break;
                }
                indices[pos] = 0;
                pos--;
            }

            if (pos < 0) {
                break;
            }
        }

        return result;
    },

    /**
     * Build linked combinations (row by row matching)
     * @param {Object[]} rows - Array of row objects with variable values
     * @param {string[]} variables - Array of variable names
     * @returns {{combos: Object[], incomplete: number}} - Valid combos and incomplete count
     */
    buildLinkedCombinations(rows, variables) {
        const combos = [];
        let incomplete = 0;

        for (const row of rows) {
            const cleaned = {};
            let hasAnyValue = false;
            let hasAllValues = true;

            for (const varName of variables) {
                const value = (row[varName] || '').toString().trim();
                cleaned[varName] = value;

                if (value) {
                    hasAnyValue = true;
                } else {
                    hasAllValues = false;
                }
            }

            // Skip completely empty rows
            if (!hasAnyValue) {
                continue;
            }

            // Track incomplete rows
            if (!hasAllValues) {
                incomplete++;
                continue;
            }

            combos.push(cleaned);
        }

        return { combos, incomplete };
    },

    /**
     * Create a display name from input name and variable values
     * @param {string|null} inputName - Input file name (optional)
     * @param {Object} varMap - Variable values
     * @returns {string} - Display name
     */
    makeDisplayName(inputName, varMap) {
        let base = inputName ? inputName.replace(/\.[^/.]+$/, '') : 'generated';

        if (Object.keys(varMap).length > 0) {
            const suffix = Object.entries(varMap)
                .map(([k, v]) => `${k}-${this.sanitizeFilename(v)}`)
                .join('__');
            base = `${base}__${suffix}`;
        }

        return base;
    },

    /**
     * Sanitize a string for use in filename
     * @param {string} str - Input string
     * @returns {string} - Sanitized string
     */
    sanitizeFilename(str) {
        return str
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^A-Za-z0-9_\-\.]/g, '')
            .substring(0, 50);
    },

    /**
     * Count total combinations that will be generated
     * @param {Object} varValues - Map of variableName -> array of values
     * @param {number} inputCount - Number of input images (for edit mode)
     * @param {string} mode - 'generate' or 'edit'
     * @returns {number} - Total job count
     */
    countJobs(varValues, inputCount, mode) {
        const keys = Object.keys(varValues);
        let comboCount = 1;

        for (const key of keys) {
            const values = varValues[key];
            if (values && values.length > 0) {
                comboCount *= values.length;
            }
        }

        if (mode === 'edit') {
            return comboCount * Math.max(inputCount, 0);
        }

        return comboCount;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VariableParser;
}
