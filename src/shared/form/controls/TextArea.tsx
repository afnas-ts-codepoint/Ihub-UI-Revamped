import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/lib/cn';
export type TextAreaProps = ComponentPropsWithoutRef<'textarea'>;
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'min-h-20 w-full resize-y rounded-menu border border-line-strong bg-canvas px-3 py-2.5 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
TextArea.displayName = 'TextArea';
