import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { paths } from '@/shared/config/paths';

import { EditRequestsView } from '../components/EditRequestsView';
import { MissingDocumentsView } from '../components/MissingDocumentsView';
import { PCRequestCreate } from '../components/PCRequestCreate';
import { PendingRequestsView } from '../components/PendingRequestsView';
import { PurchaseOrderView } from '../components/PurchaseOrderView';
import { RequestHistoryView } from '../components/RequestHistoryView';
import { RequestReportView } from '../components/RequestReportView';
import { ReviewRequestsView } from '../components/ReviewRequestsView';
import { SupplierQuotationsView } from '../components/SupplierQuotationsView';
import { TodoRequestsView } from '../components/TodoRequestsView';
import { HOME_PURCHASING_SECTIONS, type HomePurchasingSection } from '../types/purchasing.types';

const labelKeys = {
  create: 'home.sections.create',
  edit: 'home.sections.edit',
  history: 'home.sections.history',
  missing: 'home.sections.missing',
  pending: 'home.sections.pending',
  po: 'home.sections.po',
  quotations: 'home.sections.quotations',
  report: 'home.sections.report',
  review: 'home.sections.review',
  todo: 'home.sections.todo',
} as const satisfies Record<HomePurchasingSection, string>;

/**
 * @prototype index.html:L10033-L10542 `PurchasingScreen`, requests tab
 * (`reqSegBar` L10194-L10202 + `reqInner` L10212-L10229) plus the Purchase
 * Order outer `pcSub` tab (`poBody` L10337-L10401); the `review` section
 * renders the reconciled functional `reviewBody` — see `ReviewRequestsView`.
 * M6.4 adds `po` as one more flat entry in this same segment bar rather than
 * reintroducing the prototype's separate outer 4-tab `pcSub` strip — M6.3
 * already established (see `docs/tasks/phases/M6.3.md`, "Route map and shell
 * integration") that the strip is not reproduced, since two of its tabs
 * pointed at then-out-of-scope screens. Purchase Order (M6.4) and Supplier
 * Quotations (M6.5) now take their natural places in the same flat bar.
 */
export function HomePurchasingPage({ section }: Readonly<{ section: HomePurchasingSection }>) {
  const { t } = useTranslation('purchasing');

  return (
    <section className="rise">
      <header className="mb-7">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">{t('home.title')}</h1>
      </header>
      <nav aria-label={t('home.sections.ariaLabel')} className="mb-[18px] flex flex-wrap gap-1 overflow-x-auto rounded-[10px] border border-line bg-raised p-0.5">
        {HOME_PURCHASING_SECTIONS.map((item) => (
          <Link
            aria-current={section === item ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap ${section === item ? 'bg-surface font-semibold text-accent shadow-sm' : 'bg-transparent text-fg-2'}`}
            key={item}
            to={paths.home.purchasing(item)}
          >
            {t(labelKeys[item])}
          </Link>
        ))}
      </nav>
      {section === 'create' ? <PCRequestCreate /> : null}
      {section === 'pending' ? <PendingRequestsView /> : null}
      {section === 'edit' ? <EditRequestsView /> : null}
      {section === 'review' ? <ReviewRequestsView /> : null}
      {section === 'po' ? <PurchaseOrderView /> : null}
      {section === 'quotations' ? <SupplierQuotationsView /> : null}
      {section === 'todo' ? <TodoRequestsView /> : null}
      {section === 'missing' ? <MissingDocumentsView /> : null}
      {section === 'history' ? <RequestHistoryView /> : null}
      {section === 'report' ? <RequestReportView /> : null}
    </section>
  );
}
