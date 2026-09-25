import { i18n, type Locale } from '@/shared/i18n/i18n';

const localeTags: Record<Locale, string> = {
  en: 'en-GB-u-nu-latn',
  ar: 'ar-KW-u-nu-latn',
};

function localeTag(locale: Locale) {
  return localeTags[locale];
}

export function formatKwd(value: number, locale: Locale = 'en') {
  const amount = new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
    numberingSystem: 'latn',
    useGrouping: true,
  }).format(value);

  return `${amount} KWD`;
}

export function formatDate(
  value: Date | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: '2-digit',
    month: 'short',
    numberingSystem: 'latn',
    year: 'numeric',
    ...options,
  }).format(value);
}

export function formatTime(
  value: Date | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
    ...options,
  }).format(value);
}

export function formatProfileClock(value: Date | number, locale: Locale) {
  return formatTime(value, locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Bahrain',
  });
}

export function formatDuration(totalMinutes: number, locale: Locale) {
  const absoluteMinutes = Math.max(0, Math.trunc(totalMinutes));
  let value = absoluteMinutes;
  let unitKey:
    'duration.dayShort' | 'duration.hourShort' | 'duration.minuteShort' =
    'duration.minuteShort';

  if (absoluteMinutes >= 1_440) {
    value = absoluteMinutes / 1_440;
    unitKey = 'duration.dayShort';
  } else if (absoluteMinutes >= 60) {
    value = absoluteMinutes / 60;
    unitKey = 'duration.hourShort';
  }

  const formattedValue = new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 1,
    numberingSystem: 'latn',
  }).format(value);

  const unit = i18n.getFixedT(locale, 'common')(unitKey);

  return `${formattedValue}${unit}`;
}
