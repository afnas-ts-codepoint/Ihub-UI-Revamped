import 'i18next';

import type appraisal from '@/shared/i18n/locales/en/appraisal.json';
import type checklists from '@/shared/i18n/locales/en/checklists.json';
import type common from '@/shared/i18n/locales/en/common.json';
import type hr from '@/shared/i18n/locales/en/hr.json';
import type nav from '@/shared/i18n/locales/en/nav.json';
import type notifications from '@/shared/i18n/locales/en/notifications.json';
import type organization from '@/shared/i18n/locales/en/organization.json';
import type reports from '@/shared/i18n/locales/en/reports.json';
import type validation from '@/shared/i18n/locales/en/validation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      appraisal: typeof appraisal;
      checklists: typeof checklists;
      common: typeof common;
      hr: typeof hr;
      nav: typeof nav;
      notifications: typeof notifications;
      organization: typeof organization;
      reports: typeof reports;
      validation: typeof validation;
    };
  }
}
