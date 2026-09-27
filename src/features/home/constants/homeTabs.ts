import { paths } from '@/shared/config/paths';
import type { IconName } from '@/shared/ui/icon/Icon';

import type { HomeTabId } from '../types/home.types';

export type HomeTabDefinition = Readonly<{
  icon: IconName;
  id: HomeTabId;
  labelKey: `tabs.${string}`;
  path: string;
}>;

/** @prototype index.html:L15010-L15027 ordered Home tab strip. */
export const HOME_TABS = [
  { id: 'overview', labelKey: 'tabs.overview', icon: 'grid', path: paths.home.overview },
  { id: 'assigned', labelKey: 'tabs.assigned', icon: 'inbox', path: paths.home.assigned('approvals') },
  { id: 'incidents', labelKey: 'tabs.incidents', icon: 'bolt', path: paths.home.incidents('reports') },
  { id: 'work-centre', labelKey: 'tabs.workCentre', icon: 'refresh', path: paths.home.workCentre('create-task') },
  { id: 'budgets', labelKey: 'tabs.budgets', icon: 'coins', path: paths.home.view('budgets') },
  { id: 'payment-settlement', labelKey: 'tabs.paymentSettlement', icon: 'wallet', path: paths.home.paymentSettlement('action-sheet') },
  { id: 'purchasing', labelKey: 'tabs.purchasing', icon: 'cart', path: paths.home.view('purchasing') },
  { id: 'sop-checklist', labelKey: 'tabs.sopChecklist', icon: 'check', path: paths.home.view('sop-checklist') },
  { id: 'sla', labelKey: 'tabs.sla', icon: 'shield', path: paths.home.view('sla') },
  { id: 'reports', labelKey: 'tabs.reports', icon: 'chart', path: paths.home.view('reports') },
] as const satisfies readonly HomeTabDefinition[];
