export type SnagPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type SnagSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type SnagAttachment = Readonly<{ caption: string; name: string }>;

export type SnagRow = Readonly<{
  closed: number;
  due: string;
  id: string;
  items: number;
  party: string;
  priority: SnagPriority | 'Med';
  priorityTone: 'bad' | 'neutral' | 'warn';
  site: string;
  status: string;
  statusTone: 'neutral' | 'ok' | 'warn';
  title: string;
}>;

export type SnagDraft = Readonly<{
  area: string;
  details: string;
  enqRef: string;
  files: readonly SnagAttachment[];
  incRef: string;
  kpi: string;
  location: string;
  logNote: string;
  matrix: readonly string[];
  obsRef: string;
  owner: string;
  priority: SnagPriority | '';
  severity: SnagSeverity | '';
  subArea: string;
  touch: string;
  zone: string;
}>;

export type SnagListsView = 'add' | 'listing' | 'report';
