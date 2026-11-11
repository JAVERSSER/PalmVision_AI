import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanLine, History, User, Settings, ShieldCheck } from 'lucide-react';
import { useT } from '../i18n/index.js';

export const APP_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/scan', icon: ScanLine, key: 'nav.scan' },
  { to: '/history', icon: History, key: 'nav.history' },
  { to: '/profile', icon: User, key: 'nav.profile' },
  { to: '/settings', icon: Settings, key: 'nav.settings' },
];

/** Desktop sidebar for the app area; `items` lets the admin area reuse it. */
export default function Sidebar({ items = APP_NAV, title, footer = true }) {
  const { t } = useT();
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 flex-col gap-1 lg:flex" aria-label={title || t('nav.app')}>
      {title && <p className="eyebrow mb-3 px-3">{title}</p>}
      {items.map(({ to, icon: Icon, key, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-primary/12 font-medium text-ink ring-1 ring-primary/25' : 'text-muted hover:bg-white/5 hover:text-ink'}`
          }
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" /> {t(key)}
        </NavLink>
      ))}
      {footer && (
        <NavLink to="/admin" className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-ink">
          <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" /> {t('nav.admin')}
        </NavLink>
      )}
    </aside>
  );
}

/** Bottom tab bar for phones. */
export function MobileTabBar({ items = APP_NAV.slice(0, 4) }) {
  const { t } = useT();
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 grid border-x-0 border-b-0 !bg-surface/95 pb-[env(safe-area-inset-bottom)] lg:hidden" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }} aria-label={t('nav.app')}>
      {items.map(({ to, icon: Icon, key }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'text-gold' : 'text-muted'}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
          {t(key)}
        </NavLink>
      ))}
    </nav>
  );
}
