import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Save, CircleCheck, Hand, Calendar, ScanLine, Settings as SettingsIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import { useT, LANGUAGES } from '../i18n/index.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useStore } from '../hooks/useStore.js';
import { listScans } from '../services/storageService.js';
import { formatDate } from '../utils/dateHelpers.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Profile() {
  const { t, lang } = useT();
  const { user, updateUser, settings, update } = useSettings();
  const { data: scans } = useStore(() => listScans({ userId: user?.id }), [user?.id]);
  const [form, setForm] = useState({ name: '', email: '', dominantHand: 'right' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', dominantHand: user.dominantHand || 'right' });
  }, [user]);

  if (!user) return <LoadingAnimation className="py-32" label={t('common.loading')} />;

  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim().slice(0, 60);
    const email = form.email.trim().slice(0, 120);
    if (email && !EMAIL_RE.test(email)) {
      setError(t('profile.invalidEmail'));
      return;
    }
    setError(null);
    await updateUser({ name, email, dominantHand: form.dominantHand });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = (form.name || '?').split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('profile.eyebrow')} title={t('profile.title')} description={t('profile.subtitle')} />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="card flex flex-col items-center text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary to-gold font-serif text-3xl font-semibold text-white shadow-[0_0_40px_rgba(167,139,250,.35)]">{initials}</div>
          <p className="mt-4 text-lg font-semibold">{user.name || t('profile.anonymous')}</p>
          {user.email && <p className="text-sm text-muted">{user.email}</p>}
          <dl className="mt-6 grid w-full grid-cols-2 gap-3 text-left text-sm">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <dt className="flex items-center gap-1.5 text-xs text-muted"><ScanLine className="h-3.5 w-3.5" /> {t('profile.scans')}</dt>
              <dd className="mt-1 font-serif text-2xl font-semibold">{scans?.length ?? '—'}</dd>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <dt className="flex items-center gap-1.5 text-xs text-muted"><Calendar className="h-3.5 w-3.5" /> {t('profile.since')}</dt>
              <dd className="mt-1 text-sm font-semibold">{formatDate(user.createdAt, lang)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted">{t('profile.localNote')}</p>
        </div>

        <div className="space-y-6">
          <AnalysisCard icon={User} title={t('profile.details')}>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <label className="space-y-1.5 text-sm">
                <span className="text-muted">{t('profile.name')}</span>
                <input className="input" value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('profile.namePlaceholder')} autoComplete="name" />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-muted">{t('profile.email')}</span>
                <input className="input" type="email" value={form.email} maxLength={120} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
              </label>
              <fieldset className="space-y-1.5 text-sm sm:col-span-2">
                <legend className="mb-1.5 text-muted">{t('profile.dominantHand')}</legend>
                <div className="flex gap-2">
                  {['left', 'right'].map((h) => (
                    <label key={h} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 ${form.dominantHand === h ? 'border-gold/60 bg-gold/10' : 'border-line'}`}>
                      <input type="radio" name="dominant" value={h} className="accent-[#D8B56D]" checked={form.dominantHand === h} onChange={() => setForm({ ...form, dominantHand: h })} />
                      <Hand className={`h-4 w-4 ${h === 'left' ? '-scale-x-100' : ''}`} /> {t(`hand.${h}`)}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted">{t('profile.dominantHelp')}</p>
              </fieldset>
              {error && <p className="text-sm text-red-400 sm:col-span-2" role="alert">{error}</p>}
              <div className="flex items-center gap-3 sm:col-span-2">
                <button className="btn-primary"><Save className="h-4 w-4" /> {t('common.save')}</button>
                {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><CircleCheck className="h-4 w-4" /> {t('common.saved')}</span>}
              </div>
            </form>
          </AnalysisCard>
          <AnalysisCard icon={SettingsIcon} title={t('profile.preferences')}>
            <label className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>{t('settings.language')}</span>
              <select className="input w-auto" value={settings.language} onChange={(e) => update({ language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </label>
            <Link to="/settings" className="mt-4 inline-block text-sm text-primary hover:underline">{t('profile.moreSettings')}</Link>
          </AnalysisCard>
        </div>
      </div>
    </div>
  );
}
