import { setLocale } from 'yup';
export function configureYupLocale(translate: (key: 'required') => string) {
  setLocale({ mixed: { required: () => translate('required') } });
}
