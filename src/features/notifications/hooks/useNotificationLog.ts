import { notificationLog } from '../data/notification-log.mock';

export function useNotificationLog() {
  return {
    rows: notificationLog,
  } as const;
}
