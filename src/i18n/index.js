import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import en from './en.js';
import km from './km.js';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'km', label: 'ខ្មែរ', short: 'ខ្មែរ' },
];
const DICTS = { en, km };

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

/** Translate `key` (dot path) with {var} interpolation; falls back to English, then the key. */
export function translate(lang, key, vars) {
  let str = lookup(DICTS[lang], key);
  if (str == null) str = lookup(en, key);
  if (str == null) return key;
  if (typeof str !== 'string') return str;
  return vars ? str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : str;
}

export function useT() {
  const { settings } = useSettings();
  const lang = settings.language;
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  return { t, lang };
}
