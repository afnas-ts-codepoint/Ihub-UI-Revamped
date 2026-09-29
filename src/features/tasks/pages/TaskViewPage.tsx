import { ArrowLeft, FileSearch, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';

import { ActivityHistoryPanel } from '../components/task-view/ActivityHistoryPanel';
import { AssignmentInfoPanel } from '../components/task-view/AssignmentInfoPanel';
import { AttachmentsPanel } from '../components/task-view/AttachmentsPanel';
import { DEPENDENCIES_PANEL_ANCHOR_ID, DependenciesPanel } from '../components/task-view/DependenciesPanel';
import { DependencyReminderDialog } from '../components/task-view/DependencyReminderDialog';
import {
  LocationZonePanel,
  ReferenceNumbersPanel,
  RequesterInfoPanel,
  TaskClassificationPanel,
  TaskDetailsPanel,
} from '../components/task-view/InfoPanels';
import { LogNotesPanel } from '../components/task-view/LogNotesPanel';
import { SlaPerformancePanel } from '../components/task-view/SlaPerformancePanel';
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
import { addWorkdays } from '@/shared/lib/date/workdays';
import { paths } from '@/shared/config/paths';

/**
 * `/tasks/:taskId` — the read-only Task View page: `TaskEditPage`'s
 * `readOnly:true` render path (`TaskViewPage` in the prototype). Reachable by
 * direct URL/link only; M8.1's `TaskDetailDialog` remains untouched and does
 * not navigate here.
 *
 * @prototype ihub/ORIGINAL_SOURCE.html:L19512-L19513 `TaskViewPage`,
 * L17892-L19510 `TaskEditPage`.
 */
export function TaskViewPage() {
  const { t } = useTranslation('taskView');
  const { taskId } = useParams<{ taskId: string }>();
  const task = useTask(taskId ?? null);
  const navigate = useNavigate();
  const location = useLocation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dependenciesOpen, setDependenciesOpen] = useState(false);
  const [dependenciesHighlighted, setDependenciesHighlighted] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(true);

  const seed = useMemo(() => (task ? taskViewSeed(task.id) : 0), [task]);
  const project = useMemo(() => (task ? projectFor(task.department) : (['', ''] as const)), [task]);
  const schedule = useMemo(() => (task ? scheduleDatesFor(task.due) : { start: '', target: '' }), [task]);
  const stats = useMemo(() => headerStats(seed), [seed]);
  const reminderItems = useMemo(
    () =>
      dependencyReminderItems(
        TASK_VIEW_DEPENDENCIES.map((dependency) => ({
          blocking: dependency.blocking,
          category: dependency.category,
          dueDate: addWorkdays(new Date(), dependency.workdaysFromNow),
          id: dependency.id,
          status: dependency.status,
          type: dependency.type,
        })),
      ),
    [],
  );

  const goBack = () => {
    if (location.key === 'default') {
      void navigate(paths.home.workCentre('tasks'));
      return;
    }
    void navigate(-1);
  };

  if (!task) {
    return (
      <section className="rounded-xl border border-line bg-surface p-10 text-center" data-testid="task-view-not-found">
        <FileSearch aria-hidden className="mx-auto text-fg-4" size={30} />
        <h1 className="mt-3 text-lg font-semibold">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm-plus text-fg-3">{t('notFound.description')}</p>
        <button
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
          onClick={goBack}
          type="button"
        >
          {t('notFound.back')}
        </button>
      </section>
    );
  }

  const openDependencies = () => {
    setDependenciesOpen(true);
    setDependenciesHighlighted(true);
    window.setTimeout(() => {
      document.getElementById(DEPENDENCIES_PANEL_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    window.setTimeout(() => {
      setDependenciesHighlighted(false);
    }, 2_600);
  };

  return (
    <div className="flex flex-col gap-5 pb-10" data-testid="task-view-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-2xl-plus font-semibold">{t('pageTitle')}</h1>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink"
          onClick={() => {
            void navigate(paths.tasks.edit(task.id));
          }}
          type="button"
        >
          <Pencil aria-hidden size={14} />
          {t('editTask')}
        </button>
      </div>

      <button
        className="-mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
        onClick={goBack}
        type="button"
      >
        <ArrowLeft aria-hidden size={14} />
        {t('back')}
      </button>

      <TaskViewHeader
        onOpenHistory={() => {
          setHistoryOpen(true);
        }}
        schedule={schedule}
        stats={stats}
        task={task}
        times={startedTargetTimes(seed)}
      />

      <div className="grid grid-cols-1 items-start gap-4 desktop:grid-cols-[minmax(0,29fr)_minmax(0,11fr)]" data-testid="task-view-columns">
        <div className="flex min-w-0 flex-col gap-4">
          <SubTasksProgressPanel
            onOpenHistory={() => {
              setHistoryOpen(true);
            }}
          />
          <TaskDetailsPanel project={project} task={task} />
          <TaskClassificationPanel task={task} />
          <RequesterInfoPanel daysElapsed={daysElapsedFor(seed)} ownerName={ownerNameFor(seed, TASK_VIEW_TEAM)} task={task} />
          <LocationZonePanel
            assetCategory={assetCategoryFor(task.department)}
            assetCode={assetCodeFor(seed)}
            task={task}
          />
          <ActivityHistoryPanel department={task.department} seed={seed} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <AssignmentInfoPanel />
          <DependenciesPanel
            highlighted={dependenciesHighlighted}
            onOpenChange={setDependenciesOpen}
            open={dependenciesOpen}
          />
          <ReferenceNumbersPanel />
          <LogNotesPanel />
          <SlaPerformancePanel />
          <AttachmentsPanel />
        </div>
      </div>

      <SubTaskHistoryDialog
        onClose={() => {
          setHistoryOpen(false);
        }}
        open={historyOpen}
      />

      <DependencyReminderDialog
        items={reminderItems}
        onClose={() => {
          setReminderOpen(false);
        }}
        onView={openDependencies}
        open={reminderOpen && reminderItems.length > 0}
      />
    </div>
  );
}
