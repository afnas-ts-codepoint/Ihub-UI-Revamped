export type NotificationLogStatus = 'Bounced' | 'Delivered' | 'Read';

export type NotificationLogEntry = Readonly<{
  date: string;
  email: string;
  status: NotificationLogStatus;
  subject: string;
  type: string;
}>;
