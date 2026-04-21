import { renderTeaserCardToCanvas } from '../../../shared/ui/helpers/canvas_renderer.js';
import {
  prepareFinanceStoryExport,
  prepareNumerologyTeaserExport
} from '../../../shared/application/frontend_os/export_runtime.js';
import { exportCanvasAsset } from './share_export_entry.js';

function formatEuro(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

export function exportFinanceStoryAsset(data) {
  const exportData = prepareFinanceStoryExport(data);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  canvas.width = 1080;
  canvas.height = 1920;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#05050A');
  gradient.addColorStop(0.55, '#0A0A0F');
  gradient.addColorStop(1, '#05050A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#F5F5F5';
  ctx.textAlign = 'center';
  ctx.font = '700 64px Segoe UI, Arial, sans-serif';
  ctx.fillText('MBRN', 540, 150);

  ctx.fillStyle = '#7B5CF5';
  ctx.font = '600 46px Segoe UI, Arial, sans-serif';
  ctx.fillText(exportData.title, 540, 235);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '400 30px Segoe UI, Arial, sans-serif';
  ctx.fillText(exportData.subtitle, 540, 315);

  exportData.rows.forEach((card, index) => {
    const y = 520 + (index * 310);

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(120, y, 840, 220, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.58)';
    ctx.textAlign = 'left';
    ctx.font = '500 26px Segoe UI, Arial, sans-serif';
    ctx.fillText(card.label, 170, y + 65);

    ctx.fillStyle = '#F5F5F5';
    ctx.font = '700 56px Segoe UI, Arial, sans-serif';
    ctx.fillText(`${formatEuro(card.value)} EUR`, 170, y + 140);

    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.font = '400 24px Segoe UI, Arial, sans-serif';
    ctx.fillText(card.note, 170, y + 190);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'center';
  ctx.font = '400 24px Segoe UI, Arial, sans-serif';
  ctx.fillText('built to be used', 540, 1770);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = exportData.filename;
  link.click();
}

export async function exportNumerologyTeaserAsset(currentData) {
  const { teaserData, filename, title, text, preferShare } = prepareNumerologyTeaserExport(currentData);
  const canvas = document.createElement('canvas');
  renderTeaserCardToCanvas(canvas, teaserData);
  return exportCanvasAsset(canvas, { filename, title, text, preferShare });
}
