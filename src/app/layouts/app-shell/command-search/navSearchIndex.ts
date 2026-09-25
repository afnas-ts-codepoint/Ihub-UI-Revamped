import { NAV_TREE } from '@/app/navigation/nav.config';
import type { NavNode } from '@/app/navigation/types';
import { i18n } from '@/shared/i18n/i18n';

import { buildNavSearchIndex } from './navSearch';

function labelFor(node: NavNode, locale: 'en' | 'ar') {
  return i18n.getFixedT(locale, 'nav')(node.labelKey, {
    defaultValue: node.id,
  });
}

export function createNavSearchIndex() {
  return buildNavSearchIndex(NAV_TREE, (node) => ({
    ar: labelFor(node, 'ar'),
    en: labelFor(node, 'en'),
  }));
}
