import { renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import arAppraisal from '@/shared/i18n/locales/ar/appraisal.json';
import arChecklists from '@/shared/i18n/locales/ar/checklists.json';
import arCommon from '@/shared/i18n/locales/ar/common.json';
import arHr from '@/shared/i18n/locales/ar/hr.json';
import arHistory from '@/shared/i18n/locales/ar/history.json';
import arNav from '@/shared/i18n/locales/ar/nav.json';
import arNotifications from '@/shared/i18n/locales/ar/notifications.json';
import arOrganization from '@/shared/i18n/locales/ar/organization.json';
import arReports from '@/shared/i18n/locales/ar/reports.json';
import arSla from '@/shared/i18n/locales/ar/sla.json';
import arValidation from '@/shared/i18n/locales/ar/validation.json';
import arWorkflows from '@/shared/i18n/locales/ar/workflows.json';
import enAppraisal from '@/shared/i18n/locales/en/appraisal.json';
import enChecklists from '@/shared/i18n/locales/en/checklists.json';
import enCommon from '@/shared/i18n/locales/en/common.json';
import enHr from '@/shared/i18n/locales/en/hr.json';
import enHistory from '@/shared/i18n/locales/en/history.json';
import enNav from '@/shared/i18n/locales/en/nav.json';
import enNotifications from '@/shared/i18n/locales/en/notifications.json';
import enOrganization from '@/shared/i18n/locales/en/organization.json';
import enReports from '@/shared/i18n/locales/en/reports.json';
import enSla from '@/shared/i18n/locales/en/sla.json';
import enValidation from '@/shared/i18n/locales/en/validation.json';
import enWorkflows from '@/shared/i18n/locales/en/workflows.json';
import { getCalendarLabels } from '@/shared/i18n/calendar';
import {
  formatDate,
  formatDuration,
  formatKwd,
  formatProfileClock,
} from '@/shared/i18n/format';
import { i18n, initializeI18n } from '@/shared/i18n/i18n';
import { getLocalizedText, useLocalizedText } from '@/shared/i18n/localized';
import { directionForLocale, useDirection } from '@/shared/i18n/useDirection';

function leafKeys(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      leafKeys(item, `${prefix}.${String(index)}`),
    );
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      leafKeys(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [prefix];
}

beforeAll(async () => {
  await initializeI18n('en');
});

describe('i18n resources', () => {
  it.each([
    ['appraisal', enAppraisal, arAppraisal],
    ['checklists', enChecklists, arChecklists],
    ['common', enCommon, arCommon],
    ['hr', enHr, arHr],
    ['history', enHistory, arHistory],
    ['nav', enNav, arNav],
    ['notifications', enNotifications, arNotifications],
    ['organization', enOrganization, arOrganization],
    ['reports', enReports, arReports],
    ['sla', enSla, arSla],
    ['validation', enValidation, arValidation],
    ['workflows', enWorkflows, arWorkflows],
  ])('keeps en/ar %s keys in parity', (_namespace, english, arabic) => {
    expect(leafKeys(arabic).sort()).toEqual(leafKeys(english).sort());
  });

  it('retains the prototype calendar labels explicitly', () => {
    expect(getCalendarLabels('ar')).toEqual({
      months: [
        'يناير',
        'فبراير',
        'مارس',
        'أبريل',
        'مايو',
        'يونيو',
        'يوليو',
        'أغسطس',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر',
      ],
      weekdaysShort: ['أح', 'إن', 'ذل', 'رب', 'خم', 'جم', 'سب'],
    });
  });
});

describe('formatters', () => {
  it('formats KWD with exactly three decimal places', () => {
    expect(formatKwd(1234.5)).toBe('1,234.500 KWD');
  });

  it('uses Latin digits for Arabic output', () => {
    const formatted = `${formatKwd(1234.5, 'ar')} ${formatDate(
      Date.UTC(2026, 8, 25),
      'ar',
    )}`;

    expect(formatted).toMatch(/[0-9]/);
    expect(formatted).not.toMatch(/[٠-٩]/);
  });

  it('formats the profile clock in Asia/Bahrain', () => {
    expect(formatProfileClock(Date.UTC(2026, 0, 1, 21, 5, 6), 'en')).toBe(
      '00:05:06',
    );
  });

  it('formats the specified short durations', () => {
    expect(formatDuration(45, 'en')).toBe('45m');
    expect(formatDuration(90, 'en')).toBe('1.5h');
    expect(formatDuration(2_880, 'en')).toBe('2d');
  });
});

describe('localized content and direction', () => {
  const content = { ar: 'مرحبا', en: 'Hello' } as const;

  it('keeps bilingual domain content as data', () => {
    expect(getLocalizedText(content, 'ar')).toBe('مرحبا');
    expect(directionForLocale('ar')).toBe('rtl');
    expect(directionForLocale('en')).toBe('ltr');
  });

  it('updates localized hooks with the active i18next language', async () => {
    await i18n.changeLanguage('ar');
    const localized = renderHook(() => useLocalizedText());
    const direction = renderHook(() => useDirection());

    expect(localized.result.current(content)).toBe('مرحبا');
    expect(direction.result.current).toBe('rtl');

    localized.unmount();
    direction.unmount();
    await i18n.changeLanguage('en');
  });
});
