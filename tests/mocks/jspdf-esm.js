let jsPDFImpl = null;

export function jsPDF(...args) {
  if (!jsPDFImpl) {
    throw new Error('jsPDF mock implementation not configured');
  }

  return new jsPDFImpl(...args);
}

export function __setJsPDFImpl(impl) {
  jsPDFImpl = impl;
}

export function __resetJsPDFMock() {
  jsPDFImpl = null;
}
