import {
  Activity,
  ChevronDown,
  ChevronRight,
  Clock3,
  Coins,
  Grid2X2,
  Layers3,
  LayoutDashboard,
  Menu,
  Settings,
  Shield,
  Star,
  Users,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

const icons = {
  activity: Activity,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  clock: Clock3,
  close: X,
  coins: Coins,
  dashboard: LayoutDashboard,
  grid: Grid2X2,
  layers: Layers3,
  menu: Menu,
  settings: Settings,
  shield: Shield,
  star: Star,
  users: Users,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

type IconProps = Omit<LucideProps, 'name'> & { name: IconName };

export function Icon({ name, ...props }: IconProps) {
  const Glyph = icons[name];
  return <Glyph aria-hidden="true" strokeWidth={1.6} {...props} />;
}
