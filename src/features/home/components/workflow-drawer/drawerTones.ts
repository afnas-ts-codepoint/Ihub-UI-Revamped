import type {
  HomeDueState,
  HomeIncidentSeverity,
  HomeIncidentSla,
  HomePriority,
} from '../../types/home.types';
import type { IncidentFeedType } from '../../types/queue.types';
import type { IconName } from '@/shared/ui/icon/Icon';

export type DrawerChipTone = 'bad' | 'info' | 'neutral' | 'warn';

/**
 * Severity colour ladder. Full class names are listed so Tailwind can see them.
 * @prototype ihub/index.html:L12962 `SEV_COLOR`
 */
export const SEVERITY_TONE: Readonly<
  Record<
    HomeIncidentSeverity,
    Readonly<{ bar: string; chip: string; text: string; tile: string }>
  >
> = {
  critical: {
    bar: 'bg-bad',
    chip: 'bg-bad/[14%] text-bad',
    text: 'text-bad',
    tile: 'bg-bad/[16%] text-bad',
  },
  high: {
    bar: 'bg-brand-orange',
    chip: 'bg-brand-orange/[14%] text-brand-orange',
    text: 'text-brand-orange',
    tile: 'bg-brand-orange/[16%] text-brand-orange',
  },
  low: {
    bar: 'bg-info',
    chip: 'bg-info/[14%] text-info',
    text: 'text-info',
    tile: 'bg-info/[16%] text-info',
  },
  medium: {
    bar: 'bg-warn',
    chip: 'bg-warn/[14%] text-warn',
    text: 'text-warn',
    tile: 'bg-warn/[16%] text-warn',
  },
};

/** @prototype ihub/index.html:L12968 `PRIO_CHIP` */
export const PRIORITY_CHIP_TONE: Readonly<Record<HomePriority, DrawerChipTone>> = {
  critical: 'bad',
  high: 'bad',
  low: 'info',
  medium: 'warn',
};

/** @prototype ihub/index.html:L12974 `DUE_CHIP` */
export const DUE_CHIP_TONE: Readonly<Record<HomeDueState, DrawerChipTone>> = {
  later: 'neutral',
  overdue: 'bad',
  soon: 'info',
  today: 'warn',
};

/** Incident SLA caption colour (`breached` bad, `at-risk` warn, otherwise ok). */
export const SLA_TEXT_TONE: Readonly<Record<HomeIncidentSla, string>> = {
  'at-risk': 'text-warn',
  breached: 'text-bad',
  ok: 'text-ok',
};

/**
 * Live-update timeline colours and glyphs.
 * @prototype ihub/index.html:L12980 `FEED_TONE`
 */
export const FEED_TONE: Readonly<
  Record<IncidentFeedType, Readonly<{ border: string; icon: IconName; text: string }>>
> = {
  comment: { border: 'border-fg-3', icon: 'mail', text: 'text-fg-3' },
  escalation: { border: 'border-bad', icon: 'trend', text: 'text-bad' },
  owner: { border: 'border-accent', icon: 'users', text: 'text-accent' },
  resolution: { border: 'border-ok', icon: 'check', text: 'text-ok' },
  status: { border: 'border-info', icon: 'refresh', text: 'text-info' },
};

/** @prototype ihub/index.html:L12998 `cap` */
export const capitalise = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
