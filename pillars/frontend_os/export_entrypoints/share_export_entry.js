import { renderShareCardToCanvas } from '../../../shared/ui/helpers/canvas_renderer.js';
import { prepareNumerologyShareExport } from '../../../shared/application/frontend_os/export_runtime.js';

function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (typeof canvas?.toBlob !== 'function') {
      reject(new Error('Canvas blob export is not available'));
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Canvas blob export failed'));
    }, 'image/png');
  });
}

export async function exportCanvasAsset(canvas, { filename, title, text, preferShare = false } = {}) {
  if (!preferShare) {
    downloadCanvas(canvas, filename);
    return 'downloaded';
  }

  try {
    const blob = await canvasToBlob(canvas);
    const supportsFiles =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof File !== 'undefined';

    if (supportsFiles) {
      const file = new File([blob], filename, { type: 'image/png' });
      const canShareFiles = typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });

      if (canShareFiles) {
        await navigator.share({ title, text, files: [file] });
        return 'shared';
      }
    }

    downloadBlob(blob, filename);
    return 'downloaded';
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }

    downloadCanvas(canvas, filename);
    return 'downloaded';
  }
}

export async function exportNumerologyShareCard(currentData) {
  const { cardData, filename, preferShare } = prepareNumerologyShareExport(currentData);
  const canvas = document.createElement('canvas');
  renderShareCardToCanvas(canvas, cardData);
  return exportCanvasAsset(canvas, { filename, preferShare });
}
