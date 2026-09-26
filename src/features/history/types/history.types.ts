export type HistoryAction =
  | 'approved'
  | 'closed'
  | 'created'
  | 'edited'
  | 'rejected'
  | 'returned'
  | 'submitted'
  | 'verified';

export type HistoryTone = '' | 'bad' | 'ok' | 'warn';

export type HistoryRow = Readonly<{
  action: HistoryAction;
  by: string;
  date: string;
  ref: string;
  tone: HistoryTone;
}>;
