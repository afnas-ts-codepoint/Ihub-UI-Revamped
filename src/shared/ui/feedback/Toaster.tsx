import { Toast as RadixToast } from 'radix-ui';
import { X } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

type ToastTone = 'ok' | 'bad';
type ToastMessage = Readonly<{ id: number; message: string; tone: ToastTone }>;

let currentToast: ToastMessage | null = null;
let nextToastId = 0;
const listeners = new Set<() => void>();

const emit = () => { listeners.forEach((listener) => { listener(); }); };
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function toast(message: string, tone: ToastTone = 'ok') {
  const id = ++nextToastId;
  currentToast = { id, message, tone };
  emit();
  window.setTimeout(() => {
    if (currentToast?.id === id) {
      currentToast = null;
      emit();
    }
  }, 2_600);
}

export function Toaster() {
  const { t } = useTranslation();
  const item = useSyncExternalStore(subscribe, () => currentToast, () => null);

  return (
    <RadixToast.Provider duration={2_600} swipeDirection="down">
      {item ? (
        <RadixToast.Root
          className={
            item.tone === 'ok'
              ? 'chip-tone-ok flex items-center gap-2 rounded-full border px-3 py-2 text-base font-semibold shadow-menu'
              : 'chip-tone-bad flex items-center gap-2 rounded-full border px-3 py-2 text-base font-semibold shadow-menu'
          }
          key={item.id}
          onOpenChange={(open) => {
            if (!open && currentToast?.id === item.id) {
              currentToast = null;
              emit();
            }
          }}
          open
        >
          <RadixToast.Description>{item.message}</RadixToast.Description>
          <RadixToast.Close aria-label={t('feedback.close')} className="text-fg-3">
            <X aria-hidden="true" size={12} />
          </RadixToast.Close>
        </RadixToast.Root>
      ) : null}
      <RadixToast.Viewport className="fixed inset-x-0 bottom-6 z-[700] mx-auto flex w-fit max-w-[calc(100%-32px)] flex-col items-center" />
    </RadixToast.Provider>
  );
}
