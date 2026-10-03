import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { paths } from '@/shared/config/paths';
import { IncidentWorkspacePage } from '@/features/incidents';

import { HomeUnderlineTabs } from '../components/sections/HomeUnderlineTabs';
import { LiveIncidentsPage } from './LiveIncidentsPage';

type IncidentSubTab = 'reports' | 'live';

/**
 * `/home/incidents/*` — the Incident Reports workspace and the Live Incidents centre under one sub-tab strip.
 * @prototype index.html:L14746-L14778 `view === 'incidents'`
 */
export function HomeIncidentsPage({ activeTab }: Readonly<{ activeTab: IncidentSubTab }>) {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const items = [
    { id: 'reports', label: t('incidents.reports') },
    { id: 'live', label: t('incidents.live') },
  ] as const;

  return (
    <section data-testid="incidents-sub-tabs">
      <HomeUnderlineTabs
        active={activeTab}
        items={items}
        onSelect={(id) => {
          void navigate(paths.home.incidents(id));
        }}
      />
      {activeTab === 'reports' ? (
        <IncidentWorkspacePage />
      ) : (
        <LiveIncidentsPage />
      )}
    </section>
  );
}
