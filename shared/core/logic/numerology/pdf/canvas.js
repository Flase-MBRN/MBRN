/**
 * /shared/core/logic/numerology/pdf/canvas.js
 * CANVAS DATA GENERATOR — Pure Logic Layer
 * 
 * Responsibility: Calculate canvas rendering parameters
 * LAW 13 COMPLIANT: No DOM access - returns data only
 * UI Layer must use shared/ui/helpers/canvas_renderer.js for actual rendering
 */

/**
 * Generates canvas rendering data structure
 * @param {Object} data - Numerology profile data
 * @returns {Object} - Canvas rendering parameters for UI layer
 */
export function generateShareCard(data) {
  const score = data.quantum.score;
  
  return {
    width: 1080,
    height: 1920,
    background: {
      stops: [
        { position: 0, color: '#000' },
        { position: 0.5, color: '#111' },
        { position: 1, color: '#000' }
      ]
    },
    header: {
      text: 'MBRN HUB — MASTERPLAN',
      x: 540,
      y: 120,
      font: 'bold 40px sans-serif',
      color: '#FFF'
    },
    name: {
      text: data.meta.name,
      x: 540,
      y: 300,
      font: '300 80px sans-serif',
      color: '#FFF'
    },
    score: {
      value: score,
      arcX: 540,
      arcY: 800,
      arcRadius: 300,
      arcStart: 0.8 * Math.PI,
      arcEnd: 2.2 * Math.PI,
      arcRange: 1.4 * Math.PI,
      arcBgColor: '#B7B7B7',
      arcBgWidth: 15,
      arcColor: '#FFF',
      arcWidth: 25,
      textX: 540,
      textY: 850,
      textColor: '#FFF',
      font: 'bold 150px sans-serif',
      label: 'SYSTEM-IMPULS',
      labelX: 540,
      labelY: 930,
      labelFont: '300 40px sans-serif'
    },
    coreNumbers: [
      { label: 'LEBENSZAHL', value: data.core.lifePath, x: 150, y: 1150, labelColor: '#B7B7B7', labelFont: 'bold 30px sans-serif', valueColor: '#FFF', valueFont: 'bold 100px sans-serif' },
      { label: 'SEELENZAHL', value: data.core.soulUrge, x: 580, y: 1150, labelColor: '#B7B7B7', labelFont: 'bold 30px sans-serif', valueColor: '#FFF', valueFont: 'bold 100px sans-serif' },
      { label: 'PERSÖNLICHKEIT', value: data.core.personality, x: 150, y: 1400, labelColor: '#B7B7B7', labelFont: 'bold 30px sans-serif', valueColor: '#FFF', valueFont: 'bold 100px sans-serif' },
      { label: 'AUSDRUCKSZAHL', value: data.core.expression, x: 580, y: 1400, labelColor: '#B7B7B7', labelFont: 'bold 30px sans-serif', valueColor: '#FFF', valueFont: 'bold 100px sans-serif' }
    ],
    footer: {
      text: 'Entschlüssele deinen digitalen Bauplan auf MBRN-HUB.com',
      x: 540,
      y: 1800,
      font: '300 35px sans-serif',
      color: '#D3D3D3'
    }
  };
}
