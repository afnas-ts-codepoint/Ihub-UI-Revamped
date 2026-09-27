import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/cn';

type Props = PropsWithChildren<{
  className?: string;
  columns?: 3 | 4;
}>;

export function FormGrid({ children, className, columns = 4 }: Props) {
  return (
    <div
      className={cn(
        'grid gap-3.5',
        columns === 3 ? 'form-grid-3' : 'form-grid-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
