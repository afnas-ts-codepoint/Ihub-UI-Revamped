import { Icon, type IconName } from '@/shared/ui/icon/Icon';

type EmptyStateProps = Readonly<{
  description: string;
  icon?: IconName;
  title: string;
}>;

/** @prototype index.html:L13191-L13232 */
export function EmptyState({ description, icon = 'check', title }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 p-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-dialog bg-[color-mix(in_srgb,var(--ok)_16%,transparent)] text-ok">
        <Icon name={icon} size={22} />
      </div>
      <div className="display text-2xl font-medium">{title}</div>
      <div className="max-w-80 text-base text-fg-3">{description}</div>
    </div>
  );
}
