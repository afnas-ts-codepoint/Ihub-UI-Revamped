import { CHECKLIST_TABS, checklistRecords } from '../data/checklists.mock';

export function useChecklists() {
  return { rows: checklistRecords, tabs: CHECKLIST_TABS } as const;
}
