import { Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MasterTitle } from '../components/MasterTitle';

type MasterPendingPageProps = Readonly<{ title: string }>;

/**
 * Prototype-faithful pending page for every `MASTERS_WITH_PAGE` miss: the
 * shared `PageHeader` title treatment, then a folder icon, "Page not
 * available yet" and one sentence of body copy in a single centered card.
 * Distinct from the generic `PlaceholderPage` used for other screenless nav
 * leaves.
 * @prototype index.html:L4241-L4263 (`MasterPagePending`)
 */
export function MasterPendingPage({ title }: MasterPendingPageProps) {
  const { t } = useTranslation('masters');

  return (
    <main className="bg-canvas p-7 text-fg">
      <h1 className="display m-0 text-10xl leading-[1.1] font-medium tracking-tight">
        <MasterTitle title={title} />
      </h1>
      <div className="mt-7 flex flex-col items-center gap-3 rounded-dialog border border-line bg-surface px-7 py-14 text-center">
        <span className="flex size-13 items-center justify-center rounded-xl bg-accent-dim text-accent">
          <Folder aria-hidden="true" size={24} />
        </span>
        <h2 className="m-0 text-lg font-semibold text-fg">
          {t('pending.title')}
        </h2>
        <p className="m-0 max-w-[430px] text-sm-plus leading-[1.6] text-fg-3">
          {t('pending.description')}
        </p>
      </div>
    </main>
  );
}
