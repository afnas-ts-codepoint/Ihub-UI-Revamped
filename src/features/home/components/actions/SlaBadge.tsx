import { useTranslation } from 'react-i18next';

import { Icon } from '@/shared/ui/icon/Icon';

import { slaLabelOf, slaOf, slaTip } from '../../domain/sla';
import { useSlaLabels } from '../../hooks/useSlaLabels';
import type { SlaState, SlaSubject } from '../../types/queue.types';

// Full class strings (not interpolated) so Tailwind can see them.
const TONE_CLASS: Readonly<Record<Exclude<SlaState, 'ok'>, string>> = {
  'at-risk':
    'border-[color-mix(in_srgb,var(--warn)_30%,transparent)] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] text-warn',
  breached:
    'border-[color-mix(in_srgb,var(--bad)_30%,transparent)] bg-[color-mix(in_srgb,var(--bad)_12%,transparent)] text-bad',
};

/**
 * Quiet by design: renders only when the SLA clock needs attention
 * (at-risk or breached).
 * @prototype ihub/index.html:L11118-L11128 `SLABadge`
 */
export function SlaBadge({ subject }: Readonly<{ subject: SlaSubject }>) {
  useTranslation('home');
  const labels = useSlaLabels();
  const { state } = slaOf(subject);
  if (state === 'ok') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-[9px] py-[3px] text-2xs font-semibold ${TONE_CLASS[state]}`}
      title={slaTip(subject, labels)}
    >
      <Icon name="clock" size={11} />
      {slaLabelOf(subject, labels)}
    </span>
  );
}
