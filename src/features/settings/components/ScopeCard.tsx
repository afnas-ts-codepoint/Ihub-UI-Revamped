import { useTranslation } from 'react-i18next';

import { DASHBOARD_ROLES } from '../data/scopeTargets.data';
import { DASHBOARD_BUILDER_CURRENT_USER } from '../data/taskDashboardLibrary.data';
import { isMultiTargetScope } from '../domain/scopeKey';
import type { DashboardBuilderState } from '../hooks/useDashboardBuilder';
import type { ScopeKey } from '../types/dashboardConfig.types';
import { Avatar } from '@/shared/ui/avatar/Avatar';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon, type IconName } from '@/shared/ui/icon/Icon';
import { MultiSelectChips } from '@/shared/form/controls/MultiSelectChips';
import { Select } from '@/shared/form/controls/Select';

const SCOPE_ICONS: Record<ScopeKey, IconName> = {
  default: 'globe',
  dept: 'building',
  role: 'shield',
  user: 'user',
};

type ScopeCardProps = Readonly<{ builder: DashboardBuilderState; userNames: readonly string[] }>;

/**
 * Admin Configuration's scope selector (Default/Role/Department/User) —
 * or, in personal mode, the "My dashboard" card summarizing the admin's
 * reordering/hiding rules.
 * @prototype index.html:L7274-L7306
 */
export function ScopeCard({ builder, userNames }: ScopeCardProps) {
  const { t } = useTranslation('settings');

  if (builder.isUser) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-dialog border border-line bg-surface p-5">
        <Avatar name={DASHBOARD_BUILDER_CURRENT_USER} size={42} />
        <div className="min-w-0 flex-1">
          <div className="text-2xs font-semibold tracking-[.06em] text-fg-3 uppercase">
            {t('myDashboard.title')}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold">{DASHBOARD_BUILDER_CURRENT_USER}</span>
            {builder.isOwn ? (
              <Chip tone="accent">{t('myDashboard.personalLayout')}</Chip>
            ) : (
              <Chip tone="info">{t('myDashboard.usingOrgLayout')}</Chip>
            )}
            {builder.isDirty ? <Chip tone="warn">{t('scope.unsavedChanges')}</Chip> : null}
          </div>
          <p className="mt-0.5 text-sm text-fg-3">{t('myDashboard.helper')}</p>
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-2xs font-semibold tracking-[.06em] text-fg-3 uppercase">
            {t('myDashboard.setByAdmin')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Chip tone={builder.ruleDnd ? 'ok' : 'warn'}>
              {builder.ruleDnd ? t('myDashboard.reorderingAllowed') : t('myDashboard.reorderingOff')}
            </Chip>
            <Chip tone={builder.ruleHide ? 'ok' : 'warn'}>
              {builder.ruleHide ? t('myDashboard.hidingAllowed') : t('myDashboard.hidingOff')}
            </Chip>
            {builder.orgConfig.lock ? <Chip tone="info">{t('myDashboard.mandatoryLocked')}</Chip> : null}
          </div>
        </div>
      </div>
    );
  }

  const scopes: readonly [ScopeKey, string, string][] = [
    ['default', t('scope.default.title'), t('scope.default.desc')],
    ['role', t('scope.role.title'), t('scope.role.desc')],
    ['dept', t('scope.dept.title'), t('scope.dept.desc')],
    ['user', t('scope.user.title'), t('scope.user.desc')],
  ];

  const targetOptions =
    builder.scope === 'role'
      ? DASHBOARD_ROLES
      : builder.scope === 'dept'
        ? builder.departments
        : userNames;

  return (
    <div className="rounded-dialog border border-line bg-surface p-5">
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold tracking-[.06em] text-fg-3 uppercase">
          {t('scope.eyebrow')}
        </span>
        <span className="text-sm text-fg-3">{t('scope.sub')}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3" role="radiogroup">
        {scopes.map(([id, title, desc]) => {
          const active = builder.scope === id;
          return (
            <button
              aria-checked={active}
              className={`flex items-start gap-3 rounded-lg border p-3.5 text-start ${
                active ? 'border-accent bg-accent-dim' : 'border-line bg-canvas'
              }`}
              key={id}
              onClick={() => { builder.setScope(id); }}
              role="radio"
              type="button"
            >
              <span
                className={`flex size-8.5 shrink-0 items-center justify-center rounded-lg ${
                  active ? 'bg-canvas text-accent' : 'bg-inset text-fg-3'
                }`}
              >
                <Icon name={SCOPE_ICONS[id]} size={16} />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm-plus font-semibold ${active ? 'text-accent' : 'text-fg'}`}>
                  {title}
                </span>
                <span className="block text-xs text-fg-3">{desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3.5">
        {builder.scope === 'default' ? null : (
          <label className="flex w-full max-w-full flex-col gap-1.5 sm:w-[280px]">
            <span className="text-2xs font-semibold tracking-[.06em] text-fg-3 uppercase">
              {builder.scope === 'role'
                ? t('scope.roleLabel')
                : `${builder.scope === 'dept' ? t('scope.deptLabel') : t('scope.userLabel')} · ${t('scope.selectOneOrMore')}`}
            </span>
            {isMultiTargetScope(builder.scope) ? (
              <MultiSelectChips
                ariaLabel={builder.scope === 'dept' ? t('scope.deptLabel') : t('scope.userLabel')}
                onChange={(next) => {
                  builder.setTarget((state) => ({ ...state, [builder.scope]: next }));
                }}
                options={targetOptions.map((option) => ({ label: option, value: option }))}
                placeholder={builder.scope === 'dept' ? t('scope.addDepartment') : t('scope.addUser')}
                value={builder.target[builder.scope as 'dept' | 'user']}
              />
            ) : (
              <Select
                ariaLabel={t('scope.roleLabel')}
                onChange={(next) => { builder.setTarget((state) => ({ ...state, role: next })); }}
                options={targetOptions.map((option) => ({ label: option, value: option }))}
                value={builder.target.role}
              />
            )}
          </label>
        )}
        <div className="flex flex-wrap items-center gap-2 pb-1.5 text-sm text-fg-3">
          <Icon name="users" size={14} />
          <span>
            {t('scope.appliesTo')}
            {': '}
            <b className="font-semibold text-fg-2">{builder.appliedToText}</b>
          </span>
          {builder.scope === 'default' ? (
            <Chip tone="accent">{t('scope.baseLayoutForEveryone')}</Chip>
          ) : builder.noTarget ? (
            <Chip tone="warn">
              {builder.scope === 'dept' ? t('flash.chooseDepartment') : t('flash.chooseUser')}
            </Chip>
          ) : builder.isOwn ? (
            <Chip tone="accent">{t('scope.customLayout')}</Chip>
          ) : (
            <Chip tone="info">{t('scope.inheritsFromDefault')}</Chip>
          )}
          {builder.isDirty ? <Chip tone="warn">{t('scope.unsavedChanges')}</Chip> : null}
        </div>
      </div>
    </div>
  );
}
