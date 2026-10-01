export type IncidentTone = 'bad' | 'info' | 'neutral' | 'ok' | 'warn';

export type IncidentAttachment = Readonly<{ caption: string; name: string }>;

export type IncidentHistoryEntry = Readonly<{
  by: string;
  text: string;
  tone: 'created' | 'update' | 'warn';
  when: string;
}>;

export type IncidentDetail = Readonly<{
  area: string;
  date: string;
  department: string;
  description: string;
  documents: readonly string[];
  employees: string;
  employeePosition: string;
  facility: string;
  guest: string;
  guestAction: string;
  guestContact: string;
  guestEmail: string;
  houseAction: string;
  impact: string;
  injuries: string;
  location: string;
  mainCategory: string;
  notes: string;
  risk: string;
  scenario: string;
  specificArea: string;
  subCategory: string;
  time: string;
  witnessEmail: string;
  zone: string;
}>;

export type IncidentRow = Readonly<{
  date: string;
  detail: IncidentDetail;
  id: string;
  priority: string;
  priorityTone: IncidentTone;
  raisedBy: string;
  site: string;
  status: string;
  statusTone: IncidentTone;
  title: string;
}>;

export type IncidentRuntimeRow = IncidentRow &
  Readonly<{
    history: readonly IncidentHistoryEntry[];
    taskRef?: string;
    tracked: boolean;
  }>;

export type IncidentReportValues = Readonly<{
  area: string;
  attachments: readonly IncidentAttachment[];
  date: string;
  department: string;
  description: string;
  employees: string;
  employeePosition: string;
  facility: 'no' | 'yes';
  guestAction: string;
  guestContact: string;
  guestEmail: string;
  guestName: string;
  houseAction: string;
  impactType: string;
  injuries: 'no' | 'yes';
  location: string;
  mainCategory: string;
  notes: string;
  riskType: string;
  scenario: string;
  specificArea: string;
  subCategory: string;
  time: string;
  witnessEmail: string;
  zone: string;
}>;
