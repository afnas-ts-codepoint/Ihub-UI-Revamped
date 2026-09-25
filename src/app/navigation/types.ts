export type NavNode = Readonly<{
  id: string;
  labelKey: string;
  path: string;
  icon?: 'grid' | 'layers';
  megaMenu?: boolean;
  firstLeafRoute?: boolean;
  hideInTopNav?: boolean;
  children?: readonly NavNode[];
}>;
