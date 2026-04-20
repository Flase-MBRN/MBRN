/**
 * /shared/ui/primitives/input.js
 * Input Primitive Component
 * LAW: No business logic, pure UI primitive
 */

/**
 * Input types
 */
export const INPUT_TYPES = Object.freeze({
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  DATE: 'date',
  TEL: 'tel',
  SEARCH: 'search',
  URL: 'url'
});

/**
 * Create an input element
 * @param {Object} options
 * @param {string} [options.type='text'] - Input type
 * @param {string} [options.placeholder=''] - Placeholder text
 * @param {string} [options.value=''] - Initial value
 * @param {string} [options.name=''] - Input name
 * @param {string} [options.id=''] - Input ID
 * @param {boolean} [options.required=false] - Required attribute
 * @param {boolean} [options.disabled=false] - Disabled state
 * @param {Function} [options.onChange] - Change handler
 * @param {Function} [options.onBlur] - Blur handler
 * @param {HTMLElement} [options.parent] - Parent element
 * @returns {HTMLInputElement}
 */
export function createInput({
  type = INPUT_TYPES.TEXT,
  placeholder = '',
  value = '',
  name = '',
  id = '',
  required = false,
  disabled = false,
  onChange = null,
  onBlur = null,
  parent = null
} = {}) {
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.name = name;
  input.id = id || name;
  input.className = 'input';
  
  if (required) input.required = true;
  if (disabled) input.disabled = true;
  
  // Event handlers
  if (onChange) {
    input.addEventListener('input', onChange);
  }
  if (onBlur) {
    input.addEventListener('blur', onBlur);
  }
  
  // Append to parent
  if (parent) {
    parent.appendChild(input);
  }
  
  return input;
}

/**
 * Create a form group with label and input
 * @param {Object} options
 * @param {string} options.label - Label text
 * @param {string} options.name - Input name
 * @param {string} [options.hint] - Help text
 * @param {HTMLElement} [options.parent] - Parent element
 * @returns {Object} { wrapper, input, label }
 */
export function createFormGroup({
  label,
  name,
  hint = '',
  parent = null,
  inputOptions = {}
} = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  
  // Label
  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  labelEl.htmlFor = name;
  wrapper.appendChild(labelEl);
  
  // Input
  const input = createInput({
    name,
    id: name,
    parent: wrapper,
    ...inputOptions
  });
  
  // Hint text
  if (hint) {
    const hintEl = document.createElement('small');
    hintEl.className = 'form-hint';
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  
  if (parent) {
    parent.appendChild(wrapper);
  }
  
  return { wrapper, input, label: labelEl };
}

/**
 * Create a textarea element
 * @param {Object} options
 * @param {number} [options.rows=3] - Number of rows
 * @param {number} [options.cols] - Number of columns
 * @returns {HTMLTextAreaElement}
 */
export function createTextarea({
  rows = 3,
  cols,
  placeholder = '',
  value = '',
  name = '',
  parent = null
} = {}) {
  const textarea = document.createElement('textarea');
  textarea.rows = rows;
  if (cols) textarea.cols = cols;
  textarea.placeholder = placeholder;
  textarea.value = value;
  textarea.name = name;
  textarea.className = 'textarea';
  
  if (parent) {
    parent.appendChild(textarea);
  }
  
  return textarea;
}

/**
 * Create a select element
 * @param {Object} options
 * @param {Array<{value: string, label: string}>} options.options - Select options
 * @returns {HTMLSelectElement}
 */
export function createSelect({
  options = [],
  name = '',
  value = '',
  parent = null
} = {}) {
  const select = document.createElement('select');
  select.name = name;
  select.className = 'select';
  
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === value) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  
  if (parent) {
    parent.appendChild(select);
  }
  
  return select;
}

export default {
  create: createInput,
  createGroup: createFormGroup,
  createTextarea,
  createSelect,
  TYPES: INPUT_TYPES
};
