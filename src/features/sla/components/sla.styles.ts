import type { SlaPriorityId } from '../types/sla.types';
export const cardClass =
  'flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]';
export const primaryButton =
  'rounded-menu border border-accent bg-accent px-3.5 py-2 text-sm-plus font-semibold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
export const secondaryButton =
  'rounded-menu border border-line-strong bg-surface px-3.5 py-2 text-sm-plus font-semibold text-fg hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
export const dangerButton =
  'rounded-menu border border-bad bg-bad px-3.5 py-2 text-sm-plus font-semibold text-white hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bad';
export const priorityDotClass: Record<SlaPriorityId, string> = {
  P1: 'bg-bad',
  P2: 'bg-[var(--brand-yellow)]',
  P3: 'bg-[var(--blue-med)]',
  P4: 'bg-fg-3',
};
export function priorityId(label: string): SlaPriorityId {
  if (label === 'Critical') return 'P1';
  if (label === 'High') return 'P2';
  if (label === 'Medium') return 'P3';
  return 'P4';
}
