import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CATEGORIZED_ICONS } from '../constants/icons.jsx';
import { getRandomColor, STAT_PALETTE } from '../utils/helpers.js';
import { computeEntitiesWithFormulas } from '../utils/formulaEngine.js';

const STORAGE_KEY = 'statvault-pro-state';

const loadStateFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to load state from localStorage', e);
  }
  return null;
};

export const useAppState = () => {
  const initialState = useMemo(() => loadStateFromStorage(), []);

  // ─── Panel / UI state ────────────────────────────────────────────────────
  const [theme, setTheme] = useState(initialState?.theme ?? 'dark');
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
  }, [theme]);

  const [leftCollapsed, setLeftCollapsed] = useState(initialState?.leftCollapsed ?? false);
  const [rightCollapsed, setRightCollapsed] = useState(initialState?.rightCollapsed ?? false);
  const [bottomCollapsed, setBottomCollapsed] = useState(initialState?.bottomCollapsed ?? false);
  const [leftWidth, setLeftWidth] = useState(initialState?.leftWidth ?? 240);
  const [rightWidth, setRightWidth] = useState(initialState?.rightWidth ?? 320);
  const [rightSplit, setRightSplit] = useState(initialState?.rightSplit ?? 50);
  const [registryView, setRegistryView] = useState(initialState?.registryView ?? 'grid');
  const [visMode, setVisMode] = useState(initialState?.visMode === 'line' ? 'parallel' : (initialState?.visMode ?? 'radar'));

  const handleSetVisMode = useCallback((mode) => {
    const resolved = mode === 'line' ? 'parallel' : mode;
    setVisMode(resolved);
    if (resolved === 'pie') {
      setZoom({ x: 1, y: 1 });
      setOffset({ x: 0, y: 0 });
    } else if (resolved === 'parallel' || resolved === 'dots') {
      setZoom({ x: 0.85, y: 0.85 });
      setOffset({ x: 0, y: 0 });
    }
  }, []);

  // ─── Selection / interaction state ───────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(initialState?.selectedIds ?? []);
  const [hoveredId, setHoveredId] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(initialState?.multiSelectMode ?? false);
  const [monitorPage, setMonitorPage] = useState(initialState?.monitorPage ?? 0);
  const [activePieIndex, setActivePieIndex] = useState(initialState?.activePieIndex ?? null);

  // ─── Viewport / pan / zoom ────────────────────────────────────────────────
  const [zoom, setZoom] = useState(() => {
    if (initialState?.zoom !== undefined) {
      if (typeof initialState.zoom === 'object' && initialState.zoom !== null) {
        return {
          x: typeof initialState.zoom.x === 'number' ? initialState.zoom.x : 1,
          y: typeof initialState.zoom.y === 'number' ? initialState.zoom.y : 1,
        };
      }
      const num = Number(initialState.zoom) || 1;
      return { x: num, y: num };
    }
    const initialMode = initialState?.visMode === 'line' ? 'parallel' : (initialState?.visMode ?? 'radar');
    if (initialMode === 'parallel' || initialMode === 'dots') return { x: 0.85, y: 0.85 };
    return { x: 1, y: 1 };
  });
  const [offset, setOffset] = useState(initialState?.offset ?? { x: 0, y: 0 });
  const offsetRef = useRef(offset);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  // ─── Icon picker ─────────────────────────────────────────────────────────
  const [activeIconPicker, setActiveIconPicker] = useState(null);
  const [iconSearch, setIconSearch] = useState('');

  // ─── Chart Settings ──────────────────────────────────────────────────────
  const [chartSettings, setChartSettings] = useState(() => {
    return initialState?.chartSettings ?? {
      hideLabels: false,
      hideScales: false,
      // Parallel Coordinates Settings (independent horizontal/vertical labels & axes)
      parallelShowXAxisTitle: true,
      parallelXAxisTitle: 'METRICS',
      parallelXTitleDistance: 'ultra-close', // 'ultra-close' | 'close' | 'normal'
      parallelShowYAxisTitle: true,
      parallelYAxisTitle: 'VALUE',
      parallelYTitleDistance: 'ultra-close', // 'ultra-close' | 'close' | 'normal'
      parallelYTitleOrientation: 'vertical', // 'vertical' | 'horizontal'
      parallelHideStatNames: false,
      parallelLabelOrientation: 'horizontal', // 'horizontal' | 'vertical'
      parallelHideScaleNumbers: false,
      parallelCurveType: 'linear',
      parallelFillOpacity: 0.25,
      radarGridShape: 'polygon',
      dotsShowGridBands: true,
      pieDonutHole: true,
      piePaddingAngle: 4,
      tableDensity: 'standard',
      tableShowHeatmap: true,
      tableStatColWidth: 160,
      tableEntityColWidth: 130,
      tableScale: 1,
      leaderboardShowValues: true,
    };
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(() => {
    const defaultStats = [
      { id: 's1', name: 'STAT_01', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag', min: 0, max: 100 },
      { id: 's2', name: 'STAT_02', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag', min: 0, max: 100 },
      { id: 's3', name: 'STAT_03', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag', min: 0, max: 100 },
      { id: 's4', name: 'STAT_04', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag', min: 0, max: 100 },
      { id: 's5', name: 'STAT_05', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag', min: 0, max: 100 },
      { id: 's6', name: 'STAT_06', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag', min: 0, max: 100 },
    ];
    const source = initialState?.stats ?? defaultStats;
    return source.map(s => ({
      ...s,
      min: typeof s.min === 'number' ? s.min : 0,
      max: typeof s.max === 'number' ? s.max : 100,
    }));
  });

  const [entities, setEntities] = useState(
    initialState?.entities ?? [
      { id: 'e1', name: 'ENT_01', visible: true, color: '#10b981', values: { s1: 80, s2: 45, s3: 90, s4: 65, s5: 75, s6: 55 } },
      { id: 'e2', name: 'ENT_02', visible: true, color: '#3b82f6', values: { s1: 45, s2: 85, s3: 40, s4: 95, s5: 55, s6: 70 } },
      { id: 'e3', name: 'ENT_03', visible: true, color: '#f59e0b', values: { s1: 60, s2: 70, s3: 50, s4: 40, s5: 90, s6: 30 } },
      { id: 'e4', name: 'ENT_04', visible: true, color: '#ec4899', values: { s1: 30, s2: 30, s3: 80, s4: 80, s5: 40, s6: 90 } },
    ]
  );

  // ─── Export / import / projects dropdowns ─────────────────────────────────
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);

  // ─── Projects ─────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('statvault-projects');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // ─── PNG export ───────────────────────────────────────────────────────────
  const [showPngExport, setShowPngExport] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showFiltersExport, setShowFiltersExport] = useState(true);
  const [showEntitiesExport, setShowEntitiesExport] = useState(true);
  const exportAreaRef = useRef(null);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Thresholds & Triggers ────────────────────────────────────────────────
  const [entityThresholds, setEntityThresholds] = useState(initialState?.entityThresholds ?? {});
  const [globalEntityThreshold, setGlobalEntityThreshold] = useState(initialState?.globalEntityThreshold ?? { min: null, max: null });
  const [metricThresholdRange, setMetricThresholdRange] = useState(initialState?.metricThresholdRange ?? { enabled: true, min: 30, max: 85 });
  const [thresholdAlertsEnabled, setThresholdAlertsEnabled] = useState(
    initialState?.thresholdAlertsEnabled ?? initialState?.metricThresholdRange?.enabled ?? true
  );
  const [thresholdNotifications, setThresholdNotifications] = useState(initialState?.thresholdNotifications ?? []);

  // ─── Action History ───────────────────────────────────────────────────────
  const [actionHistory, setActionHistory] = useState(() => {
    return initialState?.actionHistory ?? [
      {
        id: 'init_action',
        timestamp: Date.now(),
        dateStr: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        formattedTime: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action: 'Workspace Initialized',
        input: 'Parameters & entities loaded',
        source: 'User Manual Input',
        snapshot: {
          entities: initialState?.entities ?? [
            { id: 'e1', name: 'ENT_01', visible: true, color: '#10b981', values: { s1: 80, s2: 45, s3: 90, s4: 65, s5: 75, s6: 55 } },
            { id: 'e2', name: 'ENT_02', visible: true, color: '#3b82f6', values: { s1: 45, s2: 85, s3: 40, s4: 95, s5: 55, s6: 70 } },
            { id: 'e3', name: 'ENT_03', visible: true, color: '#f59e0b', values: { s1: 60, s2: 70, s3: 50, s4: 40, s5: 90, s6: 30 } },
            { id: 'e4', name: 'ENT_04', visible: true, color: '#ec4899', values: { s1: 30, s2: 30, s3: 80, s4: 80, s5: 40, s6: 90 } },
          ],
          stats: initialState?.stats ?? [
            { id: 's1', name: 'STAT_01', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
            { id: 's2', name: 'STAT_02', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
            { id: 's3', name: 'STAT_03', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
            { id: 's4', name: 'STAT_04', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
            { id: 's5', name: 'STAT_05', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
            { id: 's6', name: 'STAT_06', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
          ],
          selectedIds: initialState?.selectedIds ?? [],
          entityThresholds: initialState?.entityThresholds ?? {},
          globalEntityThreshold: initialState?.globalEntityThreshold ?? { min: null, max: null },
        },
      },
    ];
  });

  const entitiesRef = useRef(entities);
  useEffect(() => { entitiesRef.current = entities; }, [entities]);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  const selectedIdsRef = useRef(selectedIds);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  const entityThresholdsRef = useRef(entityThresholds);
  useEffect(() => { entityThresholdsRef.current = entityThresholds; }, [entityThresholds]);
  const globalEntityThresholdRef = useRef(globalEntityThreshold);
  useEffect(() => { globalEntityThresholdRef.current = globalEntityThreshold; }, [globalEntityThreshold]);

  // ─── Refs for resize / pan ────────────────────────────────────────────────
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);
  const isResizingSplitRef = useRef(false); // Fix 6: renamed to end in Ref
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const panFrameRef = useRef(null);
  const pendingOffsetRef = useRef(null);
  const zoomFrameRef = useRef(null);
  const pendingZoomRef = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef(null);
  const isDragging = useRef(false);
  const longPressStartPos = useRef({ x: 0, y: 0 });
  const rightAsideRef = useRef(null);

  // ─── Fix 6: callback so RightPanel doesn't need to mutate a passed ref ────
  const handleStartSplitResize = useCallback(() => {
    isResizingSplitRef.current = true;
    document.body.style.cursor = 'row-resize';
  }, []);

  // ─── Computed values ──────────────────────────────────────────────────────
  const filteredIcons = useMemo(() => {
    if (!iconSearch) return CATEGORIZED_ICONS;
    const search = iconSearch.toLowerCase();
    return CATEGORIZED_ICONS
      .map(category => ({
        ...category,
        icons: category.icons.filter(item => item.name.toLowerCase().includes(search)),
      }))
      .filter(category => category.icons.length > 0);
  }, [iconSearch]);

  // ─── Computed Entities with Cross-Stat Formulas ──────────────────────
  const computedEntities = useMemo(() => {
    return computeEntitiesWithFormulas(entities, stats);
  }, [entities, stats]);

  const visibleEntities = useMemo(() => computedEntities.filter(e => e.visible), [computedEntities]);
  const enabledStats = useMemo(() => stats.filter(stat => !stat.disabled), [stats]);
  const anyFilterActive = enabledStats.some(stat => stat.visible);
  const activeStats = anyFilterActive ? enabledStats.filter(stat => stat.visible) : enabledStats;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const chartData = useMemo(() => {
    return activeStats.map(stat => {
      const row = { subject: stat.name, statId: stat.id };
      visibleEntities.forEach(entity => { row[entity.id] = entity.values[stat.id] ?? 0; });
      return row;
    });
  }, [activeStats, visibleEntities]);

  const entityTotals = useMemo(() => {
    const totals = {};
    for (const entity of visibleEntities) {
      let total = 0;
      for (const stat of activeStats) total += entity.values[stat.id] || 0;
      totals[entity.id] = total;
    }
    return totals;
  }, [visibleEntities, activeStats]);

  const sortedEntities = useMemo(() => (
    [...computedEntities].sort((a, b) => (entityTotals[b.id] || 0) - (entityTotals[a.id] || 0))
  ), [computedEntities, entityTotals]);

  const topPerformers = useMemo(() => {
    const result = new Map();
    for (const stat of activeStats) {
      result.set(
        stat.id,
        [...visibleEntities]
          .sort((a, b) => (b.values[stat.id] || 0) - (a.values[stat.id] || 0))
          .slice(0, 3)
          .map(entity => ({ name: entity.name, val: entity.values[stat.id] || 0, color: entity.color }))
      );
    }
    return result;
  }, [visibleEntities, activeStats]);

  const selectedEntity =
    selectedIds.length === 1 ? computedEntities.find(entity => entity.id === selectedIds[0]) : null;

  const itemsPerPage = 6;
  const totalPages = Math.ceil(visibleEntities.length / itemsPerPage);
  const paginatedEntities = useMemo(() => {
    const start = monitorPage * itemsPerPage;
    return visibleEntities.slice(start, start + itemsPerPage);
  }, [visibleEntities, monitorPage]);

  useEffect(() => {
    setMonitorPage(prev => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const leaderboardData = useMemo(() => (
    sortedEntities
      .filter(e => e.visible)
      .map(entity => {
        const row = {
          name: entity.name,
          total: entityTotals[entity.id] || 0,
          color: entity.color,
          id: entity.id,
          values: entity.values,
        };
        activeStats.forEach(stat => {
          row[stat.id] = entity.values?.[stat.id] ?? 0;
        });
        return row;
      })
  ), [sortedEntities, entityTotals, activeStats]);

  const maxTotal = useMemo(() => {
    if (leaderboardData.length === 0) return 0;
    return Math.max(...leaderboardData.map(d => d.total), 0);
  }, [leaderboardData]);

  const dotsData = useMemo(() => {
    const data = [];
    activeStats.forEach((stat, statIndex) => {
      visibleEntities.forEach(entity => {
        const isSelected = selectedIdSet.has(entity.id);
        const isHovered = hoveredId === entity.id;
        data.push({
          xIndex: statIndex, x: stat.name, y: entity.values[stat.id] || 0,
          entityId: entity.id, statName: stat.name, statId: stat.id,
          color: entity.color,
          z: isSelected ? 400 : isHovered ? 280 : 80,
        });
      });
    });
    return data;
  }, [activeStats, visibleEntities, selectedIdSet, hoveredId]);

  const pieData = useMemo(() => {
    if (selectedEntity && selectedEntity.visible) {
      // When an entity is selected: view the entity's stats without viewing the others
      return activeStats.map((stat, statIdx) => {
        const raw = selectedEntity.values[stat.id] || 0;
        return {
          id: stat.id,
          name: stat.name,
          statId: stat.id,
          value: Math.max(raw, 0.1),
          rawValue: raw,
          color: STAT_PALETTE[statIdx % STAT_PALETTE.length],
          isEntityChunk: false,
          isStatComponent: true,
        };
      });
    }

    // Default all entities view: each entity is one chunk
    return visibleEntities.map(entity => {
      const total = entityTotals[entity.id] || 0;
      return {
        id: entity.id,
        name: entity.name,
        value: total > 0 ? total : 1,
        rawValue: total,
        total,
        color: entity.color,
        isEntityChunk: true,
        isStatComponent: false,
      };
    });
  }, [selectedEntity, activeStats, visibleEntities, entityTotals]);

  const allPanelsCollapsed = leftCollapsed && rightCollapsed && bottomCollapsed;

  // ─── Undo / Redo & Clipboard Management (CTRL+Z, CTRL+SHIFT+Z, CTRL+X, CTRL+C, CTRL+V) ───
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const copiedEntitiesRef = useRef([]);
  const lastSnapshotTimeRef = useRef(0);

  const pushUndoSnapshot = useCallback((overrideState) => {
    const snapshot = overrideState || {
      entities: JSON.parse(JSON.stringify(entities)),
      stats: JSON.parse(JSON.stringify(stats)),
      selectedIds: [...selectedIds],
    };
    const last = undoStackRef.current[undoStackRef.current.length - 1];
    if (
      last &&
      JSON.stringify(last.entities) === JSON.stringify(snapshot.entities) &&
      JSON.stringify(last.stats) === JSON.stringify(snapshot.stats)
    ) {
      return;
    }
    undoStackRef.current.push(snapshot);
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
  }, [entities, stats, selectedIds]);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) {
      showToast('Nothing to undo');
      return;
    }
    const currentSnapshot = {
      entities: JSON.parse(JSON.stringify(entities)),
      stats: JSON.parse(JSON.stringify(stats)),
      selectedIds: [...selectedIds],
    };
    redoStackRef.current.push(currentSnapshot);

    const prevSnapshot = undoStackRef.current.pop();
    setEntities(prevSnapshot.entities);
    setStats(prevSnapshot.stats);
    if (prevSnapshot.selectedIds) {
      setSelectedIds(prevSnapshot.selectedIds);
    }
    showToast('Undo: Reverted change (CTRL+Z)');
  }, [entities, stats, selectedIds, showToast]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) {
      showToast('Nothing to redo');
      return;
    }
    const currentSnapshot = {
      entities: JSON.parse(JSON.stringify(entities)),
      stats: JSON.parse(JSON.stringify(stats)),
      selectedIds: [...selectedIds],
    };
    undoStackRef.current.push(currentSnapshot);

    const nextSnapshot = redoStackRef.current.pop();
    setEntities(nextSnapshot.entities);
    setStats(nextSnapshot.stats);
    if (nextSnapshot.selectedIds) {
      setSelectedIds(nextSnapshot.selectedIds);
    }
    showToast('Redo: Reapplied change (CTRL+SHIFT+Z)');
  }, [entities, stats, selectedIds, showToast]);

  const copySelected = useCallback(() => {
    let targetEntities = entities.filter(e => selectedIds.includes(e.id));
    if (targetEntities.length === 0) {
      if (selectedEntity) {
        targetEntities = [selectedEntity];
      } else if (entities.length > 0) {
        targetEntities = [entities[0]];
      } else {
        showToast('No entity selected to copy');
        return;
      }
    }

    copiedEntitiesRef.current = JSON.parse(JSON.stringify(targetEntities));
    try {
      navigator.clipboard.writeText(JSON.stringify(targetEntities, null, 2));
    } catch {
      // Fallback
    }

    const label = targetEntities.length === 1
      ? `"${targetEntities[0].name}"`
      : `${targetEntities.length} entities`;
    showToast(`Copied ${label} (CTRL+C)`);
  }, [entities, selectedIds, selectedEntity, showToast]);

  const cutSelected = useCallback(() => {
    let targetEntities = entities.filter(e => selectedIds.includes(e.id));
    if (targetEntities.length === 0) {
      if (selectedEntity) {
        targetEntities = [selectedEntity];
      } else {
        showToast('No entity selected to cut');
        return;
      }
    }

    pushUndoSnapshot();

    copiedEntitiesRef.current = JSON.parse(JSON.stringify(targetEntities));
    try {
      navigator.clipboard.writeText(JSON.stringify(targetEntities, null, 2));
    } catch {
      // Fallback
    }

    const cutIds = new Set(targetEntities.map(e => e.id));
    setEntities(prev => prev.filter(e => !cutIds.has(e.id)));
    setSelectedIds(prev => prev.filter(id => !cutIds.has(id)));

    const label = targetEntities.length === 1
      ? `"${targetEntities[0].name}"`
      : `${targetEntities.length} entities`;
    showToast(`Cut ${label} (CTRL+X)`);
  }, [entities, selectedIds, selectedEntity, pushUndoSnapshot, showToast]);

  const pasteEntities = useCallback(async () => {
    let toPaste = copiedEntitiesRef.current;

    if (!toPaste || toPaste.length === 0) {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].values) {
            toPaste = parsed;
          } else if (parsed && parsed.values) {
            toPaste = [parsed];
          }
        }
      } catch {
        // Fallback
      }
    }

    if (!toPaste || toPaste.length === 0) {
      showToast('Nothing to paste (Copy with CTRL+C first)');
      return;
    }

    pushUndoSnapshot();

    const newEntities = toPaste.map((entity, i) => {
      const newId = `e_${crypto.randomUUID()}`;
      return {
        ...entity,
        id: newId,
        name: `${entity.name || 'ENT'}_COPY${toPaste.length > 1 ? `_${i + 1}` : ''}`,
        color: getRandomColor(),
        visible: true,
      };
    });

    setEntities(prev => [...prev, ...newEntities]);
    setSelectedIds(newEntities.map(e => e.id));
    showToast(`Pasted ${newEntities.length} ${newEntities.length === 1 ? 'entity' : 'entities'} (CTRL+V)`);
  }, [pushUndoSnapshot, showToast]);

  // ─── Action History Management ───────────────────────────────────────────
  const recordAction = useCallback(({ action, input = '', source = 'User Manual Input', overrideState }) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const formattedTime = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const snapshot = overrideState || {
      entities: JSON.parse(JSON.stringify(entitiesRef.current)),
      stats: JSON.parse(JSON.stringify(statsRef.current)),
      selectedIds: [...selectedIdsRef.current],
      entityThresholds: JSON.parse(JSON.stringify(entityThresholdsRef.current)),
      globalEntityThreshold: { ...globalEntityThresholdRef.current },
    };

    const newEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      dateStr,
      formattedTime,
      action,
      input: String(input),
      source,
      snapshot,
    };

    setActionHistory(prev => [...prev.slice(-1999), newEntry]);
  }, []);

  const restoreActionHistory = useCallback((item) => {
    if (!item?.snapshot) return;
    const { snapshot } = item;
    pushUndoSnapshot();

    if (snapshot.entities) setEntities(snapshot.entities);
    if (snapshot.stats) setStats(snapshot.stats);
    if (snapshot.selectedIds) setSelectedIds(snapshot.selectedIds);
    if (snapshot.entityThresholds) setEntityThresholds(snapshot.entityThresholds);
    if (snapshot.globalEntityThreshold) setGlobalEntityThreshold(snapshot.globalEntityThreshold);

    recordAction({
      action: `Restored: ${item.action}`,
      input: `Snapshot from ${item.formattedTime || item.dateStr}`,
      source: 'User Manual Input',
      overrideState: snapshot,
    });

    showToast(`Restored state to: ${item.action}`);
  }, [pushUndoSnapshot, recordAction, showToast]);

  const clearActionHistory = useCallback(() => {
    setActionHistory([]);
    showToast('Action history cleared');
  }, [showToast]);

  // ─── Threshold Notifications & Analysis ──────────────────────────────────
  const pushThresholdNotification = useCallback(({
    entityId,
    entityName,
    entityColor,
    type,
    statName,
    value,
    threshold,
  }) => {
    if (!thresholdAlertsEnabled) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const id = `notif_${entityId}_${statName || 'TOTAL'}_${type}_${Date.now()}`;

    setThresholdNotifications(prev => {
      const exists = prev.find(p => p.entityId === entityId && p.statName === statName && p.type === type && (Date.now() - p.timestamp < 3000));
      if (exists) return prev;
      return [
        {
          id,
          entityId,
          entityName,
          entityColor,
          type,
          statName,
          value,
          threshold,
          timestamp: Date.now(),
          timeStr,
        },
        ...prev.slice(0, 9),
      ];
    });
  }, [thresholdAlertsEnabled]);

  const toggleAllThresholdAlerts = useCallback(() => {
    setThresholdAlertsEnabled(prev => {
      const next = !prev;
      setMetricThresholdRange(curr => ({ ...curr, enabled: next }));
      showToast(next ? 'All threshold alerts enabled' : 'All threshold alerts disabled');
      return next;
    });
  }, [showToast]);

  const dismissNotification = useCallback((id) => {
    setThresholdNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setThresholdNotifications([]);
  }, []);

  const thresholdAnalysis = useMemo(() => {
    const entityViolations = {};
    if (!thresholdAlertsEnabled) {
      return { entityViolations, totalViolations: 0 };
    }

    entities.forEach(ent => {
      const eThresh = entityThresholds[ent.id] || globalEntityThreshold;
      const hasMin = eThresh?.min !== null && eThresh?.min !== undefined && eThresh.min !== '';
      const hasMax = eThresh?.max !== null && eThresh?.max !== undefined && eThresh.max !== '';
      const minVal = hasMin ? Number(eThresh.min) : null;
      const maxVal = hasMax ? Number(eThresh.max) : null;
      const total = entityTotals[ent.id] || 0;

      if (minVal !== null && total < minVal) {
        if (!entityViolations[ent.id]) entityViolations[ent.id] = { type: null };
        entityViolations[ent.id].type = 'min';
        entityViolations[ent.id].totalViolation = { type: 'min', value: total, threshold: minVal };
      } else if (maxVal !== null && total > maxVal) {
        if (!entityViolations[ent.id]) entityViolations[ent.id] = { type: null };
        if (entityViolations[ent.id].type !== 'min') {
          entityViolations[ent.id].type = 'max';
        }
        entityViolations[ent.id].totalViolation = { type: 'max', value: total, threshold: maxVal };
      }
    });

    return { entityViolations, totalViolations: Object.keys(entityViolations).length };
  }, [entities, entityThresholds, globalEntityThreshold, entityTotals, thresholdAlertsEnabled]);

  const updateEntityThreshold = useCallback((entityId, { min, max }) => {
    pushUndoSnapshot();
    const entity = entities.find(e => e.id === entityId);
    setEntityThresholds(prev => {
      const next = { ...prev };
      if (min === null && max === null) {
        delete next[entityId];
      } else {
        next[entityId] = { min, max };
      }
      return next;
    });

    recordAction({
      action: `Threshold: ${entity?.name || entityId}`,
      input: `Min: ${min ?? 'none'}, Max: ${max ?? 'none'}`,
      source: 'User Manual Input',
    });

    const total = entityTotals[entityId] || 0;
    if (min !== null && total < min) {
      pushThresholdNotification({
        entityId,
        entityName: entity?.name || entityId,
        entityColor: entity?.color,
        type: 'min',
        statName: 'Total Score',
        value: total,
        threshold: min,
      });
    } else if (max !== null && total > max) {
      pushThresholdNotification({
        entityId,
        entityName: entity?.name || entityId,
        entityColor: entity?.color,
        type: 'max',
        statName: 'Total Score',
        value: total,
        threshold: max,
      });
    }

    showToast(`Threshold updated for ${entity?.name || 'entity'}`);
  }, [pushUndoSnapshot, entities, entityTotals, recordAction, pushThresholdNotification, showToast]);

  const updateAllEntitiesThreshold = useCallback(({ min, max }) => {
    pushUndoSnapshot();
    setGlobalEntityThreshold({ min, max });

    recordAction({
      action: `All Entities Threshold`,
      input: `Min: ${min ?? 'none'}, Max: ${max ?? 'none'}`,
      source: 'User Manual Input',
    });

    if (min !== null || max !== null) {
      entities.forEach(ent => {
        const total = entityTotals[ent.id] || 0;
        if (min !== null && total < min) {
          pushThresholdNotification({
            entityId: ent.id,
            entityName: ent.name,
            entityColor: ent.color,
            type: 'min',
            statName: 'Total Score',
            value: total,
            threshold: min,
          });
        } else if (max !== null && total > max) {
          pushThresholdNotification({
            entityId: ent.id,
            entityName: ent.name,
            entityColor: ent.color,
            type: 'max',
            statName: 'Total Score',
            value: total,
            threshold: max,
          });
        }
      });
    }

    showToast('Threshold updated for all entities');
  }, [pushUndoSnapshot, recordAction, entities, entityTotals, pushThresholdNotification, showToast]);

  // ─── Stat CRUD ────────────────────────────────────────────────────
  const getRandomStats = useCallback(() => {
    const values = {};
    for (const stat of stats) values[stat.id] = Math.floor(Math.random() * 101);
    return values;
  }, [stats]);

  const addNewStat = useCallback(() => {
    pushUndoSnapshot();
    const newId = `s_${crypto.randomUUID()}`;
    const newName = `STAT_${String(statsRef.current.length + 1).padStart(2, '0')}`;
    setStats(prev => [
      ...prev,
      { id: newId, name: newName, visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
    ]);
    setEntities(prev => prev.map(entity => ({ ...entity, values: { ...entity.values, [newId]: 0 } })));
    recordAction({
      action: `Added Parameter: ${newName}`,
      input: `ID: ${newId}`,
      source: 'User Manual Input',
    });
  }, [pushUndoSnapshot, recordAction]);

  const addNewFormulaStat = useCallback(() => {
    pushUndoSnapshot();
    const newId = `s_${crypto.randomUUID()}`;
    const nextNum = statsRef.current.length + 1;
    const firstTwo = statsRef.current.slice(0, 2).map(s => s.name);
    const defaultFormula = firstTwo.length >= 2 ? `[${firstTwo[0]}] * [${firstTwo[1]}]` : '[STAT_01] * 1.5';
    const newName = `FX_${String(nextNum).padStart(2, '0')}`;
    setStats(prev => [
      ...prev,
      {
        id: newId,
        name: newName,
        visible: false,
        editing: false,
        iconType: 'icon',
        iconName: 'Calculator',
        isFormula: true,
        formula: defaultFormula,
      },
    ]);
    setEntities(prev => prev.map(entity => ({ ...entity, values: { ...entity.values, [newId]: 0 } })));
    recordAction({
      action: `Added Formula: ${newName}`,
      input: defaultFormula,
      source: 'Formula Engine',
    });
  }, [pushUndoSnapshot, recordAction]);

  const updateStatFormula = useCallback((statId, { isFormula, formula }) => {
    pushUndoSnapshot();
    const stat = statsRef.current.find(s => s.id === statId);
    setStats(prev => prev.map(s => s.id === statId ? { ...s, isFormula, formula } : s));
    recordAction({
      action: `Formula: ${stat?.name || statId}`,
      input: formula || 'none',
      source: 'Formula Engine',
    });
  }, [pushUndoSnapshot, recordAction]);

  const updateStatIcon = useCallback((statId, type, value) => {
    setStats(prev => prev.map(stat => stat.id === statId ? { ...stat, iconType: type, iconName: value } : stat));
    setActiveIconPicker(null);
    setIconSearch('');
  }, []);

  const toggleStatVisibility = useCallback(id => {
    setStats(prev => prev.map(stat => (stat.id === id ? { ...stat, visible: !stat.visible } : stat)));
  }, []);

  const toggleStatDisabled = useCallback(id => {
    pushUndoSnapshot();
    setStats(prev => prev.map(stat => (stat.id === id ? { ...stat, disabled: !stat.disabled } : stat)));
  }, [pushUndoSnapshot]);

  const setEditingStat = useCallback(id => {
    setStats(prev => prev.map(stat => (stat.id === id ? { ...stat, editing: true } : stat)));
  }, []);

  const updateStatName = useCallback((id, newName) => {
    pushUndoSnapshot();
    const cleanName = newName.toUpperCase();
    setStats(prev => prev.map(stat => stat.id === id ? { ...stat, name: cleanName, editing: false } : stat));
    recordAction({
      action: `Renamed Parameter: ${cleanName}`,
      input: `New name: ${cleanName}`,
      source: 'User Manual Input',
    });
  }, [pushUndoSnapshot, recordAction]);

  const deleteStat = useCallback(id => {
    pushUndoSnapshot();
    const stat = statsRef.current.find(s => s.id === id);
    setStats(prev => prev.filter(s => s.id !== id));
    setEntities(prev => prev.map(entity => {
      const values = { ...entity.values };
      delete values[id];
      return { ...entity, values };
    }));
    recordAction({
      action: `Deleted Parameter: ${stat?.name || id}`,
      input: `ID: ${id}`,
      source: 'User Manual Input',
    });
  }, [pushUndoSnapshot, recordAction]);

  const clearFilters = useCallback(() => {
    setStats(prev => prev.map(stat => ({ ...stat, visible: false })));
  }, []);

  const openIconPicker = useCallback((event, statId) => {
    event.stopPropagation();
    setActiveIconPicker({ id: statId, x: event.clientX, y: event.clientY });
  }, []);

  // ─── Entity CRUD ──────────────────────────────────────────────────
  const addNewEntity = useCallback(() => {
    pushUndoSnapshot();
    const id = `e_${crypto.randomUUID()}`;
    const name = `ENT_${String(entitiesRef.current.length + 1).padStart(2, '0')}`;
    const newEnt = { id, name, visible: true, color: getRandomColor(), values: getRandomStats() };
    setEntities(prev => [...prev, newEnt]);
    recordAction({
      action: `Added Entity: ${name}`,
      input: `ID: ${id}`,
      source: 'User Manual Input',
    });
  }, [getRandomStats, pushUndoSnapshot, recordAction]);

  const removeEntity = useCallback(id => {
    pushUndoSnapshot();
    const ent = entitiesRef.current.find(e => e.id === id);
    setEntities(prev => prev.filter(entity => entity.id !== id));
    setSelectedIds(prev => {
      const next = prev.filter(selectedId => selectedId !== id);
      if (next.length <= 1) setMultiSelectMode(false);
      return next;
    });
    recordAction({
      action: `Deleted Entity: ${ent?.name || id}`,
      input: `ID: ${id}`,
      source: 'User Manual Input',
    });
  }, [pushUndoSnapshot, recordAction]);

  const toggleEntityVisibility = useCallback(entityId => {
    setEntities(prev => prev.map(entity => entity.id === entityId ? { ...entity, visible: !entity.visible } : entity));
  }, []);

  const updateStatValue = useCallback((entityId, statId, num, source = 'User Manual Input') => {
    const now = Date.now();
    if (now - lastSnapshotTimeRef.current > 400) {
      pushUndoSnapshot();
      lastSnapshotTimeRef.current = now;
    }
    const targetEntity = entitiesRef.current.find(e => e.id === entityId);
    const targetStat = statsRef.current.find(s => s.id === statId);

    setEntities(prev => prev.map(entity => {
      if (entity.id !== entityId) return entity;
      if (entity.values[statId] === num) return entity;
      return { ...entity, values: { ...entity.values, [statId]: num } };
    }));

    recordAction({
      action: `Updated ${targetEntity?.name || entityId}: ${targetStat?.name || statId}`,
      input: `Value: ${num}`,
      source,
    });

    // Check entity total threshold
    const eThresh = entityThresholdsRef.current[entityId] || globalEntityThresholdRef.current;
    const hasEMin = eThresh?.min !== null && eThresh?.min !== undefined && eThresh.min !== '';
    const hasEMax = eThresh?.max !== null && eThresh?.max !== undefined && eThresh.max !== '';
    if (hasEMin || hasEMax) {
      let newTotal = 0;
      statsRef.current.forEach(s => {
        const v = s.id === statId ? num : (targetEntity?.values?.[s.id] ?? 0);
        if (typeof v === 'number' && !isNaN(v)) newTotal += v;
      });
      if (hasEMin && newTotal < Number(eThresh.min)) {
        pushThresholdNotification({
          entityId,
          entityName: targetEntity?.name || entityId,
          entityColor: targetEntity?.color,
          type: 'min',
          statName: 'Total Score',
          value: newTotal,
          threshold: Number(eThresh.min),
        });
      } else if (hasEMax && newTotal > Number(eThresh.max)) {
        pushThresholdNotification({
          entityId,
          entityName: targetEntity?.name || entityId,
          entityColor: targetEntity?.color,
          type: 'max',
          statName: 'Total Score',
          value: newTotal,
          threshold: Number(eThresh.max),
        });
      }
    }
  }, [pushUndoSnapshot, recordAction, pushThresholdNotification]);

  // ─── Selection ────────────────────────────────────────────────────
  const handleEntitySelection = useCallback(id => {
    if (multiSelectMode) {
      setSelectedIds(prev => {
        const next = prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id];
        if (next.length === 0) setMultiSelectMode(false);
        return next;
      });
    } else {
      setSelectedIds(prev => (prev.length === 1 && prev[0] === id ? [] : [id]));
    }
    setActivePieIndex(null);
  }, [multiSelectMode]);

  const handleMouseDownItem = useCallback((id, e) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressStartPos.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      setMultiSelectMode(true);
      setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
      isDragging.current = true;
    }, 400);
  }, []);

  const handleMouseMoveItem = useCallback((e) => {
    if (longPressTimer.current) {
      const dx = e.clientX - longPressStartPos.current.x;
      const dy = e.clientY - longPressStartPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const handleMouseUpItem = useCallback(id => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isDragging.current) handleEntitySelection(id);
    isDragging.current = false;
  }, [handleEntitySelection]);

  const handleMouseEnterItem = useCallback(id => {
    setHoveredId(id);
    if (isDragging.current && multiSelectMode) {
      setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    }
  }, [multiSelectMode]);

  const handleMouseLeaveItem = useCallback(() => setHoveredId(null), []);

  const toggleAllPanels = useCallback(() => {
    const t = !allPanelsCollapsed;
    setLeftCollapsed(t);
    setRightCollapsed(t);
    setBottomCollapsed(t);
  }, [allPanelsCollapsed]);

  // ─── Pan / zoom ───────────────────────────────────────────────────
  const handleWheel = useCallback(event => {
    event.preventDefault();
    const isXOnly = (event.ctrlKey || event.metaKey) && !event.shiftKey;
    const isYOnly = event.shiftKey && !(event.ctrlKey || event.metaKey);
    const delta = event.deltaY * -0.001;

    if (isXOnly) {
      pendingZoomRef.current.x += delta;
    } else if (isYOnly) {
      pendingZoomRef.current.y += delta;
    } else {
      // Default: zoom both X and Y
      pendingZoomRef.current.x += delta;
      pendingZoomRef.current.y += delta;
    }

    if (!zoomFrameRef.current) {
      zoomFrameRef.current = requestAnimationFrame(() => {
        zoomFrameRef.current = null;
        const deltaX = pendingZoomRef.current.x;
        const deltaY = pendingZoomRef.current.y;
        pendingZoomRef.current = { x: 0, y: 0 };
        if (deltaX !== 0 || deltaY !== 0) {
          setZoom(prev => {
            const currentX = typeof prev === 'object' && prev !== null ? (prev.x ?? 1) : (Number(prev) || 1);
            const currentY = typeof prev === 'object' && prev !== null ? (prev.y ?? 1) : (Number(prev) || 1);
            return {
              x: Math.min(Math.max(Number((currentX + deltaX).toFixed(3)), 0.2), 6),
              y: Math.min(Math.max(Number((currentY + deltaY).toFixed(3)), 0.2), 6),
            };
          });
        }
      });
    }
  }, []);

  const handleChartMouseDown = useCallback(event => {
    if (event.button !== 2) return;
    event.preventDefault();
    isPanning.current = true;
    pendingOffsetRef.current = offsetRef.current;
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  }, []);

  const resetView = useCallback(() => {
    if (visMode === 'parallel' || visMode === 'dots') {
      setZoom({ x: 0.85, y: 0.85 });
    } else {
      setZoom({ x: 1, y: 1 });
    }
    setOffset({ x: 0, y: 0 });
    pendingOffsetRef.current = { x: 0, y: 0 };
    setActivePieIndex(null);
  }, [visMode]);

  // ─── Projects ─────────────────────────────────────────────────────
  const saveProject = useCallback((name) => {
    if (!name.trim()) return;
    const newProject = {
      id: crypto.randomUUID(),
      name: name.trim(),
      data: { stats, entities, leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, visMode, zoom, offset },
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => {
      const updated = [...prev, newProject];
      localStorage.setItem('statvault-projects', JSON.stringify(updated));
      return updated;
    });
    setSelectedProjectId(newProject.id);
    showToast(`Project "${newProject.name}" saved`);
  }, [stats, entities, leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, visMode, zoom, offset, showToast]);

  const loadProject = useCallback((id) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const { data } = project;
    if (data.stats) setStats(data.stats);
    if (data.entities) setEntities(data.entities);
    if (data.leftCollapsed !== undefined) setLeftCollapsed(data.leftCollapsed);
    if (data.rightCollapsed !== undefined) setRightCollapsed(data.rightCollapsed);
    if (data.bottomCollapsed !== undefined) setBottomCollapsed(data.bottomCollapsed);
    if (data.selectedIds) setSelectedIds(data.selectedIds);
    if (data.visMode) setVisMode(data.visMode === 'line' ? 'parallel' : data.visMode);
    if (data.zoom) {
      if (typeof data.zoom === 'object' && data.zoom !== null) {
        setZoom({ x: data.zoom.x ?? 1, y: data.zoom.y ?? 1 });
      } else {
        const n = Number(data.zoom) || 1;
        setZoom({ x: n, y: n });
      }
    }
    if (data.offset) setOffset(data.offset);
    setSelectedProjectId(id);
    showToast(`Loaded "${project.name}"`);
  }, [projects, showToast]);

  const deleteProject = useCallback((id) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('statvault-projects', JSON.stringify(updated));
      return updated;
    });
    if (selectedProjectId === id) setSelectedProjectId(null);
    showToast('Project deleted');
  }, [selectedProjectId, showToast]);

  // ─── Quick Save Project (CTRL+S) ──────────────────────────────────
  const quickSaveProject = useCallback(() => {
    if (selectedProjectId) {
      const existing = projects.find(p => p.id === selectedProjectId);
      if (existing) {
        const updated = projects.map(p => (
          p.id === selectedProjectId
            ? {
                ...p,
                data: { stats, entities, leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, visMode, zoom, offset },
                updatedAt: new Date().toISOString(),
              }
            : p
        ));
        setProjects(updated);
        localStorage.setItem('statvault-projects', JSON.stringify(updated));
        showToast(`Project "${existing.name}" saved (CTRL+S)`);
        return;
      }
    }
    const projName = `Project ${projects.length + 1}`;
    const newProj = {
      id: crypto.randomUUID(),
      name: projName,
      data: { stats, entities, leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, visMode, zoom, offset },
      createdAt: new Date().toISOString(),
    };
    const updated = [...projects, newProj];
    setProjects(updated);
    setSelectedProjectId(newProj.id);
    localStorage.setItem('statvault-projects', JSON.stringify(updated));
    showToast(`Saved as "${projName}" (CTRL+S)`);
  }, [selectedProjectId, projects, stats, entities, leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, visMode, zoom, offset, showToast]);

  // ─── Hide Selected Entities or Panels (CTRL+H) ────────────────────
  const hideSelectedOrPanels = useCallback(() => {
    if (selectedIds.length > 0) {
      pushUndoSnapshot();
      const allSelectedHidden = selectedIds.every(id => {
        const ent = entities.find(e => e.id === id);
        return ent && !ent.visible;
      });
      const targetVisible = allSelectedHidden;
      setEntities(prev => prev.map(ent => (
        selectedIds.includes(ent.id) ? { ...ent, visible: targetVisible } : ent
      )));
      showToast(targetVisible ? `Unhid ${selectedIds.length} ${selectedIds.length === 1 ? 'entity' : 'entities'} (CTRL+H)` : `Hidden ${selectedIds.length} ${selectedIds.length === 1 ? 'entity' : 'entities'} (CTRL+H)`);
    } else {
      toggleAllPanels();
      showToast(allPanelsCollapsed ? 'Restored panels (CTRL+H)' : 'Hidden panels (CTRL+H)');
    }
  }, [selectedIds, entities, pushUndoSnapshot, showToast, toggleAllPanels, allPanelsCollapsed]);

  // ─── Delete Selected Entities (Backspace or Delete) ───────────────
  const deleteSelected = useCallback(() => {
    if (selectedIds.length > 0) {
      pushUndoSnapshot();
      const count = selectedIds.length;
      setEntities(prev => prev.filter(ent => !selectedIds.includes(ent.id)));
      setSelectedIds([]);
      setMultiSelectMode(false);
      showToast(`Deleted ${count} ${count === 1 ? 'entity' : 'entities'} (Delete)`);
    }
  }, [selectedIds, pushUndoSnapshot, showToast]);

  // ─── Global Keyboard Shortcuts ────────────────────────────────────
  // (CTRL+Z, CTRL+SHIFT+Z, CTRL+X, CTRL+C, CTRL+V, CTRL+S, CTRL+H, Backspace/Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      );

      // Backspace or Delete to delete selected entities
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (!isTyping && selectedIds.length > 0) {
          e.preventDefault();
          deleteSelected();
          return;
        }
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      const key = e.key.toLowerCase();

      // Save: CTRL + S
      if (key === 's' && !e.shiftKey) {
        e.preventDefault();
        quickSaveProject();
        return;
      }

      // Hide: CTRL + H
      if (key === 'h' && !e.shiftKey) {
        e.preventDefault();
        hideSelectedOrPanels();
        return;
      }

      // Undo: CTRL + Z (without Shift)
      if (key === 'z' && !e.shiftKey) {
        if (isTyping) return;
        e.preventDefault();
        undo();
        return;
      }

      // Redo: CTRL + SHIFT + Z or CTRL + Y
      if ((key === 'z' && e.shiftKey) || (key === 'y' && !e.shiftKey)) {
        if (isTyping) return;
        e.preventDefault();
        redo();
        return;
      }

      // Copy: CTRL + C
      if (key === 'c' && !e.shiftKey) {
        if (isTyping && activeEl.selectionStart !== activeEl.selectionEnd) {
          return;
        }
        if (!isTyping || activeEl.selectionStart === activeEl.selectionEnd) {
          e.preventDefault();
          copySelected();
        }
        return;
      }

      // Cut: CTRL + X
      if (key === 'x' && !e.shiftKey) {
        if (isTyping && activeEl.selectionStart !== activeEl.selectionEnd) {
          return;
        }
        if (!isTyping) {
          e.preventDefault();
          cutSelected();
        }
        return;
      }

      // Paste: CTRL + V
      if (key === 'v' && !e.shiftKey) {
        if (isTyping) return;
        e.preventDefault();
        pasteEntities();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copySelected, cutSelected, pasteEntities, quickSaveProject, hideSelectedOrPanels, deleteSelected, selectedIds.length]);

  // ─── Export / import ─────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify({ stats, entities }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const filename = `statvault_export_${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('JSON exported');
    setShowExportDropdown(false);
  }, [stats, entities, showToast]);

  const handleImport = useCallback(event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const json = JSON.parse(e.target?.result || '');
        if (Array.isArray(json.stats) && Array.isArray(json.entities)) {
          setStats(json.stats);
          setEntities(json.entities);
          setSelectedIds([]);
          setMonitorPage(0);
          showToast('JSON imported');
        }
      } catch {
        console.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
    setShowImportDropdown(false);
  }, [showToast]);

  const handleCsvExport = useCallback(() => {
    if (!stats.length || !entities.length) { showToast('No data to export'); return; }
    const rows = [['STAT', ...entities.map(e => e.name)]];
    stats.forEach(stat => {
      const row = [stat.name];
      entities.forEach(entity => row.push(entity.values[stat.id] ?? 0));
      rows.push(row);
    });
    const csvContent = rows.map(row => row.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statvault_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('CSV exported');
    setShowExportDropdown(false);
  }, [stats, entities, showToast]);

  /**
   * Fix 1 — CSV import logic was inverted.
   *
   * The exported format is: STAT, ENT_01, ENT_02, ...
   *   - Column 0 of header = "STAT" (label)
   *   - Columns 1..N of header = entity names
   *   - Each data row: cells[0] = stat name, cells[1..N] = values
   *
   * The old code mistakenly built `newStats` from `header.slice(1)`
   * (entity column names) and then tried to match rows to those "stat"
   * names — which always failed because the names were entity names.
   *
   * Fix: collect stat names from cells[0] of each data row; use header
   * columns 1..N for entity names; map values by index.
   */
  const handleCsvImport = useCallback(event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result || '';
        const lines = text.trim().split('\n');
        if (lines.length < 2) { showToast('Invalid CSV: no data rows'); return; }

        const parseLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (inQuotes) {
              if (char === '"') {
                if (line[i + 1] === '"') { current += '"'; i++; }
                else inQuotes = false;
              } else { current += char; }
            } else {
              if (char === '"') inQuotes = true;
              else if (char === ',') { result.push(current.trim()); current = ''; }
              else current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const header = parseLine(lines[0]);
        // Entity names come from header columns 1..N
        const entityNames = header.slice(1).map(c => c.trim());

        // Stat names come from cells[0] of each data row
        const statRowNames = lines
          .slice(1)
          .map(line => parseLine(line)[0]?.trim())
          .filter(Boolean);

        const newStats = statRowNames.map((name, idx) => ({
          id: `s_${crypto.randomUUID()}`,
          name: name.toUpperCase() || `STAT_${idx + 1}`,
          visible: false,
          editing: false,
          iconType: 'icon',
          iconName: 'Hashtag',
        }));

        const newEntities = entityNames.map(name => ({
          id: `e_${crypto.randomUUID()}`,
          name: name.toUpperCase(),
          visible: true,
          color: getRandomColor(),
          values: {},
        }));

        // Initialise all values to 0
        newEntities.forEach(ent => { newStats.forEach(s => { ent.values[s.id] = 0; }); });

        // Populate values using index-based mapping (avoids name-mismatch bugs)
        for (let i = 1; i < lines.length; i++) {
          const cells = parseLine(lines[i]);
          if (cells.length !== header.length) continue;
          const stat = newStats[i - 1]; // row i-1 corresponds to stat index i-1
          if (!stat) continue;
          for (let j = 1; j < cells.length; j++) {
            const entity = newEntities[j - 1];
            if (entity) entity.values[stat.id] = parseFloat(cells[j]) || 0;
          }
        }

        setStats(newStats);
        setEntities(newEntities);
        setSelectedIds([]);
        setMonitorPage(0);
        showToast('CSV imported (replaced)');
      } catch (err) {
        console.error('CSV import error', err);
        showToast('Failed to import CSV');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
    setShowImportDropdown(false);
  }, [showToast]);

  // ─── PNG export ───────────────────────────────────────────────────
  const [isDownloading, setIsDownloading] = useState(false);
  const handlePngExport = useCallback(() => setShowPngExport(true), []);
  const handlePngCancel = useCallback(() => setShowPngExport(false), []);

  const handlePngCopy = useCallback(async () => {
    if (!exportAreaRef.current) return;
    setIsCopying(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(exportAreaRef.current, { backgroundColor: '#080808', pixelRatio: 2, cacheBust: true });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setShowPngExport(false);
      showToast('PNG copied to clipboard');
    } catch (err) {
      console.error('Failed to copy PNG to clipboard:', err);
      showToast('Failed to copy PNG');
    } finally {
      setIsCopying(false);
    }
  }, [showToast]);

  const handlePngDownload = useCallback(async () => {
    if (!exportAreaRef.current) return;
    setIsDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(exportAreaRef.current, { backgroundColor: '#080808', pixelRatio: 2, cacheBust: true });
      const link = document.createElement('a');
      link.download = `statvault_${visMode}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      showToast('PNG downloaded');
    } catch (err) {
      console.error('Failed to download PNG:', err);
      showToast('Failed to download PNG');
    } finally {
      setIsDownloading(false);
    }
  }, [showToast, visMode]);

  // ─── Global mouse events (resize / pan) ───────────────────────────
  useEffect(() => {
    const handleMouseMoveGlobal = event => {
      if (isResizingLeft.current && !leftCollapsed) {
        setLeftWidth(Math.max(180, Math.min(400, event.clientX)));
      }
      if (isResizingRight.current && !rightCollapsed) {
        setRightWidth(Math.max(240, Math.min(500, window.innerWidth - event.clientX)));
      }
      if (isResizingSplitRef.current) {
        const aside = rightAsideRef.current;
        if (aside) {
          const rect = aside.getBoundingClientRect();
          const offsetValue = event.clientY - rect.top;
          setRightSplit(Math.max(20, Math.min(80, (offsetValue / rect.height) * 100)));
        }
      }
      if (isPanning.current) {
        const dx = event.clientX - lastMousePos.current.x;
        const dy = event.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: event.clientX, y: event.clientY };
        const startOffset = pendingOffsetRef.current || offsetRef.current;
        pendingOffsetRef.current = {
          x: Math.min(Math.max(startOffset.x + dx, -400), 400),
          y: Math.min(Math.max(startOffset.y + dy, -400), 400),
        };
        if (!panFrameRef.current) {
          panFrameRef.current = requestAnimationFrame(() => {
            panFrameRef.current = null;
            if (pendingOffsetRef.current) setOffset(pendingOffsetRef.current);
          });
        }
      }
    };

    const handleMouseUpGlobal = () => {
      isResizingLeft.current = false;
      isResizingRight.current = false;
      isResizingSplitRef.current = false;
      isPanning.current = false;
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      if (panFrameRef.current) cancelAnimationFrame(panFrameRef.current);
      if (zoomFrameRef.current) cancelAnimationFrame(zoomFrameRef.current);
    };
  }, [leftCollapsed, rightCollapsed]);

  const resetChartSettings = useCallback(() => {
    setChartSettings({
      hideLabels: false,
      hideScales: false,
      // Parallel Coordinates Settings (independent horizontal/vertical labels & axes)
      parallelShowXAxisTitle: true,
      parallelXAxisTitle: 'METRICS',
      parallelXTitleDistance: 'ultra-close',
      parallelShowYAxisTitle: true,
      parallelYAxisTitle: 'VALUE',
      parallelYTitleDistance: 'ultra-close',
      parallelYTitleOrientation: 'vertical',
      parallelHideStatNames: false,
      parallelLabelOrientation: 'horizontal',
      parallelHideScaleNumbers: false,
      parallelCurveType: 'linear',
      parallelFillOpacity: 0.25,
      radarGridShape: 'polygon',
      dotsShowGridBands: true,
      pieDonutHole: true,
      piePaddingAngle: 4,
      tableDensity: 'standard',
      tableShowHeatmap: true,
      tableStatColWidth: 160,
      tableEntityColWidth: 130,
      tableScale: 1,
      leaderboardShowValues: true,
      pieShowComponents: false,
      leaderboardShowComponents: false,
    });
    showToast('Settings reset to defaults');
  }, [showToast]);

  // ─── Close dropdowns on outside click ─────────────────────────────
  useEffect(() => {
    const handleClickOutside = () => {
      setShowExportDropdown(false);
      setShowImportDropdown(false);
      setShowProjectsDropdown(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // ─── Persist state to localStorage ────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        theme,
        leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, monitorPage,
        registryView, visMode, zoom, offset, leftWidth, rightWidth, rightSplit,
        multiSelectMode, activePieIndex, stats, entities, chartSettings,
        entityThresholds, globalEntityThreshold, metricThresholdRange,
        actionHistory, thresholdNotifications,
      }));
    }, 200);
    return () => clearTimeout(timer);
  }, [
    theme,
    leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, monitorPage,
    registryView, visMode, zoom, offset, leftWidth, rightWidth, rightSplit,
    multiSelectMode, activePieIndex, stats, entities, chartSettings,
    entityThresholds, globalEntityThreshold, metricThresholdRange,
    actionHistory, thresholdNotifications,
  ]);

  return {
    // Theme & Mode
    theme, setTheme, toggleTheme,
    // Panel state
    leftCollapsed, setLeftCollapsed,
    rightCollapsed, setRightCollapsed,
    bottomCollapsed, setBottomCollapsed,
    leftWidth, rightWidth, rightSplit,
    isResizingLeft, isResizingRight,
    rightAsideRef,
    handleStartSplitResize,
    registryView, setRegistryView,
    visMode, setVisMode: handleSetVisMode,
    allPanelsCollapsed, toggleAllPanels,
    // Selection / interaction
    selectedIds, setSelectedIds,
    hoveredId, setHoveredId,
    multiSelectMode,
    monitorPage, setMonitorPage,
    activePieIndex, setActivePieIndex,
    // Viewport
    zoom, offset,
    handleWheel, handleChartMouseDown, resetView,
    // Icon picker
    activeIconPicker, setActiveIconPicker,
    iconSearch, setIconSearch,
    filteredIcons,
    // Data
    stats, setStats,
    entities: computedEntities,
    rawEntities: entities,
    setEntities,
    // Computed
    visibleEntities, anyFilterActive, activeStats, selectedIdSet,
    chartData, entityTotals, sortedEntities, topPerformers,
    selectedEntity, totalPages, paginatedEntities,
    leaderboardData, maxTotal, dotsData, pieData,
    // Stat CRUD
    addNewStat, addNewFormulaStat, updateStatFormula, updateStatIcon, toggleStatVisibility, toggleStatDisabled, setEditingStat,
    updateStatName, deleteStat, clearFilters, openIconPicker,
    // Entity CRUD
    addNewEntity, removeEntity, toggleEntityVisibility, updateStatValue,
    // Selection handlers
    handleEntitySelection,
    handleMouseDownItem, handleMouseMoveItem, handleMouseUpItem,
    handleMouseEnterItem, handleMouseLeaveItem,
    // Export/import/projects dropdowns
    showExportDropdown, setShowExportDropdown,
    showImportDropdown, setShowImportDropdown,
    showProjectsDropdown, setShowProjectsDropdown,
    handleExport, handleImport, handleCsvExport, handleCsvImport,
    // Projects
    projects, selectedProjectId,
    saveProject, quickSaveProject, loadProject, deleteProject,
    // History & Clipboard & Actions (CTRL+Z, CTRL+SHIFT+Z, CTRL+X, CTRL+C, CTRL+V, CTRL+S, CTRL+H, Delete)
    undo, redo, copySelected, cutSelected, pasteEntities, hideSelectedOrPanels, deleteSelected,
    // Thresholds & Triggers (Registry & Entities)
    entityThresholds, setEntityThresholds, updateEntityThreshold,
    globalEntityThreshold, setGlobalEntityThreshold, updateAllEntitiesThreshold,
    metricThresholdRange, setMetricThresholdRange,
    thresholdAlertsEnabled, setThresholdAlertsEnabled, toggleAllThresholdAlerts,
    thresholdAnalysis,
    thresholdNotifications, pushThresholdNotification, dismissNotification, clearAllNotifications,
    // Action History
    actionHistory, recordAction, restoreActionHistory, clearActionHistory,
    // Chart Settings
    chartSettings, setChartSettings,
    isSettingsOpen, setIsSettingsOpen,
    resetChartSettings,
    // PNG export
    showPngExport, isCopying, isDownloading,
    showFiltersExport, setShowFiltersExport,
    showEntitiesExport, setShowEntitiesExport,
    exportAreaRef,
    handlePngExport, handlePngCopy, handlePngDownload, handlePngCancel,
    // Toast
    toast,
  };
};
