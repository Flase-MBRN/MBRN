export function buildAssetSpec({
  id = 'asset',
  kind = 'card',
  theme = 'mbrn',
  dimensions = { width: 1200, height: 630 }
} = {}) {
  return {
    id,
    kind,
    theme,
    dimensions,
    outputFormat: 'png'
  };
}
