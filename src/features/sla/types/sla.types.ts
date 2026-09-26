export type SlaPriorityId = 'P1' | 'P2' | 'P3' | 'P4';
export type SlaItemState = 'closed' | 'due' | 'late' | 'running';
export type SlaItemType = 'Action sheet' | 'Purchase request' | 'Task';

export type SlaLevel = Readonly<{
  coverage: string;
  definition: string;
  id: SlaPriorityId;
  label: string;
  response: string;
  resolution: string;
  target: number;
}>;

export type SlaPerformance = Readonly<{ onTime: number; workOrders: number }>;
export type SlaPerformanceMap = Readonly<Record<SlaPriorityId, SlaPerformance>>;
export type DepartmentPerformance = Readonly<{
  department: string;
  open: number;
  dueSoon: number;
  breached: number;
  onTime: number;
  response: string;
  resolution: string;
  trend: number;
}>;
export type DepartmentPriorityPerformance = readonly [
  priority: string,
  open: number,
  onTime: number,
];
export type DepartmentDetail = Readonly<{
  lead: string;
  members: number;
  byPriority: readonly DepartmentPriorityPerformance[];
  note: string;
}>;
export type SlaItem = Readonly<{
  id: string;
  type: SlaItemType;
  title: string;
  priority: string;
  assignee: string;
  state: SlaItemState;
  agreed: string;
  used: string;
}>;
export type WorkAreaMapping = Readonly<{
  id: string;
  area: string;
  priorities: readonly SlaPriorityId[];
  response: string;
  resolution: string;
  conditional: string;
}>;
export type WorkAreaFormValues = {
  area: string;
  priorities: SlaPriorityId[];
  response: string;
  resolution: string;
  conditional: string;
};
