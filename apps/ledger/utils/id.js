let counter = 0;

function getTimestamp() {
  const now = Date.now();
  const r = Math.floor(Math.random() * 1000);
  return `${now}${r}`;
}

export function newId(prefix) {
  counter += 1;
  const ts = getTimestamp();
  return `${prefix}_${ts}_${counter}`;
}
