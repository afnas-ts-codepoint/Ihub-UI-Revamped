import { useTranslation } from 'react-i18next';

import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

import { actionButtonClass } from '../actions/actionButtonStyles';
import { ANNOUNCEMENTS } from '../../data/company.mock';
import { HomeSectionHead } from '../sections/HomeSectionHead';

/**
 * Announcement cards. "Read more" is inert, as in the prototype.
 * @prototype index.html:L14056-L14058 `CompanyNews`
 */
export function CompanyNews() {
  const { t } = useTranslation('home');

  return (
    <section>
      <HomeSectionHead
        sub={t('company.news.subtitle')}
        title={t('company.news.title')}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {ANNOUNCEMENTS.map((announcement) => (
          <article
            className="flex min-h-[180px] flex-col gap-3 rounded-lg border border-line bg-surface p-[22px] transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_2px_10px_rgba(20,20,30,0.05)]"
            key={announcement.title}
          >
            <div className="flex items-center gap-2">
              <Chip className="gap-1.5 px-[9px] py-[3px] text-sm font-medium" tone="info">
                {announcement.tag}
              </Chip>
              <span className="num text-xs text-fg-4">{announcement.time}</span>
            </div>
            <h3 className="display m-0 text-2xl-plus font-medium leading-[1.25] tracking-[-0.01em]">
              {announcement.title}
            </h3>
            <p className="m-0 text-base leading-[1.55] text-fg-2">{announcement.body}</p>
            {/* PROTOTYPE-NOOP(D2): "Read more" has no handler. */}
            <button
              className={`${actionButtonClass('ghost', 'sm')} mt-auto self-start !px-0`}
              type="button"
            >
              {t('company.news.readMore')}
              <Icon name="arrow-up-right" size={12} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
