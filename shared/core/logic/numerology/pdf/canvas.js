/**
 * /shared/core/logic/numerology/pdf/canvas.js
 * Observatory-style data contract for the viral share card.
 */

const PALETTE = Object.freeze({
  void: '#05050A',
  violet: '#7B5CF5',
  violetSoft: 'rgba(123, 92, 245, 0.24)',
  violetHairline: 'rgba(123, 92, 245, 0.42)',
  white: '#FFFFFF',
  whiteSoft: 'rgba(255, 255, 255, 0.72)',
  whiteMute: 'rgba(255, 255, 255, 0.34)',
  panel: 'rgba(10, 10, 15, 0.82)',
  panelStroke: 'rgba(255, 255, 255, 0.08)',
  arcTrack: 'rgba(255, 255, 255, 0.12)'
});

function formatCoreNumber(value, fallback = '-') {
  return value ?? fallback;
}

export function generateShareCard(data) {
  const score = Number(data?.quantum?.score ?? 0);

  return {
    width: 1080,
    height: 1920,
    palette: PALETTE,
    background: {
      baseColor: PALETTE.void,
      glow: {
        x: 540,
        y: 760,
        innerRadius: 40,
        outerRadius: 660,
        colorInner: 'rgba(123, 92, 245, 0.34)',
        colorMid: 'rgba(123, 92, 245, 0.16)',
        colorOuter: 'rgba(123, 92, 245, 0)'
      },
      vignette: {
        colorInner: 'rgba(5, 5, 10, 0)',
        colorOuter: 'rgba(5, 5, 10, 0.82)'
      }
    },
    frame: {
      x: 52,
      y: 52,
      width: 976,
      height: 1816,
      stroke: PALETTE.panelStroke
    },
    header: {
      eyebrow: 'PATTERN INTELLIGENCE',
      title: 'M B R N',
      x: 540,
      eyebrowY: 118,
      titleY: 188,
      eyebrowFont: '600 22px Inter, sans-serif',
      titleFont: '700 64px Syne, sans-serif',
      eyebrowColor: PALETTE.whiteMute,
      titleColor: PALETTE.white
    },
    name: {
      text: data.meta.name.toUpperCase(),
      x: 540,
      y: 332,
      font: '700 86px Syne, sans-serif',
      color: PALETTE.white,
      glowColor: 'rgba(123, 92, 245, 0.35)',
      glowBlur: 28
    },
    score: {
      value: score,
      arcX: 540,
      arcY: 760,
      arcRadius: 286,
      arcStart: 0.78 * Math.PI,
      arcEnd: 2.22 * Math.PI,
      arcRange: 1.44 * Math.PI,
      trackColor: PALETTE.arcTrack,
      trackWidth: 18,
      accentColor: PALETTE.violet,
      accentGlowColor: 'rgba(123, 92, 245, 0.55)',
      accentWidth: 24,
      tickCount: 28,
      tickColor: PALETTE.whiteMute,
      tickWidth: 2,
      tickLength: 14,
      textX: 540,
      textY: 792,
      textColor: PALETTE.white,
      font: '700 158px Syne, sans-serif',
      textGlowColor: 'rgba(123, 92, 245, 0.42)',
      textGlowBlur: 34,
      label: 'PATTERN SCORE',
      labelX: 540,
      labelY: 868,
      labelFont: '600 26px Inter, sans-serif',
      labelColor: PALETTE.whiteSoft,
      detail: 'OBSERVATORY PROFILE // LIVE SIGNAL',
      detailX: 540,
      detailY: 906,
      detailFont: '500 18px Inter, sans-serif',
      detailColor: PALETTE.whiteMute
    },
    hud: {
      separators: [
        { x1: 160, y1: 434, x2: 920, y2: 434, color: PALETTE.violetSoft, width: 1 },
        { x1: 170, y1: 974, x2: 910, y2: 974, color: PALETTE.violetSoft, width: 1 }
      ],
      corners: [
        { x: 110, y: 110 },
        { x: 970, y: 110 },
        { x: 110, y: 1810 },
        { x: 970, y: 1810 }
      ],
      crosses: [
        { x: 178, y: 1128, size: 10 },
        { x: 902, y: 1128, size: 10 },
        { x: 178, y: 1384, size: 10 },
        { x: 902, y: 1384, size: 10 }
      ]
    },
    coreGrid: {
      x: 108,
      y: 1086,
      width: 864,
      height: 476,
      columns: 2,
      gap: 24
    },
    coreNumbers: [
      {
        label: 'LEBENSZAHL',
        value: formatCoreNumber(data.core.lifePath),
        description: 'Dein Hauptvektor im Feld.',
        x: 108,
        y: 1086,
        width: 420,
        height: 226
      },
      {
        label: 'SEELENZAHL',
        value: formatCoreNumber(data.core.soulUrge),
        description: 'Der innere Antrieb hinter deiner Bewegung.',
        x: 552,
        y: 1086,
        width: 420,
        height: 226
      },
      {
        label: 'AUSDRUCK',
        value: formatCoreNumber(data.core.expression),
        description: 'So wirkt dein Muster im Außen.',
        x: 108,
        y: 1336,
        width: 420,
        height: 226
      },
      {
        label: 'REIFE',
        value: formatCoreNumber(data.additional?.maturity),
        description: 'Worauf dein System langfristig zuläuft.',
        x: 552,
        y: 1336,
        width: 420,
        height: 226
      }
    ],
    footer: {
      text: 'M B R N  —  PATTERN INTELLIGENCE',
      x: 540,
      y: 1768,
      font: '600 22px Inter, sans-serif',
      color: PALETTE.whiteMute
    }
  };
}
