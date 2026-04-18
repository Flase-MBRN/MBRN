/**
 * /shared/core/logic/numerology/pdf/report.js
 * PDF REPORT ENGINE — Deep Decode & Operator Reports
 * 
 * Responsibility: jsPDF-based PDF generation for numerology reports
 */

import { OPERATOR_CONFIG, OPERATOR_MATRIX, DEEP_DECODE_MATRIX } from '../metadata.js';
import { reduceForceSingle } from '../core.js';

/* ─── DEEP DECODE REPORT (v2.5) ────────────────────────────────────────── */

function generateSectionContent(data) {
  const lp = data.core.lifePath.split('/')[0];
  const lpNum = parseInt(lp, 10);
  const lpData = DEEP_DECODE_MATRIX.lifePath[lpNum] || DEEP_DECODE_MATRIX.lifePath[9];
  const harmScore = data.quantum.score;
  const hD = DEEP_DECODE_MATRIX.harmony[harmScore >= 80 ? 'excellent' : harmScore >= 45 ? 'good' : 'low'];
  const grid = data.loShu;
  const hasM = ['4','9','2'].every(n => grid.grid[n] > 0);
  const hasE = ['3','5','7'].every(n => grid.grid[n] > 0);
  const hasP = ['8','1','6'].every(n => grid.grid[n] > 0);
  
  const b1 = data.bridges.lifeExpr;
  const b2 = data.bridges.soulPers;
  const matNum = reduceForceSingle(lpNum + reduceForceSingle(data.core.expression.split('/')[0]));

  return [
    { type: 'cover', title: 'DEEP DECODE', subtitle: 'SYSTEM-BLUEPRINT', name: data.meta.name.toUpperCase(), meta: `REF_ID: ${Math.random().toString(16).substr(2, 6).toUpperCase()} // BORN: ${data.meta.date}` },
    
    { 
      type: 'section', title: `SEKTION I: ${lpData.title}`, 
      blocks: [
        { type: 'text', text: lpData.essence },
        { type: 'row', label: 'LEBENSZAHL', val: data.core.lifePath, desc: 'Kern-Mission des Bauplans' },
        { type: 'row', label: 'SEELENZAHL', val: data.core.soulUrge, desc: 'Innere Signal-Stärke' },
        { type: 'row', label: 'AUSDRUCKSZAHL', val: data.core.expression, desc: 'Operatives Potential' },
        { type: 'row', label: 'REIFEZAHL', val: String(matNum), desc: DEEP_DECODE_MATRIX.maturity[matNum] },
        { type: 'text', text: `MISSION: ${lpData.purpose}` }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION II: ENERGIE-HARMONIE', 
      blocks: [
        { type: 'visual', visual: 'scale', score: harmScore, label: hD.title },
        { type: 'text', text: hD.desc },
        { type: 'row', label: 'BRÜCKE 1', val: String(b1), desc: DEEP_DECODE_MATRIX.bridges[b1] },
        { type: 'row', label: 'BRÜCKE 2', val: String(b2), desc: DEEP_DECODE_MATRIX.bridges[b2] },
        { type: 'text', text: hD.warning || hD.action || hD.urgency }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION III: SYSTEM-MUSTER', 
      blocks: [
        { type: 'visual', visual: 'grid', grid: grid.grid },
        { type: 'row', label: 'MENTAL', val: hasM ? 'AKTIV' : 'POTENZIAL-FOKUS', desc: DEEP_DECODE_MATRIX.grid.mental[hasM ? 'present' : 'absent'] },
        { type: 'row', label: 'EMOTIONAL', val: hasE ? 'AKTIV' : 'POTENZIAL-FOKUS', desc: DEEP_DECODE_MATRIX.grid.emotional[hasE ? 'present' : 'absent'] },
        { type: 'row', label: 'PHYSISCH', val: hasP ? 'AKTIV' : 'POTENZIAL-FOKUS', desc: DEEP_DECODE_MATRIX.grid.physical[hasP ? 'present' : 'absent'] }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION IV: ZEIT-ZYKLEN', 
      blocks: [
        { type: 'row', label: 'START (0-28J)', val: data.cycles.c1, desc: `${DEEP_DECODE_MATRIX.cycles.early[data.cycles.c1]?.theme || 'IMPULS'}: ${DEEP_DECODE_MATRIX.cycles.early[data.cycles.c1]?.task || 'Entwicklung der individuellen Kraft.'}` },
        { type: 'row', label: 'EXPANSION (29-56J)', val: data.cycles.c2, desc: `${DEEP_DECODE_MATRIX.cycles.middle[data.cycles.c2]?.theme || 'WIRKUNG'}: ${DEEP_DECODE_MATRIX.cycles.middle[data.cycles.c2]?.task || 'Maximierung des systemischen Einflusses.'}` },
        { type: 'row', label: 'REIFE (57J+)', val: data.cycles.c3, desc: `${DEEP_DECODE_MATRIX.cycles.late[data.cycles.c3]?.theme || 'ERBE'}: ${DEEP_DECODE_MATRIX.cycles.late[data.cycles.c3]?.task || 'Absicherung der lebenslangen Resultate.'}` }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION V: MEILENSTEINE', 
      blocks: [
        { type: 'row', label: 'MEILENSTEIN 1', val: data.pinnacles.p1, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p1]?.desc || 'Fokus auf System-Stabilität.' },
        { type: 'row', label: 'MEILENSTEIN 2', val: data.pinnacles.p2, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p2]?.desc || 'Fokus auf System-Wachstum.' },
        { type: 'row', label: 'MEILENSTEIN 3', val: data.pinnacles.p3, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p3]?.desc || 'Fokus auf System-Tiefe.' },
        { type: 'row', label: 'MEILENSTEIN 4', val: data.pinnacles.p4, desc: DEEP_DECODE_MATRIX.pinnacles[data.pinnacles.p4]?.desc || 'Fokus auf System-Vollendung.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VI: HERAUSFORDERUNGEN', 
      blocks: [
        { type: 'row', label: 'HÜRDE 1', val: data.challenges.ch1, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch1]?.desc || 'Lerne das Gleichgewicht im System zu halten.' },
        { type: 'row', label: 'HÜRDE 2', val: data.challenges.ch2, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch2]?.desc || 'Lerne die operative Klarheit zu wahren.' },
        { type: 'row', label: 'KERN-AUFGABE', val: data.challenges.ch3, desc: DEEP_DECODE_MATRIX.challenges[data.challenges.ch3]?.desc || 'Integriere deinen Bauplan in die Realität.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VII: SYSTEM-UPGRADES', 
      blocks: [
        { type: 'text', text: 'Karmische Signaturen markieren notwendige System-Upgrades für dein volles Potential.' },
        ...data.karma.lessons.map(n => ({ type: 'row', label: `UPGRADE ${n}`, val: DEEP_DECODE_MATRIX.karmic[n]?.lesson || 'KLARHEIT', desc: DEEP_DECODE_MATRIX.karmic[n]?.desc || 'Keine signifikante Lücke detektiert.' })),
        { type: 'row', label: 'KERN-IMPULS', val: data.karma.passion.join(', '), desc: 'Deine dominanteste Schwingungs-Antenne.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION VIII: AUSFÜHRUNGS-PLAN', 
      blocks: [
        { type: 'row', label: 'STRATEGIE', val: lp, desc: DEEP_DECODE_MATRIX.getStrategicTips(lpNum) },
        { type: 'text', text: 'ANWEISUNG 01: Behandle deinen Bauplan als fundamentale Hardware-Konstante.' },
        { type: 'text', text: 'ANWEISUNG 02: Beseitige alle energetischen Dissonanzen durch radikales Handeln.' },
        { type: 'text', text: 'ANWEISUNG 03: Vertraue der Präzision des Systems über externe Meinungen.' }
      ] 
    },
    
    { 
      type: 'section', title: 'SEKTION IX: SYSTEM-AKTIVIERUNG', 
      blocks: [
        { type: 'text', text: 'Wissen ohne Umsetzung ist Entropie. Das Artefakt ist nun vollendet.' },
        { type: 'text', text: 'MBRN HUB — DEEP DECODE // VERSION 2.5\nSTATUS: VOLLSTÄNDIG' },
        { type: 'text', text: 'END OF DECODE.', style: 'technical' }
      ] 
    }
  ];
}

export async function generateDeepReport(data) {
  const { jsPDF } = await import("https://esm.sh/jspdf@latest");
  const doc = new jsPDF('p', 'mm', 'a4');
  const midX = doc.internal.pageSize.getWidth() / 2;
  const pc = [255,255,255], ac = [180,180,180], dc = [100,100,100];

  const drawFrame = (p) => {
    doc.setFillColor(10,10,10); doc.rect(0,0,210,297,'F');
    doc.setDrawColor(...dc); doc.setLineWidth(0.1);
    doc.rect(10,10,190,277); 
    doc.setFontSize(6); doc.setTextColor(...dc);
    doc.text(`MBRN::BLUEPRINT // P${p} // SHA-256:${Math.random().toString(16).substr(2,8)}`, midX, 8, { align: 'center' });
    doc.text('© 2026 MBRN_CORE_REPRODUCTION_PROHIBITED', midX, 292, { align: 'center' });
  };

  const drawGrid = (x, y, grid) => {
    const s = 18; const gX = x - (3*s)/2;
    doc.setDrawColor(...ac); doc.setLineWidth(0.3);
    for(let i=0; i<3; i++) for(let j=0; j<3; j++) doc.rect(gX+j*s, y+i*s, s, s);
    const map = [[4,9,2],[3,5,7],[8,1,6]];
    doc.setFontSize(12);
    map.forEach((row, rIdx) => row.forEach((n, cIdx) => {
      if (grid[n] > 0) {
        doc.setTextColor(...pc); doc.text(String(n), gX+cIdx*s+s/2, y+rIdx*s+s/2+4, { align:'center' });
      }
    }));
    return 3*s + 10;
  };

  const drawScale = (x, y, score) => {
    const w = 120; const sX = x - w/2;
    doc.setDrawColor(...dc); doc.rect(sX, y, w, 6);
    doc.setFillColor(...pc); doc.rect(sX, y, (score/100)*w, 6, 'F');
    doc.setFontSize(9); doc.setTextColor(...ac); doc.text('SYSTEM_SYNC_RESONANCE', midX, y-3, { align:'center' });
    doc.setTextColor(...pc); doc.text(`${score}%`, midX, y+15, { align:'center' });
    return 25;
  };

  const pages = generateSectionContent(data);
  pages.forEach((p, idx) => {
    if (idx > 0) doc.addPage();
    drawFrame(idx + 1);
    
    if (p.type === 'cover') {
      doc.setTextColor(...pc); doc.setFontSize(48); doc.text(p.title, midX, 140, { align: 'center' });
      doc.setFontSize(14); doc.setTextColor(...dc); doc.text(p.subtitle, midX, 150, { align: 'center' });
      doc.setFontSize(26); doc.setTextColor(...pc); doc.text(p.name, midX, 190, { align: 'center' });
    } else {
      let h = 0; h += 20; 
      p.blocks.forEach(b => {
        if (b.type === 'row') h += 25;
        else if (b.type === 'text') h += (b.text.split('\n').length * 7) + 12;
        else if (b.type === 'visual' && b.visual === 'grid') h += 65;
        else if (b.type === 'visual' && b.visual === 'scale') h += 35;
      });

      let y = (297 - h) / 2 + 5; 
      doc.setFontSize(16); doc.setTextColor(...pc); doc.text(p.title, midX, y, { align: 'center' });
      doc.setDrawColor(...dc); doc.line(30, y+3, 180, y+3); y += 18;

      p.blocks.forEach(b => {
        if (b.type === 'row') {
          doc.setFontSize(10); doc.setTextColor(...ac); doc.text(b.label.toUpperCase(), midX, y, { align: 'center' });
          doc.setFontSize(16); doc.setTextColor(...pc); doc.text(String(b.val), midX, y+8, { align: 'center' });
          if(b.desc) { doc.setFontSize(9); doc.setTextColor(...dc); doc.text(b.desc, midX, y+13, { maxWidth:120, align:'center' }); }
          y += 25;
        } else if (b.type === 'text') {
          doc.setFontSize(11); doc.setTextColor(200,200,200); doc.text(b.text, midX, y, { maxWidth:160, align: 'center' });
          y += (b.text.split('\n').length * 7) + 12;
        } else if (b.type === 'visual') {
          if (b.visual === 'grid') { y += drawGrid(midX, y, b.grid); }
          else if (b.visual === 'scale') { y += drawScale(midX, y, b.score); }
        }
      });
    }
  });
  return doc;
}

/* ─── OPERATOR REPORT (Modern Luxury) ────────────────────────────────── */

export async function generateOperatorReport(data) {
  const { jsPDF } = await import("https://esm.sh/jspdf@latest");
  const doc = new jsPDF('p', 'mm', 'a4');
  const cfg = OPERATOR_CONFIG;
  const { bgPrimary, bgSecondary, textPrimary, textSecondary, textMuted, accent, border } = cfg.colors;
  
  const lp = data.core.lifePath.split('/')[0];
  const lpNum = parseInt(lp, 10);
  const lpData = OPERATOR_MATRIX.lifePath[lpNum] || OPERATOR_MATRIX.lifePath[9];
  const harmScore = data.quantum.score;
  const hData = OPERATOR_MATRIX.harmony[harmScore >= 80 ? 'excellent' : harmScore >= 45 ? 'good' : 'low'];
  const grid = data.loShu;
  const hasM = ['4','9','2'].every(n => grid.grid[n] > 0);
  const hasE = ['3','5','7'].every(n => grid.grid[n] > 0);
  const hasP = ['8','1','6'].every(n => grid.grid[n] > 0);
  const matNum = reduceForceSingle(lpNum + reduceForceSingle(data.core.expression.split('/')[0]));
  const refId = `MB-${data.meta.name.substring(0,2).toUpperCase()}-${new Date().getFullYear().toString().substr(2)}${Math.random().toString(16).substr(2,4).toUpperCase()}`;

  const drawFrame = (pageNum) => {
    doc.setFillColor(...bgPrimary);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.rect(15, 15, 180, 267);
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text(`${refId} // P${pageNum}/9`, 105, 12, { align: 'center' });
    doc.text('MBRN // PERSONAL CONFIGURATION', 105, 285, { align: 'center' });
  };

  const drawCard = (x, y, w, h, label, value, desc, highlighted = false) => {
    doc.setFillColor(...bgSecondary);
    doc.rect(x, y, w, h, 'F');
    doc.setFillColor(...(highlighted ? accent : border));
    doc.rect(x, y, 2, h, 'F');
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text(label.toUpperCase(), x + 6, y + 10);
    doc.setFontSize(cfg.typography.sizes.value);
    doc.setTextColor(...textPrimary);
    doc.text(String(value), x + 6, y + 26);
    if (desc) {
      doc.setFontSize(cfg.typography.sizes.body);
      doc.setTextColor(...textMuted);
      doc.text(desc, x + 6, y + 38, { maxWidth: w - 12 });
    }
  };

  const drawArcProgress = (x, y, w, score) => {
    const h = 8;
    const filled = (w * score) / 100;
    doc.setFillColor(...border);
    doc.roundedRect(x - w/2, y, w, h, h/2, h/2, 'F');
    doc.setFillColor(...accent);
    doc.roundedRect(x - w/2, y, filled, h, h/2, h/2, 'F');
    doc.setFontSize(cfg.typography.sizes.value);
    doc.setTextColor(...textPrimary);
    doc.text(`${score}%`, x, y - 8, { align: 'center' });
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text('ABSTIMMUNG', x, y + 20, { align: 'center' });
  };

  const drawGridVisual = (x, y, size, gridData) => {
    const cell = size / 3;
    const map = [[4,9,2],[3,5,7],[8,1,6]];
    doc.setDrawColor(...border);
    doc.setLineWidth(0.5);
    for (let i = 0; i <= 3; i++) {
      doc.line(x, y + i * cell, x + size, y + i * cell);
      doc.line(x + i * cell, y, x + i * cell, y + size);
    }
    doc.setFontSize(10);
    map.forEach((row, r) => row.forEach((n, c) => {
      const active = gridData[n] > 0;
      doc.setTextColor(...(active ? textPrimary : textMuted));
      if (active && gridData[n] > 1) doc.setTextColor(...accent);
      doc.text(String(n), x + c * cell + cell/2, y + r * cell + cell/2 + 3, { align: 'center' });
    }));
  };

  // Page 1: Cover
  drawFrame(1);
  doc.setTextColor(...textPrimary);
  doc.setFontSize(10);
  doc.text('PERSONAL CONFIGURATION', 180, 25, { align: 'right' });
  doc.setFontSize(cfg.typography.sizes.hero);
  doc.text(data.meta.name.toUpperCase(), 25, 130);
  doc.setDrawColor(...accent);
  doc.setLineWidth(2);
  doc.line(25, 138, 100, 138);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text(lpData.title.toUpperCase(), 25, 155);
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textMuted);
  doc.text(`REF: ${refId} // ${data.meta.date}`, 25, 270);

  // Page 2: Die Konfiguration
  doc.addPage();
  drawFrame(2);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('DIE KONFIGURATION', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  doc.setFontSize(64);
  doc.setTextColor(...textPrimary);
  doc.text(lp, 40, 100);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...accent);
  doc.text(lpData.title.toUpperCase(), 40, 115);
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textSecondary);
  doc.text(lpData.essence, 40, 130, { maxWidth: 70 });
  
  drawCard(120, 60, 70, 45, 'Seelenzahl', data.core.soulUrge, 'Innere Signalstärke');
  drawCard(120, 110, 70, 45, 'Ausdruckszahl', data.core.expression, 'Operatives Potential');
  drawCard(120, 160, 70, 45, 'Reifezahl', matNum, `Ziel: ${OPERATOR_MATRIX.lifePath[matNum]?.title || 'Integration'}`, true);
  
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textPrimary);
  doc.text(`MISSION: ${lpData.focus}`, 105, 230, { align: 'center', maxWidth: 160 });

  // Page 3: Energie-Abstimmung
  doc.addPage();
  drawFrame(3);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('ENERGIE-ABSTIMMUNG', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  drawArcProgress(105, 110, 100, harmScore);
  
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...accent);
  doc.text(hData.label.toUpperCase(), 105, 155, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textSecondary);
  doc.text(hData.desc, 105, 170, { align: 'center', maxWidth: 140 });
  doc.setTextColor(...textMuted);
  doc.text(hData.note, 105, 195, { align: 'center', maxWidth: 140 });

  // Page 4: Verhaltens-Matrix
  doc.addPage();
  drawFrame(4);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('VERHALTENS-MATRIX', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  drawGridVisual(30, 60, 70, grid.grid);
  
  const yStart = 60;
  ['mental', 'emotional', 'physical'].forEach((type, i) => {
    const hasIt = type === 'mental' ? hasM : type === 'emotional' ? hasE : hasP;
    const label = type === 'mental' ? 'MENTAL' : type === 'emotional' ? 'EMOTIONAL' : 'PHYSISCH';
    const y = yStart + i * 50;
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text(label, 120, y);
    doc.setFontSize(cfg.typography.sizes.subtitle);
    doc.setTextColor(...(hasIt ? accent : textPrimary));
    doc.text(hasIt ? 'AKTIV' : 'POTENZIAL', 120, y + 12);
    doc.setFontSize(cfg.typography.sizes.body);
    doc.setTextColor(...textMuted);
    doc.text(OPERATOR_MATRIX.grid[type][hasIt ? 'active' : 'potential'], 120, y + 22, { maxWidth: 70 });
  });

  // Page 5: Lebens-Phasen
  doc.addPage();
  drawFrame(5);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('LEBENS-PHASEN', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(70, 40, 140, 40);
  
  const phases = [
    { label: 'START', range: '0-28J', val: data.cycles.c1, period: 'early' },
    { label: 'EXPANSION', range: '29-56J', val: data.cycles.c2, period: 'middle' },
    { label: 'REIFE', range: '57J+', val: data.cycles.c3, period: 'late' }
  ];
  
  phases.forEach((phase, i) => {
    const y = 70 + i * 70;
    const cycleData = OPERATOR_MATRIX.cycles[phase.period][phase.val];
    drawCard(30, y, 150, 55, `${phase.label} (${phase.range})`, phase.val, `${cycleData?.theme || 'Entwicklung'}: ${cycleData?.task || 'Wachstum'}`, i === 1);
  });

  // Page 6: Wendepunkte
  doc.addPage();
  drawFrame(6);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('WENDEPUNKTE', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(70, 40, 140, 40);
  
  const milestones = [
    { label: 'MEILENSTEIN 1', val: data.pinnacles.p1 },
    { label: 'MEILENSTEIN 2', val: data.pinnacles.p2 },
    { label: 'MEILENSTEIN 3', val: data.pinnacles.p3 },
    { label: 'MEILENSTEIN 4', val: data.pinnacles.p4 }
  ];
  
  milestones.forEach((m, i) => {
    const x = 30 + (i % 2) * 85;
    const y = 60 + Math.floor(i / 2) * 90;
    const pData = OPERATOR_MATRIX.pinnacles[m.val];
    drawCard(x, y, 75, 75, m.label, m.val, pData?.title || 'Entwicklung');
  });

  // Page 7: Herausforderungen
  doc.addPage();
  drawFrame(7);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('ENTWICKLUNGSFELDER', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  const challenges = [
    { label: 'FOKUS 1', val: data.challenges.ch1 },
    { label: 'FOKUS 2', val: data.challenges.ch2 },
    { label: 'KERN-AUFGABE', val: data.challenges.ch3 }
  ];
  
  challenges.forEach((c, i) => {
    const cData = OPERATOR_MATRIX.challenges[c.val];
    drawCard(30, 60 + i * 65, 150, 55, c.label, c.val, cData?.desc || 'Integration', i === 2);
  });

  // Page 8: System-Upgrades
  doc.addPage();
  drawFrame(8);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('ENTWICKLUNGS-FOKUS', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(60, 40, 150, 40);
  
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textMuted);
  doc.text('Bereiche mit besonderem Entwicklungspotential:', 105, 55, { align: 'center' });
  
  data.karma.lessons.forEach((n, i) => {
    const y = 75 + i * 35;
    const kData = OPERATOR_MATRIX.karmic[n];
    doc.setFontSize(cfg.typography.sizes.micro);
    doc.setTextColor(...textSecondary);
    doc.text(`ENTWICKLUNGSBEREICH ${n}`, 30, y);
    doc.setFontSize(cfg.typography.sizes.subtitle);
    doc.setTextColor(...accent);
    doc.text(kData?.lesson || 'KLARHEIT', 30, y + 12);
    doc.setFontSize(cfg.typography.sizes.body);
    doc.setTextColor(...textMuted);
    doc.text(kData?.desc || '', 30, y + 22, { maxWidth: 150 });
  });
  
  const passionY = 75 + data.karma.lessons.length * 35 + 15;
  doc.setFontSize(cfg.typography.sizes.micro);
  doc.setTextColor(...textSecondary);
  doc.text('HAUPTANTRIEB', 30, passionY);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textPrimary);
  doc.text(data.karma.passion.join(', '), 30, passionY + 12);

  // Page 9: Aktivierung
  doc.addPage();
  drawFrame(9);
  doc.setFontSize(cfg.typography.sizes.subtitle);
  doc.setTextColor(...textSecondary);
  doc.text('AKTIVIERUNGSPROTOKOLL', 105, 35, { align: 'center' });
  doc.setDrawColor(...accent);
  doc.line(55, 40, 155, 40);
  
  doc.setFontSize(cfg.typography.sizes.micro);
  doc.setTextColor(...textSecondary);
  doc.text('STRATEGIE', 105, 70, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.value);
  doc.setTextColor(...accent);
  doc.text(lp, 105, 90, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textPrimary);
  doc.text(OPERATOR_MATRIX.getStrategy(lpNum), 105, 105, { align: 'center', maxWidth: 140 });
  
  const instructions = [
    'Behandle deine Konfiguration als fundamentale Konstante.',
    'Beseitige energetische Dissonanzen durch konsequentes Handeln.',
    'Vertraue der Präzision des Systems über externe Meinungen.'
  ];
  
  instructions.forEach((inst, i) => {
    doc.setFontSize(cfg.typography.sizes.body);
    doc.setTextColor(...textMuted);
    doc.text(`0${i+1}`, 40, 140 + i * 25);
    doc.setTextColor(...textSecondary);
    doc.text(inst, 55, 140 + i * 25, { maxWidth: 140 });
  });
  
  doc.setFontSize(cfg.typography.sizes.body);
  doc.setTextColor(...textPrimary);
  doc.text('Wissen ohne Umsetzung ist verlorenes Potential.', 105, 230, { align: 'center' });
  doc.setFontSize(cfg.typography.sizes.micro);
  doc.setTextColor(...textMuted);
  doc.text('MBRN // PERSONAL CONFIGURATION // v3.0', 105, 270, { align: 'center' });

  return doc;
}
