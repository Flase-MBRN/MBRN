let createClientImpl = () => ({});
let createClientCalls = [];

export function createClient(...args) {
  createClientCalls.push(args);
  return createClientImpl(...args);
}

export function __setCreateClientImpl(fn) {
  createClientImpl = fn;
}

export function __getCreateClientCalls() {
  return [...createClientCalls];
}

export function __resetCreateClientMock() {
  createClientImpl = () => ({});
  createClientCalls = [];
}
