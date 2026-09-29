import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Task View's collapsible card shell.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L18174-L18183 `accPanel` — a bordered
 * icon tile, a clickable title that toggles, and a chevron that rotates open.
 */
type CollapsiblePanelProps = PropsWithChildren<{
  className?: string;
  contentId?: string;
  defaultOpen?: boolean;
  headerRight?: ReactNode;
  icon: LucideIcon;
  /** Controlled open state — when provided together with `onOpenChange`, the panel no longer tracks its own state. */
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: string;
}>;

export function CollapsiblePanel({
  children,
  className,
  contentId,
  defaultOpen = false,
  headerRight,
  icon: Icon,
  onOpenChange,
  open: openProp,
  title,
}: CollapsiblePanelProps) {
  const { t } = useTranslation('taskView');
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const toggle = () => {
    if (onOpenChange) onOpenChange(!open);
    else setInternalOpen((value) => !value);
  };

  return (
    <section className={`flex flex-col rounded-xl border border-line bg-surface ${className ?? ''}`}>
      <div className="flex items-center gap-2.5 p-5">
        <button
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
          onClick={toggle}
          type="button"
        >
          <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface text-accent">
            <Icon aria-hidden size={16} />
          </span>
          <h3 className="m-0 truncate text-md font-semibold tracking-[-0.01em]">{title}</h3>
        </button>
        {headerRight}
        <button
          aria-label={open ? t('common.collapse') : t('common.expand')}
          className="flex shrink-0 text-fg-3 transition-transform"
          onClick={toggle}
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
          type="button"
        >
          <ChevronDown aria-hidden size={16} />
        </button>
      </div>
      {open ? (
        <div className="flex flex-col gap-3.5 px-5 pb-5" id={contentId}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
