import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type Props = Readonly<{
  className?: string;
  indicatorClassName?: string;
  label: string;
  markerValue?: number;
  value: number;
}> &
  Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'>;
const bound = (value: number) => Math.min(100, Math.max(0, value));

/** Generic bounded progress presentation; consumers own calculations, labels, and tones. */
export function ProgressBar({
  className,
  indicatorClassName,
  label,
  markerValue,
  value,
  ...props
}: Props) {
  const boundedValue = bound(value);
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={boundedValue}
      className={cn(
        'relative h-2 overflow-hidden rounded-full bg-inset',
        className,
      )}
      role="progressbar"
      {...props}
    >
      <span
        className={cn('block h-full rounded-full bg-info', indicatorClassName)}
        data-testid="progress-indicator"
        style={{ width: `${String(boundedValue)}%` }}
      />
      {markerValue === undefined ? null : (
        <span
          aria-hidden="true"
          className="absolute top-[-3px] h-4 w-0.5 bg-fg opacity-55"
          data-testid="progress-marker"
          style={{
            insetInlineStart: `calc(${String(bound(markerValue))}% - 1px)`,
          }}
        />
      )}
    </div>
  );
}
