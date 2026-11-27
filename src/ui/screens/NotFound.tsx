import { Link } from 'react-router';
import { useI18n } from '../i18n/useI18n';

export function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-xl p-6 text-center">
      <h1 className="text-xl font-bold">{t.notFoundTitle}</h1>
      <p className="mt-2 text-sm text-slate-400">{t.notFoundBody}</p>
      <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sky-300">
        {t.backToTopics}
      </Link>
    </div>
  );
}
