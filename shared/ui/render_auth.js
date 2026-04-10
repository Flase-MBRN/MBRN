import { state } from '../core/state.js';
import { actions } from '../core/actions.js';
import { dom } from './dom_utils.js';

/**
 * /shared/ui/render_auth.js
 * Reactive UI Controller for Authentication
 */

export const renderAuth = {
  
  init() {
    // Listen for auth changes to update navigation
    state.subscribe('userAuthChanged', (user) => {
      this.updateNavigation(user);
    });

    // Handle initial state (Phase 14 Hotfix)
    this.updateNavigation(state.get('user'));

    // Phase 15: Sync Indicator
    state.subscribe('syncStarted', () => this.setSyncing(true));
    state.subscribe('syncSuccess', () => this.setSyncing(false));
    state.subscribe('syncFailed', () => this.setSyncing(false));

    // Handle Login/Register Form if present
    this.bindAuthForms();
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

    if (user) {
      // User is logged in
      navRight.innerHTML = `
        <span id="nav-sync-indicator" class="sync-indicator">🔄</span>
        <span style="font-size: 0.8rem; opacity: 0.7; margin-right: 8px;">${user.email}</span>
        <button class="btn-secondary" id="auth-logout-btn">Logout</button>
      `;
      document.getElementById('auth-logout-btn')?.addEventListener('click', () => actions.logout());
    } else {
      // User is guest
      navRight.innerHTML = `
        <button class="btn-primary" id="auth-login-btn">Login / Register</button>
      `;
      document.getElementById('auth-login-btn')?.addEventListener('click', () => {
        // Scroll to auth section or open modal
        const authSection = document.getElementById('auth-section');
        if (authSection) {
          authSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
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
      btn.textContent = 'Berechne...';
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
        dom.setText('auth-title', mode === 'login' ? 'System Login' : 'System Registrierung');
        dom.setText('auth-submit-text', mode === 'login' ? 'Anmelden' : 'Konto erstellen');
        toggleBtn.textContent = mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Login';
      });
    }
  },

  showAuthError(form, message) {
    this.clearAuthError(form);
    const errorBox = document.createElement('div');
    errorBox.className = 'auth-error-box';
    errorBox.style.cssText = 'margin-top: 12px; padding: 12px; border: 1px solid var(--accent-color); border-radius: 8px; background: rgba(255,59,48,0.1); color: var(--accent-color); font-size: 0.85rem; text-align: left;';
    errorBox.textContent = message;
    form.parentNode.insertBefore(errorBox, form.nextSibling);
    setTimeout(() => this.clearAuthError(form), 8000);
  },

  clearAuthError(form) {
    const existing = form?.parentNode?.querySelector('.auth-error-box');
    if (existing) existing.remove();
  }
};
