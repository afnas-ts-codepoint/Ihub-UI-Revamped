import type { TabsProps } from '@/shared/ui/tabs/tabs.types';

export function LinkTabs({ activeId, items, onSelect }: TabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-7 py-2">
      {items.map((item, index) => {
        const active = activeId === item.id;
        return (
          <span className="contents" key={item.id}>
            {index > 0 ? (
              <span aria-hidden="true" className="text-line-strong">
                {'·'}
              </span>
            ) : null}
            <button
              aria-current={active ? 'page' : undefined}
              className="px-1.5 py-1 text-base font-medium whitespace-nowrap data-[active=true]:font-semibold data-[active=true]:text-accent data-[active=true]:underline data-[active=true]:decoration-accent data-[active=true]:underline-offset-4 data-[active=false]:text-fg-3"
              data-active={active}
              onClick={() => {
                onSelect(item);
              }}
              type="button"
            >
              {item.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
