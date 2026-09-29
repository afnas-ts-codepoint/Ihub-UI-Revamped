import 'i18next';

import type appraisal from '@/shared/i18n/locales/en/appraisal.json';
import type budgeting from '@/shared/i18n/locales/en/budgeting.json';
import type checklists from '@/shared/i18n/locales/en/checklists.json';
import type common from '@/shared/i18n/locales/en/common.json';
import type enquiries from '@/shared/i18n/locales/en/enquiries.json';
import type home from '@/shared/i18n/locales/en/home.json';
import type incidents from '@/shared/i18n/locales/en/incidents.json';
import type hr from '@/shared/i18n/locales/en/hr.json';
import type history from '@/shared/i18n/locales/en/history.json';
import type masters from '@/shared/i18n/locales/en/masters.json';
import type nav from '@/shared/i18n/locales/en/nav.json';
import type notifications from '@/shared/i18n/locales/en/notifications.json';
import type observations from '@/shared/i18n/locales/en/observations.json';
import type snagLists from '@/shared/i18n/locales/en/snagLists.json';
import type organization from '@/shared/i18n/locales/en/organization.json';
import type purchasing from '@/shared/i18n/locales/en/purchasing.json';
import type reports from '@/shared/i18n/locales/en/reports.json';
import type settings from '@/shared/i18n/locales/en/settings.json';
import type sla from '@/shared/i18n/locales/en/sla.json';
import type taskCreate from '@/shared/i18n/locales/en/taskCreate.json';
import type tasks from '@/shared/i18n/locales/en/tasks.json';
import type taskView from '@/shared/i18n/locales/en/taskView.json';
import type validation from '@/shared/i18n/locales/en/validation.json';
import type workflows from '@/shared/i18n/locales/en/workflows.json';
import type workCentre from '@/shared/i18n/locales/en/workCentre.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      appraisal: typeof appraisal;
      budgeting: typeof budgeting;
      checklists: typeof checklists;
      common: typeof common;
      enquiries: typeof enquiries;
      home: typeof home;
      incidents: typeof incidents;
      hr: typeof hr;
      history: typeof history;
      masters: typeof masters;
      nav: typeof nav;
      notifications: typeof notifications;
      observations: typeof observations;
      snagLists: typeof snagLists;
      organization: typeof organization;
      purchasing: typeof purchasing;
      reports: typeof reports;
      settings: typeof settings;
      sla: typeof sla;
      taskCreate: typeof taskCreate;
      tasks: typeof tasks;
      taskView: typeof taskView;
      validation: typeof validation;
      workCentre: typeof workCentre;
      workflows: typeof workflows;
    };
  }
}
