import type { PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type FieldLabelProps = PropsWithChildren<{
  htmlFor?: string;
  required?: boolean;
}>;

export function FieldLabel({ children, htmlFor, required }: FieldLabelProps) {
  return (
    <label
      className="text-xs font-semibold tracking-wider text-fg-3 uppercase"
      htmlFor={htmlFor}
    >
      {children}
      {required ? <span aria-hidden="true">{' *'}</span> : null}
    </label>
  );
}

type FieldProps = PropsWithChildren<{
  className?: string;
  hint?: ReactNode;
  id?: string;
  label: ReactNode;
  required?: boolean;
}>;

export function Field({
  children,
  className,
  hint,
  id,
  label,
  required,
}: FieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      {hint ? <span className="text-xs-plus text-fg-3">{hint}</span> : null}
      {children}
    </div>
  );
}
