import { describe, expect, it } from 'vitest';

import {
  ASSIGNMENT_AREAS,
  findMasterDefinition,
  MACHINE_MASTER,
  MASTER_DEFINITIONS,
  PROJECT_CATEGORY_MASTER,
  SUB_AREA,
  TASK_MAPPING,
} from './definitions';

describe('MASTER_DEFINITIONS', () => {
  it('lists exactly the five MASTERS_WITH_PAGE items, in prototype order', () => {
    expect(MASTER_DEFINITIONS.map((definition) => definition.label)).toEqual([
      'Project Category Master',
      'Machine Master',
      'Assignment Areas',
      'Task Mapping',
      'Sub Area',
    ]);
  });

  it('assigns exactly one of the five modes to each definition', () => {
    expect(MASTER_DEFINITIONS.map((definition) => definition.mode)).toEqual([
      'pc',
      'generic',
      'aa',
      'tm',
      'sa',
    ]);
  });

  it('finds a definition by its Masters catalogue slug', () => {
    expect(findMasterDefinition('project-category-master')).toBe(
      PROJECT_CATEGORY_MASTER,
    );
    expect(findMasterDefinition('machine-master')).toBe(MACHINE_MASTER);
    expect(findMasterDefinition('assignment-areas')).toBe(ASSIGNMENT_AREAS);
    expect(findMasterDefinition('task-mapping')).toBe(TASK_MAPPING);
    expect(findMasterDefinition('sub-area')).toBe(SUB_AREA);
    expect(findMasterDefinition('not-a-master')).toBeUndefined();
  });

  it('ports every seed row set at its exact prototype count', () => {
    expect(PROJECT_CATEGORY_MASTER.seedRows).toHaveLength(18);
    expect(MACHINE_MASTER.seedRows).toHaveLength(18);
    expect(ASSIGNMENT_AREAS.seedRows).toHaveLength(17);
    expect(TASK_MAPPING.seedRows).toHaveLength(18);
    expect(SUB_AREA.seedRows).toHaveLength(18);
  });

  it('matches the exact per-mode column set', () => {
    expect(PROJECT_CATEGORY_MASTER.columns.map((column) => column.id)).toEqual([
      'name',
      'createdOn',
      'status',
    ]);
    expect(MACHINE_MASTER.columns.map((column) => column.id)).toEqual([
      'name',
      'code',
      'dept',
      'status',
    ]);
    expect(ASSIGNMENT_AREAS.columns.map((column) => column.id)).toEqual([
      'location',
      'zone',
      'name',
      'status',
    ]);
    expect(SUB_AREA.columns.map((column) => column.id)).toEqual([
      'location',
      'zone',
      'assignmentArea',
      'name',
      'status',
    ]);
    expect(TASK_MAPPING.columns.map((column) => column.id)).toEqual([
      'location',
      'zone',
      'area',
      'subArea',
      'touchPoint',
      'dept',
      'status',
    ]);
  });

  it('matches the exact per-mode filter-field set, in prototype order', () => {
    expect(
      PROJECT_CATEGORY_MASTER.filterFields.map((field) => field.id),
    ).toEqual(['name', 'fromDate', 'toDate', 'status']);
    expect(ASSIGNMENT_AREAS.filterFields.map((field) => field.id)).toEqual([
      'locations',
      'zones',
      'fromDate',
      'toDate',
    ]);
    expect(SUB_AREA.filterFields.map((field) => field.id)).toEqual([
      'locations',
      'zones',
      'assignmentArea',
      'subAreaName',
      'fromDate',
      'toDate',
    ]);
    expect(TASK_MAPPING.filterFields.map((field) => field.id)).toEqual([
      'locations',
      'zones',
      'area',
      'subArea',
      'touchPoint',
      'dept',
      'applicableFor',
      'fromDate',
      'toDate',
      'status',
    ]);
    expect(MACHINE_MASTER.filterFields.map((field) => field.id)).toEqual([
      'locations',
      'zones',
      'createdOn',
      'updatedOn',
      'createdBy',
      'updatedBy',
      'status',
    ]);
  });
});
