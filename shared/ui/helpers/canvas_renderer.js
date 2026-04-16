/**
 * /shared/ui/helpers/canvas_renderer.js
 * CANVAS RENDERER — UI Layer Canvas Drawing
 * 
 * Responsibility: Browser-only Canvas API rendering
 * LAW 13 COMPLIANT: DOM access isolated in UI layer
 */

/**
 * Renders share card data to a canvas element
 * @param {HTMLCanvasElement} canvas - Pre-created canvas element
 * @param {Object} cardData - Pre-calculated card data from logic layer
 */
export function renderShareCardToCanvas(canvas, cardData) {
  if (!canvas || !cardData) {
    throw new Error('Canvas and cardData are required');
  }
  
  const ctx = canvas.getContext('2d');
  const { width, height, background, header, name, score, coreNumbers, footer } = cardData;
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  background.stops.forEach(stop => {
    grad.addColorStop(stop.position, stop.color);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  
  // Header
  ctx.fillStyle = header.color;
  ctx.textAlign = 'center';
  ctx.font = header.font;
  ctx.fillText(header.text, header.x, header.y);
  
  // Name
  ctx.font = name.font;
  ctx.fillText(name.text.toUpperCase(), name.x, name.y);
  
  // Score arc visualization (background arc)
  ctx.strokeStyle = score.arcBgColor;
  ctx.lineWidth = score.arcBgWidth;
  ctx.beginPath();
  ctx.arc(score.arcX, score.arcY, score.arcRadius, score.arcStart, score.arcEnd);
  ctx.stroke();
  
  // Score arc (progress arc)
  ctx.strokeStyle = score.arcColor;
  ctx.lineWidth = score.arcWidth;
  const scoreEnd = score.arcStart + (score.arcRange * (score.value / 100));
  ctx.beginPath();
  ctx.arc(score.arcX, score.arcY, score.arcRadius, score.arcStart, scoreEnd);
  ctx.stroke();
  
  // Score text
  ctx.fillStyle = score.textColor;
  ctx.font = score.font;
  ctx.fillText(`${score.value}%`, score.textX, score.textY);
  ctx.font = score.labelFont;
  ctx.fillText(score.label, score.labelX, score.labelY);
  
  // Core numbers grid
  ctx.textAlign = 'left';
  coreNumbers.forEach((item, i) => {
    const x = item.x;
    const y = item.y;
    
    ctx.fillStyle = item.labelColor;
    ctx.font = item.labelFont;
    ctx.fillText(item.label, x, y);
    
    ctx.fillStyle = item.valueColor;
    ctx.font = item.valueFont;
    ctx.fillText(String(item.value), x, y + 100);
  });
  
  // Footer
  ctx.fillStyle = footer.color;
  ctx.textAlign = 'center';
  ctx.font = footer.font;
  ctx.fillText(footer.text, footer.x, footer.y);
}
