import { Icon } from '@/shared/ui/icon/Icon';
import type { TabsProps } from '@/shared/ui/tabs/tabs.types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function UnderlineTabs({ activeId, items, onSelect }: TabsProps) {
  const { t } = useTranslation('nav');
  const strip = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  useEffect(() => {
    const element = strip.current;
    if (!element) return;

    const update = () => {
      const logicalStart = Math.abs(element.scrollLeft);
      setCanBack(logicalStart > 1);
      setCanForward(
        logicalStart + element.clientWidth < element.scrollWidth - 1,
      );
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  const scroll = (distance: number) => {
    const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
    strip.current?.scrollBy({ behavior: 'smooth', left: distance * direction });
  };

  return (
    <div className="flex items-center gap-1.5 px-7">
      {canBack ? (
        <button
          aria-label={t('shell.scrollBack')}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-fg-2"
          onClick={() => {
            scroll(-220);
          }}
          type="button"
        >
          <Icon
            className="rotate-180 rtl:rotate-0"
            name="chevron-right"
            size={14}
          />
        </button>
      ) : null}
      <div
        className="flex min-w-0 flex-1 scrollbar-none gap-1 overflow-x-auto"
        ref={strip}
      >
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              aria-current={active ? 'page' : undefined}
              className="-mb-px shrink-0 border-b-2 px-3 py-3 text-md font-medium whitespace-nowrap data-[active=false]:border-transparent data-[active=false]:text-fg-3 data-[active=true]:border-accent data-[active=true]:font-semibold data-[active=true]:text-fg"
              data-active={active}
              key={item.id}
              onClick={() => {
                onSelect(item);
              }}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {canForward ? (
        <button
          aria-label={t('shell.scrollForward')}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-fg-2"
          onClick={() => {
            scroll(220);
          }}
          type="button"
        >
          <Icon className="rtl:rotate-180" name="chevron-right" size={14} />
        </button>
      ) : null}
    </div>
  );
}
