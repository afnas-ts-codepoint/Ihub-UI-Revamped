import { Outlet, useLocation, useMatches } from 'react-router';
import { useTranslation } from 'react-i18next';

import { navTrailForPath } from '@/app/navigation/model';
import { NAV_TREE } from '@/app/navigation/nav.config';
import { reportHandleFromMatches } from '@/app/router/handles';
import { SectionReport } from '@/features/reports';
import { useSearchParamState } from '@/shared/hooks/useSearchParamState';

const sectionViews = ['section', 'report'] as const;

/** @prototype index.html:L1802-L1815 */
export function SectionLayout() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const { t: commonT } = useTranslation('common');
  const { t: navT } = useTranslation('nav');
  const [view, setView] = useSearchParamState(
    'view',
    sectionViews,
    'section',
  );
  const handle = reportHandleFromMatches(matches);
  const current = navTrailForPath(NAV_TREE, pathname).at(-1);
  const title = handle?.reportTitleKey
    ? navT(handle.reportTitleKey, { defaultValue: handle.reportTitleKey })
    : current
      ? navT(current.labelKey, { defaultValue: current.id })
      : commonT('section.fallbackTitle');

  return (
    <div>
      <div className="mb-4 flex">
        <div className="inline-flex flex-wrap gap-0.5 rounded-lg border border-line bg-inset p-0.5">
          {sectionViews.map((item) => {
            const active = view === item;
            return (
              <button
                aria-current={active ? 'page' : undefined}
                className="rounded-compact px-3 py-1.5 text-base font-medium whitespace-nowrap text-fg-3 data-[active=true]:bg-surface data-[active=true]:font-semibold data-[active=true]:text-fg data-[active=true]:shadow-segment"
                data-active={active}
                key={item}
                onClick={() => { setView(item); }}
                type="button"
              >
                {commonT(`section.${item}`)}
              </button>
            );
          })}
        </div>
      </div>
      {view === 'report' ? (
        <SectionReport reportKey={handle?.reportKey} title={title} />
      ) : (
        <div className="[&>main]:bg-transparent [&>main]:p-0 [&>main>header]:mb-7 [&>main>header>h1]:mt-0 [&>main>header>h1]:text-[34px] [&>main>header>h1]:font-medium [&>main>header>h1]:leading-[1.1] [&>main>header>h1]:tracking-[-0.025em] [&>main>header>p]:hidden [&>main>div]:mt-0">
          <Outlet />
        </div>
      )}
    </div>
  );
}
