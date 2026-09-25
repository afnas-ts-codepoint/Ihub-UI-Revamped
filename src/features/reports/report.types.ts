import type { RecordFilterKind } from '@/features/organization';
import type { LocalizedText } from '@/shared/i18n/localized';

export type ReportDefinition = Readonly<{
  columns: readonly string[];
  kind: RecordFilterKind;
  label: LocalizedText;
  rows: readonly (readonly string[])[];
  totals: Readonly<{ label: string; value: string }> | null;
}>;
