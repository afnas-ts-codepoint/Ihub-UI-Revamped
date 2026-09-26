import { useState } from 'react';
import { WORK_AREA_MAPPINGS } from '../data/sla.mock';
import { saveWorkAreaMapping } from '../domain/sla';
import type { WorkAreaFormValues, WorkAreaMapping } from '../types/sla.types';
export function useSlaMappings() {
  const [mappings, setMappings] = useState<WorkAreaMapping[]>(() => [
    ...WORK_AREA_MAPPINGS,
  ]);
  return {
    mappings,
    remove(id: string) {
      setMappings((current) => current.filter((entry) => entry.id !== id));
    },
    save(editingId: string | null, values: WorkAreaFormValues) {
      setMappings((current) => [
        ...saveWorkAreaMapping(current, editingId, values),
      ]);
    },
  };
}
