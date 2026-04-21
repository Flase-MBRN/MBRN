export const PILLAR_REGISTRY = Object.freeze([
  {
    id: 'meta_generator',
    label: 'Meta Generator',
    status: 'seed',
    capabilities: ['blueprints', 'content', 'modules', 'assets', 'agent_adapters'],
    serviceContracts: ['generator_outputs']
  },
  {
    id: 'monetization',
    label: 'Monetization',
    status: 'active',
    capabilities: ['pricing', 'plans', 'billing', 'entitlements', 'api_products', 'gates'],
    serviceContracts: ['entitlement_gate']
  },
  {
    id: 'oracle',
    label: 'Oracle',
    status: 'active',
    capabilities: ['browser_read', 'processing', 'fusion', 'signals', 'snapshots', 'backtesting'],
    serviceContracts: ['oracle_snapshot']
  },
  {
    id: 'frontend_os',
    label: 'Frontend OS',
    status: 'active',
    capabilities: ['shell', 'navigation', 'dashboard', 'cards', 'ui_states'],
    serviceContracts: ['surface_entries']
  }
]);

export function getPillarById(pillarId) {
  return PILLAR_REGISTRY.find((pillar) => pillar.id === pillarId) || null;
}
