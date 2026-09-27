import { Download, Filter, Folder, Plus, Settings } from 'lucide-react';

import { BulkActionsBar } from '../components/BulkActionsBar';
import { MasterFilterDialog } from '../components/MasterFilterDialog';
import { MasterStatusChips } from '../components/MasterStatusChips';
import { MasterTitle } from '../components/MasterTitle';
import type { MasterDefinition } from '../domain/types';
import { ENTRIES_OPTIONS, useMasterListing } from '../hooks/useMasterListing';
import {
  ColumnSettingsDialog,
  type SettingsTab,
} from '@/shared/table/ColumnSettingsDialog';
import { DataTableView } from '@/shared/table/DataTableView';
import { TablePaginationBar } from '@/shared/table/TablePaginationBar';
import { TableToolbar } from '@/shared/table/TableToolbar';
import { ConfirmDialog } from '@/shared/ui/overlay/ConfirmDialog';

type MasterPageProps = Readonly<{
  definition: MasterDefinition;
  title: string;
}>;

/**
 * Definition-driven listing page for one of the five `MASTERS_WITH_PAGE`
 * items: search, status chips, in-row status toggle, bulk selection,
 * settings dialog, functional pagination, row actions and delete
 * confirmation. The Add button and the View/Edit row actions are visible but
 * inert — they point at Master record forms, which are M4.2 scope.
 * @prototype index.html:L4520-L5014 (`MasterListingMock`)
 */
export function MasterPage({ definition, title }: MasterPageProps) {
  const listing = useMasterListing(definition);
  const { t } = listing;
  /** Field/column label keys are runtime strings built from domain data, not literals. */
  const tr = (key: string) => t(key, { defaultValue: key });

  const settingsTabs: readonly SettingsTab[] = [
    {
      blurb: t('settings.blurb.chips'),
      id: 'chips',
      label: t('settings.tabs.chips'),
      options: listing.chipIds.map((id) => ({ id, label: t(`chips.${id}`) })),
    },
    {
      blurb: t('settings.blurb.filters'),
      id: 'filters',
      label: t('settings.tabs.filters'),
      options: definition.filterFields.map((field) => ({
        id: field.id,
        label: tr(field.labelKey),
      })),
      uppercase: true,
    },
    {
      blurb: t('settings.blurb.columns'),
      id: 'columns',
      label: t('settings.tabs.columns'),
      options: definition.columns.map((column) => ({
        id: column.id,
        label: tr(column.labelKey),
      })),
      uppercase: true,
    },
  ];

  return (
    <main className="flex flex-col gap-5 bg-canvas p-7">
      {/* A `div`, not a `header` element: the app shell already owns the
          page's one `banner` landmark, and a second literal `<header>` here
          would create an ambiguous second banner in the accessibility tree. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-tight text-fg">
          <MasterTitle title={title} />
        </h1>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink"
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
          {t('actions.add', { title })}
        </button>
      </div>

      <MasterFilterDialog
        definition={definition}
        fieldVisibility={listing.filterFieldVisibility}
        onApply={listing.applyFilters}
        onOpenChange={listing.setFilterDialogOpen}
        open={listing.filterDialogOpen}
        t={t}
        value={listing.filters}
      />
      <ColumnSettingsDialog
        cancelLabel={t('settings.cancel')}
        closeLabel={t('settings.close')}
        deselectAllLabel={t('settings.deselectAll')}
        onOpenChange={listing.setSettingsOpen}
        onSave={listing.saveSettings}
        open={listing.settingsOpen}
        saveLabel={t('settings.save')}
        selectAllLabel={t('settings.selectAll')}
        tabs={settingsTabs}
        title={t('settings.title')}
        value={{
          chips: listing.chipVisibility,
          columns: listing.columnVisibility,
          filters: listing.filterFieldVisibility,
        }}
      />
      <ConfirmDialog
        cancelLabel={t('delete.cancel')}
        closeLabel={t('filterDialog.close')}
        confirmLabel={t('delete.confirm')}
        description={t('delete.body', {
          name: listing.deleteTarget?.name ?? '',
        })}
        onConfirm={listing.confirmDelete}
        onOpenChange={(open) => {
          if (!open) listing.cancelDelete();
        }}
        open={listing.deleteTarget !== null}
        title={t('delete.title')}
      />

      <section className="flex flex-col gap-4.5 rounded-dialog border border-line bg-surface p-5.5">
        <div className="flex items-center gap-2.25">
          <Folder aria-hidden="true" className="text-accent" size={17} />
          <h2 className="m-0 text-sm-plus font-semibold tracking-[-0.01em] text-fg">
            {t('records.title')}
          </h2>
        </div>

        <TableToolbar
          end={
            <>
              <button
                className={
                  listing.mfCount
                    ? 'inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 text-sm font-semibold text-fg'
                    : 'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-fg-2 hover:bg-inset'
                }
                onClick={() => {
                  listing.setFilterDialogOpen(true);
                }}
                type="button"
              >
                <Filter aria-hidden="true" size={13} />
                {t('actions.filters')}
                {listing.mfCount ? (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-2xs font-bold text-accent-ink">
                    {listing.mfCount}
                  </span>
                ) : null}
              </button>
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-fg-2 hover:bg-inset"
                onClick={() => {
                  listing.setSettingsOpen(true);
                }}
                type="button"
              >
                <Settings aria-hidden="true" size={13} />
                {t('actions.settings')}
              </button>
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-ink"
                type="button"
              >
                <Download aria-hidden="true" size={14} />
                {t('actions.export')}
              </button>
            </>
          }
          middle={
            <MasterStatusChips
              chipVisibility={listing.chipVisibility}
              counts={listing.counts}
              onChange={listing.setStatus}
              status={listing.status}
              t={t}
            />
          }
          onSearchChange={listing.setSearch}
          searchPlaceholder={t('search.placeholder')}
          searchValue={listing.search}
        />

        <DataTableView
          getRowClassName={(row) =>
            listing.selectedCodes.includes(row.code)
              ? 'bg-accent-dim'
              : undefined
          }
          table={listing.table}
        />

        <BulkActionsBar
          onClearSelection={listing.clearSelection}
          onDeleteAll={listing.deleteSelected}
          onSetStatus={listing.setSelectedStatus}
          selectedCount={listing.selectedCodes.length}
          t={t}
        />

        <TablePaginationBar
          entriesAriaLabel={t('pagination.entriesAria')}
          entriesOptions={ENTRIES_OPTIONS}
          entriesUnitLabel={t('pagination.entries')}
          entriesValue={listing.entriesValue}
          entriesValueLabel={(entryValue) =>
            entryValue === 'All' ? t('pagination.all') : entryValue
          }
          nextLabel={t('pagination.next')}
          onEntriesChange={listing.setEntriesValue}
          onPageChange={listing.goToPage}
          page={listing.table.state.pagination.pageIndex + 1}
          pageLabel={t('pagination.page')}
          previousLabel={t('pagination.previous')}
          showLabel={t('pagination.show')}
          summary={t('pagination.showing', {
            shown: listing.table.getRowModel().rows.length,
            total: listing.filteredRows.length,
          })}
          totalPages={listing.totalPages}
        />
      </section>
    </main>
  );
}
