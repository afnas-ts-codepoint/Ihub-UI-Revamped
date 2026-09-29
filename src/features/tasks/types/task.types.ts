export type TaskSeverity = 'Critical' | 'High' | 'Low' | 'Medium';
export type TaskRisk = 'Critical' | 'High' | 'Low' | 'Medium';
export type TaskStage = 'Done' | 'In progress' | 'Open' | 'Review';
export type TaskKind = 'external' | 'internal';
export type TaskFlow = 'direct' | 'multi';
export type TaskSla = '' | 'atrisk' | 'exceeded' | 'met';

export type Task = Readonly<{
  days: number;
  department: string;
  due: string;
  flow: TaskFlow;
  id: string;
  kind: TaskKind;
  risk: TaskRisk;
  severity: TaskSeverity;
  sla: TaskSla;
  stage: TaskStage;
  subject: string;
  location: string;
  zone: string;
  dependencies: number;
}>;

export type TaskViewModel = Task &
  Readonly<{
    checklistCount: number;
    progress: number;
  }>;

export type TaskKindFilter = 'all' | TaskKind;
export type TaskBoardColumn = 'completed' | 'critical' | 'new' | 'progress';
