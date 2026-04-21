export const API_PRODUCT_CATALOG = Object.freeze([
  {
    id: 'artifact',
    label: 'Artifact Export',
    type: 'workspace',
    provider: 'stripe',
    availability: 'checkout_ready'
  },
  {
    id: 'oracle_snapshot',
    label: 'Oracle Snapshot',
    type: 'oracle',
    provider: 'stripe',
    availability: 'catalog_only'
  },
  {
    id: 'api_access',
    label: 'API Access',
    type: 'api',
    provider: 'stripe',
    availability: 'catalog_only'
  }
]);

export function getApiProductCatalog() {
  return API_PRODUCT_CATALOG;
}

export function getApiProductById(productId) {
  return API_PRODUCT_CATALOG.find((product) => product.id === productId) || null;
}
