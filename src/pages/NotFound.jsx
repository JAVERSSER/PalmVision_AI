import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import { useT } from '../i18n/index.js';

export default function NotFound() {
  const { t } = useT();
  return <EmptyState className="mt-10" icon={Compass} title={t('notFound.title')} body={t('notFound.body')} action={<Link to="/" className="btn-primary">{t('notFound.home')}</Link>} />;
}
