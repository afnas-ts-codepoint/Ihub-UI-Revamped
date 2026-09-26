export type StatTileTone = 'bad' | 'neutral' | 'ok';

type StatTileProps = Readonly<{
  label: string;
  sub?: string;
  tone?: StatTileTone;
  value: string;
}>;

const valueToneClass: Record<StatTileTone, string> = {
  bad: 'text-bad',
  neutral: 'text-fg',
  ok: 'text-ok',
};

/** @prototype index.html:L8228-L8267 */
export function StatTile({ label, sub, tone = 'neutral', value }: StatTileProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-[18px]">
      <div className="mb-1.5 text-xs font-semibold tracking-wider text-fg-3 uppercase">
        {label}
      </div>
      <div className={`display num text-7xl font-medium ${valueToneClass[tone]}`}>
        {value}
      </div>
      {sub ? <div className="mt-1.5 text-xs text-fg-3">{sub}</div> : null}
    </div>
  );
}
