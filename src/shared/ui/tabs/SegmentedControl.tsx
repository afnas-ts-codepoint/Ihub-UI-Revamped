import type { TabsProps } from '@/shared/ui/tabs/tabs.types';

export function SegmentedControl({ activeId, items, onSelect }: TabsProps) {
  return (
    <div className="border-t border-line px-7 py-3">
      <div className="inline-flex flex-wrap gap-0.5 rounded-lg bg-inset p-0.5">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              aria-current={active ? 'page' : undefined}
              className="rounded-compact px-3 py-1.5 text-base font-medium whitespace-nowrap data-[active=true]:bg-surface data-[active=true]:font-semibold data-[active=true]:text-accent data-[active=true]:shadow-segment data-[active=false]:text-fg-2"
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
    </div>
  );
}
