import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { paths } from '@/shared/config/paths';
import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';
import { UnderlineTabs } from '@/shared/ui/tabs/UnderlineTabs';

type IncidentSubTab = 'reports' | 'live';

export function HomeIncidentsPendingPage({ activeTab }: Readonly<{ activeTab: IncidentSubTab }>) {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const items = [
    { id: 'reports', label: t('incidents.reports'), path: paths.home.incidents('reports') },
    { id: 'live', label: t('incidents.live'), path: paths.home.incidents('live') },
  ] as const;

  return (
    <section className="flex flex-col gap-[18px]" data-testid="incidents-sub-tabs">
      <div className="border-b border-line [&>div]:px-0">
        <UnderlineTabs
          activeId={activeTab}
          items={items}
          onSelect={(item) => {
            void navigate(item.path);
          }}
        />
      </div>
      <MigrationPending
        area={activeTab === 'reports' ? t('incidents.reports') : t('incidents.live')}
      />
    </section>
  );
}
