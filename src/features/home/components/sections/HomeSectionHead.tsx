import type { ReactNode } from 'react';

type HomeSectionHeadProps = Readonly<{
  right?: ReactNode;
  sub?: ReactNode;
  title: ReactNode;
}>;

/**
 * Section title with an optional subtitle and a right-hand slot. At the phone
 * width the slot drops under the title (the prototype's `.sec-head` rule).
 * @prototype index.html:L1346-L1380 `SectionHead`; L15-L22 mobile `.sec-head`
 */
export function HomeSectionHead({ right, sub, title }: HomeSectionHeadProps) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-3 max-tablet:flex-wrap max-tablet:items-start">
      <div className="min-w-0 max-tablet:flex-[1_1_220px]">
        <h2 className="m-0 text-xl font-semibold tracking-[-0.01em]">{title}</h2>
        {sub ? <p className="mt-[3px] mb-0 text-base text-fg-3">{sub}</p> : null}
      </div>
      {right}
    </div>
  );
}
