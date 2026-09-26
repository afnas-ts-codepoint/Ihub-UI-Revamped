import type { ChecklistRecord, ChecklistTab } from '../types/checklist.types';

/** Literal decorative tab counts (`PROTOTYPE-NOOP(D2)`); never derived from the rows. */
export const CHECKLIST_TABS: readonly ChecklistTab[] = [
  { id: 'unapproved', displayCount: 4 },
  { id: 'other', displayCount: 23 },
];

/** @prototype index.html:L8604-L8640 ChecklistScreen */
export const checklistRecords: readonly ChecklistRecord[] = [
  {
    id: 'CHK-0421',
    title: 'Daily safety walk — Mall floor 1',
    site: 'SAMA Mall',
    submitted: 'Today, 8:12 AM',
    by: 'K. Ibrahim',
    progress: '24/24',
    status: 'Awaiting',
  },
  {
    id: 'CHK-0420',
    title: 'Cleaning round — Food court',
    site: 'Riyadh Park',
    submitted: 'Today, 7:48 AM',
    by: 'M. Hassan',
    progress: '18/20',
    status: 'Awaiting',
  },
  {
    id: 'CHK-0419',
    title: 'Fire drill verification',
    site: 'SAMA Mall',
    submitted: 'Apr 28',
    by: 'O. Najjar',
    progress: '12/12',
    status: 'Approved',
  },
  {
    id: 'CHK-0418',
    title: 'Vendor compliance audit',
    site: 'Tower Plaza',
    submitted: 'Apr 28',
    by: 'L. Haddad',
    progress: '15/16',
    status: 'Approved',
  },
] as const satisfies readonly ChecklistRecord[];
