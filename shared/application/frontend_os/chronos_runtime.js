import { state } from '../../core/state/index.js';
import { storage } from '../../core/storage/index.js';
import { calculateChronos } from '../../core/logic/chronos_v2.js';

export function registerChronosActions(actions) {
  actions.register('calculateChronos', async (payload) => {
    const res = calculateChronos(payload.birthDate);
    state.emit('chronosCalculated', res);
    return res;
  });
}

export function loadChronosBirthdate() {
  const userBirthdateResult = storage.get('user_birthdate');
  if (userBirthdateResult.success && userBirthdateResult.data) {
    return userBirthdateResult.data;
  }

  const profile = state.get('systemInitialized');
  const profileBirthdate = profile?.birthDate || profile?.birth_date;
  if (profileBirthdate) {
    return profileBirthdate;
  }

  const stored = storage.get('last_numerology_calc');
  return stored?.data?.birthDate || stored?.data?.birth_date || null;
}

export function saveChronosBirthdate(birthDate) {
  return storage.set('user_birthdate', birthDate);
}

export function clearChronosBirthdate() {
  return storage.remove('user_birthdate');
}

export function calculateChronosProfile(birthDate) {
  return calculateChronos(birthDate);
}
