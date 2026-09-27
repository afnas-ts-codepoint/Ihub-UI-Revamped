import { Dialog as RadixDialog } from 'radix-ui';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

export type SettingsOption = Readonly<{ id: string; label: string }>;

export type SettingsTab = Readonly<{
  blurb: string;
  id: string;
  label: string;
  options: readonly SettingsOption[];
  /** Filter- and column-settings labels render uppercase; chip labels don't. */
  uppercase?: boolean;
}>;

/** `value[tabId][optionId]`; a missing entry means visible (matches the prototype's `!== false` convention). */
export type ColumnSettingsValue = Readonly<
  Record<string, Record<string, boolean>>
>;

type ColumnSettingsDialogProps = Readonly<{
  cancelLabel: string;
  closeLabel: string;
  deselectAllLabel: string;
  onOpenChange: (open: boolean) => void;
  onSave: (value: ColumnSettingsValue) => void;
  open: boolean;
  saveLabel: string;
  selectAllLabel: string;
  tabs: readonly SettingsTab[];
  title: string;
  value: ColumnSettingsValue;
}>;

const isOn = (draft: Record<string, boolean> | undefined, id: string) =>
  draft?.[id] !== false;

/**
 * Generic column/chip/filter-field visibility dialog, modeled on the
 * prototype's tabbed Settings modal: a tab strip, a Select All / Deselect All
 * pair, and a checkbox-card grid per tab, committed only on Save.
 * @prototype index.html:L4682-L4752
 */
export function ColumnSettingsDialog({
  cancelLabel,
  closeLabel,
  deselectAllLabel,
  onOpenChange,
  onSave,
  open,
  saveLabel,
  selectAllLabel,
  tabs,
  title,
  value,
}: ColumnSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const [draft, setDraft] = useState<Record<string, Record<string, boolean>>>(
    {},
  );
  // Re-seed the active tab and every tab's draft from the committed value
  // each time the dialog opens, mirroring the prototype's `openSettings()`
  // — done during render (React's "adjusting state when a prop changes"
  // pattern) rather than in an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setActiveTab(tabs[0]?.id);
      const next: Record<string, Record<string, boolean>> = {};
      for (const tab of tabs) {
        const tabDraft: Record<string, boolean> = {};
        for (const option of tab.options) {
          tabDraft[option.id] = isOn(value[tab.id], option.id);
        }
        next[tab.id] = tabDraft;
      }
      setDraft(next);
    }
  }

  const tab = tabs.find((candidate) => candidate.id === activeTab) ?? tabs[0];
  const tabDraft = tab ? (draft[tab.id] ?? {}) : {};

  const setOption = (optionId: string, on: boolean) => {
    if (!tab) return;
    setDraft((current) => ({
      ...current,
      [tab.id]: { ...current[tab.id], [optionId]: on },
    }));
  };

  const setAll = (on: boolean) => {
    if (!tab) return;
    const next: Record<string, boolean> = {};
    for (const option of tab.options) next[option.id] = on;
    setDraft((current) => ({ ...current, [tab.id]: next }));
  };

  return (
    <RadixDialog.Root onOpenChange={onOpenChange} open={open}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[400] bg-fg/50" />
        <RadixDialog.Content className="fixed start-1/2 top-1/2 z-[401] flex max-h-[86vh] w-[min(760px,calc(100%-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_80px_rgba(26,26,31,.4)] outline-none rtl:translate-x-1/2">
          <header className="flex items-center justify-between border-b border-line px-[22px] py-[18px]">
            <RadixDialog.Title className="text-2xs-plus font-semibold tracking-wider text-fg-3 uppercase">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close
              aria-label={closeLabel}
              className="flex size-[30px] items-center justify-center rounded-menu border border-line-strong bg-surface text-fg-3"
            >
              <X aria-hidden="true" size={14} />
            </RadixDialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto bg-canvas p-[22px]">
            <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-[22px]">
              <div className="flex flex-wrap items-center gap-7 border-b border-line">
                {tabs.map((candidate) => {
                  const selected = candidate.id === tab?.id;
                  return (
                    <button
                      className={cn(
                        'mb-2.5 rounded-lg px-4.5 py-2.5 text-sm-plus',
                        selected
                          ? 'text-white bg-accent font-bold'
                          : 'font-medium text-fg-2',
                      )}
                      key={candidate.id}
                      onClick={() => {
                        setActiveTab(candidate.id);
                      }}
                      type="button"
                    >
                      {candidate.label}
                    </button>
                  );
                })}
              </div>
              {tab ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm-plus text-fg-2">{tab.blurb}</span>
                    <div className="flex items-center gap-2.5 text-xs-plus">
                      <button
                        className="font-semibold text-interactive"
                        onClick={() => {
                          setAll(true);
                        }}
                        type="button"
                      >
                        {selectAllLabel}
                      </button>
                      <span aria-hidden="true" className="text-line-strong">
                        {'|'}
                      </span>
                      <button
                        className="font-semibold text-fg"
                        onClick={() => {
                          setAll(false);
                        }}
                        type="button"
                      >
                        {deselectAllLabel}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                    {tab.options.map((option) => {
                      const on = isOn(tabDraft, option.id);
                      return (
                        <label
                          className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-lg border p-3',
                            on
                              ? 'border-interactive-light bg-interactive-soft'
                              : 'border-line-strong bg-surface',
                          )}
                          key={option.id}
                        >
                          <input
                            checked={on}
                            className="sr-only"
                            onChange={() => {
                              setOption(option.id, !on);
                            }}
                            type="checkbox"
                          />
                          <span
                            className={cn(
                              'flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border',
                              on
                                ? 'text-white border-interactive bg-interactive'
                                : 'border-line-strong bg-surface',
                            )}
                          >
                            {on ? <Check aria-hidden="true" size={12} /> : null}
                          </span>
                          <span
                            className={
                              tab.uppercase
                                ? 'text-2xs-plus font-bold tracking-wide text-fg uppercase'
                                : 'text-sm-plus text-fg'
                            }
                          >
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <footer className="flex items-center justify-end gap-3 border-t border-line bg-inset px-[22px] py-3.5">
            <RadixDialog.Close className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-surface">
              {cancelLabel}
            </RadixDialog.Close>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink"
              onClick={() => {
                onSave(draft);
                onOpenChange(false);
              }}
              type="button"
            >
              <Check aria-hidden="true" size={13} />
              {saveLabel}
            </button>
          </footer>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
