const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50';

export const purchasingButtonStyles = {
  ghost: `${base} text-fg-2 hover:bg-inset`,
  primary: `${base} bg-interactive text-accent-ink hover:brightness-95`,
  secondary: `${base} border border-line-strong bg-surface text-fg hover:bg-inset`,
} as const;

/** @prototype index.html:L10150-L10152 `reqActBtn`; index.html:L10247-L10250 the functional Review row action. */
export const rowActionButtonClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-xs font-semibold text-fg';

/** @prototype index.html:L9973 `seg` segmented control. */
export const segmentedOptionClass = (active: boolean) =>
  `rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap ${active ? 'bg-surface font-semibold text-accent shadow-sm' : 'bg-transparent text-fg-2'}`;
