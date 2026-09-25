import { useLocation } from 'react-router';

import { navTrailForPath } from '@/app/navigation/model';
import { NAV_TREE } from '@/app/navigation/nav.config';

export function useNavTrail() {
  const { pathname } = useLocation();
  return navTrailForPath(NAV_TREE, pathname);
}
