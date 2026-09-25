import { Popover } from 'radix-ui';
import { ChevronDown, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '@/shared/form/controls/Checkbox';
import type { SelectOption } from '@/shared/form/controls/Select';
import { Chip } from '@/shared/ui/chip/Chip';

type MultiSelectChipsProps = Readonly<{
  ariaLabel: string;
  onChange: (value: readonly string[]) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  value: readonly string[];
}>;

export function MultiSelectChips({
  ariaLabel,
  onChange,
  options,
  placeholder,
  value,
}: MultiSelectChipsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const visible = useMemo(() => {
    const normalized = query.toLocaleLowerCase();
    return options.filter((option) =>
      option.label.toLocaleLowerCase().includes(normalized),
    );
  }, [options, query]);
  const labels = new Map(options.map((option) => [option.value, option.label]));

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Popover.Root
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        open={open}
      >
        <Popover.Trigger asChild>
          <button
            aria-label={ariaLabel}
            className="flex w-full items-center gap-2 rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-start text-base"
            type="button"
          >
            <span className={value.length ? 'flex-1 text-fg' : 'flex-1 text-fg-3'}>
              {value.length
                ? value.map((item) => labels.get(item) ?? item).join(', ')
                : (placeholder ?? t('form.any'))}
            </span>
            {value.length ? <Chip tone="accent">{value.length}</Chip> : null}
            <ChevronDown aria-hidden="true" className="text-fg-3" size={14} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            className="z-[500] flex max-h-[300px] min-w-[240px] flex-col gap-0.5 overflow-y-auto rounded-dialog border border-line bg-surface p-1.5 shadow-popover"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              searchRef.current?.focus();
            }}
            sideOffset={6}
          >
            <input
              aria-label={t('form.multiSelect.search')}
              className="mb-1 rounded-compact border border-line-strong bg-canvas px-2.5 py-2 text-base outline-none focus:border-accent"
              onChange={(event) => { setQuery(event.target.value); }}
              placeholder={t('form.multiSelect.search')}
              ref={searchRef}
              value={query}
            />
            {visible.length ? (
              visible.map((option) => (
                <div
                  className="rounded-lg px-2 py-1.5 data-[selected=true]:bg-inset"
                  data-selected={value.includes(option.value)}
                  key={option.value}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    label={option.label}
                    onChange={() => { toggle(option.value); }}
                  />
                </div>
              ))
            ) : (
              <p className="m-0 px-2.5 py-2 text-sm-plus text-fg-3">
                {t('form.select.noMatches')}
              </p>
            )}
            {value.length ? (
              <button
                className="mt-1 px-2 py-1.5 text-start text-sm-plus font-semibold text-accent"
                onClick={() => { onChange([]); }}
                type="button"
              >
                {t('form.multiSelect.clear')}
              </button>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {value.length ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Chip className="gap-1" key={item}>
              <span>{labels.get(item) ?? item}</span>
              <button
                aria-label={t('form.multiSelect.remove', {
                  value: labels.get(item) ?? item,
                })}
                className="inline-flex text-fg-3"
                onClick={() => { toggle(item); }}
                type="button"
              >
                <X aria-hidden="true" size={11} />
              </button>
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
}
