import { cn } from '@/shared/lib/cn';

export type SwatchRadioOption = Readonly<{
  colorClass: string;
  label: string;
  value: string;
}>;

type Props = Readonly<{
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: readonly SwatchRadioOption[];
  value: string;
}>;

export function SwatchRadio({ ariaLabel, disabled, onChange, options, value }: Props) {
  const move = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const nextIndex = (index + delta + options.length) % options.length;
    const next = options[nextIndex];
    if (!next) return;
    onChange(next.value);
    const radios = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[nextIndex]?.focus();
  };
  return (
    <div aria-label={ariaLabel} className="flex gap-2.5" role="radiogroup">
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            aria-checked={selected}
            aria-label={option.label}
            className={cn(
              'size-8.5 rounded-lg border-2 p-0 transition-opacity',
              option.colorClass,
              selected ? 'border-fg ring-3 ring-accent/15' : 'border-transparent',
              value && !selected && 'opacity-55',
            )}
            disabled={disabled}
            key={option.value}
            onClick={() => { onChange(selected ? '' : option.value); }}
            onKeyDown={(event) => { move(event, index); }}
            role="radio"
            tabIndex={selected || (!value && index === 0) ? 0 : -1}
            title={option.label}
            type="button"
          />
        );
      })}
    </div>
  );
}
