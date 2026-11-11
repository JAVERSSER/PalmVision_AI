const LOCALES = { en: 'en-US', km: 'km-KH' };

export function formatDateTime(iso, lang = 'en') {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(LOCALES[lang] || 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function formatDate(iso, lang = 'en') {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(LOCALES[lang] || 'en-US', { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}

export function relativeTime(iso, lang = 'en') {
  if (!iso) return '';
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(LOCALES[lang] || 'en', { numeric: 'auto' });
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return rtf.format(Math.round(diff), 'second');
}

export const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

/** Groups ISO dates into the last `days` days, returning [{ date, count }] oldest first. */
export function countByDay(isoDates, days = 14) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ date: d.toISOString(), count: isoDates.filter((x) => isSameDay(x, d)).length });
  }
  return out;
}
