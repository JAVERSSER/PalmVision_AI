import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar, { MobileTabBar } from '../components/Sidebar.jsx';
import StarField from '../components/StarField.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import { useT } from '../i18n/index.js';

export function PageFallback() {
  const { t } = useT();
  return <LoadingAnimation className="py-32" label={t('common.loading')} />;
}

/** Public + app layout. `app` adds the sidebar and mobile tab bar. */
export default function MainLayout({ app = false }) {
  const { pathname } = useLocation();
  return (
    <div className="relative flex min-h-screen flex-col">
      <StarField />
      <Navbar />
      <div className={app ? 'mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 pb-24 pt-6 sm:px-6 lg:pb-10' : 'flex-1'}>
        {app && <Sidebar />}
        <motion.main id="main" key={pathname} className="min-w-0 flex-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </motion.main>
      </div>
      {app ? <MobileTabBar /> : <Footer />}
    </div>
  );
}
