import type { NavNode } from '@/app/navigation/types';

export function navPath(
  nodes: readonly NavNode[],
  id: string,
  trail: readonly string[] = [],
): string[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node.id];
    if (node.id === id) return nextTrail;
    if (node.children) {
      const match = navPath(node.children, id, nextTrail);
      if (match) return match;
    }
  }

  return null;
}

export function navFirstLeaf(node: NavNode): NavNode {
  return node.children?.[0] ? navFirstLeaf(node.children[0]) : node;
}

export function navIsAncestor(node: NavNode, id: string): boolean {
  return navPath([node], id) !== null;
}

export function navNodes(nodes: readonly NavNode[]): NavNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? navNodes(node.children) : []),
  ]);
}

export function navTrailForPath(
  nodes: readonly NavNode[],
  pathname: string,
): NavNode[] {
  const matches = navNodes(nodes)
    .filter((node) => node.path === pathname)
    .sort(
      (left, right) => right.id.split('/').length - left.id.split('/').length,
    );
  const match = matches[0];
  if (!match) return [];

  const ids = navPath(nodes, match.id) ?? [];
  const index = new Map(navNodes(nodes).map((node) => [node.id, node]));
  return ids.flatMap((id) => {
    const node = index.get(id);
    return node ? [node] : [];
  });
}
