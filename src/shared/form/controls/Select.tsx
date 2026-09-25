import { Popover } from 'radix-ui';
import { ChevronDown } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';

export type SelectOption = Readonly<{
  disabled?: boolean;
  label: string;
  value: string;
}>;

type SelectProps = Readonly<{
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  value: string;
}>;

/** @prototype index.html:L50-L96 searchable native-select replacement. */
export function Select({
  ariaLabel,
  className,
  disabled,
  id,
  name,
  onChange,
  options,
  placeholder,
  value,
}: SelectProps) {
  const { t } = useTranslation();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value);
  const visible = useMemo(() => {
    const normalized = query.toLocaleLowerCase();
    return options.filter(
      (option) =>
        !option.disabled &&
        option.value !== '' &&
        option.label.toLocaleLowerCase().includes(normalized),
    );
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  const pick = (option: SelectOption) => {
    onChange(option.value);
    close();
  };

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Anchor asChild>
        <div className={cn('relative min-w-0', className)}>
          <input
            aria-activedescendant={
              open && visible[activeIndex]
                ? `${listboxId}-${String(activeIndex)}`
                : undefined
            }
            aria-controls={open ? listboxId : undefined}
            aria-expanded={open}
            aria-label={ariaLabel}
            aria-haspopup="listbox"
            autoComplete="off"
            className="w-full rounded-menu border border-line-strong bg-canvas px-3 py-2.5 pe-7 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            id={id}
            name={name}
            onChange={(event) => {
              const nextQuery =
                query === '' && selected?.label && event.target.value.startsWith(selected.label)
                  ? event.target.value.slice(selected.label.length)
                  : event.target.value;
              setQuery(nextQuery);
              setActiveIndex(0);
              setOpen(true);
            }}
            onFocus={() => {
              setQuery('');
              setActiveIndex(0);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) =>
                  Math.min(current + 1, Math.max(visible.length - 1, 0)),
                );
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((current) => Math.max(current - 1, 0));
              } else if (event.key === 'Enter' && open) {
                const option = visible[activeIndex];
                if (option) {
                  event.preventDefault();
                  pick(option);
                }
              } else if (event.key === 'Escape') {
                event.stopPropagation();
                close();
              }
            }}
            onMouseDown={(event) => {
              if (!disabled) {
                if (document.activeElement === event.currentTarget) {
                  event.preventDefault();
                }
                event.currentTarget.value = '';
                setQuery('');
                setActiveIndex(0);
                setOpen(true);
              }
            }}
            placeholder={placeholder ?? t('form.select.placeholder')}
            role="combobox"
            value={open ? query : (selected?.label ?? '')}
          />
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-fg-3"
            size={13}
          />
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[500] max-h-[260px] min-w-[var(--radix-popover-trigger-width)] overflow-y-auto rounded-lg border border-line-strong bg-surface p-1 shadow-menu outline-none"
          onOpenAutoFocus={(event) => { event.preventDefault(); }}
          sideOffset={4}
        >
          <div id={listboxId} role="listbox">
            {visible.length ? (
              visible.map((option, index) => (
                <button
                  aria-selected={option.value === value}
                  className="block w-full rounded-compact px-2.5 py-2 text-start text-base font-medium text-fg data-[active=true]:bg-inset data-[selected=true]:font-semibold data-[selected=true]:text-accent"
                  data-active={index === activeIndex}
                  data-selected={option.value === value}
                  id={`${listboxId}-${String(index)}`}
                  key={option.value}
                  onMouseDown={(event) => { event.preventDefault(); }}
                  onMouseEnter={() => { setActiveIndex(index); }}
                  onClick={() => { pick(option); }}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="m-0 px-2.5 py-2 text-sm-plus text-fg-3">
                {t('form.select.noMatches')}
              </p>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
