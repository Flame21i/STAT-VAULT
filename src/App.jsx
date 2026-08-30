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
  Area,
  ReferenceArea
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
  Activity,
  Eye,
  EyeOff,
  Copy,
  X,
  Image as ImageIcon,
  Save,
  FolderOpen,
  Grid,
  FileSpreadsheet
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
  Eye as EyeIcon,
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

const ANIMATION_STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  @keyframes slideInBottom {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes rotateIn {
    from { opacity: 0; transform: rotate(-180deg); }
    to { opacity: 1; transform: rotate(0); }
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.2s ease-out;
  }

  .animate-fade-in-down {
    animation: fadeInDown 0.2s ease-out;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.2s ease-out;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.2s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.2s ease-out;
  }

  .animate-bounce-in {
    animation: bounceIn 0.5s ease-out;
  }

  .animate-slide-in-bottom {
    animation: slideInBottom 0.2s ease-out;
  }

  .animate-rotate-in {
    animation: rotateIn 0.2s ease-out;
  }

  .transition-all-300 {
    transition: all 0.2s ease-out;
  }

  .transition-all-500 {
    transition: all 0.5s ease-out;
  }

  .transition-transform-300 {
    transition: transform 0.2s ease-out;
  }

  .hover-bg-white {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-white:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .hover-bg-white-sm {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-white-sm:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .hover-bg-emerald {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-emerald:hover {
    background-color: rgba(16, 185, 129, 0.15);
  }

  .hover-bg-emerald-sm {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-emerald-sm:hover {
    background-color: rgba(16, 185, 129, 0.08);
  }

  .hover-bg-amber {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-amber:hover {
    background-color: rgba(245, 158, 11, 0.15);
  }

  .hover-bg-rose {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-rose:hover {
    background-color: rgba(244, 63, 94, 0.15);
  }

  .hover-bg-blue {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-blue:hover {
    background-color: rgba(59, 130, 246, 0.15);
  }

  .hover-bg-purple {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-purple:hover {
    background-color: rgba(168, 85, 247, 0.15);
  }

  .hover-bg-yellow {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-yellow:hover {
    background-color: rgba(250, 204, 21, 0.15);
  }

  .hover-bg-orange {
    transition: background-color 0.2s ease-out;
  }
  
  .hover-bg-orange:hover {
    background-color: rgba(249, 115, 22, 0.15);
  }

  .hover-brightness {
    transition: filter 0.2s ease-out;
  }
  
  .hover-brightness:hover {
    filter: brightness(1.3);
  }

  .hover-brightness-sm {
    transition: filter 0.2s ease-out;
  }
  
  .hover-brightness-sm:hover {
    filter: brightness(1.15);
  }

  .active-bg-white {
    transition: background-color 0.2s ease-out;
  }
  
  .active-bg-white:active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .active-bg-emerald {
    transition: background-color 0.2s ease-out;
  }
  
  .active-bg-emerald:active {
    background-color: rgba(16, 185, 129, 0.3);
  }

  .active-bg-rose {
    transition: background-color 0.2s ease-out;
  }
  
  .active-bg-rose:active {
    background-color: rgba(244, 63, 94, 0.3);
  }

  .active-bg-amber {
    transition: background-color 0.2s ease-out;
  }
  
  .active-bg-amber:active {
    background-color: rgba(245, 158, 11, 0.3);
  }

  .active-bg-blue {
    transition: background-color 0.2s ease-out;
  }
  
  .active-bg-blue:active {
    background-color: rgba(59, 130, 246, 0.3);
  }

  .active-brightness {
    transition: filter 0.2s ease-out;
  }
  
  .active-brightness:active {
    filter: brightness(1.4);
  }

  .stagger-animation > * {
    animation: fadeInUp 0.2s ease-out both;
  }
  
  .stagger-animation > *:nth-child(1) { animation-delay: 0.05s; }
  .stagger-animation > *:nth-child(2) { animation-delay: 0.1s; }
  .stagger-animation > *:nth-child(3) { animation-delay: 0.15s; }
  .stagger-animation > *:nth-child(4) { animation-delay: 0.2s; }
  .stagger-animation > *:nth-child(5) { animation-delay: 0.25s; }
  .stagger-animation > *:nth-child(6) { animation-delay: 0.3s; }
  .stagger-animation > *:nth-child(7) { animation-delay: 0.35s; }
  .stagger-animation > *:nth-child(8) { animation-delay: 0.4s; }
  .stagger-animation > *:nth-child(9) { animation-delay: 0.45s; }
  .stagger-animation > *:nth-child(10) { animation-delay: 0.5s; }
  .stagger-animation > *:nth-child(11) { animation-delay: 0.55s; }
  .stagger-animation > *:nth-child(12) { animation-delay: 0.6s; }
  .stagger-animation > *:nth-child(13) { animation-delay: 0.65s; }
  .stagger-animation > *:nth-child(14) { animation-delay: 0.7s; }
  .stagger-animation > *:nth-child(15) { animation-delay: 0.75s; }
  .stagger-animation > *:nth-child(16) { animation-delay: 0.8s; }
  .stagger-animation > *:nth-child(17) { animation-delay: 0.85s; }
  .stagger-animation > *:nth-child(18) { animation-delay: 0.9s; }
  .stagger-animation > *:nth-child(19) { animation-delay: 0.95s; }
  .stagger-animation > *:nth-child(20) { animation-delay: 1s; }
`;

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
      { name: 'Eye', icon: EyeIcon },
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
const ICON_MAP = new Map(
  FLAT_ICONS.map(item => [item.name, item.icon])
);

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
  const wheelContainerRef = useRef(null);
  const wheelHandlerRef = useRef(handleWheel);

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

  return (
    <main className="flex-1 relative bg-[#080808] overflow-hidden min-w-0 outline-none">
      <div
        ref={wheelContainerRef}
        className="absolute inset-0 flex items-center justify-center cursor-crosshair overflow-hidden outline-none"
        onMouseDown={handleChartMouseDown}
      >
        <div
          className="w-full h-full p-12 transition-transform duration-75 ease-out outline-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* TABLE MODE - MOVED OUTSIDE RESPONSIVECONTAINER */}
          {visMode === 'heatmap' ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar">
              <div className="w-full max-w-5xl">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-[10px] font-black uppercase text-zinc-600 border-b border-white/10 text-left sticky left-0 bg-[#080808] z-10 min-w-[140px]">
                        STAT
                      </th>
                      {entities.map(entity => (
                        <th key={entity.id} className="px-3 py-2 text-[10px] font-black uppercase text-zinc-600 border-b border-white/10 text-center min-w-[120px]">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entity.color }} />
                            <span className="truncate max-w-[120px]">{entity.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeStats.map((stat, rowIndex) => (
                      <tr key={stat.id} className={rowIndex % 2 === 0 ? 'bg-white/[0.03]' : 'bg-transparent'}>
                        <td className="px-3 py-2 border-b border-white/10 sticky left-0 bg-[#080808] z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-600">{renderStatIcon(stat, 12)}</span>
                            <span className="text-[12px] font-bold uppercase text-zinc-500 truncate">
                              {stat.name}
                            </span>
                          </div>
                        </td>
                        {entities.map(entity => {
                          const value = entity.values[stat.id] || 0;
                          const maxValue = Math.max(...activeStats.map(s => entity.values[s.id] || 0));
                          const concentration = maxValue > 0 ? value / maxValue : 0;
                          const bgColor = hexToRgba(entity.color, concentration * 0.8);
                          const rowOpacity = selectedIdSet.has(entity.id) || selectedIdSet.size === 0 ? 1 : 0.15;
                          return (
                            <td 
                              key={entity.id} 
                              className="px-3 py-2 border-b border-white/10 text-center cursor-pointer transition-all duration-200 ease-out hover:brightness-125"
                              style={{ backgroundColor: bgColor, opacity: rowOpacity }}
                              onClick={() => handleEntitySelection(entity.id)}
                            >
                              <span className="text-[12px] font-black text-white/90 tabular-nums">
                                {value}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-black/40">
                      <td className="px-3 py-2 border-t border-white/10 sticky left-0 bg-[#0a0a0a] z-10 text-[10px] font-black uppercase text-zinc-600">
                        TOTAL
                      </td>
                      {entities.map(entity => (
                        <td key={entity.id} className="px-3 py-2 border-t border-white/10 text-center">
                          <span className="text-[12px] font-black text-zinc-500 tabular-nums">
                            {entityTotals[entity.id] || 0}
                          </span>
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
                  <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ x, y, payload }) => {
                      const stat = activeStats.find(s => s.name === payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text dy={19} textAnchor="middle" fill="#8a8a8a" fontSize={8} fontWeight={900}>
                            {payload.value}
                          </text>
                          {stat && (
                            <foreignObject x="-8" y="-13" width="16" height="16">
                              <div className="flex items-center justify-center text-zinc-700">
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
                    tick={{ fill: '#e9e9e9', fontSize: 10, fontWeight: 700 }}
                    axisLine={true}
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
                      className="cursor-pointer outline-none hover-brightness"
                      onClick={() => handleEntitySelection(entity.id)}
                    />
                  ))}
                </RadarChart>
              ) : visMode === 'leaderboard' ? (
                <BarChart layout="vertical" data={leaderboardData} margin={{ left: 40, right: 40, top: 40, bottom: 40 }}>
                  <XAxis
                    type="number"
                    domain={['auto', 'auto']}
                    tick={{ fill: '#999', fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }}
                    width={100}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} isAnimationActive={false} onClick={data => handleEntitySelection(data.id)}>
                    {leaderboardData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        fillOpacity={selectedIdSet.has(entry.id) || selectedIdSet.size === 0 ? 0.6 : 0.1}
                        className="cursor-pointer outline-none hover-brightness active-brightness"
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : visMode === 'dots' ? (
                <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  {activeStats.map((stat, index) => (
                    <ReferenceArea
                      key={stat.id}
                      x1={index - 0.5}
                      x2={index + 0.5}
                      y1="auto"
                      y2="auto"
                    />
                  ))}
                  <XAxis
                    type="number"
                    dataKey="xIndex"
                    domain={[-0.5, activeStats.length - 0.5]}
                    ticks={activeStats.map((_, i) => i)}
                    tickFormatter={(value) => activeStats[Number(value)]?.name || ''}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#777', fontSize: 10, fontWeight: 700 }}
                    xAxisId="xAxis"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={['auto', 'auto']}
                    tick={{ fill: '#aaa', fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    yAxisId="yAxis"
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
                <AreaChart data={chartData} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical horizontal={false} />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }} />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#999', fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
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
                      className="cursor-pointer outline-none hover-brightness active-brightness"
                      onClick={() => handleEntitySelection(entity.id)}
                    />
                  ))}
                </AreaChart>
              ) : visMode === 'pie' ? (
                selectedEntity ? (
                  <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <Pie
                      activeIndex={activePieIndex === null ? undefined : activePieIndex}
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
                      onClick={(_, index) => setActivePieIndex(prev => (prev === index ? null : index))}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={selectedEntity.color}
                          fillOpacity={0.2 + (entry.value / 100) * 0.8}
                          className="cursor-pointer outline-none hover-brightness active-brightness"
                        />
                      ))}
                      <Label
                        position="center"
                        content={({ viewBox }) => {
                          if (!viewBox) return null;
                          const { x, y, width, height } = viewBox;
                          const cx = x + width / 2;
                          const cy = y + height / 2;
                          return (
                            <g>
                              <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="10" fontWeight="900">
                                {selectedEntity.name}
                              </text>
                              <circle cx={cx} cy={cy + 12} r="2.5" fill={selectedEntity.color} />
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

          {visMode === 'pie' && !selectedEntity && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none animate-fade-in">
              <PieChartIcon size={48} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">
                Focus on single unit for analysis
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-40">
        <div className="flex items-center bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-0.5 shadow-2xl pointer-events-auto animate-fade-in-down">
          <div className="flex items-center gap-0.5 pr-0.5 border-r border-white/10 mr-0.5">
            {[
              { id: 'radar', icon: Target, label: 'Radar' },
              { id: 'parallel', icon: Activity, label: 'Parallel' },
              { id: 'dots', icon: CircleDot, label: 'Dots' },
              { id: 'pie', icon: PieChartIcon, label: 'Pie' },
              { id: 'heatmap', icon: Grid, label: 'Table' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setVisMode(mode.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-200 ease-out hover-bg-white active-bg-white ${
                  visMode === mode.id
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-zinc-600 hover:text-white hover:bg-white/5'
                }`}
              >
                <mode.icon size={11} />
                <span className="hidden lg:inline">{mode.label}</span>
              </button>
            ))}
            <button
              onClick={() => setVisMode('leaderboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-200 ease-out hover-bg-white active-bg-white ${
                visMode === 'leaderboard'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-600 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy size={11} />
              <span className="hidden lg:inline">Board</span>
            </button>
          </div>
          <button
            onClick={resetView}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/5 transition-all duration-200 ease-out hover-bg-white active-bg-white"
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4 gap-2 pointer-events-none transition-all duration-200 ease-out z-40 ${
          bottomCollapsed ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'
        }`}
      >
        <button
          onClick={() => setBottomCollapsed(prev => !prev)}
          className="pointer-events-auto bg-[#0a0a0a] border border-white/10 p-1.5 rounded-full text-zinc-600 hover:text-white transition-all duration-200 ease-out shadow-xl hover-bg-white active-bg-white"
        >
          {bottomCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div className="max-w-[95%] w-fit bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex items-center gap-1.5 shadow-2xl pointer-events-auto overflow-hidden animate-fade-in-up">
          {paginatedEntities.map(entity => (
            <div
              key={entity.id}
              onMouseDown={() => handleMouseDownItem(entity.id)}
              onMouseUp={() => handleMouseUpItem(entity.id)}
              onMouseEnter={() => handleMouseEnterItem(entity.id)}
              onMouseLeave={handleMouseLeaveItem}
              style={{
                backgroundColor: selectedIdSet.has(entity.id) ? `${entity.color}25` : 'transparent',
                borderColor: selectedIdSet.has(entity.id) ? `${entity.color}60` : 'rgba(255,255,255,0.03)'
              }}
              className={`min-w-[80px] px-2 py-1.5 rounded-lg border flex flex-col gap-1 transition-all duration-200 ease-out cursor-pointer hover-bg-white active-bg-white ${
                selectedIdSet.has(entity.id) ? 'shadow-inner' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1 h-1 rounded-full`}
                  style={{ backgroundColor: entity.color }}
                />
                <span
                  className={`text-[8px] font-black uppercase truncate transition-colors duration-200 ease-out ${
                    selectedIdSet.has(entity.id) ? 'text-white' : 'text-zinc-600'
                  }`}
                >
                  {entity.name}
                </span>
              </div>
              <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${activeStats.length ? ((entityTotals[entity.id] || 0) / (activeStats.length * 100)) * 100 : 0}%`,
                    backgroundColor: entity.color
                  }}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/5">
            <button
              disabled={monitorPage === 0}
              onClick={() => setMonitorPage(p => Math.max(0, p - 1))}
              className="p-1 rounded-md text-zinc-700 hover:text-white disabled:opacity-30 transition-colors duration-200 ease-out hover-bg-white active-bg-white"
            >
              <ChevronUp size={12} />
            </button>
            <span className="text-[7px] font-black text-zinc-500 tabular-nums uppercase">
              {monitorPage + 1}/{totalPages || 1}
            </span>
            <button
              disabled={monitorPage >= totalPages - 1}
              onClick={() => setMonitorPage(p => Math.min(Math.max(0, totalPages - 1), p + 1))}
              className="p-1 rounded-md text-zinc-700 hover:text-white disabled:opacity-30 transition-colors duration-200 ease-out hover-bg-white active-bg-white"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
});

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
  updateStatIcon,
  projects,
  onSaveProject,
  onLoadProject,
  onDeleteProject,
  selectedProjectId
}) => {
  const [newProjectName, setNewProjectName] = useState('');

  return (
    <aside className="border-r border-white/5 flex flex-col bg-[#0a0a0a] shrink-0 relative z-20 overflow-hidden h-full">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0 h-14 whitespace-nowrap">
        <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
          FILTERS
        </span>
        <div className="flex items-center gap-1">
          {anyFilterActive && (
            <button onClick={clearFilters} className="p-1.5 rounded hover:text-rose-500 transition-all duration-200 ease-out hover-bg-rose active-bg-rose">
              <FilterX size={14} />
            </button>
          )}
          <button onClick={addNewStat} className="p-1.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all duration-200 ease-out hover-bg-emerald active-bg-emerald">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar stagger-animation">
        {stats.map(stat => (
          <div
            key={stat.id}
            onClick={() => toggleStatVisibility(stat.id)}
            className={`group relative flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-all duration-200 ease-out hover-bg-white active-bg-white ${
              stat.visible
                ? 'bg-emerald-500/10 border-emerald-500/20 text-zinc text-zinc-300 hover-bg-emerald active-bg-emerald font-bold uppercase'
                : 'bg-white/[0.02] border-white/5 hover:bg-emerald-500/20'
            } ${
              anyFilterActive && !stat.visible ? 'opacity-30' : 'opacity-100'
            } whitespace-nowrap`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border transition-all duration-200 ease-out hover-bg-white active-bg-white ${
                stat.visible
                  ? 'bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
              onClick={e => openIconPicker(e, stat.id)}
            >
              {renderStatIcon(stat, 11)}
            </div>

            {stat.editing ? (
              <input
                autoFocus
                className="bg-zinc-900 border-none text-[10px] text-white w-full font-bold uppercase focus:outline-none px-1 animate-fade-in"
                defaultValue={stat.name}
                onClick={e => e.stopPropagation()}
                onBlur={e => updateStatName(stat.id, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    updateStatName(stat.id, e.target.value);
                  }
                }}
              />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-tighter truncate flex-1 transition-colors duration-200 ease-out">
                {stat.name}
              </span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
              <button onClick={e => { e.stopPropagation(); setEditingStat(stat.id); }} className="p-1 hover:text-white transition-colors duration-200 ease-out hover-bg-white active-bg-white">
                <Edit3 size={11} />
              </button>
              <button onClick={e => { e.stopPropagation(); deleteStat(stat.id); }} className="p-1 hover:text-rose-500 transition-colors duration-200 ease-out hover-bg-rose active-bg-rose">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 p-3 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
            Projects
          </span>
          <span className="text-[7px] font-black text-zinc-700">
            {projects.length} saved
          </span>
        </div>

        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Project name..."
            className="flex-1 bg-white/[0.02] border border-white/5 rounded px-2 py-1 text-[8px] font-bold text-white uppercase focus:outline-none focus:border-emerald-500/40"
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newProjectName.trim()) {
                onSaveProject(newProjectName);
                setNewProjectName('');
              }
            }}
          />
          <button
            onClick={() => {
              if (newProjectName.trim()) {
                onSaveProject(newProjectName);
                setNewProjectName('');
              }
            }}
            className="p-1 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all duration-200 ease-out hover-bg-emerald active-bg-emerald"
            title="Save project"
          >
            <Save size={12} />
          </button>
        </div>

        <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
          {projects.length === 0 ? (
            <p className="text-[8px] font-black uppercase text-zinc-800 text-center py-2">
              No projects saved
            </p>
          ) : (
            projects.map(project => {
              const isSelected = selectedProjectId === project.id;
              return (
                <div
                  key={project.id}
                  className={`group flex items-center justify-between p-1.5 rounded border transition-all duration-200 ease-out ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/30'
                      : 'border-white/5 hover-bg-white active-bg-white'
                  }`}
                >
                  <button
                    onClick={() => onLoadProject(project.id)}
                    className={`flex items-center gap-2 flex-1 text-left ${
                      isSelected ? 'text-emerald-400' : 'text-zinc-600'
                    }`}
                    title="Load project"
                  >
                    <FolderOpen size={10} className={isSelected ? 'text-emerald-400' : 'text-zinc-600'} />
                    <span className="text-[8px] font-bold uppercase truncate max-w-[100px]">
                      {project.name}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 text-zinc-600 hover:text-rose-500"
                    title="Delete project"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {activeIconPicker && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setActiveIconPicker(null)} />
          <div
            className="fixed z-[100] bg-[#0d0d0d] border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 w-64 flex flex-col animate-scale-in"
            style={{
              left: Math.min(activeIconPicker.x, window.innerWidth - 270),
              top: Math.min(activeIconPicker.y, window.innerHeight - 340)
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2 mb-3">
              <Search size={10} className="text-zinc-600" />
              <input
                autoFocus
                placeholder="SEARCH MAPS..."
                value={iconSearch}
                onChange={e => setIconSearch(e.target.value)}
                className="bg-transparent border-none py-1.5 text-[8px] font-black text-white focus:outline-none w-full uppercase placeholder:text-zinc-700"
              />
            </div>
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
              {filteredIcons.map(category => (
                <div key={category.category} className="mb-4">
                  <div className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 flex justify-between items-center">
                    <span>{category.category}</span>
                    <span className="opacity-40">{category.icons.length}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {category.icons.map(item => (
                      <button
                        key={item.name}
                        onClick={() => updateStatIcon(activeIconPicker.id, 'icon', item.name)}
                        className={`p-1.5 rounded hover:bg-white/10 transition-all duration-200 ease-out flex items-center justify-center hover-bg-white active-bg-white ${
                          stats.find(s => s.id === activeIconPicker.id)?.iconName === item.name
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
  toggleEntityVisibility,
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
      <div style={{ height: `${rightSplit}%` }} className="flex flex-col min-h-0 overflow-hidden">
        <div className="h-[84px] border-b border-white/5 bg-black/20 shrink-0 p-4 relative flex flex-col justify-between">
          <div className="flex justify-between items-center h-6">
            <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
              Registry
            </span>
            <button
              onClick={addNewEntity}
              className="p-1.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all duration-200 ease-out hover-bg-emerald active-bg-emerald"
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
                onClick={() => setRegistryView(view.id)}
                className={`p-1.5 rounded transition-all duration-200 ease-out hover-bg-white active-bg-white ${
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
          {sortedEntities.map((entity, index) => {
            const isSelected = selectedIdSet.has(entity.id);
            const totalScore = entityTotals[entity.id] || 0;
            return (
              <div
                key={entity.id}
                onClick={() => handleEntitySelection(entity.id)}
                onMouseEnter={() => setHoveredId(entity.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: isSelected ? `${entity.color}35` : `${entity.color}05`,
                  borderColor: isSelected ? `${entity.color}80` : `${entity.color}15`,
                  opacity: entity.visible ? 1 : 0.4,
                  animationDelay: `${index * 0.05}s`
                }}
                className={`group relative flex items-center cursor-pointer border transition-all duration-200 ease-out hover-bg-white active-bg-white animate-fade-in ${
                  registryView === 'grid'
                    ? 'aspect-square flex-col justify-center rounded-sm p-0'
                    : 'p-2 rounded-sm'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEntityVisibility(entity.id);
                  }}
                  className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out p-1 hover:text-white hover-bg-white active-bg-white"
                  title={entity.visible ? 'Hide entity' : 'Show entity'}
                >
                  {entity.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>

                <div
                  className={`flex items-center transition-all duration-200 ease-out ${
                    registryView === 'grid' ? 'flex-col gap-0.5' : 'gap-3 w-full pr-6'
                  } whitespace-nowrap`}
                >
                  <div
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: entity.color }}
                  />
                  <span
                    className={`text-[9px] font-bold uppercase truncate transition-colors duration-200 ease-out ${
                      isSelected ? 'text-white' : 'text-zinc-600'
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
          document.body.style.cursor = 'row-resize';
        }}
      />

      <div
        className="p-4 flex flex-col bg-black/20 min-h-0 overflow-hidden"
        style={{ height: `${100 - rightSplit}%` }}
      >
        <div className="p-2 mb-4 border-b border-white/5 flex items-center gap-2 shrink-0">
          <Settings2 size={12} className="text-zinc-600" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
            Parameters
          </span>
        </div>

        {selectedEntity ? (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar animate-fade-in">
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
                        entity.id === selectedEntity.id
                          ? { ...entity, name: e.target.value.toUpperCase() }
                          : entity
                      )
                    )
                  }
                  className="flex-1 bg-white/[0.02] border border-white/5 rounded px-2 text-[10px] font-bold text-white uppercase focus:outline-none focus:border-emerald-500/40 transition-all duration-200 ease-out"
                />
                <div
                  className="w-8 relative rounded border border-white/5 overflow-hidden"
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
                  className="w-8 h-8 rounded border border-white/5 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 ease-out hover-bg-rose active-bg-rose"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="space-y-2 stagger-animation">
              {stats.map(stat => {
                const value = selectedEntity.values[stat.id] ?? 0;
                return (
                  <div
                    key={stat.id}
                    className="flex flex-col gap-1.5 p-2 bg-white/[0.02] rounded border border-white/5 transition-all duration-200 ease-out hover-bg-white active-bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="text-zinc-600 opacity-70 cursor-pointer"
                          onClick={e => openIconPicker(e, stat.id)}
                        >
                          {renderStatIcon(stat, 10)}
                        </div>
                        <span className="text-[9px] font-bold uppercase text-zinc-500">
                          {stat.name}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={value}
                        onChange={e => updateStatValue(selectedEntity.id, stat.id, e.target.value)}
                        className="w-24 bg-white/[0.02] border border-white/5 rounded px-2 py-0.5 text-[10px] font-bold text-emerald-400 text-right focus:outline-none focus:border-emerald-500/40 transition-all duration-200 ease-out"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <TargetIcon size={32} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              Idle
            </p>
          </div>
        )}
      </div>
    </aside>
  );
});

const STORAGE_KEY = 'statvault-pro-state';

const App = () => {
  const loadStateFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return null;
  };

  const initialState = useMemo(() => loadStateFromStorage(), []);

  const [leftCollapsed, setLeftCollapsed] = useState(initialState?.leftCollapsed ?? false);
  const [rightCollapsed, setRightCollapsed] = useState(initialState?.rightCollapsed ?? false);
  const [bottomCollapsed, setBottomCollapsed] = useState(initialState?.bottomCollapsed ?? false);
  const [selectedIds, setSelectedIds] = useState(initialState?.selectedIds ?? []);
  const [hoveredId, setHoveredId] = useState(null);
  const [monitorPage, setMonitorPage] = useState(initialState?.monitorPage ?? 0);
  const [registryView, setRegistryView] = useState(initialState?.registryView ?? 'grid');
  const [visMode, setVisMode] = useState(initialState?.visMode ?? 'radar');
  const [multiSelectMode, setMultiSelectMode] = useState(initialState?.multiSelectMode ?? false);
  const [activeIconPicker, setActiveIconPicker] = useState(null);
  const [iconSearch, setIconSearch] = useState('');
  const [zoom, setZoom] = useState(initialState?.zoom ?? 1);
  const [offset, setOffset] = useState(initialState?.offset ?? { x: 0, y: 0 });
  const offsetRef = useRef(offset);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [activePieIndex, setActivePieIndex] = useState(initialState?.activePieIndex ?? null);
  const [leftWidth, setLeftWidth] = useState(initialState?.leftWidth ?? 240);
  const [rightWidth, setRightWidth] = useState(initialState?.rightWidth ?? 320);
  const [rightSplit, setRightSplit] = useState(initialState?.rightSplit ?? 50);

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

  const [stats, setStats] = useState(
    initialState?.stats ?? [
      { id: 's1', name: 'STAT_01', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
      { id: 's2', name: 'STAT_02', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
      { id: 's3', name: 'STAT_03', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
      { id: 's4', name: 'STAT_04', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
      { id: 's5', name: 'STAT_05', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
      { id: 's6', name: 'STAT_06', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' }
    ]
  );

  const [entities, setEntities] = useState(
    initialState?.entities ?? [
      { id: 'e1', name: 'ENT_01', visible: true, color: '#10b981', values: { s1: 80, s2: 45, s3: 90, s4: 65, s5: 75, s6: 55 } },
      { id: 'e2', name: 'ENT_02', visible: true, color: '#3b82f6', values: { s1: 45, s2: 85, s3: 40, s4: 95, s5: 55, s6: 70 } },
      { id: 'e3', name: 'ENT_03', visible: true, color: '#f59e0b', values: { s1: 60, s2: 70, s3: 50, s4: 40, s5: 90, s6: 30 } },
      { id: 'e4', name: 'ENT_04', visible: true, color: '#ec4899', values: { s1: 30, s2: 30, s3: 80, s4: 80, s5: 40, s6: 90 } }
    ]
  );

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return CATEGORIZED_ICONS;
    const search = iconSearch.toLowerCase();
    return CATEGORIZED_ICONS
      .map(category => ({
        ...category,
        icons: category.icons.filter(item => item.name.toLowerCase().includes(search))
      }))
      .filter(category => category.icons.length > 0);
  }, [iconSearch]);

  const getRandomColor = useCallback(() => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

  const getRandomStats = useCallback(() => {
    const values = {};
    for (const stat of stats) {
      values[stat.id] = Math.floor(Math.random() * 101);
    }
    return values;
  }, [stats]);

  const addNewStat = useCallback(() => {
    const newId = `s_${crypto.randomUUID()}`;
    setStats(prev => [
      ...prev,
      {
        id: newId,
        name: `STAT_${String(prev.length + 1).padStart(2, '0')}`,
        visible: false,
        editing: false,
        iconType: 'icon',
        iconName: 'Hashtag'
      }
    ]);
    setEntities(prev =>
      prev.map(entity => ({
        ...entity,
        values: { ...entity.values, [newId]: 0 }
      }))
    );
  }, []);

  const updateStatIcon = useCallback((statId, type, value) => {
    setStats(prev =>
      prev.map(stat =>
        stat.id === statId ? { ...stat, iconType: type, iconName: value } : stat
      )
    );
    setActiveIconPicker(null);
    setIconSearch('');
  }, []);

  const renderStatIcon = useCallback((stat, size = 12) => {
    const IconComponent = ICON_MAP.get(stat.iconName) || Hash;
    return <IconComponent size={size} />;
  }, []);

  const toggleStatVisibility = useCallback(id => {
    setStats(prev =>
      prev.map(stat => (stat.id === id ? { ...stat, visible: !stat.visible } : stat))
    );
  }, []);

  const setEditingStat = useCallback(id => {
    setStats(prev =>
      prev.map(stat => (stat.id === id ? { ...stat, editing: true } : stat))
    );
  }, []);

  const updateStatName = useCallback((id, newName) => {
    setStats(prev =>
      prev.map(stat =>
        stat.id === id ? { ...stat, name: newName.toUpperCase(), editing: false } : stat
      )
    );
  }, []);

  const deleteStat = useCallback(id => {
    setStats(prev => prev.filter(stat => stat.id !== id));
    setEntities(prev =>
      prev.map(entity => {
        const values = { ...entity.values };
        delete values[id];
        return { ...entity, values };
      })
    );
  }, []);

  const updateStatValue = useCallback((entityId, statId, value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setEntities(prev =>
      prev.map(entity => {
        if (entity.id !== entityId) return entity;
        if (entity.values[statId] === num) return entity;
        return { ...entity, values: { ...entity.values, [statId]: num } };
      })
    );
  }, []);

  const openIconPicker = useCallback((event, statId) => {
    event.stopPropagation();
    setActiveIconPicker({ id: statId, x: event.clientX, y: event.clientY });
  }, []);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // JSON export
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
  }, [stats, entities, showToast]);

  // JSON import
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
  }, [showToast]);

  // CSV export
  const handleCsvExport = useCallback(() => {
    if (!stats.length || !entities.length) {
      showToast('No data to export');
      return;
    }
    const rows = [];
    // Header
    const header = ['STAT', ...entities.map(e => e.name)];
    rows.push(header);
    // Data rows
    stats.forEach(stat => {
      const row = [stat.name];
      entities.forEach(entity => {
        row.push(entity.values[stat.id] ?? 0);
      });
      rows.push(row);
    });
    // Totals row? optional
    const csvContent = rows.map(row => row.join(',')).join('\n');
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
  }, [stats, entities, showToast]);

  // CSV import
  const handleCsvImport = useCallback(event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result || '';
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          showToast('Invalid CSV: no data rows');
          return;
        }
        const header = lines[0].split(',').map(c => c.trim());
        const statNames = header.slice(1).map(c => c.trim());
        const statNamesSet = new Set(stats.map(s => s.name));
        const newStats = [...stats];
        // For each column that is not a stat name, create a new stat if needed
        statNames.forEach(name => {
          if (!statNamesSet.has(name)) {
            const newStat = {
              id: `s_${crypto.randomUUID()}`,
              name,
              visible: false,
              editing: false,
              iconType: 'icon',
              iconName: 'Hashtag'
            };
            newStats.push(newStat);
            statNamesSet.add(name);
            // add placeholder values for all entities
            entities.forEach(entity => {
              entity.values[newStat.id] = 0;
            });
          }
        });
        setStats(newStats);

        // Update entity values
        const newEntities = entities.map(entity => ({ ...entity, values: { ...entity.values } }));
        const entityMap = new Map(newEntities.map(e => [e.name, e]));
        const headerEntityNames = header.slice(1).map(c => c.trim());
        // If some entities in CSV don't exist, create them
        headerEntityNames.forEach(name => {
          if (!entityMap.has(name)) {
            const newEntity = {
              id: `e_${crypto.randomUUID()}`,
              name,
              visible: true,
              color: getRandomColor(),
              values: {}
            };
            // fill with zeros for all stats
            newStats.forEach(s => { newEntity.values[s.id] = 0; });
            newEntities.push(newEntity);
            entityMap.set(name, newEntity);
          }
        });

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(',').map(c => c.trim());
          if (cells.length !== header.length) continue;
          const statName = cells[0];
          const stat = newStats.find(s => s.name === statName);
          if (!stat) continue;
          for (let j = 1; j < cells.length; j++) {
            const entityName = header[j];
            const entity = entityMap.get(entityName);
            if (entity && stat) {
              entity.values[stat.id] = parseFloat(cells[j]) || 0;
            }
          }
        }

        setEntities(newEntities);
        setSelectedIds([]);
        setMonitorPage(0);
        showToast('CSV imported');
      } catch (err) {
        console.error('CSV import error', err);
        showToast('Failed to import CSV');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [stats, entities, getRandomColor, showToast]);

  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('statvault-projects');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const saveProject = useCallback((name) => {
    if (!name.trim()) return;
    const newProject = {
      id: crypto.randomUUID(),
      name: name.trim(),
      data: {
        stats,
        entities,
        leftCollapsed,
        rightCollapsed,
        bottomCollapsed,
        selectedIds,
        visMode,
        zoom,
        offset
      },
      createdAt: new Date().toISOString()
    };
    setProjects(prev => {
      const updated = [...prev, newProject];
      localStorage.setItem('statvault-projects', JSON.stringify(updated));
      return updated;
    });
    setSelectedProjectId(newProject.id);
  }, [stats, entities, leftCollapsed, rightCollapsed, bottomCollapsed, selectedIds, visMode, zoom, offset]);

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
    if (data.visMode) setVisMode(data.visMode);
    if (data.zoom) setZoom(data.zoom);
    if (data.offset) setOffset(data.offset);
    setSelectedProjectId(id);
  }, [projects]);

  const deleteProject = useCallback((id) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('statvault-projects', JSON.stringify(updated));
      return updated;
    });
    if (selectedProjectId === id) setSelectedProjectId(null);
  }, [selectedProjectId]);

  const [showPngExport, setShowPngExport] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showFiltersExport, setShowFiltersExport] = useState(true);
  const [showEntitiesExport, setShowEntitiesExport] = useState(true);
  const exportAreaRef = useRef(null);

  const handlePngExport = useCallback(() => {
    setShowPngExport(true);
  }, []);

  const handlePngCopy = useCallback(async () => {
    if (!exportAreaRef.current) return;
    setIsCopying(true);
    try {
      // Dynamic import – only loads when needed
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(exportAreaRef.current, {
        backgroundColor: '#080808',
        pixelRatio: 2,
        cacheBust: true
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setShowPngExport(false);
      showToast('PNG copied to clipboard');
    } catch (err) {
      console.error('Failed to copy PNG to clipboard:', err);
      showToast('Failed to copy PNG');
    } finally {
      setIsCopying(false);
    }
  }, [showToast]);

  const handlePngCancel = useCallback(() => {
    setShowPngExport(false);
  }, []);

  useEffect(() => {
    const handleMouseMoveGlobal = event => {
      if (isResizingLeft.current && !leftCollapsed) {
        setLeftWidth(Math.max(180, Math.min(400, event.clientX)));
      }
      if (isResizingRight.current && !rightCollapsed) {
        setRightWidth(Math.max(240, Math.min(500, window.innerWidth - event.clientX)));
      }
      if (isResizingSplit.current) {
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
          y: Math.min(Math.max(startOffset.y + dy, -400), 400)
        };
        if (!panFrameRef.current) {
          panFrameRef.current = requestAnimationFrame(() => {
            panFrameRef.current = null;
            if (pendingOffsetRef.current) {
              setOffset(pendingOffsetRef.current);
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

  const handleWheel = useCallback(event => {
    event.preventDefault();
    pendingZoomRef.current += event.deltaY * -0.001;
    if (!zoomFrameRef.current) {
      zoomFrameRef.current = requestAnimationFrame(() => {
        zoomFrameRef.current = null;
        const delta = pendingZoomRef.current;
        pendingZoomRef.current = 0;
        if (delta) {
          setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
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
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    pendingOffsetRef.current = { x: 0, y: 0 };
    setActivePieIndex(null);
  }, []);

  const clearFilters = useCallback(() => {
    setStats(prev => prev.map(stat => ({ ...stat, visible: false })));
  }, []);

  const toggleEntityVisibility = useCallback((entityId) => {
    setEntities(prev =>
      prev.map(entity =>
        entity.id === entityId ? { ...entity, visible: !entity.visible } : entity
      )
    );
  }, []);

  const handleEntitySelection = useCallback(
    id => {
      if (multiSelectMode) {
        setSelectedIds(prev => {
          const next = prev.includes(id)
            ? prev.filter(selectedId => selectedId !== id)
            : [...prev, id];
          if (next.length === 0) setMultiSelectMode(false);
          return next;
        });
      } else {
        setSelectedIds(prev => (prev.length === 1 && prev[0] === id ? [] : [id]));
      }
      setActivePieIndex(null);
    },
    [multiSelectMode]
  );

  const handleMouseDownItem = useCallback(id => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setMultiSelectMode(true);
      setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
      isDragging.current = true;
    }, 400);
  }, []);

  const handleMouseUpItem = useCallback(
    id => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      if (!isDragging.current) {
        handleEntitySelection(id);
      }
      isDragging.current = false;
    },
    [handleEntitySelection]
  );

  const handleMouseEnterItem = useCallback(
    id => {
      setHoveredId(id);
      if (isDragging.current && multiSelectMode) {
        setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
      }
    },
    [multiSelectMode]
  );

  const handleMouseLeaveItem = useCallback(() => {
    setHoveredId(null);
  }, []);

  const removeEntity = useCallback(id => {
    setEntities(prev => prev.filter(entity => entity.id !== id));
    setSelectedIds(prev => {
      const next = prev.filter(selectedId => selectedId !== id);
      if (next.length <= 1) setMultiSelectMode(false);
      return next;
    });
  }, []);

  const addNewEntity = useCallback(() => {
    const id = `e_${crypto.randomUUID()}`;
    setEntities(prev => [
      ...prev,
      {
        id,
        name: `ENT_${String(prev.length + 1).padStart(2, '0')}`,
        visible: true,
        color: getRandomColor(),
        values: getRandomStats()
      }
    ]);
  }, [getRandomColor, getRandomStats]);

  const visibleEntities = useMemo(() => entities.filter(e => e.visible), [entities]);
  const anyFilterActive = stats.some(stat => stat.visible);
  const activeStats = anyFilterActive ? stats.filter(stat => stat.visible) : stats;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const chartData = useMemo(() => {
    return activeStats.map(stat => {
      const row = { subject: stat.name, statId: stat.id };
      visibleEntities.forEach(entity => {
        row[entity.id] = entity.values[stat.id] ?? 0;
      });
      return row;
    });
  }, [activeStats, visibleEntities]);

  const entityTotals = useMemo(() => {
    const totals = {};
    for (const entity of visibleEntities) {
      let total = 0;
      for (const stat of activeStats) {
        total += entity.values[stat.id] || 0;
      }
      totals[entity.id] = total;
    }
    return totals;
  }, [visibleEntities, activeStats]);

  const sortedEntities = useMemo(() => {
    return [...entities].sort(
      (a, b) => (entityTotals[b.id] || 0) - (entityTotals[a.id] || 0)
    );
  }, [entities, entityTotals]);

  const topPerformers = useMemo(() => {
    const result = new Map();
    for (const stat of activeStats) {
      result.set(
        stat.id,
        [...visibleEntities]
          .sort((a, b) => (b.values[stat.id] || 0) - (a.values[stat.id] || 0))
          .slice(0, 3)
          .map(entity => ({
            name: entity.name,
            val: entity.values[stat.id] || 0,
            color: entity.color
          }))
      );
    }
    return result;
  }, [visibleEntities, activeStats]);

  const selectedEntity =
    selectedIds.length === 1 ? entities.find(entity => entity.id === selectedIds[0]) : null;

  const itemsPerPage = 6;
  const totalPages = Math.ceil(visibleEntities.length / itemsPerPage);
  const paginatedEntities = useMemo(() => {
    const start = monitorPage * itemsPerPage;
    return visibleEntities.slice(start, start + itemsPerPage);
  }, [visibleEntities, monitorPage]);

  useEffect(() => {
    setMonitorPage(prev => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const leaderboardData = useMemo(() => {
    return sortedEntities
      .filter(e => e.visible)
      .map(entity => ({
        name: entity.name,
        total: entityTotals[entity.id] || 0,
        color: entity.color,
        id: entity.id
      }));
  }, [sortedEntities, entityTotals]);

  const dotsData = useMemo(() => {
    const data = [];
    activeStats.forEach((stat, statIndex) => {
      visibleEntities.forEach(entity => {
        const isSelected = selectedIdSet.has(entity.id);
        const isHovered = hoveredId === entity.id;
        data.push({
          xIndex: statIndex,
          x: stat.name,
          y: entity.values[stat.id] || 0,
          entityId: entity.id,
          statName: stat.name,
          statId: stat.id,
          color: entity.color,
          z: isSelected ? 400 : isHovered ? 280 : 80
        });
      });
    });
    return data;
  }, [activeStats, visibleEntities, selectedIdSet, hoveredId]);

  const pieData = useMemo(() => {
    if (!selectedEntity || !selectedEntity.visible) return [];
    return activeStats.map(stat => ({
      name: stat.name,
      value: (selectedEntity.values[stat.id] || 0) + 0.1
    }));
  }, [selectedEntity, activeStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const stateToSave = {
        leftCollapsed,
        rightCollapsed,
        bottomCollapsed,
        selectedIds,
        monitorPage,
        registryView,
        visMode,
        zoom,
        offset,
        leftWidth,
        rightWidth,
        rightSplit,
        multiSelectMode,
        activePieIndex,
        stats,
        entities
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, 500);
    return () => clearTimeout(timer);
  }, [
    leftCollapsed,
    rightCollapsed,
    bottomCollapsed,
    selectedIds,
    monitorPage,
    registryView,
    visMode,
    zoom,
    offset,
    leftWidth,
    rightWidth,
    rightSplit,
    multiSelectMode,
    activePieIndex,
    stats,
    entities
  ]);

  const allPanelsCollapsed = leftCollapsed && rightCollapsed && bottomCollapsed;
  const toggleAllPanels = useCallback(() => {
    const targetState = !allPanelsCollapsed;
    setLeftCollapsed(targetState);
    setRightCollapsed(targetState);
    setBottomCollapsed(targetState);
  }, [allPanelsCollapsed]);

  const CustomTooltip = useCallback(
    ({ active, payload, label }) => {
      if (!active || !payload || !payload.length) return null;
      const dataPoint = payload[0].payload;
      const statId = dataPoint.statId;
      const top3 = topPerformers.get(statId) || [];
      return (
        <div className="bg-black/90 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-2xl min-w-[140px] animate-scale-in">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 border-b border-white/5 pb-1">
            {dataPoint.statName || label || 'METRIC'}
          </p>
          <div className="space-y-1.5">
            <p className="text-[7px] font-black uppercase text-zinc-600 tracking-tighter mb-1">
              Top Performers
            </p>
            {top3.map((performer, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: performer.color }}
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

  const renderCustomizedPieLabel = useCallback(
    ({ cx, cy, midAngle, outerRadius, index, name }) => {
      const RADIAN = Math.PI / 180;
      const sin = Math.sin(-RADIAN * midAngle);
      const cos = Math.cos(-RADIAN * midAngle);
      const isSliceActive = activePieIndex === index;
      const radiusBoost = isSliceActive ? 15 : 0;
      const sx = cx + (outerRadius + 5 + radiusBoost) * cos;
      const sy = cy + (outerRadius + 5 + radiusBoost) * sin;
      const mx = cx + (outerRadius + 20 + radiusBoost) * cos;
      const my = cy + (outerRadius + 20 + radiusBoost) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 15;
      const ey = my;
      const textAnchor = cos >= 0 ? 'start' : 'end';
      return (
        <g>
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="rgba(255,255,255,0.15)" fill="none" />
          <circle cx={ex} cy={ey} r={2} fill={selectedEntity?.color} stroke="none" />
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 8}
            y={ey}
            textAnchor={textAnchor}
            fill={isSliceActive ? '#fff' : '#555'}
            fontSize={8}
            fontWeight="900"
            dominantBaseline="central"
          >
            {name}
          </text>
        </g>
      );
    },
    [activePieIndex, selectedEntity]
  );

  const renderActiveShape = useCallback(props => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 15}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          fillOpacity={0.1}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
        />
      </g>
    );
  }, []);

  return (
    <div
      className="h-screen w-full bg-[#080808] text-zinc-500 font-mono flex flex-col overflow-hidden select-none"
      onContextMenu={e => e.preventDefault()}
    >
      <header className="h-12 border-b border-white/5 flex items-center px-6 bg-[#080808] shrink-0 justify-between z-30 animate-fade-in-down">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-white">
            STATVAULT_PRO
          </span>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all duration-200 ease-out hover-bg-white active-bg-white"
            >
              <Download size={12} className="text-zinc-600" />
              Export JSON
            </button>
            <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all duration-200 ease-out cursor-pointer hover-bg-white active-bg-white">
              <Upload size={12} className="text-zinc-600" />
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleCsvExport}
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all duration-200 ease-out hover-bg-white active-bg-white"
            >
              <Download size={12} className="text-zinc-600" />
              Export CSV
            </button>
            <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all duration-200 ease-out cursor-pointer hover-bg-white active-bg-white">
              <Upload size={12} className="text-zinc-600" />
              Import CSV
              <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-tighter hidden md:block">
            Z: {zoom.toFixed(1)}x | Δ: {offset.x}, {offset.y}
          </div>
          <div className="h-3 w-px bg-white/10" />
          <button
            onClick={toggleAllPanels}
            className="text-zinc-600 hover:text-white transition-all duration-200 ease-out hover-bg-white active-bg-white flex items-center gap-2"
          >
            {allPanelsCollapsed ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={handlePngExport}
            className="text-zinc-600 hover:text-white transition-all duration-200 ease-out hover-bg-white active-bg-white flex items-center gap-2"
            title="Export as PNG"
          >
            <ImageIcon size={14} />
          </button>
        </div>
      </header>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] bg-emerald-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-down">
          {toast}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <div
          id="left-panel"
          style={{ width: leftCollapsed ? 0 : leftWidth }}
          className="shrink-0 transition-all duration-500 ease-out relative z-20 overflow-hidden h-full"
        >
          {!leftCollapsed && (
            <FiltersPanel
              stats={stats}
              anyFilterActive={anyFilterActive}
              clearFilters={clearFilters}
              addNewStat={addNewStat}
              toggleStatVisibility={toggleStatVisibility}
              openIconPicker={openIconPicker}
              renderStatIcon={renderStatIcon}
              updateStatName={updateStatName}
              setEditingStat={setEditingStat}
              deleteStat={deleteStat}
              activeIconPicker={activeIconPicker}
              setActiveIconPicker={setActiveIconPicker}
              iconSearch={iconSearch}
              setIconSearch={setIconSearch}
              filteredIcons={filteredIcons}
              updateStatIcon={updateStatIcon}
              projects={projects}
              onSaveProject={saveProject}
              onLoadProject={loadProject}
              onDeleteProject={deleteProject}
              selectedProjectId={selectedProjectId}
            />
          )}
        </div>
        {!leftCollapsed && (
          <div
            className="w-1 hover:bg-white/10 cursor-col-resize shrink-0 z-20"
            onMouseDown={() => {
              isResizingLeft.current = true;
              document.body.style.cursor = 'col-resize';
            }}
          />
        )}
        <button
          onClick={() => setLeftCollapsed(prev => !prev)}
          className="absolute z-40 bg-[#0a0a0a] border border-white/10 p-1 rounded-r-md text-zinc-600 hover:text-white transition-all duration-200 ease-out hover-bg-white active-bg-white top-1/2 -translate-y-1/2"
          style={{ left: leftCollapsed ? '0px' : `${leftWidth}px` }}
        >
          {leftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <VisualizationArea
          visMode={visMode}
          chartData={chartData}
          entities={visibleEntities}
          selectedIdSet={selectedIdSet}
          hoveredId={hoveredId}
          selectedEntity={selectedEntity}
          activeStats={activeStats}
          entityTotals={entityTotals}
          topPerformers={topPerformers}
          leaderboardData={leaderboardData}
          dotsData={dotsData}
          pieData={pieData}
          zoom={zoom}
          offset={offset}
          handleWheel={handleWheel}
          handleChartMouseDown={handleChartMouseDown}
          resetView={resetView}
          setVisMode={setVisMode}
          handleEntitySelection={handleEntitySelection}
          CustomTooltip={CustomTooltip}
          renderStatIcon={renderStatIcon}
          renderCustomizedPieLabel={renderCustomizedPieLabel}
          renderActiveShape={renderActiveShape}
          bottomCollapsed={bottomCollapsed}
          setBottomCollapsed={setBottomCollapsed}
          monitorPage={monitorPage}
          setMonitorPage={setMonitorPage}
          paginatedEntities={paginatedEntities}
          handleMouseDownItem={handleMouseDownItem}
          handleMouseUpItem={handleMouseUpItem}
          handleMouseEnterItem={handleMouseEnterItem}
          handleMouseLeaveItem={handleMouseLeaveItem}
          totalPages={totalPages}
          activePieIndex={activePieIndex}
          setActivePieIndex={setActivePieIndex}
        />

        <div
          style={{ width: rightCollapsed ? 0 : rightWidth }}
          className="shrink-0 transition-all duration-500 ease-out relative z-20 overflow-hidden h-full"
        >
          {!rightCollapsed && (
            <RightPanel
              rightSplit={rightSplit}
              setRightSplit={setRightSplit}
              isResizingSplit={isResizingSplit}
              rightAsideRef={rightAsideRef}
              registryView={registryView}
              setRegistryView={setRegistryView}
              sortedEntities={sortedEntities}
              selectedIdSet={selectedIdSet}
              entityTotals={entityTotals}
              handleEntitySelection={handleEntitySelection}
              setHoveredId={setHoveredId}
              addNewEntity={addNewEntity}
              selectedEntity={selectedEntity}
              setEntities={setEntities}
              removeEntity={removeEntity}
              toggleEntityVisibility={toggleEntityVisibility}
              stats={stats}
              openIconPicker={openIconPicker}
              renderStatIcon={renderStatIcon}
              updateStatValue={updateStatValue}
            />
          )}
        </div>
        {!rightCollapsed && (
          <div
            className="w-1 hover:bg-white/10 cursor-col-resize shrink-0 z-20"
            onMouseDown={() => {
              isResizingRight.current = true;
              document.body.style.cursor = 'col-resize';
            }}
          />
        )}
        <button
          onClick={() => setRightCollapsed(prev => !prev)}
          className="absolute z-40 bg-[#0a0a0a] border border-white/10 p-1 rounded-l-md text-zinc-600 hover:text-white transition-all duration-200 ease-out hover-bg-white active-bg-white top-1/2 -translate-y-1/2"
          style={{ right: rightCollapsed ? '0px' : `${rightWidth}px` }}
        >
          {rightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {showPngExport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={handlePngCancel}>
          <div 
            className="bg-[#0d0d0d] border border-white/10 rounded-lg shadow-2xl p-6 w-[90vw] h-[80vh] flex flex-col animate-scale-in" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                PNG Export
              </span>
              <button
                onClick={handlePngCancel}
                className="p-1.5 rounded hover:bg-white/5 text-zinc-600 hover:text-white transition-all duration-200 ease-out hover-bg-white"
              >
                <X size={16} />
              </button>
            </div>
            
            <div 
              ref={exportAreaRef} 
              className="flex-1 flex gap-4 min-h-0"
              style={{ minHeight: '400px' }}
            >
              {showFiltersExport && (
                <div className="w-64 bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">
                    Filters
                  </span>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-emerald-500 mb-1 block">Active Filters</span>
                      {stats.filter(s => s.visible).map(stat => (
                        <div key={stat.id} className="flex items-center gap-2 p-2 rounded border border-emerald-500/20 bg-emerald-500/10">
                          <div className="text-emerald-400">{renderStatIcon(stat, 10)}</div>
                          <span className="text-[9px] font-bold uppercase text-emerald-400">{stat.name}</span>
                        </div>
                      ))}
                      {stats.filter(s => s.visible).length === 0 && (
                        <p className="text-[8px] text-zinc-600">No active filters</p>
                      )}
                    </div>
                    <div className="space-y-1 pt-3 border-t border-white/5">
                      <span className="text-[8px] font-black uppercase text-zinc-600 mb-1 block">Inactive Filters</span>
                      {stats.filter(s => !s.visible).map(stat => (
                        <div key={stat.id} className="flex items-center gap-2 p-2 rounded border border-white/5">
                          <div className="text-zinc-600">{renderStatIcon(stat, 10)}</div>
                          <span className="text-[9px] font-bold uppercase text-zinc-600">{stat.name}</span>
                        </div>
                      ))}
                      {stats.filter(s => !s.visible).length === 0 && (
                        <p className="text-[8px] text-zinc-600">No inactive filters</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div 
                className="flex-1 bg-[#080808] border border-white/5 rounded-lg overflow-hidden relative"
                style={{ minHeight: '400px', minWidth: '0' }}
              >
                {visMode === 'heatmap' ? (
                  <div className="w-full h-full flex items-center justify-center p-6 overflow-auto custom-scrollbar">
                    <div className="w-full max-w-5xl">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-[10px] font-black uppercase text-zinc-600 border-b border-white/10 text-left sticky left-0 bg-[#080808] z-10 min-w-[140px]">
                              STAT
                            </th>
                            {entities.map(entity => (
                              <th key={entity.id} className="px-3 py-2 text-[10px] font-black uppercase text-zinc-600 border-b border-white/10 text-center min-w-[120px]">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entity.color }} />
                                  <span className="truncate max-w-[120px]">{entity.name}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeStats.map((stat, rowIndex) => (
                            <tr key={stat.id} className={rowIndex % 2 === 0 ? 'bg-white/[0.03]' : 'bg-transparent'}>
                              <td className="px-3 py-2 border-b border-white/10 sticky left-0 bg-[#080808] z-10">
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-600">{renderStatIcon(stat, 12)}</span>
                                  <span className="text-[12px] font-bold uppercase text-zinc-500 truncate">
                                    {stat.name}
                                  </span>
                                </div>
                              </td>
                              {entities.map(entity => {
                                const value = entity.values[stat.id] || 0;
                                const maxValue = Math.max(...activeStats.map(s => entity.values[s.id] || 0));
                                const concentration = maxValue > 0 ? value / maxValue : 0;
                                const bgColor = hexToRgba(entity.color, concentration * 0.8);
                                return (
                                  <td 
                                    key={entity.id} 
                                    className="px-3 py-2 border-b border-white/10 text-center"
                                    style={{ backgroundColor: bgColor }}
                                  >
                                    <span className="text-[12px] font-black text-white/90 tabular-nums">
                                      {value}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-black/40">
                            <td className="px-3 py-2 border-t border-white/10 sticky left-0 bg-[#0a0a0a] z-10 text-[10px] font-black uppercase text-zinc-600">
                              TOTAL
                            </td>
                            {entities.map(entity => (
                              <td key={entity.id} className="px-3 py-2 border-t border-white/10 text-center">
                                <span className="text-[12px] font-black text-zinc-500 tabular-nums">
                                  {entityTotals[entity.id] || 0}
                                </span>
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
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: '#888', fontSize: 12, fontWeight: 900 }}
                        />
                        <PolarRadiusAxis angle={90} domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 12, fontWeight: 700 }} axisLine={false} />
                        {entities.map(entity => (
                          <Radar
                            key={entity.id}
                            dataKey={entity.id}
                            stroke={entity.color}
                            fill={entity.color}
                            isAnimationActive={false}
                            fillOpacity={selectedIdSet.has(entity.id) ? 0.4 : 0.15}
                            strokeWidth={selectedIdSet.has(entity.id) ? 3 : 2}
                          />
                        ))}
                      </RadarChart>
                    ) : visMode === 'parallel' ? (
                      <AreaChart data={chartData} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical horizontal={false} />
                        <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontWeight: 700 }} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        {entities.map(entity => (
                          <Area
                            key={entity.id}
                            type="linear"
                            dataKey={entity.id}
                            stroke={entity.color}
                            fill={entity.color}
                            isAnimationActive={false}
                            fillOpacity={selectedIdSet.has(entity.id) ? 0.25 : 0.08}
                            strokeWidth={selectedIdSet.has(entity.id) ? 3 : 2}
                          />
                        ))}
                      </AreaChart>
                    ) : visMode === 'dots' ? (
                      <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis type="number" dataKey="xIndex" domain={[-0.5, activeStats.length - 0.5]} ticks={activeStats.map((_, i) => i)} tickFormatter={(value) => activeStats[Number(value)]?.name || ''} axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontWeight: 700 }} xAxisId="xAxis" />
                        <YAxis type="number" dataKey="y" domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} yAxisId="yAxis" />
                        <ZAxis type="number" dataKey="z" range={[50, 500]} />
                        <Scatter data={dotsData} isAnimationActive={false} xAxisId="xAxis" yAxisId="yAxis">
                          {dotsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={selectedIdSet.has(entry.entityId) ? 0.9 : 0.3} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    ) : visMode === 'leaderboard' ? (
                      <BarChart layout="vertical" data={leaderboardData} margin={{ left: 60, right: 60, top: 40, bottom: 40 }}>
                        <XAxis type="number" domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontWeight: 700 }} width={120} />
                        <Bar dataKey="total" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                          {leaderboardData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={selectedIdSet.has(entry.id) || selectedIdSet.size === 0 ? 0.7 : 0.2} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : visMode === 'pie' && selectedEntity ? (
                      <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                        <Pie 
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
                          label={({ cx, cy, midAngle, outerRadius, index, name }) => {
                            const RADIAN = Math.PI / 180;
                            const sin = Math.sin(-RADIAN * midAngle);
                            const cos = Math.cos(-RADIAN * midAngle);
                            const sx = cx + (outerRadius + 10) * cos;
                            const sy = cy + (outerRadius + 10) * sin;
                            const mx = cx + (outerRadius + 30) * cos;
                            const my = cy + (outerRadius + 30) * sin;
                            const ex = mx + (cos >= 0 ? 1 : -1) * 20;
                            const ey = my;
                            const textAnchor = cos >= 0 ? 'start' : 'end';
                            return (
                              <g>
                                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="rgba(255,255,255,0.3)" fill="none" />
                                <circle cx={ex} cy={ey} r={2} fill={selectedEntity.color} stroke="none" />
                                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" fontSize={10} fontWeight="900" dominantBaseline="central">
                                  {name}
                                </text>
                              </g>
                            );
                          }}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={selectedEntity.color} fillOpacity={0.2 + (entry.value / 100) * 0.8} />
                          ))}
                          <Label
                            position="center"
                            content={({ viewBox }) => {
                              if (!viewBox) return null;
                              const { x, y, width, height } = viewBox;
                              const cx = x + width / 2;
                              const cy = y + height / 2;
                              return (
                                <g>
                                  <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={14} fontWeight="900">
                                    {selectedEntity.name}
                                  </text>
                                  <circle cx={cx} cy={cy + 16} r="3" fill={selectedEntity.color} />
                                </g>
                              );
                            }}
                          />
                        </Pie>
                      </PieChart>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[10px] font-black uppercase text-zinc-700">Select an entity for pie view</p>
                      </div>
                    )}
                  </ResponsiveContainer>
                )}
              </div>

              {showEntitiesExport && (
                <div className="w-64 bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">
                    Entities
                  </span>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {visibleEntities.map(entity => (
                      <div
                        key={entity.id}
                        className="flex items-center justify-between p-2 rounded border border-white/5 hover-bg-white active-bg-white transition-all duration-200 ease-out"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entity.color }} />
                          <span className="text-[9px] font-bold uppercase text-zinc-600 truncate max-w-[120px]">
                            {entity.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-black text-emerald-400">
                          {entityTotals[entity.id] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-4 items-center">
              <div className="flex flex-col gap-3 min-w-[200px]">
                <label className="flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-600 cursor-pointer">
                  <span>Include Filters</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={showFiltersExport}
                      onChange={e => setShowFiltersExport(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/5 rounded-full peer-checked:bg-emerald-500/50 border border-white/10 transition-all duration-200 ease-out"></div>
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white/20 rounded-full peer-checked:translate-x-5 peer-checked:bg-emerald-400 transition-all duration-200 ease-out"></div>
                  </div>
                </label>
                <label className="flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-600 cursor-pointer">
                  <span>Include Entities</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={showEntitiesExport}
                      onChange={e => setShowEntitiesExport(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/5 rounded-full peer-checked:bg-emerald-500/50 border border-white/10 transition-all duration-200 ease-out"></div>
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white/20 rounded-full peer-checked:translate-x-5 peer-checked:bg-emerald-400 transition-all duration-200 ease-out"></div>
                  </div>
                </label>
              </div>
              <div className="flex gap-2 flex-1">
                <button
                  onClick={handlePngCopy}
                  disabled={isCopying}
                  className="flex-1 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all duration-200 ease-out hover-bg-emerald active-bg-emerald disabled:opacity-50"
                >
                  <Copy size={12} className="inline-block mr-1" />
                  {isCopying ? 'Copying...' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={handlePngCancel}
                  className="flex-1 p-2.5 rounded bg-white/5 border border-white/10 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover-bg-white active-bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES + `
        * { outline: none !important; -webkit-tap-highlight-color: transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}} />
    </div>
  );
};

export default App;
