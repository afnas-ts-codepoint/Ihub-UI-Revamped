import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { TextArea, type TextAreaProps } from '../controls/TextArea';
type Props<TValues extends FieldValues> = Omit<
  TextAreaProps,
  'defaultValue' | 'name' | 'value'
> & { control: Control<TValues>; name: FieldPath<TValues> };
export function RHFTextArea<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Props<TValues>) {
  const { field } = useController({ control, name });
  return (
    <TextArea
      {...props}
      {...field}
      value={typeof field.value === 'string' ? field.value : ''}
    />
  );
}
