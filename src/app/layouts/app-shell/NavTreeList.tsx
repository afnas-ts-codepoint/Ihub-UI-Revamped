import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { NavNode } from '@/app/navigation/types';
import { Icon } from '@/shared/ui/icon/Icon';

type NavTreeListProps = Readonly<{
  activeTrail: readonly NavNode[];
  items: readonly NavNode[];
  onNavigate: (node: NavNode) => void;
}>;

export function NavTreeList({
  activeTrail,
  items,
  onNavigate,
}: NavTreeListProps) {
  const { t } = useTranslation('nav');
  const activeIds = activeTrail.map((node) => node.id);
  const activeId = activeIds.at(-1);
  const [openIds, setOpenIds] = useState(() => new Set(activeIds));

  const rows: React.ReactNode[] = [];
  const walk = (node: NavNode, depth: number) => {
    const hasChildren = Boolean(node.children?.length);
    const isOpen = openIds.has(node.id) || activeIds.includes(node.id);
    const isActive = node.id === activeId;

    rows.push(
      <button
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        className="flex w-full items-center gap-2 rounded-compact px-3 py-2 text-start data-[active=true]:bg-accent-dim data-[active=true]:font-semibold data-[active=true]:text-accent data-[active=false]:text-fg-2"
        data-active={isActive}
        key={node.id}
        onClick={() => {
          if (hasChildren) {
            setOpenIds((current) => {
              const next = new Set(current);
              if (next.has(node.id)) next.delete(node.id);
              else next.add(node.id);
              return next;
            });
          }
          onNavigate(node);
        }}
        style={{ paddingInlineStart: 12 + depth * 14 }}
        type="button"
      >
        {node.icon ? (
          <Icon name={node.icon} size={18} />
        ) : (
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-current opacity-50"
          />
        )}
        <span className="min-w-0 flex-1 truncate">
          {t(node.labelKey, { defaultValue: node.id })}
        </span>
        {hasChildren ? (
          <Icon
            className="shrink-0 opacity-50 transition-transform rtl:-scale-x-100"
            name="chevron-right"
            size={14}
            style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
          />
        ) : null}
      </button>,
    );

    if (hasChildren && isOpen) {
      node.children?.forEach((child) => {
        walk(child, depth + 1);
      });
    }
  };

  items
    .filter((node) => !node.topbar)
    .forEach((node) => {
      walk(node, 0);
    });
  return rows;
}
