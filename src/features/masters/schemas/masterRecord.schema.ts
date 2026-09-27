import { array, boolean, object, string, type ObjectSchema } from 'yup';

import type { MasterFormValues } from '../domain/formValues';
import { REQUIRED_FIELDS } from '../domain/requiredFields';
import type { MasterMode } from '../domain/types';
import { requiredText } from '@/shared/form/schema/requiredText';

export function createMasterRecordSchema(mode: MasterMode): ObjectSchema<MasterFormValues> {
  const required = new Set<keyof MasterFormValues>(REQUIRED_FIELDS[mode]);
  const text = (key: keyof MasterFormValues) =>
    required.has(key) ? requiredText() : string().defined();
  const list = (key: keyof MasterFormValues) => {
    const schema = array().of(string().defined()).defined();
    return required.has(key) ? schema.min(1) : schema;
  };
  return object({
    applicableFor: text('applicableFor'), area: text('area'), areas: list('areas'),
    assignmentArea: text('assignmentArea'), dept: text('dept'), kpi: text('kpi'),
    location: text('location'), locations: list('locations'), matrix: text('matrix'),
    matrixList: list('matrixList'), name: text('name'), priority: text('priority'),
    severity: text('severity'), snagType: boolean().defined(), subArea: text('subArea'),
    subAreas: list('subAreas'), touchPoint: text('touchPoint'), zone: text('zone'),
    zones: list('zones'),
  });
}
