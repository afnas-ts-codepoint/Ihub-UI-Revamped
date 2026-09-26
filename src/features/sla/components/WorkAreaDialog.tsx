import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { array, mixed, object, string, type ObjectSchema } from 'yup';
import {
  dangerButton,
  primaryButton,
  priorityDotClass,
  secondaryButton,
} from './sla.styles';
import type {
  SlaPriorityId,
  WorkAreaFormValues,
  WorkAreaMapping,
} from '../types/sla.types';
import { Field } from '@/shared/form/field/Field';
import { RHFTextArea, RHFTextInput } from '@/shared/form/rhf';
import { requiredText } from '@/shared/form/schema/requiredText';
import { cn } from '@/shared/lib/cn';
import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/shared/ui/overlay/Dialog';

const priorities = ['P1', 'P2', 'P3', 'P4'] as const;
const schema: ObjectSchema<WorkAreaFormValues> = object({
  area: requiredText(),
  priorities: array()
    .of(mixed<SlaPriorityId>().oneOf(priorities).required())
    .defined(),
  response: string().defined(),
  resolution: string().defined(),
  conditional: string().defined(),
});

type Props = Readonly<{
  mapping: WorkAreaMapping | null;
  mode: 'add' | 'edit';
  onClose: () => void;
  onRemove: (id: string) => void;
  onSave: (id: string | null, values: WorkAreaFormValues) => void;
}>;
export function WorkAreaDialog({
  mapping,
  mode,
  onClose,
  onRemove,
  onSave,
}: Props) {
  const { t } = useTranslation('sla');
  const { control, handleSubmit, setFocus } = useForm<WorkAreaFormValues>({
    defaultValues: mapping
      ? {
          area: mapping.area,
          priorities: [...mapping.priorities],
          response: mapping.response,
          resolution: mapping.resolution,
          conditional: mapping.conditional,
        }
      : {
          area: '',
          priorities: ['P3'],
          response: '',
          resolution: '',
          conditional: '',
        },
    resolver: yupResolver(schema),
    shouldFocusError: false,
  });
  useEffect(() => {
    setFocus('area');
  }, [setFocus]);
  const submit = handleSubmit((values) => {
    onSave(mapping?.id ?? null, values);
    onClose();
  });
  return (
    <DialogRoot
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
    >
      <DialogContent
        className="w-[min(620px,calc(100%-48px))]"
        data-testid="work-area-dialog"
      >
        <DialogHeader className="items-start">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold tracking-wider text-fg-3 uppercase">
              {t('form.kicker')}
            </span>
            <DialogTitle className="mt-1 text-xl font-semibold tracking-tight">
              {mode === 'add' ? t('form.addTitle') : t('form.editTitle')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {mode === 'add' ? t('form.addTitle') : t('form.editTitle')}
            </DialogDescription>
          </div>
          <button className={secondaryButton} onClick={onClose} type="button">
            {t('actions.cancel')}
          </button>
        </DialogHeader>
        <form
          noValidate
          onSubmit={(event) => {
            void submit(event);
          }}
        >
          <DialogBody className="gap-4">
            <Field id="work-area" label={t('form.area')} required>
              <RHFTextInput
                control={control}
                id="work-area"
                name="area"
                placeholder={t('form.areaPlaceholder')}
              />
            </Field>
            <Field hint={t('form.priorityHint')} label={t('form.priority')}>
              <Controller
                control={control}
                name="priorities"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {priorities.map((priority) => {
                      const selected = field.value.includes(priority);
                      return (
                        <button
                          aria-pressed={selected}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-menu border px-3 py-2 text-base font-semibold',
                            selected
                              ? 'border-accent/50 bg-accent/10 text-accent'
                              : 'border-line-strong bg-inset text-fg-2',
                          )}
                          key={priority}
                          onClick={() => {
                            field.onChange(
                              selected
                                ? field.value.filter(
                                    (value) => value !== priority,
                                  )
                                : [...field.value, priority],
                            );
                          }}
                          type="button"
                        >
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              selected
                                ? priorityDotClass[priority]
                                : 'bg-line-strong',
                            )}
                          />
                          {t(`priorities.${priority}`)}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
              <Field id="work-response" label={t('form.response')}>
                <RHFTextInput
                  control={control}
                  id="work-response"
                  name="response"
                  placeholder={t('form.responsePlaceholder')}
                />
              </Field>
              <Field id="work-resolution" label={t('form.resolution')}>
                <RHFTextInput
                  control={control}
                  id="work-resolution"
                  name="resolution"
                  placeholder={t('form.resolutionPlaceholder')}
                />
              </Field>
            </div>
            <Field id="work-conditional" label={t('form.conditional')}>
              <RHFTextArea
                control={control}
                id="work-conditional"
                name="conditional"
                placeholder={t('form.conditionalPlaceholder')}
              />
            </Field>
          </DialogBody>
          <div className="flex flex-wrap gap-2 border-t border-line px-[22px] py-3.5">
            <button className={primaryButton} type="submit">
              {mode === 'add' ? t('actions.add') : t('actions.save')}
            </button>
            {mapping ? (
              <button
                className={cn(dangerButton, 'ms-auto')}
                onClick={() => {
                  onRemove(mapping.id);
                  onClose();
                }}
                type="button"
              >
                {t('actions.remove')}
              </button>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
