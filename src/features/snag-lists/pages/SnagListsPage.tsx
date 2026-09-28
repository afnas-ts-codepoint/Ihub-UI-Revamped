import { SnagAdd } from '../components/SnagAdd';
import { SnagListing } from '../components/SnagListing';
import { SnagReport } from '../components/SnagReport';
import { SNAG_ROWS } from '../data/snag-lists.mock';
import type { SnagListsView } from '../types/snag-lists.types';

export function SnagListsPage({ view }: Readonly<{ view: SnagListsView }>) {
  if (view === 'listing') return <SnagListing rows={SNAG_ROWS} />;
  if (view === 'report') return <SnagReport rows={SNAG_ROWS} />;
  return <SnagAdd />;
}
