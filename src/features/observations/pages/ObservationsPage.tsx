import { ObservationAdd } from '../components/ObservationAdd';
import { ObservationAssignment } from '../components/ObservationAssignment';
import { ObservationHistory } from '../components/ObservationHistory';
import type { ObservationView } from '../types/observations.types';
import { SectionReport } from '@/features/reports';

export function ObservationsPage({
  view,
}: Readonly<{ view: ObservationView }>) {
  if (view === 'assignment') return <ObservationAssignment />;
  if (view === 'history') return <ObservationHistory />;
  if (view === 'report')
    return <SectionReport reportKey="observations" title="Observations" />;
  return <ObservationAdd />;
}
