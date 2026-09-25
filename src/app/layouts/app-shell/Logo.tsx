import ihubWordmark from '@/assets/images/ihub-wordmark.png';
import ihubWordmarkWhite from '@/assets/images/ihub-wordmark-white.png';
import logoColor from '@/assets/images/logo-color.png';
import logoWhite from '@/assets/images/logo-white.png';

type LogoProps = Readonly<{ compact?: boolean; size?: number }>;

export function Logo({ compact = false, size = 36 }: LogoProps) {
  return (
    <div
      className="brand-lockup flex shrink-0 items-center gap-3.5"
      data-testid="brand-lockup"
      style={{ height: size }}
    >
      {!compact ? (
        <>
          <img
            alt="Tamdeen Entertainment"
            className="brand-logo brand-logo-color h-full w-auto shrink-0"
            src={logoColor}
          />
          <img
            alt="Tamdeen Entertainment"
            className="brand-logo brand-logo-white h-full w-auto shrink-0"
            src={logoWhite}
          />
          <span
            aria-hidden="true"
            className="h-[62%] w-px bg-line-strong"
          />
        </>
      ) : null}
      <img
        alt="ihub"
        className="brand-logo brand-ihub-color h-[82%] w-auto shrink-0"
        src={ihubWordmark}
      />
      <img
        alt="ihub"
        className="brand-logo brand-ihub-white h-[82%] w-auto shrink-0"
        src={ihubWordmarkWhite}
      />
    </div>
  );
}
