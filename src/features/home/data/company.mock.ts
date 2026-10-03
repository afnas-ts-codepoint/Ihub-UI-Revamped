import type {
  CompanyAnalyticsStat,
  CompanyAnnouncement,
  CompanyCalendarEvent,
} from '../types/company.types';

/** @prototype index.html:L2301-L2316 `ANNOUNCEMENTS` (English only, as in the prototype). */
export const ANNOUNCEMENTS = [
  {
    body: 'CEO keynote + regional updates from every mall GM. Livestream for remote teams.',
    tag: 'Event',
    time: '3h',
    title: 'Q2 all-hands — Thursday 2 PM',
  },
  {
    body: 'Per-diem rates updated. Travel pre-approval threshold raised from 400 to 800 KWD.',
    tag: 'Policy',
    time: '1d',
    title: 'New expense policy effective May 1',
  },
  {
    body: 'Core hours 10:00 AM–4:00 PM. Flexible start between 9:00 AM and 11:00 AM.',
    tag: 'HR',
    time: '2d',
    title: 'Ramadan working hours',
  },
] as const satisfies readonly CompanyAnnouncement[];

/** @prototype index.html:L2317-L2340 `CALENDAR_EVENTS` (English only, as in the prototype). */
export const CALENDAR_EVENTS = [
  { day: 19, time: '2:00 PM', title: 'Today — Board review' },
  { day: 21, time: '2:00 PM', title: 'Q2 All-Hands' },
  { day: 22, time: '10:30 AM', title: '1:1 with Sara' },
  { day: 24, time: 'All day', title: 'Budget lockdown' },
  { day: 28, time: '9:00 AM', title: 'HR policy rollout' },
] as const satisfies readonly CompanyCalendarEvent[];

/**
 * The three stat tiles' values and notes are English literals in the
 * prototype, even in Arabic; only the labels are translated.
 * @prototype index.html:L14050 `AnalyticsCard`
 */
export const ANALYTICS_STATS = [
  { labelKey: 'company.analytics.stats.revenue', note: '+12.4% YoY', tone: 'ok', value: 'KWD 6.9M' },
  { labelKey: 'company.analytics.stats.headcount', note: '+48 this Q', tone: 'neutral', value: '1,248' },
  { labelKey: 'company.analytics.stats.nps', note: '↑ 4 pts', tone: 'ok', value: '62' },
] as const satisfies readonly CompanyAnalyticsStat[];

export const ANALYTICS_MONTHLY_SERIES = [
  { label: 'J', value: 44 },
  { label: 'F', value: 48 },
  { label: 'M', value: 52 },
  { label: 'A', value: 58 },
  { label: 'M', value: 54 },
  { label: 'J', value: 62 },
  { label: 'J', value: 68 },
  { label: 'A', value: 71 },
  { label: 'S', value: 65 },
  { label: 'O', value: 72 },
  { label: 'N', value: 78 },
  { label: 'D', value: 84 },
] as const;
