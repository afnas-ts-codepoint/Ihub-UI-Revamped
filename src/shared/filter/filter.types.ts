export type AppliedFilter = Readonly<{
  id: string;
  label: string;
  onRemove: () => void;
  value: string;
}>;
