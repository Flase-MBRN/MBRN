import { STORAGE_PREFIX, getStorageBackend } from '../storage/index.js';

export function listMBRNKeys() {
  const backend = getStorageBackend();
  if (!backend) {
    return { success: false, error: 'LocalStorage unavailable', data: [] };
  }

  try {
    const keys = [];
    for (let index = 0; index < backend.length; index += 1) {
      const key = backend.key(index);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key);
      }
    }
    return { success: true, data: keys };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}

export function clearMBRNLocalData() {
  const backend = getStorageBackend();
  if (!backend) {
    return { success: false, error: 'LocalStorage unavailable', data: [] };
  }

  const keyResult = listMBRNKeys();
  if (!keyResult.success) {
    return keyResult;
  }

  try {
    keyResult.data.forEach((key) => backend.removeItem(key));
    return { success: true, data: keyResult.data };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}
