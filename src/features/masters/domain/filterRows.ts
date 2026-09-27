import type {
  MasterFilterValue,
  MasterMode,
  MasterRow,
  MasterStatus,
} from './types';

export type MasterListingFilterParams = Readonly<{
  filters: MasterFilterValue;
  search: string;
  status: 'all' | MasterStatus;
}>;

/**
 * Replicates the prototype's chained row filter exactly, field by field.
 * Deliberately preserved, not "fixed": for the generic mode (Machine
 * Master), the filter dialog's Location/Zone/Created On/Last Updated
 * On/Created By/Last Updated By fields never narrow the row list — none of
 * those guards includes the generic mode, so only the generic mode's Status
 * field (via the shared status chip) actually filters. See
 * `docs/migration/PROTOTYPE_NOOPS.md`.
 * @prototype index.html:L4774-L4788
 */
export function filterMasterRows(
  rows: readonly MasterRow[],
  mode: MasterMode,
  { filters, search, status }: MasterListingFilterParams,
): readonly MasterRow[] {
  const pc = mode === 'pc';
  const aa = mode === 'aa';
  const tm = mode === 'tm';
  const sa = mode === 'sa';
  const dateModes = pc || aa || tm || sa;
  const locationModes = aa || tm || sa;

  return rows
    .filter((row) => status === 'all' || row.status === status)
    .filter(
      (row) =>
        !search || row.name.toLowerCase().includes(search.trim().toLowerCase()),
    )
    .filter(
      (row) =>
        !pc ||
        !filters.name ||
        row.name.toLowerCase().includes(filters.name.trim().toLowerCase()),
    )
    .filter(
      (row) =>
        !dateModes ||
        !filters.fromDate ||
        (row.createdOn ?? '') >= filters.fromDate,
    )
    .filter(
      (row) =>
        !dateModes ||
        !filters.toDate ||
        (row.createdOn ?? '') <= filters.toDate,
    )
    .filter(
      (row) =>
        !locationModes ||
        !filters.locations ||
        row.location === filters.locations,
    )
    .filter(
      (row) => !locationModes || !filters.zones || row.zone === filters.zones,
    )
    .filter(
      (row) =>
        !sa ||
        !filters.assignmentArea ||
        row.assignmentArea === filters.assignmentArea,
    )
    .filter(
      (row) => !sa || !filters.subAreaName || row.name === filters.subAreaName,
    )
    .filter((row) => !tm || !filters.area || row.area === filters.area)
    .filter((row) => !tm || !filters.subArea || row.subArea === filters.subArea)
    .filter(
      (row) =>
        !tm || !filters.touchPoint || row.touchPoint === filters.touchPoint,
    )
    .filter((row) => !tm || !filters.dept || row.dept === filters.dept)
    .filter(
      (row) =>
        !tm ||
        !filters.applicableFor ||
        row.applicableFor === filters.applicableFor,
    );
}

/** @prototype index.html:L4655-L4662 (generic-mode `FIELD_KEYS`) */
const GENERIC_MODE_INERT_FILTER_FIELDS = new Set([
  'createdBy',
  'createdOn',
  'locations',
  'updatedBy',
  'updatedOn',
  'zones',
]);

export function isInertFilterField(mode: MasterMode, fieldId: string): boolean {
  return mode === 'generic' && GENERIC_MODE_INERT_FILTER_FIELDS.has(fieldId);
}
