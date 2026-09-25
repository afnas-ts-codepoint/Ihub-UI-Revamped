import type { UIMatch } from 'react-router';

export type RouteHandle = Readonly<{
  homeTab?: string | null;
  reportKey?: string;
  reportTitleKey?: string;
}>;

export function reportHandleFromMatches(matches: UIMatch[]) {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle as RouteHandle | undefined;
    if (handle?.reportKey || handle?.reportTitleKey) return handle;
  }
  return undefined;
}
