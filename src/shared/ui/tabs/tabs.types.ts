export type TabItem = Readonly<{
  id: string;
  label: string;
  path: string;
}>;

export type TabsProps = Readonly<{
  activeId?: string;
  items: readonly TabItem[];
  onSelect: (item: TabItem) => void;
}>;
