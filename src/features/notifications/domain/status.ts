import type { NotificationLogStatus } from '../types/notification-log.types';

export type NotificationLogStatusKey = 'bounced' | 'delivered' | 'read';

/** @prototype index.html:L12056-L12091 */
export const notificationLogStatusKeys: Record<
  NotificationLogStatus,
  NotificationLogStatusKey
> = {
  Bounced: 'bounced',
  Delivered: 'delivered',
  Read: 'read',
};

/** @prototype index.html:L8271-L8281 STATUS_PILL */
export const notificationLogStatusTones: Record<
  NotificationLogStatus,
  'bad' | 'neutral' | 'ok'
> = {
  Bounced: 'bad',
  Delivered: 'ok',
  Read: 'neutral',
};
