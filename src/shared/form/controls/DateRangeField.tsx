import { useTranslation } from 'react-i18next';

import { DateField } from '@/shared/form/controls/DateField';
import { Field } from '@/shared/form/field/Field';

type DateRangeValue = Readonly<{ from: string; to: string }>;

type DateRangeFieldProps = Readonly<{
  onChange: (value: DateRangeValue) => void;
  value: DateRangeValue;
}>;

export function DateRangeField({ onChange, value }: DateRangeFieldProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
      <Field label={t('form.date.from')}>
        <DateField
          ariaLabel={t('form.date.from')}
          max={value.to || undefined}
          onChange={(from) => { onChange({ ...value, from }); }}
          value={value.from}
        />
      </Field>
      <Field label={t('form.date.to')}>
        <DateField
          ariaLabel={t('form.date.to')}
          min={value.from || undefined}
          onChange={(to) => { onChange({ ...value, to }); }}
          value={value.to}
        />
      </Field>
    </div>
  );
}
