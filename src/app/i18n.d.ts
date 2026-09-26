import 'i18next';

import type appraisal from '@/shared/i18n/locales/en/appraisal.json';
import type checklists from '@/shared/i18n/locales/en/checklists.json';
import type common from '@/shared/i18n/locales/en/common.json';
import type hr from '@/shared/i18n/locales/en/hr.json';
import type history from '@/shared/i18n/locales/en/history.json';
import type nav from '@/shared/i18n/locales/en/nav.json';
import type notifications from '@/shared/i18n/locales/en/notifications.json';
import type organization from '@/shared/i18n/locales/en/organization.json';
import type reports from '@/shared/i18n/locales/en/reports.json';
import type sla from '@/shared/i18n/locales/en/sla.json';
import type validation from '@/shared/i18n/locales/en/validation.json';
import type workflows from '@/shared/i18n/locales/en/workflows.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      appraisal: typeof appraisal;
      checklists: typeof checklists;
      common: typeof common;
      hr: typeof hr;
      history: typeof history;
      nav: typeof nav;
      notifications: typeof notifications;
      organization: typeof organization;
      reports: typeof reports;
      sla: typeof sla;
      validation: typeof validation;
      workflows: typeof workflows;
    };
  }
}
