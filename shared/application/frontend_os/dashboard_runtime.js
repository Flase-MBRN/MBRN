import { state } from '../../core/state/index.js';

export function registerDashboardActions(actions) {
  actions.register('calculateSynergyByDate', async (payload) => {
    const { calculateSynergy } = await import('../../core/logic/synergy_engine.js');
    const res = calculateSynergy(payload.birthdate1, payload.birthdate2);
    if (res.success) {
      state.emit('synergyByDateDone', res);
    } else {
      state.emit('synergyByDateFailed', res);
    }
    return res;
  });
}

export function subscribeDashboardSurface({
  onSystemInitialized,
  onStreakUpdated,
  onCheckInFailed,
  onSynergyByDateDone,
  onSynergyByDateFailed
} = {}) {
  const unsubscribers = [];

  if (typeof onSystemInitialized === 'function') {
    unsubscribers.push(state.subscribe('systemInitialized', onSystemInitialized));
  }
  if (typeof onStreakUpdated === 'function') {
    unsubscribers.push(state.subscribe('streakUpdated', onStreakUpdated));
  }
  if (typeof onCheckInFailed === 'function') {
    unsubscribers.push(state.subscribe('checkInFailed', onCheckInFailed));
  }
  if (typeof onSynergyByDateDone === 'function') {
    unsubscribers.push(state.subscribe('synergyByDateDone', onSynergyByDateDone));
  }
  if (typeof onSynergyByDateFailed === 'function') {
    unsubscribers.push(state.subscribe('synergyByDateFailed', onSynergyByDateFailed));
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
}
