import { prepareNumerologyPdfSurfaceExport } from '../../../shared/application/frontend_os/export_runtime.js';

export async function exportNumerologyPdf(currentData) {
  const { documentPromise, filename } = prepareNumerologyPdfSurfaceExport(currentData);
  const doc = await documentPromise;
  doc.save(filename);
  return { success: true, filename };
}
