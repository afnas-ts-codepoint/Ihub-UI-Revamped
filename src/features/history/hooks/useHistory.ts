import { generateHistoryRows } from '../domain/generateHistoryRows';

export function useHistory(scopeLabel: string) {
  return { rows: generateHistoryRows(scopeLabel) } as const;
}
