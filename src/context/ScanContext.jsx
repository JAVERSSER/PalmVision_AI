import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Holds the in-progress scan in memory only. Nothing here is persisted until
// the user explicitly saves a reading (and images only with consent).
const ScanContext = createContext(null);

const EMPTY = {
  handType: 'right',
  source: null, // 'camera' | 'upload'
  image: null, // { canvas, url, width, height }
  detection: null,
  hand: null,
  quality: null,
  analysis: null, // { region, processed, timings }
  lines: null,
  features: null,
  readings: null,
  narratives: null,
  savedScanId: null,
  startedAt: null,
};

export function ScanProvider({ children }) {
  const [scan, setScan] = useState(EMPTY);

  const patch = useCallback((p) => setScan((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })), []);
  const reset = useCallback((keep = {}) => setScan({ ...EMPTY, ...keep }), []);
  const updateLine = useCallback(
    (id, changes) => setScan((s) => ({ ...s, lines: { ...s.lines, [id]: { ...s.lines[id], ...changes } }, features: null, readings: null, narratives: null, savedScanId: null })),
    [],
  );

  const value = useMemo(() => ({ scan, patch, reset, updateLine }), [scan, patch, reset, updateLine]);
  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used inside <ScanProvider>');
  return ctx;
}
