import { useTranslation } from 'react-i18next';

import { CALENDAR_EVENTS } from '../../data/company.mock';
import { HomeSectionHead } from '../sections/HomeSectionHead';
import { MonthCalendar } from './MonthCalendar';

/** The month and its abbreviation are English literals in the prototype, in Arabic too. */
const CALENDAR_MONTH_TITLE = 'April 2026';
const CALENDAR_MONTH_ABBREVIATION = 'Apr';

/**
 * Month grid plus the next three events.
 * @prototype index.html:L14053-L14055 `CalendarCard`
 */
export function CalendarCard() {
  const { t } = useTranslation('home');

  return (
    <div className="rounded-lg border border-line bg-surface p-[26px]">
      <HomeSectionHead sub={CALENDAR_MONTH_TITLE} title={t('company.calendar.title')} />
      <MonthCalendar events={CALENDAR_EVENTS} />
      <div className="mt-[18px] border-t border-line pt-3.5">
        {CALENDAR_EVENTS.slice(0, 3).map((event) => (
          <div className="flex items-center gap-3 py-2" key={event.day}>
            <div className="num w-[34px] text-center text-sm text-fg-3">
              <div className="display text-2xl font-medium text-fg">{event.day}</div>
              <div className="text-2xs uppercase">{CALENDAR_MONTH_ABBREVIATION}</div>
            </div>
            <div className="flex-1">
              <div className="text-md font-medium">{event.title}</div>
              <div className="num text-sm text-fg-3">{event.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
