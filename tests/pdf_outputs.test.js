import { jest } from '@jest/globals';
import { generateShareCard, generateTeaserAsset } from '../shared/core/logic/numerology/pdf/canvas.js';
import { __resetJsPDFMock, __setJsPDFImpl } from './mocks/jspdf-esm.js';

const fakeDocs = [];

class FakeJsPDF {
  constructor() {
    this.internal = {
      pageSize: {
        getWidth: () => 210
      }
    };
    this.pages = 1;
    this.savedAs = null;
    this.calls = [];
    fakeDocs.push(this);
  }

  addPage() { this.pages += 1; }
  save(filename) { this.savedAs = filename; }
  setFillColor(...args) { this.calls.push(['setFillColor', ...args]); }
  rect(...args) { this.calls.push(['rect', ...args]); }
  setDrawColor(...args) { this.calls.push(['setDrawColor', ...args]); }
  setLineWidth(...args) { this.calls.push(['setLineWidth', ...args]); }
  setFontSize(...args) { this.calls.push(['setFontSize', ...args]); }
  setTextColor(...args) { this.calls.push(['setTextColor', ...args]); }
  text(...args) { this.calls.push(['text', ...args]); }
  line(...args) { this.calls.push(['line', ...args]); }
  setFont(...args) { this.calls.push(['setFont', ...args]); }
  setGState(...args) { this.calls.push(['setGState', ...args]); }
  roundedRect(...args) { this.calls.push(['roundedRect', ...args]); }
  circle(...args) { this.calls.push(['circle', ...args]); }
}

const { generateDeepReport, generateOperatorReport } = await import('../shared/core/logic/numerology/pdf/report.js');

function createProfile(overrides = {}) {
  return {
    meta: { name: 'Erik Klauss', date: '11.12.2005', ...overrides.meta },
    core: {
      lifePath: '1',
      soulUrge: '9',
      personality: '9',
      expression: '9',
      ...overrides.core
    },
    quantum: { score: 88, ...overrides.quantum },
    loShu: { grid: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 }, ...overrides.loShu },
    cycles: { c1: 1, c2: 2, c3: 3, ...overrides.cycles },
    pinnacles: { p1: 1, p2: 2, p3: 3, p4: 4, ...overrides.pinnacles },
    challenges: { ch1: 1, ch2: 2, ch3: 3, ch4: 4, ...overrides.challenges },
    karma: { lessons: [13, 14], passion: [1], ...overrides.karma },
    bridges: { lifeExpr: 2, soulPers: 4, ...overrides.bridges },
    additional: { maturity: '2', ...overrides.additional }
  };
}

describe('pdf/canvas + report outputs', () => {
  beforeEach(() => {
    fakeDocs.length = 0;
    __resetJsPDFMock();
    __setJsPDFImpl(FakeJsPDF);
  });

  test('generateShareCard returns a shareable structured canvas payload', () => {
    const card = generateShareCard(createProfile());

    expect(card).toEqual(expect.objectContaining({
      width: 1080,
      height: 1920,
      palette: expect.objectContaining({ void: '#05050A', violet: '#7B5CF5' }),
      header: expect.objectContaining({ title: 'M B R N' }),
      name: expect.objectContaining({ text: 'ERIK KLAUSS' }),
      score: expect.objectContaining({ value: 88 }),
      footer: expect.objectContaining({ text: 'M B R N  —  PATTERN INTELLIGENCE' })
    }));
    expect(card.coreNumbers).toHaveLength(4);
    expect(card.name.font).toContain('Syne');
    expect(card.score.font).toContain('Syne');
  });

  test('generateShareCard falls back to "-" when maturity is missing', () => {
    const card = generateShareCard(createProfile({
      additional: { maturity: undefined }
    }));

    expect(card.coreNumbers[3]).toEqual(expect.objectContaining({
      label: 'REIFE',
      value: '-'
    }));
  });

  test('generateTeaserAsset returns a reduced mystery-teaser payload', () => {
    const card = generateTeaserAsset(createProfile({
      meta: { name: 'Erik Klauss' },
      quantum: { score: 91 }
    }));

    expect(card).toEqual(expect.objectContaining({
      width: 1080,
      height: 1920,
      header: expect.objectContaining({ text: 'PATTERN SIGNAL DETECTED' }),
      name: expect.objectContaining({ text: 'ERIK' }),
      score: expect.objectContaining({ value: 91 }),
      hook: expect.objectContaining({
        primary: 'What is your pattern?',
        secondary: 'Calculate yours at MBRN'
      }),
      footer: expect.objectContaining({ text: 'M B R N  —  PATTERN INTELLIGENCE' })
    }));
    expect(card.name.font).toContain('Syne');
    expect(card.score.font).toContain('Syne');
  });

  test('generateDeepReport builds a jsPDF document with multiple pages', async () => {
    const doc = await generateDeepReport(createProfile());

    expect(doc).toBe(fakeDocs[0]);
    expect(fakeDocs[0].pages).toBeGreaterThan(1);
    expect(fakeDocs[0].calls.some(([name]) => name === 'text')).toBe(true);
    expect(fakeDocs[0].calls.some(([name]) => name === 'rect')).toBe(true);
  });

  test('generateDeepReport tolerates low-score and sparse fallback content', async () => {
    const doc = await generateDeepReport(createProfile({
      core: { lifePath: '99/9', expression: '99/9' },
      quantum: { score: 20 },
      loShu: { grid: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 } },
      cycles: { c1: 99, c2: 99, c3: 99 },
      pinnacles: { p1: 99, p2: 99, p3: 99, p4: 99 },
      challenges: { ch1: 99, ch2: 99, ch3: 99, ch4: 99 },
      karma: { lessons: [99], passion: [7, 9] }
    }));

    expect(doc).toBe(fakeDocs[0]);
    expect(fakeDocs[0].pages).toBeGreaterThan(1);
    expect(fakeDocs[0].calls.some(([name, text]) => name === 'text' && String(text).includes('Priorit'))).toBe(true);
  });

  test('generateOperatorReport builds a jsPDF document and tolerates metadata fallbacks', async () => {
    const doc = await generateOperatorReport(createProfile({
      karma: { lessons: [], passion: [1] },
      challenges: { ch1: 0, ch2: 0, ch3: 0, ch4: 0 }
    }));

    expect(doc).toBe(fakeDocs[0]);
    expect(fakeDocs[0].pages).toBeGreaterThan(1);
    expect(fakeDocs[0].calls.some(([name]) => name === 'roundedRect' || name === 'rect')).toBe(true);
  });

  test('generateOperatorReport covers good-score and unknown metadata fallbacks', async () => {
    const doc = await generateOperatorReport(createProfile({
      quantum: { score: 60 },
      loShu: { grid: { 1: 2, 2: 0, 3: 1, 4: 0, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 } },
      cycles: { c1: 99, c2: 99, c3: 99 },
      pinnacles: { p1: 99, p2: 99, p3: 99, p4: 99 },
      challenges: { ch1: 99, ch2: 99, ch3: 99, ch4: 99 },
      karma: { lessons: [99], passion: [8, 1] }
    }));

    expect(doc).toBe(fakeDocs[0]);
    expect(fakeDocs[0].pages).toBeGreaterThan(1);
    expect(fakeDocs[0].calls.some(([name, text]) => name === 'text' && String(text).includes('KLARHEIT'))).toBe(true);
    expect(fakeDocs[0].calls.some(([name, text]) => name === 'text' && String(text).includes('AKTIV'))).toBe(true);
  });
});
