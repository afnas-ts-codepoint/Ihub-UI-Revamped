import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import type { NavNode } from '@/app/navigation/types';
import { Icon } from '@/shared/ui/icon/Icon';

type MegaMenuProps = Readonly<{
  activeTrail: readonly NavNode[];
  item: NavNode;
  onNavigate: (node: NavNode) => void;
}>;

type PanelRect = Readonly<{
  blockStart: number;
  inlineStart: number;
  maxHeight: number;
  width: number;
}>;

export function MegaMenu({
  activeTrail,
  item,
  onNavigate,
}: MegaMenuProps) {
  const { t } = useTranslation('nav');
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(0);
  const [rect, setRect] = useState<PanelRect>();
  const groups = item.children?.filter((node) => node.children?.length) ?? [];
  const activeIds = new Set(activeTrail.map((node) => node.id));
  const isActive = activeIds.has(item.id);
  const activeGroup = groups[category] ?? groups[0];

  const close = () => {
    setOpen(false);
  };
  const place = () => {
    const button = trigger.current;
    if (!button) return;
    const bounds = button.getBoundingClientRect();
    const width = Math.min(1180, document.documentElement.clientWidth - 32);
    const inlineStart = Math.max(
      16,
      (document.documentElement.clientWidth - width) / 2,
    );
    const blockStart = bounds.bottom + 8;
    setRect({
      blockStart,
      inlineStart,
      maxHeight: document.documentElement.clientHeight - blockStart - 16,
      width,
    });
  };

  const toggle = () => {
    if (!open) {
      const currentCategory = groups.findIndex((group) =>
        activeIds.has(group.id),
      );
      setCategory(currentCategory >= 0 ? currentCategory : 0);
    }
    setOpen((value) => !value);
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    globalThis.addEventListener('resize', place);
    globalThis.addEventListener('scroll', place, true);
    return () => {
      globalThis.removeEventListener('resize', place);
      globalThis.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="relative">
      <button
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-md font-medium whitespace-nowrap data-[active=true]:bg-inset data-[active=true]:text-fg data-[active=false]:text-fg-3"
        data-active={isActive || open}
        data-testid="masters-trigger"
        onClick={toggle}
        ref={trigger}
        type="button"
      >
        <Icon name="layers" size={15} />
        {t(item.labelKey, { defaultValue: item.id })}
        <Icon
          className="opacity-50 transition-transform"
          name="chevron-down"
          size={13}
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>
      {open && rect && activeGroup
        ? createPortal(
            <>
              <button
                aria-label={t('shell.closeMegaMenu')}
                className="fixed inset-0 z-[60] cursor-default"
                data-testid="mega-menu-overlay"
                onClick={close}
                type="button"
              />
              <section
                aria-label={t(item.labelKey, { defaultValue: item.id })}
                className="fixed z-[61] overflow-y-auto rounded-xl border border-line-strong bg-surface px-5 py-4.5 shadow-popover"
                data-testid="mega-menu"
                style={{
                  insetBlockStart: rect.blockStart,
                  insetInlineStart: rect.inlineStart,
                  maxHeight: rect.maxHeight,
                  width: rect.width,
                }}
              >
                <div className="grid grid-cols-[186px_minmax(0,1fr)] items-start gap-4.5 max-tablet:grid-cols-1">
                  <div className="flex flex-col gap-0.5 border-e border-line pe-4 max-tablet:border-e-0 max-tablet:border-b max-tablet:pb-3">
                    {groups.map((group, index) => {
                      const active = index === category;
                      return (
                        <button
                          aria-pressed={active}
                          className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-start text-base font-medium data-[active=true]:bg-accent-dim data-[active=true]:font-semibold data-[active=true]:text-accent data-[active=false]:text-fg-2 hover:bg-canvas"
                          data-active={active}
                          key={group.id}
                          onClick={() => {
                            setCategory(index);
                          }}
                          type="button"
                        >
                          <span className="truncate">
                            {t(group.labelKey, { defaultValue: group.id })}
                          </span>
                          <span className="num shrink-0 text-xs-plus">
                            {group.children?.length ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 max-tablet:grid-cols-2 max-phone:grid-cols-1">
                    {activeGroup.children?.map((node) => {
                      const active = activeIds.has(node.id);
                      return (
                        <button
                          aria-current={active ? 'page' : undefined}
                          className="flex min-w-0 items-center gap-1.5 rounded-compact px-2 py-1.5 text-start text-sm-plus data-[active=true]:font-semibold data-[active=true]:text-accent data-[active=false]:text-fg-2 hover:bg-canvas"
                          data-active={active}
                          key={node.id}
                          onClick={() => {
                            onNavigate(node);
                            close();
                          }}
                          type="button"
                        >
                          <Icon
                            className="shrink-0 opacity-60"
                            name="layers"
                            size={13}
                          />
                          <span className="truncate">
                            {t(node.labelKey, { defaultValue: node.id })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
