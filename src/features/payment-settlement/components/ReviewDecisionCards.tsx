import { Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { paymentSettlementButtonStyles } from './actionSheetButtonStyles';

export type ReviewDecisionType = 'approve' | 'reject' | 'sendback' | 'submit';
export type ReviewDecisionHandler = (type: ReviewDecisionType, reason?: string) => void;

/** Locale scope that holds the `decision.*` and `resubmit.*` caption groups. */
export type ReviewLabelScope = 'actionSheet' | 'pettyCash.form';

/**
 * Send-back reason categories. The prototype keeps the English text as the
 * category in every locale (`setSbCat(c[0])` → `[sbCat, sbReason].join(': ')`),
 * so `label` is the value reported through `onDecision` and `key` picks the
 * localised chip caption.
 * @prototype index.html:L17118 / L7822 reason chips
 */
const SEND_BACK_REASONS = [
  { key: 'missingDocument', label: 'Missing document' },
  { key: 'needsJustification', label: 'Needs more justification' },
  { key: 'ceoApproval', label: 'Approval from CEO' },
  { key: 'invoiceMissing', label: 'Invoice/price missing' },
  { key: 'other', label: 'Other' },
] as const;

const cardClass = 'flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-[22px]';
const titleClass = 'm-0 text-sm-plus font-semibold tracking-[-0.01em]';
const hintClass = 'text-xs-plus text-fg-3';
const textareaClass = 'min-h-16 w-full resize-y rounded-lg border border-line-strong bg-surface px-[11px] py-[9px] text-base text-fg outline-none focus:border-accent';

type DecisionCardProps = Readonly<{
  editable: boolean;
  labelScope: ReviewLabelScope;
  onDecision?: ReviewDecisionHandler;
  onToggleEditable: () => void;
  verify?: boolean;
}>;

/**
 * Right-hand "Decision" card of the review layout: Approve|Verify, the
 * Edit/Send back/Reject row and the inline send-back panel. Shared by
 * `ActionSheetForm` and `PettyCashRequestForm`, which the prototype
 * duplicates verbatim. The send-back panel state is local to the card, as no
 * other part of the form reads it.
 * @prototype index.html:L17118 / L7822 `reviewCard`
 */
export function ReviewDecisionCard({ editable, labelScope, onDecision, onToggleEditable, verify }: DecisionCardProps) {
  const { t } = useTranslation('paymentSettlement');
  const [sbOpen, setSbOpen] = useState(false);
  const [sbCat, setSbCat] = useState('');
  const [sbReason, setSbReason] = useState('');
  const otherNeedsText = sbCat === 'other' && !sbReason.trim();

  const confirmSendBack = () => {
    if (otherNeedsText) return;
    const category = SEND_BACK_REASONS.find((reason) => reason.key === sbCat)?.label;
    onDecision?.('sendback', [category, sbReason].filter(Boolean).join(': '));
  };

  return (
    <div className={cardClass}>
      <h3 className={titleClass}>{t(`${labelScope}.decision.title`)}</h3>
      {editable ? null : <span className={hintClass}>{t(`${labelScope}.decision.previewOnly`)}</span>}
      <button className={`${paymentSettlementButtonStyles.primary} w-full`} onClick={() => { onDecision?.('approve'); }} type="button">
        <Check aria-hidden="true" size={15} />
        {verify ? t(`${labelScope}.decision.verify`) : t(`${labelScope}.decision.approve`)}
      </button>
      {/* The prototype stacks an icon above each caption inside a fixed 40px button, which collapses the icon to zero height: the rendered buttons are text-only. */}
      <div className="grid grid-cols-3 gap-2">
        <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-interactive bg-surface px-3 text-xs font-semibold text-interactive transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={onToggleEditable} type="button">
          {editable ? t(`${labelScope}.decision.done`) : t(`${labelScope}.decision.edit`)}
        </button>
        <button className={`${paymentSettlementButtonStyles.ghost} h-10 text-xs ${sbOpen ? 'text-accent' : ''}`} onClick={() => { setSbOpen((open) => !open); }} type="button">
          {t(`${labelScope}.decision.sendBack`)}
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-bad transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={() => { onDecision?.('reject'); }} type="button">
          {t(`${labelScope}.decision.reject`)}
        </button>
      </div>
      {sbOpen ? (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-raised p-3">
          <span className="text-sm font-semibold text-fg-2">{t(`${labelScope}.decision.sendBackReasonLabel`)}</span>
          <div className="flex flex-wrap gap-[7px]">
            {SEND_BACK_REASONS.map((reason) => {
              const active = sbCat === reason.key;
              return (
                <button
                  aria-pressed={active}
                  className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm-plus font-semibold ${active ? 'chip-tone-accent' : 'border-line-strong bg-surface text-fg-2'}`}
                  key={reason.key}
                  onClick={() => { setSbCat(active ? '' : reason.key); }}
                  type="button"
                >
                  {t(`${labelScope}.decision.reasons.${reason.key}`)}
                </button>
              );
            })}
          </div>
          <textarea className={textareaClass} onChange={(event) => { setSbReason(event.currentTarget.value); }} placeholder={t(`${labelScope}.decision.sendBackPlaceholder`)} value={sbReason} />
          <button className={`${paymentSettlementButtonStyles.primary} w-full`} disabled={otherNeedsText} onClick={confirmSendBack} type="button">
            <RefreshCw aria-hidden="true" size={15} />
            {t(`${labelScope}.decision.confirmSendBack`)}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Right-hand "Resubmit" card shown to the creator of a returned item.
 * @prototype index.html:L17119 / L7823 `resubmitCard`
 */
export function ResubmitCard({ labelScope, onDecision }: Readonly<{ labelScope: ReviewLabelScope; onDecision?: ReviewDecisionHandler }>) {
  const { t } = useTranslation('paymentSettlement');
  return (
    <div className={cardClass}>
      <h3 className={titleClass}>{t(`${labelScope}.resubmit.title`)}</h3>
      <span className={hintClass}>{t(`${labelScope}.resubmit.hint`)}</span>
      <button className={`${paymentSettlementButtonStyles.primary} w-full`} onClick={() => { onDecision?.('submit'); }} type="button">
        <Check aria-hidden="true" size={15} />
        {t(`${labelScope}.resubmit.submit`)}
      </button>
    </div>
  );
}
