export type WorkflowStep = Readonly<{
  action: string;
  duration: string;
  owner: string;
}>;

export type WorkflowTask = Readonly<{
  id: string;
  name: Readonly<{ ar: string; en: string }>;
  steps: readonly WorkflowStep[];
}>;

export type WorkflowRule = Readonly<{
  active: boolean;
  condition: string;
  label: string;
  route: string;
  sla: string;
  type: string;
}>;

export type WorkflowDepartment = Readonly<{
  divisions: readonly Readonly<{
    id: string;
    name: Readonly<{ ar: string; en: string }>;
  }>[];
  id: string;
  name: Readonly<{ ar: string; en: string }>;
  rules: readonly WorkflowRule[];
  tasks: readonly WorkflowTask[];
}>;

export type AutoRoutingCategory = Readonly<{
  labels: readonly Readonly<{ label: string; route: string }>[];
  name: Readonly<{ ar: string; en: string }>;
  owner: string;
  sla: string;
}>;

export type WorkflowTabId = 'auto' | 'flow' | 'rules' | 'sla';
