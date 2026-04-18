/**
 * /shared/ui/helpers/canvas_renderer.js
 * Observatory share-card renderer for browser canvas export.
 */

const VOID = '#05050A';
const ACCENT = '#7B5CF5';
const WHITE = '#FFFFFF';
const WHITE_SOFT = 'rgba(255, 255, 255, 0.72)';
const WHITE_MUTE = 'rgba(255, 255, 255, 0.34)';
const PANEL = 'rgba(10, 10, 15, 0.82)';
const PANEL_STROKE = 'rgba(255, 255, 255, 0.08)';
const ACCENT_SOFT = 'rgba(123, 92, 245, 0.24)';

function withContext(ctx, callback) {
  ctx.save();
  callback();
  ctx.restore();
}

function drawVoidBackground(ctx, width, height, background) {
  ctx.fillStyle = background.baseColor || VOID;
  ctx.fillRect(0, 0, width, height);

  const glow = background.glow;
  const radial = ctx.createRadialGradient(
    glow.x,
    glow.y,
    glow.innerRadius,
    glow.x,
    glow.y,
    glow.outerRadius
  );
  radial.addColorStop(0, glow.colorInner);
  radial.addColorStop(0.45, glow.colorMid);
  radial.addColorStop(1, glow.colorOuter);
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    200,
    width / 2,
    height / 2,
    width * 0.92
  );
  vignette.addColorStop(0, background.vignette.colorInner);
  vignette.addColorStop(1, background.vignette.colorOuter);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function drawFrame(ctx, frame) {
  withContext(ctx, () => {
    ctx.strokeStyle = frame.stroke || PANEL_STROKE;
    ctx.lineWidth = 1;
    ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
  });
}

function drawHudCorners(ctx, corners) {
  corners.forEach(({ x, y }) => {
    withContext(ctx, () => {
      ctx.strokeStyle = ACCENT_SOFT;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(x - 18, y);
      ctx.lineTo(x + 18, y);
      ctx.moveTo(x, y - 18);
      ctx.lineTo(x, y + 18);
      ctx.stroke();
    });
  });
}

function drawHudCrosses(ctx, crosses) {
  crosses.forEach(({ x, y, size }) => {
    withContext(ctx, () => {
      ctx.strokeStyle = WHITE_MUTE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    });
  });
}

function drawSeparators(ctx, separators) {
  separators.forEach(({ x1, y1, x2, y2, color, width }) => {
    withContext(ctx, () => {
      ctx.strokeStyle = color || ACCENT_SOFT;
      ctx.lineWidth = width || 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  });
}

function drawHeader(ctx, header) {
  withContext(ctx, () => {
    ctx.textAlign = 'center';
    ctx.fillStyle = header.eyebrowColor || WHITE_MUTE;
    ctx.font = header.eyebrowFont;
    ctx.letterSpacing = '0';
    ctx.fillText(header.eyebrow, header.x, header.eyebrowY);

    ctx.fillStyle = header.titleColor || WHITE;
    ctx.font = header.titleFont;
    ctx.shadowColor = 'rgba(123, 92, 245, 0.18)';
    ctx.shadowBlur = 18;
    ctx.fillText(header.title, header.x, header.titleY);
  });
}

function drawName(ctx, name) {
  withContext(ctx, () => {
    ctx.textAlign = 'center';
    ctx.fillStyle = name.color || WHITE;
    ctx.font = name.font;
    ctx.shadowColor = name.glowColor || 'rgba(123, 92, 245, 0.35)';
    ctx.shadowBlur = name.glowBlur || 26;
    ctx.fillText(name.text, name.x, name.y);
  });
}

function drawArcTicks(ctx, score) {
  const angleStep = score.arcRange / (score.tickCount - 1);
  for (let i = 0; i < score.tickCount; i += 1) {
    const angle = score.arcStart + (angleStep * i);
    const innerRadius = score.arcRadius + 26;
    const outerRadius = innerRadius + score.tickLength;
    const x1 = score.arcX + Math.cos(angle) * innerRadius;
    const y1 = score.arcY + Math.sin(angle) * innerRadius;
    const x2 = score.arcX + Math.cos(angle) * outerRadius;
    const y2 = score.arcY + Math.sin(angle) * outerRadius;

    withContext(ctx, () => {
      ctx.strokeStyle = i % 3 === 0 ? score.tickColor : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = score.tickWidth;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }
}

function drawScore(ctx, score) {
  const scoreEnd = score.arcStart + (score.arcRange * (score.value / 100));

  withContext(ctx, () => {
    ctx.strokeStyle = score.trackColor;
    ctx.lineWidth = score.trackWidth;
    ctx.beginPath();
    ctx.arc(score.arcX, score.arcY, score.arcRadius, score.arcStart, score.arcEnd);
    ctx.stroke();
  });

  drawArcTicks(ctx, score);

  withContext(ctx, () => {
    ctx.strokeStyle = score.accentColor;
    ctx.lineWidth = score.accentWidth;
    ctx.shadowColor = score.accentGlowColor;
    ctx.shadowBlur = 36;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(score.arcX, score.arcY, score.arcRadius, score.arcStart, scoreEnd);
    ctx.stroke();
  });

  withContext(ctx, () => {
    ctx.textAlign = 'center';
    ctx.fillStyle = score.textColor || WHITE;
    ctx.font = score.font;
    ctx.shadowColor = score.textGlowColor || 'rgba(123, 92, 245, 0.42)';
    ctx.shadowBlur = score.textGlowBlur || 34;
    ctx.fillText(`${score.value}%`, score.textX, score.textY);

    ctx.shadowBlur = 0;
    ctx.fillStyle = score.labelColor || WHITE_SOFT;
    ctx.font = score.labelFont;
    ctx.fillText(score.label, score.labelX, score.labelY);

    ctx.fillStyle = score.detailColor || WHITE_MUTE;
    ctx.font = score.detailFont;
    ctx.fillText(score.detail, score.detailX, score.detailY);
  });
}

function drawHudPanel(ctx, item) {
  withContext(ctx, () => {
    ctx.fillStyle = PANEL;
    ctx.strokeStyle = PANEL_STROKE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(item.x, item.y, item.width, item.height, 18);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = ACCENT_SOFT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(item.x, item.y + 34);
    ctx.lineTo(item.x + 58, item.y + 34);
    ctx.moveTo(item.x + item.width - 58, item.y + 34);
    ctx.lineTo(item.x + item.width, item.y + 34);
    ctx.stroke();

    const corner = 16;
    ctx.strokeStyle = 'rgba(123, 92, 245, 0.42)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(item.x, item.y + corner);
    ctx.lineTo(item.x, item.y);
    ctx.lineTo(item.x + corner, item.y);
    ctx.moveTo(item.x + item.width - corner, item.y);
    ctx.lineTo(item.x + item.width, item.y);
    ctx.lineTo(item.x + item.width, item.y + corner);
    ctx.moveTo(item.x, item.y + item.height - corner);
    ctx.lineTo(item.x, item.y + item.height);
    ctx.lineTo(item.x + corner, item.y + item.height);
    ctx.moveTo(item.x + item.width - corner, item.y + item.height);
    ctx.lineTo(item.x + item.width, item.y + item.height);
    ctx.lineTo(item.x + item.width, item.y + item.height - corner);
    ctx.stroke();
  });
}

function drawCoreNumbers(ctx, coreNumbers) {
  coreNumbers.forEach((item) => {
    drawHudPanel(ctx, item);

    withContext(ctx, () => {
      ctx.textAlign = 'left';
      ctx.fillStyle = WHITE_MUTE;
      ctx.font = '600 22px Inter, sans-serif';
      ctx.fillText(item.label, item.x + 28, item.y + 62);

      ctx.fillStyle = WHITE;
      ctx.font = '700 98px Syne, sans-serif';
      ctx.shadowColor = 'rgba(123, 92, 245, 0.32)';
      ctx.shadowBlur = 24;
      ctx.fillText(String(item.value), item.x + 28, item.y + 150);

      ctx.shadowBlur = 0;
      ctx.fillStyle = WHITE_SOFT;
      ctx.font = '400 20px Inter, sans-serif';
      ctx.fillText(item.description, item.x + 28, item.y + 192);
    });
  });
}

function drawFooter(ctx, footer) {
  withContext(ctx, () => {
    ctx.textAlign = 'center';
    ctx.fillStyle = footer.color || WHITE_MUTE;
    ctx.font = footer.font;
    ctx.fillText(footer.text, footer.x, footer.y);
  });
}

/**
 * Renders share card data to a canvas element.
 * @param {HTMLCanvasElement} canvas - Pre-created canvas element
 * @param {Object} cardData - Pre-calculated card data from logic layer
 */
export function renderShareCardToCanvas(canvas, cardData) {
  if (!canvas || !cardData) {
    throw new Error('Canvas and cardData are required');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context is required');
  }

  const {
    width,
    height,
    background,
    frame,
    header,
    name,
    score,
    hud,
    coreNumbers,
    footer
  } = cardData;

  canvas.width = width;
  canvas.height = height;

  drawVoidBackground(ctx, width, height, background);
  drawFrame(ctx, frame);
  drawSeparators(ctx, hud.separators);
  drawHudCorners(ctx, hud.corners);
  drawHeader(ctx, header);
  drawName(ctx, name);
  drawScore(ctx, score);
  drawCoreNumbers(ctx, coreNumbers);
  drawHudCrosses(ctx, hud.crosses);
  drawFooter(ctx, footer);
}
