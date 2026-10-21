import React, { memo, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus, Settings2, LayoutGrid, StretchHorizontal, List as ListIcon,
  Trash2, Eye, EyeOff, Target as TargetIcon, AlertTriangle, AlertCircle,
  Calculator, X, Sliders, ChevronDown,
} from 'lucide-react';
import { renderStatIcon } from '../constants/icons.jsx';
import { flagRegistryMetrics, flagMetricOutOfRange, getOutOfRangeStyle } from '../utils/helpers.js';
import { evaluateMathExpression } from '../utils/mathParser.js';
import CalculationAutocomplete from './CalculationAutocomplete.jsx';

/**
 * Free-typing stat value input with NA support & inline mathematical operations.
 * Allows expressions like '45 * 1.2', '100 - 15', '+10', '+15%', '(25 + 35) / 2', 'sqrt(144)'.
 */
const StatValueInput = memo(({
  isLight = false,
  entityId,
  statId,
  value,
  onCommit,
  isNA,
  allStats = [],
  allEntities = [],
  selectedEntity,
}) => {
  const [raw, setRaw] = useState(isNA ? 'N/A' : String(value ?? 0));
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef(null);

  // Keep in sync when the parent value changes externally (e.g. entity switch).
  useEffect(() => {
    if (!isFocused) {
      setRaw(isNA ? 'N/A' : String(value ?? 0));
    }
  }, [value, isNA, isFocused]);

  // Build evaluation context with all parameters, global aggregates, and cross-entity values
  const evalContext = useMemo(() => {
    if (!selectedEntity) return {};
    const ctx = {};

    // 1. Stats of this entity
    allStats.forEach(s => {
      const v = selectedEntity.values[s.id];
      const num = typeof v === 'number' && !isNaN(v) ? v : 0;
      ctx[s.id] = num;
      ctx[s.name] = num;
    });

    // 2. Cross-entity references
    allEntities.forEach(ent => {
      let entTotal = 0;
      allStats.forEach(s => {
        const v = ent.values[s.id];
        const num = typeof v === 'number' && !isNaN(v) ? v : 0;
        entTotal += num;
        ctx[`${ent.name}.${s.name}`] = num;
        ctx[`${ent.name}.${s.id}`] = num;
        ctx[`${ent.id}.${s.name}`] = num;
        ctx[`${ent.id}.${s.id}`] = num;
      });
      ctx[`${ent.name}.TOTAL`] = entTotal;
      ctx[`${ent.id}.TOTAL`] = entTotal;
    });

    // 3. Global aggregates
    allStats.forEach(s => {
      const vals = allEntities
        .map(e => e.values[s.id])
        .filter(v => typeof v === 'number' && !isNaN(v));
      const count = vals.length || 1;
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / count : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const min = vals.length ? Math.min(...vals) : 0;

      [s.id, s.name].forEach(p => {
        ctx[`AVG_ALL_${p}`] = avg;
        ctx[`MAX_ALL_${p}`] = max;
        ctx[`MIN_ALL_${p}`] = min;
        ctx[`SUM_ALL_${p}`] = sum;
      });
    });

    return ctx;
  }, [allStats, allEntities, selectedEntity]);

  // Compute live preview of math evaluation while typing
  const livePreview = useMemo(() => {
    if (isNA || !isFocused) return null;
    const currentNum = typeof value === 'number' && !isNaN(value) ? value : 0;
    return evaluateMathExpression(raw, currentNum, evalContext);
  }, [raw, value, isNA, isFocused, evalContext]);

  const commit = useCallback(() => {
    if (isNA) return;
    const currentNum = typeof value === 'number' && !isNaN(value) ? value : 0;
    const res = evaluateMathExpression(raw, currentNum, evalContext);
    if (res.success) {
      onCommit(entityId, statId, res.result);
      setRaw(String(res.result));
    } else {
      setRaw(String(value ?? 0)); // revert on invalid input
    }
    setIsFocused(false);
    setShowAutocomplete(false);
  }, [entityId, evalContext, isNA, onCommit, raw, statId, value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commit();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setRaw(String(value ?? 0));
      setIsFocused(false);
      setShowAutocomplete(false);
      inputRef.current?.blur();
    }
  };

  const updateCursor = (e) => {
    const pos = e.target.selectionStart || 0;
    setCursorPos(pos);
  };

  const isFormula = livePreview?.isFormula;

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        disabled={isNA}
        value={isNA ? 'N/A' : raw}
        onChange={e => {
          setRaw(e.target.value);
          updateCursor(e);
          setShowAutocomplete(true);
        }}
        onFocus={e => {
          setIsFocused(true);
          updateCursor(e);
          setShowAutocomplete(true);
        }}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        onBlur={() => {
          // Delay blur to allow autocomplete click to register
          setTimeout(() => commit(), 150);
        }}
        onKeyDown={handleKeyDown}
        className={`w-20 border rounded px-2 py-0.5 text-[10px] font-mono font-bold text-right transition-all duration-200 ease-out focus:outline-none ${
          isNA
            ? isLight
              ? 'border-black/[0.06] text-zinc-400 bg-black/[0.02] cursor-not-allowed select-none'
              : 'border-white/5 text-zinc-600 bg-white/[0.01] cursor-not-allowed select-none'
            : isFormula && livePreview?.success
              ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10'
              : isFormula && !livePreview?.success
                ? 'border-amber-500/50 text-amber-500 bg-amber-500/10'
                : isLight
                  ? 'bg-white border-black/10 text-rose-600 focus:border-rose-500 shadow-xs'
                  : 'bg-white/[0.02] border-white/5 text-rose-400 focus:border-rose-500/40'
        }`}
        title={
          isNA
            ? 'Parameter marked as N/A'
            : 'Type a number, math expression, or cross-entity formula (e.g. +10, 45*1.2, [ATK]*1.5, AVG(STAT_01))'
        }
      />

      {/* Autocomplete dropdown for inline calculations */}
      <CalculationAutocomplete
        isLight={isLight}
        inputRef={inputRef}
        value={raw}
        cursorPos={cursorPos}
        allStats={allStats}
        allEntities={allEntities}
        currentEntity={selectedEntity}
        isOpen={isFocused && showAutocomplete}
        onClose={() => setShowAutocomplete(false)}
        position="top"
        onSelect={(newText, newPos) => {
          setRaw(newText);
          setCursorPos(newPos);
          setShowAutocomplete(false);
          setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(newPos, newPos);
          }, 0);
        }}
      />

      {/* Floating calculation preview badge when an expression is being typed */}
      {isFocused && isFormula && !showAutocomplete && (
        <div className={`absolute top-full right-0 mt-1 z-50 border rounded-md shadow-xl px-2 py-1 text-[9px] font-mono flex items-center gap-1.5 whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-none ${
          isLight ? 'bg-[#f0f1f4] border-black/10 text-zinc-800' : 'bg-[#121212] border-white/10 text-zinc-200'
        }`}>
          <Calculator size={10} className="text-zinc-500 shrink-0" />
          {livePreview.success ? (
            <span className="text-emerald-500 font-bold">
              = {livePreview.result}
              <span className="text-zinc-500 text-[7.5px] ml-1 font-normal">(Enter ↵)</span>
            </span>
          ) : (
            <span className="text-amber-500 text-[8px]">
              {livePreview.error}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
StatValueInput.displayName = 'StatValueInput';

/**
 * Fix 4 — `setRightSplit` removed from props (it was accepted but never used).
 * Fix 5 — `index` removed from the registry `.map()` callback.
 * Fix 6 — `isResizingSplit` ref no longer passed as a prop; replaced with
 *          `onStartSplitResize` callback to satisfy react-hooks/immutability.
 */
const RightPanel = memo(({
  theme = 'dark',
  rightSplit,
  onStartSplitResize,   // Fix 6: callback replaces the ref prop
  rightAsideRef,
  registryView,
  setRegistryView,
  sortedEntities,
  selectedIdSet,
  entityTotals,
  handleEntitySelection,
  setHoveredId,
  addNewEntity,
  selectedEntity,
  setEntities,
  removeEntity,
  toggleEntityVisibility,
  stats,
  setStats,
  openIconPicker,
  updateStatValue,
  onEditFormula,
  metricThresholdRange,
  setMetricThresholdRange,
  thresholdAlertsEnabled = true,
  toggleAllThresholdAlerts,
  entityThresholds = {},
  globalEntityThreshold = {},
  thresholdAnalysis = {},
  onOpenEntityThreshold,
  onOpenAllEntitiesThreshold,
  updateEntityThreshold,
  onOpenStatThreshold,
}) => {
  const allAlertsEnabled = thresholdAlertsEnabled !== false && metricThresholdRange?.enabled !== false;

  // Flag out-of-range metrics across the registry
  const registryAnalysis = useMemo(() => {
    return flagRegistryMetrics(sortedEntities, stats, {
      ...metricThresholdRange,
      enabled: allAlertsEnabled,
    });
  }, [sortedEntities, stats, metricThresholdRange, allAlertsEnabled]);

  const totalActiveAlerts = useMemo(() => {
    const regCount = registryAnalysis?.totalFlagged || 0;
    const entCount = Object.keys(thresholdAnalysis?.entityViolations || {}).length;
    return regCount + entCount;
  }, [registryAnalysis?.totalFlagged, thresholdAnalysis?.entityViolations]);

  const handleToggleAllAlerts = useCallback(() => {
    if (toggleAllThresholdAlerts) {
      toggleAllThresholdAlerts();
    } else if (setMetricThresholdRange) {
      setMetricThresholdRange(prev => ({ ...prev, enabled: !prev.enabled }));
    }
  }, [toggleAllThresholdAlerts, setMetricThresholdRange]);

  const selectedEntityFlags = selectedEntity
    ? registryAnalysis.entityFlags[selectedEntity.id]
    : null;

  // Handler to update per-stat min and max bounds
  const updateStatBounds = useCallback((statId, newMin, newMax) => {
    if (!setStats) return;
    setStats(prev => prev.map(s => {
      if (s.id !== statId) return s;
      return {
        ...s,
        min: newMin !== undefined && newMin !== null && !isNaN(Number(newMin)) ? Number(newMin) : s.min,
        max: newMax !== undefined && newMax !== null && !isNaN(Number(newMax)) ? Number(newMax) : s.max,
      };
    }));
  }, [setStats]);

  const isLight = theme === 'light';
  const [showMathHelp, setShowMathHelp] = useState(false);
  const [openParamDropdownStatId, setOpenParamDropdownStatId] = useState(null);

  // Batch math transformations across all active stats of selected entity
  const applyBatchToEntity = useCallback((transformFn) => {
    if (!selectedEntity || !setEntities) return;
    setEntities(prev =>
      prev.map(entity => {
        if (entity.id !== selectedEntity.id) return entity;
        const newValues = { ...entity.values };
        stats.forEach(stat => {
          const currentVal = newValues[stat.id];
          if (typeof currentVal === 'number' && !isNaN(currentVal)) {
            newValues[stat.id] = transformFn(currentVal);
          }
        });
        return { ...entity, values: newValues };
      })
    );
  }, [selectedEntity, setEntities, stats]);

  return (
    <aside
      ref={rightAsideRef}
      id="right-aside"
      className={`border-l flex flex-col shrink-0 relative z-20 overflow-hidden h-full transition-colors duration-200 ${
        isLight ? 'bg-[#ebedef] border-black/[0.08]' : 'bg-[#0a0a0a] border-white/5'
      }`}
    >
      {/* Registry section */}
      <div style={{ height: `${rightSplit}%` }} className="flex flex-col min-h-0 overflow-hidden">
        <div className={`h-[84px] border-b shrink-0 p-4 relative flex flex-col justify-between transition-colors duration-200 ${
          isLight ? 'bg-black/[0.03] border-black/[0.08]' : 'bg-black/20 border-white/5'
        }`}>
          <div className="flex justify-between items-center h-6">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold tracking-widest uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>Registry</span>
              {allAlertsEnabled && registryAnalysis.totalFlagged > 0 && (
                <span
                  className="text-[7.5px] font-black uppercase text-amber-500 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded shadow-xs"
                  title={`${registryAnalysis.totalFlagged} metric values fall outside [${metricThresholdRange.min} - ${metricThresholdRange.max}]`}
                >
                  {registryAnalysis.totalFlagged} Flagged
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenAllEntitiesThreshold}
                className={`p-1.5 rounded transition-all duration-200 ease-out cursor-pointer ${
                  globalEntityThreshold?.min !== null || globalEntityThreshold?.max !== null
                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                    : isLight
                      ? 'bg-black/[0.05] hover:bg-rose-500/15 hover:text-rose-600 text-zinc-600'
                      : 'bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-zinc-400'
                }`}
                title="Set Threshold Trigger for All Entities (Global)"
              >
                <Sliders size={13} />
              </button>
              <button
                type="button"
                onClick={addNewEntity}
                className={`p-1.5 rounded transition-all duration-200 ease-out cursor-pointer ${
                  isLight
                    ? 'bg-black/[0.05] hover:bg-rose-500/15 hover:text-rose-600 text-zinc-600'
                    : 'bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-zinc-400'
                }`}
                title="Add Entity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            {[
              { id: 'grid', i: LayoutGrid },
              { id: 'normal', i: StretchHorizontal },
              { id: 'list', i: ListIcon },
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setRegistryView(view.id)}
                className={`p-1.5 rounded transition-all duration-200 ease-out cursor-pointer ${
                  registryView === view.id
                    ? isLight ? 'text-rose-600 bg-rose-500/15' : 'text-rose-500 bg-rose-500/10'
                    : isLight ? 'text-zinc-400 hover:text-zinc-800 hover:bg-black/5' : 'text-zinc-700 hover:text-zinc-400 hover:bg-white/5'
                }`}
              >
                <view.i size={16} />
              </button>
            ))}
          </div>
        </div>

        <div
          className={`flex-1 overflow-y-auto custom-scrollbar ${
            registryView === 'grid'
              ? 'grid grid-cols-4 auto-rows-min gap-1 p-1 content-start'
              : registryView === 'normal'
                ? 'space-y-2 p-2'
                : 'flex flex-col'
          }`}
        >
          {sortedEntities.map(entity => {
            const isSelected = selectedIdSet.has(entity.id);
            const totalScore = entityTotals[entity.id] || 0;
            const flagCount = registryAnalysis.getEntityFlagCount(entity.id);
            const isFlagged = allAlertsEnabled && flagCount > 0;

            const entityViolation = allAlertsEnabled ? thresholdAnalysis?.entityViolations?.[entity.id] : null;
            const isMinViolated = allAlertsEnabled && entityViolation?.type === 'min';
            const isMaxViolated = allAlertsEnabled && entityViolation?.type === 'max';
            const hasThreshold = entityThresholds?.[entity.id]?.min !== null || entityThresholds?.[entity.id]?.max !== null;

            return (
              <div
                key={entity.id}
                onClick={() => handleEntitySelection(entity.id)}
                onMouseEnter={() => setHoveredId(entity.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: isSelected
                    ? `${entity.color}35`
                    : isMinViolated
                      ? 'rgba(127, 29, 29, 0.25)'
                      : isMaxViolated
                        ? 'rgba(120, 53, 15, 0.25)'
                        : isLight ? 'rgba(255, 255, 255, 0.75)' : `${entity.color}05`,
                  borderColor: isSelected
                    ? `${entity.color}80`
                    : isMinViolated
                      ? 'rgba(239, 68, 68, 0.5)'
                      : isMaxViolated
                        ? 'rgba(234, 179, 8, 0.5)'
                        : isFlagged
                          ? 'rgba(245, 158, 11, 0.4)'
                          : isLight ? 'rgba(0, 0, 0, 0.08)' : `${entity.color}15`,
                  opacity: entity.visible ? 1 : 0.4,
                }}
                className={`group relative cursor-pointer border transition-all duration-200 ease-out animate-fade-in ${
                  isLight ? 'hover:bg-white hover:border-black/[0.12] shadow-xs' : 'hover-bg-white active-bg-white'
                } ${
                  registryView === 'grid'
                    ? 'aspect-square flex flex-col justify-center items-center rounded-sm p-0'
                    : registryView === 'normal'
                      ? 'p-2.5 rounded-lg flex flex-col gap-2 w-full'
                      : 'p-2 rounded-sm flex items-center'
                }`}
              >
                {/* Out-of-range flag badge for grid view */}
                {registryView === 'grid' && isFlagged && (
                  <span
                    className="absolute top-1 left-1 px-1 py-0.2 rounded bg-amber-500 text-black text-[7px] font-black z-10 shadow-sm"
                    title={`${flagCount} out-of-range metric(s)`}
                  >
                    !{flagCount}
                  </span>
                )}

                {/* Hover action buttons for grid and compact list view */}
                {registryView !== 'normal' && (
                  <div className="absolute top-1 right-1 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onOpenEntityThreshold?.(entity);
                      }}
                      className={`p-1 rounded transition-colors ${
                        hasThreshold
                          ? 'text-rose-500 !opacity-100'
                          : isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-500 hover:text-white hover-bg-white'
                      }`}
                      title="Configure Entity Threshold Trigger"
                    >
                      <Sliders size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); toggleEntityVisibility(entity.id); }}
                      className={`p-1 rounded transition-colors ${
                        isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-500 hover:text-white hover-bg-white'
                      }`}
                      title={entity.visible ? 'Hide entity' : 'Show entity'}
                    >
                      {entity.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                )}

                {/* ── Normal View: Entity Header & All Stats Listed ── */}
                {registryView === 'normal' ? (
                  <>
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: entity.color }} />

                        {isMinViolated && (
                          <span className="relative flex h-2 w-2 shrink-0" title="Entity violates minimum threshold!">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        {isMaxViolated && (
                          <span className="relative flex h-2 w-2 shrink-0" title="Entity violates maximum threshold!">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                          </span>
                        )}

                        <span className={`text-[10.5px] uppercase font-black truncate tracking-wide ${
                          isMinViolated
                            ? 'text-red-500'
                            : isMaxViolated
                              ? 'text-yellow-600'
                              : isSelected
                                ? isLight ? 'text-zinc-950 font-black' : 'text-white font-black'
                                : isLight ? 'text-zinc-800 font-bold' : 'text-zinc-300 font-bold'
                        }`}>
                          {entity.name}
                        </span>

                        {isFlagged && (
                          <span
                            className="text-[7px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40 shrink-0"
                            title={`${flagCount} metric(s) outside range [${metricThresholdRange?.min}-${metricThresholdRange?.max}]`}
                          >
                            !{flagCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-mono font-black tracking-tight ${
                          isMinViolated
                            ? 'text-red-500'
                            : isMaxViolated
                              ? 'text-yellow-600'
                              : isLight ? 'text-rose-600' : 'text-rose-400'
                        }`} title="Total Score">
                          {totalScore}
                        </span>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onOpenEntityThreshold?.(entity);
                            }}
                            className={`p-1 rounded transition-colors ${
                              hasThreshold
                                ? 'text-rose-500 !opacity-100'
                                : isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-500 hover:text-white hover:bg-white/10'
                            }`}
                            title="Configure Entity Threshold Trigger"
                          >
                            <Sliders size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); toggleEntityVisibility(entity.id); }}
                            className={`p-1 rounded transition-colors ${
                              isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-500 hover:text-white hover:bg-white/10'
                            }`}
                            title={entity.visible ? 'Hide entity' : 'Show entity'}
                          >
                            {entity.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* All Stats Listed for this Entity */}
                    <div className={`pt-2 border-t w-full space-y-1 ${
                      isLight ? 'border-black/[0.06]' : 'border-white/5'
                    }`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 w-full">
                        {stats.map(stat => {
                          const rawVal = entity.values?.[stat.id];
                          const isNA = rawVal === null || rawVal === undefined || rawVal === 'N/A';
                          const numVal = isNA ? null : Number(rawVal);
                          const sMin = typeof stat.min === 'number' ? stat.min : 0;
                          const sMax = typeof stat.max === 'number' ? stat.max : 100;
                          const sRange = sMax > sMin ? sMax - sMin : 1;
                          const progressPct = !isNA && typeof numVal === 'number'
                            ? Math.min(100, Math.max(0, ((numVal - sMin) / sRange) * 100))
                            : 0;

                          const flagResult = !isNA && typeof numVal === 'number'
                            ? flagMetricOutOfRange(numVal, metricThresholdRange?.min ?? 30, metricThresholdRange?.max ?? 85)
                            : { isOutOfRange: false };
                          const isOutOfRange = !isNA && allAlertsEnabled && flagResult.isOutOfRange;

                          return (
                            <div
                              key={stat.id}
                              className={`flex flex-col gap-0.5 px-2 py-1 rounded text-[8px] border transition-all ${
                                isNA
                                  ? isLight ? 'bg-black/[0.02] border-black/[0.04] text-zinc-400' : 'bg-white/[0.01] border-white/5 text-zinc-600'
                                  : isOutOfRange
                                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-500 shadow-xs'
                                    : isLight
                                      ? 'bg-white/80 border-black/[0.06] text-zinc-700 shadow-2xs hover:bg-white'
                                      : 'bg-white/[0.03] border-white/5 text-zinc-300 hover:bg-white/[0.06]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 w-full">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span className={`shrink-0 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    {renderStatIcon(stat, 9)}
                                  </span>
                                  <span className="truncate font-semibold uppercase">{stat.name}</span>
                                  {stat.isFormula && (
                                    <span className="text-[6.5px] text-rose-500 font-mono font-bold">fx</span>
                                  )}
                                </div>

                                <span className={`font-mono font-bold tabular-nums shrink-0 ${
                                  isNA
                                    ? 'opacity-50'
                                    : isOutOfRange
                                      ? 'text-amber-500 font-black'
                                      : isLight ? 'text-zinc-900' : 'text-white'
                                }`}>
                                  {isNA ? 'N/A' : (typeof rawVal === 'number' ? Math.round(rawVal * 100) / 100 : rawVal)}
                                </span>
                              </div>

                              {/* Progress bar showing value within per-stat bounds */}
                              {!isNA && (
                                <div className={`h-1 w-full rounded-full overflow-hidden ${
                                  isLight ? 'bg-black/[0.06]' : 'bg-white/5'
                                }`}>
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${progressPct}%`,
                                      backgroundColor: isOutOfRange ? '#f59e0b' : entity.color,
                                      opacity: 0.85,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : registryView === 'grid' ? (
                  <div className="flex flex-col items-center gap-0.5 whitespace-nowrap">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
                    <span className={`text-[9px] uppercase truncate transition-colors duration-200 ease-out ${
                      isMinViolated
                        ? 'text-red-500 font-black'
                        : isMaxViolated
                          ? 'text-yellow-600 font-black'
                          : isSelected
                            ? isLight ? 'text-zinc-950 font-black' : 'text-white font-bold'
                            : isLight ? 'text-zinc-800 font-bold' : 'text-zinc-500 font-bold'
                    }`}>
                      {entity.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 w-full pr-12 whitespace-nowrap">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />

                    {isMinViolated && (
                      <span className="relative flex h-2 w-2 shrink-0" title="Entity violates minimum threshold!">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    {isMaxViolated && (
                      <span className="relative flex h-2 w-2 shrink-0" title="Entity violates maximum threshold!">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                    )}

                    <span className={`text-[9px] uppercase truncate transition-colors duration-200 ease-out flex-1 ${
                      isMinViolated
                        ? 'text-red-500 font-black'
                        : isMaxViolated
                          ? 'text-yellow-600 font-black'
                          : isSelected
                            ? isLight ? 'text-zinc-950 font-black' : 'text-white font-bold'
                            : isLight ? 'text-zinc-800 font-bold' : 'text-zinc-500 font-bold'
                    }`}>
                      {entity.name}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isFlagged && (
                        <span
                          className="text-[7.5px] font-black px-1 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40"
                          title={`${flagCount} metric(s) outside range`}
                        >
                          !{flagCount}
                        </span>
                      )}
                      <span className={`text-[12px] font-black tracking-tighter ${
                        isMinViolated
                          ? 'text-red-500'
                          : isMaxViolated
                            ? 'text-yellow-600'
                            : 'text-rose-500'
                      }`}>
                        {totalScore}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fix 6: onStartSplitResize callback instead of mutating ref prop */}
      <div
        className="h-1 hover:bg-rose-500/20 cursor-row-resize shrink-0 group"
        onMouseDown={onStartSplitResize}
      />

      {/* Parameters section */}
      <div
        className={`p-4 flex flex-col min-h-0 overflow-hidden transition-colors duration-200 ${
          isLight ? 'bg-[#ebedef]' : 'bg-black/20'
        }`}
        style={{ height: `${100 - rightSplit}%` }}
      >
        <div className={`p-2 mb-3 border-b flex items-center justify-between shrink-0 transition-colors duration-200 ${
          isLight ? 'border-black/[0.08]' : 'border-white/5'
        }`}>
          <div className="flex items-center gap-2">
            <Settings2 size={12} className={isLight ? 'text-zinc-500' : 'text-zinc-600'} />
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Parameters</span>
            <button
              onClick={() => setShowMathHelp(prev => !prev)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono transition-colors cursor-pointer ${
                showMathHelp
                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                  : isLight
                    ? 'bg-black/[0.05] text-zinc-600 hover:text-zinc-900 border border-black/[0.06]'
                    : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-white/5'
              }`}
              title="Inline Math Operations: type 40*1.2, +10, -15%, sqrt(144) directly into stat inputs"
            >
              <Calculator size={9} />
              <span>fx</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleToggleAllAlerts}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[7.5px] font-black uppercase tracking-tight transition-all duration-200 cursor-pointer shadow-xs border shrink-0 ${
              allAlertsEnabled
                ? isLight
                  ? 'bg-amber-500/15 border-amber-500/35 text-amber-700 hover:bg-amber-500/25'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                : isLight
                  ? 'bg-black/[0.04] border-black/[0.08] text-zinc-400 hover:bg-black/[0.07] hover:text-zinc-600'
                  : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
            }`}
            title={
              allAlertsEnabled
                ? `All threshold alerts are active (${totalActiveAlerts} total alert${totalActiveAlerts !== 1 ? 's' : ''} triggered). Click to toggle all alerts off.`
                : 'All threshold alerts are disabled. Click to toggle all alerts on.'
            }
          >
            <AlertTriangle
              size={8.5}
              className={`shrink-0 transition-opacity ${allAlertsEnabled ? 'opacity-100 text-amber-500' : 'opacity-40 text-zinc-400'}`}
            />
            <span>
              {allAlertsEnabled
                ? totalActiveAlerts > 0
                  ? `All Alerts: ON (${totalActiveAlerts})`
                  : 'All Alerts: ON'
                : 'All Alerts: OFF'}
            </span>
          </button>
        </div>

        {/* Math Expressions Guide & Quick Batch Actions */}
        {showMathHelp && (
          <div className={`mb-3 border rounded-md p-2.5 text-[9px] space-y-2 shrink-0 animate-in fade-in slide-in-from-top-1 duration-150 shadow-lg ${
            isLight ? 'bg-white border-black/10 text-zinc-700' : 'bg-[#121212] border-white/10 text-zinc-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold flex items-center gap-1.5 text-[9px] ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                <Calculator size={11} className="text-rose-500" />
                Inline Math in Inputs
              </span>
              <button
                onClick={() => setShowMathHelp(false)}
                className={`p-0.5 cursor-pointer ${isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <X size={11} />
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-1.5 text-[8px] font-mono ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              <div className={`p-1.5 rounded border space-y-0.5 ${isLight ? 'bg-zinc-50 border-black/[0.06]' : 'bg-black/40 border-white/5'}`}>
                <div className={`text-[7px] font-sans font-bold uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Arithmetic</div>
                <div>45 * 1.2 <span className="text-emerald-500 font-bold">→ 54</span></div>
                <div>(20+40)/2 <span className="text-emerald-500 font-bold">→ 30</span></div>
                <div>2^6 <span className="text-emerald-500 font-bold">→ 64</span></div>
              </div>
              <div className={`p-1.5 rounded border space-y-0.5 ${isLight ? 'bg-zinc-50 border-black/[0.06]' : 'bg-black/40 border-white/5'}`}>
                <div className={`text-[7px] font-sans font-bold uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Relative & Functions</div>
                <div>+10 <span className="text-emerald-500 font-bold">→ add 10</span></div>
                <div>+15% <span className="text-emerald-500 font-bold">→ +15%</span></div>
                <div>sqrt(144) <span className="text-emerald-500 font-bold">→ 12</span></div>
              </div>
            </div>

            {selectedEntity && (
              <div className={`pt-1.5 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/5'}`}>
                <div className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Batch Transform ({selectedEntity.name})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: '+10 All', fn: val => val + 10 },
                    { label: '+10% All', fn: val => Math.round(val * 1.1) },
                    { label: '-10% All', fn: val => Math.round(val * 0.9) },
                    { label: 'x2 All', fn: val => val * 2 },
                    { label: '/2 All', fn: val => Math.round(val / 2) },
                    { label: 'Round All', fn: val => Math.round(val) },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyBatchToEntity(btn.fn)}
                      className={`px-1.5 py-0.5 rounded text-[7.5px] font-mono transition-colors cursor-pointer border ${
                        isLight
                          ? 'bg-black/[0.04] hover:bg-rose-500/15 hover:text-rose-600 border-black/[0.06] text-zinc-700'
                          : 'bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border-white/5 text-zinc-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedEntity ? (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar animate-fade-in">
            {/* Out-of-range summary banner for selected entity */}
            {selectedEntityFlags?.count > 0 && allAlertsEnabled && (
              <div className={`border rounded p-2 flex items-center justify-between text-[8px] font-black uppercase shadow-xs shrink-0 ${
                isLight
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-800'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              }`}>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={11} className={isLight ? 'text-amber-600 shrink-0' : 'text-amber-500 shrink-0'} />
                  <span>{selectedEntityFlags.count} Out-of-Range Metric{selectedEntityFlags.count > 1 ? 's' : ''}</span>
                </div>
                <span className={`font-mono text-[7.5px] ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  {selectedEntityFlags.lowCount > 0 ? `${selectedEntityFlags.lowCount} Low Threshold Alert` : ''}
                  {selectedEntityFlags.lowCount > 0 && selectedEntityFlags.highCount > 0 ? ' • ' : ''}
                  {selectedEntityFlags.highCount > 0 ? `${selectedEntityFlags.highCount} High Threshold Alert` : ''}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <label className={`text-[8px] font-black uppercase tracking-widest ${
                isLight ? 'text-zinc-600' : 'text-zinc-500'
              }`}>ID Signature</label>
              <div className="flex gap-2 h-8">
                <input
                  value={selectedEntity.name}
                  onChange={e =>
                    setEntities(prev =>
                      prev.map(entity =>
                        entity.id === selectedEntity.id
                          ? { ...entity, name: e.target.value.toUpperCase() }
                          : entity
                      )
                    )
                  }
                  className={`flex-1 rounded px-2 text-[10px] font-bold uppercase focus:outline-none transition-all duration-200 ease-out border ${
                    isLight
                      ? 'bg-white/80 border-black/10 text-zinc-900 focus:border-rose-500 focus:bg-white shadow-2xs'
                      : 'bg-white/[0.02] border-white/5 text-white focus:border-rose-500/40'
                  }`}
                />
                <div
                  className={`w-8 relative rounded border overflow-hidden ${
                    isLight ? 'border-black/10' : 'border-white/5'
                  }`}
                  style={{ backgroundColor: selectedEntity.color }}
                >
                  <input
                    type="color"
                    value={selectedEntity.color}
                    onChange={e =>
                      setEntities(prev =>
                        prev.map(entity =>
                          entity.id === selectedEntity.id
                            ? { ...entity, color: e.target.value }
                            : entity
                        )
                      )
                    }
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => removeEntity(selectedEntity.id)}
                  className={`w-8 h-8 rounded border flex items-center justify-center transition-all duration-200 ease-out cursor-pointer ${
                    isLight
                      ? 'border-black/10 text-zinc-600 hover:bg-rose-500/15 hover:text-rose-600 hover:border-rose-500/30'
                      : 'border-white/5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20'
                  }`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Entity Threshold Parameters */}
            <div className={`space-y-1.5 p-2.5 rounded-lg border transition-colors ${
              isLight ? 'bg-white/70 border-black/[0.08] shadow-xs' : 'bg-black/40 border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders size={11} className={isLight ? 'text-rose-600' : 'text-rose-400'} />
                  <span className={`text-[8px] font-black uppercase tracking-wider ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}>
                    Threshold Triggers ({selectedEntity.name})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenEntityThreshold?.(selectedEntity)}
                  className={`text-[7.5px] font-bold uppercase cursor-pointer ${
                    isLight ? 'text-rose-600 hover:text-rose-700' : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  Popup ↗
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className={`text-[7.5px] font-bold uppercase flex items-center gap-1 mb-1 ${
                    isLight ? 'text-red-600' : 'text-red-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    Low Limit (Red Alert)
                  </label>
                  <input
                    type="number"
                    value={entityThresholds?.[selectedEntity.id]?.min ?? ''}
                    onChange={e => {
                      const val = e.target.value.trim() === '' ? null : Number(e.target.value);
                      updateEntityThreshold?.(selectedEntity.id, {
                        min: isNaN(val) ? null : val,
                        max: entityThresholds?.[selectedEntity.id]?.max ?? null,
                      });
                    }}
                    placeholder="None"
                    className={`w-full rounded px-2 py-1 text-[9px] font-mono focus:outline-none border ${
                      isLight
                        ? 'bg-white/90 border-red-500/30 text-zinc-900 focus:border-red-500 shadow-2xs'
                        : 'bg-white/[0.02] border-red-500/30 text-white focus:border-red-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[7.5px] font-bold uppercase flex items-center gap-1 mb-1 ${
                    isLight ? 'text-amber-700' : 'text-yellow-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    High Limit (Yellow Alert)
                  </label>
                  <input
                    type="number"
                    value={entityThresholds?.[selectedEntity.id]?.max ?? ''}
                    onChange={e => {
                      const val = e.target.value.trim() === '' ? null : Number(e.target.value);
                      updateEntityThreshold?.(selectedEntity.id, {
                        min: entityThresholds?.[selectedEntity.id]?.min ?? null,
                        max: isNaN(val) ? null : val,
                      });
                    }}
                    placeholder="None"
                    className={`w-full rounded px-2 py-1 text-[9px] font-mono focus:outline-none border ${
                      isLight
                        ? 'bg-white/90 border-amber-500/30 text-zinc-900 focus:border-amber-500 shadow-2xs'
                        : 'bg-white/[0.02] border-yellow-500/30 text-white focus:border-yellow-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {stats.map(stat => {
                const rawValue = selectedEntity.values[stat.id];
                const isNA = rawValue === null || rawValue === undefined || rawValue === 'N/A';
                const numericValue = isNA ? 0 : Number(rawValue);

                const flagResult = flagMetricOutOfRange(numericValue, metricThresholdRange?.min ?? 30, metricThresholdRange?.max ?? 85);
                const isFlagged = !isNA && allAlertsEnabled && flagResult.isOutOfRange;
                const outStyle = isFlagged ? getOutOfRangeStyle(flagResult) : null;

                const statMin = typeof stat.min === 'number' ? stat.min : 0;
                const statMax = typeof stat.max === 'number' ? stat.max : 100;
                const statFlagInfo = registryAnalysis?.metricFlags?.[stat.id];
                const hasThresholdBreach = Boolean(statFlagInfo && statFlagInfo.count > 0);
                const isParamDropdownOpen = openParamDropdownStatId === stat.id && hasThresholdBreach;

                // Slider bounds respect per-stat min/max, dynamically expanding if current input is outside bounds
                const effectiveMin = Math.min(statMin, !isNA && typeof numericValue === 'number' && !isNaN(numericValue) ? Math.floor(numericValue) : statMin);
                const effectiveMax = Math.max(statMax, !isNA && typeof numericValue === 'number' && !isNaN(numericValue) ? Math.ceil(numericValue) : statMax, effectiveMin + 1);

                return (
                  <div
                    key={stat.id}
                    style={isFlagged ? { borderColor: outStyle?.borderColor, backgroundColor: outStyle?.bgColor } : {}}
                    className={`flex flex-col gap-1.5 p-2 rounded-lg border transition-all duration-200 ease-out ${
                      isNA
                        ? isLight
                          ? 'bg-black/[0.02] border-black/[0.04] opacity-75'
                          : 'bg-white/[0.01] border-white/5 opacity-75'
                        : isFlagged
                          ? 'shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          : isLight
                            ? 'bg-white/70 border-black/[0.06] hover:bg-white hover:border-black/[0.12] shadow-xs'
                            : 'bg-white/[0.02] border-white/5 hover-bg-white active-bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div
                          className={`cursor-pointer transition-colors shrink-0 ${
                            isLight ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-600 opacity-70 hover:text-white'
                          }`}
                          onClick={e => openIconPicker(e, stat.id)}
                          title="Click to customize icon"
                        >
                          {renderStatIcon(stat, 10)}
                        </div>

                        <span className={`text-[9px] uppercase truncate ${
                          isNA
                            ? isLight ? 'text-zinc-400 line-through' : 'text-zinc-600 line-through'
                            : isFlagged
                              ? isLight ? 'text-zinc-950 font-bold' : 'text-white font-bold'
                              : isLight ? 'text-zinc-800 font-bold' : 'text-zinc-400 font-bold'
                        }`}>
                          {stat.name}
                        </span>

                        {/* Threshold breach indicator button with dropdown trigger */}
                        {hasThresholdBreach && (
                          <button
                            type="button"
                            onClick={() => setOpenParamDropdownStatId(prev => prev === stat.id ? null : stat.id)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-tight transition-all cursor-pointer shadow-xs border shrink-0 ${
                              statFlagInfo.lowCount > 0 && statFlagInfo.highCount > 0
                                ? isLight
                                  ? 'bg-amber-500/15 text-amber-700 border-amber-500/35 hover:bg-amber-500/25'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                                : statFlagInfo.lowCount > 0
                                  ? isLight
                                    ? 'bg-red-500/15 text-red-700 border-red-500/35 hover:bg-red-500/25'
                                    : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                                  : isLight
                                    ? 'bg-amber-500/15 text-amber-700 border-amber-500/35 hover:bg-amber-500/25'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                            }`}
                            title={`${statFlagInfo.count} entity(ies) crossing threshold limits for ${stat.name}. Click to view.`}
                          >
                            <AlertTriangle size={8.5} className="shrink-0" />
                            <span>!{statFlagInfo.count}</span>
                            <ChevronDown size={8} className={`transition-transform duration-200 ${isParamDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                        )}

                        {/* Formula indicator or quick trigger */}
                        {stat.isFormula ? (
                          <button
                            type="button"
                            onClick={() => onEditFormula?.(stat)}
                            className={`px-1.5 py-0.5 rounded text-[7.5px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer truncate max-w-[110px] ${
                              isLight
                                ? 'text-rose-600 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20'
                                : 'text-rose-400 bg-rose-500/15 border-rose-500/30 hover:bg-rose-500/25'
                            }`}
                            title={`Computed by formula: ${stat.formula} (Click to edit)`}
                          >
                            <span className="font-black text-rose-500">fx</span>
                            <span className="truncate opacity-80">{stat.formula}</span>
                          </button>
                        ) : null}

                        {isFlagged && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter shrink-0"
                            style={{ backgroundColor: outStyle?.badgeColor, color: '#000' }}
                            title={outStyle?.label}
                          >
                            {outStyle?.badgeText}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* N/A Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isNA) {
                              const restoreVal = typeof stat.min === 'number' && stat.min > 0 ? stat.min : 50;
                              updateStatValue(selectedEntity.id, stat.id, restoreVal);
                            } else {
                              updateStatValue(selectedEntity.id, stat.id, null);
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider transition-all duration-150 border cursor-pointer ${
                            isNA
                              ? isLight
                                ? 'bg-rose-500/15 border-rose-500/30 text-rose-600'
                                : 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                              : isLight
                                ? 'bg-black/[0.04] border-black/[0.06] text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.08]'
                                : 'bg-white/5 border-white/5 text-zinc-600 hover:text-zinc-400 hover:bg-white/10'
                          }`}
                          title={isNA ? 'Click to re-enable parameter (unmark N/A)' : 'Toggle N/A (Not Applicable)'}
                        >
                          N/A
                        </button>

                        {/* Computed display or free-typing input */}
                        {stat.isFormula ? (
                          <div
                            onClick={() => onEditFormula?.(stat)}
                            className={`w-20 border rounded px-2 py-0.5 text-[10px] font-mono font-bold text-right cursor-pointer transition-all tabular-nums flex items-center justify-between ${
                              isLight
                                ? 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40 text-rose-700'
                                : 'bg-rose-500/10 border-rose-500/25 hover:border-rose-500/50 text-rose-300'
                            }`}
                            title={`Calculated by formula: ${stat.formula}. Click to edit formula.`}
                          >
                            <span className="text-[7.5px] font-black text-rose-500 opacity-75">fx</span>
                            <span>{isNA ? 'N/A' : (typeof rawValue === 'number' ? Math.round(rawValue * 100) / 100 : '—')}</span>
                          </div>
                        ) : (
                          <StatValueInput
                            isLight={isLight}
                            entityId={selectedEntity.id}
                            statId={stat.id}
                            value={rawValue}
                            isNA={isNA}
                            allStats={stats}
                            allEntities={sortedEntities}
                            selectedEntity={selectedEntity}
                            onCommit={updateStatValue}
                          />
                        )}
                      </div>
                    </div>

                    {/* Value Range Slider */}
                    <div className="flex items-center pt-0.5 px-0.5">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        disabled={isNA || stat.isFormula}
                        value={isNA ? 0 : numericValue}
                        onChange={e => updateStatValue(selectedEntity.id, stat.id, Number(e.target.value))}
                        className={`w-full h-1 rounded-lg appearance-none transition-all ${
                          isLight ? 'bg-black/10' : 'bg-white/10'
                        } ${
                          isNA || stat.isFormula ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
                        }`}
                        style={{
                          accentColor: isNA ? '#71717a' : (selectedEntity.color || '#f43f5e'),
                        }}
                        title={
                          stat.isFormula
                            ? `Computed via formula: ${stat.formula}. Adjust source parameters to change value.`
                            : isNA
                              ? 'Parameter is N/A'
                              : `Adjust ${stat.name}: ${numericValue}`
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center text-center ${
            isLight ? 'opacity-30 text-zinc-600' : 'opacity-20 text-zinc-400'
          }`}>
            <TargetIcon size={32} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Idle</p>
          </div>
        )}
      </div>
    </aside>
  );
});

RightPanel.displayName = 'RightPanel';
export default RightPanel;
