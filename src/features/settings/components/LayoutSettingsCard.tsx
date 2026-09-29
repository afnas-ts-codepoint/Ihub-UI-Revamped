import { useTranslation } from 'react-i18next';

import type { DashboardBuilderState } from '../hooks/useDashboardBuilder';
import type { ColumnCount } from '../types/dashboardConfig.types';
import { useLocalizedText } from '@/shared/i18n/localized';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

type LayoutSettingsCardProps = Readonly<{ builder: DashboardBuilderState }>;

type SwitchRowProps = Readonly<{
  ariaLabel: string;
  checked: boolean;
  onToggle: () => void;
}>;

function SwitchButton({ ariaLabel, checked, onToggle }: SwitchRowProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`flex h-6.5 w-11.5 shrink-0 items-center rounded-full border p-0.5 ${
        checked ? 'justify-end border-accent/40 bg-accent' : 'justify-start border-line-strong bg-inset'
      }`}
      onClick={onToggle}
      role="switch"
      type="button"
    >
      <span className={`block size-4.5 rounded-full ${checked ? 'bg-accent-ink' : 'bg-fg-4'}`} />
    </button>
  );
}

const COLUMN_OPTIONS: readonly [ColumnCount, string, string][] = [
  [1, 'layout.columns.one.title', 'layout.columns.one.desc'],
  [2, 'layout.columns.two.title', 'layout.columns.two.desc'],
  [3, 'layout.columns.three.title', 'layout.columns.three.desc'],
  [4, 'layout.columns.four.title', 'layout.columns.four.desc'],
];

/**
 * The column-count radiogroup plus, in admin mode, the drag/hide/lock
 * toggles; in personal mode, the same 3 rows become read-only reflections
 * of the admin's rules.
 * @prototype index.html:L7369-L7396
 */
export function LayoutSettingsCard({ builder }: LayoutSettingsCardProps) {
  const { t } = useTranslation('settings');
  const localize = useLocalizedText();
  /** Column titles/descriptions are looked up by a runtime-built key. */
  const tr = (translationKey: string) => t(translationKey, { defaultValue: translationKey });

  const mandatoryNames = builder.mandatoryIds
    .map((id) => builder.widgets.find((widget) => widget.id === id))
    .filter((widget): widget is NonNullable<typeof widget> => Boolean(widget))
    .map((widget) => localize(widget.label))
    .join(t('layout.widgetNameJoiner'));

  return (
    <div className="rounded-dialog border border-line bg-surface p-5">
      <h3 className="m-0 mb-3.5 text-base font-semibold">{t('layout.title')}</h3>

      <div className="border-b border-line pb-3.5">
        <div className="mb-2.5 text-sm font-semibold">{t('layout.columnsQuestion')}</div>
        <div
          aria-label={t('layout.columnsAriaLabel')}
          className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5"
          role="radiogroup"
        >
          {COLUMN_OPTIONS.map(([value, titleKey, descKey]) => {
            const active = builder.currentConfig.cols === value;
            return (
              <button
                aria-checked={active}
                className={`flex flex-col gap-2.5 rounded-lg border p-3 text-start ${
                  active ? 'border-accent bg-accent-dim' : 'border-line-strong bg-canvas'
                }`}
                key={value}
                onClick={() => { builder.setColumns(value); }}
                role="radio"
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="grid gap-1 rounded-md p-1"
                  style={{ gridTemplateColumns: `repeat(${String(value)}, 1fr)` }}
                >
                  {Array.from({ length: value }, (_unused, index) => (
                    <span className={`h-6 rounded ${active ? 'bg-accent' : 'bg-line-strong'}`} key={index} />
                  ))}
                </span>
                <span>
                  <span className={`block text-sm font-semibold ${active ? 'text-accent' : 'text-fg'}`}>
                    {tr(titleKey)}
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-3">{tr(descKey)}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 mb-0 text-sm text-fg-3">{t('layout.columnsHelper')}</p>
      </div>

      {builder.isUser ? (
        <>
          <SettingsRow
            control={
              <Chip tone={builder.ruleDnd ? 'ok' : 'warn'}>
                {builder.ruleDnd ? t('layout.allowed') : t('layout.notAllowed')}
              </Chip>
            }
            subtitle={t('layout.reorderRow.sub')}
            title={t('layout.reorderRow.title')}
          />
          <SettingsRow
            control={
              <Chip tone={builder.ruleHide ? 'ok' : 'warn'}>
                {builder.ruleHide ? t('layout.allowed') : t('layout.notAllowed')}
              </Chip>
            }
            subtitle={t('layout.hideRow.sub')}
            title={t('layout.hideRow.title')}
          />
          <SettingsRow
            control={
              <Chip tone={builder.orgConfig.lock ? 'info' : 'neutral'}>
                {builder.orgConfig.lock ? t('layout.alwaysShown') : t('layout.optional')}
              </Chip>
            }
            subtitle={mandatoryNames}
            title={t('layout.mandatoryRow.title')}
          />
        </>
      ) : (
        <>
          <SettingsRow
            control={
              <SwitchButton
                ariaLabel={t('layout.allowDnd.title')}
                checked={builder.currentConfig.dnd}
                onToggle={builder.toggleDnd}
              />
            }
            subtitle={t('layout.allowDnd.sub')}
            title={t('layout.allowDnd.title')}
          />
          <SettingsRow
            control={
              <SwitchButton
                ariaLabel={t('layout.allowHide.title')}
                checked={builder.currentConfig.hide}
                onToggle={builder.toggleHide}
              />
            }
            subtitle={t('layout.allowHide.sub')}
            title={t('layout.allowHide.title')}
          />
          <SettingsRow
            control={
              <SwitchButton
                ariaLabel={t('layout.lockMandatory.title')}
                checked={builder.currentConfig.lock}
                onToggle={builder.toggleLockMandatory}
              />
            }
            subtitle={`${mandatoryNames}${t('layout.lockMandatory.alwaysShownSuffix')}`}
            title={t('layout.lockMandatory.title')}
          />
        </>
      )}

      <div className="mt-3.5 flex items-start gap-2.5 rounded-lg border border-info/20 bg-info/5 p-3.5 text-sm text-fg-2">
        <Icon className="mt-0.5 shrink-0 text-info" name="help" size={16} />
        <span>{builder.isUser ? t('layout.helperPersonal') : t('layout.helperAdmin')}</span>
      </div>
    </div>
  );
}

function SettingsRow({
  control,
  subtitle,
  title,
}: Readonly<{ control: React.ReactNode; subtitle: string; title: string }>) {
  return (
    <div className="flex items-center gap-3 border-b border-line py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-fg-3">{subtitle}</div>
      </div>
      {control}
    </div>
  );
}
