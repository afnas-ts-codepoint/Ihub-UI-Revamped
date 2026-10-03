export type CompanyAnnouncement = Readonly<{
  body: string;
  tag: string;
  time: string;
  title: string;
}>;

export type CompanyCalendarEvent = Readonly<{
  day: number;
  time: string;
  title: string;
}>;

export type CompanyAnalyticsStat = Readonly<{
  labelKey: `company.analytics.stats.${string}`;
  note: string;
  tone: 'neutral' | 'ok';
  value: string;
}>;
