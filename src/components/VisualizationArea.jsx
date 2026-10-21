import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, Label, Sector,
  AreaChart, Area, ReferenceArea, CartesianGrid,
} from 'recharts';
import {
  Target, Trophy, CircleDot, PieChart as PieChartIcon, Activity,
  RotateCcw, ChevronUp, ChevronDown, Grid, Settings,
  Edit3, Check, X,
} from 'lucide-react';
import { renderStatIcon } from '../constants/icons.jsx';
import { STAT_PALETTE } from '../utils/helpers.js';

const VisualizationArea = memo(({
  theme = 'dark',
  visMode,
  chartData,
  entities,
  selectedIdSet,
  hoveredId,
  selectedEntity,
  activeStats,
  entityTotals,
  leaderboardData,
  dotsData,
  pieData,
  zoom,
  offset,
  handleWheel,
  handleChartMouseDown,
  resetView,
  setVisMode,
  handleEntitySelection,
  CustomTooltip,
  renderCustomizedPieLabel,
  renderActiveShape,
  bottomCollapsed,
  setBottomCollapsed,
  monitorPage,
  setMonitorPage,
  paginatedEntities,
  handleMouseDownItem,
  handleMouseUpItem,
  handleMouseEnterItem,
  handleMouseLeaveItem,
  handleMouseMoveItem,
  totalPages,
  activePieIndex,
  setActivePieIndex,
  maxTotal,
  chartSettings = {},
  setChartSettings = () => {},
  setIsSettingsOpen = () => {},
}) => {
  const isLight = theme === 'light';
  const wheelContainerRef = useRef(null);
  const wheelHandlerRef = useRef(handleWheel);

  // ─── Editable Parallel View Axis Title Labels ─────────────────────────────
  const [editingAxis, setEditingAxis] = useState(null); // 'x' | 'y' | null
  const [axisDraft, setAxisDraft] = useState('');

  const handleStartEditX = (e) => {
    e.stopPropagation();
    setEditingAxis('x');
    setAxisDraft(chartSettings.parallelXAxisTitle || 'METRICS');
  };

  const handleStartEditY = (e) => {
    e.stopPropagation();
    setEditingAxis('y');
    setAxisDraft(chartSettings.parallelYAxisTitle || 'VALUE');
  };

  const handleSaveAxis = (axisKey, defaultVal) => {
    const trimmed = axisDraft.trim() || defaultVal;
    if (axisKey === 'x') {
      setChartSettings(prev => ({ ...prev, parallelXAxisTitle: trimmed.toUpperCase() }));
    } else if (axisKey === 'y') {
      setChartSettings(prev => ({ ...prev, parallelYAxisTitle: trimmed.toUpperCase() }));
    }
    setEditingAxis(null);
  };

  const handleAxisKeyDown = (e, axisKey, defaultVal) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAxis(axisKey, defaultVal);
    } else if (e.key === 'Escape') {
      setEditingAxis(null);
    }
  };

  // ─── Parallel Axis Title Distance Proximity & Margins (Comfortable spacing & configurable) ───
  const showParallelXTitle = chartSettings.parallelShowXAxisTitle !== false;
  const showParallelYTitle = chartSettings.parallelShowYAxisTitle !== false;
  const hideParallelStatNames = !!(chartSettings.parallelHideStatNames ?? chartSettings.hideLabels);
  const hideParallelScales = !!(chartSettings.parallelHideScaleNumbers ?? chartSettings.hideScales);
  const isParallelVertLabels = chartSettings.parallelLabelOrientation === 'vertical';

  const xDistPreset = chartSettings.parallelXTitleDistance || chartSettings.parallelTitleDistance || 'ultra-close';
  const yDistPreset = chartSettings.parallelYTitleDistance || chartSettings.parallelTitleDistance || 'ultra-close';

  const parallelBottomMargin = showParallelXTitle
    ? (hideParallelStatNames
        ? (xDistPreset === 'ultra-close' ? 38 : xDistPreset === 'close' ? 46 : 54)
        : isParallelVertLabels
          ? (xDistPreset === 'ultra-close' ? 92 : xDistPreset === 'close' ? 100 : 110)
          : (xDistPreset === 'ultra-close' ? 56 : xDistPreset === 'close' ? 64 : 74))
    : (hideParallelStatNames ? 8 : (isParallelVertLabels ? 62 : 26));

  const parallelLeftMargin = showParallelYTitle
    ? (hideParallelScales
        ? (yDistPreset === 'ultra-close' ? 36 : yDistPreset === 'close' ? 44 : 52)
        : (yDistPreset === 'ultra-close' ? 58 : yDistPreset === 'close' ? 66 : 76))
    : (hideParallelScales ? 12 : 36);

  useEffect(() => {
    wheelHandlerRef.current = handleWheel;
  }, [handleWheel]);

  useEffect(() => {
    const el = wheelContainerRef.current;
    if (!el) return;
    const handler = (event) => {
      event.preventDefault();
      wheelHandlerRef.current(event);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const zoomX = typeof zoom === 'object' && zoom !== null ? (zoom.x ?? 1) : (Number(zoom) || 1);
  const zoomY = typeof zoom === 'object' && zoom !== null ? (zoom.y ?? 1) : (Number(zoom) || 1);

  return (
    <main className={`flex-1 relative overflow-hidden min-w-0 outline-none transition-colors duration-200 ${isLight ? 'bg-[#e7e9ec]' : 'bg-[#080808]'}`}>
      <div
        ref={wheelContainerRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden outline-none cursor-crosshair"
        onMouseDown={handleChartMouseDown}
      >
        <div
          className={`w-full h-full transition-transform duration-75 ease-out outline-none flex items-center justify-center relative ${
            visMode === 'heatmap'
              ? 'p-2 pb-0'
              : (visMode === 'parallel' || visMode === 'dots')
                ? 'p-0 w-full'
                : visMode === 'pie'
                  ? 'p-2'
                  : 'p-8'
          }`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomX}, ${zoomY})`,
            transformOrigin: 'center center',
          }}
        >
          {/* TABLE MODE */}
          {visMode === 'heatmap' ? (
            <div className="w-full h-full flex flex-col overflow-hidden p-2">
              {/* Scrollable Data Table Container */}
              <div
                className={`w-full h-full max-w-full max-h-full overflow-auto custom-scrollbar rounded-xl backdrop-blur-xl relative transition-all ${
                  isLight
                    ? 'bg-[#ebedef]/95 shadow-[0_16px_50px_rgba(0,0,0,0.08)]'
                    : 'bg-[#090909]/80 shadow-2xl'
                }`}
                style={{ fontSize: `${(chartSettings.tableScale || 1) * 100}%` }}
              >
                <table className="w-full h-full min-w-full border-collapse select-none border-none">
                  <thead className={`sticky top-0 z-20 shadow-sm backdrop-blur-md ${
                    isLight ? 'bg-[#ebedef]/95' : 'bg-[#0c0c0c]'
                  }`}>
                    <tr>
                      <th
                        style={{ width: chartSettings.tableStatColWidth || 160, minWidth: 100 }}
                        className={`text-left font-black uppercase sticky left-0 z-30 relative ${
                          isLight ? 'text-zinc-600 bg-[#ebedef]/95' : 'text-zinc-500 bg-[#0c0c0c]'
                        } ${
                          chartSettings.tableDensity === 'compact' ? 'px-2 py-1.5 text-[8.5px]' : chartSettings.tableDensity === 'comfortable' ? 'px-4 py-3 text-[10.5px]' : 'px-3 py-2 text-[9.5px]'
                        }`}
                      >
                        <div className="flex items-center justify-between pr-2">
                          <span>STAT</span>
                          <span className={`text-[7px] font-normal ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`}>DRAG ↔</span>
                        </div>
                        {/* Column Resize Handle */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-rose-500/80 transition-colors z-40"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startWidth = chartSettings.tableStatColWidth || 160;
                            const onMouseMove = (moveEvent) => {
                              const newWidth = Math.max(90, Math.min(350, startWidth + (moveEvent.clientX - startX)));
                              setChartSettings(prev => ({ ...prev, tableStatColWidth: newWidth }));
                            };
                            const onMouseUp = () => {
                              window.removeEventListener('mousemove', onMouseMove);
                              window.removeEventListener('mouseup', onMouseUp);
                            };
                            window.addEventListener('mousemove', onMouseMove);
                            window.addEventListener('mouseup', onMouseUp);
                          }}
                        />
                      </th>
                      {entities.map(entity => (
                        <th
                          key={entity.id}
                          style={{ width: chartSettings.tableEntityColWidth || 130, minWidth: 80 }}
                          className={`text-center font-black uppercase relative ${
                            isLight ? 'text-zinc-700' : 'text-zinc-400'
                          } ${
                            chartSettings.tableDensity === 'compact' ? 'px-2 py-1.5 text-[8.5px]' : chartSettings.tableDensity === 'comfortable' ? 'px-4 py-3 text-[10.5px]' : 'px-3 py-2 text-[9.5px]'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
                            <span className="truncate">{entity.name}</span>
                          </div>
                          {/* Column Resize Handle */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-rose-500/80 transition-colors z-40"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const startX = e.clientX;
                              const startWidth = chartSettings.tableEntityColWidth || 130;
                              const onMouseMove = (moveEvent) => {
                                const newWidth = Math.max(70, Math.min(280, startWidth + (moveEvent.clientX - startX)));
                                setChartSettings(prev => ({ ...prev, tableEntityColWidth: newWidth }));
                              };
                              const onMouseUp = () => {
                                window.removeEventListener('mousemove', onMouseMove);
                                window.removeEventListener('mouseup', onMouseUp);
                              };
                              window.addEventListener('mousemove', onMouseMove);
                              window.addEventListener('mouseup', onMouseUp);
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeStats.map((stat, rowIndex) => (
                      <tr
                        key={stat.id}
                        className={`transition-colors ${
                          isLight
                            ? (rowIndex % 2 === 0 ? 'bg-black/[0.015]' : 'bg-transparent')
                            : (rowIndex % 2 === 0 ? 'bg-white/[0.015]' : 'bg-transparent')
                        } ${isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.03]'}`}
                      >
                        <td
                          style={{ width: chartSettings.tableStatColWidth || 160 }}
                          className={`sticky left-0 z-10 ${
                            isLight ? 'bg-[#ebedef]' : 'bg-[#090909]'
                          } ${
                            chartSettings.tableDensity === 'compact' ? 'px-2 py-1' : chartSettings.tableDensity === 'comfortable' ? 'px-4 py-2.5' : 'px-3 py-1.5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`shrink-0 ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>{renderStatIcon(stat, 12)}</span>
                            <span className={`font-bold uppercase truncate text-[10px] ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>{stat.name}</span>
                          </div>
                        </td>
                        {entities.map(entity => {
                          const rawVal = entity.values[stat.id];
                          const isNA = rawVal === null || rawVal === undefined || rawVal === 'N/A';
                          const value = isNA ? 0 : rawVal;
                          const maxValue = Math.max(...activeStats.map(s => {
                            const v = entity.values[s.id];
                            return (v === null || v === undefined || v === 'N/A') ? 0 : v;
                          }));
                          const concentration = maxValue > 0 ? value / maxValue : 0;
                          const bgColor = ((chartSettings.tableShowHeatmap ?? true) && !isNA)
                            ? `rgba(${parseInt(entity.color.slice(1,3),16)},${parseInt(entity.color.slice(3,5),16)},${parseInt(entity.color.slice(5,7),16)},${concentration * 0.7})`
                            : 'transparent';
                          const isSelected = selectedIdSet.has(entity.id);
                          const rowOpacity = isSelected || selectedIdSet.size === 0 ? 1 : 0.2;
                          return (
                            <td
                              key={entity.id}
                              onClick={() => handleEntitySelection(entity.id)}
                              style={{
                                backgroundColor: bgColor,
                                opacity: rowOpacity,
                                width: chartSettings.tableEntityColWidth || 130,
                              }}
                              className={`text-center cursor-pointer transition-all hover:brightness-110 border-0 outline-none ${
                                isSelected ? (isLight ? 'bg-black/5 font-black' : 'bg-white/10 font-black') : ''
                              } ${
                                chartSettings.tableDensity === 'compact' ? 'px-2 py-1' : chartSettings.tableDensity === 'comfortable' ? 'px-4 py-2.5' : 'px-3 py-1.5'
                              }`}
                            >
                              <span className={`font-black tabular-nums text-[11px] ${isLight ? 'text-zinc-900' : 'text-white/95'}`}>
                                {isNA ? <span className={`text-[9px] font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>N/A</span> : value}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className={`sticky bottom-0 z-20 shadow-lg backdrop-blur-md ${
                    isLight ? 'bg-[#ebedef]/95' : 'bg-[#0c0c0c]'
                  }`}>
                    <tr>
                      <td
                        style={{ width: chartSettings.tableStatColWidth || 160 }}
                        className={`sticky left-0 z-30 font-black uppercase ${
                          isLight ? 'bg-[#ebedef]/95 text-zinc-600' : 'bg-[#0c0c0c] text-zinc-500'
                        } ${
                          chartSettings.tableDensity === 'compact' ? 'px-2 py-1.5 text-[8.5px]' : chartSettings.tableDensity === 'comfortable' ? 'px-4 py-3 text-[10px]' : 'px-3 py-2 text-[9px]'
                        }`}
                      >
                        TOTAL
                      </td>
                      {entities.map(entity => (
                        <td
                          key={entity.id}
                          style={{ width: chartSettings.tableEntityColWidth || 130 }}
                          className={`text-center ${
                            chartSettings.tableDensity === 'compact' ? 'px-2 py-1.5' : chartSettings.tableDensity === 'comfortable' ? 'px-4 py-3' : 'px-3 py-2'
                          }`}
                        >
                          <span className={`font-black tabular-nums text-[11px] ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>{entityTotals[entity.id] || 0}</span>
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
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid
                    hide={chartSettings.hideScales}
                    gridType={chartSettings.radarGridShape || 'polygon'}
                    stroke={isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)'}
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={chartSettings.hideLabels ? () => null : ({ x, y, payload }) => {
                      const stat = activeStats.find(s => s.name === payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text dy={19} textAnchor="middle" fill={isLight ? '#64748b' : '#737373'} fontSize={8} fontWeight={600}>
                            {payload.value}
                          </text>
                          {stat && (
                            <foreignObject x="-8" y="-13" width="16" height="16">
                              <div className={`flex items-center justify-center ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                {renderStatIcon(stat, 14)}
                              </div>
                            </foreignObject>
                          )}
                        </g>
                      );
                    }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={['auto', 'auto']}
                    tick={{ fill: isLight ? '#94a3b8' : '#737373', fontSize: 9, fontWeight: 500 }}
                    axisLine={true}
                    hide={chartSettings.hideScales}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {entities.map(entity => (
                    <Radar
                      key={entity.id}
                      dataKey={entity.id}
                      stroke={entity.color}
                      fill={entity.color}
                      isAnimationActive={false}
                      fillOpacity={
                        selectedIdSet.has(entity.id)
                          ? 0.4
                          : hoveredId === entity.id
                            ? 0.35
                            : selectedIdSet.size > 0 || hoveredId
                              ? 0.05
                              : 0.15
                      }
                      strokeWidth={
                        selectedIdSet.has(entity.id) ? 2 : hoveredId === entity.id ? 1.5 : 1
                      }
                      className="cursor-pointer outline-none hover-brightness"
                      onClick={() => handleEntitySelection(entity.id)}
                    />
                  ))}
                </RadarChart>
              ) : visMode === 'leaderboard' ? (
                <BarChart layout="vertical" data={leaderboardData} margin={{ left: 40, right: 40, top: 40, bottom: 40 }}>
                  <XAxis
                    type="number"
                    domain={[0, maxTotal + 10]}
                    tick={{ fill: isLight ? '#64748b' : '#999', fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    hide={chartSettings.hideScales}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isLight ? '#475569' : '#888', fontSize: 10, fontWeight: 700 }}
                    width={100}
                    hide={chartSettings.hideLabels}
                  />
                  {/* Gentle non-aggressive hover: no harsh background cursor box and no flashing */}
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar
                    dataKey="total"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                    activeBar={false}
                    onClick={data => handleEntitySelection(data.id)}
                  >
                    {leaderboardData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        fillOpacity={selectedIdSet.has(entry.id) ? 0.95 : selectedIdSet.size === 0 ? 0.82 : 0.25}
                        className="cursor-pointer outline-none transition-opacity duration-200 hover:opacity-100"
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : visMode === 'dots' ? (
                <ScatterChart margin={{ top: 16, right: 0, bottom: 20, left: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.03)'}
                    vertical={false}
                    hide={chartSettings.hideScales}
                  />
                  {(chartSettings.dotsShowGridBands ?? true) && activeStats.map((stat, index) => (
                    <ReferenceArea key={stat.id} x1={index - 0.5} x2={index + 0.5} y1="auto" y2="auto" />
                  ))}
                  <XAxis
                    type="number"
                    dataKey="xIndex"
                    domain={[-0.5, activeStats.length - 0.5]}
                    ticks={activeStats.map((_, i) => i)}
                    tickFormatter={(value) => activeStats[Number(value)]?.name || ''}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isLight ? '#475569' : '#777', fontSize: 10, fontWeight: 700 }}
                    xAxisId="xAxis"
                    hide={chartSettings.hideLabels}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={['auto', 'auto']}
                    tick={{ fill: '#aaa', fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    yAxisId="yAxis"
                    width={chartSettings.hideScales ? 0 : 34}
                    hide={chartSettings.hideScales}
                  />
                  <ZAxis type="number" dataKey="z" range={[40, 400]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
                  <Scatter
                    data={dotsData}
                    isAnimationActive={false}
                    onClick={data => handleEntitySelection(data.entityId)}
                    xAxisId="xAxis"
                    yAxisId="yAxis"
                  >
                    {dotsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        fillOpacity={selectedIdSet.has(entry.entityId) || selectedIdSet.size === 0 ? 0.8 : 0.15}
                        className="cursor-pointer outline-none hover-brightness active-brightness"
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              ) : visMode === 'parallel' ? (
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 0,
                    bottom: parallelBottomMargin + 6,
                    left: parallelLeftMargin,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)"
                    vertical
                    horizontal={false}
                    hide={hideParallelScales}
                  />
                  <XAxis
                    dataKey="subject"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    padding={{ left: 0, right: 0 }}
                    height={parallelBottomMargin}
                    tick={
                      hideParallelStatNames
                        ? false
                        : isParallelVertLabels
                          ? ({ x, y, payload }) => (
                              <g transform={`translate(${x},${y})`}>
                                <text
                                  x={0}
                                  y={0}
                                  dy={12}
                                  textAnchor="end"
                                  transform="rotate(-90)"
                                  fill={isLight ? '#64748b' : '#737373'}
                                  fontSize={8}
                                  fontWeight={600}
                                >
                                  {payload.value}
                                </text>
                              </g>
                            )
                          : { fill: isLight ? '#64748b' : '#737373', fontSize: 9, fontWeight: 500 }
                    }
                  >
                    {showParallelXTitle && (
                      <Label
                        content={({ viewBox }) => {
                          if (!viewBox || typeof viewBox.x !== 'number') return null;
                          const cx = viewBox.x + viewBox.width / 2;
                          const labelY = viewBox.y + (hideParallelStatNames
                            ? (xDistPreset === 'ultra-close' ? 24 : xDistPreset === 'close' ? 30 : 38)
                            : isParallelVertLabels
                              ? (xDistPreset === 'ultra-close' ? 74 : xDistPreset === 'close' ? 82 : 92)
                              : (xDistPreset === 'ultra-close' ? 38 : xDistPreset === 'close' ? 46 : 56));

                          const text = chartSettings.parallelXAxisTitle || 'METRICS';

                          if (editingAxis === 'x') {
                            return (
                              <foreignObject
                                x={cx - 80}
                                y={labelY - 14}
                                width={160}
                                height={28}
                                style={{ overflow: 'visible', pointerEvents: 'all' }}
                              >
                                <input
                                  autoFocus
                                  type="text"
                                  value={axisDraft}
                                  onChange={e => setAxisDraft(e.target.value)}
                                  onKeyDown={e => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveAxis('x', 'METRICS');
                                    } else if (e.key === 'Escape') {
                                      setEditingAxis(null);
                                    }
                                  }}
                                  onBlur={() => handleSaveAxis('x', 'METRICS')}
                                  placeholder="METRICS"
                                  className="w-full bg-transparent border-b-2 border-rose-500 text-center text-[10.5px] font-black uppercase text-white tracking-widest outline-none py-0.5 shadow-none selection:bg-rose-500/30"
                                />
                              </foreignObject>
                            );
                          }

                          return (
                            <g
                              className="cursor-pointer group select-none"
                              onClick={handleStartEditX}
                              style={{ pointerEvents: 'all' }}
                            >
                              <text
                                x={cx}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#9ca3af"
                                fontSize={9.5}
                                fontWeight={900}
                                letterSpacing="0.14em"
                                className="group-hover:fill-rose-400 select-none uppercase transition-colors"
                              >
                                {text}
                              </text>
                            </g>
                          );
                        }}
                      />
                    )}
                  </XAxis>
                  <YAxis
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    width={parallelLeftMargin}
                    tick={hideParallelScales ? false : { fill: '#999', fontSize: 10, fontWeight: 700 }}
                  >
                    {showParallelYTitle && (
                      <Label
                        content={({ viewBox }) => {
                          if (!viewBox || typeof viewBox.x !== 'number') return null;
                          const cy = viewBox.y + viewBox.height / 2;
                          const labelX = viewBox.x + (hideParallelScales
                            ? (yDistPreset === 'ultra-close' ? 18 : yDistPreset === 'close' ? 24 : 32)
                            : (yDistPreset === 'ultra-close' ? 16 : yDistPreset === 'close' ? 22 : 30));

                          const text = chartSettings.parallelYAxisTitle || 'VALUE';
                          const isYVert = (chartSettings.parallelYTitleOrientation || 'vertical') === 'vertical';

                          if (editingAxis === 'y') {
                            if (isYVert) {
                              return (
                                <g transform={`rotate(-90, ${labelX}, ${cy})`}>
                                  <foreignObject
                                    x={labelX - 80}
                                    y={cy - 14}
                                    width={160}
                                    height={28}
                                    style={{ overflow: 'visible', pointerEvents: 'all' }}
                                  >
                                    <input
                                      autoFocus
                                      type="text"
                                      value={axisDraft}
                                      onChange={e => setAxisDraft(e.target.value)}
                                      onKeyDown={e => {
                                        e.stopPropagation();
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveAxis('y', 'VALUE');
                                        } else if (e.key === 'Escape') {
                                          setEditingAxis(null);
                                        }
                                      }}
                                      onBlur={() => handleSaveAxis('y', 'VALUE')}
                                      placeholder="VALUE"
                                      className="w-full bg-transparent border-b-2 border-rose-500 text-center text-[10.5px] font-black uppercase text-white tracking-widest outline-none py-0.5 shadow-none selection:bg-rose-500/30"
                                    />
                                  </foreignObject>
                                </g>
                              );
                            }
                            return (
                              <foreignObject
                                x={labelX - 80}
                                y={cy - 14}
                                width={160}
                                height={28}
                                style={{ overflow: 'visible', pointerEvents: 'all' }}
                              >
                                <input
                                  autoFocus
                                  type="text"
                                  value={axisDraft}
                                  onChange={e => setAxisDraft(e.target.value)}
                                  onKeyDown={e => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveAxis('y', 'VALUE');
                                    } else if (e.key === 'Escape') {
                                      setEditingAxis(null);
                                    }
                                  }}
                                  onBlur={() => handleSaveAxis('y', 'VALUE')}
                                  placeholder="VALUE"
                                  className="w-full bg-transparent border-b-2 border-rose-500 text-center text-[10.5px] font-black uppercase text-white tracking-widest outline-none py-0.5 shadow-none selection:bg-rose-500/30"
                                />
                              </foreignObject>
                            );
                          }

                          if (isYVert) {
                            return (
                              <g
                                transform={`rotate(-90, ${labelX}, ${cy})`}
                                className="cursor-pointer group select-none"
                                onClick={handleStartEditY}
                                style={{ pointerEvents: 'all' }}
                              >
                                <text
                                  x={labelX}
                                  y={cy}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#9ca3af"
                                  fontSize={9.5}
                                  fontWeight={900}
                                  letterSpacing="0.14em"
                                  className="group-hover:fill-rose-400 select-none uppercase transition-colors"
                                >
                                  {text}
                                </text>
                              </g>
                            );
                          }

                          return (
                            <g
                              className="cursor-pointer group select-none"
                              onClick={handleStartEditY}
                              style={{ pointerEvents: 'all' }}
                            >
                              <text
                                x={labelX}
                                y={cy}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#9ca3af"
                                fontSize={9}
                                fontWeight={900}
                                letterSpacing="0.14em"
                                className="group-hover:fill-rose-400 select-none uppercase transition-colors"
                              >
                                {text}
                              </text>
                            </g>
                          );
                        }}
                      />
                    )}
                  </YAxis>
                  <Tooltip content={<CustomTooltip />} />
                  {entities.map(entity => {
                    const baseOpacity = selectedIdSet.has(entity.id)
                      ? 0.35
                      : hoveredId === entity.id
                        ? 0.25
                        : selectedIdSet.size > 0 || hoveredId
                          ? 0.02
                          : 0.1;
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
                        strokeWidth={selectedIdSet.has(entity.id) ? 3 : hoveredId === entity.id ? 2 : 1.5}
                        className="cursor-pointer outline-none hover-brightness active-brightness"
                        onClick={() => handleEntitySelection(entity.id)}
                      />
                    );
                  })}
                </AreaChart>
              ) : visMode === 'pie' ? (
                pieData.length > 0 ? (
                  <PieChart margin={{ top: 20, right: 24, bottom: 20, left: 24 }}>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      activeIndex={
                        selectedEntity
                          ? (activePieIndex === null ? undefined : activePieIndex)
                          : (hoveredId ? pieData.findIndex(d => d.id === hoveredId) : undefined)
                      }
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={chartSettings.pieDonutHole === false ? 0 : "42%"}
                      outerRadius="78%"
                      paddingAngle={chartSettings.piePaddingAngle ?? 4}
                      dataKey="value"
                      isAnimationActive={false}
                      stroke="none"
                      labelLine={false}
                      label={chartSettings.hideLabels ? false : renderCustomizedPieLabel}
                      onClick={(entry, index) => {
                        if (!selectedEntity) {
                          if (entry && entry.id) {
                            handleEntitySelection(entry.id);
                          }
                        } else {
                          setActivePieIndex(prev => (prev === index ? null : index));
                        }
                      }}
                    >
                      {pieData.map((entry, index) => {
                        const isCurrentHovered = !selectedEntity && hoveredId === entry.id;
                        const cellFill = selectedEntity ? selectedEntity.color : entry.color;
                        const cellOpacity = selectedEntity
                          ? (0.25 + (entry.value / 100) * 0.75)
                          : (isCurrentHovered ? 1 : 0.85);

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={cellFill}
                            fillOpacity={cellOpacity}
                            stroke={isCurrentHovered ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.3)'}
                            strokeWidth={isCurrentHovered ? 2 : 1}
                            className="cursor-pointer outline-none hover-brightness active-brightness"
                            onMouseEnter={() => {
                              if (!selectedEntity && entry.id) handleMouseEnterItem(entry.id);
                            }}
                            onMouseLeave={() => {
                              if (!selectedEntity) handleMouseLeaveItem();
                            }}
                          />
                        );
                      })}
                      <Label
                        position="center"
                        content={({ viewBox }) => {
                          if (!viewBox) return null;
                          const { x, y, width, height } = viewBox;
                          const cx = x + width / 2;
                          const cy = y + height / 2;
                          if (selectedEntity) {
                            return (
                              <g
                                className="cursor-pointer select-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEntitySelection(selectedEntity.id);
                                }}
                              >
                                <text x={cx} y={cy - 12} textAnchor="middle" dominantBaseline="central" fill={isLight ? '#18181b' : '#fff'} fontSize="18" fontWeight="900" letterSpacing="0.05em">
                                  {selectedEntity.name}
                                </text>
                                <circle cx={cx} cy={cy + 10} r="5" fill={selectedEntity.color} />
                                <text x={cx} y={cy + 28} textAnchor="middle" dominantBaseline="central" fill={selectedEntity.color} fontSize="14" fontWeight="800">
                                  TOTAL: {entityTotals[selectedEntity.id] || 0}
                                </text>
                              </g>
                            );
                          }
                          return (
                            <g className="select-none">
                              <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="central" fill={isLight ? '#18181b' : '#fff'} fontSize="18" fontWeight="900" letterSpacing="0.05em">
                                ALL ENTITIES
                              </text>
                              <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central" fill={isLight ? '#71717a' : '#a1a1aa'} fontSize="13" fontWeight="800">
                                {pieData.length} ACTIVE
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Pie>
                  </PieChart>
                ) : (
                  <div />
                )
              ) : (
                <div />
              )}
            </ResponsiveContainer>
          )}

          {visMode === 'pie' && pieData.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none animate-fade-in">
              <PieChartIcon size={48} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">
                No visible entities to display
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visualization mode selector */}
      <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-40">
        <div className={`flex items-center backdrop-blur-xl border rounded-full p-1 pointer-events-auto animate-fade-in-down transition-all duration-200 ${
          isLight
            ? 'bg-[#ebedef]/90 border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-zinc-800'
            : 'bg-black/60 border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-zinc-300'
        }`}>
          <div className={`flex items-center gap-0.5 pr-1 border-r mr-1 ${isLight ? 'border-black/[0.08]' : 'border-white/10'}`}>
            {[
              { id: 'radar', icon: Target, label: 'Radar' },
              { id: 'parallel', icon: Activity, label: 'Parallel' },
              { id: 'dots', icon: CircleDot, label: 'Dots' },
              { id: 'pie', icon: PieChartIcon, label: 'Pie' },
              { id: 'heatmap', icon: Grid, label: 'Table' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setVisMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] uppercase tracking-wider transition-all duration-200 ease-out cursor-pointer ${
                  visMode === mode.id
                    ? isLight
                      ? 'font-semibold text-rose-600 bg-rose-500/10 border-0 border-transparent shadow-none ring-0 outline-none'
                      : 'font-semibold text-rose-400 bg-rose-500/15 backdrop-blur-md border-0 border-transparent shadow-none ring-0 outline-none'
                    : isLight
                      ? 'font-normal text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] border-0 border-transparent'
                      : 'font-normal text-zinc-400 hover:text-zinc-100 hover:bg-white/10 border-0 border-transparent'
                }`}
              >
                <mode.icon size={11} className={visMode === mode.id ? 'opacity-100 text-rose-500' : isLight ? 'opacity-90 text-zinc-700' : 'opacity-90 text-zinc-300'} />
                <span className="hidden lg:inline">{mode.label}</span>
              </button>
            ))}
            <button
              onClick={() => setVisMode('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] uppercase tracking-wider transition-all duration-200 ease-out cursor-pointer ${
                visMode === 'leaderboard'
                  ? isLight
                    ? 'font-semibold text-amber-700 bg-amber-500/10 border-0 border-transparent shadow-none ring-0 outline-none'
                    : 'font-semibold text-amber-400 bg-amber-500/15 backdrop-blur-md border-0 border-transparent shadow-none ring-0 outline-none'
                  : isLight
                    ? 'font-normal text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] border-0 border-transparent'
                    : 'font-normal text-zinc-400 hover:text-zinc-100 hover:bg-white/10 border-0 border-transparent'
              }`}
            >
              <Trophy size={11} className={visMode === 'leaderboard' ? 'opacity-100 text-amber-500' : isLight ? 'opacity-90 text-zinc-700' : 'opacity-90 text-zinc-300'} />
              <span className="hidden lg:inline">Board</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {(zoomX !== 1 || zoomY !== 1 || offset.x !== 0 || offset.y !== 0) && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[7.5px] font-mono font-bold uppercase border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-black/[0.04] border-black/10 text-zinc-600 hover:bg-black/[0.08]'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
                onClick={resetView}
                title="Click to reset view • Scroll: X&Y • Ctrl+Scroll: X (Horizontal) • Shift+Scroll: Y (Vertical)"
              >
                <span>X: {zoomX.toFixed(1)}x</span>
                <span className="opacity-40">•</span>
                <span>Y: {zoomY.toFixed(1)}x</span>
              </div>
            )}
            <button
              onClick={resetView}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-out cursor-pointer ${
                isLight
                  ? 'text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.05]'
                  : 'text-zinc-200 hover:text-white hover:bg-white/10'
              }`}
              title="Reset View (Scroll: X&Y • Ctrl+Scroll: X only • Shift+Scroll: Y only)"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom entity monitor strip */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4 gap-2 pointer-events-none transition-all duration-200 ease-out z-40 ${
          bottomCollapsed ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'
        }`}
      >
        <button
          onClick={() => setBottomCollapsed(prev => !prev)}
          className={`pointer-events-auto backdrop-blur-xl border p-1.5 rounded-full transition-all duration-200 ease-out shadow-lg cursor-pointer ${
            isLight
              ? 'bg-[#ebedef]/90 border-black/[0.08] text-zinc-600 hover:text-zinc-950 hover:bg-[#e2e4e8]'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-black/80'
          }`}
          title={bottomCollapsed ? 'Expand monitor strip' : 'Collapse monitor strip'}
        >
          {bottomCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div className={`max-w-[95%] w-fit backdrop-blur-xl border rounded-2xl p-1.5 flex items-center gap-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden animate-fade-in-up transition-colors duration-200 ${
          isLight
            ? 'bg-[#ebedef]/90 border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
            : 'bg-black/60 border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)]'
        }`}>
          {paginatedEntities.map(entity => (
            <div
              key={entity.id}
              onMouseDown={(e) => handleMouseDownItem(entity.id, e)}
              onMouseUp={() => handleMouseUpItem(entity.id)}
              onMouseEnter={() => handleMouseEnterItem(entity.id)}
              onMouseLeave={handleMouseLeaveItem}
              onMouseMove={handleMouseMoveItem}
              style={{
                backgroundColor: selectedIdSet.has(entity.id)
                  ? `${entity.color}25`
                  : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                borderColor: selectedIdSet.has(entity.id)
                  ? 'transparent'
                  : isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
              }}
              className={`min-w-[80px] px-2 py-1.5 rounded-xl ${selectedIdSet.has(entity.id) ? 'border-0 border-transparent shadow-none' : 'border'} flex flex-col gap-1 transition-all duration-200 ease-out cursor-pointer backdrop-blur-sm ${
                selectedIdSet.has(entity.id)
                  ? ''
                  : isLight ? 'hover:bg-white hover:border-black/[0.12]' : 'hover:bg-white/10 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
                <span className={`text-[8px] uppercase truncate transition-colors duration-200 ease-out ${
                  selectedIdSet.has(entity.id)
                    ? (isLight ? 'text-zinc-950 font-bold' : 'text-white font-bold')
                    : (isLight ? 'text-zinc-600 font-medium' : 'text-zinc-400 font-medium')
                }`}>
                  {entity.name}
                </span>
              </div>
              <div className={`w-full h-1 rounded-full overflow-hidden ${isLight ? 'bg-black/10' : 'bg-white/10'}`}>
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${activeStats.length ? ((entityTotals[entity.id] || 0) / (activeStats.length * 100)) * 100 : 0}%`,
                    backgroundColor: entity.color,
                  }}
                />
              </div>
            </div>
          ))}
          <div className={`flex items-center gap-1.5 ml-2 pl-2 border-l ${isLight ? 'border-black/[0.08]' : 'border-white/10'}`}>
            <button
              disabled={monitorPage === 0}
              onClick={() => setMonitorPage(p => Math.max(0, p - 1))}
              className={`p-1 rounded-lg disabled:opacity-25 transition-all duration-200 ease-out cursor-pointer ${
                isLight ? 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05]' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronUp size={12} />
            </button>
            <span className={`text-[7px] font-black tabular-nums uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {monitorPage + 1}/{totalPages || 1}
            </span>
            <button
              disabled={monitorPage >= totalPages - 1}
              onClick={() => setMonitorPage(p => Math.min(Math.max(0, totalPages - 1), p + 1))}
              className={`p-1 rounded-lg disabled:opacity-25 transition-all duration-200 ease-out cursor-pointer ${
                isLight ? 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05]' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronDown size={12} />
            </button>

            {/* Settings button on entity monitor */}
            <div className={`h-4 w-px mx-0.5 ${isLight ? 'border-black/[0.08]' : 'bg-white/10'}`} />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-1 rounded-lg transition-all duration-200 ease-out flex items-center justify-center group cursor-pointer ${
                isLight ? 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05]' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Configure Graph Settings"
            >
              <Settings size={12} className="group-hover:rotate-90 transition-transform duration-300 group-hover:text-rose-500" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
});

VisualizationArea.displayName = 'VisualizationArea';
export default VisualizationArea;
