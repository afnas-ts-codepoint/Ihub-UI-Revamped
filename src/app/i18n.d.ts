import 'i18next';

import type common from '@/shared/i18n/locales/en/common.json';
import type validation from '@/shared/i18n/locales/en/validation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      validation: typeof validation;
    };
  }
}
