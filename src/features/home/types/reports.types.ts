import type { LocalizedText } from '@/shared/i18n/localized';

export type HomeReportItem = Readonly<{
  id: string;
  label: LocalizedText;
}>;

export type HomeReportCategory = Readonly<{
  id: string;
  items: readonly [HomeReportItem, ...HomeReportItem[]];
  label: LocalizedText;
}>;
