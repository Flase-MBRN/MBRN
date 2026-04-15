/**
 * /shared/core/logic/numerology/matrix.js
 * NUMEROLOGY MATRIX — Grid & Pattern Analysis
 * 
 * Responsibility: Lo-Shu Grid, Quantum Score, Karma calculations
 */

import { reduceForceSingle } from './core.js';

/* ─── LO-SHU GRID ───────────────────────────────────────────────────────── */

export function calculateLoShu(dateStr) {
  const digits = dateStr.replace(/\D/g, '').split('').map(Number);
  const freq = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
  digits.forEach(d => { if (d > 0) freq[d]++; });
  const activeLines = [
    { nums: [4,9,2], label: 'Mental' },
    { nums: [3,5,7], label: 'Emotional' },
    { nums: [8,1,6], label: 'Physisch' },
    { nums: [4,3,8], label: 'Gedanken' },
    { nums: [9,5,1], label: 'Wille' },
    { nums: [2,7,6], label: 'Handlung' },
    { nums: [4,5,6], label: 'Resonanz-↗' },
    { nums: [2,5,8], label: 'Resonanz-↘' }
  ].filter(l => l.nums.every(n => freq[n] > 0)).map(l => l.label);
  return { grid: freq, activeLines };
}

/* ─── QUANTUM SCORE ────────────────────────────────────────────────────── */

export function calculateQuantumScore(lifeRaw, soulRaw, exprRaw) {
  const v1 = reduceForceSingle(lifeRaw);
  const v2 = reduceForceSingle(soulRaw);
  const v3 = reduceForceSingle(exprRaw);
  const values = [v1, v2, v3];
  const avg = values.reduce((a, b) => a + b, 0) / 3;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / 3;
  const spread = Math.max(...values) - Math.min(...values);
  const final = Math.max(0, Math.min(100, 100 - (variance * 4) - (spread * 2)));
  return { 
    score: Math.round(final * 10) / 10, 
    interpretation: final >= 80 ? 'Hohe Klarheit' : final >= 45 ? 'Gute Balance' : 'Herausforderung' 
  };
}

/* ─── KARMA & BRIDGES ──────────────────────────────────────────────────── */

export function calculateKarma(name, nameToNumbersFn) {
  const nums = nameToNumbersFn(name);
  const lessons = [1,2,3,4,5,6,7,8,9].filter(n => !new Set(nums).has(n));
  const counts = {};
  nums.forEach(n => counts[n] = (counts[n] || 0) + 1);
  const max = Math.max(...Object.values(counts));
  const passion = Object.keys(counts).filter(k => counts[k] === max).map(Number);
  return { lessons, passion };
}

export function calculateBridges(lifeRaw, soulRaw, exprRaw, persRaw, reduceForceSingleFn) {
  return {
    lifeExpr: Math.abs(reduceForceSingleFn(lifeRaw) - reduceForceSingleFn(exprRaw)),
    soulPers: Math.abs(reduceForceSingleFn(soulRaw) - reduceForceSingleFn(persRaw))
  };
}
