import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';

export type MasterMode = 'aa' | 'generic' | 'pc' | 'sa' | 'tm';
export type MasterStatus = 'active' | 'inactive';

/**
 * The union of fields used by any of the five Masters' seed rows. Each mode
 * only ever reads the subset relevant to it (see `domain/definitions.ts`).
 * @prototype index.html:L3489-L3603 (`MASTER_MOCK_ROWS`, `PC_CATEGORY_ROWS`,
 * `AA_AREA_ROWS`, `TM_MAP_ROWS`, `SA_SUB_ROWS`)
 */
export type MasterRow = Readonly<{
  applicableFor?: string;
  area?: string;
  assignmentArea?: string;
  code: string;
  createdOn?: string;
  dept?: string;
  location?: string;
  matrix?: string;
  name: string;
  poWorkflow?: boolean;
  priority?: 'high' | 'low' | 'medium';
  severity?: 'high' | 'low' | 'medium';
  status: MasterStatus;
  subArea?: string;
  touchPoint?: string;
  zone?: string;
}>;

export type MasterCellContext = Readonly<{
  onToggleStatus: (code: string) => void;
  t: TFunction<'masters'>;
}>;

export type MasterColumnDef = Readonly<{
  id: string;
  labelKey: string;
  render: (row: MasterRow, ctx: MasterCellContext) => ReactNode;
}>;

/** A field id understood by `MasterFilterModal`/`filterMasterRows`. */
export type MasterFilterFieldId =
  | 'applicableFor'
  | 'area'
  | 'assignmentArea'
  | 'createdBy'
  | 'createdOn'
  | 'dept'
  | 'fromDate'
  | 'locations'
  | 'name'
  | 'status'
  | 'subArea'
  | 'subAreaName'
  | 'toDate'
  | 'touchPoint'
  | 'updatedBy'
  | 'updatedOn'
  | 'zones';

export type MasterFilterValue = Readonly<
  Partial<Record<MasterFilterFieldId, string>>
>;

export type MasterFilterFieldDef = Readonly<{
  id: MasterFilterFieldId;
  labelKey: string;
}>;

export type MasterDefinition = Readonly<{
  columns: readonly MasterColumnDef[];
  filterFields: readonly MasterFilterFieldDef[];
  /** Prototype `MASTERS_WITH_PAGE` title, e.g. `'Project Category Master'`. */
  label: string;
  mode: MasterMode;
  seedRows: readonly MasterRow[];
  /** Masters catalogue slug, e.g. `'project-category-master'`. */
  slug: string;
}>;
