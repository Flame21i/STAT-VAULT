import React, { memo } from 'react';
import {
  Settings, X, RotateCcw, EyeOff, Eye, Sliders,
  Activity, Target, CircleDot, PieChart as PieChartIcon, Grid, Trophy,
} from 'lucide-react';

const MODE_TITLES = {
  radar: { name: 'Radar Benchmark', icon: Target },
  parallel: { name: 'Parallel Coordinates', icon: Activity },
  dots: { name: 'Distribution Dots', icon: CircleDot },
  pie: { name: 'Metric / Entity Pie', icon: PieChartIcon },
  heatmap: { name: 'Data Matrix (Table)', icon: Grid },
  leaderboard: { name: 'Leaderboard Ranking', icon: Trophy },
};

const ChartSettingsModal = memo(({
  isOpen,
  onClose,
  visMode,
  settings,
  onUpdateSettings,
  onResetSettings,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.classList.contains('light'));
  const currentModeInfo = MODE_TITLES[visMode] || { name: 'Chart View', icon: Sliders };
  const ModeIcon = currentModeInfo.icon;

  const updateSetting = (key, value) => {
    onUpdateSettings(prev => ({ ...prev, [key]: value }));
  };

  const cardBg = isLight ? 'bg-black/[0.02] border-black/5 hover:border-black/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10';
  const subCardBg = isLight ? 'bg-black/[0.03] border-black/5' : 'bg-black/30 border-white/5';
  const titleColor = isLight ? 'text-zinc-900' : 'text-zinc-300';
  const descColor = isLight ? 'text-zinc-500' : 'text-zinc-600';
  const sectionLabelColor = isLight ? 'text-zinc-500' : 'text-zinc-600';
  const toggleTrackInactive = isLight ? 'bg-black/15' : 'bg-white/10';
  const inputClass = isLight
    ? 'w-full bg-black/[0.04] border border-black/10 rounded px-2 py-1 text-[8.5px] font-black uppercase text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-500'
    : 'w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[8.5px] font-black uppercase text-white placeholder:text-zinc-700 outline-none focus:border-rose-500';
  const activeBtnClass = isLight
    ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30 font-black'
    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  const inactiveBtnClass = isLight
    ? 'bg-black/[0.04] text-zinc-600 hover:text-zinc-950 border border-transparent'
    : 'bg-white/5 text-zinc-500 hover:text-white border border-transparent';

  return (
    <>
      {/* Backdrop without darkening or blurring */}
      <div
        className="fixed inset-0 z-[299] bg-transparent pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`fixed z-[300] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 w-[92vw] max-w-md max-h-[85vh] flex flex-col animate-scale-in border ${
          isLight
            ? 'bg-white border-black/10 shadow-[0_25px_60px_rgba(0,0,0,0.4),0_10px_25px_rgba(0,0,0,0.25)] text-zinc-900'
            : 'bg-[#0c0c0c] border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.98)] text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 shrink-0 ${isLight ? 'border-black/5' : 'border-white/5'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <ModeIcon size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  GRAPH SETTINGS
                </span>
                <span className="text-[7.5px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded-full uppercase">
                  {visMode}
                </span>
              </div>
              <p className={`text-[8px] uppercase tracking-tighter ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                {currentModeInfo.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${
              isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'
            }`}
          >
            <X size={15} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 custom-scrollbar pr-1">
          {/* 1. Global / Common Settings */}
          <div className="space-y-2">
            <span className={`text-[7.5px] font-black tracking-widest uppercase block ${sectionLabelColor}`}>
              UNIVERSAL DISPLAY
            </span>

            {/* Hide Labels */}
            <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${cardBg}`}>
              <div>
                <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                  Hide Labels
                </span>
                <span className={`text-[7.5px] uppercase ${descColor}`}>
                  Suppress axis text, stat names, and value markers
                </span>
              </div>
              <button
                onClick={() => updateSetting('hideLabels', !settings.hideLabels)}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.hideLabels ? 'bg-rose-500' : toggleTrackInactive
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.hideLabels ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Hide Scales / Grids */}
            <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${cardBg}`}>
              <div>
                <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                  Hide Scales & Grids
                </span>
                <span className={`text-[7.5px] uppercase ${descColor}`}>
                  Remove coordinate lines, polar grids, and axis ticks
                </span>
              </div>
              <button
                onClick={() => updateSetting('hideScales', !settings.hideScales)}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.hideScales ? 'bg-rose-500' : toggleTrackInactive
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.hideScales ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Chart-Specific Settings */}
          <div className={`space-y-2 pt-1 border-t ${isLight ? 'border-black/5' : 'border-white/5'}`}>
            <span className={`text-[7.5px] font-black tracking-widest uppercase block ${sectionLabelColor}`}>
              {visMode.toUpperCase()} CONFIGURATION
            </span>

            {/* Parallel Coordinates Specific */}
            {visMode === 'parallel' && (
              <div className="space-y-2.5 animate-fade-in">
                {/* 1. Axis Title Labels (Horizontal & Vertical - Independent settings) */}
                <div className={`p-2.5 rounded-lg border space-y-2.5 ${cardBg}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold uppercase ${titleColor}`}>
                      Axis Title Labels (X & Y)
                    </span>
                    <span className={`text-[7px] font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                      Closer to graph & independent
                    </span>
                  </div>

                  {/* Horizontal (X-Axis) Title Setting */}
                  <div className={`space-y-1.5 p-2 rounded ${subCardBg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-bold uppercase ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        Horizontal Title (X-Axis)
                      </span>
                      <button
                        onClick={() => updateSetting('parallelShowXAxisTitle', !(settings.parallelShowXAxisTitle ?? true))}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          (settings.parallelShowXAxisTitle ?? true) ? 'bg-rose-500' : toggleTrackInactive
                        }`}
                        title="Toggle Horizontal title independent of stat names"
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white transition-transform ${
                            (settings.parallelShowXAxisTitle ?? true) ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {(settings.parallelShowXAxisTitle ?? true) && (
                      <>
                        <input
                          type="text"
                          value={settings.parallelXAxisTitle ?? 'METRICS'}
                          onChange={e => updateSetting('parallelXAxisTitle', e.target.value.toUpperCase())}
                          placeholder="METRICS"
                          className={inputClass}
                        />
                        <div className="pt-1">
                          <span className={`text-[7.5px] font-bold uppercase block mb-1 ${descColor}`}>
                            X-Axis Distance to Graph
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'ultra-close', label: 'Ultra-Close' },
                              { id: 'close', label: 'Close' },
                              { id: 'normal', label: 'Normal' },
                            ].map(d => (
                              <button
                                key={d.id}
                                onClick={() => {
                                  updateSetting('parallelXTitleDistance', d.id);
                                  updateSetting('parallelTitleDistance', d.id);
                                }}
                                className={`py-1 rounded text-[7.5px] font-black uppercase transition-all ${
                                  (settings.parallelXTitleDistance || settings.parallelTitleDistance || 'ultra-close') === d.id
                                    ? activeBtnClass
                                    : inactiveBtnClass
                                }`}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Vertical (Y-Axis) Title Setting */}
                  <div className={`space-y-1.5 p-2 rounded ${subCardBg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-bold uppercase ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        Vertical Title (Y-Axis)
                      </span>
                      <button
                        onClick={() => updateSetting('parallelShowYAxisTitle', !(settings.parallelShowYAxisTitle ?? true))}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          (settings.parallelShowYAxisTitle ?? true) ? 'bg-rose-500' : toggleTrackInactive
                        }`}
                        title="Toggle Vertical title independent of scales"
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white transition-transform ${
                            (settings.parallelShowYAxisTitle ?? true) ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {(settings.parallelShowYAxisTitle ?? true) && (
                      <>
                        <input
                          type="text"
                          value={settings.parallelYAxisTitle ?? 'VALUE'}
                          onChange={e => updateSetting('parallelYAxisTitle', e.target.value.toUpperCase())}
                          placeholder="VALUE"
                          className={inputClass}
                        />
                        <div className="pt-1 space-y-1.5">
                          <div>
                            <span className={`text-[7.5px] font-bold uppercase block mb-1 ${descColor}`}>
                              Y-Axis Distance to Graph
                            </span>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'ultra-close', label: 'Ultra-Close' },
                                { id: 'close', label: 'Close' },
                                { id: 'normal', label: 'Normal' },
                              ].map(d => (
                                <button
                                  key={d.id}
                                  onClick={() => updateSetting('parallelYTitleDistance', d.id)}
                                  className={`py-1 rounded text-[7.5px] font-black uppercase transition-all ${
                                    (settings.parallelYTitleDistance || settings.parallelTitleDistance || 'ultra-close') === d.id
                                      ? activeBtnClass
                                      : inactiveBtnClass
                                  }`}
                                >
                                  {d.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className={`text-[7.5px] font-bold uppercase block mb-1 ${descColor}`}>
                              Y-Axis Orientation
                            </span>
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                onClick={() => updateSetting('parallelYTitleOrientation', 'vertical')}
                                className={`py-1 rounded text-[7.5px] font-black uppercase transition-all ${
                                  (settings.parallelYTitleOrientation || 'vertical') === 'vertical'
                                    ? activeBtnClass
                                    : inactiveBtnClass
                                }`}
                              >
                                Vertical (-90°)
                              </button>
                              <button
                                onClick={() => updateSetting('parallelYTitleOrientation', 'horizontal')}
                                className={`py-1 rounded text-[7.5px] font-black uppercase transition-all ${
                                  settings.parallelYTitleOrientation === 'horizontal'
                                    ? activeBtnClass
                                    : inactiveBtnClass
                                }`}
                              >
                                Horizontal (0°)
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Independent Stat Names (X-Axis Ticks) */}
                <div className={`p-2.5 rounded-lg border space-y-2 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                        Stat Names (X-Axis Ticks)
                      </span>
                      <span className={`text-[7.5px] uppercase ${descColor}`}>
                        Individual parameter labels along the horizontal axis
                      </span>
                    </div>
                    <button
                      onClick={() => updateSetting('parallelHideStatNames', !settings.parallelHideStatNames)}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                        !settings.parallelHideStatNames ? 'bg-rose-500' : toggleTrackInactive
                      }`}
                      title={!settings.parallelHideStatNames ? 'Hide stat names' : 'Show stat names'}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          !settings.parallelHideStatNames ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {!settings.parallelHideStatNames && (
                    <div className="pt-1 space-y-1">
                      <span className={`text-[7.5px] font-bold uppercase block ${descColor}`}>
                        Stat Name Orientation
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => updateSetting('parallelLabelOrientation', 'horizontal')}
                          className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                            settings.parallelLabelOrientation === 'horizontal' || !settings.parallelLabelOrientation
                              ? activeBtnClass
                              : inactiveBtnClass
                          }`}
                        >
                          Horizontal (0°)
                        </button>
                        <button
                          onClick={() => updateSetting('parallelLabelOrientation', 'vertical')}
                          className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                            settings.parallelLabelOrientation === 'vertical'
                              ? activeBtnClass
                              : inactiveBtnClass
                          }`}
                        >
                          Vertical (-90°)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Independent Scale Numbers (Y-Axis) */}
                <div className={`flex items-center justify-between p-2.5 rounded-lg border ${cardBg}`}>
                  <div>
                    <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                      Scale Numbers (Y-Axis)
                    </span>
                    <span className={`text-[7.5px] uppercase ${descColor}`}>
                      Numeric values and grid lines along the vertical scale
                    </span>
                  </div>
                  <button
                    onClick={() => updateSetting('parallelHideScaleNumbers', !settings.parallelHideScaleNumbers)}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      !settings.parallelHideScaleNumbers ? 'bg-rose-500' : toggleTrackInactive
                    }`}
                    title={!settings.parallelHideScaleNumbers ? 'Hide scale numbers' : 'Show scale numbers'}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        !settings.parallelHideScaleNumbers ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Trajectory Interpolation */}
                <div className={`p-2.5 rounded-lg border space-y-1.5 ${cardBg}`}>
                  <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                    Trajectory Interpolation
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => updateSetting('parallelCurveType', 'linear')}
                      className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                        settings.parallelCurveType === 'linear' || !settings.parallelCurveType
                          ? activeBtnClass
                          : inactiveBtnClass
                      }`}
                    >
                      Linear (Sharp)
                    </button>
                    <button
                      onClick={() => updateSetting('parallelCurveType', 'monotone')}
                      className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                        settings.parallelCurveType === 'monotone'
                          ? activeBtnClass
                          : inactiveBtnClass
                      }`}
                    >
                      Monotone (Curved)
                    </button>
                  </div>
                </div>

                {/* 5. Fill Opacity */}
                <div className={`p-2.5 rounded-lg border space-y-1.5 ${cardBg}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold uppercase ${titleColor}`}>
                      Area Fill Opacity
                    </span>
                    <span className={`text-[8px] font-mono ${descColor}`}>
                      {Math.round((settings.parallelFillOpacity ?? 0.25) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[0, 0.15, 0.25, 0.45].map(op => (
                      <button
                        key={op}
                        onClick={() => updateSetting('parallelFillOpacity', op)}
                        className={`py-1 rounded text-[7.5px] font-black uppercase transition-all ${
                          (settings.parallelFillOpacity ?? 0.25) === op
                            ? activeBtnClass
                            : inactiveBtnClass
                        }`}
                      >
                        {op === 0 ? 'None' : `${Math.round(op * 100)}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Radar Specific */}
            {visMode === 'radar' && (
              <div className="space-y-2.5 animate-fade-in">
                <div className={`p-2.5 rounded-lg border space-y-1.5 ${cardBg}`}>
                  <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                    Polar Web Geometry
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => updateSetting('radarGridShape', 'polygon')}
                      className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                        settings.radarGridShape === 'polygon' || !settings.radarGridShape
                          ? activeBtnClass
                          : inactiveBtnClass
                      }`}
                    >
                      Polygon (Web)
                    </button>
                    <button
                      onClick={() => updateSetting('radarGridShape', 'circle')}
                      className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                        settings.radarGridShape === 'circle'
                          ? activeBtnClass
                          : inactiveBtnClass
                      }`}
                    >
                      Circle (Concentric)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dots / Scatter Specific */}
            {visMode === 'dots' && (
              <div className="space-y-2.5 animate-fade-in">
                <div className={`flex items-center justify-between p-2.5 rounded-lg border ${cardBg}`}>
                  <div>
                    <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                      Alternating Metric Bands
                    </span>
                    <span className={`text-[7.5px] uppercase ${descColor}`}>
                      Vertical column reference zones
                    </span>
                  </div>
                  <button
                    onClick={() => updateSetting('dotsShowGridBands', !(settings.dotsShowGridBands ?? true))}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      settings.dotsShowGridBands ?? true ? 'bg-rose-500' : toggleTrackInactive
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.dotsShowGridBands ?? true ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Pie Specific */}
            {visMode === 'pie' && (
              <div className="space-y-2.5 animate-fade-in">
                <div className={`p-2.5 rounded-lg border space-y-1.5 ${cardBg}`}>
                  <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                    Pie Style Architecture
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => updateSetting('pieDonutHole', true)}
                      className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                        settings.pieDonutHole ?? true
                          ? activeBtnClass
                          : inactiveBtnClass
                      }`}
                    >
                      Donut Ring
                    </button>
                    <button
                      onClick={() => updateSetting('pieDonutHole', false)}
                      className={`py-1.5 px-3 rounded text-[8px] font-black uppercase transition-all ${
                        settings.pieDonutHole === false
                          ? activeBtnClass
                          : inactiveBtnClass
                      }`}
                    >
                      Solid Pie
                    </button>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border space-y-1.5 ${cardBg}`}>
                  <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                    Slice Separation Gap
                  </span>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {[0, 4, 8].map(gap => (
                      <button
                        key={gap}
                        onClick={() => updateSetting('piePaddingAngle', gap)}
                        className={`py-1 rounded text-[7.5px] font-black uppercase transition-all ${
                          (settings.piePaddingAngle ?? 4) === gap
                            ? activeBtnClass
                            : inactiveBtnClass
                        }`}
                      >
                        {gap === 0 ? 'None (0°)' : `${gap}°`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Table / Heatmap Specific */}
            {visMode === 'heatmap' && (
              <div className="space-y-2.5 animate-fade-in">
                <div className={`p-2.5 rounded-lg border space-y-1.5 ${cardBg}`}>
                  <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                    Table Row Density
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['compact', 'standard', 'comfortable'].map(d => (
                      <button
                        key={d}
                        onClick={() => updateSetting('tableDensity', d)}
                        className={`py-1.5 rounded text-[8px] font-black uppercase transition-all ${
                          (settings.tableDensity || 'standard') === d
                            ? activeBtnClass
                            : inactiveBtnClass
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-lg border ${cardBg}`}>
                  <div>
                    <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                      Cell Heatmap Shading
                    </span>
                    <span className={`text-[7.5px] uppercase ${descColor}`}>
                      Relative concentration backdrops
                    </span>
                  </div>
                  <button
                    onClick={() => updateSetting('tableShowHeatmap', !(settings.tableShowHeatmap ?? true))}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      settings.tableShowHeatmap ?? true ? 'bg-rose-500' : toggleTrackInactive
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.tableShowHeatmap ?? true ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Table Scaling */}
                <div className={`p-2.5 rounded-lg border space-y-1.5 ${cardBg}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold uppercase ${titleColor}`}>
                      Table Text & Cell Scale
                    </span>
                    <span className={`text-[7.5px] font-mono ${descColor}`}>
                      {Math.round((settings.tableScale || 1) * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[0.8, 1.0, 1.2, 1.4].map(scale => (
                      <button
                        key={scale}
                        onClick={() => updateSetting('tableScale', scale)}
                        className={`py-1 rounded text-[7.5px] font-black uppercase transition-all ${
                          (settings.tableScale || 1) === scale
                            ? activeBtnClass
                            : inactiveBtnClass
                        }`}
                      >
                        {Math.round(scale * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Column Widths */}
                <button
                  onClick={() => onUpdateSettings(prev => ({
                    ...prev,
                    tableStatColWidth: 160,
                    tableEntityColWidth: 130,
                    tableScale: 1,
                    tableDensity: 'standard',
                  }))}
                  className={`w-full py-1.5 rounded text-[8px] font-bold uppercase border transition-all ${
                    isLight
                      ? 'text-zinc-600 hover:text-zinc-950 bg-black/[0.03] hover:bg-black/[0.06] border-black/5'
                      : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  Reset Column Widths & Layout
                </button>
              </div>
            )}

            {/* Leaderboard Specific */}
            {visMode === 'leaderboard' && (
              <div className="space-y-2.5 animate-fade-in">
                <div className={`flex items-center justify-between p-2.5 rounded-lg border ${cardBg}`}>
                  <div>
                    <span className={`text-[9px] font-bold uppercase block ${titleColor}`}>
                      Value Data Badges
                    </span>
                    <span className={`text-[7.5px] uppercase ${descColor}`}>
                      Show numeric totals on bars
                    </span>
                  </div>
                  <button
                    onClick={() => updateSetting('leaderboardShowValues', !(settings.leaderboardShowValues ?? true))}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      settings.leaderboardShowValues ?? true ? 'bg-rose-500' : toggleTrackInactive
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.leaderboardShowValues ?? true ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between border-t pt-3 shrink-0 ${isLight ? 'border-black/5' : 'border-white/5'}`}>
          <button
            onClick={onResetSettings}
            className={`flex items-center gap-1.5 text-[8px] font-bold uppercase transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <RotateCcw size={10} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider transition-all duration-150 shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
});

ChartSettingsModal.displayName = 'ChartSettingsModal';
export default ChartSettingsModal;
