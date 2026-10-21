import React, { useState, useMemo } from 'react';
import {
  BarChart3, Sigma, TrendingUp, X, Grid, ArrowDownUp,
  Info, ChevronDown, Check, Sparkles, Layers,
} from 'lucide-react';
import { renderStatIcon } from '../constants/icons.jsx';
import {
  calculateDescriptiveStats,
  calculateCorrelationMatrix,
} from '../utils/statistics.js';

export default function StatisticsDrawer({
  stats = [],
  entities = [],
  normalizationMode = 'raw',
  onSetNormalizationMode = () => {},
  isOpen = false,
  onClose = () => {},
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'correlation' | 'normalization'
  const [hoveredCell, setHoveredCell] = useState(null);

  const activeStats = useMemo(() => {
    return stats.filter(s => s.visible !== false);
  }, [stats]);

  // Compute descriptive statistics per parameter
  const statSummaries = useMemo(() => {
    return activeStats.map(stat => {
      const values = entities.map(e => e.values?.[stat.id]);
      const metrics = calculateDescriptiveStats(values);

      // Find top and bottom entities
      let minEntity = null;
      let maxEntity = null;
      entities.forEach(e => {
        const val = e.values?.[stat.id];
        if (typeof val === 'number') {
          if (!minEntity || val < minEntity.val) minEntity = { name: e.name, val, color: e.color };
          if (!maxEntity || val > maxEntity.val) maxEntity = { name: e.name, val, color: e.color };
        }
      });

      return {
        stat,
        metrics,
        minEntity,
        maxEntity,
      };
    });
  }, [activeStats, entities]);

  // Compute Pearson Correlation Matrix
  const correlationData = useMemo(() => {
    return calculateCorrelationMatrix(entities, activeStats);
  }, [entities, activeStats]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f0f] border border-white/20 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.98)] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Sigma size={16} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                Statistics & Analytical Calculations
                <span className="text-[8px] font-mono font-normal text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  {entities.length} Entities • {activeStats.length} Parameters
                </span>
              </h2>
              <p className="text-[9px] text-zinc-500">
                Descriptive metrics, cross-parameter correlation analysis, and normalization modes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switchers */}
            <div className="flex bg-black/50 border border-white/5 rounded-lg p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded text-[8.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <BarChart3 size={11} />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('correlation')}
                className={`px-3 py-1 rounded text-[8.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'correlation'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Grid size={11} />
                <span>Correlation Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('normalization')}
                className={`px-3 py-1 rounded text-[8.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'normalization'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Layers size={11} />
                <span>Normalization</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/30">
                <table className="w-full text-left border-collapse text-[9.5px] font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/60 text-zinc-400 uppercase text-[8px] font-bold">
                      <th className="p-3">Parameter</th>
                      <th className="p-3 text-right">Mean (μ)</th>
                      <th className="p-3 text-right">Median</th>
                      <th className="p-3 text-right">StdDev (σ)</th>
                      <th className="p-3 text-right">Min / Max</th>
                      <th className="p-3 text-right">Range</th>
                      <th className="p-3 text-right">IQR (Q3-Q1)</th>
                      <th className="p-3">Distribution Spread</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {statSummaries.map(({ stat, metrics, minEntity, maxEntity }) => (
                      <tr key={stat.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center shrink-0">
                              {renderStatIcon(stat, 10)}
                            </div>
                            <span className="font-bold text-white uppercase text-[9px]">
                              {stat.name}
                            </span>
                            {stat.isFormula && (
                              <span className="text-[7px] font-black text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1 rounded">
                                fx
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-white tabular-nums">
                          {metrics.mean}
                        </td>
                        <td className="p-3 text-right tabular-nums text-zinc-400">
                          {metrics.median}
                        </td>
                        <td className="p-3 text-right tabular-nums text-rose-400 font-bold">
                          ±{metrics.stdDev}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          <span className="text-zinc-400">{metrics.min}</span>
                          <span className="text-zinc-600 mx-1">→</span>
                          <span className="text-emerald-400 font-bold">{metrics.max}</span>
                        </td>
                        <td className="p-3 text-right tabular-nums text-zinc-400">
                          {metrics.range}
                        </td>
                        <td className="p-3 text-right tabular-nums text-zinc-400">
                          {metrics.iqr}
                        </td>
                        <td className="p-3 min-w-[120px]">
                          {/* Mini visual spread bar */}
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                            <div
                              className="absolute top-0 bottom-0 bg-rose-500/50 rounded-full"
                              style={{
                                left: `${Math.max(0, Math.min(100, (metrics.q1 / (metrics.max || 1)) * 100))}%`,
                                right: `${Math.max(0, Math.min(100, 100 - (metrics.q3 / (metrics.max || 1)) * 100))}%`,
                              }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow"
                              style={{
                                left: `${Math.max(0, Math.min(100, (metrics.mean / (metrics.max || 1)) * 100))}%`,
                              }}
                              title={`Mean: ${metrics.mean}`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CORRELATION MATRIX */}
          {activeTab === 'correlation' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[8.5px] text-zinc-400 bg-black/40 p-2.5 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5">
                  <Info size={12} className="text-rose-400" />
                  <span>
                    Pearson correlation coefficient <strong className="text-white font-mono">r</strong> measures linear relationship:
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[8px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 inline-block" />
                    <span>Positive (+0.7 to +1.0)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-zinc-700 inline-block" />
                    <span>Neutral (-0.3 to +0.3)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 inline-block" />
                    <span>Negative / Trade-off (-1.0 to -0.3)</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/30 p-2">
                <table className="w-full text-center border-collapse text-[9px] font-mono">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-[8px] font-bold uppercase text-zinc-500">Metric</th>
                      {correlationData.activeStats.map(s => (
                        <th key={s.id} className="p-2 text-[8px] font-bold uppercase text-zinc-400">
                          {s.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationData.activeStats.map(statA => (
                      <tr key={statA.id} className="border-t border-white/5">
                        <td className="p-2 text-left font-bold text-white uppercase text-[8.5px] whitespace-nowrap">
                          {statA.name}
                        </td>
                        {correlationData.activeStats.map(statB => {
                          const r = correlationData.matrix[statA.id]?.[statB.id] ?? 0;
                          const isSelf = statA.id === statB.id;

                          let bg = 'bg-white/[0.02] text-zinc-500';
                          if (!isSelf) {
                            if (r >= 0.7) bg = 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40';
                            else if (r >= 0.3) bg = 'bg-emerald-500/15 text-emerald-400';
                            else if (r <= -0.7) bg = 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40';
                            else if (r <= -0.3) bg = 'bg-rose-500/15 text-rose-400';
                          } else {
                            bg = 'bg-white/5 text-zinc-600';
                          }

                          return (
                            <td
                              key={statB.id}
                              onMouseEnter={() => setHoveredCell({ a: statA.name, b: statB.name, r })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className="p-1"
                            >
                              <div className={`py-1.5 px-2 rounded transition-all cursor-pointer ${bg}`}>
                                {isSelf ? '1.0' : (r > 0 ? `+${r}` : r)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hoveredCell && (
                <div className="bg-black/60 border border-white/10 p-2.5 rounded-lg text-[9px] font-mono flex items-center justify-between text-zinc-300 animate-in fade-in duration-100">
                  <div>
                    <span className="font-bold text-white">{hoveredCell.a}</span> vs{' '}
                    <span className="font-bold text-white">{hoveredCell.b}</span>:
                    <span className="ml-2 font-bold text-rose-400">r = {hoveredCell.r}</span>
                  </div>
                  <div className="text-zinc-500 text-[8px]">
                    {hoveredCell.r > 0.6
                      ? 'Strong positive co-movement'
                      : hoveredCell.r < -0.6
                        ? 'Strong inverse trade-off'
                        : 'Weak or independent relationship'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NORMALIZATION */}
          {activeTab === 'normalization' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Raw Mode */}
                <div
                  onClick={() => onSetNormalizationMode('raw')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    normalizationMode === 'raw'
                      ? 'bg-rose-500/15 border-rose-500/40 shadow-lg'
                      : 'bg-black/30 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-[10px] uppercase">Raw Values</span>
                    {normalizationMode === 'raw' && <Check size={14} className="text-rose-400" />}
                  </div>
                  <p className="text-[8.5px] text-zinc-400 leading-relaxed mb-3">
                    Displays absolute numbers as stored in each entity without modification.
                  </p>
                  <div className="font-mono text-[8px] text-zinc-500 bg-black/40 p-2 rounded border border-white/5">
                    e.g. HP: 4500 • SPD: 1.4
                  </div>
                </div>

                {/* Min-Max Scaling */}
                <div
                  onClick={() => onSetNormalizationMode('minmax')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    normalizationMode === 'minmax'
                      ? 'bg-rose-500/15 border-rose-500/40 shadow-lg'
                      : 'bg-black/30 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-[10px] uppercase">Min-Max (0 - 100%)</span>
                    {normalizationMode === 'minmax' && <Check size={14} className="text-rose-400" />}
                  </div>
                  <p className="text-[8.5px] text-zinc-400 leading-relaxed mb-3">
                    Rescales each parameter so the lowest entity is 0% and highest is 100%. Equalizes different units.
                  </p>
                  <div className="font-mono text-[8px] text-emerald-400 bg-black/40 p-2 rounded border border-white/5">
                    (x - min) / (max - min) * 100
                  </div>
                </div>

                {/* Z-Score Standardization */}
                <div
                  onClick={() => onSetNormalizationMode('zscore')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    normalizationMode === 'zscore'
                      ? 'bg-rose-500/15 border-rose-500/40 shadow-lg'
                      : 'bg-black/30 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-[10px] uppercase">Z-Score (σ)</span>
                    {normalizationMode === 'zscore' && <Check size={14} className="text-rose-400" />}
                  </div>
                  <p className="text-[8.5px] text-zinc-400 leading-relaxed mb-3">
                    Centers each parameter at 0 with standard deviations (μ = 0, σ = 1). Spot outliers instantly.
                  </p>
                  <div className="font-mono text-[8px] text-rose-400 bg-black/40 p-2 rounded border border-white/5">
                    (x - μ) / σ
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-[9px] text-zinc-400 flex items-center justify-between">
                <span>
                  Active Mode: <strong className="text-white uppercase">{normalizationMode}</strong>
                </span>
                <span className="text-[8px] text-zinc-500">
                  Applied to Radar, Line, Table, and Analytical views in real time.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
