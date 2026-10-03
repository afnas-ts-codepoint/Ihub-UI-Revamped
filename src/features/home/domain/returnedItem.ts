import type { QueueAction, TrackedTask } from '../types/queue.types';

/**
 * The record a returned tracker card opens in the Form Preview (creator mode).
 * The prototype passes only `{ id, title, kind }`, so every other field is
 * empty and renders as its placeholder; the kind defaults to an action sheet.
 * @prototype index.html:L14576 `setFormModal({ id, title, kind, creator: true })`
 */
export const returnedFormItem = (task: TrackedTask): QueueAction => ({
  amount: '',
  amountNum: 0,
  attachments: [],
  dept: '',
  due: '',
  dueState: 'later',
  group: 'other',
  icon: 'bolt',
  id: task.id,
  impact: '',
  kind: task.kind ?? 'action-sheet',
  owner: '',
  priority: 'medium',
  reason: '',
  recommended: '',
  status: '',
  steps: [],
  title: task.title,
});
