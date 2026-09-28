export type ObservationSeverity = 'High' | 'Low' | 'Medium';
export type ObservationPriority = 'High' | 'Low' | 'Medium';

export type ObservationAttachment = Readonly<{
  caption: string;
  name: string;
}>;

export type ObservationLinkKind = 'enquiry' | 'incident' | 'task';

export type ObservationDraft = Readonly<{
  area: string;
  department: string;
  enquirySelection: string;
  files: readonly ObservationAttachment[];
  finding: string;
  incidentSelection: string;
  linkedEnquiries: readonly string[];
  linkedIncidents: readonly string[];
  linkedTasks: readonly string[];
  location: string;
  logNote: string;
  matrix: readonly string[];
  owner: string;
  priority: ObservationPriority | '';
  recommendations: string;
  severity: ObservationSeverity | '';
  subArea: string;
  subject: string;
  taskSelection: string;
  touchPoint: string;
  zone: string;
}>;

export type ObservationRow = Readonly<{
  assignee: string;
  date: string;
  id: string;
  raised: string;
  severity: ObservationSeverity;
  severityTone: 'bad' | 'neutral' | 'warn';
  site: string;
  status: string;
  title: string;
}>;

export type ObservationView = 'add' | 'assignment' | 'history' | 'report';
