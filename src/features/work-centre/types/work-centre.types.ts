export type WorkCentreGroup = 'general' | 'commercial';

export type WorkCentreSection =
  | 'create-task'
  | 'tasks'
  | 'enquiry'
  | 'observations'
  | 'incidents'
  | 'checklists'
  | 'snag-lists'
  | 'price-change'
  | 'promotions';

export type WorkCentreRenderer =
  'enquiries' | 'fallback' | 'observations' | 'pending';

export type WorkCentreLabelKey =
  | 'sections.createTask'
  | 'sections.tasks'
  | 'sections.enquiry'
  | 'sections.observations'
  | 'sections.incidents'
  | 'sections.checklists'
  | 'sections.snagLists'
  | 'sections.priceChange'
  | 'sections.promotions'
  | 'children.enquiry.add'
  | 'children.enquiry.history'
  | 'children.observations.add'
  | 'children.observations.assignment'
  | 'children.observations.history'
  | 'children.observations.report'
  | 'children.checklists.create'
  | 'children.checklists.sequence'
  | 'children.checklists.fill'
  | 'children.checklists.editFilled'
  | 'children.snagLists.add'
  | 'children.snagLists.listing'
  | 'children.snagLists.report';

export type WorkCentreChild = Readonly<{
  id: string;
  labelKey: WorkCentreLabelKey;
}>;

export type WorkCentreSectionConfig = Readonly<{
  children?: readonly WorkCentreChild[];
  group: WorkCentreGroup;
  id: WorkCentreSection;
  labelKey: WorkCentreLabelKey;
  renderer: WorkCentreRenderer;
  visible?: boolean;
}>;

export type WorkCentreRow = Readonly<{
  date: string;
  id: string;
  priority: string;
  priorityTone: 'bad' | 'neutral' | 'warn';
  raised: string;
  site: string;
  status: string;
  statusTone: 'neutral' | 'ok' | 'warn';
  title: string;
}>;
