import { state } from '../../core/state/index.js';

export function emitFrontendOsEvent(eventName, payload = {}) {
  state.emit(eventName, payload);
}
