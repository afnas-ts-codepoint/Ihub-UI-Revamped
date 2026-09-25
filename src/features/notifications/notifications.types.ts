import type { LocalizedText } from '@/shared/i18n/localized';

export type NotificationTone = 'accent' | 'bad' | 'neutral' | 'warn';

export type NotificationItem = Readonly<{
  id: string;
  isUnread: boolean;
  subject: LocalizedText;
  time: LocalizedText;
  tone: NotificationTone;
  type: LocalizedText;
}>;
