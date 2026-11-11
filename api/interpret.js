// Vercel Serverless Function: POST /api/interpret
//
// Optional AI narrative for PalmVision AI. Rewrites the *rule-based* reading
// into more natural prose with Claude. The API key stays server-side
// (ANTHROPIC_API_KEY env var) and is never exposed to the browser.
//
// GET  /api/interpret → { configured: boolean }   (used by Settings → Test connection)
// POST /api/interpret → { narratives: { personality, love, career, fortune }, model }
//
// Only structured features and rule texts are accepted — never images.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';
const CATEGORIES = ['personality', 'love', 'career', 'fortune'];
const MAX_BODY_CHARS = 20000;

const SYSTEM_PROMPT = `You are the narrator for PalmVision AI, an entertainment app that reads palms using traditional palmistry conventions.

You receive (1) visual features measured by computer vision from a palm photo and (2) rule-based traditional interpretations already generated from those features. Rewrite each category's interpretation as one warm, natural, flowing paragraph (90–150 words).

Rules you must follow:
- Use only the supplied features and interpretations. Do not invent lines, marks, mounts or measurements that are not in the input.
- Frame everything as what palmistry tradition says ("palmists traditionally read…"). Never claim to know the person's real future, and never state predictions as facts.
- No health, medical, lifespan, legal or financial advice. If the life line is mentioned, say tradition links it with vitality, not lifespan.
- If a line was not detected or has low confidence, acknowledge the uncertainty gently instead of interpreting it.
- Write in the requested language (en = English, km = Khmer script).
- Return JSON matching the schema, one paragraph per category.`;

const SCHEMA = {
  type: 'object',
  properties: Object.fromEntries(CATEGORIES.map((c) => [c, { type: 'string' }])),
  required: CATEGORIES,
  additionalProperties: false,
};

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/** Keeps only the fields the prompt needs, with bounded sizes. */
function sanitise(body) {
  const language = body?.language === 'km' ? 'km' : 'en';
  const features = body?.features && typeof body.features === 'object' ? body.features : null;
  const readings = Array.isArray(body?.readings) ? body.readings : [];
  if (!features) throw new Error('Missing features');
  const cleanReadings = readings
    .filter((r) => CATEGORIES.includes(r?.category))
    .map((r) => ({
      category: r.category,
      summary: String(r.summary || '').slice(0, 1500),
      details: (Array.isArray(r.details) ? r.details : []).slice(0, 6).map((d) => String(d).slice(0, 800)),
    }));
  const lines = Object.fromEntries(
    Object.entries(features.lines || {})
      .filter(([k]) => ['life', 'head', 'heart', 'fate'].includes(k))
      .map(([k, v]) => [k, Object.fromEntries(Object.entries(v || {}).filter(([, x]) => ['string', 'number', 'boolean'].includes(typeof x)))]),
  );
  return {
    language,
    features: { handType: features.handType === 'left' ? 'left' : 'right', palmShape: features.palmShape || null, lines },
    readings: cleanReadings,
  };
}

export default async function handler(req, res) {
  const configured = !!process.env.ANTHROPIC_API_KEY;

  if (req.method === 'GET') return json(res, 200, { configured, model: configured ? MODEL : null });
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!configured) return json(res, 503, { error: 'AI narrative is not configured on this server' });

  let input;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (raw.length > MAX_BODY_CHARS) return json(res, 413, { error: 'Request too large' });
    input = sanitise(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
  } catch (err) {
    return json(res, 400, { error: `Invalid request: ${err.message}` });
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Language: ${input.language}\n\nInput:\n${JSON.stringify(input, null, 2)}` }],
    });

    if (response.stop_reason === 'refusal') return json(res, 502, { error: 'The model declined this request' });
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const narratives = JSON.parse(text);
    return json(res, 200, { narratives, model: response.model });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return json(res, 503, { error: 'AI service credentials are invalid' });
    if (err instanceof Anthropic.RateLimitError) return json(res, 429, { error: 'AI service is busy, please try again later' });
    if (err instanceof Anthropic.APIError) return json(res, 502, { error: `AI service error (${err.status})` });
    if (err instanceof SyntaxError) return json(res, 502, { error: 'AI service returned an unexpected format' });
    console.error('[api/interpret]', err);
    return json(res, 500, { error: 'Unexpected server error' });
  }
}
