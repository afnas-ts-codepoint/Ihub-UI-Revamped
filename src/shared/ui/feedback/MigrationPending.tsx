import { useTranslation } from 'react-i18next';

type MigrationPendingProps = {
  area: string;
};

export function MigrationPending({ area }: MigrationPendingProps) {
  const { t } = useTranslation();

  return (
    <section
      className="rounded-14 border border-accent bg-accent-dim p-6 text-fg"
      data-migration-pending={area}
      role="status"
    >
      <p className="text-xs font-semibold tracking-wider text-accent uppercase">
        {t('migration.pending.label')}
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        {t('migration.pending.title', { area })}
      </h2>
      <p className="mt-2 text-sm text-fg-2">
        {t('migration.pending.description')}
      </p>
    </section>
  );
}
