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
