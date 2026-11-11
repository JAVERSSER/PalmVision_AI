import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sun, Moon, Languages, ScanLine } from 'lucide-react';
import Logo from './Logo.jsx';
import { useT, LANGUAGES } from '../i18n/index.js';
import { useSettings } from '../context/SettingsContext.jsx';

export function LanguageToggle({ className = '' }) {
  const { settings, update } = useSettings();
  const { t } = useT();
  const next = settings.language === 'en' ? 'km' : 'en';
  return (
    <button
      className={`btn-ghost px-3 py-2 ${className}`}
      onClick={() => update({ language: next })}
      aria-label={t('nav.switchLanguage')}
      title={t('nav.switchLanguage')}
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs">{LANGUAGES.find((l) => l.code === next).short}</span>
    </button>
  );
}

export function ThemeToggle({ className = '' }) {
  const { settings, update } = useSettings();
  const { t } = useT();
  const dark = settings.theme === 'dark';
  return (
    <button className={`btn-ghost px-3 py-2 ${className}`} onClick={() => update({ theme: dark ? 'light' : 'dark' })} aria-label={t('nav.toggleTheme')} title={t('nav.toggleTheme')}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function Navbar() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const onHome = pathname === '/';

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = onHome
    ? [
        { href: '#how-it-works', label: t('nav.howItWorks') },
        { href: '#features', label: t('nav.features') },
        { href: '#categories', label: t('nav.readings') },
        { href: '#privacy', label: t('nav.privacy') },
        { to: '/dashboard', label: t('nav.dashboard') },
      ]
    : [
        { to: '/dashboard', label: t('nav.dashboard') },
        { to: '/scan', label: t('nav.scan') },
        { to: '/history', label: t('nav.history') },
        { to: '/settings', label: t('nav.settings') },
      ];

  const linkCls = ({ isActive }) => `rounded-lg px-3 py-2 text-sm transition hover:text-ink ${isActive ? 'text-ink' : 'text-muted'}`;

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled || !onHome ? 'glass border-x-0 border-t-0' : 'border-b border-transparent'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        {t('nav.skip')}
      </a>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6" aria-label={t('nav.main')}>
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.href ? (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-ink">
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={linkCls}>
                {l.label}
              </NavLink>
            ),
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link to="/scan" className="btn-primary hidden md:inline-flex">
            <ScanLine className="h-4 w-4" /> {t('nav.startReading')}
          </Link>
          <button className="btn-ghost px-3 py-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t('nav.menu')}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line bg-surface/95 lg:hidden">
            <div className="flex flex-col gap-1 px-4 py-4">
              {[...links, ...(onHome ? [] : [{ to: '/profile', label: t('nav.profile') }, { to: '/admin', label: t('nav.admin') }])].map((l) =>
                l.href ? (
                  <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-muted hover:bg-white/5 hover:text-ink">
                    {l.label}
                  </a>
                ) : (
                  <NavLink key={l.to} to={l.to} className={({ isActive }) => `rounded-lg px-3 py-2.5 ${isActive ? 'bg-primary/10 text-ink' : 'text-muted hover:bg-white/5'}`}>
                    {l.label}
                  </NavLink>
                ),
              )}
              <div className="mt-3 flex gap-2">
                <LanguageToggle />
                <ThemeToggle />
                <Link to="/scan" className="btn-primary flex-1">
                  <ScanLine className="h-4 w-4" /> {t('nav.startReading')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
