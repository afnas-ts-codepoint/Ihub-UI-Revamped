import { ArrowRight, Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AUTO_ROUTING_CATEGORIES } from '../data/workflows.mock';
import { Switch } from '@/shared/form/controls/Switch';
import { useLocalizedText } from '@/shared/i18n/localized';
import { Chip } from '@/shared/ui/chip/Chip';

export function AutoRouting() {
  const { t } = useTranslation('workflows');
  const localize = useLocalizedText();

  return (
    <div>
      <p className="mt-0 mb-[18px] max-w-[680px] text-md text-fg-3">{t('auto.description')}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {AUTO_ROUTING_CATEGORIES.map((category) => (
          <div className="rounded-xl border border-line bg-surface px-[18px] py-4" key={category.name.en}>
            <div className="mb-3 flex items-center justify-between gap-2.5">
              <div className="text-lg font-semibold text-fg">{localize(category.name)}</div>
              <Switch checked />
            </div>
            <div className="mb-3 flex items-center gap-2 text-base text-fg-2">
              <ArrowRight aria-hidden="true" className="text-accent rtl:rotate-180" size={14} />
              <span className="font-semibold text-fg">{category.owner}</span>
            </div>
            {category.labels.length ? (
              <div className="mb-3 flex flex-col gap-1.5">
                {category.labels.map((label) => (
                  <div className="flex items-center gap-2 text-sm-plus text-fg-3" key={label.label}>
                    <Chip className="border-transparent" tone="accent">{label.label}</Chip>
                    <ArrowRight aria-hidden="true" className="rtl:rotate-180" size={12} />
                    <span>{label.route}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex items-center gap-1.5 border-t border-line pt-2.5 text-sm-plus text-fg-3">
              <Clock3 aria-hidden="true" size={13} />
              <span>{t('auto.slaLine', { value: category.sla })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
