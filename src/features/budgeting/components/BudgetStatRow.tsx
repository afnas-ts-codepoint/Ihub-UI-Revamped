import { StatTile, type StatTileTone } from '@/shared/ui/stat/StatTile';

export type BudgetStat = Readonly<{
  label: string;
  sub?: string;
  tone?: StatTileTone;
  value: string;
}>;

export function BudgetStatRow({
  stats,
}: Readonly<{ stats: readonly BudgetStat[] }>) {
  return (
    <div className="mb-5 grid grid-cols-4 gap-3.5">
      {stats.map((stat) => (
        <StatTile
          key={stat.label}
          label={stat.label}
          sub={stat.sub}
          tone={stat.tone}
          value={stat.value}
        />
      ))}
    </div>
  );
}
