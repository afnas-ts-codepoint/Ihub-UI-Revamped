import { Checkbox as RadixCheckbox } from 'radix-ui';
import { Check } from 'lucide-react';

type CheckboxProps = Readonly<{
  checked: boolean;
  disabled?: boolean;
  id?: string;
  label: string;
  onChange: (checked: boolean) => void;
}>;

export function Checkbox({
  checked,
  disabled,
  id,
  label,
  onChange,
}: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-base text-fg">
      <RadixCheckbox.Root
        aria-label={label}
        checked={checked}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-line-strong bg-canvas text-accent data-[state=checked]:border-accent data-[state=checked]:bg-accent-dim"
        disabled={disabled}
        id={id}
        onCheckedChange={(next) => {
          onChange(next === true);
        }}
      >
        <RadixCheckbox.Indicator>
          <Check aria-hidden="true" size={12} strokeWidth={2} />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span>{label}</span>
    </label>
  );
}
