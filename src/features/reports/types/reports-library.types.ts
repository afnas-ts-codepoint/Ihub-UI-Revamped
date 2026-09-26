export const REPORT_LIBRARY_GROUPS = [
  'HR',
  'Workforce',
  'Performance',
  'Finance',
  'Operations',
  'Quality',
  'System',
] as const;

export type ReportLibraryGroup = (typeof REPORT_LIBRARY_GROUPS)[number];

export type ReportLibraryItem = Readonly<{
  group: ReportLibraryGroup;
  id: string;
  label: string;
}>;
