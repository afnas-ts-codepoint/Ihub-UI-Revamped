import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import { WorkCentreFallback } from '../components/WorkCentreFallback';
import {
  DEFAULT_WORK_CENTRE_SECTION,
  firstSectionForGroup,
  getWorkCentreSection,
  WORK_CENTRE_GROUPS,
  WORK_CENTRE_SECTIONS,
} from '../constants/work-centre.config';
import { paths } from '@/shared/config/paths';
import { MigrationPending } from '@/shared/ui/feedback/MigrationPending';

function renderTitle(title: string) {
  if (/[\u0600-\u06ff]/.test(title)) return title;
  const parts = title.trim().split(' ');
  if (parts.length < 2) return title;
  const last = parts.pop();
  return (
    <>
      {`${parts.join(' ')} `}
      <em className="accent-em">{last}</em>
    </>
  );
}

export function WorkCentrePage({ notFound = null }: Readonly<{ notFound?: ReactNode }>) {
  const { child, section } = useParams<{ child?: string; section?: string }>();
  const { t } = useTranslation('workCentre');
  const activeSection = getWorkCentreSection(section ?? DEFAULT_WORK_CENTRE_SECTION);

  if (!activeSection) return notFound;
  const allowsLegacyTaskChild = activeSection.id === 'tasks';
  if (
    child &&
    !allowsLegacyTaskChild &&
    !activeSection.children?.some((item) => item.id === child)
  ) {
    return notFound;
  }

  const group = activeSection.group;
  const title = t(activeSection.labelKey);
  const activeChild = child ?? activeSection.children?.[0]?.id;
  const destinationLabel = activeChild
    ? t(activeSection.children?.find((item) => item.id === activeChild)?.labelKey ?? activeSection.labelKey)
    : t(activeSection.labelKey);

  return (
    <section className="rise">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-[-0.025em]">
          {renderTitle(title)}
        </h1>
        {activeSection.id === 'checklists' ? (
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink"
            type="button"
          >
            <Plus aria-hidden size={15} />
            {t('actions.createChecklist')}
          </button>
        ) : null}
      </header>

      <nav aria-label={t('groups.ariaLabel')} className="mb-3.5 flex gap-1 overflow-x-auto border-b border-line">
        {WORK_CENTRE_GROUPS.map((item) => (
          <Link
            aria-current={group === item ? 'page' : undefined}
            className={`-mb-px shrink-0 border-b-2 px-3.5 pt-[13px] pb-3 text-md whitespace-nowrap ${group === item ? 'border-accent font-semibold text-fg' : 'border-transparent font-medium text-fg-3'}`}
            key={item}
            to={paths.home.workCentre(firstSectionForGroup(item))}
          >
            {t(`groups.${item}`)}
          </Link>
        ))}
      </nav>

      <nav aria-label={t('sections.ariaLabel')} className="mb-[18px] flex overflow-x-auto">
        <div className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-raised p-0.5">
          {WORK_CENTRE_SECTIONS.filter(
            (item) => item.group === group && item.visible !== false,
          ).map((item) => (
            <Link
              aria-current={activeSection.id === item.id ? 'page' : undefined}
              className={`rounded-md px-3 py-1.5 text-sm whitespace-nowrap ${activeSection.id === item.id ? 'bg-surface font-semibold text-accent shadow-sm' : 'font-medium text-fg-2'}`}
              key={item.id}
              to={paths.home.workCentre(item.id, item.children?.[0]?.id)}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>
      </nav>

      {activeSection.children ? (
        <nav aria-label={t('children.ariaLabel')} className="-mt-1.5 mb-[18px] flex flex-wrap items-center gap-1.5">
          {activeSection.children.map((item, index) => (
            <span className="contents" key={item.id}>
              {index > 0 ? <span className="text-line-strong">{'·'}</span> : null}
              <Link
                aria-current={activeChild === item.id ? 'page' : undefined}
                className={`px-1.5 py-1 text-sm whitespace-nowrap ${activeChild === item.id ? 'font-semibold text-accent underline decoration-accent underline-offset-4' : 'font-medium text-fg-3'}`}
                to={paths.home.workCentre(activeSection.id, item.id)}
              >
                {t(item.labelKey)}
              </Link>
            </span>
          ))}
        </nav>
      ) : null}

      {activeSection.renderer === 'fallback' ? (
        <WorkCentreFallback kind={activeSection.id === 'checklists' ? 'sheet' : 'enquiry'} />
      ) : (
        <MigrationPending area={destinationLabel} />
      )}
    </section>
  );
}
