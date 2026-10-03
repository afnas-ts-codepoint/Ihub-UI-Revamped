import type { CompanyCalendarEvent } from '../../types/company.types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** The prototype draws a fixed 30-day month that starts on a Wednesday. */
const LEADING_BLANKS = 3;
const DAYS_IN_MONTH = 30;
const TODAY = 19;

type MonthCalendarProps = Readonly<{
  events: readonly CompanyCalendarEvent[];
}>;

/**
 * Static month grid; today is filled and days with events carry a dot. Day
 * cells are not interactive in the prototype either.
 * @prototype index.html:L1992-L2043 `Calendar`
 */
export function MonthCalendar({ events }: MonthCalendarProps) {
  const eventDays = new Set(events.map((event) => event.day));
  const cells: (number | null)[] = [
    ...Array.from({ length: LEADING_BLANKS }, () => null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, index) => index + 1),
  ];

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((weekday, index) => (
          <div
            className="text-2xs font-semibold tracking-[0.1em] text-fg-4"
            key={`${weekday}-${String(index)}`}
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1" data-testid="month-calendar-days">
        {cells.map((day, index) => {
          const today = day === TODAY;
          const hasEvent = day !== null && eventDays.has(day);
          return (
            <div
              className={`num relative flex aspect-square items-center justify-center rounded border text-sm ${
                today
                  ? 'border-transparent bg-accent font-bold text-accent-ink'
                  : `border-transparent ${hasEvent ? 'bg-inset' : 'bg-transparent'} ${day ? 'text-fg-2' : 'text-transparent'}`
              }`}
              key={day ?? `blank-${String(index)}`}
            >
              {day}
              {hasEvent && !today ? (
                <span className="absolute bottom-1 size-1 rounded-full bg-accent" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
