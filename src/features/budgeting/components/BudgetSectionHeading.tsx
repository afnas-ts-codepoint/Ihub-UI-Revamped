type BudgetSectionHeadingProps = Readonly<{
  subtitle: string;
  title: string;
}>;

export function BudgetSectionHeading({
  subtitle,
  title,
}: BudgetSectionHeadingProps) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-3 max-tablet:flex-wrap max-tablet:items-start">
      <div className="min-w-0 max-tablet:flex-[1_1_220px]">
        <h2 className="m-0 text-lg font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        <p className="mt-0.5 mb-0 text-base text-fg-3">{subtitle}</p>
      </div>
    </div>
  );
}
