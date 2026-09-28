import type {
  WorkCentreGroup,
  WorkCentreSection,
  WorkCentreSectionConfig,
} from '../types/work-centre.types';

export const WORK_CENTRE_GROUPS = ['general', 'commercial'] as const satisfies readonly WorkCentreGroup[];

export const WORK_CENTRE_SECTIONS: readonly WorkCentreSectionConfig[] = [
  { group: 'general', id: 'create-task', labelKey: 'sections.createTask', renderer: 'pending' },
  { group: 'general', id: 'tasks', labelKey: 'sections.tasks', renderer: 'pending' },
  {
    children: [
      { id: 'add', labelKey: 'children.enquiry.add' },
      { id: 'history', labelKey: 'children.enquiry.history' },
    ],
    group: 'general',
    id: 'enquiry',
    labelKey: 'sections.enquiry',
    renderer: 'pending',
  },
  {
    group: 'general',
    id: 'incidents',
    labelKey: 'sections.incidents',
    renderer: 'pending',
    visible: false,
  },
  {
    children: [
      { id: 'add', labelKey: 'children.observations.add' },
      { id: 'assignment', labelKey: 'children.observations.assignment' },
      { id: 'history', labelKey: 'children.observations.history' },
      { id: 'report', labelKey: 'children.observations.report' },
    ],
    group: 'general',
    id: 'observations',
    labelKey: 'sections.observations',
    renderer: 'pending',
  },
  {
    children: [
      { id: 'create', labelKey: 'children.checklists.create' },
      { id: 'sequence', labelKey: 'children.checklists.sequence' },
      { id: 'fill', labelKey: 'children.checklists.fill' },
      { id: 'edit-filled', labelKey: 'children.checklists.editFilled' },
    ],
    group: 'general',
    id: 'checklists',
    labelKey: 'sections.checklists',
    renderer: 'fallback',
  },
  {
    children: [
      { id: 'add', labelKey: 'children.snagLists.add' },
      { id: 'listing', labelKey: 'children.snagLists.listing' },
      { id: 'report', labelKey: 'children.snagLists.report' },
    ],
    group: 'general',
    id: 'snag-lists',
    labelKey: 'sections.snagLists',
    renderer: 'pending',
  },
  { group: 'commercial', id: 'price-change', labelKey: 'sections.priceChange', renderer: 'fallback' },
  { group: 'commercial', id: 'promotions', labelKey: 'sections.promotions', renderer: 'fallback' },
];

export const DEFAULT_WORK_CENTRE_SECTION: WorkCentreSection = 'create-task';

export function getWorkCentreSection(section: string | undefined) {
  return WORK_CENTRE_SECTIONS.find((item) => item.id === section);
}

export function firstSectionForGroup(group: WorkCentreGroup): WorkCentreSection {
  return group === 'general' ? 'create-task' : 'price-change';
}
