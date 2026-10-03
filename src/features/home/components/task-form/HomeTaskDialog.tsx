import { TaskFormDialog, type TaskFormPrefill } from '@/features/tasks';

import { useHomeQueueStore } from '../../store/homeQueue.store';
import type { HomeTaskDraft } from '../../types/queue.types';

/** The seed the canonical create form can show for a Home job order or live-incident draft. */
const taskPrefill = (draft: HomeTaskDraft): TaskFormPrefill => ({
  location: draft.location,
  priority: draft.priority,
  scope: draft.kind,
  subject: draft.title,
});

/**
 * The Home task form modal (M9.1 Usage C): opened by an Assigned task row or
 * card, and by a live incident's "Raise a task". Per D31 it embeds the
 * canonical create form rather than the prototype's separate task-management
 * body; closing discards the form (nothing is persisted at this call site).
 * @prototype index.html:L14873 `taskOpen` modal
 */
export function HomeTaskDialog() {
  const taskOpen = useHomeQueueStore((state) => state.taskOpen);
  const closeTask = useHomeQueueStore((state) => state.closeTask);
  if (!taskOpen) return null;

  return (
    <TaskFormDialog
      key={taskOpen.id}
      mode="homeTask"
      onCancel={closeTask}
      prefill={taskPrefill(taskOpen)}
      presentation="modal"
      sourceId={taskOpen.id}
      title={taskOpen.title}
    />
  );
}
