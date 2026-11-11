import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ScanLine, FileText, Activity, MessageSquare, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Sidebar, { MobileTabBar } from '../components/Sidebar.jsx';
import StarField from '../components/StarField.jsx';
import { PageFallback } from './MainLayout.jsx';
import { useT } from '../i18n/index.js';

export const ADMIN_NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, key: 'admin.nav.overview' },
  { to: '/admin/users', icon: Users, key: 'admin.nav.users' },
  { to: '/admin/scans', icon: ScanLine, key: 'admin.nav.scans' },
  { to: '/admin/content', icon: FileText, key: 'admin.nav.content' },
  { to: '/admin/model', icon: Activity, key: 'admin.nav.model' },
  { to: '/admin/feedback', icon: MessageSquare, key: 'admin.nav.feedback' },
  { to: '/admin/settings', icon: SlidersHorizontal, key: 'admin.nav.settings' },
];

export default function AdminLayout() {
  const { t } = useT();
  return (
    <div className="relative flex min-h-screen flex-col">
      <StarField density={50} />
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
        <Sidebar items={ADMIN_NAV} title={t('admin.title')} footer={false} />
        <main id="main" className="min-w-0 flex-1">
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-xs text-amber-200/90">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            {t('admin.localNotice')}
          </div>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {ADMIN_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `chip whitespace-nowrap ${isActive ? 'border-primary/50 text-ink' : 'text-muted'}`}>
                {t(n.key)}
              </NavLink>
            ))}
          </div>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
