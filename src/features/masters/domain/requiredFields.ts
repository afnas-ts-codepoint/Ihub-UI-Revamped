import type { MasterFormValues } from './formValues';
import type { MasterMode } from './types';

export const REQUIRED_FIELDS = {
  aa: ['location', 'zone', 'name'],
  generic: ['location', 'zone', 'area', 'dept'],
  pc: ['name'],
  sa: ['location', 'zone', 'assignmentArea', 'name'],
  tm: ['locations', 'zones', 'areas', 'subAreas', 'dept'],
} as const satisfies Record<MasterMode, readonly (keyof MasterFormValues)[]>;

/** Exact port of prototype `masterFormMissing`. @prototype index.html:L4290-L4297 */
export function masterFormMissing(
  values: Partial<MasterFormValues>,
  mode: MasterMode,
): boolean {
  const has = (key: keyof MasterFormValues) => Boolean(String(values[key] || '').trim());
  const any = (key: keyof MasterFormValues) => {
    const value = values[key];
    return Array.isArray(value) && value.length > 0;
  };
  if (mode === 'tm') {
    return !any('locations') || !any('zones') || !any('areas') ||
      !any('subAreas') || !has('dept');
  }
  return REQUIRED_FIELDS[mode].some((key) => !has(key));
}
