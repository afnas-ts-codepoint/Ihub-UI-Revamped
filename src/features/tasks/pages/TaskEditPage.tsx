import { ArrowLeft, FileSearch } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';

import { AddDependencyDialog, type NewDependencyInput } from '../components/task-edit/AddDependencyDialog';
import { RedirectDialog } from '../components/task-edit/RedirectDialog';
import { TaskEditActionBar } from '../components/task-edit/TaskEditActionBar';
import {
  ApproveTaskDialog,
  CeoCommentsDialog,
  CloseTaskDialog,
  RejectTaskDialog,
} from '../components/task-edit/TaskEditActionDialogs';
import {
  AddCommentPanel,
  DEFAULT_MATRIX_PARTNERS,
  DEFAULT_PROCESS_OWNER,
  TaskEditAssignmentPanel,
  TaskEditAttachmentsPanel,
  TaskEditDetailsPanel,
  TaskEditLocationPanel,
  TaskEditSlaPanel,
} from '../components/task-edit/TaskEditPanels';
import { UpdateSubTasksDialog } from '../components/task-edit/UpdateSubTasksDialog';
import { ActivityHistoryPanel } from '../components/task-view/ActivityHistoryPanel';
import {
  DEPENDENCIES_PANEL_ANCHOR_ID,
  DependenciesPanel,
  type DisplayDependency,
} from '../components/task-view/DependenciesPanel';
import { DependencyReminderDialog } from '../components/task-view/DependencyReminderDialog';
import {
  ReferenceNumbersPanel,
  RequesterInfoPanel,
  TaskClassificationPanel,
} from '../components/task-view/InfoPanels';
import { LogNotesPanel } from '../components/task-view/LogNotesPanel';
import { SubTaskHistoryDialog } from '../components/task-view/SubTaskHistoryDialog';
import { SubTasksProgressPanel } from '../components/task-view/SubTasksProgressPanel';
import { TaskViewHeader } from '../components/task-view/TaskViewHeader';
import { TASK_VIEW_DEPENDENCIES, TASK_VIEW_TEAM } from '../data/taskView.mock';
import {
  assetCategoryFor,
  assetCodeFor,
  daysElapsedFor,
  dependencyReminderItems,
  headerStats,
  ownerNameFor,
  projectFor,
  scheduleDatesFor,
  startedTargetTimes,
  taskViewSeed,
} from '../domain/taskView';
import { useTask } from '../store/tasks.store';
import { paths } from '@/shared/config/paths';
import { addWorkdays, parseFlexibleDate, toUsDate } from '@/shared/lib/date/workdays';

/**
 * M8.5 `/tasks/:taskId/edit`: edit-mode cards, comments, notes, history and
 * delayed dependency reminder. M8.6 adds the sticky action bar (CEO
 * Comments / Submit / Approve / Reject / Close Task / More → Redirect, Log
 * Note, Export, Print) and its dialogs (CEO Comments, Approve, Reject,
 * Close Task, Redirect, Add Dependency, Update Sub Tasks).
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L17892-L19510 `TaskEditPage` edit path.
 */
export function TaskEditPage() {
  const { t } = useTranslation('taskView');
  const { taskId } = useParams<{ taskId: string }>();
  const task = useTask(taskId ?? null);
  const navigate = useNavigate();
  const location = useLocation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dependenciesOpen, setDependenciesOpen] = useState(false);
  const [dependenciesHighlighted, setDependenciesHighlighted] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  // M8.6 — assignment state lifted out of `TaskEditAssignmentPanel` so the
  // Redirect dialog can overwrite it, matching the prototype's single
  // shared `processOwner`/`matrixPartners`/`assignee` state.
  const [processOwner, setProcessOwner] = useState(DEFAULT_PROCESS_OWNER);
  const [matrixPartners, setMatrixPartners] = useState<readonly string[]>(DEFAULT_MATRIX_PARTNERS);
  const [assignee, setAssignee] = useState('');
  const [extraDependencies, setExtraDependencies] = useState<readonly DisplayDependency[]>([]);

  const [ceoOpen, setCeoOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [redirectOpen, setRedirectOpen] = useState(false);
  const [addDependencyOpen, setAddDependencyOpen] = useState(false);
  const [updateSubTasksOpen, setUpdateSubTasksOpen] = useState(false);

  const seed = useMemo(() => (task ? taskViewSeed(task.id) : 0), [task]);
  const project = useMemo(() => (task ? projectFor(task.department) : (['', ''] as const)), [task]);
  const schedule = useMemo(() => (task ? scheduleDatesFor(task.due) : { start: '', target: '' }), [task]);
  const stats = useMemo(() => headerStats(seed), [seed]);
  const reminderItems = useMemo(
    () => dependencyReminderItems(TASK_VIEW_DEPENDENCIES.map((dependency) => ({
      blocking: dependency.blocking,
      category: dependency.category,
      dueDate: addWorkdays(new Date(), dependency.workdaysFromNow),
      id: dependency.id,
      status: dependency.status,
      type: dependency.type,
    }))),
    [],
  );

  useEffect(() => {
    if (!task || !reminderItems.length) return;
    const timer = window.setTimeout(() => { setReminderOpen(true); }, 2000);
    return () => { window.clearTimeout(timer); };
  }, [reminderItems.length, task]);

  const goBack = () => {
    if (location.key === 'default') {
      void navigate(paths.home.workCentre('tasks'));
      return;
    }
    void navigate(-1);
  };

  if (!task) {
    return (
      <section className="rounded-xl border border-line bg-surface p-10 text-center" data-testid="task-edit-not-found">
        <FileSearch aria-hidden className="mx-auto text-fg-4" size={30} />
        <h1 className="mt-3 text-lg font-semibold">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm-plus text-fg-3">{t('notFound.description')}</p>
        <button className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink" onClick={goBack} type="button">{t('notFound.back')}</button>
      </section>
    );
  }

  const openDependencies = () => {
    setDependenciesOpen(true);
    setDependenciesHighlighted(true);
    window.setTimeout(() => {
      document.getElementById(DEPENDENCIES_PANEL_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    window.setTimeout(() => { setDependenciesHighlighted(false); }, 2600);
  };

  const addDependency = (input: NewDependencyInput) => {
    const nextIndex = TASK_VIEW_DEPENDENCIES.length + extraDependencies.length + 1;
    const parsedImpact = parseFlexibleDate(input.impactDate);
    setExtraDependencies((current) => [
      ...current,
      {
        blocking: input.blocking,
        category: input.category,
        id: `DEP-${String(nextIndex).padStart(3, '0')}`,
        impactDate: parsedImpact ? toUsDate(parsedImpact) : '',
        leadTime: input.leadTime,
        remarks: input.remarks,
        status: 'Pending',
        type: input.type,
      },
    ]);
    setDependenciesOpen(true);
  };

  return (
    <div className="flex flex-col gap-5 pb-47.5 tablet:pb-37.5 desktop:pb-26" data-testid="task-edit-page">
      <h1 className="m-0 text-2xl-plus font-semibold">{t('edit.pageTitle')}</h1>
      <button className="-mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset" onClick={goBack} type="button"><ArrowLeft aria-hidden size={14} />{t('back')}</button>

      <TaskViewHeader
        onOpenHistory={() => { setHistoryOpen(true); }}
        onUpdateSubTasks={() => { setUpdateSubTasksOpen(true); }}
        schedule={schedule}
        stats={stats}
        task={task}
        times={startedTargetTimes(seed)}
      />

      <div className="grid grid-cols-1 items-start gap-4 desktop:grid-cols-[minmax(0,29fr)_minmax(0,11fr)]" data-testid="task-edit-columns">
        <div className="flex min-w-0 flex-col gap-4">
          <SubTasksProgressPanel
            interaction="pending-update"
            onOpenHistory={() => { setHistoryOpen(true); }}
            onUpdateSubTasks={() => { setUpdateSubTasksOpen(true); }}
          />
          <TaskEditDetailsPanel project={project} task={task} />
          <TaskClassificationPanel task={task} />
          <RequesterInfoPanel daysElapsed={daysElapsedFor(seed)} ownerName={ownerNameFor(seed, TASK_VIEW_TEAM)} task={task} />
          <TaskEditLocationPanel assetCategory={assetCategoryFor(task.department)} assetCode={assetCodeFor(seed)} task={task} />
          <TaskEditSlaPanel />
          <TaskEditAttachmentsPanel startDate={schedule.start} />
          <ReferenceNumbersPanel />
          <ActivityHistoryPanel department={task.department} headerActions seed={seed} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <TaskEditAssignmentPanel
            assignee={assignee}
            matrixPartners={matrixPartners}
            onAssigneeChange={setAssignee}
            processOwner={processOwner}
          />
          <DependenciesPanel
            extraDependencies={extraDependencies}
            highlighted={dependenciesHighlighted}
            onAddDependency={() => { setAddDependencyOpen(true); }}
            onOpenChange={setDependenciesOpen}
            open={dependenciesOpen}
          />
          <AddCommentPanel department={task.department} startDate={schedule.start} />
          <LogNotesPanel editable />
        </div>
      </div>

      <SubTaskHistoryDialog onClose={() => { setHistoryOpen(false); }} open={historyOpen} />
      <DependencyReminderDialog items={reminderItems} onClose={() => { setReminderOpen(false); }} onView={openDependencies} open={reminderOpen} />

      <TaskEditActionBar
        onApprove={() => { setApproveOpen(true); }}
        onCeoComments={() => { setCeoOpen(true); }}
        onClose={() => { setCloseOpen(true); }}
        onRedirect={() => { setRedirectOpen(true); }}
        onReject={() => { setRejectOpen(true); }}
      />
      <CeoCommentsDialog onOpenChange={setCeoOpen} open={ceoOpen} />
      <ApproveTaskDialog onOpenChange={setApproveOpen} open={approveOpen} />
      <RejectTaskDialog onOpenChange={setRejectOpen} open={rejectOpen} />
      <CloseTaskDialog onOpenChange={setCloseOpen} open={closeOpen} />
      <RedirectDialog
        assignee={assignee}
        key={redirectOpen ? 'redirect-open' : 'redirect-closed'}
        matrixPartners={matrixPartners}
        onOpenChange={setRedirectOpen}
        onRedirect={(selection) => {
          setProcessOwner(selection.processOwner);
          setMatrixPartners(selection.matrixPartners);
          setAssignee(selection.assignee);
        }}
        open={redirectOpen}
        processOwner={processOwner}
      />
      <AddDependencyDialog onAdd={addDependency} onOpenChange={setAddDependencyOpen} open={addDependencyOpen} />
      <UpdateSubTasksDialog onOpenChange={setUpdateSubTasksOpen} open={updateSubTasksOpen} taskDepartment={task.department} />
    </div>
  );
}
