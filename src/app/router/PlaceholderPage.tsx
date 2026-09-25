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
            <div className="mb-3.5 flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-[2px] bg-line-strong" />
              <div className="h-2.5 flex-1 rounded bg-line" />
            </div>
            <div className="rounded-md mb-2.5 h-6 w-3/5 bg-line" />
            <div className="mb-1.5 h-2 rounded bg-line" />
            <div className="h-2 w-4/5 rounded bg-line" />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-fg-3">
        {t('placeholder.scaffold')}
      </p>
    </main>
  );
}
