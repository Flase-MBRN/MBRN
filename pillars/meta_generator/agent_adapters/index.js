export function buildAgentAdapterRequest({
  adapter = 'local',
  task = 'generate',
  payload = {}
} = {}) {
  return {
    adapter,
    task,
    payload,
    createdAt: new Date().toISOString()
  };
}
