import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlaOverview } from '../components/SlaOverview';
import { WorkAreaMapping } from '../components/WorkAreaMapping';
import { useSlaLevels } from '../hooks/useSlaLevels';
import { useSlaMappings } from '../hooks/useSlaMappings';
import { useSlaPerformance } from '../hooks/useSlaPerformance';
import { cn } from '@/shared/lib/cn';

type Tab = 'mapping' | 'overview';
/** @prototype index.html:L21660-L22070; dead `clockCard` intentionally omitted by approved M3.8 reconciliation. */
export function SlaPage() {
  const { t } = useTranslation('sla');
  const [tab, setTab] = useState<Tab>('overview');
  const { levels } = useSlaLevels();
  const performance = useSlaPerformance();
  const mappings = useSlaMappings();
  return (
    <section className="flex flex-col gap-4 pb-10">
      <header>
        <h1 className="display m-0 text-[34px] leading-[1.1] font-medium tracking-[-0.025em]">
          {t('titleStart')} <em className="accent-em">{t('titleEmphasis')}</em>
        </h1>
        <p className="mt-2 mb-0 max-w-[640px] text-base leading-relaxed text-fg-2">
          {t('description')}
        </p>
      </header>
      <div
        className="flex gap-1 overflow-x-auto border-b border-line"
        role="tablist"
      >
        {(['overview', 'mapping'] as const).map((value) => (
          <button
            aria-selected={tab === value}
            className={cn(
              'mb-[-1px] border-b-2 px-3.5 py-2.5 text-base font-semibold whitespace-nowrap',
              tab === value
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-3',
            )}
            key={value}
            onClick={() => {
              setTab(value);
            }}
            role="tab"
            type="button"
          >
            {t(`tabs.${value}`)}
          </button>
        ))}
      </div>
      {tab === 'overview' ? (
        <SlaOverview {...performance} levels={levels} />
      ) : (
        <WorkAreaMapping
          mappings={mappings.mappings}
          onRemove={(id) => {
            mappings.remove(id);
          }}
          onSave={(id, values) => {
            mappings.save(id, values);
          }}
        />
      )}
    </section>
  );
}
