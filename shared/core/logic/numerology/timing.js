/**
 * /shared/core/logic/numerology/timing.js
 * NUMEROLOGY TIMING — Cycles & Phases
 * 
 * Responsibility: Life cycles, pinnacles, and challenges
 */

import { reducePreserveMaster, reduceForceSingle, digitSum } from './core.js';

/* ─── LIFE CYCLES ───────────────────────────────────────────────────────── */

export function calculateCycles(dateStr) {
  const [d, m, y] = dateStr.split('.').map(Number);
  return { 
    c1: reducePreserveMaster(m), 
    c2: reducePreserveMaster(d), 
    c3: reducePreserveMaster(digitSum(y)) 
  };
}

/* ─── PINNACLES ────────────────────────────────────────────────────────── */

export function calculatePinnacles(dateStr) {
  const [dStr, mStr, yStr] = dateStr.split('.');
  const d = reduceForceSingle(parseInt(dStr, 10));
  const m = reduceForceSingle(parseInt(mStr, 10));
  const y = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  const p1 = reducePreserveMaster(m + d);
  const p2 = reducePreserveMaster(d + y);
  const p3 = reducePreserveMaster(reduceForceSingle(p1) + reduceForceSingle(p2));
  const p4 = reducePreserveMaster(m + y);
  return { p1, p2, p3, p4 };
}

/* ─── CHALLENGES ─────────────────────────────────────────────────────── */

export function calculateChallenges(dateStr) {
  const [dStr, mStr, yStr] = dateStr.split('.');
  const d = reduceForceSingle(parseInt(dStr, 10));
  const m = reduceForceSingle(parseInt(mStr, 10));
  const y = reduceForceSingle(digitSum(parseInt(yStr, 10)));
  const ch1 = Math.abs(m - d);
  const ch2 = Math.abs(d - y);
  return { ch1, ch2, ch3: Math.abs(ch1 - ch2), ch4: Math.abs(m - y) };
}
