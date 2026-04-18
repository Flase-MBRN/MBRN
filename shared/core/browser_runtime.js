/**
 * /shared/core/browser_runtime.js
 * Centralized browser-runtime guards for headless-safe core imports.
 */

export function getBrowserWindow() {
  if (typeof globalThis === 'undefined') return null;
  return globalThis.window || null;
}

export function getBrowserNavigator() {
  if (typeof globalThis === 'undefined') return null;
  return globalThis.navigator || null;
}

export function hasBrowserWindow() {
  return !!getBrowserWindow();
}

export function hasBrowserRuntime() {
  return !!(getBrowserWindow() && getBrowserNavigator());
}

export function isBrowserOnline(defaultValue = true) {
  const navigatorRef = getBrowserNavigator();
  return typeof navigatorRef?.onLine === 'boolean' ? navigatorRef.onLine : defaultValue;
}

export function getBrowserLanguage(defaultValue = 'unknown') {
  const navigatorRef = getBrowserNavigator();
  return navigatorRef?.language || navigatorRef?.userLanguage || defaultValue;
}

export function getBrowserUserAgent(defaultValue = 'unknown') {
  const navigatorRef = getBrowserNavigator();
  return navigatorRef?.userAgent || defaultValue;
}

export function getBrowserLocation() {
  return getBrowserWindow()?.location || null;
}

export function getBrowserOrigin(defaultValue = 'http://localhost') {
  return getBrowserLocation()?.origin || defaultValue;
}

export function getBrowserHref(defaultValue = '') {
  return getBrowserLocation()?.href || defaultValue;
}
