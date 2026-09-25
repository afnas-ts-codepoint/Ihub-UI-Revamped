import { useTranslation } from 'react-i18next';

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <main className="bg-canvas p-7 text-fg">
      <header>
        <p className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
          {title}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-fg-3">{t('placeholder.description')}</p>
      </header>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            aria-hidden="true"
            className="rounded-14 min-h-40 border border-line bg-surface p-6"
            key={index}
          >
            <div className="h-2.5 rounded bg-line" />
            <div className="mt-4 h-6 w-3/5 rounded bg-line" />
            <div className="mt-3 h-2 rounded bg-line" />
            <div className="mt-2 h-2 w-4/5 rounded bg-line" />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-fg-3">
        {t('placeholder.scaffold')}
      </p>
    </main>
  );
}
