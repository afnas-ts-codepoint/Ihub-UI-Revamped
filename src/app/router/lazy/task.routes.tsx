import { NotFoundPage } from '@/app/router/NotFoundPage';
import { EnquiriesPage } from '@/features/enquiries';
import { ObservationsPage } from '@/features/observations';
import { SnagListsPage } from '@/features/snag-lists';
import {
  CreateTaskPage,
  TaskEditPage,
  TasksPage,
  TaskViewPage,
} from '@/features/tasks';
import { WorkCentrePage } from '@/features/work-centre';

export function WorkCentreRoute() {
  return (
    <WorkCentrePage
      notFound={<NotFoundPage />}
      renderCreateTask={() => <CreateTaskPage />}
      renderEnquiries={(view) => <EnquiriesPage view={view} />}
      renderObservations={(view) => <ObservationsPage view={view} />}
      renderSnagLists={(view) => <SnagListsPage view={view} />}
      renderTasks={() => <TasksPage />}
    />
  );
}

export function TaskViewRoute() {
  return <TaskViewPage />;
}

export function TaskEditRoute() {
  return <TaskEditPage />;
}
