let state = {
  route: window.location.hash.slice(1) || 'home'
};

const listeners = [];

export function getState() {
  return { ...state };
}

export function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach(fn => fn(state));
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx > -1) listeners.splice(idx, 1);
  };
}
