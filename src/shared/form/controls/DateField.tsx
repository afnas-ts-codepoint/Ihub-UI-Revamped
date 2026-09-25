import { Popover } from 'radix-ui';
import { CalendarDays, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getCalendarLabels } from '@/shared/i18n/calendar';
import { normalizeLocale } from '@/shared/i18n/i18n';

const parseDate = (value: string | undefined) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : null;
};

const toIsoDate = (date: Date) =>
  `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

type DateFieldProps = Readonly<{
  ariaLabel?: string;
  id?: string;
  max?: string;
  min?: string;
  name?: string;
  onChange: (value: string) => void;
  value: string;
}>;

/** @prototype index.html:L1489-L1576 branded calendar field. */
export function DateField({
  ariaLabel,
  id,
  max,
  min,
  name,
  onChange,
  value,
}: DateFieldProps) {
  const { i18n, t } = useTranslation();
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const { months, weekdaysShort } = getCalendarLabels(locale);
  const selected = parseDate(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected ?? new Date());

  const days = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const result: (Date | null)[] = Array.from(
      { length: new Date(year, month, 1).getDay() },
      () => null,
    );
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day += 1) {
      result.push(new Date(year, month, day));
    }
    return result;
  }, [view]);

  const minimum = parseDate(min);
  const maximum = parseDate(max);
  const today = toIsoDate(new Date());
  const selectedLabel = selected
    ? [
        String(selected.getDate()),
        months[selected.getMonth()]?.slice(0, 3) ?? '',
        String(selected.getFullYear()),
      ].join(' ')
    : '';

  return (
    <Popover.Root
      onOpenChange={(nextOpen) => {
        if (nextOpen) setView(parseDate(value) ?? new Date());
        setOpen(nextOpen);
      }}
      open={open}
    >
      <Popover.Anchor asChild>
        <div className="flex min-w-0 items-center rounded-menu border border-line-strong bg-canvas focus-within:border-accent">
          <Popover.Trigger asChild>
            <button
              aria-label={ariaLabel}
              className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-start text-base"
              id={id}
              name={name}
              type="button"
            >
              <span className={selected ? 'min-w-0 flex-1 truncate text-fg' : 'min-w-0 flex-1 truncate text-fg-3'}>
                {selectedLabel || t('form.date.any')}
              </span>
              <CalendarDays aria-hidden="true" className="text-fg-4" size={14} />
            </button>
          </Popover.Trigger>
          {selected ? (
            <button
              aria-label={t('form.date.clearDate')}
              className="me-2 inline-flex text-fg-3"
              onClick={() => { onChange(''); }}
              type="button"
            >
              <X aria-hidden="true" size={12} />
            </button>
          ) : null}
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[500] w-[262px] rounded-dialog border border-line bg-surface p-3 shadow-popover"
          sideOffset={6}
        >
          <div className="mb-2.5 flex items-center gap-2">
            <button
              aria-label={t('form.date.previousMonth')}
              className="flex h-[26px] w-[26px] items-center justify-center rounded-compact border border-line-strong bg-surface text-sm text-fg-2"
              onClick={() => { setView(
                  new Date(view.getFullYear(), view.getMonth() - 1, 1),
                ); }
              }
              type="button"
            >
              {locale === 'ar' ? '›' : '‹'}
            </button>
            <span className="flex-1 text-center text-base font-semibold text-fg">
              {months[view.getMonth()]} {String(view.getFullYear())}
            </span>
            <button
              aria-label={t('form.date.nextMonth')}
              className="flex h-[26px] w-[26px] items-center justify-center rounded-compact border border-line-strong bg-surface text-sm text-fg-2"
              onClick={() => { setView(
                  new Date(view.getFullYear(), view.getMonth() + 1, 1),
                ); }
              }
              type="button"
            >
              {locale === 'ar' ? '‹' : '›'}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {weekdaysShort.map((weekday, index) => (
              <span
                className="py-0.5 text-center text-2xs-plus font-semibold tracking-wide text-fg-4"
                key={`${weekday}-${String(index)}`}
              >
                {weekday}
              </span>
            ))}
            {days.map((date, index) => {
              if (!date)
                return (
                  <span aria-hidden="true" key={`empty-${String(index)}`} />
                );
              const iso = toIsoDate(date);
              const isSelected = iso === value;
              const isToday = iso === today;
              const isDisabled =
                (minimum !== null && date < minimum) ||
                (maximum !== null && date > maximum);
              return (
                <button
                  aria-label={iso}
                  aria-pressed={isSelected}
                  className="h-[30px] rounded-lg border border-transparent text-sm-plus font-medium text-fg disabled:cursor-not-allowed disabled:text-fg-4 disabled:opacity-45 data-[selected=true]:bg-accent data-[selected=true]:font-semibold data-[selected=true]:text-accent-ink data-[today=true]:border-accent/40"
                  data-selected={isSelected}
                  data-today={isToday && !isSelected}
                  disabled={isDisabled}
                  key={iso}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex gap-2 border-t border-line pt-2.5">
            <button
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              type="button"
            >
              {t('form.date.today')}
            </button>
            <button
              className="ms-auto rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              type="button"
            >
              {t('form.date.clear')}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { parseDate, toIsoDate };
