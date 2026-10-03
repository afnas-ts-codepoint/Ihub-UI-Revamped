import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';
import { ProgressRing } from '@/shared/ui/progress/ProgressRing';

import type {
  HomeAction,
  HomeCounts,
  HomeIncident,
} from '../../types/home.types';

export const HERO_ADVANCE_MS = 6_000;

type HeroCarouselProps = Readonly<{
  actions: readonly HomeAction[];
  children: ReactNode;
  counts: HomeCounts;
  incidents: readonly HomeIncident[];
}>;

type Segment = Readonly<{
  color: string;
  label: string;
  value: number;
}>;

function SegmentedRing({ label, segments }: Readonly<{ label: number; segments: readonly Segment[] }>) {
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const sum = segments.reduce((total, segment) => total + segment.value, 0) || 1;
  const visibleSegments = segments.filter((segment) => segment.value > 0);

  return (
    <div aria-hidden="true" className="relative size-16 shrink-0">
      <svg className="-rotate-90" height={size} width={size}>
        <circle cx={32} cy={32} fill="none" r={radius} stroke="var(--line)" strokeWidth={stroke} />
        {visibleSegments.map((segment, index) => {
            const length = (segment.value / sum) * circumference;
            const offset = visibleSegments
              .slice(0, index)
              .reduce(
                (total, prior) =>
                  total + (prior.value / sum) * circumference,
                0,
              );
            return (
              <circle
                cx={32}
                cy={32}
                fill="none"
                key={segment.label}
                r={radius}
                stroke={segment.color}
                strokeDasharray={`${String(length)} ${String(circumference - length)}`}
                strokeDashoffset={-offset}
                strokeWidth={stroke}
              />
            );
          })}
      </svg>
      <span className="num absolute inset-0 flex items-center justify-center text-base font-semibold">
        {label}
      </span>
    </div>
  );
}

function SlideHead({ eyebrow, ring, title }: Readonly<{ eyebrow: string; ring: ReactNode; title: ReactNode }>) {
  return (
    <div className="mb-[7px] flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium tracking-[0.16em] text-fg-3 uppercase">{eyebrow}</div>
        <div className="display mt-1.5 text-7xl leading-[1.1] font-medium">{title}</div>
      </div>
      {ring}
    </div>
  );
}

function SlideBottom({ caption, value }: Readonly<{ caption: string; value: number | string }>) {
  return (
    <>
      <div className="flex-1" />
      <hr className="my-2 border-0 border-t border-line" />
      <div className="display num text-12xl font-medium tracking-[-0.03em]">{value}</div>
      <div className="text-sm tracking-[0.14em] text-fg-3 uppercase">{caption}</div>
    </>
  );
}

/** @prototype index.html:L14899-L14976. */
export function HeroCarousel({ actions, children, counts, incidents }: HeroCarouselProps) {
  const { t } = useTranslation('home');
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const topIncident =
    incidents.find((incident) => incident.pinned) ??
    incidents.find((incident) => incident.severity === 'critical') ??
    incidents[0];
  const worst = actions.find((action) => action.dueState === 'overdue');
  const segments: readonly Segment[] = [
    { label: t('carousel.overdue'), value: counts.overdue, color: 'var(--bad)' },
    { label: t('carousel.dueToday'), value: counts.today, color: 'var(--warn)' },
    { label: t('carousel.thisWeek'), value: counts.soon, color: 'var(--info)' },
    { label: t('carousel.later'), value: counts.later, color: 'var(--ok)' },
  ];
  const slides = [
    <div className="flex h-full flex-col" key="status">
      <SlideHead
        eyebrow={t('carousel.statusDistribution')}
        ring={<SegmentedRing label={counts.actions} segments={segments} />}
        title={<><span className="num">{counts.actions}</span>{` ${t('carousel.openApprovals')}`}</>}
      />
      <div className="grid grid-cols-2 gap-x-7 gap-y-1.5">
        {segments.map((segment) => (
          <div className="flex items-center gap-2 text-sm text-fg-2" key={segment.label}>
            <span className="size-[7px] shrink-0 rounded-sm" style={{ background: segment.color }} />
            <span className="flex-1">{segment.label}</span>
            <span className="num font-semibold text-fg">{segment.value}</span>
          </div>
        ))}
      </div>
      <SlideBottom caption={t('carousel.onTrack')} value={`${String(counts.onTrackPercent)}%`} />
    </div>,
    <div className="flex h-full flex-col" key="overdue">
      <SlideHead
        eyebrow={t('carousel.mostOverdue')}
        ring={<ProgressRing label={String(counts.overdue)} size={64} stroke={6} value={counts.actions ? counts.overdue / counts.actions : 0} />}
        title={worst ? worst.title.split(' — ')[0] : t('carousel.nothingOverdue')}
      />
      {worst ? <div className="text-base leading-[1.55] text-fg-3">{`${worst.owner} · ${worst.dept}`}</div> : null}
      {worst ? <div className="text-base leading-[1.55] font-medium text-bad">{`${worst.due} · ${worst.amount}`}</div> : null}
      <SlideBottom caption={t('carousel.moreDueToday')} value={counts.today} />
    </div>,
    <div className="flex h-full flex-col" key="incidents">
      <SlideHead
        eyebrow={t('carousel.incidents')}
        ring={<ProgressRing label={String(counts.incidents)} size={64} stroke={6} value={topIncident?.progress ?? 0} />}
        title={<><span className="num">{counts.incidents}</span>{` ${t('carousel.openIncidents')}`}</>}
      />
      {topIncident ? <div className="text-base leading-[1.55] text-fg-3">{topIncident.title}</div> : null}
      {topIncident ? <div className="text-base leading-[1.55] text-fg-3">{`${topIncident.severity} · ${topIncident.status}`}</div> : null}
      <SlideBottom caption={t('carousel.approvalsInQueue')} value={counts.actions} />
    </div>,
    <div className="flex h-full flex-col" key="profile">{children}</div>,
  ];

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, HERO_ADVANCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex, paused, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      className="relative grid rounded-xl border border-line bg-raised p-6"
      data-paused={paused}
      data-testid="hero-carousel"
      onBlur={() => {
        setPaused(false);
      }}
      onFocus={() => {
        setPaused(true);
      }}
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
    >
      {slides.map((slide, index) => (
        <div
          aria-hidden={index !== activeIndex}
          className="col-start-1 row-start-1 min-w-0 transition-opacity duration-300 data-[active=false]:invisible data-[active=false]:opacity-0 data-[active=true]:visible data-[active=true]:opacity-100"
          data-active={index === activeIndex}
          data-testid={`hero-slide-${String(index)}`}
          key={index}
        >
          {slide}
        </div>
      ))}
      <div className="absolute end-6 bottom-6 flex items-center gap-3.5">
        <div className="flex items-center gap-1.5">
          {slides.map((_, index) => (
            <button
              aria-current={index === activeIndex}
              aria-label={`${t('carousel.slide')} ${String(index + 1)}`}
              className="h-1.5 rounded-full bg-line-strong transition-[width,background] data-[active=false]:w-1.5 data-[active=true]:w-[18px] data-[active=true]:bg-accent"
              data-active={index === activeIndex}
              key={index}
              onClick={() => {
                setActiveIndex(index);
              }}
              type="button"
            />
          ))}
        </div>
        <button
          aria-label={t('carousel.next')}
          className="flex size-[34px] items-center justify-center rounded-full border border-line-strong bg-surface text-fg-2"
          onClick={() => {
            setActiveIndex((index) => (index + 1) % slides.length);
          }}
          type="button"
        >
          <Icon className="rtl:rotate-180" name="arrow-right" size={14} />
        </button>
      </div>
    </section>
  );
}
