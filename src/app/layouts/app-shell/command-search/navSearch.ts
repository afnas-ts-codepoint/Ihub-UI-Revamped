import type { NavNode } from '@/app/navigation/types';
import type { LocalizedText } from '@/shared/i18n/localized';

export type NavSearchEntry = Readonly<{
  group: boolean;
  icon?: NavNode['icon'];
  key: string;
  label: LocalizedText;
  path: string;
  trail: readonly LocalizedText[];
}>;

export type NavLabelResolver = (node: NavNode) => LocalizedText;

export function buildNavSearchIndex(
  nodes: readonly NavNode[],
  resolveLabel: NavLabelResolver,
): NavSearchEntry[] {
  const entries: NavSearchEntry[] = [];

  function walk(
    current: readonly NavNode[],
    trail: readonly NavNode[],
    topIcon?: NavNode['icon'],
  ) {
    for (const node of current) {
      const isTop = trail.length === 0;
      const hasChildren = Boolean(node.children?.length);
      const target = isTop && node.firstLeafRoute ? firstLeaf(node) : node;

      entries.push({
        group: hasChildren,
        icon: isTop ? node.icon : topIcon,
        key: node.id,
        label: resolveLabel(node),
        path: target.path,
        trail: trail.map(resolveLabel),
      });

      if (hasChildren && !(isTop && node.firstLeafRoute)) {
        walk(
          node.children ?? [],
          [...trail, node],
          isTop ? node.icon : topIcon,
        );
      }
    }
  }

  walk(nodes, []);
  return entries;
}

function firstLeaf(node: NavNode): NavNode {
  return node.children?.[0] ? firstLeaf(node.children[0]) : node;
}

/** @prototype index.html:L3148-L3170 navSearch */
export function navSearch(
  index: readonly NavSearchEntry[],
  query: string,
): NavSearchEntry[] {
  const search = query.trim().toLowerCase();
  if (!search) return [];

  return index
    .flatMap((entry, order) => {
      const english = entry.label.en.toLowerCase();
      const arabic = entry.label.ar.toLowerCase();
      const path = entry.trail
        .map((label) => `${label.en} ${label.ar}`)
        .join(' ')
        .toLowerCase();
      let score = -1;

      for (const label of [english, arabic]) {
        if (label === search) score = Math.max(score, 100);
        else if (label.indexOf(search) === 0) score = Math.max(score, 80);
        else if (` ${label}`.indexOf(` ${search}`) !== -1)
          score = Math.max(score, 60);
        else if (label.indexOf(search) !== -1) score = Math.max(score, 40);
      }

      if (score < 0 && path.indexOf(search) !== -1) score = 10;
      if (score < 0) return [];

      return [
        {
          entry,
          order,
          score: score + (entry.group ? 0 : 2) - entry.trail.length * 3,
        },
      ];
    })
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .slice(0, 12)
    .map(({ entry }) => entry);
}
