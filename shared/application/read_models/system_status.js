import { supabaseBridge } from '../../../bridges/supabase/index.js';

export async function readSystemHeartbeat() {
  const result = await supabaseBridge.getSystemStatusPing();
  if (!result?.success || !result.data?.last_ping) {
    return { success: false, error: result?.error || 'Offline' };
  }

  return {
    success: true,
    data: {
      lastPing: result.data.last_ping
    }
  };
}

