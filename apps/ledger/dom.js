export function clear(el) {
  if (typeof el === 'string') {
    const e = document.getElementById(el);
    if (e) e.replaceChildren();
  } else if (el && el.replaceChildren) {
    el.replaceChildren();
  }
}

export function createEl(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.text !== undefined) el.textContent = String(options.text);
  if (options.className) el.className = options.className;
  if (options.id) el.id = options.id;
  if (options.style) Object.assign(el.style, options.style);
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }
  if (options.parent) options.parent.appendChild(el);
  return el;
}
