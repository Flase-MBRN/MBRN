import { actions } from '../actions.js';

export function initSystem() {
  return actions.initSystem();
}

export function syncProfileToCloud() {
  return actions.syncProfileToCloud();
}

export function pullCloudData(userId) {
  return actions.pullCloudData(userId);
}

export function syncAppData(appId, data) {
  return actions.syncAppData(appId, data);
}

export function debouncedSync(delay) {
  return actions.debouncedSync(delay);
}

