import type { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '@/shared/ui/icon/Icon';

/** Prototype `.eyebrow`: uppercase, tracked-out caption. */
export const eyebrowClass =
  'text-sm font-medium tracking-[0.16em] text-fg-3 uppercase';

/**
 * Labelled section of the drawer body.
 * @prototype ihub/index.html:L13003 `Block`
 */
export function DrawerBlock({
  accent,
  children,
  icon,
  label,
}: PropsWithChildren<{ accent?: boolean; icon: IconName; label: string }>) {
  return (
    <section>
      <div
        className={cn(
          eyebrowClass,
          'mb-2.5 flex items-center gap-[7px]',
          accent && 'text-accent',
        )}
      >
        <Icon name={icon} size={13} />
        {label}
      </div>
      {children}
    </section>
  );
}

/**
 * Label and value cell of the two-column meta grid.
 * @prototype ihub/index.html:L13593 `MetaCell`
 */
export function MetaCell({
  label,
  mono,
  toneClass,
  value,
}: Readonly<{
  label: string;
  mono?: boolean;
  toneClass?: string;
  value: string;
}>) {
  return (
    <div>
      <div className={cn(eyebrowClass, 'mb-1 text-2xs')}>{label}</div>
      <div
        className={cn(
          'text-md font-medium text-fg',
          mono && 'num',
          toneClass,
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function MetaGrid({ children }: PropsWithChildren) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

/**
 * Numbered next steps; the first one is highlighted as the current step.
 * @prototype ihub/index.html:L13016 `Steps`
 */
export function DrawerSteps({ steps }: Readonly<{ steps: readonly string[] }>) {
  const { t } = useTranslation('homeWorkflow');
  return (
    <ol className="m-0 list-none p-0">
      {steps.map((step, index) => (
        <li className="flex items-start gap-3 py-2.5" key={step}>
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              index === 0
                ? 'bg-accent text-accent-ink'
                : 'border border-line bg-inset text-fg-3',
            )}
          >
            {index + 1}
          </span>
          <div className="pt-0.5">
            <div
              className={cn(
                'text-md',
                index === 0 ? 'font-semibold text-fg' : 'font-medium text-fg-2',
              )}
            >
              {step}
            </div>
            {index === 0 ? (
              <div className="mt-px text-sm text-accent">
                {t('drawer.currentStep')}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Uncontrolled note box. The prototype has no submit and no persistence.
 * @prototype ihub/index.html:L13043 `CommentBox`
 */
export function NoteBox() {
  const { t } = useTranslation('homeWorkflow');
  return (
    <textarea
      aria-label={t('drawer.blocks.note')}
      className="w-full resize-y rounded border border-line-strong bg-surface px-[13px] py-[11px] font-sans text-base-plus text-fg"
      placeholder={t('drawer.notePlaceholder')}
      rows={2}
    />
  );
}

export function DrawerScroll({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-[22px]">
      {children}
    </div>
  );
}

/**
 * @prototype ihub/index.html:L13073 `Footer`
 */
export function DrawerFooter({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <footer className="flex flex-wrap gap-2 border-t border-line bg-raised px-6 py-4">
      {children}
    </footer>
  );
}

export function FooterSpacer() {
  return <div className="flex-1" />;
}
