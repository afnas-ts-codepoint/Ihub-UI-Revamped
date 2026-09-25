import type { NotificationItem } from '../notifications.types';

/** @prototype index.html:L3346-L3372 NotificationsBell */
export const notifications = [
  {
    id: 'budget-release-overdue',
    isUnread: true,
    subject: {
      ar: 'تجاوزت المدة — إفراج ميزانية فعالية العيد · 7س',
      en: 'Past due time — Budget Release, Eid Activation · 7h over',
    },
    time: { ar: 'قبل 12 د', en: '12m ago' },
    tone: 'bad',
    type: { ar: 'المدة', en: 'SLA' },
  },
  {
    id: 'crowd-safety-running-out',
    isUnread: true,
    subject: {
      ar: 'يقترب وقتها — ورقة إجراءات: خطة سلامة الحشود · 14 د متبقية',
      en: 'Running out of time — Action Sheet: Crowd Safety Plan · 14m left',
    },
    time: { ar: 'قبل 20 د', en: '20m ago' },
    tone: 'warn',
    type: { ar: 'المدة', en: 'SLA' },
  },
  {
    id: 'arcade-maintenance-overdue',
    isUnread: true,
    subject: {
      ar: 'تجاوزت المدة — أمر عمل 7768 صيانة الألعاب · 6.7س',
      en: 'Past due time — JO-7768 Arcade maintenance · 6.7h over',
    },
    time: { ar: 'قبل ساعة', en: '1h ago' },
    tone: 'bad',
    type: { ar: 'المدة', en: 'SLA' },
  },
  {
    id: 'marketing-budget-approval',
    isUnread: true,
    subject: {
      ar: 'مطلوب اعتماد — ميزانية التسويق',
      en: 'Approval needed — Q2 Marketing Budget',
    },
    time: { ar: '9:12 AM', en: '9:12 AM' },
    tone: 'accent',
    type: { ar: 'اعتماد', en: 'Approval' },
  },
  {
    id: 'operations-overtime',
    isUnread: true,
    subject: {
      ar: 'Overtime above budget — Operations',
      en: 'Overtime above budget — Operations',
    },
    time: { ar: '8:30 AM', en: '8:30 AM' },
    tone: 'warn',
    type: { ar: 'تنبيه', en: 'Alert' },
  },
  {
    id: 'tower-plaza-incident',
    isUnread: true,
    subject: {
      ar: 'حادث جديد — تاور بلازا',
      en: 'New incident logged — Tower Plaza',
    },
    time: { ar: 'أمس', en: 'Yesterday' },
    tone: 'bad',
    type: { ar: 'تنبيه', en: 'Alert' },
  },
  {
    id: 'sama-checklist-summary',
    isUnread: false,
    subject: {
      ar: 'Daily checklist summary — SAMA Mall',
      en: 'Daily checklist summary — SAMA Mall',
    },
    time: { ar: 'أمس', en: 'Yesterday' },
    tone: 'neutral',
    type: { ar: 'ملخص', en: 'Digest' },
  },
  {
    id: 'vendor-renewal-signoff',
    isUnread: false,
    subject: {
      ar: 'اعتماد الرئيس التنفيذي — تجديد المورّد',
      en: 'CEO sign-off — Cleaning vendor renewal',
    },
    time: { ar: 'Apr 27', en: 'Apr 27' },
    tone: 'neutral',
    type: { ar: 'اعتماد', en: 'Approval' },
  },
] as const satisfies readonly NotificationItem[];
