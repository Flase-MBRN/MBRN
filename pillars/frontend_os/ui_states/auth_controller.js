import {
  getAuthText,
  getCurrentAuthUser,
  loginUser,
  logoutUser,
  registerUser,
  subscribeAuthUi
} from '../../../shared/application/frontend_os/auth_runtime.js';
import { dom } from '../../../shared/ui/dom/index.js';
import { getRepoRoot } from '../navigation/index.js';

export const renderAuth = {
  _unsubscribers: [],
  _timers: [],

  init() {
    this._unsubscribers.push(subscribeAuthUi({
      onUserAuthChanged: (user) => this.updateNavigation(user),
      onSyncStarted: () => this.setSyncing(true),
      onSyncSuccess: () => this.setSyncing(false),
      onSyncFailed: () => this.setSyncing(false)
    }));

    this.updateNavigation(getCurrentAuthUser());

    this.bindAuthForms();
  },

  destroy() {
    this._unsubscribers.forEach((unsub) => unsub && unsub());
    this._unsubscribers = [];
    this._timers.forEach((id) => clearTimeout(id));
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

    dom.clear('nav-auth-container');

    if (user) {
      dom.createEl('span', {
        id: 'nav-sync-indicator',
        className: 'sync-indicator',
        text: '🔄',
        parent: navRight
      });

      dom.createEl('span', {
        style: { fontSize: '0.8rem', opacity: '0.7', marginRight: '8px' },
        text: user.email,
        parent: navRight
      });

      const logoutBtn = dom.createEl('button', {
        className: 'btn-secondary',
        id: 'auth-logout-btn',
        text: getAuthText('logout'),
        parent: navRight
      });
      logoutBtn.addEventListener('click', () => logoutUser());
    } else {
      const loginBtn = dom.createEl('button', {
        className: 'btn-primary',
        id: 'auth-login-btn',
        text: getAuthText('login'),
        parent: navRight
      });
      loginBtn.addEventListener('click', () => {
        const authSection = document.getElementById('auth-section');
        if (authSection) {
          authSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `${getRepoRoot()}index.html#auth`;
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

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      const mode = loginForm.dataset.mode || 'login';

      const button = loginForm.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.textContent = getAuthText('loading');
      button.disabled = true;

      const result = mode === 'login'
        ? await loginUser(email, password)
        : await registerUser(email, password);

      button.textContent = originalText;
      button.disabled = false;

      if (!result.success) {
        this.showAuthError(loginForm, result.error);
      } else {
        this.clearAuthError(loginForm);
        loginForm.reset();
      }
    });

    const toggleBtn = document.getElementById('auth-toggle-mode');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const mode = loginForm.dataset.mode === 'register' ? 'login' : 'register';
        loginForm.dataset.mode = mode;
        dom.setText('auth-title', mode === 'login' ? getAuthText('authErrorTitle') : getAuthText('authRegisterTitle'));
        dom.setText('auth-submit-text', mode === 'login' ? getAuthText('authLoginBtn') : getAuthText('authRegisterBtn'));
        toggleBtn.textContent = mode === 'login' ? getAuthText('noAccount') : getAuthText('hasAccount');
      });
    }
  },

  showAuthError(form, message) {
    this.clearAuthError(form);
    const errorBox = document.createElement('div');
    errorBox.className = 'auth-error-box';
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
