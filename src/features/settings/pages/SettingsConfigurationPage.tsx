import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardBuilder } from '../components/DashboardBuilder';
import { useDashboardConfigStore } from '../store/dashboardConfig.store';
import type { DashboardId } from '../types/dashboardConfig.types';

type SettingsTab = 'admin' | 'user';

/**
 * The Settings › Configuration two-tab shell: "Admin Configuration" (the
 * `AdminDashConfig` builder in admin mode) and "User Configuration" (the
 * same builder in personal mode). This is the entire reachable surface of
 * the prototype's `UserConfigScreen` — its third, unreachable
 * user-administration branch is excluded per the M11.1 decision.
 * @prototype index.html:L6909-L6948 (`UserConfigScreen`)
 */
export function SettingsConfigurationPage() {
  const { t } = useTranslation('settings');
  const [tab, setTab] = useState<SettingsTab>('admin');
  const store = useDashboardConfigStore();

  const tabs: readonly [SettingsTab, string][] = [
    ['admin', t('tabs.admin')],
    ['user', t('tabs.user')],
  ];

  return (
    <main className="flex flex-col gap-5 bg-canvas p-7" data-testid="settings-configuration-page">
      <div>
        <h1 className="m-0 text-10xl leading-[1.1] font-medium tracking-tight text-fg">
          {t('sectionHead.title')}
        </h1>
        <p className="mt-1 mb-0 text-base text-fg-3">{t('sectionHead.subtitle')}</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map(([id, label]) => {
          const active = tab === id;
          return (
            <button
              className={`-mb-px border-b-2 px-3.5 py-3 text-sm font-medium whitespace-nowrap ${
                active ? 'border-accent font-semibold text-fg' : 'border-transparent text-fg-3'
              }`}
              key={id}
              onClick={() => { setTab(id); }}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === 'admin' ? (
        <DashboardBuilder
          dashboardId={store.lastSelectedAdminDashboard}
          mode="admin"
          onDashboardChange={(id: DashboardId) => { store.setLastSelectedAdminDashboard(id); }}
        />
      ) : (
        <DashboardBuilder
          dashboardId={store.lastSelectedUserDashboard}
          mode="user"
          onDashboardChange={(id: DashboardId) => { store.setLastSelectedUserDashboard(id); }}
        />
      )}
    </main>
  );
}
