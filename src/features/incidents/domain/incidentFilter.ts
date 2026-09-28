import type { RecordFilterValue } from '@/features/organization';
import type { IncidentRuntimeRow } from '../types/incidents.types';

export function filterIncidents(rows: readonly IncidentRuntimeRow[], filter: RecordFilterValue) {
  const query = filter.num.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    if (query && !`${row.id} ${row.title}`.toLocaleLowerCase().includes(query)) return false;
    if (filter.locations.length && !filter.locations.includes(row.detail.location)) return false;
    if (filter.zones.length && !filter.zones.includes(row.detail.zone)) return false;
    if (filter.dept && row.detail.department !== filter.dept) return false;
    if (filter.cat && row.detail.mainCategory !== filter.cat) return false;
    if (filter.sub && row.detail.subCategory !== filter.sub) return false;
    if (filter.risk && row.detail.risk !== filter.risk) return false;
    if (filter.status && row.status !== filter.status) return false;
    return true;
  });
}

export function incidentHistorySeed(id: string) {
  const people = ['M. Faris', 'L. Haddad', 'K. Ibrahim', 'R. Salem', 'O. Najjar'] as const;
  const seed = Array.from(id).reduce((sum, value) => sum + value.charCodeAt(0), 0);
  const events = [
    ['history.reported', 'created', 'yesterday'],
    ['history.acknowledged', 'update', '6 hours ago'],
    ['history.severityConfirmed', 'update', '2 hours ago'],
    ['history.assigned', 'update', '48 min ago'],
  ] as const;
  return events.map(([textKey, tone, when], index) => ({
    by: people[(seed + index) % people.length] ?? people[0],
    textKey,
    tone,
    when,
  }));
}
