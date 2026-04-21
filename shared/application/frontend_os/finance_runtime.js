import { state } from '../../core/state/index.js';
import { i18n } from '../../core/i18n.js';
import { calculateCompoundInterest } from '../../core/logic/finance.js';

export function registerFinanceActions(actions) {
  actions.register('calculateFinance', (inputData) => {
    if (!inputData) {
      return { success: false, error: 'Keine Daten vorhanden.' };
    }

    const result = calculateCompoundInterest(
      inputData.principal,
      inputData.rate,
      inputData.years,
      inputData.monthlyAddition
    );

    if (result.success) {
      state.emit('calculationDone', result);
    } else {
      state.emit('calculationFailed', result);
    }

    return result;
  });
}

export function subscribeFinanceSurface({ onCalculationDone, onCalculationFailed } = {}) {
  const unsubscribers = [];

  if (typeof onCalculationDone === 'function') {
    unsubscribers.push(state.subscribe('calculationDone', onCalculationDone));
  }
  if (typeof onCalculationFailed === 'function') {
    unsubscribers.push(state.subscribe('calculationFailed', onCalculationFailed));
  }

  return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
}

export function getFinanceUiText(key) {
  return i18n.t(key);
}
