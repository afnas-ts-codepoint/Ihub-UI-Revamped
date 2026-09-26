import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/lib/cn';
export type TextInputProps = ComponentPropsWithoutRef<'input'>;
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      className={cn(
        'w-full rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);
TextInput.displayName = 'TextInput';
