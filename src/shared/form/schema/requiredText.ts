import { string } from 'yup';
export function requiredText() {
  return string().trim().required();
}
