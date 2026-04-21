import { storage } from '../../core/storage/index.js';
import { i18n } from '../../core/i18n.js';
import { calculateLifePathTotal, formatValue } from '../../core/logic/numerology/index.js';

export function getLandingTerminalMessages() {
  return i18n.getArray('terminal.sequence');
}

export function readExistingLandingProfile() {
  const lastCalc = storage.get('last_numerology_calc');
  if (lastCalc.success && lastCalc.data?.name && lastCalc.data?.birthDate && lastCalc.data?.lifePath) {
    return {
      name: lastCalc.data.name,
      birthDate: lastCalc.data.birthDate,
      lifePath: lastCalc.data.lifePath,
      firstName: lastCalc.data.name.split(' ')[0]
    };
  }

  const profile = storage.get('profile');
  if (profile.success && profile.data?.name && (profile.data.birthDate || profile.data.birth_date)) {
    const birthDate = profile.data.birthDate || profile.data.birth_date;
    return {
      name: profile.data.name,
      birthDate,
      lifePath: calculateLandingLifePath(birthDate),
      firstName: profile.data.name.split(' ')[0]
    };
  }

  return null;
}

export function calculateLandingLifePath(birthDate) {
  const normalizedDate = String(birthDate || '').includes('-')
    ? String(birthDate).split('-').reverse().join('.')
    : String(birthDate || '');

  return Number(formatValue(calculateLifePathTotal(normalizedDate)));
}

export function saveLandingProfile({ name, birthDate, lifePath }) {
  return storage.set('last_numerology_calc', {
    name,
    birthDate,
    lifePath,
    calculatedAt: new Date().toISOString()
  });
}
