import { User, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from './CollapsiblePanel';
import { PanelIntro } from './FieldGrid';
import { Chip } from '@/shared/ui/chip/Chip';

/**
 * Assignment Info — Process Owner (single) and Matrix Partner (multi) are
 * fixed department chips seeded from the same constant list every mount;
 * Assignee has no source field on `Task`, so it always renders "Unassigned",
 * matching the prototype's own `item.assignee || ''` fallback in read-only
 * mode (this codebase's `Task` type carries no assignee — see M8.4 report).
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18047-L18049 (`TEP_ASSIGN_DEPTS`,
 * initial `processOwner`/`matrixPartners`), L18462-L18476 (`assignmentPanel`).
 */
const PROCESS_OWNER = 'Maintenance Department';
const MATRIX_PARTNERS = ['IT Department', 'Safety Department'] as const;

export function AssignmentInfoPanel() {
  const { t } = useTranslation('taskView');
  return (
    <CollapsiblePanel defaultOpen icon={UserRound} title={t('assignment.title')}>
      <PanelIntro>{t('assignment.intro')}</PanelIntro>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
          {t('assignment.processOwner')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="accent">{PROCESS_OWNER}</Chip>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
          {t('assignment.matrixPartner')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MATRIX_PARTNERS.map((partner) => (
            <Chip key={partner} tone="accent">
              {partner}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
          {t('assignment.assignee')}
        </span>
        <div className="flex items-center gap-3 rounded-lg border border-line-strong bg-surface px-3.5 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-inset text-fg-3">
            <User aria-hidden size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm-plus font-semibold text-fg-3">
              {t('assignment.unassigned')}
            </p>
            <p className="m-0 text-xs-plus text-fg-3">{t('assignment.assignee')}</p>
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
