import { cn } from '@/shared/lib/cn';

export type HomeUnderlineTab<Id extends string> = Readonly<{
  /** Shown as a badge only above zero. */
  count?: number;
  id: Id;
  label: string;
}>;

type HomeUnderlineTabsProps<Id extends string> = Readonly<{
  active: Id;
  items: readonly HomeUnderlineTab<Id>[];
  onSelect: (id: Id) => void;
  testId?: string;
}>;

/**
 * The Home sub-tab strip (the prototype's `FilterChips` `underline` variant):
 * Assigned queues and Incident Reports / Live Incidents.
 * @prototype index.html:L12584-L12601 `FilterChips` (underline)
 */
export function HomeUnderlineTabs<Id extends string>({
  active,
  items,
  onSelect,
  testId,
}: HomeUnderlineTabsProps<Id>) {
  return (
    <div
      className="mb-[18px] flex gap-1 overflow-x-auto border-b border-line"
      data-testid={testId}
    >
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            aria-current={selected ? 'page' : undefined}
            className={cn(
              '-mb-px flex cursor-pointer items-center gap-2 border-b-2 bg-transparent px-3.5 pt-[13px] pb-3 text-md whitespace-nowrap',
              selected
                ? 'border-accent font-semibold text-fg'
                : 'border-transparent font-medium text-fg-3',
            )}
            key={item.id}
            onClick={() => {
              onSelect(item.id);
            }}
            type="button"
          >
            {item.label}
            {item.count != null && item.count > 0 ? (
              <span
                className={cn(
                  'num rounded-full px-[7px] py-px text-xs font-semibold',
                  selected ? 'bg-accent-dim text-accent' : 'bg-inset text-fg-3',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
