/**
 * /shared/core/logic/numerology/pdf/canvas.js
 * Daten fuer eine einfache Story-Karte.
 */

export function generateShareCard(data) {
  const score = data.quantum.score;

  return {
    width: 1080,
    height: 1920,
    background: {
      stops: [
        { position: 0, color: '#05050A' },
        { position: 0.55, color: '#0A0A0F' },
        { position: 1, color: '#05050A' }
      ]
    },
    header: {
      text: 'MBRN',
      x: 540,
      y: 120,
      font: '700 56px Syne, sans-serif',
      color: '#F5F5F5'
    },
    name: {
      text: data.meta.name,
      x: 540,
      y: 280,
      font: '400 74px Inter, sans-serif',
      color: '#F5F5F5'
    },
    score: {
      value: score,
      arcX: 540,
      arcY: 770,
      arcRadius: 300,
      arcStart: 0.8 * Math.PI,
      arcEnd: 2.2 * Math.PI,
      arcRange: 1.4 * Math.PI,
      arcBgColor: '#3A3A46',
      arcBgWidth: 15,
      arcColor: '#7B5CF5',
      arcWidth: 25,
      textX: 540,
      textY: 830,
      textColor: '#F5F5F5',
      font: '700 150px Syne, sans-serif',
      label: 'Dein Gesamtbild',
      labelX: 540,
      labelY: 910,
      labelFont: '400 40px Inter, sans-serif'
    },
    coreNumbers: [
      { label: 'LEBENSZAHL', value: data.core.lifePath, x: 150, y: 1150, labelColor: '#A9A9B3', labelFont: '600 28px Inter, sans-serif', valueColor: '#F5F5F5', valueFont: '700 92px Syne, sans-serif' },
      { label: 'SEELENZAHL', value: data.core.soulUrge, x: 580, y: 1150, labelColor: '#A9A9B3', labelFont: '600 28px Inter, sans-serif', valueColor: '#F5F5F5', valueFont: '700 92px Syne, sans-serif' },
      { label: 'AUSDRUCK', value: data.core.expression, x: 150, y: 1400, labelColor: '#A9A9B3', labelFont: '600 28px Inter, sans-serif', valueColor: '#F5F5F5', valueFont: '700 92px Syne, sans-serif' },
      { label: 'REIFE', value: data.additional?.maturity || '-', x: 580, y: 1400, labelColor: '#A9A9B3', labelFont: '600 28px Inter, sans-serif', valueColor: '#F5F5F5', valueFont: '700 92px Syne, sans-serif' }
    ],
    footer: {
      text: 'built to be used',
      x: 540,
      y: 1780,
      font: '400 35px Inter, sans-serif',
      color: '#A9A9B3'
    }
  };
}
