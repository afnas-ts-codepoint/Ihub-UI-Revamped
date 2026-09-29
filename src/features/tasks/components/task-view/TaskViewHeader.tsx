import { AlertTriangle, ArrowUpRight, Box, Check, Folder, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TASK_VIEW_TEAM } from '../../data/taskView.mock';
import { formatMinutes, slaChipTextFor, stageIndex, type TaskViewHeaderStats } from '../../domain/taskView';
import type { TaskViewModel } from '../../types/task.types';
import { Avatar } from '@/shared/ui/avatar/Avatar';
import { Chip } from '@/shared/ui/chip/Chip';

/**
 * Stage names and, below, the four header stat labels are passed as both the
 * English and Arabic argument to the prototype's `T()` helper (`T(s[0], s[0],
 * locale)`, `index.html:L18100`/`L18112`) — a genuine `PROTOTYPE-NOOP`: they
 * are never translated to Arabic. Kept as literal, locale-invariant English
 * here rather than routed through i18n, to avoid a silent translation
 * "improvement" the prototype does not make.
 */
const TASK_STAGES: readonly Readonly<{ label: string; tone: string }>[] = [
  { label: 'Logged', tone: 'var(--ok)' },
  { label: 'In Review', tone: 'var(--bad)' },
  { label: 'Approved', tone: 'var(--brand-orange)' },
  { label: 'To Be Initiated', tone: 'var(--info)' },
  { label: 'Assigned', tone: 'var(--warn)' },
  { label: 'In Progress', tone: 'var(--accent)' },
  { label: 'Completed', tone: 'var(--paper-2)' },
  { label: 'Closed & Verified', tone: 'var(--paper-2)' },
];

type MarkerTextKey =
  | 'approvalRequired'
  | 'cleared'
  | 'inReview'
  | 'inReviewBlocking'
  | 'mountingBrackets'
  | 'spareParts'
  | 'technicalSpecs'
  | 'technicianCertification'
  | 'vendorDependency';

type StageMarker = Readonly<{
  chipBg: string;
  chipKey: MarkerTextKey;
  icon: LucideIcon;
  subtitleKey: MarkerTextKey;
  titleKey: MarkerTextKey;
  tone: string;
}>;

const STAGE_MARKERS: Readonly<Record<number, readonly StageMarker[]>> = {
  1: [
    {
      chipBg: 'var(--ok)',
      chipKey: 'cleared',
      icon: Check,
      subtitleKey: 'technicalSpecs',
      titleKey: 'approvalRequired',
      tone: 'var(--ok)',
    },
  ],
  5: [
    {
      chipBg: 'var(--accent)',
      chipKey: 'inReviewBlocking',
      icon: Box,
      subtitleKey: 'mountingBrackets',
      titleKey: 'spareParts',
      tone: 'var(--brand-lilac)',
    },
    {
      chipBg: 'var(--accent)',
      chipKey: 'inReview',
      icon: AlertTriangle,
      subtitleKey: 'technicianCertification',
      titleKey: 'vendorDependency',
      tone: 'var(--brand-lilac)',
    },
  ],
};

function StageMarkerBadge({ marker }: Readonly<{ marker: StageMarker }>) {
  const { t } = useTranslation('taskView');
  const [hover, setHover] = useState(false);
  const Icon = marker.icon;

  return (
    <span
      className="relative flex size-5 shrink-0 items-center justify-center rounded-full text-white shadow-[0_0_0_2px_var(--paper)]"
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      style={{ background: marker.chipBg }}
    >
      <Icon aria-hidden size={11} />
      {hover ? (
        <div
          className="absolute bottom-[calc(100%+8px)] start-1/2 z-10 w-50 -translate-x-1/2 rounded-lg bg-fg px-3 py-2.5 shadow-menu"
          role="tooltip"
        >
          <div className="text-sm-plus font-semibold" style={{ color: marker.tone }}>
            {t(`header.marker.${marker.titleKey}`)}
          </div>
          <div className="mt-0.5 text-xs-plus text-canvas opacity-65">
            {t(`header.marker.${marker.subtitleKey}`)}
          </div>
          <span
            className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs-plus text-white"
            style={{ background: marker.chipBg }}
          >
            {t(`header.marker.${marker.chipKey}`)}
          </span>
        </div>
      ) : null}
    </span>
  );
}

/**
 * Task View header card: subject/chips, four seeded header stats, an inert
 * search box, the 8-stage progress track with its two fixed marker popovers,
 * work progress, started/target dates and the Assigned Users avatar stack.
 * "Update Sub Tasks" is hidden (`readOnly ? null : …`); the expand button
 * opens the Sub Task History dialog in both modes.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18087-L18149.
 */
export function TaskViewHeader({
  onOpenHistory,
  schedule,
  stats,
  task,
  times,
}: Readonly<{
  onOpenHistory: () => void;
  schedule: Readonly<{ start: string; target: string }>;
  stats: TaskViewHeaderStats;
  task: TaskViewModel;
  times: Readonly<{ startedTime: string; targetTime: string }>;
}>) {
  const { t } = useTranslation('taskView');
  const [query, setQuery] = useState('');
  const [showTeam, setShowTeam] = useState(false);
  // Widened from the literal 5-tuple so a future roster-size change doesn't
  // make this a compile-time-tautological comparison.
  const team: readonly string[] = TASK_VIEW_TEAM;
  const currentStageIndex = stageIndex(task.stage);
  const slaText = slaChipTextFor(task.stage);

  // Labels are literal, locale-invariant English — see the TASK_STAGES comment above.
  const statFigures: readonly [string, string, string][] = [
    ['Response', formatMinutes(stats.responseMinutes), 'var(--info)'],
    ['Verification', `${String(stats.verificationMinutes)}m`, 'var(--ok)'],
    ['Resolution', formatMinutes(stats.resolutionMinutes), 'var(--brand-orange)'],
    ['Completion', formatMinutes(stats.completionMinutes), 'var(--accent)'],
  ];

  return (
    <div className="flex flex-col gap-4.5 rounded-xl border border-line bg-surface p-5.5" data-testid="task-view-header">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9.5 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent">
            <Folder aria-hidden size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-2xl-plus leading-tight font-semibold tracking-[-0.01em]">{task.subject}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip>{task.kind === 'external' ? t('header.external') : t('header.internal')}</Chip>
              <Chip tone={task.stage === 'Done' ? 'ok' : 'info'}>
                <Check aria-hidden size={11} />
                {slaText === 'Met' ? t('header.slaMet') : t('header.slaOnTrack')}
              </Chip>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5.5">
          {statFigures.map(([label, value, color]) => (
            <div className="text-center" key={label}>
              <div className="num text-sm-plus font-bold" style={{ color }}>
                {value}
              </div>
              <div className="mt-0.5 text-2xs-plus text-fg-3">{label}</div>
            </div>
          ))}
          <div className="relative flex items-center">
            <Search aria-hidden className="pointer-events-none absolute inset-s-2.5 text-fg-4" size={14} />
            <input
              aria-label={t('header.search')}
              className="w-37.5 rounded-lg border border-line-strong bg-canvas py-2 ps-8 pe-2.5 text-sm-plus outline-none"
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder={t('header.search')}
              value={query}
            />
          </div>
        </div>
      </div>

      <hr className="m-0 border-line" />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">{t('header.taskStatus')}</span>
          <span className="text-xs-plus text-fg-3">
            {t('header.stageOf', { current: currentStageIndex + 1, total: TASK_STAGES.length })}
          </span>
        </div>
        <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center" data-testid="task-stage-track">
          {TASK_STAGES.map((stage, index) => (
            <div className="flex items-center gap-2 tablet:contents" key={stage.label}>
              <span className="relative shrink-0">
                <span
                  className="block max-w-24 truncate rounded-full px-3 py-1.5 text-xs-plus font-semibold whitespace-nowrap"
                  style={{
                    background: index <= currentStageIndex ? stage.tone : 'var(--paper-2)',
                    border: index <= currentStageIndex ? 'none' : '1px solid var(--line)',
                    color: index <= currentStageIndex ? '#fff' : 'var(--text-3)',
                  }}
                  title={stage.label}
                >
                  {stage.label}
                </span>
                {STAGE_MARKERS[index] ? (
                  <span className="absolute bottom-[calc(100%+6px)] start-1/2 z-2 flex -translate-x-1/2 items-center gap-1">
                    {STAGE_MARKERS[index].map((marker) => (
                      <StageMarkerBadge key={marker.titleKey} marker={marker} />
                    ))}
                  </span>
                ) : null}
              </span>
              {index < TASK_STAGES.length - 1 ? (
                <span
                  className="hidden h-0.5 min-w-2 flex-1 tablet:block"
                  style={{ background: index < currentStageIndex ? stage.tone : 'var(--line)' }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <hr className="m-0 border-line" />

      <div className="flex flex-wrap items-center gap-6">
        <div className="shrink-0">
          <div className="text-sm-plus font-semibold text-fg-2">{t('header.workProgress')}</div>
          <div className="num text-6xl font-medium">{`${String(task.progress)}%`}</div>
        </div>
        <div className="flex min-w-50 flex-1 flex-col gap-2">
          <div className="text-xs-plus text-fg-3">
            {t('header.startedAt', { date: schedule.start, time: times.startedTime })}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent" style={{ width: `${String(task.progress)}%` }} />
          </div>
          <div className="text-end text-xs-plus text-fg-3">
            {t('header.targetAt', { date: schedule.target, time: times.targetTime })}
          </div>
        </div>
        <button
          aria-label={t('header.expand')}
          className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-line-strong text-fg-2"
          onClick={onOpenHistory}
          title={t('header.expandTitle')}
          type="button"
        >
          <ArrowUpRight aria-hidden size={14} />
        </button>
        <div className="hidden self-stretch border-s border-line tablet:block" />
        <div className="relative flex shrink-0 flex-col items-end gap-2">
          <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
            {t('header.assignedUsers')}
          </span>
          <button
            className="flex items-center"
            onClick={() => {
              setShowTeam((value) => !value);
            }}
            type="button"
          >
            {team.slice(0, 3).map((name, index) => (
              <span className={`flex rounded-full border-2 border-surface ${index ? '-ms-2' : ''}`} key={name}>
                <Avatar name={name} size={30} />
              </span>
            ))}
            {team.length > 3 ? (
              <span className="-ms-2 flex size-7.5 items-center justify-center rounded-full border-2 border-surface bg-inset text-xs font-semibold text-fg-2">
                {`+${String(team.length - 3)}`}
              </span>
            ) : null}
          </button>
          {showTeam ? (
            <div className="absolute top-[calc(100%+8px)] end-0 z-11 w-55 overflow-hidden rounded-xl border border-line-strong bg-surface shadow-popover">
              <div className="max-h-55 overflow-y-auto p-1.5">
                {TASK_VIEW_TEAM.map((name) => (
                  <div className="mb-1 flex items-center gap-2.5 rounded-lg bg-canvas px-2 py-1.5 last:mb-0" key={name}>
                    <Avatar name={name} size={26} />
                    <span className="truncate text-sm-plus font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
