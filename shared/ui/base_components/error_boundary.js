/**
 * /shared/ui/base_components/error_boundary.js
 * GLOBAL ERROR BOUNDARY — System Safety Net
 * 
 * Responsibility: Global error handling and graceful degradation
 * Creates error container dynamically (no HTML modifications needed)
 */

import { state } from '../../core/state/index.js';
import { dom } from '../dom/index.js';

export const errorBoundary = {
  _container: null,
  _messageEl: null,
  _initialized: false,

  /**
   * Initialize error boundary system
   * Creates error container dynamically if it doesn't exist
   */
  init() {
    if (this._initialized) return;
    
    // Dynamically create error container (no HTML file modifications)
    this._createErrorContainer();
    
    // Subscribe to system errors from state manager
    state.subscribe('systemError', (errorInfo) => {
      this.displayError(errorInfo);
    });
    
    // Subscribe via error handler for non-event errors
    if (state.subscribeToErrors) {
      state.subscribeToErrors((error, context) => {
        // Error caught and handled silently
      });
    }
    
    // Setup global error handlers
    this._setupGlobalHandlers();
    
    this._initialized = true;
  },

  /**
   * Creates error container dynamically via JavaScript
   * LAW 2 COMPLIANT: No HTML template modifications needed
   */
  _createErrorContainer() {
    // Check if container already exists
    let container = document.getElementById('global-error-container');
    
    if (!container) {
      // Create container dynamically
      container = document.createElement('div');
      container.id = 'global-error-container';
      container.className = 'error-banner hidden';
      
      // Create message element
      const messageEl = document.createElement('span');
      messageEl.id = 'global-error-message';
      container.appendChild(messageEl);
      
      // Create close button (LAW 3 COMPLIANT: textContent not innerHTML)
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.onclick = () => this.hideError();
      container.appendChild(closeBtn);
      
      // Append to body
      document.body.appendChild(container);
    }
    
    this._container = container;
    this._messageEl = container.querySelector('#global-error-message');
  },

  /**
   * Setup global window error handlers
   */
  _setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Global Error] Unhandled Promise Rejection:', event.reason);
      this.displayError({
        type: 'unhandled_promise',
        error: event.reason?.message || String(event.reason),
        timestamp: Date.now()
      });
    });
    
    // Catch synchronous errors
    window.addEventListener('error', (event) => {
      console.error('[Global Error] Uncaught Exception:', event.error);
      this.displayError({
        type: 'uncaught_exception',
        error: event.error?.message || String(event.error),
        filename: event.filename,
        lineno: event.lineno,
        timestamp: Date.now()
      });
    });
  },

  /**
   * Display error to user (critical errors only in banner, non-critical as toast)
   */
  displayError(errorInfo) {
    if (!this._container) return;
    
    const isCritical = errorInfo.type === 'unhandled_promise' || 
                       errorInfo.type === 'uncaught_exception' ||
                       errorInfo.severity === 'critical';
    
    const message = errorInfo.error || errorInfo.message || 'Systemfehler';
    
    if (isCritical) {
      // Critical: Full banner
      if (this._messageEl) {
        this._messageEl.textContent = `Systemfehler: ${message}. Bitte Seite neu laden.`;
      }
      this._container.classList.remove('hidden');
      setTimeout(() => this.hideError(), 10000);
    } else {
      // Non-critical: Toast notification (Law 4: User feedback without blocking)
      this._showToast(message, errorInfo.type);
    }
  },

  /**
   * Show toast notification for non-critical errors
   * LAW 2 & LAW 9 COMPLIANT: Dynamic creation, CSS classes only (no inline styles)
   */
  _showToast(message, type = 'info') {
    // Remove existing toast if present
    const existingToast = document.getElementById('mbrn-toast');
    if (existingToast) existingToast.remove();

    // Create toast container - LAW 9: All styles via CSS classes
    const toast = document.createElement('div');
    toast.id = 'mbrn-toast';
    toast.className = `toast-notification toast-${type}`;
    // NOTE: All styling centralized in theme.css - no inline styles per LAW 9

    // Icon based on type
    const icon = type === 'validation' ? '⚠️' : type === 'sync' ? '🔄' : 'ℹ️';
    toast.textContent = `${icon} ${message}`;

    // Close button - LAW 9: Styled via CSS class
    const closeBtn = document.createElement('span');
    closeBtn.textContent = ' ×';
    closeBtn.className = 'toast-close-btn';
    closeBtn.onclick = () => toast.remove();
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    // Auto-hide after 5 seconds - LAW 9: Use CSS class for exit animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  },

  /**
   * Hide error banner
   */
  hideError() {
    if (this._container) {
      this._container.classList.add('hidden');
    }
  }
};
