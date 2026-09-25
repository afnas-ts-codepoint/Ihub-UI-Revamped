export type NavNode = Readonly<{
  id: string;
  labelKey: string;
  path: string;
  icon?:
    | 'activity'
    | 'clock'
    | 'coins'
    | 'dashboard'
    | 'grid'
    | 'layers'
    | 'settings'
    | 'shield'
    | 'star'
    | 'users';
  megaMenu?: boolean;
  badge?: string;
  topbar?: boolean;
  firstLeafRoute?: boolean;
  hideInTopNav?: boolean;
  routeBehavior?: 'migration-pending' | 'placeholder';
  children?: readonly NavNode[];
}>;
