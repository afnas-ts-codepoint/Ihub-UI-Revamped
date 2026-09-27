import { cn } from '@/shared/lib/cn';

export type SegmentedRadioOption = Readonly<{ label: string; value: string }>;

type Props = Readonly<{
  ariaLabel: string;
  disabled?: boolean;
  name: string;
  onChange: (value: string) => void;
  options: readonly SegmentedRadioOption[];
  value: string;
}>;

export function SegmentedRadio({ ariaLabel, disabled, name, onChange, options, value }: Props) {
  return (
    <div
      aria-label={ariaLabel}
      className="inline-flex w-fit gap-0.5 rounded-menu border border-line bg-inset p-0.75"
      role="radiogroup"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.75 rounded-lg px-3.5 py-1.75 text-base',
              selected ? 'bg-surface font-bold text-accent shadow-sm' : 'font-medium text-fg-2',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            key={option.value}
          >
            <input
              checked={selected}
              className="size-3.5 accent-accent"
              disabled={disabled}
              name={name}
              onChange={() => { onChange(option.value); }}
              type="radio"
              value={option.value}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
