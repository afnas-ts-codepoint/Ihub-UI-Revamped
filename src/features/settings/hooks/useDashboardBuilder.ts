import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { findAdminDashboard } from '../data/adminDashboards.data';
import { TASK_DASHBOARD_SEED_LIBRARY, DASHBOARD_BUILDER_CURRENT_USER } from '../data/taskDashboardLibrary.data';
import { DASHBOARD_ROLES, DASHBOARD_USER_NAMES } from '../data/scopeTargets.data';
import { standardDashboardConfig } from '../domain/dashboardConfigDefaults';
import {
  dashboardConfigFilename,
  exportDashboardConfig,
  importDashboardConfig,
} from '../domain/dashboardConfigFile';
import {
  computeScopeKey,
  isMultiTargetScope,
  isScopeTargetMissing,
  scopeTargetList,
} from '../domain/scopeKey';
import { sanitizeUserConfig } from '../domain/sanitizeUserConfig';
import {
  duplicateLibraryEntry,
  incrementLibraryEntryUses,
  removeLibraryEntry,
  sortLibraryEntries,
  toggleLibraryEntryFavorite,
  upsertLibraryEntryByScopeKey,
  type LibrarySort,
} from '../domain/savedConfigLibrary';
import { clearWidgetIds, reorderWidgetIds, selectAllWidgetIds, toggleWidgetId } from '../domain/widgetRules';
import { useDashboardConfigStore } from '../store/dashboardConfig.store';
import type {
  BuilderMode,
  ColumnCount,
  DashboardConfig,
  DashboardId,
  DashboardWidget,
  PreviewDevice,
  SavedConfigEntry,
  ScopeKey,
  ScopeTargetState,
} from '../types/dashboardConfig.types';
import { useLocalizedText } from '@/shared/i18n/localized';
import { downloadText } from '@/shared/file/download';
import { readFile } from '@/shared/file/readFile';
import { useReferenceFilters } from '@/features/organization';

export type FlashMessage = Readonly<{
  key: string;
  params?: Record<string, unknown>;
}> | null;

export type PreviewRequest = Readonly<{ cfg: DashboardConfig; title: string }>;

export type UseDashboardBuilderOptions = Readonly<{
  dashboardId: DashboardId;
  mode: BuilderMode;
}>;

export type DashboardBuilderState = ReturnType<typeof useDashboardBuilder>;

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${String(now.getFullYear())}-${month}-${day}`;
}

function initialTarget(departments: readonly string[]): ScopeTargetState {
  const firstDepartment = departments[0];
  const firstUser = DASHBOARD_USER_NAMES[0];
  return {
    dept: firstDepartment ? [firstDepartment] : [],
    role: DASHBOARD_ROLES[0] ?? '',
    user: firstUser ? [firstUser] : [],
  };
}

/**
 * Owns every piece of state the Admin/User dashboard configuration builder
 * needs: scope + target selection (admin only), the in-progress ("work")
 * config per scope key, the last-saved snapshot (for dirty tracking), the
 * saved-configuration library, search/category/device/drag UI state, and
 * every mutating action (toggle/reorder/select-all/clear/columns/lock,
 * save/reset, import/export, and the 5 library-entry actions). Mirrors
 * `AdminTaskDashConfig`, parameterized by `mode` exactly as the prototype
 * itself is (`mode === 'user'`) rather than forking into two components.
 * @prototype index.html:L7146-L7434
 */
export function useDashboardBuilder({ dashboardId, mode }: UseDashboardBuilderOptions) {
  const { t } = useTranslation('settings');
  const localize = useLocalizedText();
  const isUser = mode === 'user';

  const dashboardDef = findAdminDashboard(dashboardId);
  const widgets = dashboardDef.widgets;
  const mandatoryIds = dashboardDef.mandatory;
  const isLive = dashboardDef.live;
  const dashboardName = localize(dashboardDef.label);

  const { data: referenceFilters } = useReferenceFilters();
  const departments = referenceFilters.departments;

  const store = useDashboardConfigStore();
  const adminScoped = store.adminConfigsByDashboard[dashboardId];
  const orgConfig: DashboardConfig = adminScoped?.default ?? standardDashboardConfig(widgets);

  // `!== false` (not a truthy check) deliberately matches the prototype's
  // own `ORG.dnd !== false` / `ORG.hide !== false`: the lenient JSON import
  // (`dashboardConfigFile.ts`) never validates `dnd`/`hide`, so a saved
  // Default config can hold any value here — only an actual literal
  // `false` turns the rule off, everything else counts as "on".
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
  const ruleDnd = isUser ? orgConfig.dnd !== false : true;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
  const ruleHide = isUser ? orgConfig.hide !== false : true;

  const availableWidgets: readonly DashboardWidget[] = isUser
    ? orgConfig.ids
        .map((id) => widgets.find((widget) => widget.id === id))
        .filter((widget): widget is DashboardWidget => widget !== undefined)
    : widgets;
  const availableIds = availableWidgets.map((widget) => widget.id);

  function buildInitialWork(): Record<string, DashboardConfig> {
    if (isUser) {
      const personal = store.personalConfigByDashboard[dashboardId] ?? null;
      const sanitized = sanitizeUserConfig(personal, orgConfig, mandatoryIds);
      return sanitized ? { default: orgConfig, me: sanitized } : { default: orgConfig };
    }
    return { ...(adminScoped ?? {}), default: orgConfig };
  }

  function buildInitialLibrary(): SavedConfigEntry[] {
    if (isUser) return [...(store.personalLibraryByDashboard[dashboardId] ?? [])];
    const persisted = store.adminLibraryByDashboard[dashboardId];
    if (persisted) return [...persisted];
    return dashboardId === 'tasks' ? [...TASK_DASHBOARD_SEED_LIBRARY] : [];
  }

  const identityKey = `${dashboardId}\u0000${mode}`;
  const [seenIdentity, setSeenIdentity] = useState(identityKey);
  const [scope, setScopeState] = useState<ScopeKey>('default');
  const [target, setTarget] = useState<ScopeTargetState>(() => initialTarget(departments));
  const [work, setWork] = useState<Record<string, DashboardConfig>>(buildInitialWork);
  const [saved, setSaved] = useState<Record<string, DashboardConfig>>(buildInitialWork);
  const [library, setLibrary] = useState<SavedConfigEntry[]>(buildInitialLibrary);
  const [librarySort, setLibrarySort] = useState<LibrarySort>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [previewRequest, setPreviewRequest] = useState<PreviewRequest | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage>(null);

  // Render-time state reset when the routed dashboard or mode changes —
  // mirrors the prototype's `key={dash}` / `key={'me-'+dash}` remount and
  // this repo's established `useMasterListing` reset pattern.
  if (seenIdentity !== identityKey) {
    setSeenIdentity(identityKey);
    const initialWork = buildInitialWork();
    setScopeState('default');
    setTarget(initialTarget(departments));
    setWork(initialWork);
    setSaved(initialWork);
    setLibrary(buildInitialLibrary());
    setLibrarySort('recent');
    setSearchQuery('');
    setCategory('All');
    setDevice('desktop');
    setPreviewRequest(null);
    setDragId(null);
    setOverId(null);
    setFlash(null);
  }

  const key = computeScopeKey(mode, scope, target);
  const isOwn = Boolean(work[key]);
  const currentConfig: DashboardConfig = work[key] ?? work.default ?? orgConfig;
  const isDirty = JSON.stringify(work[key] ?? null) !== JSON.stringify(saved[key] ?? null);
  const lockedIds = (isUser ? orgConfig.lock : currentConfig.lock) ? mandatoryIds : [];
  const noTarget = !isUser && isScopeTargetMissing(scope, target);

  function updateCurrent(patch: Partial<DashboardConfig>) {
    setWork((current) => {
      const base = current[key] ?? current.default ?? orgConfig;
      const next: DashboardConfig = {
        cols: patch.cols ?? base.cols,
        dnd: patch.dnd ?? base.dnd,
        hide: patch.hide ?? base.hide,
        ids: [...(patch.ids ?? base.ids)],
        lock: patch.lock ?? base.lock,
      };
      return { ...current, [key]: next };
    });
  }

  function targetSummaryText(forScope: ScopeKey): string {
    const list = scopeTargetList(forScope, target);
    if (list.length > 3) {
      return `${list.slice(0, 3).join(', ')} +${String(list.length - 3)}`;
    }
    return list.join(', ');
  }

  const appliedToText = isUser
    ? t('myDashboard.you')
    : scope === 'default'
      ? t('scope.allUsers')
      : isMultiTargetScope(scope)
        ? targetSummaryText(scope) || t('scope.nobodySelected')
        : target.role;

  function flashText(message: FlashMessage): string {
    if (!message) return '';
    return t(message.key, { defaultValue: message.key, ...message.params });
  }

  function toggleWidget(id: string) {
    const result = toggleWidgetId(currentConfig.ids, id, {
      hideDisallowed: isUser && !ruleHide,
      locked: lockedIds,
    });
    if (!result.ok) {
      setFlash({
        key:
          result.reason === 'hide-disallowed'
            ? 'flash.hideDisallowed'
            : result.reason === 'locked'
              ? 'flash.widgetLocked'
              : 'flash.maxWidgets',
      });
      return;
    }
    updateCurrent({ ids: result.ids });
  }

  function moveWidget(from: string | null, to: string | null) {
    updateCurrent({ ids: reorderWidgetIds(currentConfig.ids, from, to, ruleDnd) });
  }

  function selectAllWidgets() {
    updateCurrent({ ids: selectAllWidgetIds(currentConfig.ids, availableIds) });
  }

  function clearWidgets() {
    updateCurrent({ ids: clearWidgetIds(currentConfig.ids, lockedIds) });
  }

  function setColumns(cols: ColumnCount) {
    updateCurrent({ cols });
  }

  function toggleDnd() {
    updateCurrent({ dnd: !currentConfig.dnd });
  }

  function toggleHide() {
    updateCurrent({ hide: !currentConfig.hide });
  }

  function toggleLockMandatory() {
    const lock = !currentConfig.lock;
    updateCurrent({
      ids: lock
        ? mandatoryIds.filter((id) => !currentConfig.ids.includes(id)).concat(currentConfig.ids)
        : currentConfig.ids,
      lock,
    });
  }

  function save() {
    if (isUser) {
      setSaved((state) => ({ ...state, me: currentConfig }));
      setWork((state) => ({ ...state, me: currentConfig }));
      store.setPersonalConfig(dashboardId, currentConfig);
      setLibrary((entries) => {
        const next = upsertLibraryEntryByScopeKey(entries, 'me', (existing) => ({
          applied: t('myDashboard.you'),
          by: DASHBOARD_BUILDER_CURRENT_USER,
          cfg: currentConfig,
          date: todayIso(),
          fav: existing?.fav ?? false,
          id: existing?.id ?? `M${String(Date.now())}`,
          name: `${t('library.myLayoutPrefix')}${dashboardName}${t('library.myLayoutSuffix')}`,
          scopeKey: 'me',
          status: 'Active',
          uses: existing?.uses ?? 0,
        }));
        store.setPersonalLibrary(dashboardId, next);
        return next;
      });
      setFlash({
        key: isLive ? 'flash.savedPersonalLive' : 'flash.savedPersonalPending',
        params: { dashboard: dashboardName },
      });
      return;
    }

    if (noTarget) {
      setFlash({ key: scope === 'dept' ? 'flash.chooseDepartment' : 'flash.chooseUser' });
      return;
    }

    setSaved((state) => ({ ...state, [key]: currentConfig }));
    setWork((state) => ({ ...state, [key]: currentConfig }));
    store.setAdminScopedConfig(dashboardId, key, currentConfig);

    const entryName =
      scope === 'default'
        ? t('library.defaultLayoutName')
        : `${appliedToText} ${t('library.layoutSuffix')}`;

    setLibrary((entries) => {
      const next = upsertLibraryEntryByScopeKey(entries, key, (existing) => ({
        applied: appliedToText,
        by: DASHBOARD_BUILDER_CURRENT_USER,
        cfg: currentConfig,
        date: todayIso(),
        fav: existing?.fav ?? false,
        id: existing?.id ?? `L${String(Date.now())}`,
        name: entryName,
        scopeKey: key,
        status: 'Active',
        uses: existing?.uses ?? 0,
      }));
      store.setAdminLibrary(dashboardId, next);
      return next;
    });

    setFlash(
      key === 'default'
        ? { key: isLive ? 'flash.savedDefaultLive' : 'flash.savedDefaultPending', params: { dashboard: dashboardName } }
        : { key: 'flash.savedForTarget', params: { target: appliedToText } },
    );
  }

  function resetScope() {
    if (isUser) {
      setWork((state) =>
        Object.fromEntries(Object.entries(state).filter(([entryKey]) => entryKey !== 'me')),
      );
      setFlash({ key: 'flash.resetPersonal' });
      return;
    }

    if (key === 'default') {
      setWork((state) => ({
        ...state,
        default: standardDashboardConfig(widgets),
      }));
      setFlash({ key: 'flash.resetDefault' });
      return;
    }

    setWork((state) =>
      Object.fromEntries(Object.entries(state).filter(([entryKey]) => entryKey !== key)),
    );
    setFlash({ key: 'flash.resetInherit' });
  }

  function exportConfig() {
    downloadText(
      exportDashboardConfig(key, currentConfig),
      dashboardConfigFilename(dashboardId, key),
      'application/json',
    );
  }

  async function importConfig(file: File) {
    const contents = await readFile(file);
    const raw = contents.kind === 'text' ? contents.text : '';
    const result = importDashboardConfig(raw, availableIds);
    if (!result.ok) {
      setFlash({ key: 'flash.importInvalid' });
      return;
    }
    const sanitized = isUser ? sanitizeUserConfig(result.patch, orgConfig, mandatoryIds) : null;
    updateCurrent(
      isUser && sanitized ? sanitized : result.patch,
    );
    setFlash({ key: 'flash.imported' });
  }

  function loadLibraryEntry(entry: SavedConfigEntry) {
    const sanitized = isUser
      ? sanitizeUserConfig(entry.cfg, orgConfig, mandatoryIds)
      : { ...entry.cfg, ids: entry.cfg.ids.filter((id) => availableIds.includes(id)) };
    if (sanitized) updateCurrent(sanitized);
    setLibrary((entries) => {
      const next = incrementLibraryEntryUses(entries, entry.id);
      if (isUser) store.setPersonalLibrary(dashboardId, next);
      else store.setAdminLibrary(dashboardId, next);
      return next;
    });
    setFlash({ key: 'flash.loaded', params: { name: entry.name } });
  }

  function previewLibraryEntry(entry: SavedConfigEntry) {
    setPreviewRequest({
      cfg: { ...entry.cfg, ids: entry.cfg.ids.filter((id) => availableIds.includes(id)) },
      title: entry.name,
    });
  }

  function duplicateLibraryEntryById(id: string) {
    const entry = library.find((candidate) => candidate.id === id);
    setLibrary((entries) => {
      const next = duplicateLibraryEntry(entries, id, {
        by: DASHBOARD_BUILDER_CURRENT_USER,
        copySuffix: t('library.copySuffix'),
        newId: `L${String(Date.now())}`,
        today: todayIso(),
      });
      if (isUser) store.setPersonalLibrary(dashboardId, next);
      else store.setAdminLibrary(dashboardId, next);
      return next;
    });
    if (entry) setFlash({ key: 'flash.duplicated' });
  }

  function deleteLibraryEntryById(id: string) {
    const entry = library.find((candidate) => candidate.id === id);
    setLibrary((entries) => {
      const next = removeLibraryEntry(entries, id);
      if (isUser) store.setPersonalLibrary(dashboardId, next);
      else store.setAdminLibrary(dashboardId, next);
      return next;
    });
    if (entry) setFlash({ key: 'flash.deleted', params: { name: entry.name } });
  }

  function toggleLibraryEntryStar(id: string) {
    setLibrary((entries) => {
      const next = toggleLibraryEntryFavorite(entries, id);
      if (isUser) store.setPersonalLibrary(dashboardId, next);
      else store.setAdminLibrary(dashboardId, next);
      return next;
    });
  }

  return {
    appliedToText,
    availableIds,
    availableWidgets,
    category,
    currentConfig,
    dashboardDef,
    dashboardName,
    departments,
    device,
    dragId,
    flashMessage: flashText(flash),
    isDirty,
    isLive,
    isOwn,
    isUser,
    library: sortLibraryEntries(library, librarySort),
    librarySort,
    lockedIds,
    mandatoryIds,
    noTarget,
    orgConfig,
    overId,
    previewRequest,
    ruleDnd,
    ruleHide,
    scope,
    scopeKey: key,
    searchQuery,
    target,
    widgets,

    clearWidgets,
    closePreview: () => { setPreviewRequest(null); },
    deleteLibraryEntry: deleteLibraryEntryById,
    duplicateLibraryEntry: duplicateLibraryEntryById,
    exportConfig,
    importConfig,
    loadLibraryEntry,
    moveWidget,
    openPreview: (cfg: DashboardConfig, title: string) => { setPreviewRequest({ cfg, title }); },
    previewLibraryEntry,
    resetScope,
    save,
    selectAllWidgets,
    setCategory,
    setColumns,
    setDevice,
    setDragId,
    setLibrarySort,
    setOverId,
    setScope: (next: ScopeKey) => { setScopeState(next); },
    setSearchQuery,
    setTarget,
    toggleDnd,
    toggleHide,
    toggleLibraryEntryStar,
    toggleLockMandatory,
    toggleWidget,
  };
}
