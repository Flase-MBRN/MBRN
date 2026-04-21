import {
  buildNumerologyImageFilename,
  prepareNumerologyPdfExport,
  prepareNumerologyShareCard,
  prepareNumerologyTeaserAsset
} from './numerology_runtime.js';
import { buildExportAssetPreset } from '../../../pillars/meta_generator/assets/index.js';
import { buildExportCopyBundle } from '../../../pillars/meta_generator/content/index.js';

export function buildFinanceStoryCardRows(data) {
  return [
    {
      label: 'Am Ende',
      value: data.finalBalance,
      note: 'Dein komplettes Geld am Ende der Laufzeit.'
    },
    {
      label: 'Reiner Gewinn',
      value: data.totalInterest,
      note: 'Das hat dein Geld ganz von alleine fuer dich verdient.'
    },
    {
      label: 'Eingezahlt',
      value: data.totalInvested,
      note: 'Das ist der Betrag, den du aus eigener Tasche gespart hast.'
    }
  ];
}

export function prepareFinanceStoryExport(data) {
  const copy = buildExportCopyBundle('asset_export');
  const preset = buildExportAssetPreset('asset_export', { surfaceId: 'finance' });
  return {
    title: copy.title,
    subtitle: copy.subtitle,
    filename: 'MBRN_Wachstum.png',
    assetPreset: preset,
    rows: buildFinanceStoryCardRows(data)
  };
}

export function prepareNumerologyShareExport(currentData) {
  const { profile, cardData } = prepareNumerologyShareCard(currentData);
  const copy = buildExportCopyBundle('share_export');
  const preset = buildExportAssetPreset('share_export', { surfaceId: 'numerology' });
  return {
    profile,
    cardData,
    title: copy.title,
    text: copy.subtitle,
    assetPreset: preset,
    filename: buildNumerologyImageFilename('MBRN_Muster_Details', profile),
    preferShare: preset.preferShare
  };
}

export function prepareNumerologyTeaserExport(currentData) {
  const { profile, teaserData } = prepareNumerologyTeaserAsset(currentData);
  const copy = buildExportCopyBundle('asset_export');
  const preset = buildExportAssetPreset('asset_export', { surfaceId: 'numerology' });
  return {
    profile,
    teaserData,
    assetPreset: preset,
    filename: buildNumerologyImageFilename('MBRN_Story_Score', profile),
    title: copy.title,
    text: copy.subtitle,
    preferShare: true
  };
}

export function prepareNumerologyPdfSurfaceExport(currentData) {
  const { profile, documentPromise } = prepareNumerologyPdfExport(currentData);
  const preset = buildExportAssetPreset('pdf_export', { surfaceId: 'numerology' });
  return {
    profile,
    documentPromise,
    assetPreset: preset,
    filename: `MBRN_Muster_${String(profile?.meta?.name || 'Operator').replace(/\s+/g, '_')}.pdf`
  };
}
