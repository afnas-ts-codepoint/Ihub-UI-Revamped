/**
 * Send-back reason categories. The prototype stores the English label as the
 * category text in every locale (`[sbCat, sbReason].join(': ')`), so `label`
 * is the stored/English text and `key` selects the localised chip caption.
 * @prototype ihub/index.html:L12740 send-back dialog chips; `SEND_BACK_REASON_KEYS` in `ActionSheetForm`
 */
export const SEND_BACK_REASONS = [
  { key: 'missingDocument', label: 'Missing document' },
  { key: 'needsJustification', label: 'Needs more justification' },
  { key: 'ceoApproval', label: 'Approval from CEO' },
  { key: 'invoiceMissing', label: 'Invoice/price missing' },
  { key: 'other', label: 'Other' },
] as const;

export const SEND_BACK_OTHER = 'Other';
