import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { filterMasterRows } from '../domain/filterRows';
import type {
  MasterDefinition,
  MasterFilterValue,
  MasterRow,
  MasterStatus,
} from '../domain/types';
import { useMasterColumns } from '../components/useMasterColumns';
import { useDataTable } from '@/shared/table/dataTable';
import type { ColumnSettingsValue } from '@/shared/table/ColumnSettingsDialog';
import type { RowSelectionState } from '@tanstack/react-table';

export const ENTRIES_OPTIONS = ['10', '25', '50', '100', 'All'] as const;

type StatusFilter = 'all' | MasterStatus;

const CHIP_IDS = ['all', 'active', 'inactive'] as const;

/**
 * Owns every piece of state a Master listing needs: seeded rows, search,
 * status chip, mode-specific filters, column/chip/filter-field visibility,
 * bulk selection, pagination and the delete-confirmation target. State
 * resets whenever the routed Master changes, mirroring the prototype's own
 * `useEffect(() => { ...reset... }, [title, seedRows])` — the route keeps
 * the same page component mounted across `/masters/:category/:item`
 * navigations.
 * @prototype index.html:L4527-L4557,L4663-L4681,L4753-L4823
 */
export function useMasterListing(definition: MasterDefinition) {
  const { t } = useTranslation('masters');

  const [allRows, setAllRows] = useState<readonly MasterRow[]>(
    () => definition.seedRows,
  );
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MasterFilterValue>({});
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [chipVisibility, setChipVisibility] = useState<Record<string, boolean>>(
    {},
  );
  const [filterFieldVisibility, setFilterFieldVisibility] = useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [entriesValue, setEntriesValue] = useState<string>('10');
  const [deleteTarget, setDeleteTarget] = useState<MasterRow | null>(null);

  // Reset every piece of session state when the routed Master changes,
  // mirroring the prototype's `useEffect(() => {...reset...}, [title])` — the
  // route keeps the same `MasterPage` element mounted across navigations
  // between different `MASTERS_WITH_PAGE` items. Done during render (React's
  // "adjusting state when a prop changes" pattern), not in an effect, to
  // avoid the extra render pass a `useEffect` reset would otherwise cause.
  const [seenSlug, setSeenSlug] = useState(definition.slug);
  if (seenSlug !== definition.slug) {
    setSeenSlug(definition.slug);
    setAllRows(definition.seedRows);
    setStatus('all');
    setSearch('');
    setFilters({});
    setFilterDialogOpen(false);
    setSettingsOpen(false);
    setColumnVisibility({});
    setChipVisibility({});
    setFilterFieldVisibility({});
    setRowSelection({});
    setPageIndex(0);
    setEntriesValue('10');
    setDeleteTarget(null);
  }

  // Reset to page 1 after a search/status/page-size change, same as the
  // prototype's two `useEffect(() => setPage(1), [...])` calls — but applying
  // mode-specific filters (`mf`) does not reset the page unless it also
  // changes the status chip (see `applyFilters`).
  const [seenPageResetKey, setSeenPageResetKey] = useState(
    `${status}\u0000${search}\u0000${entriesValue}`,
  );
  const pageResetKey = `${status}\u0000${search}\u0000${entriesValue}`;
  if (seenPageResetKey !== pageResetKey) {
    setSeenPageResetKey(pageResetKey);
    setPageIndex(0);
  }

  const counts = useMemo(
    () => ({
      active: allRows.filter((row) => row.status === 'active').length,
      all: allRows.length,
      inactive: allRows.filter((row) => row.status === 'inactive').length,
    }),
    [allRows],
  );

  const filteredRows = useMemo(
    () =>
      filterMasterRows(allRows, definition.mode, { filters, search, status }),
    [allRows, definition.mode, filters, search, status],
  );

  const pageSize =
    entriesValue === 'All'
      ? Math.max(filteredRows.length, 1)
      : Number(entriesValue);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const displayPageIndex = Math.min(pageIndex, totalPages - 1);

  const toggleRowStatus = (code: string) => {
    setAllRows((rows) =>
      rows.map((row) =>
        row.code === code
          ? { ...row, status: row.status === 'active' ? 'inactive' : 'active' }
          : row,
      ),
    );
  };

  const removeCodes = (codes: readonly string[]) => {
    setAllRows((rows) => rows.filter((row) => !codes.includes(row.code)));
    setRowSelection((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([code]) => !codes.includes(code)),
      ),
    );
  };

  const columns = useMasterColumns({
    definition,
    onDelete: (row) => {
      setDeleteTarget(row);
    },
    onToggleStatus: toggleRowStatus,
    t,
  });

  const table = useDataTable<MasterRow>({
    autoResetPageIndex: false,
    columns,
    data: filteredRows,
    getRowId: (row) => row.code,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((current) =>
        typeof updater === 'function' ? updater(current) : updater,
      );
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: displayPageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
    },
    onRowSelectionChange: (updater) => {
      setRowSelection((current) =>
        typeof updater === 'function' ? updater(current) : updater,
      );
    },
    state: {
      columnVisibility,
      pagination: { pageIndex: displayPageIndex, pageSize },
      rowSelection,
    },
  });

  const selectedCodes = Object.keys(rowSelection);

  return {
    allRows,
    chipIds: CHIP_IDS,
    chipVisibility,
    columnVisibility,
    counts,
    definition,
    deleteTarget,
    entriesValue,
    filterDialogOpen,
    filterFieldVisibility,
    filteredRows,
    filters,
    mfCount: definition.filterFields.filter((field) => filters[field.id])
      .length,
    pageSize,
    search,
    selectedCodes,
    settingsOpen,
    status,
    t,
    table,
    totalPages,

    applyFilters: (next: MasterFilterValue) => {
      setFilters(next);
      if (next.status) setStatus(next.status as MasterStatus);
    },
    cancelDelete: () => {
      setDeleteTarget(null);
    },
    clearSelection: () => {
      setRowSelection({});
    },
    confirmDelete: () => {
      if (deleteTarget) removeCodes([deleteTarget.code]);
      setDeleteTarget(null);
    },
    deleteSelected: () => {
      removeCodes(selectedCodes);
    },
    goToPage: (page: number) => {
      setPageIndex(page - 1);
    },
    saveSettings: (value: ColumnSettingsValue) => {
      setColumnVisibility(value.columns ?? {});
      setChipVisibility(value.chips ?? {});
      setFilterFieldVisibility(value.filters ?? {});
    },
    setEntriesValue,
    setFilterDialogOpen,
    setSearch,
    setSettingsOpen,
    setStatus,
    setSelectedStatus: (next: MasterStatus) => {
      setAllRows((rows) =>
        rows.map((row) =>
          selectedCodes.includes(row.code) ? { ...row, status: next } : row,
        ),
      );
      setRowSelection({});
    },
  };
}
