import { actions } from '../actions.js';

export function registerAccount(email, password) {
  return actions.registerAccount(email, password);
}

export function login(email, password) {
  return actions.login(email, password);
}

export function logout() {
  return actions.logout();
}

