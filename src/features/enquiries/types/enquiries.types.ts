export type EnquiryPriority = 'High' | 'Low' | 'Medium';

export type EnquiryAttachment = Readonly<{
  caption: string;
  name: string;
}>;

export type EnquiryDraft = Readonly<{
  description: string;
  files: readonly EnquiryAttachment[];
  logNote: string;
  matrix: readonly string[];
  owner: string;
  priority: EnquiryPriority | '';
  subject: string;
}>;

export type EnquiryHistoryRow = Readonly<{
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
