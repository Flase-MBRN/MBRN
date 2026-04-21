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

export function buildExportAssetPreset(exportId, context = {}) {
  const surfaceId = context.surfaceId || 'generic';

  if (exportId === 'share_export') {
    return {
      id: `${surfaceId}_share_card`,
      kind: 'share_card',
      theme: 'mbrn',
      dimensions: { width: 1200, height: 630 },
      outputFormat: 'png',
      preferShare: true
    };
  }

  if (exportId === 'pdf_export') {
    return {
      id: `${surfaceId}_pdf_report`,
      kind: 'pdf_report',
      theme: 'mbrn',
      dimensions: null,
      outputFormat: 'pdf',
      preferShare: false
    };
  }

  return {
    id: `${surfaceId}_asset`,
    kind: 'story_asset',
    theme: 'mbrn',
    dimensions: { width: 1080, height: 1920 },
    outputFormat: 'png',
    preferShare: false
  };
}
