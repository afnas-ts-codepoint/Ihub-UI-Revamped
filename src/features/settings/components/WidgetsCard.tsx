import { useTranslation } from 'react-i18next';

import { filterWidgetsForDisplay, orderWidgetsForDisplay, widgetCategories } from '../domain/widgetOrdering';
import type { DashboardBuilderState } from '../hooks/useDashboardBuilder';
import { useLocalizedText } from '@/shared/i18n/localized';
import { Chip } from '@/shared/ui/chip/Chip';
import { Icon } from '@/shared/ui/icon/Icon';

type WidgetsCardProps = Readonly<{ builder: DashboardBuilderState }>;

const CATEGORY_KEYS: Record<string, string> = {
  All: 'widgets.categories.All',
  Charts: 'widgets.categories.Charts',
  Lists: 'widgets.categories.Lists',
  Metrics: 'widgets.categories.Metrics',
  Utilities: 'widgets.categories.Utilities',
};

/**
 * The widget catalogue: category pills, search, drag-reorder (native HTML5
 * DnD, no aria semantics/keyboard fallback — an intentional prototype
 * fidelity preservation), hide/show checkbox with the 3 block reasons, and
 * Select all / Clear.
 * @prototype index.html:L7336-L7364
 */
export function WidgetsCard({ builder }: WidgetsCardProps) {
  const { t } = useTranslation('settings');
  const localize = useLocalizedText();
  const tr = (translationKey: string) => t(translationKey, { defaultValue: translationKey });

  const ordered = orderWidgetsForDisplay(builder.currentConfig.ids, builder.availableWidgets);
  const shown = filterWidgetsForDisplay(ordered, { category: builder.category, query: builder.searchQuery });
  const categories = widgetCategories(builder.availableWidgets);
  const total = builder.isUser ? builder.availableIds.length : 15;

  return (
    <div className="rounded-dialog border border-line bg-surface p-5">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-semibold">{t('widgets.title', { dashboard: builder.dashboardName })}</h3>
          <p className="mt-0.5 mb-0 text-sm text-fg-3">
            {builder.isUser
              ? `${builder.ruleHide ? t('widgets.tickToShow') : t('widgets.hidingOff')} · ${
                  builder.ruleDnd ? t('widgets.dragToReorder') : t('widgets.orderSetByAdmin')
                }`
              : `${t('widgets.tickToShow')} · ${t('widgets.dragToReorder')}`}
          </p>
        </div>
        <Chip className="shrink-0 font-mono" tone="accent">
          {builder.currentConfig.ids.length}
          {' / '}
          {total}
        </Chip>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-lg border border-line-strong bg-canvas px-3 py-1">
        <Icon className="text-fg-4" name="search" size={14} />
        <input
          aria-label={t('widgets.searchPlaceholder')}
          className="w-full min-w-0 border-none bg-transparent py-2 text-sm outline-none"
          onChange={(event) => { builder.setSearchQuery(event.target.value); }}
          placeholder={t('widgets.searchPlaceholder')}
          value={builder.searchQuery}
        />
      </div>

      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const active = builder.category === cat;
          const count =
            cat === 'All'
              ? builder.availableWidgets.length
              : builder.availableWidgets.filter((widget) => widget.cat === cat).length;
          return (
            <button
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                active ? 'border-accent/30 bg-accent-dim text-accent' : 'border-line-strong bg-surface text-fg-2'
              }`}
              key={cat}
              onClick={() => { builder.setCategory(cat); }}
              type="button"
            >
              {tr(CATEGORY_KEYS[cat] ?? 'widgets.categories.All')}
              <span className="font-mono text-2xs">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="-mx-1 max-h-140 overflow-y-auto px-1">
        {shown.length ? (
          shown.map((widget) => {
            const isOn = builder.currentConfig.ids.includes(widget.id);
            const order = builder.currentConfig.ids.indexOf(widget.id) + 1;
            const locked =
              builder.lockedIds.includes(widget.id) || (builder.isUser && !builder.ruleHide && isOn);
            const draggable = isOn && builder.ruleDnd;

            return (
              <div
                className={`flex items-center gap-2.5 border-b border-line py-2.5 ${
                  builder.dragId === widget.id ? 'opacity-50' : ''
                } ${builder.overId === widget.id && builder.dragId !== widget.id ? 'border-t-2 border-t-accent' : ''}`}
                draggable={draggable}
                key={widget.id}
                onDragEnd={() => {
                  builder.setDragId(null);
                  builder.setOverId(null);
                }}
                onDragOver={(event) => {
                  if (builder.dragId && isOn) {
                    event.preventDefault();
                    if (builder.overId !== widget.id) builder.setOverId(widget.id);
                  }
                }}
                onDragStart={(event) => {
                  builder.setDragId(widget.id);
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', widget.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  builder.moveWidget(builder.dragId, widget.id);
                  builder.setDragId(null);
                  builder.setOverId(null);
                }}
              >
                <span
                  className={`flex w-3.5 shrink-0 ${draggable ? 'cursor-grab text-fg-4' : 'text-transparent'}`}
                  title={isOn ? t('widgets.dragToReorder') : ''}
                >
                  <Icon name="dots" size={14} />
                </span>
                <button
                  aria-checked={isOn}
                  aria-label={localize(widget.label)}
                  className={`flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border ${
                    isOn ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong bg-canvas'
                  } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => { builder.toggleWidget(widget.id); }}
                  role="checkbox"
                  type="button"
                >
                  {isOn ? <Icon name="check" size={12} /> : null}
                </button>
                <span
                  className={`flex size-7.5 shrink-0 items-center justify-center rounded-lg ${
                    isOn ? 'bg-accent-dim text-accent' : 'bg-inset text-fg-3'
                  }`}
                >
                  <Icon name={widget.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${isOn ? 'text-fg' : 'text-fg-2'}`}>
                    {isOn ? <span className="font-mono text-2xs text-accent">{order}</span> : null}
                    <span className="truncate">{localize(widget.label)}</span>
                    {locked ? <Icon className="shrink-0 text-fg-4" name="shield" size={12} /> : null}
                  </div>
                  <div className="truncate text-xs text-fg-3">{localize(widget.desc)}</div>
                </div>
                <Chip className="shrink-0 text-2xs">
                  {widget.size === 'full' ? t('widgets.full') : t('widgets.half')}
                </Chip>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-sm-plus text-fg-4">{t('widgets.noMatches')}</div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
          onClick={builder.selectAllWidgets}
          type="button"
        >
          {t('widgets.selectAll')}
        </button>
        {builder.isUser && !builder.ruleHide ? null : (
          <button
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:bg-inset"
            onClick={builder.clearWidgets}
            type="button"
          >
            {t('widgets.clear')}
          </button>
        )}
      </div>
    </div>
  );
}
