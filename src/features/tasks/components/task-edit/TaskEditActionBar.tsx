import {
  CheckCircle2,
  Download,
  MessageCircle,
  MoreHorizontal,
  Printer,
  Receipt,
  RefreshCw,
  Send,
  X,
  XCircle,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/DropdownMenu';
import { toast } from '@/shared/ui/feedback/Toaster';

/**
 * Sticky edit-mode action bar — CEO Comments / Submit / Approve / Reject /
 * Close Task / More (Redirect / Log Note / Export / Print). Teleported to
 * `document.body` and fixed to the viewport bottom, matching the prototype's
 * `ReactDOM.createPortal(actionRow, document.body)` (`readOnly ? null : …`).
 * Submit, Log Note, Export and Print are inert — each only shows a toast
 * with its own label, matching the prototype's `flashLocal` fallback; only
 * Redirect (in the overflow menu) opens a real dialog.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18068-L18085 (bar + overflow menu),
 * L19481-L19483 (fixed/portal wiring).
 */
export function TaskEditActionBar({
  onApprove,
  onCeoComments,
  onClose,
  onRedirect,
  onReject,
}: Readonly<{
  onApprove: () => void;
  onCeoComments: () => void;
  onClose: () => void;
  onRedirect: () => void;
  onReject: () => void;
}>) {
  const { t } = useTranslation('taskView');

  const bar = (
    <div
      className="fixed inset-x-0 bottom-0 z-[120] flex flex-wrap justify-end gap-2 border-t border-line bg-surface/90 px-4 py-3 backdrop-blur-lg tablet:px-7"
      data-testid="task-edit-action-bar"
    >
      <button
        className="inline-flex items-center gap-1.5 rounded-lg bg-info px-3.5 py-2 text-sm font-semibold text-white"
        onClick={onCeoComments}
        type="button"
      >
        <MessageCircle aria-hidden size={14} />
        {t('actionBar.ceoComments')}
      </button>
      <button
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink"
        onClick={() => { toast(t('actionBar.submitted')); }}
        type="button"
      >
        <Send aria-hidden size={14} />
        {t('actionBar.submit')}
      </button>
      <button
        className="inline-flex items-center gap-1.5 rounded-lg bg-ok px-3.5 py-2 text-sm font-semibold text-white"
        onClick={onApprove}
        type="button"
      >
        <CheckCircle2 aria-hidden size={14} />
        {t('actionBar.approve')}
      </button>
      <button
        className="inline-flex items-center gap-1.5 rounded-lg bg-bad px-3.5 py-2 text-sm font-semibold text-white"
        onClick={onReject}
        type="button"
      >
        <X aria-hidden size={14} />
        {t('actionBar.reject')}
      </button>
      <button
        className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3.5 py-2 text-sm font-semibold text-fg-2"
        onClick={onClose}
        type="button"
      >
        <XCircle aria-hidden size={14} />
        {t('actionBar.closeTask')}
      </button>
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={t('actionBar.more')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3.5 py-2 text-sm font-semibold text-fg-2"
            type="button"
          >
            <MoreHorizontal aria-hidden size={14} />
            {t('actionBar.more')}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onRedirect}>
            <RefreshCw aria-hidden size={14} />
            {t('actionBar.menu.redirect')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { toast(t('actionBar.menu.logNote')); }}>
            <Receipt aria-hidden size={14} />
            {t('actionBar.menu.logNote')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { toast(t('actionBar.menu.export')); }}>
            <Download aria-hidden size={14} />
            {t('actionBar.menu.export')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { toast(t('actionBar.menu.print')); }}>
            <Printer aria-hidden size={14} />
            {t('actionBar.menu.print')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>
  );

  return createPortal(bar, document.body);
}
