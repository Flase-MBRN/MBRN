import { state } from '../core/state.js';
import { actions } from '../core/actions.js';
import { dom } from './dom_utils.js';
import { i18n } from '../core/i18n.js';
import { getRepoRoot } from './navigation.js';

/**
 * /shared/ui/render_auth.js
 * Reactive UI Controller for Authentication
 */

export const renderAuth = {
  // Cleanup tracking
  _unsubscribers: [],
  _timers: [],
  
  init() {
    // Listen for auth changes to update navigation
    this._unsubscribers.push(
      state.subscribe('userAuthChanged', (user) => {
        this.updateNavigation(user);
      })
    );

    // Handle initial state (Phase 14 Hotfix)
    this.updateNavigation(state.get('user'));

    // Phase 15: Sync Indicator
    this._unsubscribers.push(
      state.subscribe('syncStarted', () => this.setSyncing(true))
    );
    this._unsubscribers.push(
      state.subscribe('syncSuccess', () => this.setSyncing(false))
    );
    this._unsubscribers.push(
      state.subscribe('syncFailed', () => this.setSyncing(false))
    );

    // Handle Login/Register Form if present
    this.bindAuthForms();
  },
  
  /**
   * Destroy: Cleanup all subscriptions and timers
   */
  destroy() {
    this._unsubscribers.forEach(unsub => unsub && unsub());
    this._unsubscribers = [];
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
  },

  setSyncing(isSyncing) {
    const indicator = document.getElementById('nav-sync-indicator');
    if (!indicator) return;
    if (isSyncing) {
      indicator.classList.add('syncing');
      indicator.title = 'Synchronisiere mit Cloud...';
    } else {
      indicator.classList.remove('syncing');
      indicator.title = 'Synchronisiert';
    }
  },

  updateNavigation(user) {
    const navRight = document.getElementById('nav-auth-container');
    if (!navRight) return;

    // SECURITY: Use dom.clear() + dom.createEl() instead of innerHTML
    // Prevents XSS if user.email contains malicious HTML
    dom.clear('nav-auth-container');

    if (user) {
      // User is logged in
      dom.createEl('span', {
        id: 'nav-sync-indicator',
        className: 'sync-indicator',
        text: '🔄',
        parent: navRight
      });

      dom.createEl('span', {
        style: { fontSize: '0.8rem', opacity: '0.7', marginRight: '8px' },
        text: user.email,  // XSS-safe: textContent escapes HTML
        parent: navRight
      });

      const logoutBtn = dom.createEl('button', {
        className: 'btn-secondary',
        id: 'auth-logout-btn',
        text: i18n.t('logout'),
        parent: navRight
      });
      logoutBtn.addEventListener('click', () => actions.logout());
    } else {
      // User is guest
      const loginBtn = dom.createEl('button', {
        className: 'btn-primary',
        id: 'auth-login-btn',
        text: i18n.t('login'),
        parent: navRight
      });
      loginBtn.addEventListener('click', () => {
        const authSection = document.getElementById('auth-section');
        if (authSection) {
          // On landing page: scroll to auth section
          authSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          // On app pages: navigate to landing page with auth hash
          window.location.href = getRepoRoot() + 'index.html#auth';
        }
      });
    }

    dom.createEl('div', {
      id: 'nav-auth-legal-hook',
      className: 'legal-auth-hook',
      attrs: { 'data-legal-hook': 'auth' },
      parent: navRight
    });
  },

  bindAuthForms() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      const mode = loginForm.dataset.mode || 'login';

      const btn = loginForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = i18n.t('loading');
      btn.disabled = true;

      const res = (mode === 'login') 
        ? await actions.login(email, password)
        : await actions.registerAccount(email, password);

      btn.textContent = originalText;
      btn.disabled = false;

      if (!res.success) {
        this.showAuthError(loginForm, res.error);
      } else {
        this.clearAuthError(loginForm);
        loginForm.reset();
      }
    });

    // Toggle Mode (Login/Register)
    const toggleBtn = document.getElementById('auth-toggle-mode');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const mode = loginForm.dataset.mode === 'register' ? 'login' : 'register';
        loginForm.dataset.mode = mode;
        dom.setText('auth-title', mode === 'login' ? i18n.t('authErrorTitle') : i18n.t('authRegisterTitle'));
        dom.setText('auth-submit-text', mode === 'login' ? i18n.t('authLoginBtn') : i18n.t('authRegisterBtn'));
        toggleBtn.textContent = mode === 'login' ? i18n.t('noAccount') : i18n.t('hasAccount');
      });
    }
  },

  showAuthError(form, message) {
    this.clearAuthError(form);
    const errorBox = document.createElement('div');
    errorBox.className = 'auth-error-box'; // LAW 9 COMPLIANT: Styles in CSS
    errorBox.textContent = message;
    form.parentNode.insertBefore(errorBox, form.nextSibling);
    const timerId = setTimeout(() => this.clearAuthError(form), 8000);
    this._timers.push(timerId);
  },

  clearAuthError(form) {
    const existing = form?.parentNode?.querySelector('.auth-error-box');
    if (existing) existing.remove();
  }
};
