import type { LocalizedText } from '@/shared/i18n/localized';
import type { IconName } from '@/shared/ui/icon/Icon';

export type WidgetSize = 'full' | 'half';

export type WidgetCategory = 'Metrics' | 'Charts' | 'Lists' | 'Utilities';

/** @prototype index.html:L16909-L16920 (`TASK_DASH_WIDGETS`), L7040-L7086 (other 4 dashboards) */
export type DashboardWidget = Readonly<{
  cat: WidgetCategory;
  desc: LocalizedText;
  icon: IconName;
  id: string;
  label: LocalizedText;
  size: WidgetSize;
  tall?: boolean;
}>;

export const DASHBOARD_IDS = [
  'tasks',
  'home',
  'finance',
  'actionSheet',
  'pettyCash',
] as const;

export type DashboardId = (typeof DASHBOARD_IDS)[number];

/** @prototype index.html:L7035-L7087 (`ADMIN_DASHBOARDS`) */
export type AdminDashboardDefinition = Readonly<{
  icon: IconName;
  id: DashboardId;
  label: LocalizedText;
  live: boolean;
  mandatory: readonly string[];
  where: LocalizedText;
  widgets: readonly DashboardWidget[];
}>;

export type ColumnCount = 1 | 2 | 3 | 4;

/** @prototype index.html:L7157 (`STD`) */
export type DashboardConfig = Readonly<{
  cols: ColumnCount;
  dnd: boolean;
  hide: boolean;
  ids: readonly string[];
  lock: boolean;
}>;

export const SCOPE_KEYS = ['default', 'role', 'dept', 'user'] as const;
export type ScopeKey = (typeof SCOPE_KEYS)[number];

export type BuilderMode = 'admin' | 'user';

export type ScopeTargetState = Readonly<{
  dept: readonly string[];
  role: string;
  user: readonly string[];
}>;

export type SavedConfigStatus = 'Active' | 'Draft';

/** @prototype index.html:L7177-L7182 (`SEED_LIB`) */
export type SavedConfigEntry = Readonly<{
  applied: string;
  by: string;
  cfg: DashboardConfig;
  date: string;
  fav: boolean;
  id: string;
  name: string;
  scopeKey?: string;
  status: SavedConfigStatus;
  uses: number;
}>;

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export type DashboardUser = Readonly<{ id: string; name: string }>;
