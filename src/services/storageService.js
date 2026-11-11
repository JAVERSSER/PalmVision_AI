// Local persistence for PalmVision AI.
//
// Data models (see README → Data model):
//   User         { id, name, email, createdAt, role }
//   Scan         { id, userId, handType, imageReference, scanDate, detectionStatus, … }
//   PalmFeatures { id, scanId, lifeLine, headLine, heartLine, fateLine, palmShape, detectionConfidence }
//   Reading      { id, scanId, category, title, interpretation, createdAt }
//   Feedback     { id, userId, readingId, rating, comment, createdAt }
//   Event        { id, type, createdAt, … }   (analytics for the admin dashboard)
//
// The app talks to an *adapter* with a tiny async CRUD interface. The default
// adapter is IndexedDB; an in-memory adapter is used when IndexedDB is not
// available (private browsing, tests). A MySQL/Firebase adapter only needs to
// implement the same five methods — see docs in README.

const DB_NAME = 'palmvision-ai';
const DB_VERSION = 1;
export const STORES = ['users', 'scans', 'features', 'readings', 'feedback', 'events'];
const INDEXES = {
  scans: ['userId', 'scanDate'],
  features: ['scanId'],
  readings: ['scanId', 'category'],
  feedback: ['readingId', 'userId'],
  events: ['type', 'createdAt'],
};

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// ------------------------------------------------------------ adapters ---

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function createIndexedDbAdapter() {
  let dbPromise = null;
  const open = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          for (const name of STORES) {
            if (db.objectStoreNames.contains(name)) continue;
            const store = db.createObjectStore(name, { keyPath: 'id' });
            for (const idx of INDEXES[name] || []) store.createIndex(idx, idx);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  };
  const tx = async (store, mode, fn) => {
    const db = await open();
    const t = db.transaction(store, mode);
    const result = await fn(t.objectStore(store));
    await new Promise((resolve, reject) => {
      t.oncomplete = resolve;
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
    return result;
  };
  return {
    name: 'indexeddb',
    getAll: (store) => tx(store, 'readonly', (s) => requestToPromise(s.getAll())),
    get: (store, id) => tx(store, 'readonly', (s) => requestToPromise(s.get(id))),
    put: (store, value) => tx(store, 'readwrite', (s) => requestToPromise(s.put(value)).then(() => value)),
    delete: (store, id) => tx(store, 'readwrite', (s) => requestToPromise(s.delete(id))),
    clear: (store) => tx(store, 'readwrite', (s) => requestToPromise(s.clear())),
  };
}

export function createMemoryAdapter() {
  const data = Object.fromEntries(STORES.map((s) => [s, new Map()]));
  const clone = (v) => (v === undefined ? v : structuredClone(v));
  return {
    name: 'memory',
    getAll: async (store) => [...data[store].values()].map(clone),
    get: async (store, id) => clone(data[store].get(id)),
    put: async (store, value) => (data[store].set(value.id, clone(value)), value),
    delete: async (store, id) => void data[store].delete(id),
    clear: async (store) => void data[store].clear(),
  };
}

let adapter = typeof indexedDB !== 'undefined' ? createIndexedDbAdapter() : createMemoryAdapter();

/** Swap the persistence backend (e.g. a REST/MySQL or Firebase adapter). */
export function setStorageAdapter(next) {
  adapter = next;
}
export const storageBackend = () => adapter.name;

const listeners = new Set();
/** Subscribe to data changes (used to refresh dashboards). Returns an unsubscribe fn. */
export function onDataChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const emit = () => listeners.forEach((fn) => fn());

// --------------------------------------------------------------- users ---

const CURRENT_USER_KEY = 'pv.currentUserId';

export async function getCurrentUser() {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  let user = id ? await adapter.get('users', id) : null;
  if (!user) {
    user = { id: uid('usr'), name: '', email: '', role: 'user', createdAt: new Date().toISOString() };
    await adapter.put('users', user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  }
  return user;
}

export async function saveUser(user) {
  const saved = await adapter.put('users', { ...user, updatedAt: new Date().toISOString() });
  emit();
  return saved;
}

export const listUsers = () => adapter.getAll('users');

export async function deleteUser(userId) {
  const scans = (await adapter.getAll('scans')).filter((s) => s.userId === userId);
  for (const s of scans) await deleteScan(s.id, { silent: true });
  const feedback = (await adapter.getAll('feedback')).filter((f) => f.userId === userId);
  for (const f of feedback) await adapter.delete('feedback', f.id);
  await adapter.delete('users', userId);
  emit();
}

// ------------------------------------------------------------ readings ---

/**
 * Persists a complete analysis: scan + features + one reading per category.
 * `imageDataUrl` is stored only when the user explicitly consented.
 */
export async function saveReadingBundle({ user, scan, features, readings, imageDataUrl, consentToStoreImage }) {
  const scanId = scan.id || uid('scn');
  const now = new Date().toISOString();
  const scanRecord = {
    ...scan,
    id: scanId,
    userId: user.id,
    scanDate: scan.scanDate || now,
    imageReference: consentToStoreImage && imageDataUrl ? imageDataUrl : null,
    imageConsent: !!(consentToStoreImage && imageDataUrl),
  };
  await adapter.put('scans', scanRecord);
  await adapter.put('features', {
    id: uid('ftr'),
    scanId,
    lifeLine: features.lines.life,
    headLine: features.lines.head,
    heartLine: features.lines.heart,
    fateLine: features.lines.fate,
    palmShape: features.palmShape,
    detectionConfidence: features.detectionConfidence,
    raw: features,
  });
  for (const r of readings) {
    await adapter.put('readings', {
      id: uid('rdg'),
      scanId,
      category: r.category,
      title: r.title,
      interpretation: r,
      createdAt: now,
    });
  }
  emit();
  return scanId;
}

/** All scans (newest first) with their readings attached. */
export async function listScans({ userId } = {}) {
  const [scans, readings, features] = await Promise.all([
    adapter.getAll('scans'),
    adapter.getAll('readings'),
    adapter.getAll('features'),
  ]);
  return scans
    .filter((s) => !userId || s.userId === userId)
    .sort((a, b) => (b.scanDate || '').localeCompare(a.scanDate || ''))
    .map((s) => ({
      ...s,
      readings: readings.filter((r) => r.scanId === s.id),
      features: features.find((f) => f.scanId === s.id) || null,
    }));
}

export async function getScanBundle(scanId) {
  const scan = await adapter.get('scans', scanId);
  if (!scan) return null;
  const [readings, features] = await Promise.all([adapter.getAll('readings'), adapter.getAll('features')]);
  return {
    scan,
    readings: readings.filter((r) => r.scanId === scanId),
    features: features.find((f) => f.scanId === scanId) || null,
  };
}

export async function updateScan(scanId, changes) {
  const scan = await adapter.get('scans', scanId);
  if (!scan) return null;
  const next = { ...scan, ...changes };
  await adapter.put('scans', next);
  emit();
  return next;
}

export async function deleteScan(scanId, { silent = false } = {}) {
  const [readings, features, feedback] = await Promise.all([
    adapter.getAll('readings'),
    adapter.getAll('features'),
    adapter.getAll('feedback'),
  ]);
  const readingIds = new Set(readings.filter((r) => r.scanId === scanId).map((r) => r.id));
  for (const id of readingIds) await adapter.delete('readings', id);
  for (const f of features.filter((x) => x.scanId === scanId)) await adapter.delete('features', f.id);
  for (const f of feedback.filter((x) => readingIds.has(x.readingId))) await adapter.delete('feedback', f.id);
  await adapter.delete('scans', scanId);
  if (!silent) emit();
}

export async function clearHistory() {
  for (const store of ['scans', 'features', 'readings', 'feedback']) await adapter.clear(store);
  emit();
}

/** Removes every stored palm image but keeps the readings. */
export async function deleteSavedImages() {
  const scans = await adapter.getAll('scans');
  let count = 0;
  for (const s of scans) {
    if (s.imageReference) {
      await adapter.put('scans', { ...s, imageReference: null, imageConsent: false });
      count++;
    }
  }
  emit();
  return count;
}

// ------------------------------------------------------------ feedback ---

export async function addFeedback({ userId, readingId, scanId, rating, comment }) {
  const fb = { id: uid('fbk'), userId, readingId, scanId, rating, comment: (comment || '').slice(0, 1000), createdAt: new Date().toISOString() };
  await adapter.put('feedback', fb);
  emit();
  return fb;
}
export const listFeedback = () => adapter.getAll('feedback');
export async function deleteFeedback(id) {
  await adapter.delete('feedback', id);
  emit();
}

// -------------------------------------------------------------- events ---

/** Records a pipeline event (analysis success/failure, timings) for the admin monitor. */
export async function logEvent(type, payload = {}) {
  try {
    await adapter.put('events', { id: uid('evt'), type, createdAt: new Date().toISOString(), ...payload });
  } catch (err) {
    console.warn('[storage] could not log event', err);
  }
}
export const listEvents = () => adapter.getAll('events');
export async function clearEvents() {
  await adapter.clear('events');
  emit();
}

// -------------------------------------------------------------- export ---

export async function exportAllData({ includeImages = false } = {}) {
  const out = { app: 'PalmVision AI', exportedAt: new Date().toISOString(), version: 1 };
  for (const store of STORES) out[store] = await adapter.getAll(store);
  if (!includeImages) out.scans = out.scans.map((s) => ({ ...s, imageReference: s.imageReference ? '[image omitted]' : null }));
  return out;
}

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
