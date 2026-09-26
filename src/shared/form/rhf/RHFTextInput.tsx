import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { TextInput, type TextInputProps } from '../controls/TextInput';
type Props<TValues extends FieldValues> = Omit<
  TextInputProps,
  'defaultValue' | 'name' | 'value'
> & { control: Control<TValues>; name: FieldPath<TValues> };
export function RHFTextInput<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Props<TValues>) {
  const { field } = useController({ control, name });
  return (
    <TextInput
      {...props}
      {...field}
      value={typeof field.value === 'string' ? field.value : ''}
    />
  );
}
