import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';

import { FilterChips } from '../components/actions/FilterChips';
import { actionButtonClass } from '../components/actions/actionButtonStyles';
import { JobOrderCard } from '../components/job-orders/JobOrderCard';
import { HomeSectionHead } from '../components/sections/HomeSectionHead';
import { useHomeQueueActions } from '../hooks/useHomeQueueActions';
import { useHomeQueueStore } from '../store/homeQueue.store';

type KindFilter = 'all' | 'external' | 'internal';

/**
 * `/home/tasks` — every job order (new and assigned) as task cards, filtered
 * All / Internal / External. "Board view" is inert, as in the prototype. The
 * kind filter is page-local, like the Approvals group filter.
 * @prototype index.html:L14438-L14454, L14756-L14780 `view === 'joborders'`
 */
export function HomeTasksPage() {
  const { t } = useTranslation('home');
  const jobOrders = useHomeQueueStore((state) => state.jobOrders);
  const openDrawer = useHomeQueueStore((state) => state.openDrawer);
  const { actOnJobOrder } = useHomeQueueActions();
  const [kind, setKind] = useState<KindFilter>('all');

  const options = useMemo(
    () => [
      { count: jobOrders.length, id: 'all' as const, label: t('homeTasks.filters.all') },
      {
        count: jobOrders.filter((jobOrder) => jobOrder.kind === 'internal').length,
        id: 'internal' as const,
        label: t('homeTasks.filters.internal'),
      },
      {
        count: jobOrders.filter((jobOrder) => jobOrder.kind === 'external').length,
        id: 'external' as const,
        label: t('homeTasks.filters.external'),
      },
    ],
    [jobOrders, t],
  );
  const shown =
    kind === 'all' ? jobOrders : jobOrders.filter((jobOrder) => jobOrder.kind === kind);

  return (
    <section>
      <HomeSectionHead
        right={
          // PROTOTYPE-NOOP(D2): the Board view button has no handler.
          <button className={actionButtonClass('ghost', 'sm')} type="button">
            {t('homeTasks.boardView')}
            <Icon className="rtl:rotate-180" name="arrow-right" size={13} />
          </button>
        }
        sub={t('homeTasks.subtitle', {
          n: jobOrders.filter((jobOrder) => jobOrder.isNew).length,
        })}
        title={t('homeTasks.title')}
      />
      <FilterChips onChange={setKind} options={options} value={kind} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {shown.map((jobOrder) => (
          <JobOrderCard
            item={jobOrder}
            key={jobOrder.id}
            onDismiss={(item) => {
              actOnJobOrder('dismiss', item);
            }}
            onOpenDrawer={(item) => {
              openDrawer('jo', item);
            }}
          />
        ))}
      </div>
    </section>
  );
}
