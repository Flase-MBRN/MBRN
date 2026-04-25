import { state } from '../../core/state/index.js';
import { storage } from '../../core/storage/index.js';
import { calculateChronos } from '../../core/logic/chronos_v2.js';
import { resolveCommercialGate } from '../../../pillars/monetization/gates/entitlement_gate.js';

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

export function readChronosAccessState() {
  const user = state.get('user') || null;
  // Architectural Override: Chronos is always unlocked.
  return { 
    user, 
    gate: { allowed: true, reason: 'unlocked' } 
  };
}

export function subscribeChronosAccess(onAccessChanged) {
  const unsubscribers = [];

  if (typeof onAccessChanged === 'function') {
    unsubscribers.push(state.subscribe('systemInitialized', onAccessChanged));
    unsubscribers.push(state.subscribe('userAuthChanged', onAccessChanged));
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
}
