import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 py-12 text-fg">
      <section
        aria-labelledby="not-found-title"
        className="rounded-14 w-full max-w-xl border border-line bg-surface p-8 text-center shadow-popover"
      >
        <p className="text-sm font-semibold text-accent">
          {t('errors.notFound.code')}
        </p>
        <h1 className="mt-2 text-2xl font-semibold" id="not-found-title">
          {t('errors.notFound.title')}
        </h1>
        <p className="mt-3 text-sm text-fg-2">
          {t('errors.notFound.description')}
        </p>
      </section>
    </main>
  );
}
