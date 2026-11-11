import { useState } from 'react';
import { Palette, ScanLine, Bot, ShieldCheck, Download, Trash2, Image as ImageIcon, RotateCcw, CircleCheck, LoaderCircle, Plug } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import Modal from '../components/Modal.jsx';
import { useT, LANGUAGES } from '../i18n/index.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { clearHistory, deleteSavedImages, exportAllData, downloadJson, storageBackend } from '../services/storageService.js';

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={`flex items-start justify-between gap-4 py-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="block h-6 w-11 rounded-full bg-white/10 transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-gold" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

const AI_BASE = (import.meta.env.VITE_AI_API_BASE || '').replace(/\/$/, '');

export default function Settings() {
  const { t } = useT();
  const { settings, update, resetSettings } = useSettings();
  const [confirm, setConfirm] = useState(null); // 'history' | 'images'
  const [notice, setNotice] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const testAI = async () => {
    setAiStatus('loading');
    try {
      const res = await fetch(`${AI_BASE}/api/interpret`, { method: 'GET' });
      const isJson = (res.headers.get('content-type') || '').includes('application/json');
      if (!isJson) return setAiStatus('offline'); // e.g. SPA fallback page — no API deployed
      const data = await res.json().catch(() => ({}));
      setAiStatus(res.ok && data.configured ? 'ok' : 'missing');
    } catch {
      setAiStatus('offline');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} description={t('settings.subtitle')} />
      {notice && <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300" role="status"><CircleCheck className="h-4 w-4" /> {notice}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalysisCard icon={Palette} title={t('settings.appearance')}>
          <div className="divide-y divide-line">
            <label className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-medium">{t('settings.language')}</span>
              <select className="input w-auto" value={settings.language} onChange={(e) => update({ language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </label>
            <div className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-medium">{t('settings.theme')}</span>
              <div className="inline-flex rounded-xl border border-line p-1">
                {['dark', 'light'].map((th) => (
                  <button key={th} onClick={() => update({ theme: th })} aria-pressed={settings.theme === th} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${settings.theme === th ? 'bg-primary text-white' : 'text-muted'}`}>
                    {t(`settings.themes.${th}`)}
                  </button>
                ))}
              </div>
            </div>
            <Toggle checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} label={t('settings.reduceMotion')} description={t('settings.reduceMotionHelp')} />
          </div>
        </AnalysisCard>

        <AnalysisCard icon={ScanLine} title={t('settings.scanner')}>
          <div className="divide-y divide-line">
            <Toggle checked={settings.showLandmarks} onChange={(v) => update({ showLandmarks: v })} label={t('settings.showLandmarks')} description={t('settings.showLandmarksHelp')} />
            <Toggle checked={settings.autoCapture} onChange={(v) => update({ autoCapture: v })} label={t('settings.autoCapture')} description={t('settings.autoCaptureHelp')} />
          </div>
        </AnalysisCard>

        <AnalysisCard icon={Bot} title={t('settings.ai')} subtitle={t('settings.aiSubtitle')}>
          <Toggle checked={settings.useAI} disabled={!settings.admin.aiEnabled} onChange={(v) => update({ useAI: v })} label={t('settings.useAI')} description={settings.admin.aiEnabled ? t('settings.useAIHelp') : t('settings.aiDisabledByAdmin')} />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={testAI} disabled={aiStatus === 'loading'}>
              {aiStatus === 'loading' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />} {t('settings.testAI')}
            </button>
            {aiStatus && aiStatus !== 'loading' && <span className={`text-xs ${aiStatus === 'ok' ? 'text-emerald-400' : 'text-amber-300'}`}>{t(`settings.aiStatus.${aiStatus}`)}</span>}
          </div>
        </AnalysisCard>

        <AnalysisCard icon={ShieldCheck} title={t('settings.privacy')} subtitle={t('settings.privacySubtitle', { backend: storageBackend() })}>
          <Toggle checked={settings.saveImagesByDefault} onChange={(v) => update({ saveImagesByDefault: v })} label={t('settings.saveImages')} description={t('settings.saveImagesHelp')} />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button className="btn-ghost justify-start" onClick={async () => downloadJson(await exportAllData(), `palmvision-export-${new Date().toISOString().slice(0, 10)}.json`)}>
              <Download className="h-4 w-4" /> {t('settings.export')}
            </button>
            <button className="btn-ghost justify-start" onClick={async () => downloadJson(await exportAllData({ includeImages: true }), `palmvision-export-full-${new Date().toISOString().slice(0, 10)}.json`)}>
              <Download className="h-4 w-4" /> {t('settings.exportWithImages')}
            </button>
            <button className="btn-danger justify-start" onClick={() => setConfirm('images')}>
              <ImageIcon className="h-4 w-4" /> {t('settings.deleteImages')}
            </button>
            <button className="btn-danger justify-start" onClick={() => setConfirm('history')}>
              <Trash2 className="h-4 w-4" /> {t('settings.clearHistory')}
            </button>
          </div>
          <button className="mt-4 flex items-center gap-1.5 text-xs text-muted hover:text-ink" onClick={() => { resetSettings(); flash(t('settings.resetDone')); }}>
            <RotateCcw className="h-3.5 w-3.5" /> {t('settings.reset')}
          </button>
        </AnalysisCard>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title={confirm === 'history' ? t('settings.clearHistory') : t('settings.deleteImages')}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirm(null)}>{t('common.cancel')}</button>
            <button
              className="btn-danger"
              onClick={async () => {
                if (confirm === 'history') {
                  await clearHistory();
                  flash(t('settings.historyCleared'));
                } else {
                  const n = await deleteSavedImages();
                  flash(t('settings.imagesDeleted', { n }));
                }
                setConfirm(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> {t('common.confirm')}
            </button>
          </>
        }
      >
        {confirm === 'history' ? t('settings.clearHistoryBody') : t('settings.deleteImagesBody')}
      </Modal>
    </div>
  );
}
