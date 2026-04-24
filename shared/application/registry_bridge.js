/**
 * MBRN Registry Bridge
 * Connects the Frontend OS to the Canonical State (000_CANONICAL_STATE.json).
 */

export class RegistryBridge {
  constructor() {
    this.state = null;
    // Resolve relative to this module to support GitHub Pages subpath (/MBRN/)
    const baseUrl = new URL('../../', import.meta.url).href;
    this.canonicalPath = new URL('000_CANONICAL_STATE.json', baseUrl).href;
  }

  async load() {
    if (this.state) return this.state;
    
    try {
      const response = await fetch(this.canonicalPath);
      if (!response.ok) throw new Error(`Registry load failed: ${response.status}`);
      this.state = await response.json();
      console.log('[Registry] Canonical state loaded successfully:', this.state.version);
      return this.state;
    } catch (err) {
      console.error('[Registry] Failed to load canonical state:', err);
      return null;
    }
  }

  getDimensions() {
    if (!this.state) return [];
    return Object.entries(this.state.dimensions).map(([id, data]) => ({
      id,
      ...data
    }));
  }

  getApps() {
    if (!this.state) return [];
    return Object.entries(this.state.apps).map(([id, data]) => ({
      id,
      ...data
    }));
  }

  getAppsByDimension(dimensionId) {
    return this.getApps().filter(app => app.dimension === dimensionId);
  }

  getSystems() {
    if (!this.state) return [];
    return Object.entries(this.state.systems).map(([id, data]) => ({
      id,
      ...data
    }));
  }

  getPillars() {
    if (!this.state) return [];
    return this.state.pillars;
  }
}

export const registry = new RegistryBridge();
