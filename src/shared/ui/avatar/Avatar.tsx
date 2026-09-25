type AvatarProps = Readonly<{
  accessibleName?: string;
  color?: string;
  name: string;
  size?: number;
}>;

/** @prototype index.html:L3402-L3428 Avatar */
export function Avatar({
  accessibleName,
  color,
  name,
  size = 32,
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hue =
    Array.from(name).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % 360;

  return (
    <div
      aria-label={accessibleName ?? name}
      className="flex shrink-0 items-center justify-center rounded-full font-ui font-semibold tracking-[-0.02em] text-accent-ink"
      role="img"
      style={{
        background: color ?? `oklch(0.50 0.10 ${String(hue)})`,
        fontSize: Math.round(size * 0.38),
        height: size,
        width: size,
      }}
      title={accessibleName ?? name}
    >
      {initials}
    </div>
  );
}
