import type { NavNode } from '@/app/navigation/types';
import {
  ADMIN_MASTER_CATALOG,
  GENERAL_MASTER_CATALOG,
  HR_MASTER_CATALOG,
  OPERATION_MASTER_CATALOG,
} from '@/features/masters';
import { paths } from '@/shared/config/paths';

const catalogues = {
  admin: ADMIN_MASTER_CATALOG,
  general: GENERAL_MASTER_CATALOG,
  hr: HR_MASTER_CATALOG,
  operation: OPERATION_MASTER_CATALOG,
} as const;

const labelKey = (id: string) => `navigation.${id.replaceAll('/', '_')}`;

function node(
  id: string,
  path: string,
  children?: readonly NavNode[],
  metadata?: Omit<NavNode, 'children' | 'id' | 'labelKey' | 'path'>,
): NavNode {
  return { id, labelKey: labelKey(id), path, ...metadata, children };
}

const pending = { routeBehavior: 'migration-pending' } as const;

function reportGroup(id: string, children: readonly string[]): NavNode {
  const groupId = `reports/${id}`;
  return node(
    groupId,
    paths.reports.item(id),
    children.map((child) =>
      node(`${groupId}/${child}`, paths.reports.item(`${id}/${child}`)),
    ),
  );
}

const reports = node(
  'reports',
  paths.reports.root,
  [
    reportGroup('hr', [
      'attendance-summary',
      'attendance-detailed',
      'leave-balance',
    ]),
    reportGroup('workforce', ['overtime-summary', 'overtime-detailed']),
    reportGroup('performance', ['appraisal-summary']),
    reportGroup('finance-budgets', [
      'budget-vs-actual',
      'budget-utilisation',
      'purchasing-pending',
      'petty-cash-movement',
    ]),
    reportGroup('work-centre', [
      'job-orders',
      'violations-register',
      'incident-log',
      'enquiries-register',
      'observations-register',
    ]),
    reportGroup('quality-compliance', ['checklist-compliance']),
    reportGroup('system', ['audit-trail']),
  ],
  pending,
);

const home = node(
  'dashboard',
  paths.home.overview,
  [
    node('dashboard/overview', paths.home.overview, undefined, pending),
    node(
      'dashboard/approvals',
      paths.home.view('approvals'),
      undefined,
      pending,
    ),
    node(
      'dashboard/assigned',
      paths.home.assigned('approvals'),
      undefined,
      pending,
    ),
    node(
      'dashboard/incidents',
      paths.home.incidents('reports'),
      undefined,
      pending,
    ),
    node('dashboard/tasks', paths.home.view('tasks'), undefined, pending),
    node(
      'dashboard/live-feed',
      paths.home.incidents('live'),
      undefined,
      pending,
    ),
    node('dashboard/company', paths.home.view('company'), undefined, pending),
    reports,
  ],
  { ...pending, icon: 'dashboard' },
);

const finance = node(
  'budgeting',
  paths.finance.root,
  [
    node('budgeting/dashboard', paths.finance.dashboard, undefined, pending),
    node('budgeting/budgeting', paths.finance.budgeting, undefined, pending),
  ],
  { ...pending, icon: 'coins' },
);

const overtime = node(
  'overtime/overtime',
  paths.hr.item('overtime'),
  [
    'to-do',
    'verify',
    'edit',
    'correction',
    'above-no-budget',
    'justification',
    'record-listing',
  ].map((item) =>
    node(`overtime/overtime/${item}`, paths.hr.item(`overtime/${item}`)),
  ),
);

const hr = node(
  'overtime',
  paths.hr.root,
  [
    node('overtime/dashboard', paths.hr.item('dashboard')),
    node(
      'overtime/workforce-statistics',
      paths.hr.item('workforce-statistics'),
    ),
    overtime,
    ...[
      'investigations',
      'violations',
      'loan',
      'end-of-probation',
      'exit-interview',
    ].map((item) => node(`overtime/${item}`, paths.hr.item(item))),
  ],
  { icon: 'users' },
);

const qualityChecklists = node(
  'checklist/quality-assurance-checklists',
  paths.quality.item('quality-assurance-checklists'),
  [
    'risk-levels',
    'standard-parameters',
    'zone-accountability',
    'standards',
    'create-checklist',
    'fill-checklist',
    'edit-filled-checklist',
    'report',
  ].map((item) =>
    node(
      `checklist/quality-assurance-checklists/${item}`,
      paths.quality.item(`quality-assurance-checklists/${item}`),
    ),
  ),
);

const quality = node(
  'checklist',
  paths.quality.root,
  [
    node('checklist/dashboard', paths.quality.item('dashboard')),
    node('sla', paths.quality.item('sla'), undefined, pending),
    node('checklist/observations', paths.quality.item('observations')),
    qualityChecklists,
  ],
  { icon: 'shield' },
);

const settings = node(
  'settings-configuration',
  paths.settings.configuration,
  [
    node(
      'settings-configuration/configuration',
      paths.settings.configuration,
      undefined,
      pending,
    ),
    ...[
      'work-centre',
      'finance-budgets',
      'workforce',
      'quality-compliance',
    ].map((item) =>
      node(`settings-configuration/${item}`, paths.settings.item(item)),
    ),
  ],
  { icon: 'settings', topbar: true },
);

function historyGroup(id: string, children: readonly string[]): NavNode {
  const groupId = `history/${id}`;
  return node(
    groupId,
    paths.history.item(id),
    children.map((child) =>
      node(
        `${groupId}/${child}`,
        paths.history.item(`${id}/${child}`),
        undefined,
        pending,
      ),
    ),
    pending,
  );
}

const history = node(
  'history',
  paths.history.root,
  [
    historyGroup('work-centre', [
      'tasks',
      'enquiry',
      'observations',
      'incidents',
      'checklists',
      'price-change',
      'promotions',
    ]),
    historyGroup('finance-budgets', [
      'new-budget',
      'additional-budget',
      'transfer-fund',
      'payment-settlement',
      'petty-cash',
    ]),
    historyGroup('hr', [
      'overtime',
      'investigations',
      'violations',
      'loan',
      'end-of-probation',
      'exit-interview',
    ]),
    node(
      'history/appraisal',
      paths.history.item('appraisal'),
      undefined,
      pending,
    ),
    historyGroup('quality-compliance', [
      'observations',
      'quality-assurance-checklists',
    ]),
    node(
      'history/purchasing',
      paths.history.item('purchasing'),
      undefined,
      pending,
    ),
    node(
      'history/sop-checklist',
      paths.history.item('sop-checklist'),
      undefined,
      pending,
    ),
  ],
  { ...pending, icon: 'clock' },
);

function masterCategory(
  category: keyof typeof catalogues,
  listVariant: boolean,
): NavNode {
  const idRoot = listVariant ? 'masters-list' : 'masters';
  const catalogue = catalogues[category];

  return {
    id: `${idRoot}/${category}`,
    labelKey: `masters.categories.${category}`,
    path: listVariant
      ? paths.mastersList.category(category)
      : paths.masters.category(category),
    children: catalogue.map((entry) => ({
      id: listVariant ? entry.prototypeListId : entry.prototypeId,
      labelKey: entry.labelKey,
      path: listVariant ? entry.listPath : entry.path,
    })),
  };
}

/** Complete 80-entry Masters catalogue subtree for both D10 variants. */
export const MASTERS_NAV = [
  {
    id: 'masters',
    labelKey: 'masters.title',
    path: paths.masters.root,
    icon: 'layers',
    megaMenu: true,
    children: [
      masterCategory('admin', false),
      masterCategory('general', false),
      masterCategory('hr', false),
      masterCategory('operation', false),
    ],
  },
  {
    id: 'masters-list',
    labelKey: 'masters.listTitle',
    path: paths.mastersList.root,
    icon: 'grid',
    firstLeafRoute: true,
    hideInTopNav: true,
    children: [
      masterCategory('admin', true),
      masterCategory('general', true),
      masterCategory('hr', true),
      masterCategory('operation', true),
    ],
  },
] as const satisfies readonly NavNode[];

/** Full prototype `NAV_TREE`, preserving source order and generated ids. */
export const NAV_TREE = [
  home,
  finance,
  hr,
  node('appraisal', paths.appraisal, undefined, { icon: 'star' }),
  quality,
  settings,
  history,
  node('workflows', paths.workflows, undefined, {
    ...pending,
    icon: 'activity',
  }),
  ...MASTERS_NAV,
] as const satisfies readonly NavNode[];
