import React, { useState, useCallback } from 'react';
import {
  Download, Upload, Maximize2, Minimize2,
  Image as ImageIcon, ChevronLeft, ChevronRight,
  Undo2, Redo2, Copy, Scissors, Save, EyeOff,
  Bell, Sun, Moon,
} from 'lucide-react';
import { Sector } from 'recharts';

import { useAppState } from './hooks/useAppState.js';
import { ANIMATION_STYLES } from './constants/styles.js';

import VisualizationArea from './components/VisualizationArea.jsx';
import FiltersPanel from './components/FiltersPanel.jsx';
import RightPanel from './components/RightPanel.jsx';
import ProjectsMenu from './components/ProjectsMenu.jsx';
import IconPickerModal from './components/IconPickerModal.jsx';
import ChartSettingsModal from './components/ChartSettingsModal.jsx';
import PngExportModal from './components/PngExportModal.jsx';
import FormulaEditorModal from './components/FormulaEditorModal.jsx';
import ThresholdModal from './components/ThresholdModal.jsx';
import NotificationsToast from './components/NotificationsToast.jsx';
import Toast from './components/Toast.jsx';

// ─── CustomTooltip ───────────────────────────────────────────────────────────
// Defined here (not in the hook) because it renders JSX and needs to be a
// stable reference passed as a recharts `content` prop.
const makeCustomTooltip = (topPerformers, theme = 'dark') => {
  const isLight = theme === 'light';
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const dataPoint = payload[0].payload;

    if (dataPoint.isEntityChunk) {
      return (
        <div className={`backdrop-blur-xl border p-3 rounded-xl min-w-[130px] animate-scale-in transition-all ${
          isLight
            ? 'bg-[#ebedef]/95 border-black/10 text-zinc-900 shadow-[0_12px_32px_rgba(0,0,0,0.08)]'
            : 'bg-black/75 border-white/10 text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)]'
        }`}>
          <div className={`flex items-center gap-2 mb-1.5 border-b pb-1 ${isLight ? 'border-black/10' : 'border-white/5'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dataPoint.color }} />
            <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-zinc-900' : 'text-white'}`}>{dataPoint.name}</span>
          </div>
          <div className={`flex items-center justify-between text-[9px] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <span className="uppercase font-bold text-zinc-500">Total Score</span>
            <span className={`font-black tabular-nums ${isLight ? 'text-zinc-900' : 'text-white'}`}>{dataPoint.total}</span>
          </div>
          <p className="text-[7px] font-black uppercase text-zinc-500 tracking-tighter mt-1">Click chunk to view stats</p>
        </div>
      );
    }

    if (dataPoint.rawValue !== undefined) {
      return (
        <div className={`backdrop-blur-xl border p-3 rounded-xl min-w-[120px] animate-scale-in transition-all ${
          isLight
            ? 'bg-[#ebedef]/95 border-black/10 text-zinc-900 shadow-[0_12px_32px_rgba(0,0,0,0.08)]'
            : 'bg-black/75 border-white/10 text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)]'
        }`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1.5 border-b pb-1 border-white/5">
            {dataPoint.name}
          </p>
          <div className={`flex items-center justify-between text-[9px] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <span className="uppercase font-bold text-zinc-500">Value</span>
            <span className={`font-black tabular-nums ${isLight ? 'text-zinc-900' : 'text-white'}`}>{dataPoint.rawValue}</span>
          </div>
        </div>
      );
    }

    if (dataPoint.total !== undefined && !dataPoint.statId) {
      return (
        <div className={`backdrop-blur-xl border p-2.5 rounded-xl min-w-[120px] animate-scale-in transition-all ${
          isLight
            ? 'bg-[#ebedef]/95 border-black/10 text-zinc-900 shadow-[0_12px_32px_rgba(0,0,0,0.08)]'
            : 'bg-black/75 border-white/10 text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)]'
        }`}>
          <div className={`flex items-center gap-2 mb-1.5 border-b pb-1 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dataPoint.color }} />
            <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-zinc-900' : 'text-white'}`}>{dataPoint.name}</span>
          </div>
          <div className={`flex items-center justify-between text-[9px] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <span className="uppercase font-bold text-zinc-500">Board Total</span>
            <span className={`font-black tabular-nums ${isLight ? 'text-zinc-900' : 'text-white'}`}>{dataPoint.total}</span>
          </div>
        </div>
      );
    }

    const statId = dataPoint.statId;
    const top3 = statId ? (topPerformers.get(statId) || []) : [];
    return (
      <div className={`backdrop-blur-xl border p-3 rounded-xl min-w-[140px] animate-scale-in transition-all ${
        isLight
          ? 'bg-[#ebedef]/95 border-black/10 text-zinc-900 shadow-[0_12px_32px_rgba(0,0,0,0.08)]'
          : 'bg-black/75 border-white/10 text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)]'
      }`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 border-b pb-1 border-white/5">
          {dataPoint.statName || label || 'METRIC'}
        </p>
        <div className="space-y-1.5">
          <p className="text-[7px] font-black uppercase text-zinc-500 tracking-tighter mb-1">Top Performers</p>
          {top3.map((performer, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: performer.color }} />
                <span className={`text-[9px] font-bold uppercase ${isLight ? 'text-zinc-800' : 'text-white'}`}>{performer.name}</span>
              </div>
              <span className={`text-[9px] font-black tabular-nums ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{performer.val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return CustomTooltip;
};

// ─── Pie render helpers ───────────────────────────────────────────────────────
const makeRenderCustomizedPieLabel = (activePieIndex, selectedEntity, theme = 'dark') =>
  ({ cx, cy, midAngle, outerRadius, index, name, payload }) => {
    const isLight = theme === 'light';
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const isSliceActive = activePieIndex === index;
    const radiusBoost = isSliceActive ? 15 : 0;
    const sx = cx + (outerRadius + 4 + radiusBoost) * cos;
    const sy = cy + (outerRadius + 4 + radiusBoost) * sin;
    const mx = cx + (outerRadius + 20 + radiusBoost) * cos;
    const my = cy + (outerRadius + 20 + radiusBoost) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
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
          x={ex + (cos >= 0 ? 1 : -1) * 10}
          y={ey}
          textAnchor={textAnchor}
          fontSize={15}
          fontWeight="900"
          dominantBaseline="central"
          className="uppercase tracking-wider"
        >
          <tspan fill={isLight ? (isSliceActive ? '#09090b' : '#27272a') : (isSliceActive ? '#ffffff' : '#f4f4f5')}>{name}</tspan>
          <tspan fill={isLight ? '#52525b' : '#a1a1aa'} fontSize={13} fontWeight="800" dx={8}>{formattedVal}</tspan>
        </text>
      </g>
    );
  };

const renderActiveShape = props => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 15}
        startAngle={startAngle} endAngle={endAngle} fill={fill} fillOpacity={0.1} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
    </g>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const state = useAppState();
  const [editingFormulaStat, setEditingFormulaStat] = useState(null);
  const [thresholdModalConfig, setThresholdModalConfig] = useState(null);

  // Derive render helpers that depend on state — stable via inline useMemo pattern.
  const CustomTooltip = useCallback(
    makeCustomTooltip(state.topPerformers, state.theme),
    [state.topPerformers, state.theme]
  );

  const renderCustomizedPieLabel = useCallback(
    makeRenderCustomizedPieLabel(state.activePieIndex, state.selectedEntity, state.theme),
    [state.activePieIndex, state.selectedEntity, state.theme]
  );

  const isLight = state.theme === 'light';

  return (
    <div
      className={`h-screen w-full font-mono flex flex-col overflow-hidden select-none transition-colors duration-200 ${
        isLight ? 'bg-[#e4e6e9] text-zinc-800' : 'bg-[#080808] text-zinc-500'
      }`}
      onContextMenu={e => e.preventDefault()}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`h-12 border-b flex items-center px-6 shrink-0 justify-between z-[100] animate-fade-in-down transition-colors duration-200 ${
        isLight ? 'bg-[#eceef1]/95 backdrop-blur-md border-black/[0.08] text-zinc-800' : 'bg-[#080808] border-white/5 text-zinc-400'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex gap-4">
            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); state.setShowExportDropdown(prev => !prev); }}
                className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ease-out cursor-pointer ${
                  isLight ? 'hover:text-zinc-950 text-zinc-700' : 'hover:text-white text-zinc-400'
                }`}
              >
                <Download size={12} className={isLight ? 'text-zinc-600' : 'text-zinc-600'} />
                Export
              </button>
              {state.showExportDropdown && (
                <div className={`absolute top-full left-0 mt-1 border rounded shadow-xl py-1 z-50 ${
                  isLight ? 'bg-[#ebedef] border-black/10 text-zinc-800' : 'bg-[#0d0d0d] border-white/10 text-white'
                }`}>
                  <button onClick={state.handleExport} className={`block w-full text-left px-4 py-1 text-[9px] font-bold uppercase ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}>JSON</button>
                  <button onClick={state.handleCsvExport} className={`block w-full text-left px-4 py-1 text-[9px] font-bold uppercase ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}>CSV</button>
                </div>
              )}
            </div>

            {/* Import dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); state.setShowImportDropdown(prev => !prev); }}
                className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ease-out cursor-pointer ${
                  isLight ? 'hover:text-zinc-950 text-zinc-700' : 'hover:text-white text-zinc-400'
                }`}
              >
                <Upload size={12} className={isLight ? 'text-zinc-600' : 'text-zinc-600'} />
                Import
              </button>
              {state.showImportDropdown && (
                <div className={`absolute top-full left-0 mt-1 border rounded-lg py-1 z-50 ${
                  isLight
                    ? 'bg-white border-black/10 text-zinc-800 shadow-[0_15px_35px_rgba(0,0,0,0.35),0_5px_15px_rgba(0,0,0,0.15)]'
                    : 'bg-[#0d0d0d] border-white/10 text-white shadow-xl'
                }`}>
                  <label className={`block w-full text-left px-4 py-1 text-[9px] font-bold uppercase cursor-pointer ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}>
                    JSON
                    <input type="file" accept=".json" onChange={state.handleImport} className="hidden" />
                  </label>
                  <label className={`block w-full text-left px-4 py-1 text-[9px] font-bold uppercase cursor-pointer ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}>
                    CSV
                    <input type="file" accept=".csv" onChange={state.handleCsvImport} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Projects menu beside Import */}
            <ProjectsMenu
              isOpen={state.showProjectsDropdown}
              setIsOpen={state.setShowProjectsDropdown}
              projects={state.projects}
              selectedProjectId={state.selectedProjectId}
              onSaveProject={state.saveProject}
              onLoadProject={state.loadProject}
              onDeleteProject={state.deleteProject}
              theme={state.theme}
            />

            {/* Undo / Redo & Clipboard quick buttons (CTRL+Z, CTRL+SHIFT+Z, CTRL+X, CTRL+C, CTRL+S, CTRL+H) */}
            <div className={`flex items-center gap-1 pl-2 border-l ${isLight ? 'border-black/[0.08]' : 'border-white/10'}`}>
              <button
                onClick={state.undo}
                className={`transition-all p-1 rounded cursor-pointer ${isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={13} />
              </button>
              <button
                onClick={state.redo}
                className={`transition-all p-1 rounded cursor-pointer ${isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 size={13} />
              </button>
              <div className={`w-px h-3 my-auto mx-0.5 ${isLight ? 'bg-black/[0.08]' : 'bg-white/5'}`} />
              <button
                onClick={state.cutSelected}
                className={`transition-all p-1 rounded cursor-pointer ${isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                title="Cut selected entity (Ctrl+X)"
              >
                <Scissors size={12} />
              </button>
              <button
                onClick={state.copySelected}
                className={`transition-all p-1 rounded cursor-pointer ${isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                title="Copy selected entity (Ctrl+C)"
              >
                <Copy size={12} />
              </button>
              <div className={`w-px h-3 my-auto mx-0.5 ${isLight ? 'bg-black/[0.08]' : 'bg-white/5'}`} />
              <button
                onClick={state.quickSaveProject}
                className={`transition-all p-1 rounded cursor-pointer ${isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                title="Quick Save Project (Ctrl+S)"
              >
                <Save size={12} />
              </button>
              <button
                onClick={state.hideSelectedOrPanels}
                className={`transition-all p-1 rounded cursor-pointer ${isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                title="Hide / Toggle (Ctrl+H)"
              >
                <EyeOff size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`text-[9px] font-bold uppercase tracking-tighter hidden md:flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <span>
              {typeof state.zoom === 'object' && state.zoom !== null
                ? state.zoom.x === state.zoom.y
                  ? `Z: ${state.zoom.x.toFixed(1)}x`
                  : `ZX: ${state.zoom.x.toFixed(1)}x • ZY: ${state.zoom.y.toFixed(1)}x`
                : `Z: ${(Number(state.zoom) || 1).toFixed(1)}x`}
            </span>
            <span className="opacity-40">|</span>
            <span>Δ: {state.offset.x}, {state.offset.y}</span>
          </div>
          {state.thresholdNotifications.length > 0 && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-[8px] font-bold cursor-pointer hover:bg-red-500/20 transition-colors"
              onClick={() => {
                if (state.thresholdNotifications[0]?.entityId) {
                  state.handleEntitySelection(state.thresholdNotifications[0].entityId);
                  if (state.rightCollapsed) state.setRightCollapsed(false);
                }
              }}
              title="Click to view latest threshold alert"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>{state.thresholdNotifications.length} Alert{state.thresholdNotifications.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className={`h-3 w-px ${isLight ? 'bg-black/[0.08]' : 'bg-white/10'}`} />
          <button
            onClick={state.toggleAllPanels}
            className={`transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer ${
              isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-600 hover:text-white'
            }`}
          >
            {state.allPanelsCollapsed ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={state.handlePngExport}
            className={`transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer ${
              isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-600 hover:text-white'
            }`}
            title="Export as PNG"
          >
            <ImageIcon size={14} />
          </button>

          {/* Light Mode Switch */}
          <div className={`h-3 w-px ${isLight ? 'bg-black/[0.08]' : 'bg-white/10'}`} />
          <button
            onClick={state.toggleTheme}
            className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
              isLight
                ? 'bg-amber-500/15 border border-amber-500/25 text-amber-950 hover:bg-amber-500/20'
                : 'bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 backdrop-blur-md'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle light / dark mode"
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
              isLight ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40'
            }`}>
              {isLight ? <Sun size={10} className="stroke-[2.5]" /> : <Moon size={10} className="stroke-[2.5]" />}
            </div>
          </button>
        </div>
      </header>

      <Toast message={state.toast} />

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left panel */}
        <div
          id="left-panel"
          style={{ width: state.leftCollapsed ? 0 : state.leftWidth }}
          className="shrink-0 transition-all duration-500 ease-out relative z-20 overflow-hidden h-full"
        >
          {!state.leftCollapsed && (
            <FiltersPanel
              theme={state.theme}
              stats={state.stats}
              anyFilterActive={state.anyFilterActive}
              clearFilters={state.clearFilters}
              addNewStat={state.addNewStat}
              onEditFormula={setEditingFormulaStat}
              toggleStatVisibility={state.toggleStatVisibility}
              toggleStatDisabled={state.toggleStatDisabled}
              openIconPicker={state.openIconPicker}
              updateStatName={state.updateStatName}
              setEditingStat={state.setEditingStat}
              deleteStat={state.deleteStat}
              activeIconPicker={state.activeIconPicker}
              setActiveIconPicker={state.setActiveIconPicker}
              iconSearch={state.iconSearch}
              setIconSearch={state.setIconSearch}
              filteredIcons={state.filteredIcons}
              updateStatIcon={state.updateStatIcon}
              actionHistory={state.actionHistory}
              onRestoreAction={state.restoreActionHistory}
              onClearActionHistory={state.clearActionHistory}
              entities={state.entities}
              metricThresholdRange={state.metricThresholdRange}
              onSelectEntity={state.handleEntitySelection}
              onOpenStatThreshold={(stat) => setThresholdModalConfig({
                targetType: 'stat',
                targetId: stat.id,
                targetTitle: stat.name,
                initialMin: stat.min ?? 0,
                initialMax: stat.max ?? 100,
              })}
            />
          )}
        </div>

        {!state.leftCollapsed && (
          <div
            className={`w-1 cursor-col-resize shrink-0 z-20 transition-colors ${
              isLight ? 'hover:bg-black/10' : 'hover:bg-white/10'
            }`}
            onMouseDown={() => {
              state.isResizingLeft.current = true;
              document.body.style.cursor = 'col-resize';
            }}
          />
        )}

        <button
          onClick={() => state.setLeftCollapsed(prev => !prev)}
          className={`absolute z-40 border p-1 rounded-r-md transition-all duration-200 ease-out top-1/2 -translate-y-1/2 cursor-pointer shadow-md ${
            isLight
              ? 'bg-[#ebedef] border-black/[0.08] text-zinc-700 hover:text-zinc-950 hover:bg-[#e2e4e8]'
              : 'bg-[#0a0a0a] border-white/10 text-zinc-600 hover:text-white hover:bg-white/5'
          }`}
          style={{ left: state.leftCollapsed ? '0px' : `${state.leftWidth}px` }}
        >
          {state.leftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Centre visualization */}
        <VisualizationArea
          theme={state.theme}
          visMode={state.visMode}
          chartData={state.chartData}
          entities={state.visibleEntities}
          selectedIdSet={state.selectedIdSet}
          hoveredId={state.hoveredId}
          selectedEntity={state.selectedEntity}
          activeStats={state.activeStats}
          entityTotals={state.entityTotals}
          leaderboardData={state.leaderboardData}
          dotsData={state.dotsData}
          pieData={state.pieData}
          zoom={state.zoom}
          offset={state.offset}
          handleWheel={state.handleWheel}
          handleChartMouseDown={state.handleChartMouseDown}
          resetView={state.resetView}
          setVisMode={state.setVisMode}
          handleEntitySelection={state.handleEntitySelection}
          CustomTooltip={CustomTooltip}
          renderCustomizedPieLabel={renderCustomizedPieLabel}
          renderActiveShape={renderActiveShape}
          bottomCollapsed={state.bottomCollapsed}
          setBottomCollapsed={state.setBottomCollapsed}
          monitorPage={state.monitorPage}
          setMonitorPage={state.setMonitorPage}
          paginatedEntities={state.paginatedEntities}
          handleMouseDownItem={state.handleMouseDownItem}
          handleMouseUpItem={state.handleMouseUpItem}
          handleMouseEnterItem={state.handleMouseEnterItem}
          handleMouseLeaveItem={state.handleMouseLeaveItem}
          handleMouseMoveItem={state.handleMouseMoveItem}
          totalPages={state.totalPages}
          activePieIndex={state.activePieIndex}
          setActivePieIndex={state.setActivePieIndex}
          maxTotal={state.maxTotal}
          chartSettings={state.chartSettings}
          setChartSettings={state.setChartSettings}
          setIsSettingsOpen={state.setIsSettingsOpen}
        />

        {/* Right resize handle */}
        {!state.rightCollapsed && (
          <div
            className={`w-1 cursor-col-resize shrink-0 z-20 transition-colors ${
              isLight ? 'hover:bg-black/10' : 'hover:bg-white/10'
            }`}
            onMouseDown={() => {
              state.isResizingRight.current = true;
              document.body.style.cursor = 'col-resize';
            }}
          />
        )}

        {/* Right panel */}
        <div
          style={{ width: state.rightCollapsed ? 0 : state.rightWidth }}
          className="shrink-0 transition-all duration-500 ease-out relative z-20 overflow-hidden h-full"
        >
          {!state.rightCollapsed && (
            <RightPanel
              theme={state.theme}
              rightSplit={state.rightSplit}
              onStartSplitResize={state.handleStartSplitResize}
              rightAsideRef={state.rightAsideRef}
              registryView={state.registryView}
              setRegistryView={state.setRegistryView}
              sortedEntities={state.sortedEntities}
              selectedIdSet={state.selectedIdSet}
              entityTotals={state.entityTotals}
              handleEntitySelection={state.handleEntitySelection}
              setHoveredId={state.setHoveredId}
              addNewEntity={state.addNewEntity}
              selectedEntity={state.selectedEntity}
              setEntities={state.setEntities}
              removeEntity={state.removeEntity}
              toggleEntityVisibility={state.toggleEntityVisibility}
              stats={state.stats}
              setStats={state.setStats}
              openIconPicker={state.openIconPicker}
              updateStatValue={state.updateStatValue}
              onEditFormula={setEditingFormulaStat}
              metricThresholdRange={state.metricThresholdRange}
              setMetricThresholdRange={state.setMetricThresholdRange}
              thresholdAlertsEnabled={state.thresholdAlertsEnabled}
              toggleAllThresholdAlerts={state.toggleAllThresholdAlerts}
              entityThresholds={state.entityThresholds}
              globalEntityThreshold={state.globalEntityThreshold}
              thresholdAnalysis={state.thresholdAnalysis}
              onOpenEntityThreshold={(entity) => setThresholdModalConfig({
                targetType: 'entity',
                targetId: entity.id,
                targetTitle: entity.name,
                initialMin: state.entityThresholds?.[entity.id]?.min ?? state.globalEntityThreshold?.min ?? null,
                initialMax: state.entityThresholds?.[entity.id]?.max ?? state.globalEntityThreshold?.max ?? null,
              })}
              onOpenAllEntitiesThreshold={() => setThresholdModalConfig({
                targetType: 'all-entities',
                targetTitle: 'All Entities',
                initialMin: state.globalEntityThreshold?.min ?? null,
                initialMax: state.globalEntityThreshold?.max ?? null,
              })}
              updateEntityThreshold={state.updateEntityThreshold}
              onOpenStatThreshold={(stat) => setThresholdModalConfig({
                targetType: 'stat',
                targetId: stat.id,
                targetTitle: stat.name,
                initialMin: stat.min ?? 0,
                initialMax: stat.max ?? 100,
              })}
            />
          )}
        </div>

        <button
          onClick={() => state.setRightCollapsed(prev => !prev)}
          className={`absolute z-40 border p-1 rounded-l-md transition-all duration-200 ease-out top-1/2 -translate-y-1/2 cursor-pointer shadow-md ${
            isLight
              ? 'bg-[#ebedef] border-black/[0.08] text-zinc-700 hover:text-zinc-950 hover:bg-[#e2e4e8]'
              : 'bg-[#0a0a0a] border-white/10 text-zinc-600 hover:text-white hover:bg-white/5'
          }`}
          style={{ right: state.rightCollapsed ? '0px' : `${state.rightWidth}px` }}
        >
          {state.rightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* ── Threshold Notifications Toast Stack ────────────────────────────── */}
      <NotificationsToast
        notifications={state.thresholdNotifications}
        onSelectEntity={(entityId) => {
          state.handleEntitySelection(entityId);
          if (state.rightCollapsed) state.setRightCollapsed(false);
        }}
        onDismiss={state.dismissNotification}
        onClearAll={state.clearAllNotifications}
      />

      {/* ── Threshold Configuration Modal (Root Level z-[300]) ─────────────── */}
      {thresholdModalConfig && (
        <ThresholdModal
          isOpen={Boolean(thresholdModalConfig)}
          onClose={() => setThresholdModalConfig(null)}
          targetType={thresholdModalConfig.targetType}
          targetTitle={thresholdModalConfig.targetTitle}
          initialMin={thresholdModalConfig.initialMin}
          initialMax={thresholdModalConfig.initialMax}
          onSave={({ min, max }) => {
            if (thresholdModalConfig.targetType === 'entity') {
              state.updateEntityThreshold(thresholdModalConfig.targetId, { min, max });
            } else if (thresholdModalConfig.targetType === 'all-entities') {
              state.updateAllEntitiesThreshold({ min, max });
            } else if (thresholdModalConfig.targetType === 'stat') {
              state.setStats(prev => prev.map(s => s.id === thresholdModalConfig.targetId ? {
                ...s,
                min: min !== null ? min : 0,
                max: max !== null ? max : 100,
              } : s));
            } else if (thresholdModalConfig.targetType === 'all-stats') {
              state.setMetricThresholdRange({ enabled: true, min: min ?? 30, max: max ?? 85 });
              state.setStats(prev => prev.map(s => ({
                ...s,
                min: min !== null ? min : 0,
                max: max !== null ? max : 100,
              })));
            }
          }}
          onClear={() => {
            if (thresholdModalConfig.targetType === 'entity') {
              state.updateEntityThreshold(thresholdModalConfig.targetId, { min: null, max: null });
            } else if (thresholdModalConfig.targetType === 'all-entities') {
              state.updateAllEntitiesThreshold({ min: null, max: null });
            } else if (thresholdModalConfig.targetType === 'stat') {
              state.setStats(prev => prev.map(s => s.id === thresholdModalConfig.targetId ? {
                ...s,
                min: 0,
                max: 100,
              } : s));
            } else if (thresholdModalConfig.targetType === 'all-stats') {
              state.setMetricThresholdRange({ enabled: false, min: 30, max: 85 });
            }
          }}
          theme={state.theme}
        />
      )}

      {/* ── Icon Picker Modal (Root Level z-[300]) ────────────────────────── */}
      <IconPickerModal
        activeIconPicker={state.activeIconPicker}
        onClose={() => state.setActiveIconPicker(null)}
        stats={state.stats}
        filteredIcons={state.filteredIcons}
        iconSearch={state.iconSearch}
        setIconSearch={state.setIconSearch}
        onSelectIcon={state.updateStatIcon}
        theme={state.theme}
      />

      {/* ── Chart Settings Modal (Root Level z-[300]) ─────────────────────── */}
      <ChartSettingsModal
        isOpen={state.isSettingsOpen}
        onClose={() => state.setIsSettingsOpen(false)}
        visMode={state.visMode}
        settings={state.chartSettings}
        onUpdateSettings={state.setChartSettings}
        onResetSettings={state.resetChartSettings}
        theme={state.theme}
      />

      {/* ── Formula Editor Modal (Root Level z-[300]) ──────────────────────── */}
      {editingFormulaStat && (
        <FormulaEditorModal
          stat={editingFormulaStat}
          allStats={state.stats}
          allEntities={state.entities}
          selectedEntity={state.selectedEntity}
          onSave={(updatedStat) => {
            state.setStats(prev => prev.map(s => s.id === updatedStat.id ? updatedStat : s));
          }}
          onClose={() => setEditingFormulaStat(null)}
          theme={state.theme}
        />
      )}

      {/* ── PNG export modal ────────────────────────────────────────────────── */}
      {state.showPngExport && (
        <PngExportModal
          theme={state.theme}
          renderCustomizedPieLabel={renderCustomizedPieLabel}
          visMode={state.visMode}
          chartData={state.chartData}
          entities={state.entities}
          activeStats={state.activeStats}
          selectedIdSet={state.selectedIdSet}
          selectedEntity={state.selectedEntity}
          pieData={state.pieData}
          dotsData={state.dotsData}
          leaderboardData={state.leaderboardData}
          maxTotal={state.maxTotal}
          entityTotals={state.entityTotals}
          stats={state.stats}
          chartSettings={state.chartSettings}
          setChartSettings={state.setChartSettings}
          showFiltersExport={state.showFiltersExport}
          setShowFiltersExport={state.setShowFiltersExport}
          showEntitiesExport={state.showEntitiesExport}
          setShowEntitiesExport={state.setShowEntitiesExport}
          isCopying={state.isCopying}
          isDownloading={state.isDownloading}
          exportAreaRef={state.exportAreaRef}
          onCopy={state.handlePngCopy}
          onDownload={state.handlePngDownload}
          onCancel={state.handlePngCancel}
        />
      )}

      {/* ── Global animation + utility CSS ─────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{
        __html: ANIMATION_STYLES + `
        * { outline: none !important; -webkit-tap-highlight-color: transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}} />
    </div>
  );
};

export default App;
