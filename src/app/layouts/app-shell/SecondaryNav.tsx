import { useTranslation } from 'react-i18next';

import type { NavNode } from '@/app/navigation/types';
import {
  LinkTabs,
  SegmentedControl,
  UnderlineTabs,
  type TabItem,
} from '@/shared/ui/tabs';

type SecondaryNavProps = Readonly<{
  activeTrail: readonly NavNode[];
  onNavigate: (node: NavNode) => void;
}>;

export function SecondaryNav({
  activeTrail,
  onNavigate,
}: SecondaryNavProps) {
  const { t } = useTranslation('nav');
  const root = activeTrail[0];
  if (!root || root.id === 'dashboard' || root.id === 'masters') return null;

  const strips = activeTrail.flatMap((parent, index) =>
    parent.children?.length
      ? [{ activeId: activeTrail[index + 1]?.id, parent }]
      : [],
  );
  if (!strips.length) return null;

  const nodeById = new Map(
    strips.flatMap(({ parent }) =>
      (parent.children ?? []).map((node) => [node.id, node] as const),
    ),
  );
  const handleSelect = (item: TabItem) => {
    const node = nodeById.get(item.id);
    if (node) onNavigate(node);
  };

  return (
    <div className="border-b border-line bg-raised">
      <nav
        aria-label={t('shell.secondaryNavigation')}
        className="mx-auto max-w-[1440px]"
      >
        {strips.map(({ activeId, parent }, index) => {
          const items = (parent.children ?? []).map((node) => ({
            id: node.id,
            label: t(node.labelKey, { defaultValue: node.id }),
            path: node.path,
          }));
          if (index === 0 || (root.id === 'masters-list' && index === 1)) {
            return (
              <UnderlineTabs
                activeId={activeId}
                items={items}
                key={parent.id}
                onSelect={handleSelect}
              />
            );
          }
          if (index === 1) {
            return (
              <SegmentedControl
                activeId={activeId}
                items={items}
                key={parent.id}
                onSelect={handleSelect}
              />
            );
          }
          return (
            <LinkTabs
              activeId={activeId}
              items={items}
              key={parent.id}
              onSelect={handleSelect}
            />
          );
        })}
      </nav>
    </div>
  );
}
