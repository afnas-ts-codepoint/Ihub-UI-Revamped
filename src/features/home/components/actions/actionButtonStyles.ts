type ActionButtonVariant = 'ghost' | 'primary' | 'secondary';
type ActionButtonSize = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-line disabled:bg-raised disabled:text-fg-4';

const variants: Readonly<Record<ActionButtonVariant, string>> = {
  ghost:
    'border-transparent bg-transparent text-fg-2 hover:bg-raised hover:text-fg',
  primary:
    'border-transparent bg-interactive text-accent-ink hover:bg-interactive-strong',
  secondary: 'border-line-strong bg-surface text-fg hover:bg-raised',
};

const sizes: Readonly<Record<ActionButtonSize, string>> = {
  md: 'h-10 gap-2.5 px-5 text-md',
  sm: 'h-8 gap-2 px-3.5 text-base',
};

/**
 * The prototype's `.btn` (`primary`, `ghost`, plain) at its two sizes: default
 * 40px and `sm` 32px.
 * @prototype ihub/index.html:L385-L430 `.btn`
 */
export const actionButtonClass = (
  variant: ActionButtonVariant,
  size: ActionButtonSize = 'md',
) => `${base} ${variants[variant]} ${sizes[size]}`;
