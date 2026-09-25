import { notifications } from '../data/notifications.mock';

export function useNotifications() {
  return {
    data: notifications,
    error: null,
    isError: false,
    isPending: false,
  } as const;
}
