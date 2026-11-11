import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useT } from '../i18n/index.js';

export default function Footer() {
  const { t } = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{t('footer.about')}</p>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted/80">{t('disclaimer.short')}</p>
        </div>
        <div>
          <p className="eyebrow mb-3">{t('footer.product')}</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" to="/scan">{t('nav.scan')}</Link></li>
            <li><Link className="hover:text-ink" to="/dashboard">{t('nav.dashboard')}</Link></li>
            <li><Link className="hover:text-ink" to="/history">{t('nav.history')}</Link></li>
            <li><Link className="hover:text-ink" to="/admin">{t('nav.admin')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">{t('footer.trust')}</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" to="/#privacy">{t('nav.privacy')}</Link></li>
            <li><Link className="hover:text-ink" to="/settings">{t('footer.dataControls')}</Link></li>
            <li><Link className="hover:text-ink" to="/#how-it-works">{t('nav.howItWorks')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {year} PalmVision AI · {t('footer.rights')}
      </div>
    </footer>
  );
}
