import { actions } from '../actions.js';
import { state } from '../../core/state/index.js';
import { i18n } from '../../core/i18n.js';

export function getCurrentAuthUser() {
  return state.get('user') || null;
}

export function subscribeAuthUi({ onUserAuthChanged, onSyncStarted, onSyncSuccess, onSyncFailed } = {}) {
  const unsubscribers = [];

  if (typeof onUserAuthChanged === 'function') {
    unsubscribers.push(state.subscribe('userAuthChanged', onUserAuthChanged));
  }
  if (typeof onSyncStarted === 'function') {
    unsubscribers.push(state.subscribe('syncStarted', onSyncStarted));
  }
  if (typeof onSyncSuccess === 'function') {
    unsubscribers.push(state.subscribe('syncSuccess', onSyncSuccess));
  }
  if (typeof onSyncFailed === 'function') {
    unsubscribers.push(state.subscribe('syncFailed', onSyncFailed));
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
}

export function loginUser(email, password) {
  return actions.login(email, password);
}

export function registerUser(email, password) {
  return actions.registerAccount(email, password);
}

export function logoutUser() {
  return actions.logout();
}

export function getAuthText(key) {
  return i18n.t(key);
}
