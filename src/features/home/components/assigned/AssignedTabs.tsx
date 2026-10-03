import { useTranslation } from 'react-i18next';

import type { AssignedQueueId } from '../../constants/assignedQueue';
import { HomeUnderlineTabs } from '../sections/HomeUnderlineTabs';

export type AssignedTabsProps = Readonly<{
  active: AssignedQueueId;
  counts: Readonly<Record<AssignedQueueId, number>>;
  onSelect: (queue: AssignedQueueId) => void;
}>;

const TABS = [
  { id: 'approvals', labelKey: 'assigned.tabs.approvals' },
  { id: 'verify', labelKey: 'assigned.tabs.verify' },
  { id: 'tasks', labelKey: 'assigned.tabs.tasks' },
] as const satisfies readonly Readonly<{
  id: AssignedQueueId;
  labelKey: string;
}>[];

/**
 * Tab strip for Approvals, Verify and Assigned Tasks. A tab with a zero count
 * is hidden.
 * @prototype index.html:L14682-L14687, L14456-L14460 `ASG_L3`
 */
export function AssignedTabs({ active, counts, onSelect }: AssignedTabsProps) {
  const { t } = useTranslation('home');

  return (
    <HomeUnderlineTabs
      active={active}
      items={TABS.filter((tab) => counts[tab.id] > 0).map((tab) => ({
        count: counts[tab.id],
        id: tab.id,
        label: t(tab.labelKey),
      }))}
      onSelect={onSelect}
      testId="assigned-tabs"
    />
  );
}
