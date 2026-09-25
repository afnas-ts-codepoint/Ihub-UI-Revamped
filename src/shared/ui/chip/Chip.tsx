import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib/cn';

type ChipProps = ComponentPropsWithoutRef<'span'> & {
  tone?: 'accent' | 'bad' | 'info' | 'neutral' | 'ok' | 'warn';
};

export function Chip({ className, tone = 'neutral', ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        tone === 'accent' && 'chip-tone-accent',
        tone === 'ok' && 'chip-tone-ok',
        tone === 'warn' && 'chip-tone-warn',
        tone === 'bad' && 'chip-tone-bad',
        tone === 'info' && 'chip-tone-info',
        tone === 'neutral' && 'border-line-strong bg-inset text-fg-2',
        className,
      )}
      {...props}
    />
  );
}
