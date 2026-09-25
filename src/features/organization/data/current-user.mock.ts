import type { LocalizedText } from '@/shared/i18n/localized';

export type CurrentUser = Readonly<{
  id: string;
  name: LocalizedText;
}>;

/** @prototype index.html:L3397-L3399 local top-bar identity (D19). */
export const currentUser = {
  id: 'ahmad-al-osaimi',
  name: { ar: 'أحمد العصيمي', en: 'Ahmad Al Osaimi' },
} as const satisfies CurrentUser;
