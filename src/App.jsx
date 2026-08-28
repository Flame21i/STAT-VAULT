import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  memo
} from 'react';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  Label,
  Sector,
  AreaChart,
  Area
} from 'recharts';

import {
  Trash2,
  Plus,
  Settings2,
  ChevronUp,
  ChevronDown,
  Search,
  LayoutGrid,
  StretchHorizontal,
  List as ListIcon,
  Edit3,
  FilterX,
  RotateCcw,
  Download,
  Upload,
  Target,
  Trophy,
  CircleDot,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Activity
} from 'lucide-react';

import {
  Flame,
  Droplets,
  Wind,
  Mountain,
  Sun,
  Moon,
  Cloud,
  Earth,
  Waves,
  Sprout,
  Shell,
  Clover,
  Leaf,
  Sunrise,
  Atom,
  Binary,
  Cpu,
  Database,
  Dna,
  FlaskConical,
  Microscope,
  Telescope,
  Orbit,
  Bot,
  Component,
  Rocket,
  Radio,
  Magnet,
  Terminal,
  Monitor,
  Smartphone,
  Watch,
  Headphones,
  Mic,
  Music,
  Video,
  Image,
  Camera,
  Gamepad2,
  Sword,
  Shield,
  Target as TargetIcon,
  Crosshair,
  Axe,
  Bomb,
  Skull,
  Hammer,
  Anchor as AnchorIcon,
  Heart,
  Brain,
  Eye,
  User,
  Fingerprint,
  Pill,
  Activity as Pulse,
  Stethoscope,
  Syringe,
  Coffee,
  Cake,
  Gift,
  Wallet,
  ShoppingCart,
  GraduationCap,
  Library,
  Guitar,
  Dices,
  Bird,
  Fish,
  Dog,
  Cat,
  Rabbit,
  Turtle,
  Ghost,
  Squirrel,
  Bug,
  Hash,
  Percent,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Info
} from 'lucide-react';

// ----------------------------------------------------------------------
// ICONS
// ----------------------------------------------------------------------

const CATEGORIZED_ICONS = [
  {
    category: 'Utility & Syntax',
    icons: [
      { name: 'Hashtag', icon: Hash },
      { name: 'Percent', icon: Percent },
      { name: 'Important', icon: AlertCircle },
      { name: 'Warning', icon: AlertTriangle },
      { name: 'Question', icon: HelpCircle },
      { name: 'Info', icon: Info },
      { name: 'Double Info', icon: Info },
      { name: 'Double Excl', icon: AlertCircle }
    ]
  },
  {
    category: 'Nature & Elements',
    icons: [
      { name: 'Flame', icon: Flame },
      { name: 'Droplets', icon: Droplets },
      { name: 'Wind', icon: Wind },
      { name: 'Mountain', icon: Mountain },
      { name: 'Sun', icon: Sun },
      { name: 'Moon', icon: Moon },
      { name: 'Cloud', icon: Cloud },
      { name: 'Earth', icon: Earth },
      { name: 'Waves', icon: Waves },
      { name: 'Forest', icon: Sprout },
      { name: 'Sprout', icon: Sprout },
      { name: 'Shell', icon: Shell },
      { name: 'Clover', icon: Clover },
      { name: 'Leaf', icon: Leaf },
      { name: 'Sunrise', icon: Sunrise }
    ]
  },
  {
    category: 'Science & Tech',
    icons: [
      { name: 'Atom', icon: Atom },
      { name: 'Binary', icon: Binary },
      { name: 'Cpu', icon: Cpu },
      { name: 'Database', icon: Database },
      { name: 'Dna', icon: Dna },
      { name: 'Flask', icon: FlaskConical },
      { name: 'Microscope', icon: Microscope },
      { name: 'Telescope', icon: Telescope },
      { name: 'Orbit', icon: Orbit },
      { name: 'Bot', icon: Bot },
      { name: 'Circuit', icon: Component },
      { name: 'Rocket', icon: Rocket },
      { name: 'Radio', icon: Radio },
      { name: 'Magnet', icon: Magnet },
      { name: 'Terminal', icon: Terminal }
    ]
  },
  {
    category: 'Devices & Media',
    icons: [
      { name: 'Monitor', icon: Monitor },
      { name: 'Smartphone', icon: Smartphone },
      { name: 'Watch', icon: Watch },
      { name: 'Headphones', icon: Headphones },
      { name: 'Mic', icon: Mic },
      { name: 'Music', icon: Music },
      { name: 'Video', icon: Video },
      { name: 'Image', icon: Image },
      { name: 'Camera', icon: Camera },
      { name: 'Gamepad', icon: Gamepad2 }
    ]
  },
  {
    category: 'Combat & Defense',
    icons: [
      { name: 'Sword', icon: Sword },
      { name: 'Shield', icon: Shield },
      { name: 'Target', icon: TargetIcon },
      { name: 'Crosshair', icon: Crosshair },
      { name: 'Axe', icon: Axe },
      { name: 'Bomb', icon: Bomb },
      { name: 'Skull', icon: Skull },
      { name: 'Hammer', icon: Hammer },
      { name: 'Anchor', icon: AnchorIcon }
    ]
  },
  {
    category: 'Vitals & Health',
    icons: [
      { name: 'Heart', icon: Heart },
      { name: 'Brain', icon: Brain },
      { name: 'Eye', icon: Eye },
      { name: 'User', icon: User },
      { name: 'Fingerprint', icon: Fingerprint },
      { name: 'Pill', icon: Pill },
      { name: 'Pulse', icon: Pulse },
      { name: 'Stethoscope', icon: Stethoscope },
      { name: 'Syringe', icon: Syringe }
    ]
  },
  {
    category: 'Life & Leisure',
    icons: [
      { name: 'Coffee', icon: Coffee },
      { name: 'Cake', icon: Cake },
      { name: 'Gift', icon: Gift },
      { name: 'Wallet', icon: Wallet },
      { name: 'Shopping', icon: ShoppingCart },
      { name: 'Graduation', icon: GraduationCap },
      { name: 'Library', icon: Library },
      { name: 'Guitar', icon: Guitar },
      { name: 'Dices', icon: Dices }
    ]
  },
  {
    category: 'Creatures',
    icons: [
      { name: 'Bird', icon: Bird },
      { name: 'Fish', icon: Fish },
      { name: 'Dog', icon: Dog },
      { name: 'Cat', icon: Cat },
      { name: 'Rabbit', icon: Rabbit },
      { name: 'Turtle', icon: Turtle },
      { name: 'Ghost', icon: Ghost },
      { name: 'Squirrel', icon: Squirrel },
      { name: 'Bug', icon: Bug }
    ]
  }
];

const FLAT_ICONS = CATEGORIZED_ICONS.flatMap(category => category.icons);

// IMPORTANT:
// Use globalThis.Map so this cannot be broken by a local Map binding.
const ICON_MAP = new globalThis.Map(
  FLAT_ICONS.map(item => [item.name, item.icon])
);

// ----------------------------------------------------------------------
// Visualization Area
// ----------------------------------------------------------------------

const VisualizationArea = memo(({
  visMode,
  chartData,
  entities,
  selectedIdSet,
  hoveredId,
  selectedEntity,
  activeStats,
  entityTotals,
  topPerformers,
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
  renderStatIcon,
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
  totalPages,
  activePieIndex,
  setActivePieIndex
}) => {
  return (
    <main className="flex-1 relative bg-[#080808] overflow-hidden min-w-0 outline-none">
      <div
        className="absolute inset-0 flex items-center justify-center cursor-crosshair overflow-hidden outline-none"
        onWheel={handleWheel}
        onMouseDown={handleChartMouseDown}
      >
        <div
          className="w-full h-full p-12 transition-transform duration-75 ease-out outline-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {visMode === 'radar' ? (
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={chartData}
              >
                <PolarGrid stroke="rgba(255,255,255,0.03)" />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={({ x, y, payload }) => {
                    const stat = activeStats.find(
                      s => s.name === payload.value
                    );

                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          dy={12}
                          textAnchor="middle"
                          fill="#555"
                          fontSize={8}
                          fontWeight={900}
                        >
                          {payload.value}
                        </text>

                        {stat && (
                          <foreignObject
                            x="-8"
                            y="-22"
                            width="16"
                            height="16"
                          >
                            <div className="flex items-center justify-center text-zinc-700 opacity-50">
                              {renderStatIcon(stat, 10)}
                            </div>
                          </foreignObject>
                        )}
                      </g>
                    );
                  }}
                />

                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
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
                      selectedIdSet.has(entity.id)
                        ? 2
                        : hoveredId === entity.id
                          ? 1.5
                          : 1
                    }
                    className="cursor-pointer outline-none"
                    onClick={() => handleEntitySelection(entity.id)}
                  />
                ))}
              </RadarChart>
            ) : visMode === 'leaderboard' ? (
              <BarChart
                layout="vertical"
                data={leaderboardData}
                margin={{
                  left: 40,
                  right: 40,
                  top: 40,
                  bottom: 40
                }}
              >
                <XAxis
                  type="number"
                  hide
                  domain={[0, activeStats.length * 100]}
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#666',
                    fontSize: 10,
                    fontWeight: 700
                  }}
                  width={100}
                />

                <Bar
                  dataKey="total"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                  onClick={data =>
                    handleEntitySelection(data.id)
                  }
                >
                  {leaderboardData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={
                        selectedIdSet.has(entry.id) ||
                        selectedIdSet.size === 0
                          ? 0.6
                          : 0.1
                      }
                      className="cursor-pointer outline-none"
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : visMode === 'dots' ? (
              <ScatterChart
                margin={{
                  top: 40,
                  right: 40,
                  bottom: 40,
                  left: 40
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />

                <XAxis
                  type="category"
                  dataKey="x"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#666',
                    fontSize: 10,
                    fontWeight: 700
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#333',
                    fontSize: 9
                  }}
                />

                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[40, 400]}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    strokeDasharray: '3 3',
                    stroke: 'rgba(255,255,255,0.1)'
                  }}
                />

                <Scatter
                  data={dotsData}
                  isAnimationActive={false}
                  onClick={data =>
                    handleEntitySelection(data.entityId)
                  }
                >
                  {dotsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={
                        selectedIdSet.has(entry.entityId) ||
                        selectedIdSet.size === 0
                          ? 0.8
                          : 0.15
                      }
                      className="cursor-pointer outline-none"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            ) : visMode === 'parallel' ? (
              <AreaChart
                data={chartData}
                margin={{
                  top: 40,
                  right: 40,
                  bottom: 40,
                  left: 40
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical
                  horizontal={false}
                />

                <XAxis
                  dataKey="subject"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#666',
                    fontSize: 10,
                    fontWeight: 700
                  }}
                />

                <YAxis
                  domain={[0, 100]}
                  hide
                />

                <Tooltip content={<CustomTooltip />} />

                {entities.map(entity => (
                  <Area
                    key={entity.id}
                    type="linear"
                    dataKey={entity.id}
                    stroke={entity.color}
                    fill={entity.color}
                    isAnimationActive={false}
                    fillOpacity={
                      selectedIdSet.has(entity.id)
                        ? 0.25
                        : hoveredId === entity.id
                          ? 0.2
                          : selectedIdSet.size > 0 || hoveredId
                            ? 0.02
                            : 0.08
                    }
                    strokeWidth={
                      selectedIdSet.has(entity.id)
                        ? 3
                        : hoveredId === entity.id
                          ? 2
                          : 1.5
                    }
                    className="cursor-pointer outline-none"
                    onClick={() =>
                      handleEntitySelection(entity.id)
                    }
                  />
                ))}
              </AreaChart>
            ) : visMode === 'pie' ? (
              selectedEntity ? (
                <PieChart
                  margin={{
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40
                  }}
                >
                  <Pie
                    activeIndex={
                      activePieIndex === null
                        ? undefined
                        : activePieIndex
                    }
                    activeShape={renderActiveShape}
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="35%"
                    outerRadius="55%"
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive={false}
                    stroke="none"
                    labelLine={false}
                    label={renderCustomizedPieLabel}
                    onClick={(_, index) =>
                      setActivePieIndex(prev =>
                        prev === index ? null : index
                      )
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedEntity.color}
                        fillOpacity={
                          0.2 + (entry.value / 100) * 0.8
                        }
                        className="cursor-pointer outline-none"
                      />
                    ))}

                    <Label
                      position="center"
                      content={({ viewBox }) => {
                        if (!viewBox) return null;

                        const {
                          x,
                          y,
                          width,
                          height
                        } = viewBox;

                        const cx = x + width / 2;
                        const cy = y + height / 2;

                        return (
                          <g>
                            <text
                              x={cx}
                              y={cy - 4}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#fff"
                              fontSize="10"
                              fontWeight="900"
                            >
                              {selectedEntity.name}
                            </text>

                            <circle
                              cx={cx}
                              cy={cy + 12}
                              r="2.5"
                              fill={selectedEntity.color}
                            />
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

          {visMode === 'pie' && !selectedEntity && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
              <PieChartIcon size={48} className="mb-2" />

              <p className="text-[10px] font-black uppercase tracking-widest text-center">
                Focus on single unit for analysis
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mode selector */}
      <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-40">
        <div className="flex items-center bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-0.5 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-0.5 pr-0.5 border-r border-white/10 mr-0.5">
            {[
              { id: 'radar', icon: Target, label: 'Radar' },
              { id: 'parallel', icon: Activity, label: 'Parallel' },
              { id: 'dots', icon: CircleDot, label: 'Dots' },
              { id: 'pie', icon: PieChartIcon, label: 'Pie' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setVisMode(mode.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                  visMode === mode.id
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-zinc-600 hover:text-white hover:bg-white/5'
                }`}
              >
                <mode.icon size={11} />
                <span className="hidden lg:inline">
                  {mode.label}
                </span>
              </button>
            ))}

            <button
              onClick={() => setVisMode('leaderboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                visMode === 'leaderboard'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-600 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy size={11} />
              <span className="hidden lg:inline">
                Board
              </span>
            </button>
          </div>

          <button
            onClick={resetView}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>

      {/* Monitor */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4 gap-2 pointer-events-none transition-all duration-200 z-40 ${
          bottomCollapsed
            ? 'translate-y-[calc(100%-40px)]'
            : 'translate-y-0'
        }`}
      >
        <button
          onClick={() =>
            setBottomCollapsed(prev => !prev)
          }
          className="pointer-events-auto bg-[#0a0a0a] border border-white/10 p-1.5 rounded-full text-zinc-600 hover:text-white transition-all shadow-xl"
        >
          {bottomCollapsed ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )}
        </button>

        <div className="max-w-[95%] w-fit bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex items-center gap-1.5 shadow-2xl pointer-events-auto overflow-hidden">
          {paginatedEntities.map(entity => (
            <div
              key={entity.id}
              onMouseDown={() =>
                handleMouseDownItem(entity.id)
              }
              onMouseUp={() =>
                handleMouseUpItem(entity.id)
              }
              onMouseEnter={() =>
                handleMouseEnterItem(entity.id)
              }
              onMouseLeave={handleMouseLeaveItem}
              style={{
                backgroundColor: selectedIdSet.has(entity.id)
                  ? `${entity.color}25`
                  : 'transparent',
                borderColor: selectedIdSet.has(entity.id)
                  ? `${entity.color}60`
                  : 'rgba(255,255,255,0.03)'
              }}
              className={`min-w-[80px] px-2 py-1.5 rounded-lg border flex flex-col gap-1 transition-all cursor-pointer ${
                selectedIdSet.has(entity.id)
                  ? 'shadow-inner'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1 h-1 rounded-full ${
                    selectedIdSet.has(entity.id)
                      ? 'animate-pulse'
                      : ''
                  }`}
                  style={{
                    backgroundColor: entity.color
                  }}
                />

                <span
                  className={`text-[8px] font-black uppercase truncate ${
                    selectedIdSet.has(entity.id)
                      ? 'text-white'
                      : 'text-zinc-600'
                  }`}
                >
                  {entity.name}
                </span>
              </div>

              <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${
                      activeStats.length
                        ? ((entityTotals[entity.id] || 0) /
                            (activeStats.length * 100)) *
                          100
                        : 0
                    }%`,
                    backgroundColor: entity.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-full px-3 py-1 shadow-xl pointer-events-auto">
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
            MONITOR
          </span>

          <div className="h-2 w-px bg-white/10 mx-1" />

          <div className="flex items-center gap-1.5">
            <button
              disabled={monitorPage === 0}
              onClick={() =>
                setMonitorPage(p => Math.max(0, p - 1))
              }
              className="p-0.5 text-zinc-700 hover:text-white disabled:opacity-30"
            >
              <ChevronUp size={12} />
            </button>

            <span className="text-[7px] font-black text-zinc-500 tabular-nums uppercase">
              {monitorPage + 1}/{totalPages || 1}
            </span>

            <button
              disabled={monitorPage >= totalPages - 1}
              onClick={() =>
                setMonitorPage(p =>
                  Math.min(
                    Math.max(0, totalPages - 1),
                    p + 1
                  )
                )
              }
              className="p-0.5 text-zinc-700 hover:text-white disabled:opacity-30"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
});

// ----------------------------------------------------------------------
// Filters Panel
// ----------------------------------------------------------------------

const FiltersPanel = memo(({
  stats,
  anyFilterActive,
  clearFilters,
  addNewStat,
  toggleStatVisibility,
  openIconPicker,
  renderStatIcon,
  updateStatName,
  setEditingStat,
  deleteStat,
  activeIconPicker,
  setActiveIconPicker,
  iconSearch,
  setIconSearch,
  filteredIcons,
  updateStatIcon
}) => {
  return (
    <aside className="border-r border-white/5 flex flex-col bg-[#0a0a0a] shrink-0 relative z-20 overflow-hidden h-full">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0 h-14 whitespace-nowrap">
        <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
          FILTERS
        </span>

        <div className="flex items-center gap-1">
          {anyFilterActive && (
            <button
              onClick={clearFilters}
              className="p-1.5 rounded hover:text-rose-500 transition-colors"
            >
              <FilterX size={14} />
            </button>
          )}

          <button
            onClick={addNewStat}
            className="p-1.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {stats.map(stat => (
          <div
            key={stat.id}
            onClick={() =>
              toggleStatVisibility(stat.id)
            }
            className={`group relative flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-none ${
              stat.visible
                ? 'bg-emerald-500/10 border-emerald-500/20 text-white'
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
            } ${
              anyFilterActive && !stat.visible
                ? 'opacity-30'
                : 'opacity-100'
            } whitespace-nowrap`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border transition-all ${
                stat.visible
                  ? 'bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
              onClick={e =>
                openIconPicker(e, stat.id)
              }
            >
              {renderStatIcon(stat, 11)}
            </div>

            {stat.editing ? (
              <input
                autoFocus
                className="bg-zinc-900 border-none text-[10px] text-white w-full font-bold uppercase focus:outline-none px-1"
                defaultValue={stat.name}
                onClick={e => e.stopPropagation()}
                onBlur={e =>
                  updateStatName(
                    stat.id,
                    e.target.value
                  )
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    updateStatName(
                      stat.id,
                      e.target.value
                    );
                  }
                }}
              />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-tighter truncate flex-1">
                {stat.name}
              </span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setEditingStat(stat.id);
                }}
                className="p-1 hover:text-white"
              >
                <Edit3 size={11} />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteStat(stat.id);
                }}
                className="p-1 hover:text-rose-500"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeIconPicker && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() =>
              setActiveIconPicker(null)
            }
          />

          <div
            className="fixed z-[100] bg-[#0d0d0d] border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 w-64 flex flex-col"
            style={{
              left: Math.min(
                activeIconPicker.x,
                window.innerWidth - 270
              ),
              top: Math.min(
                activeIconPicker.y,
                window.innerHeight - 340
              )
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2 mb-3">
              <Search
                size={10}
                className="text-zinc-600"
              />

              <input
                autoFocus
                placeholder="SEARCH MAPS..."
                value={iconSearch}
                onChange={e =>
                  setIconSearch(e.target.value)
                }
                className="bg-transparent border-none py-1.5 text-[8px] font-black text-white focus:outline-none w-full uppercase placeholder:text-zinc-700"
              />
            </div>

            <div className="max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
              {filteredIcons.map(category => (
                <div
                  key={category.category}
                  className="mb-4"
                >
                  <div className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 flex justify-between items-center">
                    <span>{category.category}</span>
                    <span className="opacity-40">
                      {category.icons.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    {category.icons.map(item => (
                      <button
                        key={item.name}
                        onClick={() =>
                          updateStatIcon(
                            activeIconPicker.id,
                            'icon',
                            item.name
                          )
                        }
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors flex items-center justify-center ${
                          stats.find(
                            s =>
                              s.id ===
                              activeIconPicker.id
                          )?.iconName === item.name
                            ? 'text-emerald-400 bg-emerald-400/10'
                            : 'text-zinc-600'
                        }`}
                        title={item.name}
                      >
                        <item.icon size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {filteredIcons.length === 0 && (
                <div className="py-8 text-center text-[8px] font-black uppercase text-zinc-800 tracking-tighter">
                  No matching signatures found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </aside>
  );
});

// ----------------------------------------------------------------------
// Right Panel
// ----------------------------------------------------------------------

const RightPanel = memo(({
  rightSplit,
  setRightSplit,
  isResizingSplit,
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
  stats,
  openIconPicker,
  renderStatIcon,
  updateStatValue
}) => {
  return (
    <aside
      ref={rightAsideRef}
      id="right-aside"
      className="border-l border-white/5 flex flex-col bg-[#0a0a0a] shrink-0 relative z-20 overflow-hidden h-full"
    >
      <div
        style={{ height: `${rightSplit}%` }}
        className="flex flex-col min-h-0 overflow-hidden"
      >
        <div className="h-[84px] border-b border-white/5 bg-black/20 shrink-0 p-4 relative flex flex-col justify-between">
          <div className="flex justify-between items-center h-6">
            <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
              Registry
            </span>

            <button
              onClick={addNewEntity}
              className="p-1.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex gap-1">
            {[
              { id: 'grid', i: LayoutGrid },
              { id: 'normal', i: StretchHorizontal },
              { id: 'list', i: ListIcon }
            ].map(view => (
              <button
                key={view.id}
                onClick={() =>
                  setRegistryView(view.id)
                }
                className={`p-1.5 rounded transition-colors ${
                  registryView === view.id
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : 'text-zinc-700 hover:text-zinc-400 hover:bg-white/5'
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
                ? 'space-y-1 p-2'
                : 'flex flex-col'
          }`}
        >
          {sortedEntities.map(entity => {
            const isSelected =
              selectedIdSet.has(entity.id);

            const totalScore =
              entityTotals[entity.id] || 0;

            return (
              <div
                key={entity.id}
                onClick={() =>
                  handleEntitySelection(entity.id)
                }
                onMouseEnter={() =>
                  setHoveredId(entity.id)
                }
                onMouseLeave={() =>
                  setHoveredId(null)
                }
                style={{
                  backgroundColor: isSelected
                    ? `${entity.color}35`
                    : `${entity.color}05`,
                  borderColor: isSelected
                    ? `${entity.color}80`
                    : `${entity.color}15`
                }}
                className={`group relative flex items-center cursor-pointer border transition-all ${
                  registryView === 'grid'
                    ? 'aspect-square flex-col justify-center rounded-sm p-0'
                    : 'p-2 rounded-sm'
                }`}
              >
                <div
                  className={`flex items-center ${
                    registryView === 'grid'
                      ? 'flex-col gap-0.5'
                      : 'gap-3 w-full'
                  } whitespace-nowrap`}
                >
                  <div
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{
                      backgroundColor: entity.color
                    }}
                  />

                  <span
                    className={`text-[9px] font-bold uppercase truncate ${
                      isSelected
                        ? 'text-white'
                        : 'text-zinc-600'
                    } flex-1`}
                  >
                    {entity.name}
                  </span>

                  {registryView === 'list' && (
                    <span className="text-[12px] text-emerald-400 font-black tracking-tighter">
                      {totalScore}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="h-1 hover:bg-emerald-500/20 cursor-row-resize shrink-0 group"
        onMouseDown={() => {
          isResizingSplit.current = true;
          document.body.style.cursor =
            'row-resize';
        }}
      />

      <div
        className="p-4 flex flex-col bg-black/20 min-h-0 overflow-hidden"
        style={{ height: `${100 - rightSplit}%` }}
      >
        <div className="p-2 mb-4 border-b border-white/5 flex items-center gap-2 shrink-0">
          <Settings2
            size={12}
            className="text-zinc-600"
          />

          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
            Parameters
          </span>
        </div>

        {selectedEntity ? (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              <label className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                ID Signature
              </label>

              <div className="flex gap-2 h-8">
                <input
                  value={selectedEntity.name}
                  onChange={e =>
                    setEntities(prev =>
                      prev.map(entity =>
                        entity.id ===
                        selectedEntity.id
                          ? {
                              ...entity,
                              name: e.target.value.toUpperCase()
                            }
                          : entity
                      )
                    )
                  }
                  className="flex-1 bg-white/[0.02] border border-white/5 rounded px-2 text-[10px] font-bold text-white uppercase focus:outline-none focus:border-emerald-500/40"
                />

                <div
                  className="w-8 relative rounded border border-white/5 overflow-hidden"
                  style={{
                    backgroundColor:
                      selectedEntity.color
                  }}
                >
                  <input
                    type="color"
                    value={selectedEntity.color}
                    onChange={e =>
                      setEntities(prev =>
                        prev.map(entity =>
                          entity.id ===
                          selectedEntity.id
                            ? {
                                ...entity,
                                color: e.target.value
                              }
                            : entity
                        )
                      )
                    }
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>

                <button
                  onClick={() =>
                    removeEntity(selectedEntity.id)
                  }
                  className="w-8 h-8 rounded border border-white/5 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {stats.map(stat => (
                <div
                  key={stat.id}
                  className="flex flex-col gap-1.5 p-2 bg-white/[0.02] rounded border border-white/5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="text-zinc-600 opacity-70 cursor-pointer"
                        onClick={e =>
                          openIconPicker(
                            e,
                            stat.id
                          )
                        }
                      >
                        {renderStatIcon(stat, 10)}
                      </div>

                      <span className="text-[9px] font-bold uppercase text-zinc-500">
                        {stat.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-black text-emerald-400">
                      {Math.floor(
                        selectedEntity.values[
                          stat.id
                        ] || 0
                      )}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={
                      selectedEntity.values[
                        stat.id
                      ] || 0
                    }
                    onChange={e =>
                      updateStatValue(
                        selectedEntity.id,
                        stat.id,
                        e.target.value
                      )
                    }
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <TargetIcon
              size={32}
              className="mb-4"
            />

            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              Idle
            </p>
          </div>
        )}
      </div>
    </aside>
  );
});

// ----------------------------------------------------------------------
// Main App
// ----------------------------------------------------------------------

const App = () => {
  const [leftCollapsed, setLeftCollapsed] =
    useState(false);

  const [rightCollapsed, setRightCollapsed] =
    useState(false);

  const [bottomCollapsed, setBottomCollapsed] =
    useState(false);

  const [selectedIds, setSelectedIds] = useState(
    []
  );

  const [hoveredId, setHoveredId] =
    useState(null);

  const [monitorPage, setMonitorPage] =
    useState(0);

  const [registryView, setRegistryView] =
    useState('grid');

  const [visMode, setVisMode] =
    useState('radar');

  const [multiSelectMode, setMultiSelectMode] =
    useState(false);

  const [activeIconPicker, setActiveIconPicker] =
    useState(null);

  const [iconSearch, setIconSearch] =
    useState('');

  const [zoom, setZoom] = useState(1);

  const [offset, setOffset] = useState({
    x: 0,
    y: 0
  });

  const offsetRef = useRef(offset);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const isPanning = useRef(false);

  const lastMousePos = useRef({
    x: 0,
    y: 0
  });

  const [activePieIndex, setActivePieIndex] =
    useState(null);

  const [leftWidth, setLeftWidth] =
    useState(240);

  const [rightWidth, setRightWidth] =
    useState(320);

  const [rightSplit, setRightSplit] =
    useState(50);

  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);
  const isResizingSplit = useRef(false);

  const longPressTimer = useRef(null);
  const isDragging = useRef(false);
  const rightAsideRef = useRef(null);

  const panFrameRef = useRef(null);
  const pendingOffsetRef = useRef(null);

  const zoomFrameRef = useRef(null);
  const pendingZoomRef = useRef(0);

  // --------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------

  const [stats, setStats] = useState([
    {
      id: 's1',
      name: 'STAT_01',
      visible: false,
      editing: false,
      iconType: 'icon',
      iconName: 'Hashtag'
    },
    {
      id: 's2',
      name: 'STAT_02',
      visible: false,
      editing: false,
      iconType: 'icon',
      iconName: 'Hashtag'
    },
    {
      id: 's3',
      name: 'STAT_03',
      visible: false,
      editing: false,
      iconType: 'icon',
      iconName: 'Hashtag'
    },
    {
      id: 's4',
      name: 'STAT_04',
      visible: false,
      editing: false,
      iconType: 'icon',
      iconName: 'Hashtag'
    },
    {
      id: 's5',
      name: 'STAT_05',
      visible: false,
      editing: false,
      iconType: 'icon',
      iconName: 'Hashtag'
    },
    {
      id: 's6',
      name: 'STAT_06',
      visible: false,
      editing: false,
      iconType: 'icon',
      iconName: 'Hashtag'
    }
  ]);

  // --------------------------------------------------------------------
  // Entities
  // --------------------------------------------------------------------

  const [entities, setEntities] = useState([
    {
      id: 'e1',
      name: 'ENTITY_01',
      visible: true,
      color: '#10b981',
      values: {
        s1: 80,
        s2: 45,
        s3: 90,
        s4: 65,
        s5: 75,
        s6: 55
      }
    },
    {
      id: 'e2',
      name: 'ENTITY_02',
      visible: true,
      color: '#3b82f6',
      values: {
        s1: 45,
        s2: 85,
        s3: 40,
        s4: 95,
        s5: 55,
        s6: 70
      }
    },
    {
      id: 'e3',
      name: 'ENTITY_03',
      visible: true,
      color: '#f59e0b',
      values: {
        s1: 60,
        s2: 70,
        s3: 50,
        s4: 40,
        s5: 90,
        s6: 30
      }
    },
    {
      id: 'e4',
      name: 'ENTITY_04',
      visible: true,
      color: '#ec4899',
      values: {
        s1: 30,
        s2: 30,
        s3: 80,
        s4: 80,
        s5: 40,
        s6: 90
      }
    }
  ]);

  // --------------------------------------------------------------------
  // Derived icon data
  // --------------------------------------------------------------------

  const filteredIcons = useMemo(() => {
    if (!iconSearch) {
      return CATEGORIZED_ICONS;
    }

    const search =
      iconSearch.toLowerCase();

    return CATEGORIZED_ICONS
      .map(category => ({
        ...category,
        icons: category.icons.filter(item =>
          item.name
            .toLowerCase()
            .includes(search)
        )
      }))
      .filter(category =>
        category.icons.length > 0
      );
  }, [iconSearch]);

  // --------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------

  const getRandomColor = useCallback(() => {
    const letters =
      '0123456789ABCDEF';

    let color = '#';

    for (let i = 0; i < 6; i++) {
      color +=
        letters[
          Math.floor(
            Math.random() * 16
          )
        ];
    }

    return color;
  }, []);

  const getRandomStats = useCallback(() => {
    const values = {};

    for (const stat of stats) {
      values[stat.id] =
        Math.floor(
          Math.random() * 101
        );
    }

    return values;
  }, [stats]);

  // --------------------------------------------------------------------
  // Stats actions
  // --------------------------------------------------------------------

  const addNewStat = useCallback(() => {
    const newId =
      `s_${crypto.randomUUID()}`;

    setStats(prev => [
      ...prev,
      {
        id: newId,
        name: `STAT_${String(
          prev.length + 1
        ).padStart(2, '0')}`,
        visible: false,
        editing: false,
        iconType: 'icon',
        iconName: 'Hashtag'
      }
    ]);

    setEntities(prev =>
      prev.map(entity => ({
        ...entity,
        values: {
          ...entity.values,
          [newId]: 50
        }
      }))
    );
  }, []);

  const updateStatIcon = useCallback(
    (statId, type, value) => {
      setStats(prev =>
        prev.map(stat =>
          stat.id === statId
            ? {
                ...stat,
                iconType: type,
                iconName: value
              }
            : stat
        )
      );

      setActiveIconPicker(null);
      setIconSearch('');
    },
    []
  );

  const renderStatIcon = useCallback(
    (stat, size = 12) => {
      const IconComponent =
        ICON_MAP.get(stat.iconName) ||
        Hash;

      return (
        <IconComponent size={size} />
      );
    },
    []
  );

  const toggleStatVisibility =
    useCallback(id => {
      setStats(prev =>
        prev.map(stat =>
          stat.id === id
            ? {
                ...stat,
                visible: !stat.visible
              }
            : stat
        )
      );
    }, []);

  const setEditingStat =
    useCallback(id => {
      setStats(prev =>
        prev.map(stat =>
          stat.id === id
            ? {
                ...stat,
                editing: true
              }
            : stat
        )
      );
    }, []);

  const updateStatName =
    useCallback((id, newName) => {
      setStats(prev =>
        prev.map(stat =>
          stat.id === id
            ? {
                ...stat,
                name: newName.toUpperCase(),
                editing: false
              }
            : stat
        )
      );
    }, []);

  const deleteStat = useCallback(id => {
    setStats(prev =>
      prev.filter(stat => stat.id !== id)
    );

    setEntities(prev =>
      prev.map(entity => {
        const values = {
          ...entity.values
        };

        delete values[id];

        return {
          ...entity,
          values
        };
      })
    );
  }, []);

  const updateStatValue = useCallback(
    (entityId, statId, value) => {
      const num =
        parseInt(value, 10) || 0;

      const clamped = Math.min(
        Math.max(num, 0),
        100
      );

      setEntities(prev =>
        prev.map(entity => {
          if (entity.id !== entityId) {
            return entity;
          }

          if (
            (entity.values[statId] || 0) ===
            clamped
          ) {
            return entity;
          }

          return {
            ...entity,
            values: {
              ...entity.values,
              [statId]: clamped
            }
          };
        })
      );
    },
    []
  );

  const openIconPicker = useCallback(
    (event, statId) => {
      event.stopPropagation();

      setActiveIconPicker({
        id: statId,
        x: event.clientX,
        y: event.clientY
      });
    },
    []
  );

  // --------------------------------------------------------------------
  // Export / Import
  // --------------------------------------------------------------------

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(
      {
        stats,
        entities
      },
      null,
      2
    );

    const dataUri =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(dataStr);

    const filename =
      `statvault_export_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    const link =
      document.createElement('a');

    link.setAttribute(
      'href',
      dataUri
    );

    link.setAttribute(
      'download',
      filename
    );

    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [stats, entities]);

  const handleImport = useCallback(
    event => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = e => {
        try {
          const json = JSON.parse(
            e.target?.result || ''
          );

          if (
            Array.isArray(json.stats) &&
            Array.isArray(json.entities)
          ) {
            setStats(json.stats);
            setEntities(json.entities);
            setSelectedIds([]);
            setMonitorPage(0);
          }
        } catch {
          console.error(
            'Invalid JSON file'
          );
        }
      };

      reader.readAsText(file);
      event.target.value = '';
    },
    []
  );

  // --------------------------------------------------------------------
  // Global mouse handling
  // --------------------------------------------------------------------

  useEffect(() => {
    const handleMouseMoveGlobal = event => {
      if (
        isResizingLeft.current &&
        !leftCollapsed
      ) {
        setLeftWidth(
          Math.max(
            180,
            Math.min(
              400,
              event.clientX
            )
          )
        );
      }

      if (
        isResizingRight.current &&
        !rightCollapsed
      ) {
        setRightWidth(
          Math.max(
            240,
            Math.min(
              500,
              window.innerWidth -
                event.clientX
            )
          )
        );
      }

      if (isResizingSplit.current) {
        const aside =
          rightAsideRef.current;

        if (aside) {
          const rect =
            aside.getBoundingClientRect();

          const offsetValue =
            event.clientY -
            rect.top;

          setRightSplit(
            Math.max(
              20,
              Math.min(
                80,
                (offsetValue /
                  rect.height) *
                  100
              )
            )
          );
        }
      }

      if (isPanning.current) {
        const dx =
          event.clientX -
          lastMousePos.current.x;

        const dy =
          event.clientY -
          lastMousePos.current.y;

        lastMousePos.current = {
          x: event.clientX,
          y: event.clientY
        };

        const startOffset =
          pendingOffsetRef.current ||
          offsetRef.current;

        pendingOffsetRef.current = {
          x: Math.min(
            Math.max(
              startOffset.x + dx,
              -400
            ),
            400
          ),
          y: Math.min(
            Math.max(
              startOffset.y + dy,
              -400
            ),
            400
          )
        };

        if (!panFrameRef.current) {
          panFrameRef.current =
            requestAnimationFrame(() => {
              panFrameRef.current =
                null;

              if (
                pendingOffsetRef.current
              ) {
                setOffset(
                  pendingOffsetRef.current
                );
              }
            });
        }
      }
    };

    const handleMouseUpGlobal = () => {
      isResizingLeft.current = false;
      isResizingRight.current = false;
      isResizingSplit.current = false;
      isPanning.current = false;
      isDragging.current = false;

      document.body.style.cursor =
        'default';
    };

    window.addEventListener(
      'mousemove',
      handleMouseMoveGlobal
    );

    window.addEventListener(
      'mouseup',
      handleMouseUpGlobal
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMoveGlobal
      );

      window.removeEventListener(
        'mouseup',
        handleMouseUpGlobal
      );

      if (panFrameRef.current) {
        cancelAnimationFrame(
          panFrameRef.current
        );
      }

      if (zoomFrameRef.current) {
        cancelAnimationFrame(
          zoomFrameRef.current
        );
      }
    };
  }, [leftCollapsed, rightCollapsed]);

  const handleWheel =
    useCallback(event => {
      event.preventDefault();

      pendingZoomRef.current +=
        event.deltaY * -0.001;

      if (!zoomFrameRef.current) {
        zoomFrameRef.current =
          requestAnimationFrame(() => {
            zoomFrameRef.current =
              null;

            const delta =
              pendingZoomRef.current;

            pendingZoomRef.current = 0;

            if (delta) {
              setZoom(prev =>
                Math.min(
                  Math.max(
                    prev + delta,
                    0.5
                  ),
                  3
                )
              );
            }
          });
      }
    }, []);

  const handleChartMouseDown =
    useCallback(event => {
      if (event.button !== 2) {
        return;
      }

      event.preventDefault();

      isPanning.current = true;

      pendingOffsetRef.current =
        offsetRef.current;

      lastMousePos.current = {
        x: event.clientX,
        y: event.clientY
      };
    }, []);

  const resetView = useCallback(() => {
    setZoom(1);

    setOffset({
      x: 0,
      y: 0
    });

    pendingOffsetRef.current = {
      x: 0,
      y: 0
    };

    setActivePieIndex(null);
  }, []);

  const clearFilters =
    useCallback(() => {
      setStats(prev =>
        prev.map(stat => ({
          ...stat,
          visible: false
        }))
      );
    }, []);

  // --------------------------------------------------------------------
  // Entity selection
  // --------------------------------------------------------------------

  const handleEntitySelection =
    useCallback(
      id => {
        if (multiSelectMode) {
          setSelectedIds(prev => {
            const next = prev.includes(id)
              ? prev.filter(
                  selectedId =>
                    selectedId !== id
                )
              : [...prev, id];

            if (next.length === 0) {
              setMultiSelectMode(false);
            }

            return next;
          });
        } else {
          setSelectedIds(prev =>
            prev.length === 1 &&
            prev[0] === id
              ? []
              : [id]
          );
        }

        setActivePieIndex(null);
      },
      [multiSelectMode]
    );

  const handleMouseDownItem =
    useCallback(id => {
      if (longPressTimer.current) {
        clearTimeout(
          longPressTimer.current
        );
      }

      longPressTimer.current =
        setTimeout(() => {
          setMultiSelectMode(true);

          setSelectedIds(prev =>
            prev.includes(id)
              ? prev
              : [...prev, id]
          );

          isDragging.current = true;
        }, 400);
    }, []);

  const handleMouseUpItem =
    useCallback(
      id => {
        if (longPressTimer.current) {
          clearTimeout(
            longPressTimer.current
          );

          longPressTimer.current = null;
        }

        if (!isDragging.current) {
          handleEntitySelection(id);
        }

        isDragging.current = false;
      },
      [handleEntitySelection]
    );

  const handleMouseEnterItem =
    useCallback(
      id => {
        setHoveredId(id);

        if (
          isDragging.current &&
          multiSelectMode
        ) {
          setSelectedIds(prev =>
            prev.includes(id)
              ? prev
              : [...prev, id]
          );
        }
      },
      [multiSelectMode]
    );

  const handleMouseLeaveItem =
    useCallback(() => {
      setHoveredId(null);
    }, []);

  const removeEntity =
    useCallback(id => {
      setEntities(prev =>
        prev.filter(
          entity => entity.id !== id
        )
      );

      setSelectedIds(prev => {
        const next = prev.filter(
          selectedId =>
            selectedId !== id
        );

        if (next.length <= 1) {
          setMultiSelectMode(false);
        }

        return next;
      });
    }, []);

  const addNewEntity =
    useCallback(() => {
      const id =
        `e_${crypto.randomUUID()}`;

      setEntities(prev => [
        ...prev,
        {
          id,
          name: `ENT_${String(
            prev.length + 1
          ).padStart(2, '0')}`,
          visible: true,
          color: getRandomColor(),
          values: getRandomStats()
        }
      ]);
    }, [
      getRandomColor,
      getRandomStats
    ]);

  // --------------------------------------------------------------------
  // Derived data
  // --------------------------------------------------------------------

  const anyFilterActive =
    stats.some(stat => stat.visible);

  const activeStats =
    anyFilterActive
      ? stats.filter(stat => stat.visible)
      : stats;

  const selectedIdSet = useMemo(
    () => new globalThis.Set(selectedIds),
    [selectedIds]
  );

  const chartData = useMemo(() => {
    return activeStats.map(stat => {
      const row = {
        subject: stat.name,
        statId: stat.id
      };

      entities.forEach(entity => {
        if (entity.visible) {
          row[entity.id] =
            entity.values[stat.id] ?? 0;
        }
      });

      return row;
    });
  }, [activeStats, entities]);

  const entityTotals = useMemo(() => {
    const totals = {};

    for (const entity of entities) {
      let total = 0;

      for (const stat of activeStats) {
        total +=
          entity.values[stat.id] || 0;
      }

      totals[entity.id] = total;
    }

    return totals;
  }, [entities, activeStats]);

  const sortedEntities = useMemo(() => {
    return [...entities].sort(
      (a, b) =>
        (entityTotals[b.id] || 0) -
        (entityTotals[a.id] || 0)
    );
  }, [entities, entityTotals]);

  const topPerformers = useMemo(() => {
    // Explicitly use the native global Map.
    const result =
      new globalThis.Map();

    for (const stat of activeStats) {
      result.set(
        stat.id,
        [...entities]
          .sort(
            (a, b) =>
              (b.values[stat.id] || 0) -
              (a.values[stat.id] || 0)
          )
          .slice(0, 3)
          .map(entity => ({
            name: entity.name,
            val:
              entity.values[stat.id] ||
              0,
            color: entity.color
          }))
      );
    }

    return result;
  }, [entities, activeStats]);

  const selectedEntity =
    selectedIds.length === 1
      ? entities.find(
          entity =>
            entity.id ===
            selectedIds[0]
        )
      : null;

  const itemsPerPage = 6;

  const totalPages = Math.ceil(
    entities.length / itemsPerPage
  );

  const paginatedEntities =
    useMemo(() => {
      const start =
        monitorPage * itemsPerPage;

      return entities.slice(
        start,
        start + itemsPerPage
      );
    }, [entities, monitorPage]);

  // Keep monitor page valid after deletion/import.
  useEffect(() => {
    setMonitorPage(prev =>
      Math.min(
        prev,
        Math.max(0, totalPages - 1)
      )
    );
  }, [totalPages]);

  const leaderboardData =
    useMemo(() => {
      return sortedEntities.map(
        entity => ({
          name: entity.name,
          total:
            entityTotals[entity.id] || 0,
          color: entity.color,
          id: entity.id
        })
      );
    }, [
      sortedEntities,
      entityTotals
    ]);

  const dotsData = useMemo(() => {
    const data = [];

    activeStats.forEach(stat => {
      entities.forEach(entity => {
        const isSelected =
          selectedIdSet.has(entity.id);

        const isHovered =
          hoveredId === entity.id;

        data.push({
          x: stat.name,
          y:
            entity.values[stat.id] ||
            0,
          entityId: entity.id,
          statName: stat.name,
          statId: stat.id,
          color: entity.color,
          z: isSelected
            ? 400
            : isHovered
              ? 280
              : 80
        });
      });
    });

    return data;
  }, [
    activeStats,
    entities,
    selectedIdSet,
    hoveredId
  ]);

  const pieData = useMemo(() => {
    if (!selectedEntity) {
      return [];
    }

    return activeStats.map(stat => ({
      name: stat.name,
      value:
        (selectedEntity.values[
          stat.id
        ] || 0) + 0.1
    }));
  }, [
    selectedEntity,
    activeStats
  ]);

  // --------------------------------------------------------------------
  // Panel toggle
  // --------------------------------------------------------------------

  const allPanelsCollapsed =
    leftCollapsed &&
    rightCollapsed &&
    bottomCollapsed;

  const toggleAllPanels =
    useCallback(() => {
      const targetState =
        !allPanelsCollapsed;

      setLeftCollapsed(
        targetState
      );

      setRightCollapsed(
        targetState
      );

      setBottomCollapsed(
        targetState
      );
    }, [allPanelsCollapsed]);

  // --------------------------------------------------------------------
  // Tooltip
  // --------------------------------------------------------------------

  const CustomTooltip =
    useCallback(
      ({ active, payload, label }) => {
        if (
          !active ||
          !payload ||
          !payload.length
        ) {
          return null;
        }

        const dataPoint =
          payload[0].payload;

        const statId =
          dataPoint.statId;

        const top3 =
          topPerformers.get(statId) ||
          [];

        return (
          <div className="bg-black/90 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-2xl min-w-[140px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 border-b border-white/5 pb-1">
              {label ||
                dataPoint.statName ||
                'METRIC'}
            </p>

            <div className="space-y-1.5">
              <p className="text-[7px] font-black uppercase text-zinc-600 tracking-tighter mb-1">
                Top Performers
              </p>

              {top3.map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{
                        backgroundColor:
                          performer.color
                      }}
                    />

                    <span className="text-[9px] font-bold text-white uppercase">
                      {performer.name}
                    </span>
                  </div>

                  <span className="text-[9px] font-black text-zinc-400 tabular-nums">
                    {performer.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      },
      [topPerformers]
    );

  // --------------------------------------------------------------------
  // Pie label
  // --------------------------------------------------------------------

  const renderCustomizedPieLabel =
    useCallback(
      ({
        cx,
        cy,
        midAngle,
        outerRadius,
        index,
        name
      }) => {
        const RADIAN =
          Math.PI / 180;

        const sin = Math.sin(
          -RADIAN * midAngle
        );

        const cos = Math.cos(
          -RADIAN * midAngle
        );

        const isSliceActive =
          activePieIndex === index;

        const radiusBoost =
          isSliceActive ? 15 : 0;

        const sx =
          cx +
          (outerRadius +
            5 +
            radiusBoost) *
            cos;

        const sy =
          cy +
          (outerRadius +
            5 +
            radiusBoost) *
            sin;

        const mx =
          cx +
          (outerRadius +
            20 +
            radiusBoost) *
            cos;

        const my =
          cy +
          (outerRadius +
            20 +
            radiusBoost) *
            sin;

        const ex =
          mx +
          (cos >= 0 ? 1 : -1) *
            15;

        const ey = my;

        const textAnchor =
          cos >= 0
            ? 'start'
            : 'end';

        return (
          <g>
            <path
              d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
              stroke="rgba(255,255,255,0.15)"
              fill="none"
            />

            <circle
              cx={ex}
              cy={ey}
              r={2}
              fill={
                selectedEntity?.color
              }
              stroke="none"
            />

            <text
              x={
                ex +
                (cos >= 0 ? 1 : -1) *
                  8
              }
              y={ey}
              textAnchor={textAnchor}
              fill={
                isSliceActive
                  ? '#fff'
                  : '#555'
              }
              fontSize={8}
              fontWeight="900"
              dominantBaseline="central"
            >
              {name}
            </text>
          </g>
        );
      },
      [
        activePieIndex,
        selectedEntity
      ]
    );

  // --------------------------------------------------------------------
  // Pie active shape
  // --------------------------------------------------------------------

  const renderActiveShape =
    useCallback(props => {
      const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill
      } = props;

      return (
        <g>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={
              outerRadius + 15
            }
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            fillOpacity={0.1}
          />

          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={
              outerRadius + 10
            }
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />
        </g>
      );
    }, []);

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------

  return (
    <div
      className="h-screen w-full bg-[#080808] text-zinc-500 font-mono flex flex-col overflow-hidden select-none"
      onContextMenu={e =>
        e.preventDefault()
      }
    >
      {/* HEADER */}
      <header className="h-12 border-b border-white/5 flex items-center px-6 bg-[#080808] shrink-0 justify-between z-30">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-white">
            STATVAULT_PRO
          </span>

          <div className="h-3 w-px bg-white/10" />

          <div className="flex gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              <Download
                size={12}
                className="text-zinc-600"
              />
              Export
            </button>

            <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
              <Upload
                size={12}
                className="text-zinc-600"
              />
              Import

              <input
                type="file"
                accept=".json"
                onChange={
                  handleImport
                }
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-tighter hidden md:block">
            Z: {zoom.toFixed(1)}x | Δ:{' '}
            {offset.x}, {offset.y}
          </div>

          <div className="h-3 w-px bg-white/10" />

          <button
            onClick={toggleAllPanels}
            className="text-zinc-600 hover:text-white transition-colors flex items-center gap-2"
          >
            {allPanelsCollapsed ? (
              <Minimize2 size={14} />
            ) : (
              <Maximize2 size={14} />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT */}
        <div
          style={{
            width: leftCollapsed
              ? 0
              : leftWidth
          }}
          className="shrink-0 transition-all duration-200 ease-in-out relative z-20 overflow-hidden h-full"
        >
          {!leftCollapsed && (
            <FiltersPanel
              stats={stats}
              anyFilterActive={
                anyFilterActive
              }
              clearFilters={
                clearFilters
              }
              addNewStat={
                addNewStat
              }
              toggleStatVisibility={
                toggleStatVisibility
              }
              openIconPicker={
                openIconPicker
              }
              renderStatIcon={
                renderStatIcon
              }
              updateStatName={
                updateStatName
              }
              setEditingStat={
                setEditingStat
              }
              deleteStat={
                deleteStat
              }
              activeIconPicker={
                activeIconPicker
              }
              setActiveIconPicker={
                setActiveIconPicker
              }
              iconSearch={
                iconSearch
              }
              setIconSearch={
                setIconSearch
              }
              filteredIcons={
                filteredIcons
              }
              updateStatIcon={
                updateStatIcon
              }
            />
          )}
        </div>

        {!leftCollapsed && (
          <div
            className="w-1 hover:bg-white/10 cursor-col-resize shrink-0 z-20"
            onMouseDown={() => {
              isResizingLeft.current =
                true;

              document.body.style.cursor =
                'col-resize';
            }}
          />
        )}

        <button
          onClick={() =>
            setLeftCollapsed(
              prev => !prev
            )
          }
          className="absolute z-40 bg-[#0a0a0a] border border-white/10 p-1 rounded-r-md text-zinc-600 hover:text-white transition-all top-1/2 -translate-y-1/2"
          style={{
            left: leftCollapsed
              ? '0px'
              : `${leftWidth}px`
          }}
        >
          {leftCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>

        {/* MAIN */}
        <VisualizationArea
          visMode={visMode}
          chartData={chartData}
          entities={entities}
          selectedIdSet={
            selectedIdSet
          }
          hoveredId={hoveredId}
          selectedEntity={
            selectedEntity
          }
          activeStats={activeStats}
          entityTotals={
            entityTotals
          }
          topPerformers={
            topPerformers
          }
          leaderboardData={
            leaderboardData
          }
          dotsData={dotsData}
          pieData={pieData}
          zoom={zoom}
          offset={offset}
          handleWheel={
            handleWheel
          }
          handleChartMouseDown={
            handleChartMouseDown
          }
          resetView={resetView}
          setVisMode={setVisMode}
          handleEntitySelection={
            handleEntitySelection
          }
          CustomTooltip={
            CustomTooltip
          }
          renderStatIcon={
            renderStatIcon
          }
          renderCustomizedPieLabel={
            renderCustomizedPieLabel
          }
          renderActiveShape={
            renderActiveShape
          }
          bottomCollapsed={
            bottomCollapsed
          }
          setBottomCollapsed={
            setBottomCollapsed
          }
          monitorPage={
            monitorPage
          }
          setMonitorPage={
            setMonitorPage
          }
          paginatedEntities={
            paginatedEntities
          }
          handleMouseDownItem={
            handleMouseDownItem
          }
          handleMouseUpItem={
            handleMouseUpItem
          }
          handleMouseEnterItem={
            handleMouseEnterItem
          }
          handleMouseLeaveItem={
            handleMouseLeaveItem
          }
          totalPages={totalPages}
          activePieIndex={
            activePieIndex
          }
          setActivePieIndex={
            setActivePieIndex
          }
        />

        {/* RIGHT */}
        <div
          style={{
            width: rightCollapsed
              ? 0
              : rightWidth
          }}
          className="shrink-0 transition-all duration-200 ease-in-out relative z-20 overflow-hidden h-full"
        >
          {!rightCollapsed && (
            <RightPanel
              rightSplit={
                rightSplit
              }
              setRightSplit={
                setRightSplit
              }
              isResizingSplit={
                isResizingSplit
              }
              rightAsideRef={
                rightAsideRef
              }
              registryView={
                registryView
              }
              setRegistryView={
                setRegistryView
              }
              sortedEntities={
                sortedEntities
              }
              selectedIdSet={
                selectedIdSet
              }
              entityTotals={
                entityTotals
              }
              handleEntitySelection={
                handleEntitySelection
              }
              setHoveredId={
                setHoveredId
              }
              addNewEntity={
                addNewEntity
              }
              selectedEntity={
                selectedEntity
              }
              setEntities={
                setEntities
              }
              removeEntity={
                removeEntity
              }
              stats={stats}
              openIconPicker={
                openIconPicker
              }
              renderStatIcon={
                renderStatIcon
              }
              updateStatValue={
                updateStatValue
              }
            />
          )}
        </div>

        {!rightCollapsed && (
          <div
            className="w-1 hover:bg-white/10 cursor-col-resize shrink-0 z-20"
            onMouseDown={() => {
              isResizingRight.current =
                true;

              // FIX: this was row-resize.
              document.body.style.cursor =
                'col-resize';
            }}
          />
        )}

        <button
          onClick={() =>
            setRightCollapsed(
              prev => !prev
            )
          }
          className="absolute z-40 bg-[#0a0a0a] border border-white/10 p-1 rounded-l-md text-zinc-600 hover:text-white transition-all top-1/2 -translate-y-1/2"
          style={{
            right: rightCollapsed
              ? '0px'
              : `${rightWidth}px`
          }}
        >
          {rightCollapsed ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            * {
              outline: none !important;
              -webkit-tap-highlight-color: transparent;
            }

            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.05);
              border-radius: 10px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255,255,255,0.1);
            }

            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 10px;
              width: 10px;
              border-radius: 50%;
              background: #10b981;
              cursor: pointer;
            }
          `
        }}
      />
    </div>
  );
};

export default App;
