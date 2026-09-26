import { useTranslation } from 'react-i18next';

import { WORKFLOW_TAB_IDS } from '../data/workflows.mock';
import type { WorkflowTabId } from '../types/workflow.types';

type WorkflowTabsProps = Readonly<{
  active: WorkflowTabId;
  onChange: (tab: WorkflowTabId) => void;
}>;

export function WorkflowTabs({ active, onChange }: WorkflowTabsProps) {
  const { t } = useTranslation('workflows');

  return (
    <div className="-mx-7 mb-6 border-b border-line bg-raised px-7">
      <div className="flex gap-1 overflow-x-auto" role="tablist">
        {WORKFLOW_TAB_IDS.map((id) => (
          <button
            aria-selected={active === id}
            className="-mb-px shrink-0 border-0 bg-transparent px-[13px] py-3 text-md font-medium whitespace-nowrap text-fg-3 data-[selected=true]:font-semibold data-[selected=true]:text-fg"
            data-selected={active === id}
            key={id}
            onClick={() => { onChange(id); }}
            role="tab"
            type="button"
          >
            {t(`tabs.${id}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
