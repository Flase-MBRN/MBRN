// /shared/ui/dom/dom_val.js

/**
 * Smart Date Input Helper
 * Converts tel input to formatted date (TT.MM.JJJJ)
 * Auto-inserts dots after 2nd and 4th character
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

  const formatDate = (value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 8 digits (DDMMYYYY)
    const limited = cleaned.slice(0, 8);
    
    let formatted = '';
    
    // Add dots after day and month
    if (limited.length >= 2) {
      formatted = limited.slice(0, 2) + '.';
      if (limited.length >= 4) {
        formatted += limited.slice(2, 4) + '.';
        formatted += limited.slice(4);
      } else {
        formatted += limited.slice(2);
      }
    } else {
      formatted = limited;
    }
    
    return formatted;
  };

  const handleInput = (e) => {
    const cursorPosition = e.target.selectionStart;
    const oldLength = e.target.value.length;
    
    // Format the value
    const formatted = formatDate(e.target.value);
    e.target.value = formatted;
    
    // Adjust cursor position for added dots
    const newLength = formatted.length;
    const addedChars = newLength - oldLength;
    const newPosition = cursorPosition + addedChars;
    
    e.target.setSelectionRange(newPosition, newPosition);
  };

  const handleKeydown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    if ([8, 46, 9, 27, 13, 37, 39].includes(e.keyCode)) return;
    
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return;
    
    // Allow: home, end
    if (e.keyCode >= 35 && e.keyCode <= 36) return;
    
    // Ensure it's a number
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', handleKeydown);

  return true;
}
