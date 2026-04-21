import { LEGAL_LINKS, LEGAL_TEXTS } from '../../core/legal/config.js';
import { clearMBRNLocalData } from '../../core/legal/storage.js';

export function getLegalLinks() {
  return LEGAL_LINKS;
}

export function getLegalTexts() {
  return LEGAL_TEXTS;
}

export function clearFrontendOsLocalData() {
  return clearMBRNLocalData();
}
