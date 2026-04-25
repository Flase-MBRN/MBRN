/**
 * MBRN Cloud Storage Library (v5.4)
 * Provides persistence for Elite modules via Supabase.
 */

const MBRN_STORAGE_CONFIG = {
    url: (window.MBRN_CONFIG && window.MBRN_CONFIG.supabaseUrl) || 'https://wqfijgzlxypqftwwoxxp.supabase.co',
    key: (window.MBRN_CONFIG && window.MBRN_CONFIG.supabaseKey) || '',
    userId: 'erikk2k5@gmail.com'
};

const mbrnStorage = {
    /**
     * Save JSON data for a specific module.
     * @param {string} moduleId - Unique identifier for the module (e.g. slug)
     * @param {Object} payload - JSON data to persist
     */
    async save(moduleId, payload) {
        console.log(`[MBRN Storage] Saving data for ${moduleId}...`);
        
        if (!MBRN_STORAGE_CONFIG.key) {
            console.warn('[MBRN Storage] No API key found. Saving to localStorage instead.');
            localStorage.setItem(`mbrn_cloud_fallback_${moduleId}`, JSON.stringify(payload));
            return { success: true, mode: 'local' };
        }

        try {
            const response = await fetch(`${MBRN_STORAGE_CONFIG.url}/rest/v1/user_module_data`, {
                method: 'POST',
                headers: {
                    'apikey': MBRN_STORAGE_CONFIG.key,
                    'Authorization': `Bearer ${MBRN_STORAGE_CONFIG.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    user_id: MBRN_STORAGE_CONFIG.userId,
                    module_id: moduleId,
                    payload: payload,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
            
            console.log('[MBRN Storage] Data successfully synced to cloud.');
            return { success: true, mode: 'cloud' };
        } catch (err) {
            console.error('[MBRN Storage] Cloud sync failed:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Load JSON data for a specific module.
     * @param {string} moduleId 
     */
    async load(moduleId) {
        console.log(`[MBRN Storage] Loading data for ${moduleId}...`);

        if (!MBRN_STORAGE_CONFIG.key) {
            const local = localStorage.getItem(`mbrn_cloud_fallback_${moduleId}`);
            return local ? JSON.parse(local) : null;
        }

        try {
            const url = `${MBRN_STORAGE_CONFIG.url}/rest/v1/user_module_data?user_id=eq.${MBRN_STORAGE_CONFIG.userId}&module_id=eq.${moduleId}&select=payload`;
            const response = await fetch(url, {
                headers: {
                    'apikey': MBRN_STORAGE_CONFIG.key,
                    'Authorization': `Bearer ${MBRN_STORAGE_CONFIG.key}`
                }
            });

            if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
            
            const data = await response.json();
            return data.length > 0 ? data[0].payload : null;
        } catch (err) {
            console.error('[MBRN Storage] Cloud load failed:', err);
            return null;
        }
    },

    /**
     * Automatically load and populate module data from the cloud.
     */
    async autoLoad() {
        const moduleId = this.getModuleId();
        console.log(`[MBRN Storage] Attempting auto-load for ${moduleId}...`);
        
        const data = await this.load(moduleId);
        if (!data) {
            console.log('[MBRN Storage] No previous data found in cloud.');
            return;
        }

        console.log('[MBRN Storage] Restoring state from cloud...', data);
        
        Object.entries(data).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = value === true || value === 'true';
                } else {
                    el.value = value;
                }
                // Trigger change event for reactive tools
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // Special handling for result-area if it was saved
        if (data.last_result) {
            const resultArea = document.getElementById('result-area');
            if (resultArea) resultArea.textContent = data.last_result;
        }
    },

    /**
     * Helper to get moduleId from URL
     */
    getModuleId() {
        return window.location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'unknown';
    },

    /**
     * Helper to inject the "SAVE TO MBRN CLOUD" button into a module.
     */
    injectSaveButton() {
        const footer = document.querySelector('.meta-footer');
        const card = document.querySelector('.tool-card');
        if (!footer || !card) return;

        const btn = document.createElement('button');
        btn.id = 'mbrn-cloud-save-btn';
        btn.textContent = 'SAVE TO MBRN CLOUD';
        btn.style.cssText = 'margin-top: 16px; background: #10b981; font-size: 10px; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; color: white; width: 100%;';
        
        btn.onclick = async () => {
            btn.disabled = true;
            btn.textContent = 'SYNCING...';
            
            // Collect data: Try explicit function, else scrape inputs
            let data = {};
            if (typeof window.getModuleData === 'function') {
                data = window.getModuleData();
            } else {
                // Fallback: Scrape all inputs/textareas
                document.querySelectorAll('input, textarea, select').forEach(el => {
                    if (el.id) data[el.id] = el.value;
                });
                const resultArea = document.getElementById('result-area');
                if (resultArea) data.last_result = resultArea.textContent;
            }

            const moduleId = window.location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'unknown';
            const res = await this.save(moduleId, data);
            
            if (res.success) {
                btn.textContent = 'SAVED TO CLOUD';
                btn.style.background = '#059669';
            } else {
                btn.textContent = 'SYNC FAILED';
                btn.style.background = '#dc2626';
            }
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = 'SAVE TO MBRN CLOUD';
                btn.style.background = '#10b981';
            }, 3000);
        };

        footer.parentNode.insertBefore(btn, footer);
    }
};

// Auto-initialize if the script is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('[MBRN Storage] initialized.');
    // Check if we should auto-inject
    if (document.querySelector('.tool-card')) {
        mbrnStorage.injectSaveButton();
        // Trigger auto-load
        mbrnStorage.autoLoad();
    }
});
