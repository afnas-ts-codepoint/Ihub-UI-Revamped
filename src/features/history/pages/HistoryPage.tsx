import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { HistoryTable } from '../components/HistoryTable';
import {
  historyFilterKind,
  resolveHistoryScope,
} from '../domain/historyScopes';
import { useHistory } from '../hooks/useHistory';
import {
  createEmptyRecordFilter,
  RecordFilter,
  type RecordExportDefinition,
} from '@/features/organization';

function ScopeTitle({ isArabic, title }: Readonly<{ isArabic: boolean; title: string }>) {
  const words = title.trim().split(' ');
  const finalWord = words.pop();

  if (isArabic || !finalWord || words.length === 0) return title;

  return (
    <>
      {`${words.join(' ')} `}
      <em className="accent-em">{finalWord}</em>
    </>
  );
}

/** @prototype index.html:L9729-L9780 HistoryScreen */
export function HistoryPage() {
  const { pathname } = useLocation();
  const { i18n, t } = useTranslation('history');
  const scope = resolveHistoryScope(pathname);
  const scopeLabel = scope ? t(scope.scopeKey) : '';
  const { rows } = useHistory(scopeLabel);
  const [filter, setFilter] = useState(createEmptyRecordFilter);

  if (!scope) return null;

  const exportDefinition: RecordExportDefinition = {
    columns: [
      t('columns.date'),
      t('columns.reference'),
      t('columns.action'),
      t('columns.by'),
      t('columns.note'),
    ],
    label: scopeLabel,
    rows: rows.map((row) => [
      row.date,
      row.ref,
      t(`actions.${row.action}`),
      row.by,
      `${t(`actions.${row.action}`)} · ${scopeLabel}`,
    ]),
  };
  const filterKind = historyFilterKind(scope, scopeLabel);

  return (
    <section className="flex flex-col gap-5">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">
          <ScopeTitle
            isArabic={i18n.resolvedLanguage === 'ar'}
            title={scopeLabel}
          />
        </h1>
      </header>
      <RecordFilter
        exportDefinition={exportDefinition}
        kind={filterKind}
        onChange={setFilter}
        value={filter}
      />
      <HistoryTable rows={rows} scopeLabel={scopeLabel} />
    </section>
  );
}
