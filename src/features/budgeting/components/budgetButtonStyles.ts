const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50';

export const budgetButtonStyles = {
  ghost: `${base} text-fg-2 hover:bg-inset`,
  primary: `${base} bg-interactive text-accent-ink hover:brightness-95`,
  secondary: `${base} border border-line-strong bg-surface text-fg hover:bg-inset`,
} as const;

export const smallBudgetButtonStyles = {
  ghost: `${budgetButtonStyles.ghost} px-2.5 py-1.5 text-xs`,
  primary: `${budgetButtonStyles.primary} px-2.5 py-1.5 text-xs`,
  secondary: `${budgetButtonStyles.secondary} px-2.5 py-1.5 text-xs`,
} as const;
