import { describe, it, expect } from 'vitest';
import { generateAllReadings, generateReading } from '../services/interpretationEngine.js';
import { PALM_RULES, applyRuleOverrides } from '../utils/palmRules.js';
import { RULE_VARIANTS, SUMMARY_LEADS, TIPS, GLOSSARY } from '../data/readingVariety.js';

const line = (extra) => ({ visible: true, visibility: 'clear', confidence: 80, source: 'auto', breaks: 0, ...extra });
const FEATURES = {
  handType: 'right',
  palmShape: { shape: 'square', fingers: 'long', element: 'air', palmRatio: 1.4, fingerRatio: 1.05 },
  lines: {
    life: line({ length: 'long', curvature: 'wide', reachesWrist: true }),
    head: line({ length: 'long', slope: 'gentle', slopeDegrees: 20, curvature: 'gentle', joinedWithLife: true }),
    heart: line({ length: 'medium', curvature: 'curved', endsAt: 'between', risesTowardFingers: true }),
    fate: { visible: false, visibility: 'none', confidence: 0, source: 'auto', breaks: 0, length: 'none' },
  },
  detectionConfidence: { overall: 78, landmarks: 95, quality: 90, lines: { life: 80, head: 80, heart: 80, fate: 0 } },
  manuallyAdjusted: [],
};

describe('interpretation engine', () => {
  it('produces four complete reports', () => {
    const reports = generateAllReadings(FEATURES, { lang: 'en', seed: 'x' });
    expect(reports.map((r) => r.category)).toEqual(['personality', 'love', 'career', 'fortune']);
    for (const r of reports) {
      expect(r.title).toBeTruthy();
      expect(r.summary.length).toBeGreaterThan(40);
      expect(r.details.length).toBeGreaterThan(0);
      expect(r.reflections).toHaveLength(3);
      expect(r.disclaimer).toMatch(/entertainment/i);
    }
  });

  it('never fires rules for a line that was not detected', () => {
    const career = generateReading(FEATURES, 'career', { lang: 'en' });
    expect(career.rulesFired).toContain('c-fate-faint');
    expect(career.rulesFired).not.toContain('c-fate-clear');
    expect(career.rulesFired).not.toContain('c-fate-wrist');
  });

  it('is deterministic for the same seed and renders Khmer', () => {
    const a = generateReading(FEATURES, 'love', { lang: 'km', seed: 'abc' });
    const b = generateReading(FEATURES, 'love', { lang: 'km', seed: 'abc' });
    expect(a).toEqual(b);
    expect(a.summary).toMatch(/[ក-៿]/);
  });

  it('every rule has bilingual heading and text', () => {
    for (const r of PALM_RULES) {
      expect(r.heading.en && r.heading.km && r.text.en && r.text.km, r.id).toBeTruthy();
    }
    expect(new Set(PALM_RULES.map((r) => r.id)).size).toBe(PALM_RULES.length);
  });

  it('applies admin overrides (disable + edit)', () => {
    const rules = applyRuleOverrides(PALM_RULES, { 'l-heart-between': { disabled: true }, 'l-heart-curved': { text: { en: 'Custom text.' } } });
    expect(rules.find((r) => r.id === 'l-heart-between')).toBeUndefined();
    expect(rules.find((r) => r.id === 'l-heart-curved').text.en).toBe('Custom text.');
    expect(rules.find((r) => r.id === 'l-heart-curved').text.km).toBeTruthy();
  });

  it('words repeated scans of the same hand differently', () => {
    const texts = new Set();
    for (let i = 0; i < 12; i++) {
      const r = generateAllReadings(FEATURES, { lang: 'en', seed: `scan-${i}` });
      texts.add(r.map((x) => x.summary + x.details.map((d) => d.text).join('')).join('|'));
    }
    expect(texts.size).toBeGreaterThan(6);
  });

  it('explains Mount of Saturn in plain words', () => {
    const f = { ...FEATURES, lines: { ...FEATURES.lines, heart: { ...FEATURES.lines.heart, endsAt: 'middle' } } };
    for (const lang of ['en', 'km']) {
      const love = generateReading(f, 'love', { lang, seed: 'a' });
      expect(love.glossary.map((g) => g.id)).toContain('saturn');
      expect(love.tips).toHaveLength(2);
    }
  });

  it('every variant, lead, tip and glossary entry is bilingual', () => {
    const ids = new Set(PALM_RULES.map((r) => r.id));
    for (const [id, list] of Object.entries(RULE_VARIANTS)) {
      expect(ids.has(id), id).toBe(true);
      for (const v of list) expect(v.en && v.km, id).toBeTruthy();
    }
    for (const v of [...SUMMARY_LEADS, ...Object.values(TIPS).flat()]) expect(v.en && v.km).toBeTruthy();
    for (const g of GLOSSARY) expect(g.term.en && g.term.km && g.text.en && g.text.km, g.id).toBeTruthy();
  });
});
