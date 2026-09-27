import type { CSSProperties, ReactNode } from 'react';

type ProgressRingProps = Readonly<{
  color?: string;
  label?: ReactNode;
  size?: number;
  stroke?: number;
  value?: number;
}>;

type RingStyle = CSSProperties & {
  '--progress-ring-size': string;
};

/** @prototype index.html:L1817-L1871 circular display primitive. */
export function ProgressRing({
  color = 'var(--accent)',
  label,
  size = 72,
  stroke = 8,
  value = 0.6,
}: ProgressRingProps) {
  const boundedValue = Math.min(1, Math.max(0, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - boundedValue);
  const style: RingStyle = { '--progress-ring-size': `${String(size)}px` };

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(boundedValue * 100)}
      className="relative size-[var(--progress-ring-size)] shrink-0"
      role="progressbar"
      style={style}
    >
      <svg
        aria-hidden="true"
        className="-rotate-90"
        height={size}
        width={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
      </svg>
      {label ? (
        <div className="num absolute inset-0 flex items-center justify-center text-md font-semibold">
          {label}
        </div>
      ) : null}
    </div>
  );
}
