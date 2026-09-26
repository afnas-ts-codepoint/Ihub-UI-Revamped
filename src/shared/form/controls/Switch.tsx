import { cn } from '@/shared/lib/cn';

type SwitchProps = Readonly<{
  checked: boolean;
  className?: string;
}>;

/** Decorative workflow switch. The prototype exposes no interaction. */
export function Switch({ checked, className }: SwitchProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-[19px] w-[34px] shrink-0 rounded-full p-0.5 transition-colors',
        checked ? 'bg-accent' : 'bg-line-strong',
        className,
      )}
      data-state={checked ? 'checked' : 'unchecked'}
    >
      <span
        className={cn(
          'h-[15px] w-[15px] rounded-full bg-[#fff] shadow-segment transition-transform',
          checked ? 'translate-x-[15px] rtl:-translate-x-[15px]' : 'translate-x-0',
        )}
      />
    </span>
  );
}
