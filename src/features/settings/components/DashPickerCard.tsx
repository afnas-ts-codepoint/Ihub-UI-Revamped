import { useTranslation } from 'react-i18next';

import { ADMIN_DASHBOARDS, findAdminDashboard } from '../data/adminDashboards.data';
import type { DashboardId } from '../types/dashboardConfig.types';
import { useLocalizedText } from '@/shared/i18n/localized';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';
import { Select } from '@/shared/form/controls/Select';

type DashPickerCardProps = Readonly<{
  onChange: (id: DashboardId) => void;
  value: DashboardId;
  widgetCount: number;
}>;

/**
 * Shared "Dashboard to configure" card used by both Admin Configuration and
 * User Configuration tabs.
 * @prototype index.html:L7117-L7134 (`DashPickerCard`)
 */
export function DashPickerCard({ onChange, value, widgetCount }: DashPickerCardProps) {
  const { t } = useTranslation('settings');
  const localize = useLocalizedText();
  const dashboard = findAdminDashboard(value);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-dialog border border-line bg-surface p-5">
      <span className="flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent">
        <Icon name={dashboard.icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-2xs font-semibold tracking-[.06em] text-fg-3 uppercase">
          {t('picker.label')}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">{localize(dashboard.label)}</span>
          {dashboard.live ? (
            <Chip tone="ok">{t('picker.live')}</Chip>
          ) : (
            <Chip tone="warn">{t('picker.layoutOnly')}</Chip>
          )}
        </div>
        <div className="mt-0.5 text-sm text-fg-3">
          {t('picker.shownIn')}
          {localize(dashboard.where)}
          {' · '}
          {widgetCount}
          {' '}
          {t('picker.widgetsAvailable')}
        </div>
      </div>
      <label className="flex w-75 max-w-full flex-col gap-1.5">
        <span className="text-2xs font-semibold tracking-[.06em] text-fg-3 uppercase">
          {t('dashboardPicker.dashboardFieldLabel')}
        </span>
        <Select
          ariaLabel={t('dashboardPicker.dashboardFieldLabel')}
          onChange={(next) => { onChange(next as DashboardId); }}
          options={ADMIN_DASHBOARDS.map((candidate) => ({
            label: localize(candidate.label),
            value: candidate.id,
          }))}
          value={value}
        />
      </label>
    </div>
  );
}
