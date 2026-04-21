import { state } from '../../core/state/index.js';
import { storage } from '../../core/storage/index.js';
import { i18n } from '../../core/i18n.js';
import { OPERATOR_MATRIX } from '../../core/logic/numerology/index.js';
import {
  generateShareCard,
  generateTeaserAsset,
  generateOperatorReport,
  getUnifiedProfile
} from '../../core/logic/orchestrator.js';

const NUMBER_MEANINGS = Object.freeze({
  1: 'Im Modell steht diese Zahl oft fuer Antrieb, Initiative und den ersten klaren Schritt.',
  2: 'Im Modell betont diese Zahl haeufig Balance, Verbindung und feines Gespuer fuer das Umfeld.',
  3: 'Im Modell verweist diese Zahl oft auf Praesenz, Ausdruck und klare Kommunikation.',
  4: 'Im Modell rueckt diese Zahl Struktur, Ausdauer und belastbare Systeme in den Vordergrund.',
  5: 'Im Modell steht diese Zahl haeufig fuer Bewegung, Veraenderung und flexible Entwicklung.',
  6: 'Im Modell verbindet diese Zahl Verantwortung, Stabilitaet und verlaessliche Fuersorge.',
  7: 'Im Modell betont diese Zahl Analyse, Mustererkennung und strategisches Denken.',
  8: 'Im Modell weist diese Zahl oft auf Fuehrung, Umsetzung und sichtbare Resultate hin.',
  9: 'Im Modell steht diese Zahl oft fuer Perspektive und systemisches Denken.',
  11: 'Im Modell wird diese Zahl haeufig mit klarer Wahrnehmung und feinen Impulsen verbunden.',
  22: 'Im Modell steht diese Zahl oft fuer grosse Vorhaben und tragfaehige Realisierung.',
  33: 'Im Modell verweist diese Zahl haeufig auf Orientierung, Reife und ruhige Fuehrung.'
});

function getPrimaryNumber(value) {
  const raw = Array.isArray(value) ? value[0] : String(value ?? '').split('/')[0];
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getNumerologyUiText(key) {
  return i18n.t(key);
}

export function registerNumerologyActions(actions) {
  actions.register('calculateFullProfile', async (payload) => {
    const res = await getUnifiedProfile(payload.name, payload.birthDate);
    if (res.success) {
      state.emit('numerologyDone', res);
    } else {
      state.emit('numerologyFailed', res);
    }
    return res;
  });
}

export function subscribeNumerologySurface({ onNumerologyDone, onNumerologyFailed } = {}) {
  const unsubscribers = [];

  if (typeof onNumerologyDone === 'function') {
    unsubscribers.push(state.subscribe('numerologyDone', onNumerologyDone));
  }
  if (typeof onNumerologyFailed === 'function') {
    unsubscribers.push(state.subscribe('numerologyFailed', onNumerologyFailed));
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
}

export function loadStoredNumerologyInput(storageKey) {
  return storage.get(storageKey);
}

export function saveStoredNumerologyInput(storageKey, payload) {
  return storage.set(storageKey, payload);
}

export function getNumberMeaning(value, fallback = 'Diese Zahl markiert im Modell einen wichtigen Teil deines Musters.') {
  const primary = getPrimaryNumber(value);
  return NUMBER_MEANINGS[primary] || fallback;
}

export function getLifeTheme(value) {
  const primary = getPrimaryNumber(value);
  return OPERATOR_MATRIX.pinnacles?.[primary]?.desc || getNumberMeaning(value);
}

export function getChallengeMeaning(value) {
  const primary = getPrimaryNumber(value);
  if (primary === 0) {
    return 'Im Modell zeigt sich hier wenig innere Reibung. Achte trotzdem darauf, nicht im Komfort haengen zu bleiben.';
  }
  return getNumberMeaning(value);
}

export function getBridgeMeaning(value) {
  const primary = getPrimaryNumber(value);
  if (primary === null) return 'Verbindung zwischen zwei Seiten deines Modells.';
  if (primary <= 2) return 'Im Modell wirkt diese Verbindung sehr stimmig und leicht anschlussfaehig.';
  if (primary <= 5) return 'Im Modell zeigt sich eine stabile Verbindung mit punktuellem Feintuning.';
  return 'Im Modell entsteht hier spuerbare Spannung, die bewussten Fokus und Entwicklung anstossen kann.';
}

export function getPhaseDescription(value) {
  const primary = getPrimaryNumber(value);
  if (primary === 9) {
    return 'Zeit fuer Transformation. Alte Strukturen aufloesen, um Platz fuer Neues zu schaffen.';
  }

  const base = getLifeTheme(value) || getNumberMeaning(value);
  const cleaned = String(base)
    .replace(/^Fokus auf\s*/i, '')
    .replace(/^Fokus im\s*/i, '')
    .replace(/^Fokus der\s*/i, '')
    .replace(/\.$/, '');
  const normalized = cleaned.length > 0 ? `${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}` : 'dein Thema klar ausrichten';
  return `Im Modell rueckt in dieser Phase besonders in den Vordergrund, ${normalized}.`;
}

export function describeNumerologyField(label, value) {
  switch (label) {
    case 'Lebenszahl': return { prefix: 'Dein Weg', body: getNumberMeaning(value) };
    case 'Seelenzahl': return { prefix: 'Dein Antrieb', body: getNumberMeaning(value) };
    case 'Persoenlichkeit': return { prefix: 'Deine Wirkung', body: getNumberMeaning(value) };
    case 'Persönlichkeit': return { prefix: 'Deine Wirkung', body: getNumberMeaning(value) };
    case 'Ausdruck': return { prefix: 'Dein Potenzial', body: getNumberMeaning(value) };
    case 'Reife': return { prefix: 'Dein Fundament', body: getNumberMeaning(value) };
    case 'Geburtstag': return { prefix: 'Dein fruehes Talent', body: getNumberMeaning(value) };
    default: return { prefix: 'Dein Profil', body: getNumberMeaning(value) };
  }
}

export function resolveLegacyNumerologyProfile(currentData) {
  return currentData?.legacy?.full_profile || currentData;
}

export function buildNumerologyImageFilename(prefix, profile) {
  const rawName = profile?.meta?.name || 'Operator';
  const safeName = String(rawName)
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]/g, '');

  return `${prefix}_${safeName || 'Operator'}.png`;
}

export function prepareNumerologyShareCard(currentData) {
  const legacyData = resolveLegacyNumerologyProfile(currentData);
  return {
    profile: legacyData,
    cardData: generateShareCard(legacyData)
  };
}

export function prepareNumerologyTeaserAsset(currentData) {
  const legacyData = resolveLegacyNumerologyProfile(currentData);
  return {
    profile: legacyData,
    teaserData: generateTeaserAsset(legacyData)
  };
}

export function prepareNumerologyPdfExport(currentData) {
  const legacyData = resolveLegacyNumerologyProfile(currentData);
  return {
    profile: legacyData,
    documentPromise: generateOperatorReport(legacyData)
  };
}
