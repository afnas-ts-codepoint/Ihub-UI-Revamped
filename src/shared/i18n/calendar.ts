import { i18n, type Locale } from '@/shared/i18n/i18n';

export type CalendarLabels = {
  months: readonly string[];
  weekdaysShort: readonly string[];
};

export function getCalendarLabels(locale: Locale): CalendarLabels {
  const translate = i18n.getFixedT(locale, 'common');

  return {
    months: translate('calendar.months', { returnObjects: true }),
    weekdaysShort: translate('calendar.weekdaysShort', {
      returnObjects: true,
    }),
  };
}
