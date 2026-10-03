import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RecordExport } from '@/features/organization';
import { useLocalizedText } from '@/shared/i18n/localized';

import { HomeSectionHead } from '../components/sections/HomeSectionHead';
import { ReportCategoryTabs } from '../components/reports/ReportCategoryTabs';
import { ReportItemChips } from '../components/reports/ReportItemChips';
import {
  DEFAULT_HOME_REPORT_CATEGORY,
  HOME_REPORT_CATEGORIES,
  homeReportCategory,
  homeReportItem,
} from '../constants/reportCategories';

/** The prototype's export has no rows: the result table is never generated. */
const EXPORT_COLUMNS = ['Reference', 'Record', 'Date', 'Status'] as const;

/**
 * `/home/reports` — "Analytics & Reports": category tabs, the category's
 * report chips and an export control over an empty result area. This is a
 * separate view from the standalone `/reports` library (D12).
 * @prototype index.html:L14811-L14865 `view === 'reports'`
 * @prototype index.html:L14461-L14495 `REP_CATS`
 */
export function ReportsPage() {
  const { t } = useTranslation('home');
  const localize = useLocalizedText();
  const [categoryId, setCategoryId] = useState<string>(
    DEFAULT_HOME_REPORT_CATEGORY.id,
  );
  const [itemId, setItemId] = useState<string>(
    DEFAULT_HOME_REPORT_CATEGORY.items[0].id,
  );
  const category = homeReportCategory(categoryId);
  const item = homeReportItem(category, itemId);

  return (
    <section>
      <HomeSectionHead
        sub={t('reportsView.subtitle')}
        title={t('reportsView.title')}
      />
      <ReportCategoryTabs
        ariaLabel={t('reportsView.categories')}
        categories={HOME_REPORT_CATEGORIES}
        onChange={(next) => {
          setCategoryId(next.id);
          setItemId(next.items[0].id);
        }}
        value={category.id}
      />
      <ReportItemChips
        items={category.items}
        onChange={setItemId}
        value={item.id}
      />
      <div className="mt-1 rounded-xl border border-line bg-surface p-[22px]">
        <div className="mb-[18px] flex items-center justify-between gap-3">
          <div>
            <div className="mb-1.5 text-sm font-medium tracking-[0.16em] text-fg-3 uppercase">
              {localize(category.label)}
            </div>
            <h3 className="display m-0 text-4xl font-medium tracking-[-0.01em]">
              {localize(item.label)}
            </h3>
          </div>
          {/* PROTOTYPE-NOOP(D2): no report is ever generated, so the export has no rows. */}
          <RecordExport
            compact
            definition={{ columns: EXPORT_COLUMNS, label: item.label.en, rows: [] }}
            kind="history"
          />
        </div>
        <div className="rounded-lg border border-dashed border-line-strong bg-canvas p-[60px] text-center text-base text-fg-3">
          {t('reportsView.placeholder')}
        </div>
      </div>
    </section>
  );
}
