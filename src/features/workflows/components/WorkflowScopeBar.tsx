import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { WorkflowDepartment } from '../types/workflow.types';
import { Select } from '@/shared/form/controls/Select';
import { useLocalizedText } from '@/shared/i18n/localized';

type WorkflowScopeBarProps = Readonly<{
  department: WorkflowDepartment;
  departmentId: string;
  divisionId: string;
  onDepartmentChange: (id: string) => void;
  onDivisionChange: (id: string) => void;
  departments: readonly WorkflowDepartment[];
}>;

const secondaryButton =
  'rounded-lg border border-line-strong bg-surface px-3 py-2 text-base font-semibold text-fg-2';

export function WorkflowScopeBar({
  department,
  departmentId,
  departments,
  divisionId,
  onDepartmentChange,
  onDivisionChange,
}: WorkflowScopeBarProps) {
  const { t } = useTranslation('workflows');
  const localize = useLocalizedText();

  return (
    <div className="-mx-7 border-b border-line bg-raised px-7 py-5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex min-w-[200px] flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.04em] text-fg-3 uppercase">
              {t('scope.department')}
            </span>
            <Select
              ariaLabel={t('scope.department')}
              onChange={onDepartmentChange}
              options={departments.map((item) => ({
                label: localize(item.name),
                value: item.id,
              }))}
              value={departmentId}
            />
          </label>
          <label className="flex min-w-[200px] flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.04em] text-fg-3 uppercase">
              {t('scope.division')}
            </span>
            <Select
              ariaLabel={t('scope.division')}
              onChange={onDivisionChange}
              options={department.divisions.map((item) => ({
                label: localize(item.name),
                value: item.id,
              }))}
              value={divisionId}
            />
          </label>
          <div className="flex h-[42px] items-center gap-2 ps-1 text-base text-fg-2">
            <span className="h-2 w-2 rounded-full bg-ok" />
            <span>{t('scope.version')}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* PROTOTYPE-NOOP(D2): workflow authoring is intentionally inert. */}
          <button className={secondaryButton} data-noop="discard" type="button">
            {t('actions.discard')}
          </button>
          <button className={secondaryButton} data-noop="save-draft" type="button">
            {t('actions.saveDraft')}
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-interactive px-3 py-2 text-base font-semibold text-[#fff]"
            data-noop="publish"
            type="button"
          >
            <Check aria-hidden="true" size={15} strokeWidth={1.6} />
            {t('actions.publish')}
          </button>
        </div>
      </div>
    </div>
  );
}
