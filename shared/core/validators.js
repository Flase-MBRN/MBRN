/**
 * /shared/core/validators.js
 * INPUT VALIDATION SYSTEM - Zero-Tolerance Validation Engine
 * 
 * Responsibility: All user input validation with structured returns
 * LAW 4 COMPLIANT: Always returns { success: boolean, data?, error? }
 * LAW 8 COMPLIANT: No magic numbers - all thresholds in MBRN_CONFIG
 */

import { MBRN_CONFIG } from './config.js';
import { i18n } from './i18n.js';

// LAW 8: Destructure validation constants for clean usage
const { validation: V } = MBRN_CONFIG;

/**
 * Validates date format DD.MM.YYYY with strict calendar checking
 * Prevents invalid dates like 31.02, 29.02 in non-leap years
 * 
 * @param {string} dateStr - Date string to validate
 * @returns {Object} - { success: boolean, data?: Date, error?: string }
 */
export function validateDateFormat(dateStr) {
  if (typeof dateStr !== 'string') {
    return {
      success: false,
      error: i18n.t('invalidDate')
    };
  }

  // Check format pattern
  const formatMatch = dateStr.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!formatMatch) {
    return {
      success: false,
      error: i18n.t('invalidDate')
    };
  }
  
  const day = parseInt(formatMatch[1], 10);
  const month = parseInt(formatMatch[2], 10);
  const year = parseInt(formatMatch[3], 10);
  
  // Range checks - LAW 8: Use centralized validation constants
  if (month < V.date.MIN_MONTH || month > V.date.MAX_MONTH) {
    return {
      success: false,
      error: `Monat muss zwischen ${String(V.date.MIN_MONTH).padStart(2, '0')} und ${String(V.date.MAX_MONTH).padStart(2, '0')} liegen.`
    };
  }

  if (day < V.date.MIN_DAY || day > V.date.MAX_DAY) {
    return {
      success: false,
      error: `Tag muss zwischen ${String(V.date.MIN_DAY).padStart(2, '0')} und ${String(V.date.MAX_DAY).padStart(2, '0')} liegen.`
    };
  }
  
  // Days per month validation
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Leap year check for February
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const maxDays = month === 2 && isLeapYear ? 29 : daysInMonth[month - 1];
  
  if (day > maxDays) {
    if (month === 2) {
      const yearType = isLeapYear ? 'Schaltjahr' : 'kein Schaltjahr';
      return {
        success: false,
        error: `Februar ${year} hat nur ${maxDays} Tage (${yearType}).`
      };
    }
    return {
      success: false,
      error: `${day}.${month.toString().padStart(2, '0')}.${year} existiert nicht. Dieser Monat hat nur ${maxDays} Tage.`
    };
  }
  
  // Create actual Date object to verify JS doesn't auto-correct
  const testDate = new Date(Date.UTC(year, month - 1, day));
  
  if (testDate.getUTCDate() !== day || 
      testDate.getUTCMonth() !== month - 1 || 
      testDate.getUTCFullYear() !== year) {
    return {
      success: false,
      error: i18n.t('dateNotExist')
    };
  }
  
  return {
    success: true,
    data: testDate
  };
}

/**
 * Validates user name input
 * 
 * @param {string} name - Name to validate
 * @param {Object} options - { minLength: number, maxLength: number }
 * @returns {Object} - { success: boolean, data?: string, error?: string }
 */
export function validateName(name, options = {}) {
  // LAW 8: Use centralized validation constants as defaults
  const minLength = options.minLength ?? V.name.MIN_LENGTH;
  const maxLength = options.maxLength ?? V.name.MAX_LENGTH;
  
  if (!name || typeof name !== 'string') {
    return {
      success: false,
      error: 'Bitte einen Namen eingeben.'
    };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < minLength) {
    return {
      success: false,
      error: `Name muss mindestens ${minLength} Zeichen haben.`
    };
  }

  if (trimmed.length > maxLength) {
    return {
      success: false,
      error: `Name darf maximal ${maxLength} Zeichen haben.`
    };
  }
  
  // Check for only whitespace or special chars
  const lettersOnly = trimmed.replace(/[^a-zA-ZäöüÄÖÜß\s'-]/g, '');
  if (lettersOnly.length < minLength) {
    return {
      success: false,
      error: 'Name muss Buchstaben enthalten.'
    };
  }
  
  return {
    success: true,
    data: trimmed
  };
}

/**
 * Validates email with strict pattern and domain check
 * 
 * @param {string} email - Email to validate
 * @returns {Object} - { success: boolean, data?: string, error?: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      success: false,
      error: i18n.t('invalidEmail')
    };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic format check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return {
      success: false,
      error: 'Ungültiges E-Mail-Format.'
    };
  }
  
  // Domain validation
  const domain = trimmed.split('@')[1];
  const blockedDomains = MBRN_CONFIG.blockedDomains || [
    'test.com', 'fake.com', 'asdf.com',
    'mailinator.com', 'tempmail.com', 'throwaway.email',
    'yopmail.com', 'guerrillamail.com'
  ];
  
  if (blockedDomains.includes(domain)) {
    return {
      success: false,
      error: i18n.t('blockedDomain')
    };
  }
  
  // Suspicious patterns
  const local = trimmed.split('@')[0];
  if (local.length <= 1 || /^\d+$/.test(local)) {
    return {
      success: false,
      error: 'Bitte eine echte E-Mail-Adresse verwenden.'
    };
  }
  
  return {
    success: true,
    data: trimmed
  };
}

/**
 * Validates numeric input with range checking
 * 
 * @param {number|string} num - Number to validate
 * @param {Object} options - { min: number, max: number, allowFloat: boolean }
 * @returns {Object} - { success: boolean, data?: number, error?: string }
 */
export function validateNumber(num, options = {}) {
  const { min, max, allowFloat = true } = options;
  
  // Check if input is a float when floats are not allowed
  if (!allowFloat) {
    const numValue = Number(num);
    if (!Number.isInteger(numValue)) {
      return {
        success: false,
        error: 'Bitte eine ganze Zahl eingeben (keine Dezimalzahlen).'
      };
    }
  }
  
  // Convert string to number
  const parsed = allowFloat ? parseFloat(num) : parseInt(num, 10);
  
  if (Number.isNaN(parsed)) {
    return {
      success: false,
      error: 'Bitte eine gültige Zahl eingeben.'
    };
  }
  
  if (!Number.isFinite(parsed)) {
    return {
      success: false,
      error: 'Zahl ist zu groß oder ungültig.'
    };
  }
  
  if (min !== undefined && parsed < min) {
    return {
      success: false,
      error: `Wert muss mindestens ${min} sein.`
    };
  }
  
  if (max !== undefined && parsed > max) {
    return {
      success: false,
      error: `Wert darf maximal ${max} sein.`
    };
  }
  
  return {
    success: true,
    data: parsed
  };
}

/**
 * Live validation handler for input fields
 * Applies visual feedback (CSS classes) and error messages
 * 
 * @param {HTMLInputElement} input - Input element to validate
 * @param {Function} validator - Validation function to use
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateLive(input, validator, options = {}) {
  const value = input.value;
  const result = validator(value, options);
  
  // Remove previous states
  input.classList.remove('input-valid', 'input-invalid');
  
  // Find or create error element
  let errorEl = input.parentElement.querySelector('.input-error-message');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'input-error-message';
    input.parentElement.appendChild(errorEl);
  }
  
  if (result.success) {
    input.classList.add('input-valid');
    input.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  } else {
    input.classList.add('input-invalid');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = result.error;
    errorEl.classList.remove('hidden');
  }
  
  return result;
}

/**
 * Validates complete form with multiple fields
 * 
 * @param {Object} fields - { fieldName: { element: HTMLElement, validator: Function, options: Object } }
 * @returns {Object} - { success: boolean, data?: Object, errors?: Object }
 */
export function validateForm(fields) {
  const results = {};
  const errors = {};
  let allValid = true;
  
  for (const [name, config] of Object.entries(fields)) {
    const result = validateLive(config.element, config.validator, config.options);
    results[name] = result;
    
    if (!result.success) {
      errors[name] = result.error;
      allValid = false;
    }
  }
  
  if (allValid) {
    return {
      success: true,
      data: Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, v.data])
      )
    };
  }
  
  return {
    success: false,
    errors
  };
}
