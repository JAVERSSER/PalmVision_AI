import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, saveUser, onDataChange } from '../services/storageService.js';
import { DEFAULT_THRESHOLDS, DEFAULT_MAX_UPLOAD_MB } from '../utils/imageValidation.js';

const STORAGE_KEY = 'pv.settings';
const SETTINGS_VERSION = 2; // v2: auto-capture became the default

export const DEFAULT_SETTINGS = {
  version: SETTINGS_VERSION,
  language: 'en',
  theme: 'dark',
  saveImagesByDefault: false, // privacy: images are never stored unless the user opts in
  showLandmarks: true,
  autoCapture: true, // hands-free: photo is taken once the open palm is steady
  useAI: false, // optional LLM narrative (needs a configured server)
  reduceMotion: false,
  admin: {
    maxUploadMB: DEFAULT_MAX_UPLOAD_MB,
    thresholds: DEFAULT_THRESHOLDS,
    aiEnabled: true,
    ruleOverrides: {},
  },
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    // Older saves stored the previous default (autoCapture: false) — switch them to the new default once.
    if ((raw.version || 1) < SETTINGS_VERSION) {
      delete raw.autoCapture;
      raw.version = SETTINGS_VERSION;
    }
    const browserKm = navigator.language?.toLowerCase().startsWith('km');
    return {
      ...DEFAULT_SETTINGS,
      language: browserKm ? 'km' : 'en',
      ...raw,
      admin: { ...DEFAULT_SETTINGS.admin, ...(raw.admin || {}), thresholds: { ...DEFAULT_THRESHOLDS, ...(raw.admin?.thresholds || {}) } },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.classList.toggle('light', settings.theme === 'light');
    root.lang = settings.language;
    root.style.colorScheme = settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'dark' ? '#090B17' : '#F6F4FB');
  }, [settings]);

  useEffect(() => {
    let alive = true;
    const refresh = () => getCurrentUser().then((u) => alive && setUser(u)).catch(console.error);
    refresh();
    const off = onDataChange(refresh);
    return () => {
      alive = false;
      off();
    };
  }, []);

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);
  const updateAdmin = useCallback((patch) => setSettings((s) => ({ ...s, admin: { ...s.admin, ...patch } })), []);
  const updateUser = useCallback(async (patch) => {
    const next = await saveUser({ ...(await getCurrentUser()), ...patch });
    setUser(next);
    return next;
  }, []);
  const resetSettings = useCallback(() => setSettings({ ...DEFAULT_SETTINGS, language: settings.language }), [settings.language]);

  const value = useMemo(
    () => ({ settings, update, updateAdmin, resetSettings, user, updateUser }),
    [settings, update, updateAdmin, resetSettings, user, updateUser],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
