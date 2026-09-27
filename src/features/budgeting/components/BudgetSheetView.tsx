import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadText } from '@/shared/file/download';

import { activityMaster, budgetSheetCategories } from '../data/home-budgeting.mock';
import { BUDGET_SHEET_FILENAME, BUDGET_SHEET_MIME, sheetForecast, sheetTotals, usedPercent } from '../domain/homeBudgeting';
import { BudgetSectionHeading } from './BudgetSectionHeading';
import { budgetButtonStyles } from './budgetButtonStyles';

type SheetSub = { budget: number; code: string; committed: number; forecast: number; key: string; name: string };
type SheetActivity = { code: string; key: string; name: string; nameAr: string; open: boolean; subs: SheetSub[] };
type SheetCategory = { activities: SheetActivity[]; hidden: boolean; key: string; name: string; nameAr: string; open: boolean };
type EditColumn = 'budget' | 'committed' | 'forecast' | 'name';
type Selection = Readonly<{ column: EditColumn; key: string }>;

const buildSheet = (): SheetCategory[] => budgetSheetCategories.map((category) => ({
  activities: activityMaster.filter((activity) => category.activityCodes.includes(activity.code as never)).map((activity) => ({
    code: activity.code, key: activity.code, name: activity.name, nameAr: activity.nameAr, open: true,
    subs: activity.subs.map((sub) => ({ budget: sub.alloc, code: sub.code, committed: sub.committed, forecast: sheetForecast(sub.committed), key: `${activity.code}/${sub.code}`, name: sub.name })),
  })),
  hidden: false, key: category.key, name: category.name, nameAr: category.nameAr, open: true,
}));

const money = (value: number) => Math.round(value).toLocaleString('en-US');

export function BudgetSheetView() {
  const { i18n, t } = useTranslation('budgeting');
  const isArabic = i18n.resolvedLanguage === 'ar';
  const [categories, setCategories] = useState(buildSheet);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [edit, setEdit] = useState<Selection | null>(null);
  const live = categories.filter((category) => !category.hidden);
  const hidden = categories.filter((category) => category.hidden);
  const flat = useMemo(() => live.flatMap((category) => category.open ? category.activities.flatMap((activity) => activity.open ? activity.subs : []) : []), [live]);
  const grand = sheetTotals(flat);

  const patchSub = (key: string, column: EditColumn, value: string) => {
    setCategories((current) => current.map((category) => ({ ...category, activities: category.activities.map((activity) => ({
      ...activity,
      subs: activity.subs.map((sub) => sub.key === key ? { ...sub, [column]: column === 'name' ? value : Number.parseFloat(value.replaceAll(',', '')) || 0 } : sub),
    })) })));
  };
  const totalsFor = (activities: readonly SheetActivity[]) => sheetTotals(activities.flatMap((activity) => activity.subs));
  const setAllOpen = (open: boolean) => { setCategories((current) => current.map((category) => ({ ...category, open, activities: category.activities.map((activity) => ({ ...activity, open })) }))); };
  const toggleCategory = (key: string) => { setCategories((current) => current.map((category) => category.key === key ? { ...category, open: !category.open } : category)); };
  const toggleActivity = (key: string) => { setCategories((current) => current.map((category) => ({ ...category, activities: category.activities.map((activity) => activity.key === key ? { ...activity, open: !activity.open } : activity) }))); };
  const hideCategory = (key: string) => { setCategories((current) => current.map((category) => category.key === key ? { ...category, hidden: !category.hidden } : category)); };
  const deleteSub = (key: string) => { setCategories((current) => current.map((category) => ({ ...category, activities: category.activities.map((activity) => ({ ...activity, subs: activity.subs.filter((sub) => sub.key !== key) })) }))); };
  const addSub = (activityKey: string) => { setCategories((current) => current.map((category) => ({ ...category, activities: category.activities.map((activity) => activity.key === activityKey ? { ...activity, open: true, subs: [...activity.subs, { budget: 0, code: '—', committed: 0, forecast: 0, key: `${activityKey}/new-${String(activity.subs.length + 1)}`, name: t('home.sheet.newLine') }] } : activity) }))); };

  const exportCsv = () => {
    const rows = live.flatMap((category) => category.activities.flatMap((activity) => activity.subs.map((sub) => [
      category.name, activity.name, sub.name, sub.budget, sub.committed, sub.forecast,
      sub.budget - sub.committed, sub.budget - sub.forecast, `${String(sub.budget ? Math.round((sub.committed / sub.budget) * 100) : 0)}%`,
    ])));
    const csv = [['Category', 'Activity', 'Sub-activity', 'Budget', 'Committed', 'Forecast', 'Available', 'Variance', 'Used %'], ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    downloadText(csv, BUDGET_SHEET_FILENAME, BUDGET_SHEET_MIME, 0);
  };

  const editableCell = (sub: SheetSub, column: EditColumn, alignEnd = false) => {
    const active = selection?.key === sub.key && selection.column === column;
    const editing = edit?.key === sub.key && edit.column === column;
    return (
      <td
        className={`border-e border-b border-line px-[11px] py-[7px] ${alignEnd ? 'num text-end' : ''} ${active ? 'shadow-[inset_0_0_0_2px_var(--accent)]' : ''}`}
        key={column}
        onClick={() => { setSelection({ column, key: sub.key }); }}
        onDoubleClick={() => { setEdit({ column, key: sub.key }); }}
      >
        {editing ? (
          <input
            className="w-full border-0 bg-surface px-0 py-0 text-inherit outline-none"
            defaultValue={column === 'name' ? sub.name : String(sub[column])}
            onBlur={(event) => { patchSub(sub.key, column, event.currentTarget.value); setEdit(null); }}
            onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setEdit(null); }}
          />
        ) : column === 'name' ? sub.name : money(sub[column])}
      </td>
    );
  };

  return (
    <>
      <BudgetSectionHeading subtitle={t('home.sheet.subtitle')} title={t('home.sheet.title')} />
      <div className="my-3.5 flex flex-wrap items-center gap-2">
        <button className={budgetButtonStyles.ghost} onClick={() => { setAllOpen(true); }} type="button">{t('home.sheet.expandAll')}</button>
        <button className={budgetButtonStyles.ghost} onClick={() => { setAllOpen(false); }} type="button">{t('home.sheet.collapseAll')}</button>
        <button className={budgetButtonStyles.ghost} onClick={() => { setCategories(buildSheet()); setSelection(null); setEdit(null); }} type="button">{t('home.sheet.reset')}</button>
        <button className={budgetButtonStyles.ghost} onClick={exportCsv} type="button">{t('home.sheet.export')}</button>
        <span className="ms-auto text-sm text-fg-3">{t('home.sheet.categoriesShown', { count: live.length })}{hidden.length ? ` · ${t('home.sheet.hiddenCount', { count: hidden.length })}` : ''}</span>
      </div>
      {hidden.length ? <div className="mb-3.5 flex flex-wrap items-center gap-2 text-sm text-fg-3"><span>{`${t('home.sheet.hidden')}:`}</span>{hidden.map((category) => <button className="chip cursor-pointer border border-dashed border-line-strong bg-transparent" key={category.key} onClick={() => { hideCategory(category.key); }} type="button">{`${isArabic ? category.nameAr : category.name} ↩`}</button>)}</div> : null}
      <div className="max-h-[68vh] overflow-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[860px] border-collapse">
          <thead><tr className="sticky top-0 z-[2] bg-inset text-xs font-semibold tracking-[0.06em] text-fg-3 uppercase">
            {([
              ['code', 'home.sheet.columns.code'], ['category', 'home.sheet.columns.category'],
              ['budget', 'home.sheet.columns.budget'], ['committed', 'home.sheet.columns.committed'],
              ['forecast', 'home.sheet.columns.forecast'], ['available', 'home.sheet.columns.available'],
              ['variance', 'home.sheet.columns.variance'], ['used', 'home.sheet.columns.used'],
            ] as const).map(([key, labelKey]) => <th className={`border-e border-b border-line px-[11px] py-[7px] ${key === 'code' || key === 'category' ? 'text-start' : 'text-end'}`} key={key}>{t(labelKey)}</th>)}
          </tr></thead>
          <tbody>
            {live.map((category) => {
              const categoryTotals = totalsFor(category.activities);
              return [
                <tr className="cursor-pointer bg-inset font-bold" key={category.key} onClick={() => { toggleCategory(category.key); }}>
                  <td className="border-b border-line px-[11px] py-[7px]" colSpan={2}>
                    <span className="flex items-center gap-2"><span className={`text-xs transition-transform ${category.open ? 'rotate-90' : ''}`}>{'▶'}</span>{isArabic ? category.nameAr : category.name}<span className="text-xs font-medium text-fg-3">{t('home.sheet.activityCount', { count: category.activities.length })}</span><span className="ms-auto flex gap-1"><button className="px-1 text-xs font-medium text-fg-3" onClick={(event) => { event.stopPropagation(); hideCategory(category.key); }} type="button">{t('home.sheet.hide')}</button><button className="px-1 text-xs font-medium text-bad" onClick={(event) => { event.stopPropagation(); setCategories((current) => current.filter((item) => item.key !== category.key)); }} type="button">{'×'}</button></span></span>
                  </td>
                  {summaryCells(categoryTotals, money)}
                </tr>,
                ...(category.open ? category.activities.flatMap((activity) => {
                  const activityTotals = sheetTotals(activity.subs);
                  return [
                    <tr className="cursor-pointer font-semibold" key={activity.key} onClick={() => { toggleActivity(activity.key); }}>
                      <td className="border-b border-line px-[11px] py-[7px]" colSpan={2}><span className="flex items-center gap-2 ps-5"><span className={`text-xs transition-transform ${activity.open ? 'rotate-90' : ''}`}>{'▶'}</span><span className="num text-xs text-fg-3">{activity.code}</span>{isArabic ? activity.nameAr : activity.name}<button className="ms-auto px-1 text-xs text-fg-3" onClick={(event) => { event.stopPropagation(); addSub(activity.key); }} type="button">{`+ ${t('home.sheet.line')}`}</button></span></td>
                      {summaryCells(activityTotals, money)}
                    </tr>,
                    ...(activity.open ? activity.subs.map((sub) => {
                      const available = sub.budget - sub.committed;
                      const variance = sub.budget - sub.forecast;
                      const used = sub.budget ? Math.round((sub.committed / sub.budget) * 100) : 0;
                      return <tr key={sub.key}><td className="border-e border-b border-line px-1.5 py-[7px]"><span className="flex items-center gap-1.5 ps-7"><span className="num text-xs text-fg-3">{sub.code}</span><button className="ms-auto text-bad" onClick={() => { deleteSub(sub.key); }} type="button">{'×'}</button></span></td>{editableCell(sub, 'name')}{editableCell(sub, 'budget', true)}{editableCell(sub, 'committed', true)}{editableCell(sub, 'forecast', true)}<td className="num border-e border-b border-line px-[11px] py-[7px] text-end">{money(available)}</td><td className={`num border-e border-b border-line px-[11px] py-[7px] text-end ${variance < 0 ? 'text-bad' : 'text-fg-2'}`}>{money(variance)}</td><td className={`num border-b border-line px-[11px] py-[7px] text-end ${used > 100 ? 'text-bad' : used > 85 ? 'text-warn' : 'text-fg-2'}`}>{`${String(used)}%`}</td></tr>;
                    }) : []),
                  ];
                }) : []),
              ];
            })}
          </tbody>
          <tfoot><tr className="sticky bottom-0 bg-inset font-bold"><td className="border-t-2 border-line-strong px-[11px] py-[7px]" /><td className="border-t-2 border-line-strong px-[11px] py-[7px]">{t('home.sheet.grandTotal')}</td>{summaryCells(grand, money, true)}</tr></tfoot>
        </table>
      </div>
      <p className="mt-2.5 text-xs text-fg-3">{t('home.sheet.formulaNote')}</p>
    </>
  );
}

function summaryCells(totals: Readonly<{ budget: number; committed: number; forecast: number }>, format: (value: number) => string, top = false) {
  const available = totals.budget - totals.committed;
  const variance = totals.budget - totals.forecast;
  const border = top ? 'border-t-2 border-line-strong' : 'border-b border-line';
  return [totals.budget, totals.committed, totals.forecast, available, variance].map((value, index) => <td className={`num border-e px-[11px] py-[7px] text-end ${border} ${index === 4 && value < 0 ? 'text-bad' : ''}`} key={index}>{format(value)}</td>).concat(<td className={`num px-[11px] py-[7px] text-end ${border} ${usedPercent(totals) > 100 ? 'text-bad' : usedPercent(totals) > 85 ? 'text-warn' : 'text-ok'}`} key="used">{`${String(usedPercent(totals))}%`}</td>);
}
