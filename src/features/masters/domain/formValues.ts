import type { MasterMode, MasterRow } from './types';

export type MasterFormValues = {
  applicableFor: string;
  area: string;
  areas: string[];
  assignmentArea: string;
  dept: string;
  kpi: string;
  location: string;
  locations: string[];
  matrix: string;
  matrixList: string[];
  name: string;
  priority: string;
  severity: string;
  snagType: boolean;
  subArea: string;
  subAreas: string[];
  touchPoint: string;
  zone: string;
  zones: string[];
};

export const EMPTY_MASTER_FORM: MasterFormValues = {
  applicableFor: '', area: '', areas: [], assignmentArea: '', dept: '',
  kpi: '', location: '', locations: [], matrix: '', matrixList: [], name: '',
  priority: '', severity: '', snagType: false, subArea: '', subAreas: [],
  touchPoint: '', zone: '', zones: [],
};

/** @prototype index.html:L4281 */
export function splitMasterMultiValue(
  value: readonly string[] | string | undefined,
): string[] {
  if (typeof value !== 'string') return value ? Array.from(value) : [];
  return value
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
}

/** @prototype index.html:L4282-L4288 (`masterFormDraft`) */
export function masterFormDraft(
  record: MasterRow | null,
  mode: MasterMode,
): MasterFormValues {
  if (!record) return { ...EMPTY_MASTER_FORM };
  const base: MasterFormValues = {
    ...EMPTY_MASTER_FORM,
    applicableFor: record.applicableFor ?? '', area: record.area ?? '',
    assignmentArea: record.assignmentArea ?? '', dept: record.dept ?? '',
    kpi: record.kpi ?? '', location: record.location ?? '',
    matrix: record.matrix ?? '', name: record.name,
    priority: record.priority ?? '', severity: record.severity ?? '',
    snagType: record.snagType ?? false, subArea: record.subArea ?? '',
    touchPoint: record.touchPoint ?? '', zone: record.zone ?? '',
  };
  if (mode !== 'tm') return base;
  return {
    ...base,
    areas: splitMasterMultiValue(record.area),
    locations: splitMasterMultiValue(record.location),
    matrixList: splitMasterMultiValue(record.matrix),
    subAreas: splitMasterMultiValue(record.subArea),
    zones: splitMasterMultiValue(record.zone),
  };
}

/** @prototype index.html:L4471-L4474 */
export function masterFormOutput(
  record: MasterRow,
  values: MasterFormValues,
  mode: MasterMode,
): MasterRow {
  if (mode === 'tm') {
    const priority =
      values.priority === 'high' || values.priority === 'low' || values.priority === 'medium'
        ? values.priority : undefined;
    const severity =
      values.severity === 'high' || values.severity === 'low' || values.severity === 'medium'
        ? values.severity : undefined;
    return {
      ...record, applicableFor: values.applicableFor,
      area: values.areas.join(', '), dept: values.dept, kpi: values.kpi,
      location: values.locations.join(', '), matrix: values.matrixList.join(', '),
      name: values.areas[0] ?? values.name, priority, severity,
      subArea: values.subAreas.join(', '), touchPoint: values.touchPoint,
      zone: values.zones.join(', '),
    };
  }
  return {
    ...record, area: values.area, assignmentArea: values.assignmentArea,
    dept: values.dept, kpi: values.kpi, location: values.location,
    matrix: values.matrix, name: values.name, snagType: values.snagType,
    subArea: values.subArea, touchPoint: values.touchPoint, zone: values.zone,
  };
}
