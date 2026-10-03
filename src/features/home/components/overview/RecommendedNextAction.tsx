import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import type { HomePriority } from '../../types/home.types';
import type {
  QueueAction,
  QueueActionVerb,
  QueueIncident,
} from '../../types/queue.types';
import { actionButtonClass } from '../actions/actionButtonStyles';

/** Above this amount (KWD) the recommendation is "high financial impact". */
export const HIGH_IMPACT_AMOUNT = 40_000;

const PRIORITY_TONE = {
  critical: 'bad',
  high: 'bad',
  low: 'info',
  medium: 'warn',
} as const satisfies Record<HomePriority, 'bad' | 'info' | 'warn'>;

export type RecommendedNextActionProps = Readonly<{
  criticalIncident: QueueIncident | undefined;
  onAct: (verb: QueueActionVerb, item: QueueAction) => void;
  onOpenAction: (item: QueueAction) => void;
  onOpenIncident: (incident: QueueIncident) => void;
  ranked: readonly QueueAction[];
}>;

/**
 * The top-ranked approval with one-click approve and review, then up to two
 * runners-up and the critical breached incident. "Surfaced first" explains the
 * rank: overdue or due today, priority, and an amount of at least KWD 40,000.
 * @prototype index.html:L12764-L12942 `RecommendedNextAction`
 */
export function RecommendedNextAction({
  criticalIncident,
  onAct,
  onOpenAction,
  onOpenIncident,
  ranked,
}: RecommendedNextActionProps) {
  const { t } = useTranslation('home');
  const top = ranked[0];
  if (!top) return null;
  const secondary = ranked.slice(1, 3);

  const why: string[] = [];
  if (top.dueState === 'overdue') why.push(t('overview.next.overdue'));
  else if (top.dueState === 'today') why.push(t('overview.next.dueToday'));
  if (top.priority === 'critical') why.push(t('overview.next.criticalPriority'));
  else if (top.priority === 'high') why.push(t('overview.next.highPriority'));
  if (top.amountNum >= HIGH_IMPACT_AMOUNT) why.push(t('overview.next.highImpact'));

  const stripButton =
    'flex min-w-0 flex-[1_1_280px] cursor-pointer items-center gap-3 bg-transparent px-[22px] py-3.5 text-start';

  return (
    <section
      className="overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[linear-gradient(180deg,var(--accent-dim),transparent_60%)]"
      data-testid="recommended-next-action"
    >
      <div className="flex flex-wrap items-center gap-[26px] px-[26px] py-[22px]">
        <div className="min-w-0 flex-[1_1_420px]">
          <div className="flex items-center gap-[7px] text-sm font-medium tracking-[0.16em] text-accent uppercase">
            <Icon name="sparkle" size={13} />
            {t('overview.next.eyebrow')}
          </div>
          <h2 className="display mt-3 mb-0 text-6xl font-medium tracking-[-0.02em] leading-[1.15]">
            {top.title}
          </h2>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-base text-fg-3">
            <span className="font-medium text-fg-2">{top.owner}</span>
            <MetaDot />
            <span>{top.dept}</span>
            <MetaDot />
            <span className="num text-fg-2">{top.amount}</span>
            {why.length ? (
              <>
                <MetaDot />
                <span className="text-accent">
                  {t('overview.next.surfaced', { reasons: why.join(' · ') })}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-2.5">
          <button
            className={actionButtonClass('primary')}
            onClick={() => {
              onAct('approve', top);
            }}
            type="button"
          >
            <Icon name="check" size={15} />
            {top.recommended}
          </button>
          <button
            className={actionButtonClass('secondary')}
            onClick={() => {
              onOpenAction(top);
            }}
            type="button"
          >
            {t('overview.next.review')}
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
      {secondary.length > 0 || criticalIncident ? (
        <div className="flex flex-wrap border-t border-line">
          {criticalIncident ? (
            <button
              className={stripButton}
              onClick={() => {
                onOpenIncident(criticalIncident);
              }}
              type="button"
            >
              <span className="pulse-soft size-2 shrink-0 rounded-full bg-bad" />
              <span className="min-w-0">
                <span className="text-2xs-plus font-semibold tracking-[0.08em] text-bad uppercase">
                  {t('overview.next.criticalIncident')}
                </span>
                <span className="block truncate text-base-plus font-medium text-fg">
                  {`${criticalIncident.title} — ${criticalIncident.slaLabel}`}
                </span>
              </span>
              <Icon
                className="shrink-0 text-fg-4"
                name="arrow-right"
                size={15}
              />
            </button>
          ) : null}
          {secondary.map((item, index) => (
            <button
              className={cn(
                stripButton,
                criticalIncident || index > 0 ? 'border-s border-line' : undefined,
              )}
              key={item.id}
              onClick={() => {
                onOpenAction(item);
              }}
              type="button"
            >
              <Chip className="px-[7px] py-px text-2xs" tone={PRIORITY_TONE[item.priority]}>
                {item.priority}
              </Chip>
              <span className="min-w-0">
                <span className="block truncate text-base-plus font-medium text-fg">
                  {item.title}
                </span>
                <span className="text-sm text-fg-3">{`${item.due} · ${item.amount}`}</span>
              </span>
              <Icon
                className="shrink-0 text-fg-4"
                name="arrow-right"
                size={15}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MetaDot() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      {'·'}
    </span>
  );
}
