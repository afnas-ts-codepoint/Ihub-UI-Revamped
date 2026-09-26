import type { NotificationLogEntry } from '../types/notification-log.types';

/** Literal decorative Unread tab count (`PROTOTYPE-NOOP(D2)`); never derived from `notificationLog`. */
export const NOTIFICATION_LOG_UNREAD_DISPLAY_COUNT = 3;

/** @prototype index.html:L12056-L12091 NotificationsScreen */
export const notificationLog: readonly NotificationLogEntry[] = [
  {
    email: 'ahmad.r@tamdeen.com',
    subject: 'Approval needed — Q2 Marketing Budget',
    status: 'Delivered',
    type: 'Approval',
    date: 'Apr 28, 9:12 AM',
  },
  {
    email: 'ahmad.r@tamdeen.com',
    subject: 'Overtime above budget — Operations',
    status: 'Delivered',
    type: 'Alert',
    date: 'Apr 28, 8:30 AM',
  },
  {
    email: 'ahmad.r@tamdeen.com',
    subject: 'Daily checklist summary — SAMA Mall',
    status: 'Read',
    type: 'Digest',
    date: 'Apr 28, 7:00 AM',
  },
  {
    email: 'ahmad.r@tamdeen.com',
    subject: 'CEO sign-off — Cleaning vendor renewal',
    status: 'Bounced',
    type: 'Approval',
    date: 'Apr 27, 4:14 PM',
  },
  {
    email: 'ahmad.r@tamdeen.com',
    subject: 'New incident logged — Tower Plaza',
    status: 'Delivered',
    type: 'Alert',
    date: 'Apr 27, 2:01 PM',
  },
] as const satisfies readonly NotificationLogEntry[];
