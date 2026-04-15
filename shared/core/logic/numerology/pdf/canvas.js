/**
 * /shared/core/logic/numerology/pdf/canvas.js
 * CANVAS GENERATOR — Share Card Creation
 * 
 * Responsibility: Browser-only Canvas API for viral share cards
 */

/**
 * Generates a shareable canvas card for social media (9:16 format)
 * @param {Object} data - Numerology profile data
 * @returns {HTMLCanvasElement} - Canvas element (1080x1920)
 */
export function generateShareCard(data) {
  if (typeof document === 'undefined') {
    throw new Error('generateShareCard is browser-only');
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 1080; 
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1920);
  grad.addColorStop(0, '#000');
  grad.addColorStop(0.5, '#111');
  grad.addColorStop(1, '#000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);
  
  // Header
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('MBRN HUB — MASTERPLAN', 540, 120);
  
  // Name
  ctx.font = '300 80px sans-serif';
  ctx.fillText(data.meta.name.toUpperCase(), 540, 300);
  
  // Score arc visualization
  const score = data.quantum.score;
  ctx.strokeStyle = '#B7B7B7';
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.arc(540, 800, 300, 0.8 * Math.PI, 2.2 * Math.PI);
  ctx.stroke();
  
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 25;
  const end = 0.8 * Math.PI + (1.4 * Math.PI * (score / 100));
  ctx.beginPath();
  ctx.arc(540, 800, 300, 0.8 * Math.PI, end);
  ctx.stroke();
  
  // Score text
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 150px sans-serif';
  ctx.fillText(`${score}%`, 540, 850);
  ctx.font = '300 40px sans-serif';
  ctx.fillText('SYSTEM-IMPULS', 540, 930);
  
  // Core numbers grid
  const core = [
    { label: 'LEBENSZAHL', val: data.core.lifePath },
    { label: 'SEELENZAHL', val: data.core.soulUrge },
    { label: 'PERSÖNLICHKEIT', val: data.core.personality },
    { label: 'AUSDRUCKSZAHL', val: data.core.expression }
  ];
  
  ctx.textAlign = 'left';
  core.forEach((c, i) => {
    const x = i % 2 === 0 ? 150 : 580;
    const y = 1150 + Math.floor(i / 2) * 250;
    ctx.fillStyle = '#B7B7B7';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(c.label, x, y);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 100px sans-serif';
    ctx.fillText(String(c.val), x, y + 100);
  });
  
  // Footer
  ctx.fillStyle = '#D3D3D3';
  ctx.textAlign = 'center';
  ctx.font = '300 35px sans-serif';
  ctx.fillText('Entschlüssele deinen digitalen Bauplan auf MBRN-HUB.com', 540, 1800);
  
  return canvas;
}
