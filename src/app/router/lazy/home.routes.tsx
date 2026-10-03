import { useParams } from 'react-router';

import { NotFoundPage } from '@/app/router/NotFoundPage';
import {
  ApprovalsPage,
  AssignedPage,
  HomeIncidentsPage,
  HomeTasksPage,
  isAssignedQueue,
  ReportsPage,
} from '@/features/home';

export function ApprovalsRoute() {
  return <ApprovalsPage />;
}

export function HomeTasksRoute() {
  return <HomeTasksPage />;
}

export function AssignedRoute() {
  const { queue } = useParams();
  return queue && isAssignedQueue(queue) ? (
    <AssignedPage queue={queue} />
  ) : (
    <NotFoundPage />
  );
}

export function IncidentReportsRoute() {
  return <HomeIncidentsPage activeTab="reports" />;
}

export function IncidentLiveRoute() {
  return <HomeIncidentsPage activeTab="live" />;
}

export function HomeReportsRoute() {
  return <ReportsPage />;
}
