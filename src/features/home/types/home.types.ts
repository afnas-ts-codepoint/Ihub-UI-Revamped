export type HomeDueState = 'overdue' | 'today' | 'soon' | 'later';
export type HomePriority = 'critical' | 'high' | 'medium' | 'low';
export type HomeIncidentSeverity = HomePriority;
export type HomeIncidentSla = 'breached' | 'at-risk' | 'ok';

export type HomeAction = Readonly<{
  amount: string;
  dept: string;
  due: string;
  dueState: HomeDueState;
  id: string;
  owner: string;
  priority: HomePriority;
  title: string;
}>;

export type HomeIncident = Readonly<{
  id: string;
  pinned: boolean;
  progress: number;
  severity: HomeIncidentSeverity;
  sla: HomeIncidentSla;
  status: string;
  title: string;
}>;

export type HomeJobOrder = Readonly<{
  id: string;
  isNew: boolean;
  status: string;
}>;

export type HomeAssignedSheet = Readonly<{ id: string }>;

export type HomeDelegate = Readonly<{
  name: string;
  title: string;
}>;

export type HomeProfile = Readonly<{
  completion: number;
  delegates: readonly HomeDelegate[];
  delegationTill: string;
  name: string;
  role: string;
}>;

export type HomeBannerData = Readonly<{
  actions: readonly HomeAction[];
  assignedSheets: readonly HomeAssignedSheet[];
  incidents: readonly HomeIncident[];
  jobOrders: readonly HomeJobOrder[];
  profile: HomeProfile;
}>;

export type HomeCounts = Readonly<{
  actions: number;
  assigned: number;
  breaches: number;
  criticalIncidents: number;
  incidents: number;
  newTasks: number;
  onTrackPercent: number;
  overdue: number;
  today: number;
  soon: number;
  later: number;
  totalTasks: number;
  urgent: number;
}>;

export type HomeTabId =
  | 'overview'
  | 'assigned'
  | 'incidents'
  | 'work-centre'
  | 'budgets'
  | 'payment-settlement'
  | 'purchasing'
  | 'sop-checklist'
  | 'sla'
  | 'reports';
