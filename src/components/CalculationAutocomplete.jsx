import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Hash, Sparkles, Sigma, Calculator, ChevronRight,
} from 'lucide-react';
import { renderStatIcon } from '../constants/icons.jsx';

/**
 * Extracts current token/word being typed around cursor position.
 */
export function getCurrentToken(text, cursorPos) {
  if (text === null || text === undefined) return { word: '', start: 0, end: 0, prefix: '' };
  const str = String(text);
  const pos = Math.max(0, Math.min(cursorPos ?? str.length, str.length));

  // Find start boundary (space, operator, parenthesis, comma)
  let start = pos;
  while (start > 0 && !/[\s+\-*/^(),]/.test(str[start - 1])) {
    start--;
  }

  // Find end boundary
  let end = pos;
  while (end < str.length && !/[\s+\-*/^(),]/.test(str[end])) {
    end++;
  }

  const rawWord = str.substring(start, end);
  let cleanWord = rawWord;
  let prefix = '';

  if (cleanWord.startsWith('@')) {
    prefix = '@';
    cleanWord = cleanWord.slice(1);
  } else if (cleanWord.startsWith('[')) {
    prefix = '[';
    cleanWord = cleanWord.replace(/^\[+|\]+$/g, '');
  }

  return {
    rawWord,
    word: cleanWord,
    start,
    end,
    prefix,
  };
}

/**
 * Autocomplete popup for mathematical and statistical calculations.
 */
export default function CalculationAutocomplete({
  isLight = false,
  inputRef,
  value,
  cursorPos,
  allStats = [],
  allEntities = [],
  currentEntity,
  onSelect,
  isOpen,
  onClose,
  position = 'bottom',
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  const tokenInfo = useMemo(() => {
    return getCurrentToken(value, cursorPos);
  }, [value, cursorPos]);

  const query = (tokenInfo.word || '').toLowerCase();

  // Generate all searchable suggestions
  const allSuggestions = useMemo(() => {
    const list = [];

    // 1. Stats / Parameters
    allStats.forEach(stat => {
      const curVal = currentEntity?.values?.[stat.id];
      list.push({
        id: `stat_${stat.id}`,
        type: 'stat',
        category: 'Parameters',
        label: stat.name,
        insertText: `[${stat.name}]`,
        description: `Current: ${curVal !== undefined && curVal !== null ? curVal : '0'}${stat.isFormula ? ' (fx)' : ''}`,
        stat,
      });
    });

    // 2. Global Aggregates across all entities
    allStats.forEach(stat => {
      list.push({
        id: `agg_avg_${stat.id}`,
        type: 'aggregate',
        category: 'Global Aggregates',
        label: `AVG(${stat.name})`,
        insertText: `AVG([${stat.name}])`,
        description: `Average ${stat.name} across all entities`,
      });
      list.push({
        id: `agg_max_${stat.id}`,
        type: 'aggregate',
        category: 'Global Aggregates',
        label: `MAX(${stat.name})`,
        insertText: `MAX([${stat.name}])`,
        description: `Maximum ${stat.name} across all entities`,
      });
      list.push({
        id: `agg_min_${stat.id}`,
        type: 'aggregate',
        category: 'Global Aggregates',
        label: `MIN(${stat.name})`,
        insertText: `MIN([${stat.name}])`,
        description: `Minimum ${stat.name} across all entities`,
      });
      list.push({
        id: `agg_sum_${stat.id}`,
        type: 'aggregate',
        category: 'Global Aggregates',
        label: `SUM(${stat.name})`,
        insertText: `SUM([${stat.name}])`,
        description: `Total sum of ${stat.name} across all entities`,
      });
    });

    // 3. Cross-Entity References
    allEntities.forEach(ent => {
      // Entity total
      list.push({
        id: `ent_total_${ent.id}`,
        type: 'entity',
        category: 'Cross-Entity',
        label: `${ent.name}.TOTAL`,
        insertText: `${ent.name}.TOTAL`,
        description: `Total score of ${ent.name}`,
        entity: ent,
      });

      // Entity stats
      allStats.forEach(stat => {
        const entVal = ent.values?.[stat.id] ?? 0;
        list.push({
          id: `ent_stat_${ent.id}_${stat.id}`,
          type: 'entity',
          category: 'Cross-Entity',
          label: `${ent.name}.${stat.name}`,
          insertText: `${ent.name}.${stat.name}`,
          description: `${ent.name}'s ${stat.name} (Value: ${entVal})`,
          entity: ent,
          stat,
        });
      });
    });

    // 4. Built-in Math Functions
    const funcs = [
      { name: 'sqrt(x)', insert: 'sqrt()', desc: 'Square root' },
      { name: 'round(x)', insert: 'round()', desc: 'Round to nearest integer' },
      { name: 'abs(x)', insert: 'abs()', desc: 'Absolute value' },
      { name: 'max(a, b)', insert: 'max()', desc: 'Maximum of arguments' },
      { name: 'min(a, b)', insert: 'min()', desc: 'Minimum of arguments' },
      { name: 'avg(a, b, ...)', insert: 'avg()', desc: 'Average of arguments' },
      { name: 'delta(a, b)', insert: 'delta()', desc: 'Difference (a - b)' },
      { name: 'pow(x, y)', insert: 'pow()', desc: 'x to the power of y' },
      { name: 'clamp(x, min, max)', insert: 'clamp()', desc: 'Restrain within min and max' },
    ];
    funcs.forEach(f => {
      list.push({
        id: `fn_${f.name}`,
        type: 'function',
        category: 'Functions',
        label: f.name,
        insertText: f.insert,
        description: f.desc,
      });
    });

    return list;
  }, [allStats, allEntities, currentEntity]);

  // Filter based on active query
  const filtered = useMemo(() => {
    if (!query) {
      // Default: show parameters first, then functions
      return allSuggestions.slice(0, 15);
    }
    return allSuggestions
      .filter(item => {
        return (
          item.label.toLowerCase().includes(query) ||
          item.insertText.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      })
      .slice(0, 25);
  }, [allSuggestions, query]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keep selected item visible in list
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation on the attached input
  useEffect(() => {
    const el = inputRef?.current;
    if (!el || !isOpen) return;

    const handleKeyDown = (e) => {
      if (filtered.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (filtered[selectedIndex]) {
          e.preventDefault();
          e.stopPropagation();
          handleSelect(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    el.addEventListener('keydown', handleKeyDown, true);
    return () => el.removeEventListener('keydown', handleKeyDown, true);
  }, [inputRef, isOpen, filtered, selectedIndex]);

  const handleSelect = (item) => {
    const text = String(value || '');
    const { start, end } = tokenInfo;

    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + item.insertText + after;
    const newCursor = before.length + item.insertText.length;

    onSelect?.(newText, newCursor, item);
  };

  if (!isOpen || filtered.length === 0) return null;

  return (
    <div
      className={`absolute z-[250] w-72 rounded-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 ${
        isLight
          ? 'bg-[#ebedef] border border-black/10 text-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.2)]'
          : 'bg-[#121212] border border-white/10 text-zinc-200 shadow-2xl'
      } ${
        position === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
      }`}
      style={{ left: 0 }}
      onMouseDown={e => e.preventDefault()} // Keep focus on input
    >
      {/* Header bar */}
      <div className={`px-2.5 py-1.5 border-b flex items-center justify-between text-[8px] font-mono uppercase tracking-widest ${
        isLight ? 'bg-black/[0.03] border-black/[0.08] text-zinc-600' : 'border-white/5 bg-black/40 text-zinc-500'
      }`}>
        <span className="flex items-center gap-1">
          <Calculator size={10} className="text-rose-500" />
          <span>Autocomplete Formula</span>
        </span>
        <span className={`text-[7px] ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>Tab / Enter to select</span>
      </div>

      {/* Suggestion list */}
      <div
        ref={listRef}
        className="max-h-56 overflow-y-auto p-1 space-y-0.5 custom-scrollbar"
      >
        {filtered.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={item.id}
              data-active={isSelected}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`px-2 py-1.5 rounded-lg flex items-center justify-between text-[9px] font-mono cursor-pointer transition-colors ${
                isSelected
                  ? isLight
                    ? 'bg-rose-500/15 text-rose-950 font-bold border border-rose-500/25'
                    : 'bg-rose-500/20 text-white border border-rose-500/30'
                  : isLight
                    ? 'text-zinc-700 hover:text-zinc-950 hover:bg-black/[0.04] border border-transparent'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Icon based on item type */}
                {item.type === 'stat' && (
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-black/[0.04] text-zinc-600' : 'bg-white/5 text-zinc-400'
                  }`}>
                    {item.stat ? renderStatIcon(item.stat, 10) : <Hash size={10} />}
                  </div>
                )}
                {item.type === 'entity' && (
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 border ${isLight ? 'border-black/10' : 'border-white/20'}`}
                    style={{ backgroundColor: item.entity?.color || '#fff' }}
                  />
                )}
                {item.type === 'aggregate' && (
                  <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Sigma size={11} />
                  </div>
                )}
                {item.type === 'function' && (
                  <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles size={11} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className={`font-bold flex items-center gap-1.5 truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    <span>{item.label}</span>
                    <span className={`text-[7px] px-1 py-0.2 rounded uppercase tracking-tighter ${
                      isLight ? 'bg-black/[0.05] text-zinc-600' : 'bg-white/5 text-zinc-500'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <div className={`text-[7.5px] truncate ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {item.description}
                  </div>
                </div>
              </div>

              {isSelected && (
                <ChevronRight size={12} className="text-rose-500 shrink-0 ml-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
