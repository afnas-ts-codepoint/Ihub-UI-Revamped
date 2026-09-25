export const recordFilterKinds = [
  'incident',
  'task',
  'sheet',
  'observation',
  'enquiry',
  'budget',
  'history',
  'request',
] as const;

export type RecordFilterKind = (typeof recordFilterKinds)[number];
export type RecordFilterExtraKey = 'priority' | 'risk' | 'status';

export type RecordFilterValue = Readonly<{
  activity: string;
  assignees: readonly string[];
  cat: string;
  dept: string;
  flags: readonly string[];
  from: string;
  locations: readonly string[];
  matrix: readonly string[];
  num: string;
  origin: string;
  priority: string;
  risk: string;
  status: string;
  sub: string;
  subject: string;
  to: string;
  zones: readonly string[];
}>;

export type RecordExportDefinition = Readonly<{
  columns: readonly string[];
  label: string;
  rows: readonly (readonly string[])[];
}>;

export function createEmptyRecordFilter(): RecordFilterValue {
  return {
    activity: '',
    assignees: [],
    cat: '',
    dept: '',
    flags: [],
    from: '',
    locations: [],
    matrix: [],
    num: '',
    origin: '',
    priority: '',
    risk: '',
    status: '',
    sub: '',
    subject: '',
    to: '',
    zones: [],
  };
}
