export type ChecklistStatus = 'Approved' | 'Awaiting';

export type ChecklistRecord = Readonly<{
  by: string;
  id: string;
  progress: string;
  site: string;
  status: ChecklistStatus;
  submitted: string;
  title: string;
}>;

export type ChecklistTab = Readonly<{
  displayCount: number;
  id: 'other' | 'unapproved';
}>;
