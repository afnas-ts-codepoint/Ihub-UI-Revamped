import {
  Activity, ArrowRight, Building2, CalendarDays, Check, ChevronRight,
  CirclePower, Filter, Flag, Gauge, Grid3X3, LayoutDashboard,
  Pencil, RefreshCw, Search, ShieldCheck, Star, Target, Trash2, Users,
  X, Zap,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  COMPLIANCE, COMPLIANCE_STATS, COMPLIANCE_TREND, CRITICAL_TASKS,
  DEPARTMENT_WORKLOAD, EMPLOYEE_WORKLOAD, IMPACTED_AREAS,
  IMPACTED_AREA_DETAILS, SLA_PERFORMANCE, TASK_DEPENDENCIES, TASK_METRICS,
  TASK_SOURCES, TASKS_BY_DEPARTMENT, TASKS_BY_MATRIX_PARTNER, WORKLOAD_DAYS,
  WORKLOAD_LEGEND, WORKLOAD_STATUSES, type DashboardDatum,
} from '../data/taskDashboard.mock';
import { workloadColor, workloadGanttFor } from '../domain/taskDashboard';
import {
  effectiveTaskDashboardConfig, useTaskDashboardConfigStore,
  type TaskDashboardWidgetId,
} from '../store/taskDashboardConfig.store';
import type { TaskKindFilter, TaskViewModel } from '../types/task.types';

type Locale = 'ar' | 'en';
type Tone = 'accent' | 'bad' | 'default' | 'info' | 'ok' | 'warn';
type DashboardStyle = CSSProperties & Readonly<Record<`--task-${string}`, string>>;

const toneColor: Record<Tone, string> = {
  accent: 'var(--info)', bad: 'var(--bad)', default: 'var(--accent)',
  info: 'var(--info)', ok: 'var(--ok)', warn: 'var(--warn)',
};
const gaugeValues = [40, 86, 52, 70] as const;

function tr(locale: Locale, en: string, ar: string) {
  return locale === 'ar' ? ar : en;
}

function Panel({ children, icon, right, title, tone = 'var(--accent)', tinted = false }:
  Readonly<{ children: ReactNode; icon: ReactNode; right?: ReactNode; title: string; tone?: string; tinted?: boolean }>) {
  return (
    <section className={`flex h-full flex-col gap-4 rounded-xl border border-line p-5 ${tinted ? 'bg-raised' : 'bg-surface'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-accent-dim" style={{ color: tone }}>{icon}</span>
          <h2 className="m-0 text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function SectionHeading({ children }: Readonly<{ children: ReactNode }>) {
  return <h2 className="m-0 mb-3 text-lg font-semibold">{children}</h2>;
}

function ProgressRing({ percent, color, caption }: Readonly<{ percent: number; color: string; caption: string }>) {
  const radius = 34;
  const circumference = Math.PI * 2 * radius;
  return (
    <div className="relative size-19 shrink-0">
      <svg className="-rotate-90" height="76" viewBox="0 0 76 76" width="76">
        <circle cx="38" cy="38" fill="none" r={radius} stroke="var(--line)" strokeWidth="8" />
        <circle cx="38" cy="38" fill="none" r={radius} stroke={color} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} strokeLinecap="round" strokeWidth="8" />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <strong className="num text-lg">{`${String(percent)}%`}</strong>
        <span className="mt-1 text-[10px] text-fg-3">{caption}</span>
      </span>
    </div>
  );
}

function MetricsWidget({ locale }: Readonly<{ locale: Locale }>) {
  const icons = [LayoutDashboard, RefreshCw, Check, CirclePower];
  return (
    <section data-dashboard-widget="metrics">
      <SectionHeading>{tr(locale, 'Task metrics', 'مؤشرات المهام')}</SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {TASK_METRICS.map((metric, index) => {
          const Icon = icons[index] ?? Target;
          const value = Number(metric.value);
          const subValue = Number.parseFloat(metric.sub.replace(/[^0-9.]/g, ''));
          const percent = index === 0 ? Math.round(subValue / value * 100) : Math.round(value / 124 * 100);
          const color = toneColor[metric.tone];
          return (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-5 py-4 shadow-sm" key={metric.label}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-base text-fg-3"><Icon color={color} size={16} />{metric.label}</div>
                <div className="num my-2.5 text-[38px] leading-none font-semibold">{metric.value}</div>
                <span className="inline-flex rounded-full bg-raised px-2 py-0.5 text-xs font-semibold" style={{ color }}>{metric.sub}</span>
              </div>
              <ProgressRing caption={index === 0 ? tr(locale, 'open', 'مفتوحة') : tr(locale, 'of all', 'من الكل')} color={color} percent={percent} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SlaPerformanceWidget({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <section data-dashboard-widget="slaPerf">
      <SectionHeading>{tr(locale, 'SLA performance', 'أداء اتفاقية الخدمة')}</SectionHeading>
      <div className="task-sla-grid overflow-hidden rounded-xl border border-line bg-surface">
        {SLA_PERFORMANCE.map((item, index) => {
          const color = toneColor[item.tone];
          const dash = Math.PI * 34 * (gaugeValues[index] ?? 60) / 100;
          return (
            <div className="flex items-center gap-4 border-line p-4 not-first:border-s" key={item.label}>
              <svg className="shrink-0" height="50" viewBox="0 0 84 50" width="84">
                <path d="M8 44a34 34 0 0 1 68 0" fill="none" stroke="var(--paper-2)" strokeLinecap="round" strokeWidth="9" />
                <path d="M8 44a34 34 0 0 1 68 0" fill="none" stroke={color} strokeDasharray={`${String(dash)} ${String(Math.PI * 34)}`} strokeLinecap="round" strokeWidth="9" />
              </svg>
              <div className="min-w-0"><div className="text-xs tracking-wider text-fg-3 uppercase">{item.label}</div><div className="num text-2xl font-semibold">{item.value}</div><span className="text-xs font-semibold" style={{ color }}>{item.note}</span></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ComplianceTrend({ locale }: Readonly<{ locale: Locale }>) {
  const width = 640; const height = 120; const min = 50; const max = 74;
  const points = COMPLIANCE_TREND.map((value, index) => `${String(index / 7 * width)},${String(height - (value - min) / (max - min) * height)}`).join(' ');
  return (
    <div className="border-t border-line pt-4">
      <div className="flex justify-between gap-3"><span className="text-xs tracking-wider text-fg-3 uppercase">{tr(locale, 'Compliance rate · last 8 weeks', 'معدل الامتثال · آخر 8 أسابيع')}</span><span className="rounded-full bg-ok/10 px-2 py-0.5 text-xs font-semibold text-ok">{`+12 ${tr(locale, 'pts', 'نقاط')}`}</span></div>
      <svg aria-label="Compliance trend" className="mt-2 block h-30 w-full" preserveAspectRatio="none" role="img" viewBox="0 0 640 120"><defs><linearGradient id="task-compliance-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".28" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs><polygon fill="url(#task-compliance-gradient)" points={`0,120 ${points} 640,120`} /><polyline fill="none" points={points} stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>
      <div className="num flex justify-between text-xs text-fg-4">{COMPLIANCE_TREND.map((_, index) => <span key={index}>{`W${String(31 + index)}`}</span>)}</div>
    </div>
  );
}

function ComplianceWidget({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <Panel icon={<ShieldCheck size={16} />} right={<span className="rounded-full bg-accent-dim px-2 py-1 text-xs font-semibold text-accent">{`67% ${tr(locale, 'overall', 'إجمالي')}`}</span>} title={tr(locale, 'SLA compliance', 'الامتثال للخدمة')}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2.5">{COMPLIANCE_STATS.map((item) => <div className="rounded-xl border border-line p-3.5" key={item.label}><div className="num text-2xl font-semibold" style={{ color: toneColor[item.tone] }}>{item.value}</div><div className="mt-1.5 text-xs tracking-wider text-fg-3 uppercase">{item.label}</div></div>)}</div>
      <div className="flex flex-col gap-3">{COMPLIANCE.map((item) => <div className="grid grid-cols-[120px_1fr_56px] items-center gap-3 text-base" key={item.label}><span>{item.label}</span><span className="h-2.5 overflow-hidden rounded-full bg-raised"><span className="block h-full rounded-full" style={{ background: toneColor[item.tone], width: `${String(item.pct)}%` }} /></span><span className="num rounded-full bg-raised px-2 py-0.5 text-center text-xs font-semibold" style={{ color: toneColor[item.tone] }}>{`${String(item.pct)}%`}</span></div>)}</div>
      <ComplianceTrend locale={locale} />
    </Panel>
  );
}

function DonutWidget({ data, locale, title, subtitle }: Readonly<{ data: readonly DashboardDatum[]; locale: Locale; title: string; subtitle: string }>) {
  const total = data.reduce((sum, item) => sum + item.value, 0); const radius = 60; const circumference = Math.PI * 2 * radius;
  return (
    <Panel icon={<Target size={16} />} right={<span className="num rounded-full bg-raised px-2 py-1 text-xs">{total} {subtitle}</span>} title={title}>
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative size-37.5 shrink-0"><svg className="-rotate-90" viewBox="0 0 150 150">{data.map((item, index) => { const length = item.value / total * circumference; const current = data.slice(0, index).reduce((sum, previous) => sum + previous.value / total * circumference, 0); return <circle cx="75" cy="75" fill="none" key={item.label} r={radius} stroke={item.color} strokeDasharray={`${String(Math.max(length - 6, 0))} ${String(circumference)}`} strokeDashoffset={-current} strokeLinecap="round" strokeWidth="15" />; })}</svg><span className="absolute inset-0 flex flex-col items-center justify-center"><strong className="num text-3xl">{total}</strong><span className="text-xs text-fg-3">{tr(locale, 'tasks', 'مهام')}</span></span></div>
        <div className="min-w-55 flex-1 space-y-2">{data.map((item) => { const percent = Math.round(item.value / total * 100); return <div className="grid grid-cols-[12px_1fr_70px_38px_28px] items-center gap-2 rounded-lg bg-raised px-2.5 py-2 text-sm" key={item.label}><span className="size-3 rounded" style={{ background: item.color }} /><span className="truncate text-fg-2">{item.label}</span><span className="h-1.5 overflow-hidden rounded-full bg-inset"><span className="block h-full" style={{ background: item.color, width: `${String(percent)}%` }} /></span><span className="num text-end text-fg-3">{`${String(percent)}%`}</span><strong className="num text-end">{item.value}</strong></div>; })}</div>
      </div>
    </Panel>
  );
}

function RankWidget({ data, title, total }: Readonly<{ data: readonly DashboardDatum[]; title: string; total: string }>) {
  const max = data[0]?.value ?? 1;
  return <Panel icon={<Gauge size={16} />} right={<span className="num rounded-full bg-raised px-2 py-1 text-xs">{total}</span>} title={title}><div className="space-y-3">{data.map((item, index) => <div className="grid grid-cols-[26px_110px_1fr_36px] items-center gap-3 text-sm" key={item.label}><span className={`num grid size-6.5 place-items-center rounded-full text-xs font-semibold ${index < 3 ? 'bg-accent-dim text-accent' : 'bg-raised text-fg-3'}`}>{index + 1}</span><span className="truncate text-fg-2">{item.label}</span><span className="h-3 overflow-hidden rounded-md bg-raised"><span className="block h-full rounded-md" style={{ background: item.color, width: `${String(item.value / max * 100)}%` }} /></span><strong className="num text-end">{item.value}</strong></div>)}</div></Panel>;
}

function ImpactedAreasWidget({ locale }: Readonly<{ locale: Locale }>) {
  const [selected, setSelected] = useState<string | null>(null); const max = IMPACTED_AREAS[0].value;
  const detail = selected ? IMPACTED_AREA_DETAILS[selected as keyof typeof IMPACTED_AREA_DETAILS] : undefined;
  const labels = [tr(locale, 'Total Tasks', 'إجمالي المهام'), tr(locale, 'In Progress', 'قيد التنفيذ'), tr(locale, 'Overdue', 'متأخرة'), tr(locale, 'SLA Compliance', 'الامتثال للخدمة'), tr(locale, 'Avg Resolution', 'متوسط الحل')];
  return (
    <Panel icon={<Building2 size={16} />} title={tr(locale, 'Impacted areas', 'المناطق المتأثرة')}>
      <div className="flex h-58 items-end gap-3 overflow-x-auto pt-2" data-testid="impacted-area-chart">{IMPACTED_AREAS.map((item) => { const active = selected === item.label; return <button aria-pressed={active} className="flex h-full min-w-16 flex-1 cursor-pointer flex-col items-center justify-end gap-2 bg-transparent p-0 disabled:cursor-default" key={item.label} onClick={() => { setSelected(active ? null : item.label); }} style={{ opacity: selected && !active ? .45 : 1 }} title={`${tr(locale, 'View details', 'عرض التفاصيل')} — ${item.label}`} type="button"><span className="num w-full max-w-18 rounded-t-xl pt-2 text-sm font-semibold text-white" style={{ background: item.color, height: Math.max(item.value / max * 170, 28), transform: active ? 'translateY(-4px)' : undefined }}>{item.value}</span><span className={`h-8 text-xs leading-tight ${active ? 'font-semibold text-accent' : 'text-fg-3'}`}>{item.label}</span></button>; })}</div>
      {selected && detail ? <div className="rounded-xl border border-line bg-raised p-5" data-testid="impacted-area-detail"><div className="flex items-center justify-between"><div><h3 className="m-0 text-xl font-semibold">{selected}</h3><p className="m-0 mt-1 text-sm text-fg-3">{tr(locale, 'Performance Metrics Overview', 'نظرة عامة على مؤشرات الأداء')}</p></div><button aria-label={tr(locale, 'Close', 'إغلاق')} className="rounded-lg p-2 text-fg-3 hover:bg-inset" onClick={() => { setSelected(null); }} type="button"><X size={15} /></button></div><div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">{detail.map((value, index) => <div className="rounded-xl border border-line bg-surface p-3.5" key={labels[index]}><div className="text-sm text-fg-2">{labels[index]}</div><div className={`num mt-2 grid h-16 place-items-center rounded-lg text-2xl font-semibold ${index === 2 ? 'bg-bad/10 text-bad' : index === 3 ? 'bg-warn/10 text-warn' : 'bg-ok/10 text-ok'}`}>{value}</div></div>)}</div></div> : null}
    </Panel>
  );
}

function CriticalWidget({ locale }: Readonly<{ locale: Locale }>) {
  return <Panel icon={<Zap size={16} />} right={<span className="rounded-full bg-bad/10 px-2 py-1 text-xs font-semibold text-bad">{`4 ${tr(locale, 'open', 'مفتوحة')}`}</span>} title={tr(locale, 'Critical — requires action', 'حرِج — يتطلب إجراءً')} tone="var(--bad)"><div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,520px),1fr))] gap-3">{CRITICAL_TASKS.map((item) => <div className="flex gap-3.5 rounded-xl border border-bad/20 bg-bad/5 p-4" key={item.id}><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-bad/10 text-bad"><Flag size={18} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="num text-accent">{item.id}</strong><span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs font-semibold text-warn">{`${tr(locale, 'Severity', 'الخطورة')} · ${item.severity}`}</span><span className="rounded-full bg-bad/10 px-2 py-0.5 text-xs font-semibold text-bad">{`${tr(locale, 'Priority', 'الأولوية')} · Critical`}</span></div><div className="mt-1.5 text-base-plus font-semibold">{item.subject}</div><div className="text-xs text-fg-3">{item.meta}</div></div></div>)}</div></Panel>;
}

function GanttRows({ label, locale, status }: Readonly<{ label: string; locale: Locale; status: string }>) {
  const all = workloadGanttFor(label); const rows = status === 'all' ? all : all.filter((item) => item.status === status);
  return <div className="my-1 rounded-xl border border-line-strong bg-raised p-4" data-testid="workload-gantt"><h4 className="m-0 mb-3 flex items-center gap-2 text-base font-semibold text-accent"><Gauge size={15} />{`${tr(locale, 'Tasks', 'أوامر العمل')} — ${label}`}</h4><div className="ms-53 grid grid-cols-7 text-center text-xs text-fg-3">{WORKLOAD_DAYS.map(([date]) => <span className="num" key={date}>{date}</span>)}</div>{rows.length ? <div className="mt-2 space-y-2">{rows.map((item) => <div className="grid grid-cols-[200px_1fr] items-center gap-3" key={`${item.id}-${String(item.start)}-${String(item.span)}`}><div className="min-w-0"><div><strong className="num text-xs text-accent">{item.id}</strong>{' '}<span className="text-[10px] text-fg-3">{item.status}</span></div><div className="truncate text-sm text-fg-2">{item.title}</div></div><div className="relative h-6.5 rounded-md bg-inset"><span className="absolute inset-y-0 flex items-center overflow-hidden rounded-md px-2 text-xs font-semibold text-white" style={{ background: toneColor[item.tone], insetInlineStart: `${String(item.start / 7 * 100)}%`, width: `${String(item.span / 7 * 100)}%` }}>{`${String(item.span)}d`}</span></div></div>)}</div> : <p className="py-3 text-center text-sm text-fg-4">{tr(locale, 'No tasks with this status', 'لا توجد أوامر عمل بهذه الحالة')}</p>}</div>;
}

export function WorkloadHeatmap({ locale, soft = true }: Readonly<{ locale: Locale; soft?: boolean }>) {
  const [view, setView] = useState<'dept' | 'emp'>('dept'); const [selected, setSelected] = useState('all'); const [status, setStatus] = useState('all'); const [open, setOpen] = useState<string | null>(null);
  const allRows = view === 'dept' ? DEPARTMENT_WORKLOAD : EMPLOYEE_WORKLOAD; const rows = selected === 'all' ? allRows : allRows.filter((row) => row.dept === selected);
  const labelClass = soft ? 'text-xs' : 'text-base';
  const selectClass = soft ? 'h-9.5 rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-fg' : 'rounded-menu border border-line-strong bg-raised px-2.5 py-[7px] text-base font-medium text-fg';
  const deptLabel = view === 'dept' ? tr(locale, 'Dept', 'القسم') : tr(locale, 'Employee', 'الموظف');
  const totalLabel = view === 'dept' ? tr(locale, 'Total departments', 'إجمالي الإدارات') : tr(locale, 'Total employees', 'إجمالي الموظفين');
  return (
    <div className={`flex flex-col ${soft ? 'gap-4' : 'gap-5'}`} data-testid="workload-heatmap">
      <div className={`flex flex-wrap items-center justify-between gap-3 ${soft ? 'rounded-xl border border-line bg-raised p-3.5' : ''}`}>
        <div className="flex flex-wrap items-center gap-4">
          {soft ? <Filter className="text-accent" size={16} /> : null}
          <label className={`flex items-center gap-2 ${labelClass} font-semibold tracking-wider text-fg-3 uppercase max-tablet:flex max-tablet:w-full`}>
            <span className="max-tablet:w-16 max-tablet:shrink-0">{deptLabel}</span>
            <select aria-label={deptLabel} className={`${selectClass} ${soft ? 'min-w-45' : ''} max-tablet:min-w-0 max-tablet:flex-1`} onChange={(event) => { setSelected(event.target.value); setOpen(null); }} value={selected}>
              <option value="all">{view === 'dept' ? tr(locale, 'All departments', 'كل الإدارات') : tr(locale, 'All employees', 'كل الموظفين')}</option>
              {allRows.map((row) => <option key={row.dept} value={row.dept}>{row.dept}</option>)}
            </select>
          </label>
          <label className={`flex items-center gap-2 ${labelClass} font-semibold tracking-wider text-fg-3 uppercase max-tablet:flex max-tablet:w-full`}>
            <span className="max-tablet:w-16 max-tablet:shrink-0">{tr(locale, 'Status', 'الحالة')}</span>
            <select aria-label={tr(locale, 'Status', 'الحالة')} className={`${selectClass} ${soft ? 'min-w-40' : ''} max-tablet:min-w-0 max-tablet:flex-1`} onChange={(event) => { setStatus(event.target.value); }} value={status}>
              <option value="all">{tr(locale, 'All statuses', 'كل الحالات')}</option>
              {WORKLOAD_STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2 max-tablet:w-full">
          <span className={`${labelClass} font-semibold tracking-wider text-fg-3 uppercase max-tablet:w-16 max-tablet:shrink-0`}>{soft ? tr(locale, 'View by', 'العرض حسب') : tr(locale, 'View', 'العرض')}</span>
          <div className={`inline-flex border border-line-strong ${soft ? 'rounded-lg bg-canvas p-0.5' : 'rounded-[10px] bg-raised p-1'}`}>
            {([['dept', Grid3X3, tr(locale, 'Department', 'الإدارة')], ['emp', Users, tr(locale, 'Employee', 'الموظف')]] as const).map(([id, Icon, label]) => (
              <button aria-pressed={view === id} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-fg-3 aria-pressed:bg-surface aria-pressed:font-semibold ${soft ? 'aria-pressed:text-accent aria-pressed:shadow-sm' : 'aria-pressed:text-fg aria-pressed:shadow-[0_1px_3px_rgba(20,20,30,0.10)]'}`} key={id} onClick={() => { if (view !== id) { setView(id); setOpen(null); setSelected('all'); } }} type="button"><Icon size={14} />{label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-160 space-y-1.5 max-tablet:w-max max-tablet:min-w-0">
          <div className={`grid grid-cols-[150px_repeat(7,1fr)] items-end pb-1 max-tablet:grid-cols-[112px_repeat(7,62px)] ${soft ? 'gap-1.5' : 'gap-0'}`}><span />{WORKLOAD_DAYS.map(([date, day]) => <div className="text-center" key={date}><div className="num text-sm font-semibold text-fg-2">{date}</div><div className="text-xs text-fg-3">{day}</div></div>)}</div>
          {rows.map((row) => (
            <div key={row.dept}>
              <button aria-label={`${tr(locale, 'Open workload details for', 'فتح تفاصيل عبء العمل لـ')} ${row.dept}`} aria-expanded={open === row.dept} className={`grid w-full grid-cols-[150px_repeat(7,1fr)] items-center p-0 text-start max-tablet:grid-cols-[112px_repeat(7,62px)] ${soft ? 'gap-1.5 rounded-lg bg-transparent' : `gap-0 overflow-hidden rounded-[4px] transition-colors ${open === row.dept ? 'bg-raised' : 'bg-transparent'}`}`} onClick={() => { setOpen(open === row.dept ? null : row.dept); }} type="button">
                <span className={`flex items-center gap-1.5 pe-3 text-sm max-tablet:sticky max-tablet:start-0 max-tablet:z-[1] max-tablet:self-stretch max-tablet:overflow-hidden max-tablet:bg-surface max-tablet:text-ellipsis max-tablet:whitespace-nowrap ${open === row.dept ? 'font-semibold text-fg' : 'font-medium text-fg-2'}`}><ChevronRight className={`shrink-0 text-fg-4 transition-transform ${open === row.dept ? 'rotate-90 rtl:-rotate-90' : 'rtl:rotate-180'}`} size={14} />{row.dept}</span>
                {row.loads.map((value, index) => {
                  const color = workloadColor(value);
                  return soft
                    ? <span className="num grid h-9.5 place-items-center rounded-lg border text-sm font-semibold" key={index} style={{ background: `color-mix(in srgb, ${color} 22%, var(--paper))`, borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, color }} >{value}</span>
                    : <span className="num flex h-10 items-center justify-center text-sm font-semibold text-white" key={index} style={{ background: color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.10)' }}>{value}</span>;
                })}
              </button>
              {open === row.dept ? <GanttRows label={row.dept} locale={locale} status={status} /> : null}
            </div>
          ))}
        </div>
      </div>
      <div className={`grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] ${soft ? 'gap-3' : 'gap-2.5'}`}>
        {[[totalLabel, String(allRows.length), Users], [tr(locale, 'Time range', 'النطاق الزمني'), '7/13 – 7/19', CalendarDays], [tr(locale, 'Avg load / day', 'متوسط الحمل / يوم'), '19', Activity]].map(([label, value, Icon], index) => {
          const IconComponent = Icon as typeof Users;
          return soft
            ? <div className="flex items-center gap-3 rounded-xl border border-line bg-raised p-3.5" key={String(label)}><span className="grid size-11 place-items-center rounded-xl bg-accent-dim text-accent"><IconComponent size={18} /></span><div><div className="num text-2xl font-semibold text-accent">{value as string}</div><div className="mt-1 text-xs tracking-wider text-fg-3 uppercase">{label as string}</div></div></div>
            : <div className="flex flex-col gap-1 rounded-xl border border-line bg-raised px-4 py-3.5" key={String(label)}><span className={`display num text-6xl leading-none font-medium ${index === 2 ? 'text-accent' : 'text-fg'}`}>{value as string}</span><span className="text-xs font-semibold tracking-[0.08em] text-fg-3 uppercase">{label as string}</span></div>;
        })}
      </div>
    </div>
  );
}

function WorkloadWidget({ locale }: Readonly<{ locale: Locale }>) {
  return <Panel icon={<Grid3X3 size={16} />} right={<div className="flex flex-wrap gap-3">{WORKLOAD_LEGEND.map((item) => <span className="inline-flex items-center gap-1.5 text-xs text-fg-3" key={item.label}><span className="size-2.5 rounded-sm" style={{ background: item.color }} />{item.label}</span>)}</div>} title={tr(locale, 'Department resource availability & workload', 'توافر موارد الإدارات وأعباء العمل')}><WorkloadHeatmap locale={locale} /></Panel>;
}

function HighPriorityWidget({ kind, locale, onOpen, tasks }: Readonly<{ kind: TaskKindFilter; locale: Locale; onOpen: (id: string) => void; tasks: readonly TaskViewModel[] }>) {
  const [query, setQuery] = useState(''); const rows = tasks.filter((task) => (kind === 'all' || task.kind === kind) && task.severity !== 'Medium' && task.stage !== 'Done').filter((task) => `${task.id} ${task.subject}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <Panel icon={<Star size={16} />} right={<div className="flex flex-wrap items-center gap-2"><label className="relative"><Search className="absolute top-2.5 start-3 text-fg-4" size={15} /><input aria-label={tr(locale, 'Search high priority tasks', 'بحث المهام ذات الأولوية العالية')} className="h-9 w-75 rounded-lg border border-line-strong bg-surface ps-9 pe-3 text-sm" onChange={(event) => { setQuery(event.target.value); }} placeholder={tr(locale, 'Search by Task ID or Subject…', 'ابحث برقم المهمة أو الموضوع…')} value={query} /></label><button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-info" type="button">{tr(locale, 'Go to tasks', 'عرض المهام')}{' '}<ArrowRight className="rtl:rotate-180" size={14} /></button></div>} tinted title={tr(locale, 'High priority tasks', 'المهام ذات الأولوية العالية')}><div className="overflow-x-auto"><div className="min-w-245 space-y-2.5">{rows.length ? rows.map((task) => <button className="grid w-full grid-cols-[86px_minmax(220px,1.6fr)_minmax(150px,1fr)_120px_90px_130px_110px] items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-start shadow-sm" key={task.id} onClick={() => { onOpen(task.id); }} type="button"><span className="num rounded-lg bg-accent-dim px-2 py-1 text-center text-sm font-semibold text-accent">{task.id}</span><span className="min-w-0"><strong className="block truncate text-base">{task.subject}</strong><span className="mt-1 block text-xs text-fg-3">{`${task.severity} · ${task.stage}`}</span></span><span className="min-w-0"><span className="block truncate">{task.location}</span><span className="block truncate text-xs text-fg-3">{task.zone}</span></span><span className="rounded-full bg-raised px-2 py-1 text-center text-xs">{task.department}</span><span className="num text-center">{task.due}</span><span><strong className="num block">{`${String(task.progress)}%`}</strong><span className={task.sla === 'exceeded' ? 'text-xs font-semibold text-bad' : 'text-xs font-semibold text-ok'}>{task.sla === 'exceeded' ? tr(locale, 'SLA exceeded', 'تجاوز اتفاقية الخدمة') : tr(locale, 'On track', 'ضمن الموعد')}</span></span><span className="flex justify-end gap-1"><span aria-label={tr(locale, 'View', 'عرض')} className="rounded-lg border border-line-strong p-2 text-fg-3"><Target size={14} /></span><span aria-label={tr(locale, 'Edit', 'تعديل')} className="rounded-lg border border-line-strong p-2 text-fg-3"><Pencil size={14} /></span><span aria-label={tr(locale, 'Remove', 'حذف')} className="rounded-lg border border-line-strong p-2 text-bad"><Trash2 size={14} /></span></span></button>) : <p className="py-5 text-center text-sm text-fg-4">{tr(locale, 'No matching tasks', 'لا توجد مهام مطابقة')}</p>}</div></div></Panel>;
}

const widgetSize: Record<TaskDashboardWidgetId, 'full' | 'half'> = { metrics: 'full', slaPerf: 'full', compliance: 'half', source: 'half', dependency: 'half', highPri: 'full', byDept: 'half', matrix: 'half', impacted: 'full', critical: 'full', workload: 'full' };

export function TaskDashboard({ kind, onOpen, tasks }: Readonly<{ kind: TaskKindFilter; onOpen: (id: string) => void; tasks: readonly TaskViewModel[] }>) {
  const { i18n } = useTranslation('tasks'); const locale: Locale = i18n.resolvedLanguage?.startsWith('ar') ? 'ar' : 'en';
  const organizationConfig = useTaskDashboardConfigStore((state) => state.organizationConfig); const personalConfig = useTaskDashboardConfigStore((state) => state.personalConfig);
  const config = useMemo(() => effectiveTaskDashboardConfig(organizationConfig, personalConfig), [organizationConfig, personalConfig]);
  const widgets: Record<TaskDashboardWidgetId, ReactNode> = {
    metrics: <MetricsWidget locale={locale} />, slaPerf: <SlaPerformanceWidget locale={locale} />, compliance: <ComplianceWidget locale={locale} />,
    source: <DonutWidget data={TASK_SOURCES} locale={locale} subtitle={tr(locale, 'tasks', 'مهام')} title={tr(locale, 'By source of task', 'حسب مصدر المهمة')} />,
    dependency: <DonutWidget data={TASK_DEPENDENCIES} locale={locale} subtitle={tr(locale, 'tasks · owning dept.', 'مهام · الإدارة المالكة')} title={tr(locale, 'By dependency', 'حسب التبعية')} />,
    highPri: <HighPriorityWidget kind={kind} locale={locale} onOpen={onOpen} tasks={tasks} />, byDept: <RankWidget data={TASKS_BY_DEPARTMENT} title={tr(locale, 'By department', 'حسب الإدارة')} total="192" />,
    matrix: <RankWidget data={TASKS_BY_MATRIX_PARTNER} title={tr(locale, 'By matrix partner', 'حسب الشريك المصفوفي')} total="95" />, impacted: <ImpactedAreasWidget locale={locale} />, critical: <CriticalWidget locale={locale} />, workload: <WorkloadWidget locale={locale} />,
  };
  const style = { '--task-dashboard-cols': String(config.cols) } as DashboardStyle;
  if (config.ids.length === 0) return <div className="rounded-xl border border-line bg-surface p-10 text-center text-sm text-fg-4">{tr(locale, 'No widgets are switched on for this dashboard.', 'لا توجد عناصر مفعّلة لهذه اللوحة.')}</div>;
  return <div className="task-dashboard-grid" data-testid="task-dashboard" style={style}>{config.ids.map((id) => <div className={`${widgetSize[id] === 'full' || config.cols === 1 ? 'task-dashboard-full' : 'min-w-0'} ${id === 'compliance' && config.cols > 1 ? 'task-dashboard-tall' : ''}`} data-widget-id={id} key={id}>{widgets[id]}</div>)}</div>;
}
