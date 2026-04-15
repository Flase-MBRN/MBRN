/**
 * /shared/ui/error_boundary.js
 * GLOBAL ERROR BOUNDARY — System Safety Net
 * 
 * Responsibility: Global error handling and graceful degradation
 * Creates error container dynamically (no HTML modifications needed)
 */

import { state } from '../core/state.js';
import { dom } from './dom_utils.js';

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
        console.log('[ErrorBoundary] Caught:', error?.message || error, context);
      });
    }
    
    // Setup global error handlers
    this._setupGlobalHandlers();
    
    this._initialized = true;
    console.log('[ErrorBoundary] Initialized - Dynamic container created');
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
   * Display error to user (only critical errors)
   */
  displayError(errorInfo) {
    if (!this._container) return;
    
    // Only show critical errors to user
    const isCritical = errorInfo.type === 'unhandled_promise' || 
                       errorInfo.type === 'uncaught_exception' ||
                       errorInfo.severity === 'critical';
    
    if (!isCritical) return;
    
    const message = errorInfo.error || errorInfo.message || 'Systemfehler';
    
    if (this._messageEl) {
      this._messageEl.textContent = `Systemfehler: ${message}. Bitte Seite neu laden.`;
    }
    
    this._container.classList.remove('hidden');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideError();
    }, 10000);
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
