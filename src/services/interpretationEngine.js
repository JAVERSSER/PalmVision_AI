// Rule-based palmistry interpretation engine (works fully offline).
//
// Input:  structured features from palmAnalysis.extractFeatures()
// Output: one report per category. Reports are deterministic for a given
//         feature set + seed, so a saved scan always re-renders identically
//         in either language.
//
// An optional LLM step (see enhanceWithLLM) may rewrite the *rule output*
// into more natural prose; it is never given the image and never adds facts.

import { PALM_RULES, ELEMENT_THEMES, applyRuleOverrides } from '../utils/palmRules.js';
import { CATEGORIES, CATEGORY_META, LINE_NAMES, VALUE_LABELS, REFLECTIONS, DISCLAIMER } from '../data/readingData.js';
import { RULE_VARIANTS, SUMMARY_LEADS, TIPS, GLOSSARY } from '../data/readingVariety.js';

const pick = (obj, lang) => (obj ? obj[lang] ?? obj.en : '');

function hashSeed(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function seededOrder(arr, seed) {
  let s = seed || 1;
  const rand = () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296;
  return arr.map((v) => [rand(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

/** Picks one item from `arr`, chosen by the seed (same seed → same pick). */
const pickSeeded = (arr, seedStr) => seededOrder(arr, hashSeed(seedStr))[0];

const fmt = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));

const T = {
  confidence: { en: '{c}% visual confidence', km: 'ភាពជឿជាក់ផ្នែករូបភាព {c}%' },
  manual: { en: 'adjusted by you', km: 'កែតម្រូវដោយអ្នក' },
  breaks: { en: '{n} gap(s) in the crease', km: 'ចន្លោះដាច់ {n} កន្លែង' },
  notDetected: { en: 'Not clearly detected in this image', km: 'រកមិនឃើញច្បាស់ក្នុងរូបភាពនេះ' },
  shape: { en: '{shape}, {fingers} — palm ratio {pr}, finger ratio {fr}', km: '{shape}, {fingers} — សមាមាត្របាតដៃ {pr}, សមាមាត្រម្រាមដៃ {fr}' },
  palmShape: { en: 'Palm shape', km: 'រាងបាតដៃ' },
  hand: { left: { en: 'left', km: 'ឆ្វេង' }, right: { en: 'right', km: 'ស្តាំ' } },
  lowConfidence: {
    en: 'Some lines used in this reading had low visual confidence. Consider adjusting them in the analysis view or rescanning in brighter light.',
    km: 'ខ្សែមួយចំនួនដែលប្រើក្នុងការអាននេះមានភាពជឿជាក់ផ្នែករូបភាពទាប។ សូមពិចារណាកែតម្រូវវានៅក្នុងទិដ្ឋភាពវិភាគ ឬស្កេនម្តងទៀតក្នុងពន្លឺភ្លឺជាងនេះ។',
  },
  noRules: {
    en: 'The lines this reading relies on were not detected clearly enough to interpret. You can mark them manually in the analysis view.',
    km: 'ខ្សែដែលការអាននេះពឹងផ្អែកលើ មិនត្រូវបានរកឃើញច្បាស់គ្រប់គ្រាន់ដើម្បីបកស្រាយទេ។ អ្នកអាចសម្គាល់វាដោយដៃនៅក្នុងទិដ្ឋភាពវិភាគ។',
  },
  obs: {
    element: {
      en: 'Your palm measures {pr}× as long as it is wide, with a middle finger {fr}× the palm length — the "{element}" group in the traditional four-element system.',
      km: 'បាតដៃរបស់អ្នកមានប្រវែង {pr}ដង នៃទទឹង ហើយម្រាមកណ្តាលមានប្រវែង {fr}ដង នៃប្រវែងបាតដៃ — ក្រុម "{element}" ក្នុងប្រព័ន្ធធាតុទាំងបួនតាមប្រពៃណី។',
    },
    strongest: {
      en: 'The most distinct crease on your palm was the {line} ({c}% visual confidence).',
      km: 'ស្នាមជ្រួញដែលច្បាស់ជាងគេនៅលើបាតដៃរបស់អ្នកគឺ{line} (ភាពជឿជាក់ផ្នែករូបភាព {c}%)។',
    },
    noFate: {
      en: 'No clear fate line was found. Palmists note that a large share of palms show only a faint fate line or none at all.',
      km: 'រកមិនឃើញខ្សែវាសនាច្បាស់ទេ។ ហោរាបាតដៃកត់សម្គាល់ថា បាតដៃមួយចំនួនធំបង្ហាញខ្សែវាសនាស្រាល ឬគ្មានសោះ។',
    },
    joined: {
      en: 'Your head and life lines appear to start from the same point near the thumb.',
      km: 'ខ្សែប្រាជ្ញា និងខ្សែជីវិតរបស់អ្នកហាក់ដូចជាចាប់ផ្តើមពីចំណុចតែមួយជិតមេដៃ។',
    },
    breaks: {
      en: 'The {line} shows {n} gap(s) where the crease fades and resumes.',
      km: '{line}បង្ហាញចន្លោះដាច់ {n} កន្លែង ដែលស្នាមជ្រួញរសាត់ ហើយបន្តម្តងទៀត។',
    },
    heartEnd: {
      en: 'Your heart line {end}.',
      km: 'ខ្សែបេះដូងរបស់អ្នក{end}។',
    },
    headSlope: {
      en: 'Your head line slopes about {deg}° below horizontal across the palm.',
      km: 'ខ្សែប្រាជ្ញារបស់អ្នកទេចុះប្រហែល {deg}° ពីផ្តេកឆ្លងកាត់បាតដៃ។',
    },
    manual: {
      en: 'You adjusted the {lines} manually, so its measurements come from your correction.',
      km: 'អ្នកបានកែតម្រូវ{lines}ដោយដៃ ដូច្នេះការវាស់វែងរបស់វាមកពីការកែតម្រូវរបស់អ្នក។',
    },
    hand: {
      en: 'Many palmists read the non-dominant hand as inherited tendencies and the dominant hand as how you have developed them.',
      km: 'ហោរាបាតដៃជាច្រើនអានដៃដែលមិនសូវប្រើថាជាទំនោរពីកំណើត និងដៃដែលប្រើញឹកញាប់ថាជារបៀបដែលអ្នកបានអភិវឌ្ឍវា។',
    },
  },
};

/** Objective description of one measured line (computer-vision facts, not interpretation). */
export function describeLine(id, line, lang) {
  if (!line || !line.visible) {
    return { line: id, label: pick(LINE_NAMES[id], lang), text: pick(T.notDetected, lang), confidence: 0, visible: false, source: line?.source };
  }
  const parts = [pick(VALUE_LABELS.visibility[line.visibility], lang)];
  if (line.length && line.length !== 'none') parts.push(pick(VALUE_LABELS.length[line.length], lang));
  if (id === 'head' && line.slope) parts.push(pick(VALUE_LABELS.slope[line.slope], lang));
  if (line.curvature) parts.push(pick(VALUE_LABELS.curvature[line.curvature], lang));
  if (id === 'heart' && line.endsAt) parts.push(pick(VALUE_LABELS.endsAt[line.endsAt], lang));
  if (id === 'fate' && line.origin) parts.push(pick(VALUE_LABELS.origin[line.origin], lang));
  if (line.breaks) parts.push(fmt(pick(T.breaks, lang), { n: line.breaks }));
  if (line.source && line.source !== 'auto') parts.push(pick(T.manual, lang));
  return {
    line: id,
    label: pick(LINE_NAMES[id], lang),
    text: parts.join(' · '),
    confidence: line.confidence,
    visible: true,
    source: line.source,
  };
}

export function describePalmShape(shape, lang) {
  if (!shape) return null;
  const el = ELEMENT_THEMES[shape.element];
  return {
    line: 'shape',
    label: `${pick(T.palmShape, lang)} — ${pick(el?.name, lang)}`,
    text: fmt(pick(T.shape, lang), {
      shape: pick(VALUE_LABELS.shape[shape.shape], lang),
      fingers: pick(VALUE_LABELS.fingers[shape.fingers], lang),
      pr: shape.palmRatio,
      fr: shape.fingerRatio,
    }),
    confidence: null,
    visible: true,
  };
}

function observationsFor(category, features, lang) {
  const out = [];
  const lines = features.lines;
  const shape = features.palmShape;
  const lineName = (id) => pick(LINE_NAMES[id], lang);
  const visible = Object.entries(lines).filter(([, l]) => l.visible);
  const strongest = visible.sort((a, b) => b[1].confidence - a[1].confidence)[0];

  if (features.manuallyAdjusted?.length) {
    out.push(fmt(pick(T.obs.manual, lang), { lines: features.manuallyAdjusted.map(lineName).join(', ') }));
  }
  if (category === 'personality') {
    if (shape) out.push(fmt(pick(T.obs.element, lang), { pr: shape.palmRatio, fr: shape.fingerRatio, element: pick(ELEMENT_THEMES[shape.element]?.name, lang) }));
    if (lines.head.visible && lines.head.slopeDegrees != null) out.push(fmt(pick(T.obs.headSlope, lang), { deg: lines.head.slopeDegrees }));
    if (lines.head.joinedWithLife) out.push(pick(T.obs.joined, lang));
  }
  if (category === 'love') {
    if (lines.heart.visible && lines.heart.endsAt) out.push(fmt(pick(T.obs.heartEnd, lang), { end: pick(VALUE_LABELS.endsAt[lines.heart.endsAt], lang) }));
    if (lines.heart.breaks) out.push(fmt(pick(T.obs.breaks, lang), { line: lineName('heart'), n: lines.heart.breaks }));
    out.push(pick(T.obs.hand, lang));
  }
  if (category === 'career') {
    if (!lines.fate.visible) out.push(pick(T.obs.noFate, lang));
    else if (lines.fate.breaks) out.push(fmt(pick(T.obs.breaks, lang), { line: lineName('fate'), n: lines.fate.breaks }));
    if (lines.head.visible && lines.head.slopeDegrees != null) out.push(fmt(pick(T.obs.headSlope, lang), { deg: lines.head.slopeDegrees }));
  }
  if (category === 'fortune') {
    if (strongest) out.push(fmt(pick(T.obs.strongest, lang), { line: lineName(strongest[0]), c: strongest[1].confidence }));
    if (!lines.fate.visible) out.push(pick(T.obs.noFate, lang));
    if (lines.life.breaks) out.push(fmt(pick(T.obs.breaks, lang), { line: lineName('life'), n: lines.life.breaks }));
  }
  return out.slice(0, 4);
}

/**
 * Generates one report for a category.
 * @param {object} features   output of extractFeatures()
 * @param {string} category   personality | love | career | fortune
 * @param {object} opts       { lang, seed, overrides }
 */
export function generateReading(features, category, { lang = 'en', seed = '', overrides = {} } = {}) {
  const meta = CATEGORY_META[category];
  const rules = applyRuleOverrides(PALM_RULES, overrides).filter((r) => r.category === category);
  const scanSeed = `${seed}:${category}`;
  const matching = rules.filter((r) => {
    try {
      return r.when(features);
    } catch {
      return false;
    }
  });
  // Shuffle by seed first so rules of equal weight appear in a different order on each scan.
  const fired = seededOrder(matching, hashSeed(scanSeed))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  // Each rule can be worded several ways; the scan's seed picks one (admin-edited text is always used as-is).
  const ruleText = (r) => {
    if (overrides[r.id]?.text?.[lang]?.trim()) return r.text;
    return pickSeeded([r.text, ...(RULE_VARIANTS[r.id] || [])], `${scanSeed}:${r.id}`);
  };

  const element = ELEMENT_THEMES[features.palmShape?.element];
  const details = fired.map((r) => ({ id: r.id, line: r.line, heading: pick(r.heading, lang), text: pick(ruleText(r), lang) }));

  const lead = fmt(pick(pickSeeded(SUMMARY_LEADS, `${scanSeed}:lead`), lang), { hand: pick(T.hand[features.handType] || T.hand.right, lang) });
  const summaryParts = [lead];
  if (element) summaryParts.push(pick(element[category], lang));
  if (details[0]) summaryParts.push(details[0].text.split(/(?<=[.។])\s/)[0]);
  else summaryParts.push(pick(T.noRules, lang));

  const detectedFeatures = meta.lines.map((id) => describeLine(id, features.lines[id], lang));
  if (category === 'personality' && features.palmShape) detectedFeatures.push(describePalmShape(features.palmShape, lang));

  const lowConfidence = meta.lines.some((id) => features.lines[id]?.visible && features.lines[id].confidence < 45 && features.lines[id].source === 'auto');

  const reflections = seededOrder(REFLECTIONS[category], hashSeed(`${seed}:${category}`))
    .slice(0, 3)
    .map((q) => pick(q, lang));
  const tips = seededOrder(TIPS[category], hashSeed(`${scanSeed}:tips`))
    .slice(0, 2)
    .map((q) => pick(q, lang));

  const summary = summaryParts.join(' ');
  const observations = observationsFor(category, features, lang);
  // Explain palmistry words (e.g. "Mount of Saturn") that appear in this reading.
  const allText = [summary, ...details.map((d) => d.text), ...observations].join(' ');
  const glossary = GLOSSARY.filter((g) => g.match.test(allText))
    .slice(0, 4)
    .map((g) => ({ id: g.id, term: pick(g.term, lang), text: pick(g.text, lang) }));

  return {
    category,
    title: pick(meta.title, lang),
    tagline: pick(meta.tagline, lang),
    detectedFeatures,
    summary,
    details,
    observations,
    reflections,
    tips,
    glossary,
    lowConfidence,
    lowConfidenceNote: lowConfidence ? pick(T.lowConfidence, lang) : null,
    disclaimer: pick(DISCLAIMER, lang),
    language: lang,
    generatedBy: 'rules',
    rulesFired: fired.map((r) => r.id),
  };
}

export function generateAllReadings(features, opts = {}) {
  return CATEGORIES.map((c) => generateReading(features, c, opts));
}

// ---------------------------------------------------------- optional LLM ---

const AI_BASE = (import.meta.env?.VITE_AI_API_BASE || '').replace(/\/$/, '');

/**
 * Asks the server (/api/interpret on Vercel, or the FastAPI service) to rewrite
 * the rule-based summaries into more natural prose. Only the structured
 * features and rule texts are sent — never the palm image.
 * Resolves to { ok: true, narratives: {category: text} } or { ok: false, reason }.
 */
export async function enhanceWithLLM(features, readings, lang, { timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${AI_BASE}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: lang,
        features: { handType: features.handType, palmShape: features.palmShape, lines: features.lines },
        readings: readings.map((r) => ({ category: r.category, summary: r.summary, details: r.details.map((d) => d.text) })),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, reason: body.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    if (!data?.narratives) return { ok: false, reason: 'Empty response' };
    return { ok: true, narratives: data.narratives, model: data.model };
  } catch (err) {
    return { ok: false, reason: err.name === 'AbortError' ? 'Timed out' : err.message };
  } finally {
    clearTimeout(timer);
  }
}
