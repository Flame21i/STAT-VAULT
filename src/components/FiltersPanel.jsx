import React, { memo, useState, useMemo } from 'react';
import {
  Plus, FilterX, Edit3, Trash2, Calculator, Eye, EyeOff, Sliders, AlertTriangle, ChevronDown, X,
} from 'lucide-react';
import { renderStatIcon } from '../constants/icons.jsx';
import ActionHistory from './ActionHistory.jsx';
import { flagRegistryMetrics } from '../utils/helpers.js';

const FiltersPanel = memo(({
  theme = 'dark',
  stats,
  anyFilterActive,
  clearFilters,
  addNewStat,
  onEditFormula,
  toggleStatVisibility,
  toggleStatDisabled,
  openIconPicker,
  updateStatName,
  setEditingStat,
  deleteStat,
  actionHistory = [],
  onRestoreAction,
  onClearActionHistory,
  onOpenStatThreshold,
  entities = [],
  metricThresholdRange,
  onSelectEntity,
}) => {
  const isLight = theme === 'light';
  const [openDropdownStatId, setOpenDropdownStatId] = useState(null);

  // Analyze which entities cross threshold limits per stat
  const registryAnalysis = useMemo(() => {
    return flagRegistryMetrics(entities, stats, metricThresholdRange);
  }, [entities, stats, metricThresholdRange]);

  return (
    <aside className={`border-r flex flex-col shrink-0 relative z-20 overflow-hidden h-full transition-colors duration-200 ${
      isLight ? 'bg-[#ebedef] border-black/[0.08]' : 'bg-[#0a0a0a] border-white/5'
    }`}>
      <div className={`p-4 border-b flex justify-between items-center shrink-0 h-14 whitespace-nowrap transition-colors duration-200 ${
        isLight ? 'bg-black/[0.03] border-black/[0.08]' : 'bg-black/20 border-white/5'
      }`}>
        <span className={`text-[9px] font-bold tracking-widest uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>FILTERS</span>
        <div className="flex items-center gap-1">
          {anyFilterActive && (
            <button
              onClick={clearFilters}
              className={`p-1.5 rounded transition-all duration-200 ease-out cursor-pointer ${
                isLight ? 'text-zinc-500 hover:text-rose-600 hover:bg-rose-500/10' : 'text-zinc-400 hover:text-rose-500 hover:bg-rose-500/20'
              }`}
              title="Clear Filters"
            >
              <FilterX size={14} />
            </button>
          )}
          <button
            onClick={addNewStat}
            className={`p-1.5 rounded transition-all duration-200 ease-out cursor-pointer ${
              isLight
                ? 'bg-black/[0.05] hover:bg-rose-500/15 hover:text-rose-600 text-zinc-600'
                : 'bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-zinc-400'
            }`}
            title="Add Parameter"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {stats.map(stat => {
          const flagInfo = registryAnalysis?.metricFlags?.[stat.id];
          const hasThresholdBreach = Boolean(flagInfo && flagInfo.count > 0);
          const isDropdownOpen = openDropdownStatId === stat.id;

          return (
            <div key={stat.id} className="flex flex-col">
              <div
                onClick={() => {
                  if (stat.disabled) {
                    toggleStatDisabled?.(stat.id);
                  } else {
                    toggleStatVisibility(stat.id);
                  }
                }}
                className={`group relative flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-200 ease-out animate-fade-in ${
                  stat.disabled
                    ? isLight ? 'opacity-40 bg-black/[0.02] border-black/[0.05]' : 'opacity-40 bg-black/40 border-white/5'
                    : stat.visible
                      ? isLight
                        ? 'bg-rose-500/12 border-rose-500/25 text-rose-900 uppercase shadow-xs'
                        : 'bg-rose-500/15 border-rose-500/30 text-white uppercase'
                      : isLight
                        ? 'bg-white/70 border-black/[0.06] text-zinc-600 hover:bg-white hover:border-black/[0.12] shadow-xs'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10'
                } ${anyFilterActive && !stat.visible && !stat.disabled ? 'opacity-30' : ''} whitespace-nowrap`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ease-out ${
                    stat.disabled
                      ? isLight ? 'bg-black/[0.03] border-black/[0.05] opacity-50 text-zinc-400' : 'bg-white/[0.02] border-white/5 opacity-50 text-zinc-500'
                      : stat.visible
                        ? isLight ? 'bg-rose-500/25 border-rose-500/35 text-rose-600 shadow-xs' : 'bg-rose-500/25 border-rose-500/35 text-rose-300'
                        : isLight ? 'bg-white border-black/[0.1] text-zinc-800 hover:border-black/[0.2] shadow-xs' : 'bg-white/10 border-white/15 text-zinc-100 hover:border-white/30 hover:bg-white/15'
                  }`}
                  onClick={e => openIconPicker(e, stat.id)}
                >
                  {renderStatIcon(stat, 12)}
                </div>

                {stat.editing ? (
                  <input
                    autoFocus
                    className={`border text-[10px] w-full font-bold uppercase focus:outline-none px-1.5 py-0.5 rounded animate-fade-in ${
                      isLight ? 'bg-white border-rose-400 text-zinc-900' : 'bg-zinc-900 border-rose-500 text-white'
                    }`}
                    defaultValue={stat.name}
                    onClick={e => e.stopPropagation()}
                    onBlur={e => updateStatName(stat.id, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') updateStatName(stat.id, e.target.value); }}
                  />
                ) : (
                  <span className={`text-[9.5px] uppercase tracking-tight truncate flex-1 transition-colors duration-200 ease-out flex items-center gap-1.5 ${
                    stat.disabled
                      ? 'line-through text-zinc-400/50'
                      : stat.visible
                        ? isLight
                          ? 'font-medium text-rose-950'
                          : 'font-medium text-white'
                        : isLight
                          ? 'font-normal text-zinc-600 hover:text-zinc-950'
                          : 'font-normal text-zinc-400 hover:text-zinc-200'
                  }`}>
                    <span className="truncate">{stat.name}</span>
                    {stat.isFormula && (
                      <span className={`px-1 py-0.2 rounded text-[7px] font-mono font-bold shrink-0 ${
                        isLight ? 'text-rose-600 bg-rose-500/15' : 'text-rose-400 bg-rose-500/20'
                      }`}>
                        fx
                      </span>
                    )}
                  </span>
                )}

                {/* Only delete, rename, visibility and special dropdown button visible outside dropdown */}
                <div className="flex items-center gap-1">
                  {/* Visibility Button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      toggleStatDisabled?.(stat.id);
                    }}
                    className={`p-1 rounded transition-colors duration-200 ease-out cursor-pointer ${
                      stat.disabled
                        ? 'text-amber-500 hover:text-amber-600'
                        : isLight
                          ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5'
                          : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={stat.disabled ? 'Enable Parameter' : 'Disable Parameter'}
                  >
                    {stat.disabled ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>

                  {/* Rename Button */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setEditingStat(stat.id); }}
                    className={`p-1 transition-colors duration-200 ease-out cursor-pointer ${
                      isLight ? 'text-zinc-600 hover:text-zinc-950 hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Rename Parameter"
                  >
                    <Edit3 size={11} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); deleteStat(stat.id); }}
                    className={`p-1 transition-colors duration-200 ease-out cursor-pointer ${
                      isLight ? 'text-zinc-600 hover:text-rose-600 hover:bg-rose-500/10' : 'text-zinc-400 hover:text-rose-500 hover:bg-rose-500/20'
                    }`}
                    title="Delete Parameter"
                  >
                    <Trash2 size={11} />
                  </button>

                  {/* Special Dropdown Button that reveals fx, threshold triggers, and crossing entities */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setOpenDropdownStatId(prev => prev === stat.id ? null : stat.id);
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase transition-all cursor-pointer border ${
                      isDropdownOpen
                        ? isLight
                          ? 'bg-rose-500/20 text-rose-700 border-rose-500/35'
                          : 'bg-rose-500/25 text-rose-300 border-rose-500/40'
                        : hasThresholdBreach
                          ? isLight
                            ? 'bg-amber-500/15 text-amber-700 border-amber-500/35 hover:bg-amber-500/25'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                          : isLight
                            ? 'bg-black/[0.04] text-zinc-600 hover:bg-black/[0.08] hover:text-zinc-900 border-black/[0.08]'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border-white/5'
                    }`}
                    title="More actions: Formula (fx), Threshold triggers & crossing entities"
                  >
                    {hasThresholdBreach ? (
                      <AlertTriangle size={8.5} className="shrink-0 text-amber-500" />
                    ) : (
                      <Sliders size={8.5} className="shrink-0" />
                    )}
                    {hasThresholdBreach && <span>!{flagInfo.count}</span>}
                    <ChevronDown size={8.5} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Special Dropdown Panel containing fx, threshold triggers, and entities crossing triggers */}
              {isDropdownOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  className={`mt-1 mb-1.5 p-2 rounded-lg border text-[8.5px] space-y-2 animate-in slide-in-from-top-1 duration-150 shadow-md ${
                    isLight
                      ? 'bg-white border-black/10 text-zinc-800'
                      : 'bg-[#141414] border-white/10 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
                    <span className="text-[7.5px] font-black uppercase tracking-wider text-zinc-500">
                      Parameter Tools & Triggers
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenDropdownStatId(null)}
                      className={`p-0.5 rounded cursor-pointer ${
                        isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      <X size={10} />
                    </button>
                  </div>

                  {/* Controls: fx and Threshold Triggers */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* fx Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onEditFormula?.(stat);
                      }}
                      className={`flex items-center justify-center gap-1.5 p-1.5 rounded-md border text-[8px] font-bold uppercase transition-all cursor-pointer ${
                        stat.isFormula
                          ? isLight
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 hover:bg-rose-500/25'
                            : 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                          : isLight
                            ? 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.08] text-zinc-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                      }`}
                      title={stat.isFormula ? `Formula: ${stat.formula}` : 'Configure Formula (fx)'}
                    >
                      <Calculator size={10} className="text-rose-500 shrink-0" />
                      <span className="truncate">{stat.isFormula ? 'Edit Formula (fx)' : 'Formula (fx)'}</span>
                    </button>

                    {/* Threshold Triggers Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenStatThreshold?.(stat);
                      }}
                      className={`flex items-center justify-center gap-1.5 p-1.5 rounded-md border text-[8px] font-bold uppercase transition-all cursor-pointer ${
                        isLight
                          ? 'bg-black/[0.03] hover:bg-amber-500/15 hover:text-amber-800 hover:border-amber-500/30 border-black/[0.08] text-zinc-700'
                          : 'bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30 border-white/10 text-zinc-300'
                      }`}
                      title="Configure Threshold Triggers for this Parameter"
                    >
                      <Sliders size={10} className="text-amber-500 shrink-0" />
                      <span className="truncate">Threshold Triggers</span>
                    </button>
                  </div>

                  {/* List of entities that crossed that trigger */}
                  <div className="pt-1 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[7.5px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                        <AlertTriangle size={8.5} className={hasThresholdBreach ? 'text-amber-500' : 'text-zinc-400'} />
                        <span>Entities Crossing Trigger ({flagInfo?.count || 0})</span>
                      </span>
                    </div>

                    {hasThresholdBreach ? (
                      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-0.5">
                        {[...flagInfo.low, ...flagInfo.high].map((item, idx) => {
                          const isLow = item.type === 'low';
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                onSelectEntity?.(item.entityId);
                              }}
                              className={`flex items-center justify-between p-1 rounded transition-colors cursor-pointer border ${
                                isLight
                                  ? 'hover:bg-black/5 border-transparent hover:border-black/5'
                                  : 'hover:bg-white/5 border-transparent hover:border-white/5'
                              }`}
                              title={`Click to select ${item.entityName}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                                  style={{ backgroundColor: item.entityColor }}
                                />
                                <span className="font-bold uppercase truncate text-[8px]">{item.entityName}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[7.5px]">
                                <span className="font-bold">{item.value}</span>
                                <span
                                  className={`px-1 py-0.2 rounded text-[6.5px] font-black uppercase ${
                                    isLow
                                      ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                  }`}
                                >
                                  {isLow ? `< ${item.threshold}` : `> ${item.threshold}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`p-1.5 rounded text-center text-[7px] uppercase font-medium ${
                        isLight ? 'bg-black/[0.02] text-zinc-500' : 'bg-white/[0.02] text-zinc-500'
                      }`}>
                        No entities crossing threshold limits
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action History in the bottom of the left pane */}
      <ActionHistory
        theme={theme}
        history={actionHistory}
        onRestore={onRestoreAction}
        onClear={onClearActionHistory}
      />
    </aside>
  );
});

FiltersPanel.displayName = 'FiltersPanel';
export default FiltersPanel;
