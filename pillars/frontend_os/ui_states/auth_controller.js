import {
  getAuthText,
  getCurrentAuthUser,
  loginUser,
  logoutUser,
  registerUser,
  subscribeAuthUi
} from '../../../shared/application/frontend_os/auth_runtime.js';
import { actions } from '../../../shared/application/actions.js';
import { dom } from '../../../shared/ui/dom/index.js';
import { getRepoRoot } from '../navigation/index.js';

export const renderAuth = {
  _unsubscribers: [],
  _timers: [],
  _systemBootPromise: null,

  async init() {
    if (!this._systemBootPromise) {
      this._systemBootPromise = actions.initSystem();
    }

    await this._systemBootPromise;

    this._unsubscribers.push(subscribeAuthUi({
      onUserAuthChanged: (user) => {
        this.updateNavigation(user);
        this.renderAuthSurface(user);
      },
      onSyncStarted: () => this.setSyncing(true),
      onSyncSuccess: () => {
        this.setSyncing(false);
        this.renderAuthSurface(getCurrentAuthUser());
      },
      onSyncFailed: () => this.setSyncing(false)
    }));

    const currentUser = getCurrentAuthUser();
    this.updateNavigation(currentUser);
    this.renderAuthSurface(currentUser);
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
        text: 'Sync',
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
      logoutBtn.addEventListener('click', async () => {
        await logoutUser();
      });
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
          window.location.href = `${getRepoRoot()}dashboard/index.html#auth`;
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

  renderAuthSurface(user) {
    const mount = document.getElementById('auth-surface-root');
    if (!mount) return;

    mount.replaceChildren();

    const card = dom.createEl('div', {
      className: 'section-card',
      parent: mount
    });

    dom.createEl('h2', {
      id: 'auth-title',
      className: 'text-accent mb-16',
      text: user ? 'Interner Zugang aktiv' : 'Interner Zugang',
      parent: card
    });

    dom.createEl('p', {
      className: 'text-secondary mb-24',
      text: user
        ? 'Dieses Konto ist für interne Nutzung verbunden.'
        : 'Login und Kontoanlage sind nur für interne Team-Nutzung gedacht.',
      parent: card
    });

    if (user) {
      dom.createEl('p', {
        className: 'text-sm opacity-70 mb-16',
        text: `Verbunden als ${user.email || 'internes konto'}.`,
        parent: card
      });

      const logoutBtn = dom.createEl('button', {
        className: 'btn-secondary',
        id: 'auth-surface-logout-btn',
        text: getAuthText('logout'),
        parent: card
      });
      logoutBtn.addEventListener('click', async () => {
        await logoutUser();
      });

      dom.createEl('div', {
        id: 'auth-surface-legal',
        className: 'mt-24',
        attrs: { 'data-legal-hook': 'auth' },
        parent: card
      });
      return;
    }

    const form = dom.createEl('form', {
      id: 'login-form',
      className: 'input-grid grid-1fr',
      attrs: { autocomplete: 'on' },
      parent: card
    });
    form.dataset.mode = 'login';

    const emailGroup = dom.createEl('div', {
      className: 'form-group',
      parent: form
    });
    dom.createEl('label', {
      attrs: { for: 'auth-email' },
      text: 'E-Mail',
      parent: emailGroup
    });
    dom.createEl('input', {
      attrs: {
        type: 'email',
        id: 'auth-email',
        name: 'email',
        required: 'required',
        autocomplete: 'email',
        placeholder: 'team@intern.local'
      },
      parent: emailGroup
    });

    const passwordGroup = dom.createEl('div', {
      className: 'form-group',
      parent: form
    });
    dom.createEl('label', {
      attrs: { for: 'auth-password' },
      text: 'Passwort',
      parent: passwordGroup
    });
    dom.createEl('input', {
      attrs: {
        type: 'password',
        id: 'auth-password',
        name: 'password',
        required: 'required',
        autocomplete: 'current-password',
        placeholder: 'Mindestens ein internes Passwort'
      },
      parent: passwordGroup
    });

    const submitBtn = dom.createEl('button', {
      className: 'btn-primary mt-16',
      attrs: { type: 'submit' },
      parent: form
    });
    dom.createEl('span', {
      id: 'auth-submit-text',
      text: getAuthText('authLoginBtn'),
      parent: submitBtn
    });

    const toggleBtn = dom.createEl('button', {
      id: 'auth-toggle-mode',
      className: 'btn-secondary mt-16',
      attrs: { type: 'button' },
      text: getAuthText('noAccount'),
      parent: card
    });

    dom.createEl('p', {
      className: 'text-sm opacity-70 mt-16',
      text: 'Freischaltungen für geschützte Bereiche erfolgen intern über Profilstatus und plan_id.',
      parent: card
    });

    dom.createEl('div', {
      id: 'auth-surface-legal',
      className: 'mt-24',
      attrs: { 'data-legal-hook': 'auth' },
      parent: card
    });

    this.bindAuthForms();
  },

  bindAuthForms() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm || loginForm.dataset.bound === 'true') return;
    loginForm.dataset.bound = 'true';

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
        dom.setText('auth-title', mode === 'login' ? 'Interner Zugang' : 'Internes Konto anlegen');
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
