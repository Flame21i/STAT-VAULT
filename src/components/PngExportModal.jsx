import React, { memo, useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, Label,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
  X, Copy, Download, Eye, EyeOff, Sliders,
  Camera, Check, Activity, Target, CircleDot,
  PieChart as PieChartIcon, Grid, Trophy,
} from 'lucide-react';
import { renderStatIcon } from '../constants/icons.jsx';
import { STAT_PALETTE } from '../utils/helpers.js';

const MODE_LABELS = {
  radar: { name: 'Radar Benchmark', icon: Target },
  parallel: { name: 'Parallel Coordinates', icon: Activity },
  dots: { name: 'Distribution Dots', icon: CircleDot },
  pie: { name: 'Metric / Entity Pie', icon: PieChartIcon },
  heatmap: { name: 'Data Matrix (Table)', icon: Grid },
  leaderboard: { name: 'Leaderboard Ranking', icon: Trophy },
};

/**
 * Redesigned PNG export modal — practical snapshot studio:
 * - Live visible custom settings (labels, scales, curve types, orientation, donut vs solid, etc.)
 * - Optional filters and entity summaries
 * - One-click Download PNG file option or Copy to Clipboard
 * - Retina 2x capture
 */
const PngExportModal = memo(({
  theme = 'dark',
  renderCustomizedPieLabel,
  visMode,
  chartData,
  entities,
  activeStats,
  selectedIdSet,
  selectedEntity,
  pieData,
  dotsData,
  leaderboardData,
  maxTotal,
  entityTotals,
  stats,
  chartSettings = {},
  setChartSettings = () => {},
  showFiltersExport,
  setShowFiltersExport,
  showEntitiesExport,
  setShowEntitiesExport,
  isCopying,
  isDownloading,
  exportAreaRef,
  onCopy,
  onDownload,
  onCancel,
}) => {
  const isLight = theme === 'light';
  const [exportDisplayMode, setExportDisplayMode] = useState('informative'); // 'compact' | 'grid' | 'informative'
  const currentModeInfo = MODE_LABELS[visMode] || { name: 'Visualization', icon: Sliders };
  const ModeIcon = currentModeInfo.icon;

  const defaultPieLabel = ({ cx, cy, midAngle, outerRadius, name, payload }) => {
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 4) * cos;
    const sy = cy + (outerRadius + 4) * sin;
    const mx = cx + (outerRadius + 18) * cos;
    const my = cy + (outerRadius + 18) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 20;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    const dotColor = payload?.color || selectedEntity?.color || (isLight ? '#18181b' : '#fff');
    const displayVal = payload?.rawValue !== undefined ? payload.rawValue : payload?.value;
    const formattedVal = typeof displayVal === 'number' ? Math.round(displayVal * 10) / 10 : displayVal;

    return (
      <g className="select-none">
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)'} strokeWidth={1.5} fill="none" />
        <circle cx={ex} cy={ey} r={4.5} fill={dotColor} stroke={isLight ? '#ffffff' : '#000000'} strokeWidth={1.5} />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 8}
          y={ey}
          textAnchor={textAnchor}
          fontSize={13}
          fontWeight="900"
          dominantBaseline="central"
          className="uppercase tracking-wider"
        >
          <tspan fill={isLight ? '#18181b' : '#f4f4f5'}>{name}</tspan>
          <tspan fill={isLight ? '#52525b' : '#a1a1aa'} fontSize={11} fontWeight="800" dx={6}>{formattedVal}</tspan>
        </text>
      </g>
    );
  };

  const updateSetting = (key, value) => {
    setChartSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Backdrop without darkening or blurring */}
      <div
        className="fixed inset-0 z-[299] bg-transparent pointer-events-auto"
        onClick={onCancel}
      />

      {/* Main Modal Dialog */}
      <div
        className={`fixed z-[300] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] flex flex-col animate-scale-in transition-colors duration-200 ${
          isLight
            ? 'bg-[#ebedef] border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.45),0_15px_30px_rgba(0,0,0,0.25)] text-zinc-800'
            : 'bg-[#0c0c0c] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.98)] text-zinc-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 shrink-0 border-b ${
          isLight ? 'border-black/[0.08]' : 'border-white/5'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-sm">
              <Camera size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-widest ${
                  isLight ? 'text-zinc-900' : 'text-white'
                }`}>
                  PNG Snapshot Studio
                </span>
                <span className="text-[7.5px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <ModeIcon size={9} />
                  {visMode}
                </span>
                <span className={`text-[7.5px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                  isLight ? 'text-zinc-600 bg-black/[0.04] border border-black/[0.08]' : 'text-zinc-400 bg-white/5 border border-white/10'
                }`}>
                  2× Retina
                </span>
              </div>
              <p className="text-[8px] text-zinc-500 uppercase tracking-tight">
                Export high-resolution raster image with live custom settings
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className={`p-1.5 rounded-lg transition-all ${
              isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
            title="Close modal (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Practical Controls & Custom Settings Toolbar */}
        <div className={`border rounded-xl p-2.5 my-3 flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isLight ? 'bg-[#f4f5f7] border-black/[0.08]' : 'bg-[#111111] border-white/5'
        }`}>
          {/* Left: Layout inclusions */}
          <div className="flex items-center gap-2">
            <span className={`text-[7.5px] font-black uppercase tracking-wider pr-1 border-r ${
              isLight ? 'text-zinc-500 border-black/10' : 'text-zinc-500 border-white/10'
            }`}>
              LAYOUT
            </span>
            <button
              onClick={() => setShowFiltersExport(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${
                showFiltersExport
                  ? isLight ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : isLight ? 'bg-black/[0.04] text-zinc-600 hover:text-zinc-900 border border-transparent' : 'bg-white/5 text-zinc-500 hover:text-white border border-transparent'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${showFiltersExport ? 'bg-rose-500' : isLight ? 'bg-zinc-400' : 'bg-zinc-600'}`} />
              <span>Filters ({activeStats.length})</span>
            </button>
            <button
              onClick={() => setShowEntitiesExport(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${
                showEntitiesExport
                  ? isLight ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : isLight ? 'bg-black/[0.04] text-zinc-600 hover:text-zinc-900 border border-transparent' : 'bg-white/5 text-zinc-500 hover:text-white border border-transparent'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${showEntitiesExport ? 'bg-rose-500' : isLight ? 'bg-zinc-400' : 'bg-zinc-600'}`} />
              <span>Entities ({entities.filter(e => e.visible).length})</span>
            </button>

            {/* Special setting to display entities and metrics in compact, grid, or informative mode */}
            {(showFiltersExport || showEntitiesExport) && (
              <div className={`flex items-center gap-1 pl-2 border-l ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                <span className={`text-[7px] font-black uppercase tracking-wider pr-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  STYLE:
                </span>
                {[
                  { id: 'compact', label: 'Compact' },
                  { id: 'grid', label: 'Grid' },
                  { id: 'informative', label: 'Informative' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setExportDisplayMode(mode.id)}
                    className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase transition-all cursor-pointer ${
                      exportDisplayMode === mode.id
                        ? isLight
                          ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30 shadow-xs'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
                        : isLight
                          ? 'bg-black/[0.04] text-zinc-600 hover:text-zinc-900 border border-transparent'
                          : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Visible Custom Settings for the current chart */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[7.5px] font-black uppercase tracking-wider pr-1 border-r flex items-center gap-1 ${
              isLight ? 'text-zinc-500 border-black/10' : 'text-zinc-500 border-white/10'
            }`}>
              <Sliders size={10} className="text-rose-500" />
              SETTINGS
            </span>

            {/* Hide Labels Toggle */}
            <button
              onClick={() => updateSetting('hideLabels', !chartSettings.hideLabels)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[7.5px] font-bold uppercase transition-all ${
                chartSettings.hideLabels
                  ? isLight ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isLight ? 'bg-black/[0.04] text-zinc-600 hover:text-zinc-900 border border-transparent' : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
              }`}
              title="Toggle stat and metric names on axes"
            >
              {chartSettings.hideLabels ? <EyeOff size={10} /> : <Eye size={10} />}
              <span>{chartSettings.hideLabels ? 'Labels: Hidden' : 'Labels: Visible'}</span>
            </button>

            {/* Hide Scales Toggle */}
            <button
              onClick={() => updateSetting('hideScales', !chartSettings.hideScales)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[7.5px] font-bold uppercase transition-all ${
                chartSettings.hideScales
                  ? isLight ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isLight ? 'bg-black/[0.04] text-zinc-600 hover:text-zinc-900 border border-transparent' : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
              }`}
              title="Toggle axis scales, ticks and grids"
            >
              <span>{chartSettings.hideScales ? 'Scales: Hidden' : 'Scales: Visible'}</span>
            </button>

            {/* Chart-Specific Quick Settings */}
            {visMode === 'parallel' && (
              <div className={`flex items-center gap-1 rounded-md p-0.5 border ${
                isLight ? 'bg-black/[0.04] border-black/[0.08]' : 'bg-black/40 border-white/5'
              }`}>
                <button
                  onClick={() => updateSetting('parallelShowXAxisTitle', !(chartSettings.parallelShowXAxisTitle ?? true))}
                  className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase transition-all ${
                    (chartSettings.parallelShowXAxisTitle ?? true)
                      ? isLight ? 'text-rose-700 bg-rose-500/15' : 'text-rose-400 bg-rose-500/10'
                      : isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Toggle Horizontal (X) title independent of stat names"
                >
                  X-Title: {(chartSettings.parallelShowXAxisTitle ?? true) ? 'On' : 'Off'}
                </button>
                <div className={`w-px h-3 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
                <button
                  onClick={() => updateSetting('parallelShowYAxisTitle', !(chartSettings.parallelShowYAxisTitle ?? true))}
                  className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase transition-all ${
                    (chartSettings.parallelShowYAxisTitle ?? true)
                      ? isLight ? 'text-rose-700 bg-rose-500/15' : 'text-rose-400 bg-rose-500/10'
                      : isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Toggle Vertical (Y) title independent of scales"
                >
                  Y-Title: {(chartSettings.parallelShowYAxisTitle ?? true) ? 'On' : 'Off'}
                </button>
                <div className={`w-px h-3 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
                <button
                  onClick={() => updateSetting('parallelLabelOrientation', chartSettings.parallelLabelOrientation === 'vertical' ? 'horizontal' : 'vertical')}
                  className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase ${
                    isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Labels: {chartSettings.parallelLabelOrientation === 'vertical' ? 'Vert' : 'Horiz'}
                </button>
                <div className={`w-px h-3 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
                <button
                  onClick={() => updateSetting('parallelCurveType', chartSettings.parallelCurveType === 'monotone' ? 'linear' : 'monotone')}
                  className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase ${
                    isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}
                >
                  Curve: {chartSettings.parallelCurveType || 'linear'}
                </button>
              </div>
            )}

            {visMode === 'pie' && (
              <div className={`flex items-center gap-1 rounded-md p-0.5 border ${
                isLight ? 'bg-black/[0.04] border-black/[0.08]' : 'bg-black/40 border-white/5'
              }`}>
                <button
                  onClick={() => updateSetting('pieDonutHole', !chartSettings.pieDonutHole)}
                  className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase ${
                    isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}
                >
                  {chartSettings.pieDonutHole === false ? 'Solid Pie' : 'Donut Ring'}
                </button>
              </div>
            )}

            {visMode === 'heatmap' && (
              <div className={`flex items-center gap-1 rounded-md p-0.5 border ${
                isLight ? 'bg-black/[0.04] border-black/[0.08]' : 'bg-black/40 border-white/5'
              }`}>
                <button
                  onClick={() => updateSetting('tableShowHeatmap', !(chartSettings.tableShowHeatmap ?? true))}
                  className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase ${
                    isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}
                >
                  Heatmap: {chartSettings.tableShowHeatmap ?? true ? 'On' : 'Off'}
                </button>
                <div className={`w-px h-3 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
                {['compact', 'standard', 'comfortable'].map(d => (
                  <button
                    key={d}
                    onClick={() => updateSetting('tableDensity', d)}
                    className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${
                      (chartSettings.tableDensity || 'standard') === d
                        ? isLight ? 'text-zinc-950 bg-black/10' : 'text-white bg-white/10'
                        : isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {d[0].toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Capture Preview Area (Referenced for html-to-image) */}
        <div
          ref={exportAreaRef}
          className={`flex-1 flex gap-3 min-h-0 rounded-xl p-4 overflow-hidden relative shadow-inner ${
            isLight ? 'bg-[#e4e6e9] border border-black/10' : 'bg-[#080808] border border-white/10'
          }`}
        >
          {/* Filters panel */}
          {showFiltersExport && (
            <div className={`${
              exportDisplayMode === 'grid' ? 'w-64' : exportDisplayMode === 'informative' ? 'w-72' : 'w-48'
            } rounded-lg p-3 flex flex-col shrink-0 border transition-all duration-200 ${
              isLight ? 'bg-[#f0f1f4] border-black/[0.08]' : 'bg-[#0c0c0c] border-white/5'
            }`}>
              <div className={`flex items-center justify-between mb-2 pb-1 border-b ${
                isLight ? 'border-black/[0.08]' : 'border-white/5'
              }`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  isLight ? 'text-zinc-600' : 'text-zinc-400'
                }`}>
                  Active Metrics ({activeStats.length})
                </span>
                <span className="text-[7.5px] font-mono uppercase text-rose-500 font-bold">
                  {exportDisplayMode}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {activeStats.length === 0 ? (
                  <p className={`text-[8px] ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>No active filters</p>
                ) : exportDisplayMode === 'compact' ? (
                  <div className="space-y-1">
                    {activeStats.map(stat => (
                      <div key={stat.id} className={`flex items-center justify-between px-2 py-1 rounded border ${
                        isLight ? 'border-black/[0.06] bg-black/[0.02]' : 'border-white/5 bg-white/[0.02]'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          <div className="text-rose-500 shrink-0">{renderStatIcon(stat, 9)}</div>
                          <span className={`text-[8px] font-bold uppercase truncate ${
                            isLight ? 'text-zinc-700' : 'text-zinc-300'
                          }`}>{stat.name}</span>
                        </div>
                        {stat.isFormula && <span className="text-[6.5px] font-mono text-rose-500 font-bold">fx</span>}
                      </div>
                    ))}
                  </div>
                ) : exportDisplayMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeStats.map(stat => (
                      <div key={stat.id} className={`p-2 rounded-lg border flex flex-col justify-between gap-1.5 ${
                        isLight ? 'border-black/[0.06] bg-black/[0.02]' : 'border-white/5 bg-white/[0.02]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="text-rose-500 shrink-0">{renderStatIcon(stat, 10)}</div>
                          {stat.isFormula && (
                            <span className="text-[6.5px] font-mono font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1 rounded">fx</span>
                          )}
                        </div>
                        <span className={`text-[8px] font-bold uppercase truncate ${
                          isLight ? 'text-zinc-700' : 'text-zinc-300'
                        }`}>{stat.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Informative Mode */
                  <div className="space-y-2">
                    {activeStats.map(stat => {
                      const vals = entities.map(e => e.values[stat.id]).filter(v => typeof v === 'number');
                      const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : '—';
                      return (
                        <div key={stat.id} className={`p-2.5 rounded-xl border space-y-1.5 ${
                          isLight ? 'border-black/[0.06] bg-black/[0.02]' : 'border-white/5 bg-white/[0.02]'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <div className="text-rose-500 shrink-0">{renderStatIcon(stat, 11)}</div>
                              <span className={`text-[8.5px] font-black uppercase truncate ${
                                isLight ? 'text-zinc-800' : 'text-zinc-200'
                              }`}>{stat.name}</span>
                            </div>
                            {stat.isFormula ? (
                              <span className="text-[7px] font-mono font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1 rounded">
                                fx
                              </span>
                            ) : (
                              <span className="text-[7px] font-mono text-zinc-500 uppercase">Param</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[7.5px] font-mono text-zinc-500 pt-1 border-t border-black/[0.04] dark:border-white/5">
                            <span>Mean: <strong className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>{avg}</strong></span>
                            <span>{vals.length} / {entities.length} active</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chart Canvas Area */}
          <div className={`flex-1 rounded-lg overflow-hidden relative flex items-center justify-center p-0 min-w-0 border ${
            isLight ? 'bg-[#ebedef] border-black/[0.08]' : 'bg-[#090909] border-white/5'
          }`}>
            {visMode === 'heatmap' ? (
              <div className="w-full h-full overflow-auto custom-scrollbar p-3 flex items-center justify-center">
                <div className="w-full h-full max-w-full max-h-full overflow-auto custom-scrollbar rounded-xl shadow-lg border-none flex flex-col">
                  <table className="w-full h-full min-w-full border-collapse select-none border-none">
                  <thead className={`sticky top-0 z-10 ${
                    isLight ? 'bg-[#e4e6e9]' : 'bg-[#0e0e0e]'
                  }`}>
                    <tr>
                      <th className={`text-left font-black uppercase sticky left-0 z-20 border-none ${
                        isLight ? 'text-zinc-600 bg-[#e4e6e9]' : 'text-zinc-500 bg-[#0e0e0e]'
                      } ${
                        chartSettings.tableDensity === 'compact' ? 'px-2 py-1 text-[8.5px]' : chartSettings.tableDensity === 'comfortable' ? 'px-3 py-2 text-[10px]' : 'px-2.5 py-1.5 text-[9px]'
                      }`}>
                        STAT
                      </th>
                      {entities.map(entity => (
                        <th key={entity.id} className={`text-center font-black uppercase border-none ${
                          isLight ? 'text-zinc-700' : 'text-zinc-400'
                        } ${
                          chartSettings.tableDensity === 'compact' ? 'px-2 py-1 text-[8.5px]' : chartSettings.tableDensity === 'comfortable' ? 'px-3 py-2 text-[10px]' : 'px-2.5 py-1.5 text-[9px]'
                        }`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
                            <span className="truncate max-w-[100px]">{entity.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeStats.map((stat, rowIndex) => (
                      <tr key={stat.id} className={`border-none ${
                        isLight
                          ? (rowIndex % 2 === 0 ? 'bg-black/[0.015]' : 'bg-transparent')
                          : (rowIndex % 2 === 0 ? 'bg-white/[0.015]' : 'bg-transparent')
                      }`}>
                        <td className={`sticky left-0 z-10 border-none ${
                          isLight ? 'bg-[#ebedef]' : 'bg-[#090909]'
                        } ${
                          chartSettings.tableDensity === 'compact' ? 'px-2 py-1' : chartSettings.tableDensity === 'comfortable' ? 'px-3 py-2' : 'px-2.5 py-1.5'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`shrink-0 ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>{renderStatIcon(stat, 11)}</span>
                            <span className={`font-bold uppercase truncate text-[9.5px] ${
                              isLight ? 'text-zinc-700' : 'text-zinc-400'
                            }`}>{stat.name}</span>
                          </div>
                        </td>
                        {entities.map(entity => {
                          const value = entity.values[stat.id] || 0;
                          const maxValue = Math.max(...activeStats.map(s => entity.values[s.id] || 0));
                          const concentration = maxValue > 0 ? value / maxValue : 0;
                          const bgColor = (chartSettings.tableShowHeatmap ?? true)
                            ? `rgba(${parseInt(entity.color.slice(1,3),16)},${parseInt(entity.color.slice(3,5),16)},${parseInt(entity.color.slice(5,7),16)},${concentration * 0.7})`
                            : 'transparent';
                          return (
                            <td
                              key={entity.id}
                              style={{ backgroundColor: bgColor }}
                              className={`text-center border-none ${
                                chartSettings.tableDensity === 'compact' ? 'px-2 py-1' : chartSettings.tableDensity === 'comfortable' ? 'px-3 py-2' : 'px-2.5 py-1.5'
                              }`}
                            >
                              <span className={`font-black tabular-nums text-[10.5px] ${
                                isLight ? 'text-zinc-900' : 'text-white/95'
                              }`}>{value}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className={`sticky bottom-0 z-10 border-none ${
                    isLight ? 'bg-[#e4e6e9]' : 'bg-[#0e0e0e]'
                  }`}>
                    <tr>
                      <td className={`sticky left-0 z-20 font-black uppercase px-2.5 py-1.5 text-[9px] border-none ${
                        isLight ? 'bg-[#e4e6e9] text-zinc-600' : 'bg-[#0e0e0e] text-zinc-500'
                      }`}>
                        TOTAL
                      </td>
                      {entities.map(entity => (
                        <td key={entity.id} className={`text-center font-black px-2.5 py-1.5 text-[10px] border-none ${
                          isLight ? 'text-rose-600' : 'text-rose-400'
                        }`}>
                          {entityTotals[entity.id] || 0}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
              <ResponsiveContainer width="100%" height="100%">
                {visMode === 'radar' ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="82%" data={chartData}>
                    <PolarGrid
                      gridType={chartSettings.radarGridShape || 'polygon'}
                      stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}
                      hide={chartSettings.hideScales}
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: isLight ? '#475569' : '#888', fontSize: 10, fontWeight: 700 }}
                      hide={chartSettings.hideLabels}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 'auto']}
                      tick={{ fill: isLight ? '#64748b' : '#555', fontSize: 8 }}
                      axisLine={false}
                      hide={chartSettings.hideScales}
                    />
                    {entities.map(entity => {
                      const isSelected = selectedIdSet.has(entity.id);
                      const baseOpacity = isSelected ? 0.35 : selectedIdSet.size > 0 ? 0.05 : 0.12;
                      return (
                        <Radar
                          key={entity.id}
                          name={entity.name}
                          dataKey={entity.id}
                          stroke={entity.color}
                          fill={entity.color}
                          fillOpacity={baseOpacity}
                          strokeWidth={isSelected ? 3 : 1.5}
                          isAnimationActive={false}
                        />
                      );
                    })}
                  </RadarChart>
                ) : visMode === 'parallel' ? (() => {
                  const showXTitle = chartSettings.parallelShowXAxisTitle !== false;
                  const showYTitle = chartSettings.parallelShowYAxisTitle !== false;
                  const hideStatNames = chartSettings.parallelHideStatNames ?? chartSettings.hideLabels;
                  const hideScales = chartSettings.parallelHideScaleNumbers ?? chartSettings.hideScales;
                  const isVertLabels = chartSettings.parallelLabelOrientation === 'vertical';

                  const xDist = chartSettings.parallelXTitleDistance || chartSettings.parallelTitleDistance || 'ultra-close';
                  const yDist = chartSettings.parallelYTitleDistance || chartSettings.parallelTitleDistance || 'ultra-close';

                  const bottomMargin = showXTitle
                    ? (hideStatNames
                        ? (xDist === 'ultra-close' ? 38 : xDist === 'close' ? 46 : 54)
                        : isVertLabels
                          ? (xDist === 'ultra-close' ? 92 : xDist === 'close' ? 100 : 110)
                          : (xDist === 'ultra-close' ? 56 : xDist === 'close' ? 64 : 74))
                    : (hideStatNames ? 10 : (isVertLabels ? 65 : 28));

                  const leftMargin = showYTitle
                    ? (hideScales
                        ? (yDist === 'ultra-close' ? 36 : yDist === 'close' ? 44 : 52)
                        : (yDist === 'ultra-close' ? 58 : yDist === 'close' ? 66 : 76))
                    : (hideScales ? 15 : 35);

                  return (
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 0,
                        bottom: bottomMargin,
                        left: leftMargin,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)'}
                        vertical
                        horizontal={false}
                        hide={hideScales}
                      />
                      <XAxis
                        dataKey="subject"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        padding={{ left: 0, right: 0 }}
                        height={bottomMargin}
                        tick={
                          hideStatNames
                            ? false
                            : isVertLabels
                              ? ({ x, y, payload }) => (
                                  <g transform={`translate(${x},${y})`}>
                                    <text
                                      x={0}
                                      y={0}
                                      dy={12}
                                      textAnchor="end"
                                      transform="rotate(-90)"
                                      fill={isLight ? '#475569' : '#888'}
                                      fontSize={8.5}
                                      fontWeight={900}
                                    >
                                      {payload.value}
                                    </text>
                                  </g>
                                )
                              : { fill: isLight ? '#475569' : '#666', fontSize: 10, fontWeight: 700 }
                        }
                      >
                        {showXTitle && (
                          <Label
                            value={chartSettings.parallelXAxisTitle || 'METRICS'}
                            position="insideBottom"
                            offset={
                              hideStatNames
                                ? 6
                                : isVertLabels
                                  ? -6
                                  : -2
                            }
                            fill={isLight ? '#475569' : '#9ca3af'}
                            fontSize={9.5}
                            fontWeight={900}
                            style={{ textAnchor: 'middle', textTransform: 'uppercase', letterSpacing: '0.14em' }}
                          />
                        )}
                      </XAxis>
                      <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        width={leftMargin}
                        tick={hideScales ? false : { fill: isLight ? '#475569' : '#999', fontSize: 10, fontWeight: 700 }}
                      >
                        {showYTitle && (
                          <Label
                            value={chartSettings.parallelYAxisTitle || 'VALUE'}
                            angle={-90}
                            position="insideLeft"
                            offset={
                              hideScales
                                ? 6
                                : 4
                            }
                            fill={isLight ? '#475569' : '#9ca3af'}
                            fontSize={9.5}
                            fontWeight={900}
                            style={{ textAnchor: 'middle', textTransform: 'uppercase', letterSpacing: '0.14em' }}
                          />
                        )}
                      </YAxis>
                      {entities.map(entity => {
                        const isSelected = selectedIdSet.has(entity.id);
                        const baseOpacity = isSelected ? 0.35 : selectedIdSet.size > 0 ? 0.05 : 0.12;
                        const fillScale = chartSettings.parallelFillOpacity ?? 0.25;
                        return (
                          <Area
                            key={entity.id}
                            type={chartSettings.parallelCurveType || 'linear'}
                            dataKey={entity.id}
                            stroke={entity.color}
                            fill={entity.color}
                            isAnimationActive={false}
                            fillOpacity={baseOpacity * (fillScale / 0.25)}
                            strokeWidth={isSelected ? 3 : 1.5}
                          />
                        );
                      })}
                    </AreaChart>
                  );
                })() : visMode === 'dots' ? (
                  <ScatterChart margin={{ top: 20, right: 0, bottom: 20, left: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'}
                      hide={chartSettings.hideScales}
                    />
                    <XAxis
                      type="number"
                      dataKey="xIndex"
                      xAxisId="xAxis"
                      domain={[-0.5, Math.max(0, activeStats.length - 0.5)]}
                      ticks={activeStats.map((_, i) => i)}
                      tickFormatter={index => activeStats[Number(index)]?.name || ''}
                      tick={{ fill: isLight ? '#475569' : '#888', fontSize: 9.5, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      hide={chartSettings.hideLabels}
                      padding={{ left: 0, right: 0 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      yAxisId="yAxis"
                      domain={['auto', 'auto']}
                      width={chartSettings.hideScales ? 0 : 34}
                      tick={{ fill: isLight ? '#64748b' : '#777', fontSize: 9.5 }}
                      axisLine={false}
                      tickLine={false}
                      hide={chartSettings.hideScales}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <Scatter
                      data={dotsData}
                      xAxisId="xAxis"
                      yAxisId="yAxis"
                      isAnimationActive={false}
                    >
                      {dotsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={selectedIdSet.has(entry.entityId) || selectedIdSet.size === 0 ? 0.85 : 0.2}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                ) : visMode === 'leaderboard' ? (
                  <BarChart
                    layout="vertical"
                    data={leaderboardData}
                    margin={{ top: 20, right: 10, bottom: 20, left: 60 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, maxTotal]}
                      tick={{ fill: isLight ? '#64748b' : '#666', fontSize: 9.5 }}
                      axisLine={false}
                      tickLine={false}
                      hide={chartSettings.hideScales}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: isLight ? '#475569' : '#999', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      hide={chartSettings.hideLabels}
                    />
                    <Bar dataKey="total" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                      {leaderboardData.map(entry => (
                        <Cell
                          key={entry.id}
                          fill={entry.color}
                          fillOpacity={selectedIdSet.has(entry.id) || selectedIdSet.size === 0 ? 0.85 : 0.25}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : visMode === 'pie' ? (
                  pieData.length > 0 ? (
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={chartSettings.pieDonutHole === false ? 0 : '35%'}
                        outerRadius="78%"
                        paddingAngle={chartSettings.piePaddingAngle ?? 4}
                        dataKey="value"
                        isAnimationActive={false}
                        labelLine={false}
                        label={chartSettings.hideLabels ? false : (renderCustomizedPieLabel || defaultPieLabel)}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            fillOpacity={0.88}
                            stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)'}
                            strokeWidth={1}
                          />
                        ))}
                        <Label
                          position="center"
                          content={({ viewBox }) => {
                            if (!viewBox) return null;
                            const { x, y, width, height } = viewBox;
                            const cx = x + width / 2;
                            const cy = y + height / 2;
                            if (selectedEntity) {
                              return (
                                <g>
                                  <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central" fill={isLight ? '#18181b' : '#fff'} fontSize="16" fontWeight="900">
                                    {selectedEntity.name}
                                  </text>
                                  <circle cx={cx} cy={cy + 16} r="4" fill={selectedEntity.color} />
                                </g>
                              );
                            }
                            return (
                              <g>
                                <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central" fill={isLight ? '#18181b' : '#fff'} fontSize="16" fontWeight="900">
                                  ALL ENTITIES
                                </text>
                                <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central" fill={isLight ? '#71717a' : '#a1a1aa'} fontSize="11" fontWeight="800">
                                  {pieData.length} ACTIVE
                                </text>
                              </g>
                            );
                          }}
                        />
                      </Pie>
                    </PieChart>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className={`text-[10px] font-black uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>No entities to display</p>
                    </div>
                  )
                ) : (
                  <div />
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Entities summary panel */}
          {showEntitiesExport && (
            <div className={`${
              exportDisplayMode === 'grid' ? 'w-64' : exportDisplayMode === 'informative' ? 'w-72' : 'w-48'
            } rounded-lg p-3 flex flex-col shrink-0 border transition-all duration-200 ${
              isLight ? 'bg-[#f0f1f4] border-black/[0.08]' : 'bg-[#0c0c0c] border-white/5'
            }`}>
              <div className={`flex items-center justify-between mb-2 pb-1 border-b ${
                isLight ? 'border-black/[0.08]' : 'border-white/5'
              }`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  isLight ? 'text-zinc-600' : 'text-zinc-400'
                }`}>
                  Active Entities ({entities.filter(e => e.visible).length})
                </span>
                <span className="text-[7.5px] font-mono uppercase text-rose-500 font-bold">
                  {exportDisplayMode}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {exportDisplayMode === 'compact' ? (
                  <div className="space-y-1">
                    {entities.filter(e => e.visible).map(entity => (
                      <div key={entity.id} className={`flex items-center justify-between px-2 py-1 rounded border ${
                        isLight ? 'border-black/[0.06] bg-black/[0.02]' : 'border-white/5 bg-white/[0.02]'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
                          <span className={`text-[8px] font-bold uppercase truncate max-w-[90px] ${
                            isLight ? 'text-zinc-700' : 'text-zinc-300'
                          }`}>{entity.name}</span>
                        </div>
                        <span className={`text-[8px] font-black tabular-nums ${
                          isLight ? 'text-rose-600' : 'text-rose-400'
                        }`}>{entityTotals[entity.id] || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : exportDisplayMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {entities.filter(e => e.visible).map(entity => (
                      <div key={entity.id} className={`p-2 rounded-lg border flex flex-col justify-between gap-1 ${
                        isLight ? 'border-black/[0.06] bg-black/[0.02]' : 'border-white/5 bg-white/[0.02]'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
                          <span className={`text-[8px] font-bold uppercase truncate ${
                            isLight ? 'text-zinc-700' : 'text-zinc-300'
                          }`}>{entity.name}</span>
                        </div>
                        <span className={`text-[10px] font-black tabular-nums ${
                          isLight ? 'text-rose-600' : 'text-rose-400'
                        }`}>{entityTotals[entity.id] || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Informative Mode */
                  <div className="space-y-2">
                    {entities.filter(e => e.visible).map(entity => {
                      const total = entityTotals[entity.id] || 0;
                      const maxTotalVal = Math.max(...Object.values(entityTotals), 1);
                      const pct = Math.min(100, Math.round((total / maxTotalVal) * 100));
                      return (
                        <div key={entity.id} className={`p-2.5 rounded-xl border space-y-1.5 ${
                          isLight ? 'border-black/[0.06] bg-black/[0.02]' : 'border-white/5 bg-white/[0.02]'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: entity.color }} />
                              <span className={`text-[9px] font-black uppercase truncate ${
                                isLight ? 'text-zinc-800' : 'text-zinc-200'
                              }`}>{entity.name}</span>
                            </div>
                            <span className={`text-[11px] font-black tabular-nums ${
                              isLight ? 'text-rose-600' : 'text-rose-400'
                            }`}>{total}</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-black/[0.06]' : 'bg-white/5'}`}>
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: entity.color }} />
                          </div>
                          <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500">
                            <span>Score: {pct}% of Top</span>
                            <span>{activeStats.length} metrics</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-between mt-3 pt-3 border-t shrink-0 ${
          isLight ? 'border-black/[0.08]' : 'border-white/5'
        }`}>
          <div className={`text-[8px] uppercase tracking-tight flex items-center gap-2 ${
            isLight ? 'text-zinc-500' : 'text-zinc-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>High-resolution raster output • Ready for presentations & documentation</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                isLight
                  ? 'text-zinc-600 hover:text-zinc-950 hover:bg-black/5 border-black/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border-white/5'
              }`}
            >
              Cancel
            </button>

            {/* Copy to Clipboard option */}
            <button
              onClick={onCopy}
              disabled={isCopying || isDownloading}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 border ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-zinc-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              <Copy size={12} className={isCopying ? 'animate-spin' : ''} />
              <span>{isCopying ? 'Copying...' : 'Copy to Clipboard'}</span>
            </button>

            {/* Download Image option (Primary) */}
            <button
              onClick={onDownload}
              disabled={isDownloading || isCopying}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Download size={12} className={isDownloading ? 'animate-bounce' : ''} />
              <span>{isDownloading ? 'Generating PNG...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

PngExportModal.displayName = 'PngExportModal';
export default PngExportModal;
