import { Flag, Folder, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CollapsiblePanel } from './CollapsiblePanel';
import { FieldGrid, FieldItem, PanelIntro } from './FieldGrid';
import type { TaskViewModel } from '../../types/task.types';
import { Chip } from '@/shared/ui/chip/Chip';

/**
 * The simple, field-grid-only Task View panels: Task Details, Task
 * Classification, Requester Info (the prototype's misleadingly-named
 * `assetPanel` variable — its dead `requesterPanel` twin was not ported),
 * Location & Zone (bundled with Asset Category/Name/Code) and Reference
 * Numbers.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18243-L18423.
 */

export function TaskDetailsPanel({
  project,
  task,
}: Readonly<{ project: readonly [string, string]; task: TaskViewModel }>) {
  const { t } = useTranslation('taskView');
  return (
    <CollapsiblePanel icon={Folder} title={t('details.title')}>
      <PanelIntro>{t('details.intro')}</PanelIntro>
      <FieldGrid>
        <FieldItem label={t('details.subject')} value={task.subject} />
        <FieldItem label={t('details.projectName')} value={project[0]} />
        <FieldItem label={t('details.projectCategory')} value={project[1]} />
      </FieldGrid>
      <FieldItem
        label={t('details.description')}
        value={t('details.descriptionValue', { department: task.department })}
      />
    </CollapsiblePanel>
  );
}

export function TaskClassificationPanel({ task }: Readonly<{ task: TaskViewModel }>) {
  const { t } = useTranslation('taskView');
  return (
    <CollapsiblePanel icon={Flag} title={t('classification.title')}>
      <PanelIntro>{t('classification.intro')}</PanelIntro>
      <FieldGrid>
        <FieldItem label={t('classification.category')} value={task.department} />
        <FieldItem label={t('classification.taskType')} value={t('classification.taskTypeValue')} />
        <FieldItem label={t('classification.risk')} value={t('classification.riskValue')} />
        <FieldItem
          label={t('classification.impactedArea')}
          value={task.zone ? `${task.zone} HVAC` : 'HVAC'}
        />
      </FieldGrid>
    </CollapsiblePanel>
  );
}

export function RequesterInfoPanel({
  daysElapsed,
  ownerName,
  task,
}: Readonly<{ daysElapsed: number; ownerName: string; task: TaskViewModel }>) {
  const { t } = useTranslation('taskView');
  return (
    <CollapsiblePanel icon={Users} title={t('requester.title')}>
      <PanelIntro>{t('requester.intro')}</PanelIntro>
      <FieldGrid>
        <FieldItem label={t('requester.requestedAt')} value="10 Feb 2026 08:00" />
        <FieldItem label={t('requester.requestedBy')} value={ownerName} />
        <FieldItem label={t('requester.department')} value={task.department} />
        <FieldItem label={t('requester.type')} value={t('requester.typeValue')} />
        <div>
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
            {t('requester.daysElapsed')}
          </span>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Chip tone="warn">{t('requester.daysValue', { count: daysElapsed })}</Chip>
            <span className="text-sm-plus text-fg-3">{t('requester.sinceRequest')}</span>
          </div>
        </div>
      </FieldGrid>
    </CollapsiblePanel>
  );
}

export function LocationZonePanel({
  assetCategory,
  assetCode,
  task,
}: Readonly<{ assetCategory: string; assetCode: string; task: TaskViewModel }>) {
  const { t } = useTranslation('taskView');
  return (
    <CollapsiblePanel icon={MapPin} title={t('location.title')}>
      <PanelIntro>{t('location.intro')}</PanelIntro>
      <FieldGrid>
        <FieldItem label={t('location.location')} value={task.location} />
        <FieldItem label={t('location.zone')} value={task.zone} />
        <FieldItem label={t('location.area')} value={t('location.areaValue')} />
        <FieldItem label={t('location.subArea')} value={t('location.subAreaValue')} />
        <FieldItem label={t('location.priority')} value={task.severity} />
        <FieldItem label={t('location.severity')} value={task.severity} />
        <FieldItem label={t('location.touchpoint')} value="" />
        <FieldItem label={t('location.guestKpi')} value={t('location.guestKpiValue')} />
        <FieldItem label={t('location.assetCategory')} value={assetCategory} />
        <FieldItem label={t('location.assetName')} value={task.zone} />
        <FieldItem label={t('location.assetCode')} value={<span className="num">{assetCode}</span>} />
      </FieldGrid>
    </CollapsiblePanel>
  );
}

export function ReferenceNumbersPanel() {
  const { t } = useTranslation('taskView');
  return (
    <CollapsiblePanel icon={Folder} title={t('reference.title')}>
      <PanelIntro>{t('reference.intro')}</PanelIntro>
      <FieldGrid columns={2}>
        <FieldItem label={t('reference.enquiry')} value="" />
        <FieldItem label={t('reference.observation')} value="" />
        <FieldItem label={t('reference.incident')} value="" />
        <FieldItem label={t('reference.source')} value={t('reference.sourceValue')} />
      </FieldGrid>
    </CollapsiblePanel>
  );
}
