import { statusCell, textCell } from './cells';
import type { MasterDefinition } from './types';
import {
  AA_AREA_ROWS,
  MASTER_MOCK_ROWS,
  PC_CATEGORY_ROWS,
  SA_SUB_ROWS,
  TM_MAP_ROWS,
} from '../data/seedRows';

const statusColumn = {
  id: 'status',
  labelKey: 'columns.status',
  render: statusCell,
};

/** @prototype index.html:L4534,L4592-L4595,L4626-L4630 */
export const PROJECT_CATEGORY_MASTER: MasterDefinition = {
  columns: [
    {
      id: 'name',
      labelKey: 'columns.name',
      render: textCell('name', { strong: true }),
    },
    {
      id: 'createdOn',
      labelKey: 'columns.createdOn',
      render: textCell('createdOn', { dash: true, muted: true, num: true }),
    },
    statusColumn,
  ],
  filterFields: [
    { id: 'name', labelKey: 'fields.name' },
    { id: 'fromDate', labelKey: 'fields.fromDate' },
    { id: 'toDate', labelKey: 'fields.toDate' },
    { id: 'status', labelKey: 'fields.status' },
  ],
  label: 'Project Category Master',
  mode: 'pc',
  seedRows: PC_CATEGORY_ROWS,
  slug: 'project-category-master',
};

/** @prototype index.html:L4535,L4596-L4600,L4631-L4635 */
export const ASSIGNMENT_AREAS: MasterDefinition = {
  columns: [
    {
      id: 'location',
      labelKey: 'columns.location',
      render: textCell('location'),
    },
    { id: 'zone', labelKey: 'columns.zone', render: textCell('zone') },
    {
      id: 'name',
      labelKey: 'columns.areaName',
      render: textCell('name', { strong: true }),
    },
    statusColumn,
  ],
  filterFields: [
    { id: 'locations', labelKey: 'fields.location' },
    { id: 'zones', labelKey: 'fields.zone' },
    { id: 'fromDate', labelKey: 'fields.fromDate' },
    { id: 'toDate', labelKey: 'fields.toDate' },
  ],
  label: 'Assignment Areas',
  mode: 'aa',
  seedRows: AA_AREA_ROWS,
  slug: 'assignment-areas',
};

/** @prototype index.html:L4536,L4607-L4614,L4643-L4653 */
export const TASK_MAPPING: MasterDefinition = {
  columns: [
    {
      id: 'location',
      labelKey: 'columns.location',
      render: textCell('location'),
    },
    { id: 'zone', labelKey: 'columns.zone', render: textCell('zone') },
    {
      id: 'area',
      labelKey: 'columns.area',
      render: textCell('area', { strong: true }),
    },
    { id: 'subArea', labelKey: 'columns.subArea', render: textCell('subArea') },
    {
      id: 'touchPoint',
      labelKey: 'columns.touchPoint',
      render: textCell('touchPoint'),
    },
    { id: 'dept', labelKey: 'columns.dept', render: textCell('dept') },
    statusColumn,
  ],
  filterFields: [
    { id: 'locations', labelKey: 'fields.location' },
    { id: 'zones', labelKey: 'fields.zone' },
    { id: 'area', labelKey: 'fields.area' },
    { id: 'subArea', labelKey: 'fields.subArea' },
    { id: 'touchPoint', labelKey: 'fields.touchPoint' },
    { id: 'dept', labelKey: 'fields.dept' },
    { id: 'applicableFor', labelKey: 'fields.applicableFor' },
    { id: 'fromDate', labelKey: 'fields.fromDate' },
    { id: 'toDate', labelKey: 'fields.toDate' },
    { id: 'status', labelKey: 'fields.status' },
  ],
  label: 'Task Mapping',
  mode: 'tm',
  seedRows: TM_MAP_ROWS,
  slug: 'task-mapping',
};

/** @prototype index.html:L4537,L4601-L4606,L4636-L4642 */
export const SUB_AREA: MasterDefinition = {
  columns: [
    {
      id: 'location',
      labelKey: 'columns.location',
      render: textCell('location'),
    },
    { id: 'zone', labelKey: 'columns.zone', render: textCell('zone') },
    {
      id: 'assignmentArea',
      labelKey: 'columns.assignmentArea',
      render: textCell('assignmentArea'),
    },
    {
      id: 'name',
      labelKey: 'columns.subAreaName',
      render: textCell('name', { strong: true }),
    },
    statusColumn,
  ],
  filterFields: [
    { id: 'locations', labelKey: 'fields.location' },
    { id: 'zones', labelKey: 'fields.zone' },
    { id: 'assignmentArea', labelKey: 'fields.assignmentArea' },
    { id: 'subAreaName', labelKey: 'fields.subArea' },
    { id: 'fromDate', labelKey: 'fields.fromDate' },
    { id: 'toDate', labelKey: 'fields.toDate' },
  ],
  label: 'Sub Area',
  mode: 'sa',
  seedRows: SA_SUB_ROWS,
  slug: 'sub-area',
};

/** @prototype index.html:L4615-L4620,L4654-L4662 (Machine Master; generic mode) */
export const MACHINE_MASTER: MasterDefinition = {
  columns: [
    {
      id: 'name',
      labelKey: 'columns.name',
      render: textCell('name', { strong: true }),
    },
    {
      id: 'code',
      labelKey: 'columns.code',
      render: textCell('code', { muted: true, num: true }),
    },
    { id: 'dept', labelKey: 'columns.dept', render: textCell('dept') },
    statusColumn,
  ],
  filterFields: [
    { id: 'locations', labelKey: 'fields.allLocations' },
    { id: 'zones', labelKey: 'fields.allZones' },
    { id: 'createdOn', labelKey: 'fields.createdOn' },
    { id: 'updatedOn', labelKey: 'fields.updatedOn' },
    { id: 'createdBy', labelKey: 'fields.createdBy' },
    { id: 'updatedBy', labelKey: 'fields.updatedBy' },
    { id: 'status', labelKey: 'fields.status' },
  ],
  label: 'Machine Master',
  mode: 'generic',
  seedRows: MASTER_MOCK_ROWS,
  slug: 'machine-master',
};

/** @prototype index.html:L2458 (`MASTERS_WITH_PAGE`) */
export const MASTER_DEFINITIONS: readonly MasterDefinition[] = [
  PROJECT_CATEGORY_MASTER,
  MACHINE_MASTER,
  ASSIGNMENT_AREAS,
  TASK_MAPPING,
  SUB_AREA,
];

/** Every `MASTERS_WITH_PAGE` slug is globally unique, so the slug alone finds it. */
export function findMasterDefinition(
  slug: string | undefined,
): MasterDefinition | undefined {
  return MASTER_DEFINITIONS.find((definition) => definition.slug === slug);
}
