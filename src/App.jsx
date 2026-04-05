import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis,
  PieChart, Pie, Cell, Label, Sector, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Trash2, Plus, Settings2, ChevronUp, ChevronDown, Search,
  LayoutGrid, StretchHorizontal, List as ListIcon, Edit3, FilterX,
  RotateCcw, Download, Upload, Target, Trophy, CircleDot, PieChart as PieChartIcon,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Activity,
  Zap, Shield, Heart, Sword, Star, Brain, Eye, User,
  Flame, Droplets, Wind, Mountain, Sun, Moon, Ghost, Skull, 
  Component, Fingerprint, Crosshair, Atom, Anchor, Binary,
  Box, Cpu, Database, Diamond, Dna, Factory,
  FlaskConical, Gauge, Hammer, Key, Layers, Microscope,
  Orbit, Package, Pill, Power, Rocket, Scale, Telescope,
  Terminal, Umbrella, Beaker, Waves, Workflow, Lightbulb,
  Cloud, ZapOff, WindArrowDown, Thermometer, Radio, 
  Magnet, Infinity, Hexagon, Gem, Earth, Construction, 
  Coffee, Bug, Briefcase, Bot, Bomb, Bell, Battery, 
  Backpack, Award, Apple, Anchor as AnchorIcon,
  Tent, Trees, TreePine, Squirrel, Sprout, Shell,
  Sailboat, Plane, Map, Landmark, Guitar, Gamepad2, 
  Fuel, Fish, FastForward, Fan, EyeOff, Eraser, 
  Dices, Cylinder, Compass, Coins, Clover, Clipboard,
  Clapperboard, Castle, Camera, Cake, Bus,
  Building, Book, Bone, Bluetooth, Bird, Bike, 
  Beer, Bed, Bath, Baby, Axe,
  Monitor, Smartphone, Watch, Headphones, Mic, 
  Music, Video, Image, MapPin, Navigation,
  CloudLightning, CloudRain, ThermometerSnowflake,
  Wind as WindIcon, Sunrise, Sunset,
  Zap as ZapIcon, Timer, History, Languages,
  Library, GraduationCap, GraduationCap as School,
  Briefcase as Work, ShoppingCart, CreditCard,
  Wallet, Gift, HeartPulse, Stethoscope, Syringe,
  Activity as Pulse, Trees as Forest, Leaf,
  Bug as Insect, Fish as Marine, Bird as Avian,
  Dog, Cat, Rabbit, Turtle,
  Hash, Percent, AlertCircle, AlertTriangle, HelpCircle, Info
} from 'lucide-react';

const App = () => {
  // Panel States
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);

  // Entities state
  const [selectedIds, setSelectedIds] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [monitorPage, setMonitorPage] = useState(0);
  const [registryView, setRegistryView] = useState('grid'); 
  const [visMode, setVisMode] = useState('radar'); 
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  
  // Icon Picker State
  const [activeIconPicker, setActiveIconPicker] = useState(null); // { id: string, x: number, y: number }
  const [iconSearch, setIconSearch] = useState("");

  // Interaction State (Zoom/Pan)
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Pie chart interaction state
  const [activePieIndex, setActivePieIndex] = useState(null);

  // Layout State
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(320);
  const [rightSplit, setRightSplit] = useState(50); 

  // Resizing Refs
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);
  const isResizingSplit = useRef(false);
  const longPressTimer = useRef(null);
  const isDragging = useRef(false);

  // EXPANDED SYMBOLIC ICON SET CATEGORIZED
  const CATEGORIZED_ICONS = [
    {
      category: "Utility & Syntax",
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
      category: "Nature & Elements",
      icons: [
        { name: 'Flame', icon: Flame }, { name: 'Droplets', icon: Droplets }, { name: 'Wind', icon: Wind },
        { name: 'Mountain', icon: Mountain }, { name: 'Sun', icon: Sun }, { name: 'Moon', icon: Moon },
        { name: 'Cloud', icon: Cloud }, { name: 'Earth', icon: Earth }, { name: 'Waves', icon: Waves },
        { name: 'Forest', icon: Forest }, { name: 'Sprout', icon: Sprout }, { name: 'Shell', icon: Shell },
        { name: 'Clover', icon: Clover }, { name: 'Leaf', icon: Leaf }, { name: 'Sunrise', icon: Sunrise }
      ]
    },
    {
      category: "Science & Tech",
      icons: [
        { name: 'Atom', icon: Atom }, { name: 'Binary', icon: Binary }, { name: 'Cpu', icon: Cpu },
        { name: 'Database', icon: Database }, { name: 'Dna', icon: Dna }, { name: 'Flask', icon: FlaskConical },
        { name: 'Microscope', icon: Microscope }, { name: 'Telescope', icon: Telescope }, { name: 'Orbit', icon: Orbit },
        { name: 'Bot', icon: Bot }, { name: 'Circuit', icon: Component }, { name: 'Rocket', icon: Rocket },
        { name: 'Radio', icon: Radio }, { name: 'Magnet', icon: Magnet }, { name: 'Terminal', icon: Terminal }
      ]
    },
    {
      category: "Devices & Media",
      icons: [
        { name: 'Monitor', icon: Monitor }, { name: 'Smartphone', icon: Smartphone }, { name: 'Watch', icon: Watch },
        { name: 'Headphones', icon: Headphones }, { name: 'Mic', icon: Mic }, { name: 'Music', icon: Music },
        { name: 'Video', icon: Video }, { name: 'Image', icon: Image }, { name: 'Camera', icon: Camera },
        { name: 'Gamepad', icon: Gamepad2 }
      ]
    },
    {
      category: "Combat & Defense",
      icons: [
        { name: 'Sword', icon: Sword }, { name: 'Shield', icon: Shield }, { name: 'Target', icon: Target },
        { name: 'Crosshair', icon: Crosshair }, { name: 'Axe', icon: Axe }, { name: 'Bomb', icon: Bomb },
        { name: 'Skull', icon: Skull }, { name: 'Hammer', icon: Hammer }, { name: 'Anchor', icon: AnchorIcon }
      ]
    },
    {
      category: "Vitals & Health",
      icons: [
        { name: 'Heart', icon: Heart }, { name: 'Brain', icon: Brain }, { name: 'Eye', icon: Eye },
        { name: 'User', icon: User }, { name: 'Fingerprint', icon: Fingerprint }, { name: 'Pill', icon: Pill },
        { name: 'Pulse', icon: Pulse }, { name: 'Stethoscope', icon: Stethoscope }, { name: 'Syringe', icon: Syringe }
      ]
    },
    {
      category: "Life & Leisure",
      icons: [
        { name: 'Coffee', icon: Coffee }, { name: 'Cake', icon: Cake }, { name: 'Gift', icon: Gift },
        { name: 'Wallet', icon: Wallet }, { name: 'Shopping', icon: ShoppingCart }, { name: 'Graduation', icon: GraduationCap },
        { name: 'Library', icon: Library }, { name: 'Guitar', icon: Guitar }, { name: 'Dices', icon: Dices }
      ]
    },
    {
      category: "Creatures",
      icons: [
        { name: 'Bird', icon: Bird }, { name: 'Fish', icon: Fish }, { name: 'Dog', icon: Dog },
        { name: 'Cat', icon: Cat }, { name: 'Rabbit', icon: Rabbit }, { name: 'Turtle', icon: Turtle },
        { name: 'Ghost', icon: Ghost }, { name: 'Squirrel', icon: Squirrel }, { name: 'Bug', icon: Bug }
      ]
    }
  ];

  const FLAT_ICONS = useMemo(() => CATEGORIZED_ICONS.flatMap(c => c.icons), []);

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return CATEGORIZED_ICONS;
    const search = iconSearch.toLowerCase();
    return CATEGORIZED_ICONS.map(cat => ({
      ...cat,
      icons: cat.icons.filter(i => i.name.toLowerCase().includes(search))
    })).filter(cat => cat.icons.length > 0);
  }, [iconSearch]);

  // STATS STATE - Reverted to Generic Names and Default Hashtag Icon
  const [stats, setStats] = useState([
    { id: 's1', name: 'STAT_01', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
    { id: 's2', name: 'STAT_02', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
    { id: 's3', name: 'STAT_03', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
    { id: 's4', name: 'STAT_04', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
    { id: 's5', name: 'STAT_05', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' },
    { id: 's6', name: 'STAT_06', visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' }
  ]);

  // ENTITIES STATE
  const [entities, setEntities] = useState([
    { id: 'e1', name: 'ENTITY_01', visible: true, color: '#10b981', values: { s1: 80, s2: 45, s3: 90, s4: 65, s5: 75, s6: 55 } },
    { id: 'e2', name: 'ENTITY_02', visible: true, color: '#3b82f6', values: { s1: 45, s2: 85, s3: 40, s4: 95, s5: 55, s6: 70 } },
    { id: 'e3', name: 'ENTITY_03', visible: true, color: '#f59e0b', values: { s1: 60, s2: 70, s3: 50, s4: 40, s5: 90, s6: 30 } },
    { id: 'e4', name: 'ENTITY_04', visible: true, color: '#ec4899', values: { s1: 30, s2: 30, s3: 80, s4: 80, s5: 40, s6: 90 } }
  ]);

  // HELPERS
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  };

  const getRandomStats = () => {
    return stats.reduce((acc, s) => ({ ...acc, [s.id]: Math.floor(Math.random() * 101) }), {});
  };

  const addNewStat = () => {
    const newId = `s${Date.now()}`;
    const newName = `STAT_${String(stats.length + 1).padStart(2, '0')}`;
    setStats([...stats, { id: newId, name: newName, visible: false, editing: false, iconType: 'icon', iconName: 'Hashtag' }]);
    setEntities(prev => prev.map(entity => ({
      ...entity,
      values: { ...entity.values, [newId]: 50 }
    })));
  };

  const updateStatIcon = (statId, type, value) => {
    setStats(stats.map(s => s.id === statId ? { ...s, iconType: type, iconName: value } : s));
    setActiveIconPicker(null);
    setIconSearch("");
  };

  const renderStatIcon = (stat, size = 12) => {
    const IconComponent = FLAT_ICONS.find(i => i.name === stat.iconName)?.icon || Hash;
    return <IconComponent size={size} />;
  };

  const toggleStatVisibility = (id) => {
    setStats(stats.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const updateStatName = (id, newName) => {
    setStats(stats.map(s => s.id === id ? { ...s, name: newName.toUpperCase(), editing: false } : s));
  };

  const updateStatValue = (entityId, statId, val) => {
    const num = parseInt(val) || 0;
    const clamped = Math.min(Math.max(num, 0), 100);
    setEntities(entities.map(e => e.id === entityId ? { ...e, values: { ...e.values, [statId]: clamped } } : e));
  };

  const openIconPicker = (e, statId) => {
    e.stopPropagation();
    setActiveIconPicker({ id: statId, x: e.clientX, y: e.clientY });
  };

  // EXPORT / IMPORT
  const handleExport = () => {
    const dataStr = JSON.stringify({ stats, entities }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `statvault_export_${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.stats && json.entities) {
          setStats(json.stats);
          setEntities(json.entities);
          setSelectedIds([]);
        }
      } catch (err) { console.error("Invalid JSON file"); }
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  // GLOBAL MOUSE EVENTS
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (isResizingLeft.current && !leftCollapsed) setLeftWidth(Math.max(180, Math.min(400, e.clientX)));
      if (isResizingRight.current && !rightCollapsed) setRightWidth(Math.max(240, Math.min(500, window.innerWidth - e.clientX)));
      if (isResizingSplit.current) {
        const aside = document.getElementById('right-aside');
        if (aside) {
          const rect = aside.getBoundingClientRect();
          const offsetVal = e.clientY - rect.top;
          setRightSplit(Math.max(20, Math.min(80, (offsetVal / rect.height) * 100)));
        }
      }
      if (isPanning.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        setOffset(prev => ({
          x: Math.min(Math.max(prev.x + dx, -400), 400),
          y: Math.min(Math.max(prev.y + dy, -400), 400)
        }));
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
    };
  }, [leftCollapsed, rightCollapsed]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3.0));
  };

  const handleChartMouseDown = (e) => {
    if (e.button === 2) { 
      e.preventDefault();
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setActivePieIndex(null);
  };

  const clearFilters = () => setStats(stats.map(s => ({ ...s, visible: false })));

  const handleEntitySelection = (id) => {
    if (multiSelectMode) {
      setSelectedIds(prev => {
        const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
        if (next.length === 0) setMultiSelectMode(false);
        return next;
      });
    } else {
      setSelectedIds(prev => (prev.length === 1 && prev[0] === id) ? [] : [id]);
    }
    setActivePieIndex(null);
  };

  const handleMouseDownItem = (id) => {
    longPressTimer.current = setTimeout(() => {
      setMultiSelectMode(true);
      setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
      isDragging.current = true;
    }, 400); 
  };

  const handleMouseUpItem = (id) => {
    clearTimeout(longPressTimer.current);
    if (!isDragging.current) handleEntitySelection(id);
    isDragging.current = false;
  };

  const handleMouseEnterItem = (id) => {
    setHoveredId(id);
    if (isDragging.current && multiSelectMode) {
      setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }
  };

  const removeEntity = (id) => {
    setEntities(entities.filter(e => e.id !== id));
    setSelectedIds(selectedIds.filter(sid => sid !== id));
    if (selectedIds.length <= 1) setMultiSelectMode(false);
  };

  const anyFilterActive = stats.some(s => s.visible);
  const activeStats = anyFilterActive ? stats.filter(s => s.visible) : stats;
  
  const chartData = useMemo(() => {
    return activeStats.map(s => {
      const row = { subject: s.name, statId: s.id };
      entities.forEach(e => { if (e.visible) row[e.id] = e.values[s.id] ?? 0; });
      return row;
    });
  }, [activeStats, entities]);

  const sortedEntities = useMemo(() => {
    return [...entities].sort((a, b) => {
      const totalA = activeStats.reduce((sum, s) => sum + (a.values[s.id] || 0), 0);
      const totalB = activeStats.reduce((sum, s) => sum + (b.values[s.id] || 0), 0);
      return totalB - totalA;
    });
  }, [entities, activeStats]);

  const selectedEntity = selectedIds.length === 1 ? entities.find(e => e.id === selectedIds[0]) : null;

  const itemsPerPage = 6;
  const totalPages = Math.ceil(entities.length / itemsPerPage);
  const paginatedEntities = useMemo(() => {
    const start = monitorPage * itemsPerPage;
    return entities.slice(start, start + itemsPerPage);
  }, [entities, monitorPage]);

  const leaderboardData = useMemo(() => {
    return sortedEntities.map(e => ({
      name: e.name,
      total: activeStats.reduce((sum, s) => sum + (e.values[s.id] || 0), 0),
      color: e.color,
      id: e.id
    }));
  }, [sortedEntities, activeStats]);

  const dotsData = useMemo(() => {
    const data = [];
    activeStats.forEach((s) => {
      entities.forEach(e => {
        const isSelected = selectedIds.includes(e.id);
        const isHovered = hoveredId === e.id;
        data.push({
          x: s.name, // Use the name as a categorical X value
          y: e.values[s.id] || 0,
          entityId: e.id,
          statName: s.name,
          statId: s.id,
          color: e.color,
          z: isSelected ? 400 : isHovered ? 280 : 80
        });
      });
    });
    return data;
  }, [activeStats, entities, selectedIds, hoveredId]);

  const pieData = useMemo(() => {
    if (!selectedEntity) return [];
    return activeStats.map(s => ({
      name: s.name,
      value: (selectedEntity.values[s.id] || 0) + 0.1 
    }));
  }, [selectedEntity, activeStats]);

  const allPanelsCollapsed = leftCollapsed && rightCollapsed && bottomCollapsed;

  const toggleAllPanels = () => {
    const targetState = !allPanelsCollapsed;
    setLeftCollapsed(targetState);
    setRightCollapsed(targetState);
    setBottomCollapsed(targetState);
  };

  const getTopPerformers = (statId) => {
    return [...entities]
      .sort((a, b) => (b.values[statId] || 0) - (a.values[statId] || 0))
      .slice(0, 3)
      .map(e => ({ name: e.name, val: e.values[statId] || 0, color: e.color }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const statId = dataPoint.statId;
      const top3 = getTopPerformers(statId);
      
      return (
        <div className="bg-black/90 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-2xl min-w-[140px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 border-b border-white/5 pb-1">{label || dataPoint.statName || "METRIC"}</p>
          <div className="space-y-1.5">
            <p className="text-[7px] font-black uppercase text-zinc-600 tracking-tighter mb-1">Top Performers</p>
            {top3.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[9px] font-bold text-white uppercase">{p.name}</span>
                </div>
                <span className="text-[9px] font-black text-zinc-400 tabular-nums">{p.val}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index, name }) => {
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
        <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill={isSliceActive ? "#fff" : "#555"} fontSize={8} fontWeight="900" dominantBaseline="central" className="uppercase tracking-tighter">
          {name}
        </text>
      </g>
    );
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 15} startAngle={startAngle} endAngle={endAngle} fill={fill} fillOpacity={0.1} />
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      </g>
    );
  };

  return (
    <div className="h-screen w-full bg-[#080808] text-zinc-500 font-mono flex flex-col overflow-hidden select-none outline-none" onContextMenu={(e) => e.preventDefault()}>
      
      {/* HEADER */}
      <header className="h-12 border-b border-white/5 flex items-center px-6 bg-[#080808] shrink-0 justify-between z-30">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-white">STATVAULT_PRO</span>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex gap-4">
            <button onClick={handleExport} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors outline-none">
              <Download size={12} className="text-zinc-600" /> Export
            </button>
            <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors cursor-pointer outline-none">
              <Upload size={12} className="text-zinc-600" /> Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-tighter hidden md:block">
            Z: {zoom.toFixed(1)}x | Δ: {offset.x}, {offset.y}
          </div>
          <div className="h-3 w-px bg-white/10" />
          <button onClick={toggleAllPanels} className="text-zinc-600 hover:text-white transition-colors flex items-center gap-2 outline-none">
            {allPanelsCollapsed ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT ASIDE */}
        <aside style={{ width: leftCollapsed ? 0 : leftWidth }} className="border-r border-white/5 flex flex-col bg-[#0a0a0a] shrink-0 transition-all duration-200 ease-in-out relative z-20 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0 h-14 whitespace-nowrap">
            <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">FILTERS</span>
            <div className="flex items-center gap-1">
              {anyFilterActive && (
                <button onClick={clearFilters} className="p-1.5 rounded hover:text-rose-500 transition-colors outline-none"><FilterX size={14} /></button>
              )}
              <button onClick={addNewStat} className="p-1.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all outline-none"><Plus size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {stats.map(s => (
              <div key={s.id} onClick={() => toggleStatVisibility(s.id)} className={`group relative flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-none ${s.visible ? 'bg-emerald-500/10 border-emerald-500/20 text-white' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'} ${anyFilterActive && !s.visible ? 'opacity-30' : 'opacity-100'} whitespace-nowrap outline-none`}>
                
                <div 
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border transition-all ${s.visible ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  onClick={(e) => openIconPicker(e, s.id)}
                >
                  {renderStatIcon(s, 11)}
                </div>

                {s.editing ? (
                  <input autoFocus className="bg-zinc-900 border-none text-[10px] text-white w-full font-bold uppercase focus:outline-none px-1" defaultValue={s.name} onClick={(e) => e.stopPropagation()} onBlur={(e) => updateStatName(s.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && updateStatName(s.id, e.target.value)} />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-tighter truncate flex-1">{s.name}</span>
                )}
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setStats(stats.map(st => st.id === s.id ? {...st, editing: true} : st)); }} className="p-1 hover:text-white outline-none"><Edit3 size={11} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setStats(stats.filter(st => st.id !== s.id)); }} className="p-1 hover:text-rose-500 outline-none"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {!leftCollapsed && <div className="w-1 hover:bg-white/10 cursor-col-resize shrink-0 z-20 outline-none" onMouseDown={() => { isResizingLeft.current = true; document.body.style.cursor = 'col-resize'; }} />}

        <button onClick={() => setLeftCollapsed(!leftCollapsed)} className={`absolute z-40 bg-[#0a0a0a] border border-white/10 p-1 rounded-r-md text-zinc-600 hover:text-white transition-all top-1/2 -translate-y-1/2 duration-200 outline-none`} style={{ left: leftCollapsed ? '0px' : `${leftWidth}px` }}>
          {leftCollapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
        </button>

        {/* ICON PICKER POPOVER */}
        {activeIconPicker && (
          <>
            <div 
              className="fixed inset-0 z-[90]" 
              onClick={() => setActiveIconPicker(null)} 
            />
            <div 
              className="fixed z-[100] bg-[#0d0d0d] border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 w-64 animate-in fade-in zoom-in duration-100 flex flex-col" 
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
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="bg-transparent border-none py-1.5 text-[8px] font-black text-white focus:outline-none w-full uppercase placeholder:text-zinc-700"
                />
              </div>

              <div className="max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                {filteredIcons.map(cat => (
                  <div key={cat.category} className="mb-4">
                    <div className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 flex justify-between items-center">
                      <span>{cat.category}</span>
                      <span className="opacity-40">{cat.icons.length}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {cat.icons.map(i => (
                        <button 
                          key={i.name} 
                          onClick={() => updateStatIcon(activeIconPicker.id, 'icon', i.name)}
                          className={`p-1.5 rounded hover:bg-white/10 transition-colors flex items-center justify-center ${stats.find(s => s.id === activeIconPicker.id)?.iconName === i.name ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-600'}`}
                          title={i.name}
                        >
                          <i.icon size={13} />
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

        {/* MAIN VISUALIZATION AREA */}
        <main className="flex-1 relative bg-[#080808] overflow-hidden min-w-0 outline-none">
          <div className="absolute inset-0 flex items-center justify-center cursor-crosshair overflow-hidden outline-none" onWheel={handleWheel} onMouseDown={handleChartMouseDown}>
            <div className="w-full h-full p-12 transition-transform duration-75 ease-out outline-none" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center center' }}>
              <ResponsiveContainer width="100%" height="100%">
                {visMode === 'radar' ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="rgba(255,255,255,0.03)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={({ x, y, payload }) => {
                        const stat = stats.find(s => s.name === payload.value);
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text dy={12} textAnchor="middle" fill="#555" fontSize={8} fontWeight={900} className="uppercase tracking-tighter">
                              {payload.value}
                            </text>
                            {stat && (
                              <foreignObject x="-8" y="-22" width="16" height="16">
                                <div className="flex items-center justify-center text-zinc-700 opacity-50">
                                  {renderStatIcon(stat, 10)}
                                </div>
                              </foreignObject>
                            )}
                          </g>
                        );
                      }}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    {entities.map(e => (
                      <Radar key={e.id} dataKey={e.id} stroke={e.color} fill={e.color} isAnimationActive={false} fillOpacity={selectedIds.includes(e.id) ? 0.4 : hoveredId === e.id ? 0.35 : (selectedIds.length > 0 || hoveredId) ? 0.05 : 0.15} strokeWidth={selectedIds.includes(e.id) ? 2 : hoveredId === e.id ? 1.5 : 1} className="cursor-pointer outline-none" onClick={() => handleEntitySelection(e.id)} />
                    ))}
                  </RadarChart>
                ) : visMode === 'leaderboard' ? (
                  <BarChart layout="vertical" data={leaderboardData} margin={{ left: 40, right: 40, top: 40, bottom: 40 }}>
                    <XAxis type="number" hide domain={[0, activeStats.length * 100]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }} width={100} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} isAnimationActive={false} onClick={(data) => handleEntitySelection(data.id)}>
                      {leaderboardData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={selectedIds.includes(entry.id) || selectedIds.length === 0 ? 0.6 : 0.1} className="cursor-pointer hover:fill-opacity-80 transition-all outline-none" />
                      ))}
                    </Bar>
                  </BarChart>
                ) : visMode === 'dots' ? (
                  <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      type="category" 
                      dataKey="x" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }} 
                    />
                    <YAxis type="number" dataKey="y" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#333", fontSize: 9 }} />
                    <ZAxis type="number" dataKey="z" range={[40, 400]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
                    <Scatter data={dotsData} isAnimationActive={false} onClick={(data) => handleEntitySelection(data.entityId)}>
                      {dotsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={selectedIds.includes(entry.entityId) || selectedIds.length === 0 ? 0.8 : 0.15} className="cursor-pointer transition-all duration-300 outline-none" />
                      ))}
                    </Scatter>
                  </ScatterChart>
                ) : visMode === 'parallel' ? (
                  <AreaChart data={chartData} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={true} horizontal={false} />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 10, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip content={<CustomTooltip />} />
                    {entities.map(e => (
                      <Area key={e.id} type="linear" dataKey={e.id} stroke={e.color} fill={e.color} isAnimationActive={false} fillOpacity={selectedIds.includes(e.id) ? 0.25 : hoveredId === e.id ? 0.2 : (selectedIds.length > 0 || hoveredId) ? 0.02 : 0.08} strokeWidth={selectedIds.includes(e.id) ? 3 : hoveredId === e.id ? 2 : 1.5} className="cursor-pointer outline-none" onClick={() => handleEntitySelection(e.id)} />
                    ))}
                  </AreaChart>
                ) : visMode === 'pie' ? (
                  selectedEntity ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                        <Pie activeIndex={activePieIndex} activeShape={renderActiveShape} data={pieData} cx="50%" cy="50%" innerRadius="35%" outerRadius="55%" paddingAngle={4} dataKey="value" isAnimationActive={false} stroke="none" labelLine={false} label={renderCustomizedPieLabel} onClick={(_, index) => setActivePieIndex(prev => prev === index ? null : index)}>
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={selectedEntity.color} fillOpacity={0.2 + (entry.value / 100) * 0.8} className="cursor-pointer hover:fill-opacity-100 transition-all outline-none" />
                          ))}
                          <Label position="center" content={({ viewBox }) => {
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
                          }} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : null
                ) : null}
              </ResponsiveContainer>
              {visMode === 'pie' && !selectedEntity && (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 outline-none pointer-events-none">
                  <PieChartIcon size={48} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">Focus on single unit for analysis</p>
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-40">
            <div className="flex items-center bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-0.5 shadow-2xl pointer-events-auto outline-none">
              <div className="flex items-center gap-0.5 pr-0.5 border-r border-white/10 mr-0.5">
                {[
                  { id: 'radar', icon: Target, label: 'Radar' },
                  { id: 'parallel', icon: Activity, label: 'Parallel' },
                  { id: 'dots', icon: CircleDot, label: 'Dots' },
                  { id: 'pie', icon: PieChartIcon, label: 'Pie' }
                ].map((mode) => (
                  <button key={mode.id} onClick={() => setVisMode(mode.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all outline-none ${visMode === mode.id ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
                    <mode.icon size={11} /> <span className="hidden lg:inline">{mode.label}</span>
                  </button>
                ))}
                <button onClick={() => setVisMode('leaderboard')} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all outline-none ${visMode === 'leaderboard' ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
                  <Trophy size={11} /> <span className="hidden lg:inline">Board</span>
                </button>
              </div>
              <button onClick={resetView} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/5 transition-all outline-none">
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* MONITOR */}
          <div className={`absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4 gap-2 pointer-events-none transition-all duration-200 z-40 ${bottomCollapsed ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'}`}>
            <button onClick={() => setBottomCollapsed(!bottomCollapsed)} className="pointer-events-auto bg-[#0a0a0a] border border-white/10 p-1.5 rounded-full text-zinc-600 hover:text-white transition-all shadow-xl outline-none">
              {bottomCollapsed ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
            </button>
            <div className="max-w-[95%] w-fit bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex items-center gap-1.5 shadow-2xl pointer-events-auto overflow-hidden outline-none">
              {paginatedEntities.map(e => (
                <div key={e.id} onMouseDown={() => handleMouseDownItem(e.id)} onMouseUp={() => handleMouseUpItem(e.id)} onMouseEnter={() => handleMouseEnterItem(e.id)} onMouseLeave={() => setHoveredId(null)} style={{ backgroundColor: selectedIds.includes(e.id) ? `${e.color}25` : `transparent`, borderColor: selectedIds.includes(e.id) ? `${e.color}60` : `rgba(255,255,255,0.03)` }} className={`min-w-[80px] px-2 py-1.5 rounded-lg border flex flex-col gap-1 transition-all cursor-pointer outline-none ${selectedIds.includes(e.id) ? 'shadow-inner' : 'hover:bg-white/5'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1 h-1 rounded-full ${selectedIds.includes(e.id) ? 'animate-pulse' : ''}`} style={{ backgroundColor: e.color }} />
                    <span className={`text-[8px] font-black uppercase truncate ${selectedIds.includes(e.id) ? 'text-white' : 'text-zinc-600'}`}>{e.name}</span>
                  </div>
                  <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${(activeStats.reduce((sum, s) => sum + (e.values[s.id] || 0), 0) / (activeStats.length * 100)) * 100}%`, backgroundColor: e.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-full px-3 py-1 shadow-xl pointer-events-auto outline-none">
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">MONITOR</span>
               <div className="h-2 w-px bg-white/10 mx-1" />
               <div className="flex items-center gap-1.5">
                <button disabled={monitorPage === 0} onClick={() => setMonitorPage(p => Math.max(0, p - 1))} className="p-0.5 text-zinc-700 hover:text-white disabled:opacity-30 outline-none"><ChevronUp size={12} /></button>
                <span className="text-[7px] font-black text-zinc-500 tabular-nums uppercase">{monitorPage + 1}/{totalPages || 1}</span>
                <button disabled={monitorPage >= totalPages - 1} onClick={() => setMonitorPage(p => Math.min(totalPages - 1, p + 1))} className="p-0.5 text-zinc-700 hover:text-white disabled:opacity-30 outline-none"><ChevronDown size={12} /></button>
               </div>
            </div>
          </div>
        </main>

        {!rightCollapsed && <div className="w-1 hover:bg-white/10 cursor-col-resize shrink-0 z-20 outline-none" onMouseDown={() => { isResizingRight.current = true; document.body.style.cursor = 'row-resize'; }} />}

        <button onClick={() => setRightCollapsed(!rightCollapsed)} className={`absolute z-40 bg-[#0a0a0a] border border-white/10 p-1 rounded-l-md text-zinc-600 hover:text-white transition-all top-1/2 -translate-y-1/2 duration-200 outline-none`} style={{ right: rightCollapsed ? '0px' : `${rightWidth}px` }}>
          {rightCollapsed ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
        </button>

        {/* RIGHT ASIDE */}
        <aside id="right-aside" style={{ width: rightCollapsed ? 0 : rightWidth }} className="border-l border-white/5 flex flex-col bg-[#0a0a0a] shrink-0 transition-all duration-200 ease-in-out relative z-20 overflow-hidden outline-none">
          <div style={{ height: `${rightSplit}%` }} className="flex flex-col min-h-0 overflow-hidden outline-none">
            <div className="h-[84px] border-b border-white/5 bg-black/20 shrink-0 p-4 relative flex flex-col justify-between">
              <div className="flex justify-between items-center h-6">
                <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">Registry</span>
                <button onClick={() => {
                  const nid = `e${Date.now()}`;
                  setEntities([...entities, { id: nid, name: `ENT_${String(entities.length + 1).padStart(2, '0')}`, visible: true, color: getRandomColor(), values: getRandomStats() }]);
                }} className="p-1.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all outline-none"><Plus size={14} /></button>
              </div>
              <div className="flex gap-1">
                {[{id:'grid', i:LayoutGrid}, {id:'normal', i:StretchHorizontal}, {id:'list', i:ListIcon}].map(v => (
                  <button key={v.id} onClick={() => setRegistryView(v.id)} className={`p-1.5 rounded transition-colors outline-none ${registryView === v.id ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-700 hover:text-zinc-400 hover:bg-white/5'}`}><v.i size={16} /></button>
                ))}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar outline-none ${registryView === 'grid' ? 'grid grid-cols-4 auto-rows-min gap-1 p-1 content-start' : registryView === 'normal' ? 'space-y-1 p-2' : 'flex flex-col'}`}>
              {sortedEntities.map((e, idx) => {
                const isSelected = selectedIds.includes(e.id);
                const totalScore = activeStats.reduce((sum, s) => sum + (e.values[s.id] || 0), 0);
                return (
                  <div key={e.id} onClick={() => handleEntitySelection(e.id)} onMouseEnter={() => setHoveredId(e.id)} onMouseLeave={() => setHoveredId(null)} style={{ backgroundColor: isSelected ? `${e.color}35` : `${e.color}05`, borderColor: isSelected ? `${e.color}80` : `${e.color}15` }} className={`group relative flex items-center cursor-pointer border transition-all outline-none ${registryView === 'grid' ? 'aspect-square flex-col justify-center rounded-sm p-0' : 'p-2 rounded-sm'}`}>
                    <div className={`flex items-center ${registryView === 'grid' ? 'flex-col gap-0.5' : 'gap-3 w-full'} whitespace-nowrap outline-none`}>
                      <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                      <span className={`text-[9px] font-bold uppercase truncate ${isSelected ? 'text-white' : 'text-zinc-600'} flex-1`}>{e.name}</span>
                      {registryView === 'list' && <span className="text-[12px] text-emerald-400 font-black tracking-tighter">{totalScore}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-1 hover:bg-emerald-500/20 cursor-row-resize shrink-0 group outline-none" onMouseDown={() => { isResizingSplit.current = true; document.body.style.cursor = 'row-resize'; }} />

          <div className="p-4 flex flex-col bg-black/20 min-h-0 overflow-hidden outline-none" style={{ height: `${100 - rightSplit}%` }}>
            <div className="p-2 mb-4 border-b border-white/5 flex items-center gap-2 shrink-0">
              <Settings2 size={12} className="text-zinc-600" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Parameters</span>
            </div>

            {selectedEntity ? (
              <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar outline-none">
                <div className="space-y-3">
                  <label className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">ID Signature</label>
                  <div className="flex gap-2 h-8">
                    <input value={selectedEntity.name} onChange={(e) => setEntities(entities.map(ent => ent.id === selectedEntity.id ? { ...ent, name: e.target.value.toUpperCase() } : ent))} className="flex-1 bg-white/[0.02] border border-white/5 rounded px-2 text-[10px] font-bold text-white uppercase focus:outline-none focus:border-emerald-500/40" />
                    <div className="w-8 relative rounded border border-white/5 overflow-hidden outline-none" style={{ backgroundColor: selectedEntity.color }}>
                      <input type="color" value={selectedEntity.color} onChange={(e) => setEntities(entities.map(ent => ent.id === selectedEntity.id ? { ...ent, color: e.target.value } : ent))} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer outline-none" />
                    </div>
                    <button onClick={() => removeEntity(selectedEntity.id)} className="w-8 h-8 rounded border border-white/5 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all outline-none"><Trash2 size={12}/></button>
                  </div>
                </div>
                <div className="space-y-2">
                  {stats.map(s => (
                    <div key={s.id} className="flex flex-col gap-1.5 p-2 bg-white/[0.02] rounded border border-white/5 outline-none">
                      <div className="flex justify-between items-center outline-none">
                        <div className="flex items-center gap-2">
                          <div className="text-zinc-600 opacity-70" onClick={(e) => openIconPicker(e, s.id)}>{renderStatIcon(s, 10)}</div>
                          <span className="text-[9px] font-bold uppercase text-zinc-500">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400">{Math.floor(selectedEntity.values[s.id] || 0)}</span>
                      </div>
                      <input type="range" min="0" max="100" value={selectedEntity.values[s.id] || 0} onChange={(e) => updateStatValue(selectedEntity.id, s.id, e.target.value)} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 outline-none">
                <Target size={32} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Idle</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        * { outline: none !important; -webkit-tap-highlight-color: transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 10px; width: 10px; border-radius: 50%; background: #10b981; cursor: pointer; }
      `}} />
    </div>
  );
};

export default App;