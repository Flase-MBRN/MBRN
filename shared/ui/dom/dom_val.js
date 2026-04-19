// /shared/ui/dom/dom_val.js

const MAX_DATE_DIGITS = 8;
const NAVIGATION_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Enter',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End'
]);

function extractDigits(value) {
  return (value || '').replace(/\D/g, '').slice(0, MAX_DATE_DIGITS);
}

function formatDateDigits(digits) {
  const limited = extractDigits(digits);
  if (!limited) return '';

  if (limited.length <= 2) {
    return limited.length === 2 ? `${limited}.` : limited;
  }

  if (limited.length <= 4) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}${limited.length === 4 ? '.' : ''}`;
  }

  return `${limited.slice(0, 2)}.${limited.slice(2, 4)}.${limited.slice(4)}`;
}

function countDigitsBeforeCaret(value, caret) {
  if (!value || !Number.isFinite(caret) || caret <= 0) return 0;

  let count = 0;
  for (let index = 0; index < Math.min(caret, value.length); index += 1) {
    if (/\d/.test(value[index])) count += 1;
  }
  return count;
}

function caretFromDigitIndex(formattedValue, digitIndex) {
  if (!formattedValue || digitIndex <= 0) return 0;

  let seenDigits = 0;
  for (let index = 0; index < formattedValue.length; index += 1) {
    if (/\d/.test(formattedValue[index])) {
      seenDigits += 1;
      if (seenDigits === digitIndex) {
        return index + 1;
      }
    }
  }

  return formattedValue.length;
}

function setCaret(input, position) {
  if (!input) return;
  try {
    input.setSelectionRange(position, position);
  } catch {
    // Ignore mobile/browser selection edge-cases.
  }
}

/**
 * Smart Date Input Helper
 * Converts text input to formatted date (TT.MM.JJJJ).
 * Auto-inserts dots after 2nd and 4th digit.
 * @param {string} elementId - ID of input element
 * @returns {boolean} - Success status
 */
export function bindSmartDateInput(elementId) {
  const input = document.getElementById(elementId);
  if (!input) {
    console.warn(`[dom_val] Element #${elementId} not found`);
    return false;
  }

  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('maxlength', '10');
  input.setAttribute('placeholder', 'TT.MM.JJJJ');

  const applyMaskedValue = (rawValue, rawCaret) => {
    const nextDigits = extractDigits(rawValue);
    const nextValue = formatDateDigits(nextDigits);
    const nextDigitIndex = Math.min(
      countDigitsBeforeCaret(rawValue, rawCaret),
      nextDigits.length
    );

    input.value = nextValue;
    const nextCaret = caretFromDigitIndex(nextValue, nextDigitIndex);
    setCaret(input, nextCaret);
  };

  const handleInput = () => {
    const rawValue = input.value;
    const rawCaret = input.selectionStart ?? rawValue.length;
    applyMaskedValue(rawValue, rawCaret);
  };

  const handleBeforeInput = (event) => {
    if (event.inputType === 'insertText' && event.data && /\D/.test(event.data)) {
      event.preventDefault();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedDigits = extractDigits(event.clipboardData?.getData('text') || '');
    const currentValue = input.value;
    const selectionStart = input.selectionStart ?? currentValue.length;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    const startDigitIndex = countDigitsBeforeCaret(currentValue, selectionStart);
    const endDigitIndex = countDigitsBeforeCaret(currentValue, selectionEnd);
    const currentDigits = extractDigits(currentValue);

    const mergedDigits = (
      currentDigits.slice(0, startDigitIndex) +
      pastedDigits +
      currentDigits.slice(endDigitIndex)
    ).slice(0, MAX_DATE_DIGITS);

    const mergedValue = formatDateDigits(mergedDigits);
    input.value = mergedValue;
    const nextCaret = caretFromDigitIndex(
      mergedValue,
      Math.min(startDigitIndex + pastedDigits.length, MAX_DATE_DIGITS)
    );
    setCaret(input, nextCaret);
  };

  const handleKeydown = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    if (event.key === 'Backspace' && selectionStart === selectionEnd && selectionStart > 0) {
      const value = input.value;
      if (value[selectionStart - 1] === '.') {
        event.preventDefault();

        const digits = extractDigits(value);
        const digitIndex = countDigitsBeforeCaret(value, selectionStart);
        const nextDigits = digitIndex > 0
          ? `${digits.slice(0, digitIndex - 1)}${digits.slice(digitIndex)}`
          : digits;
        const nextValue = formatDateDigits(nextDigits);
        input.value = nextValue;
        const nextCaret = caretFromDigitIndex(nextValue, Math.max(0, digitIndex - 1));
        setCaret(input, nextCaret);
      }
      return;
    }

    if (NAVIGATION_KEYS.has(event.key)) return;
    if (/^\d$/.test(event.key)) return;
    if (event.key.length === 1) {
      event.preventDefault();
    }
  };

  input.addEventListener('beforeinput', handleBeforeInput);
  input.addEventListener('input', handleInput);
  input.addEventListener('paste', handlePaste);
  input.addEventListener('keydown', handleKeydown);

  // Normalize existing value (e.g. autofill / restore).
  handleInput();

  return true;
}
