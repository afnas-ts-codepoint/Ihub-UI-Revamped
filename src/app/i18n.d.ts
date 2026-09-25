import 'i18next';

import type common from '@/shared/i18n/locales/en/common.json';
import type nav from '@/shared/i18n/locales/en/nav.json';
import type organization from '@/shared/i18n/locales/en/organization.json';
import type reports from '@/shared/i18n/locales/en/reports.json';
import type validation from '@/shared/i18n/locales/en/validation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      nav: typeof nav;
      organization: typeof organization;
      reports: typeof reports;
      validation: typeof validation;
    };
  }
}
