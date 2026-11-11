import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import en from '../i18n/en.js';
import km from '../i18n/km.js';

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..');
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === '__tests__' ? [] : sourceFiles(p);
    return /\.(jsx?|js)$/.test(f) ? [p] : [];
  });
}

describe('i18n dictionaries', () => {
  const enKeys = new Set(flatten(en));
  const kmKeys = new Set(flatten(km));

  it('English and Khmer have exactly the same keys', () => {
    expect([...enKeys].filter((k) => !kmKeys.has(k))).toEqual([]);
    expect([...kmKeys].filter((k) => !enKeys.has(k))).toEqual([]);
  });

  it('every static t("…") key used in the source exists', () => {
    const used = new Set();
    for (const file of sourceFiles(srcDir)) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) used.add(m[1]);
      for (const m of text.matchAll(/key: '([a-z]+\.[a-zA-Z0-9_.]+)'/g)) used.add(m[1]);
      for (const m of text.matchAll(/'((?:quality|upload|camera)\.[a-zA-Z.]+)'/g)) used.add(m[1]);
    }
    const missing = [...used].filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('Khmer strings actually contain Khmer script', () => {
    const values = flatten(km).map((k) => k.split('.').reduce((o, p) => o[p], km));
    const khmer = values.filter((v) => /[ក-៿]/.test(v));
    expect(khmer.length / values.length).toBeGreaterThan(0.9);
  });
});
