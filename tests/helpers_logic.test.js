import {
  diff,
  isMasterNumber,
  reduceForDiff,
  reduceToDigit,
  safeReduceToDigit,
  validateInput
} from '../shared/core/logic/helpers.js';

describe('helpers logic', () => {
  test('validateInput rejects null and arrays before field checks', () => {
    expect(validateInput(null, ['name'])).toEqual({
      valid: false,
      missing: ['data object is null or undefined']
    });

    expect(validateInput([], ['name'])).toEqual({
      valid: false,
      missing: ['data must be an object']
    });
  });

  test('validateInput reports missing and empty string fields', () => {
    expect(validateInput({ first: '  ', age: 30 }, ['first', 'last', 'age'])).toEqual({
      valid: false,
      missing: ['first (empty string)', 'last']
    });
  });

  test('reduceToDigit handles zero negatives and master numbers', () => {
    expect(reduceToDigit(0)).toBe(0);
    expect(reduceToDigit(-1990)).toBe(1);
    expect(reduceToDigit(22)).toBe(22);
    expect(reduceToDigit(9999)).toBe(9);
  });

  test('master helpers map master numbers consistently', () => {
    expect(isMasterNumber(11)).toBe(true);
    expect(isMasterNumber(22)).toBe(true);
    expect(isMasterNumber(33)).toBe(true);
    expect(isMasterNumber(9)).toBe(false);

    expect(reduceForDiff(11)).toBe(2);
    expect(reduceForDiff(22)).toBe(4);
    expect(reduceForDiff(33)).toBe(6);
    expect(reduceForDiff(7)).toBe(7);

    expect(diff(11, 33)).toBe(4);
    expect(diff(22, 4)).toBe(0);
  });

  test('safeReduceToDigit rejects NaN and Infinity but accepts finite values', () => {
    expect(() => safeReduceToDigit(NaN)).toThrow('Input is NaN');
    expect(() => safeReduceToDigit(Infinity)).toThrow('Input must be finite');
    expect(() => safeReduceToDigit(-Infinity)).toThrow('Input must be finite');

    expect(safeReduceToDigit(-123)).toBe(6);
    expect(safeReduceToDigit(11)).toBe(11);
  });
});
