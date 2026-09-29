import { useMemo } from 'react';
import { create } from 'zustand';

import { TASKS, TASK_CHECKLIST } from '../data/tasks.mock';
import { initialChecklistCount, progressFromChecklist } from '../domain/tasks';
import type { Task, TaskStage, TaskViewModel } from '../types/task.types';

type TasksState = {
  checklistCounts: Readonly<Record<string, number>>;
  createdTasks: readonly Task[];
  prependTask: (task: Task) => void;
  reset: () => void;
  setChecklistCount: (id: string, count: number) => void;
  stageOverrides: Readonly<Record<string, TaskStage>>;
  toggleClosed: (id: string) => void;
};

const emptyState = {
  checklistCounts: {},
  createdTasks: [],
  stageOverrides: {},
} as const;

export const useTasksStore = create<TasksState>()((set, get) => ({
  ...emptyState,
  prependTask: (task) => {
    set((state) => ({ createdTasks: [task, ...state.createdTasks] }));
  },
  reset: () => {
    set(emptyState);
  },
  setChecklistCount: (id, requestedCount) => {
    const task = [...get().createdTasks, ...TASKS].find(
      (candidate) => candidate.id === id,
    );
    if (!task) return;
    const count = Math.min(TASK_CHECKLIST.length, Math.max(0, requestedCount));
    const currentStage = get().stageOverrides[id] ?? task.stage;
    const stage =
      count === TASK_CHECKLIST.length
        ? 'Done'
        : currentStage === 'Done'
          ? 'In progress'
          : currentStage;
    set((state) => ({
      checklistCounts: { ...state.checklistCounts, [id]: count },
      stageOverrides: { ...state.stageOverrides, [id]: stage },
    }));
  },
  toggleClosed: (id) => {
    const task = [...get().createdTasks, ...TASKS].find(
      (candidate) => candidate.id === id,
    );
    if (!task) return;
    const currentStage = get().stageOverrides[id] ?? task.stage;
    const done = currentStage === 'Done';
    set((state) => ({
      checklistCounts: {
        ...state.checklistCounts,
        [id]: done ? TASK_CHECKLIST.length - 1 : TASK_CHECKLIST.length,
      },
      stageOverrides: {
        ...state.stageOverrides,
        [id]: done ? 'In progress' : 'Done',
      },
    }));
  },
}));

export function useTasks(): readonly TaskViewModel[] {
  const checklistCounts = useTasksStore((state) => state.checklistCounts);
  const createdTasks = useTasksStore((state) => state.createdTasks);
  const stageOverrides = useTasksStore((state) => state.stageOverrides);
  return useMemo(
    () =>
      [...createdTasks, ...TASKS].map((task) => {
        const stage = stageOverrides[task.id] ?? task.stage;
        const taskWithStage = { ...task, stage };
        const checklistCount =
          checklistCounts[task.id] ?? initialChecklistCount(taskWithStage);
        return {
          ...taskWithStage,
          checklistCount,
          progress: progressFromChecklist(checklistCount),
        };
      }),
    [checklistCounts, createdTasks, stageOverrides],
  );
}

export function useTask(id: string | null): TaskViewModel | undefined {
  const tasks = useTasks();
  return id ? tasks.find((task) => task.id === id) : undefined;
}
