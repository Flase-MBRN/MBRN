export const API_PRODUCT_CATALOG = Object.freeze([
  {
    id: 'artifact',
    label: 'Artifact Export',
    type: 'workspace',
    provider: 'stripe',
    availability: 'checkout_ready',
    grantsPlanId: 'pro'
  },
  {
    id: 'business',
    label: 'Business Bundle',
    type: 'bundle',
    provider: 'stripe',
    availability: 'checkout_ready',
    grantsPlanId: 'business'
  },
  {
    id: 'oracle_snapshot',
    label: 'Oracle Snapshot',
    type: 'oracle',
    provider: null,
    availability: 'catalog_only',
    grantsPlanId: null,
    bundlePlanId: 'business'
  },
  {
    id: 'api_access',
    label: 'API Access',
    type: 'api',
    provider: null,
    availability: 'catalog_only',
    grantsPlanId: null,
    bundlePlanId: 'business'
  }
]);

export function getApiProductCatalog() {
  return API_PRODUCT_CATALOG;
}

export function getApiProductById(productId) {
  return API_PRODUCT_CATALOG.find((product) => product.id === productId) || null;
}
