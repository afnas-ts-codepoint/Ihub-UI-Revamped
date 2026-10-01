export type FilterChipOption<Id extends string = string> = Readonly<{
  count?: number;
  id: Id;
  label: string;
}>;

type FilterChipsProps<Id extends string> = Readonly<{
  onChange: (id: Id) => void;
  options: readonly FilterChipOption<Id>[];
  value: Id;
}>;

/**
 * Single-select pill row (the prototype's `solid` variant — the only one the
 * Home approvals queue uses; the other variants have no consumer yet).
 * The count shows whenever it is defined, including 0.
 * @prototype ihub/index.html:L10459-L10557 `FilterChips` (solid)
 */
export function FilterChips<Id extends string>({
  onChange,
  options,
  value,
}: FilterChipsProps<Id>) {
  return (
    <div className="mb-[18px] flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            aria-pressed={active}
            className={`inline-flex cursor-pointer items-center gap-[7px] rounded-full border px-[13px] py-[7px] text-base font-medium ${
              active
                ? 'border-transparent bg-accent text-accent-ink'
                : 'border-line-strong bg-surface text-fg-2'
            }`}
            key={option.id}
            onClick={() => {
              onChange(option.id);
            }}
            type="button"
          >
            {option.label}
            {option.count != null ? (
              <span
                className={`num text-xs ${active ? 'opacity-85' : 'opacity-60'}`}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
