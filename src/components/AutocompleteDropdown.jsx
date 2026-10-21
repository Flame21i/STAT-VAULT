import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calculator, Hash, User, Sparkles, ChevronRight,
} from 'lucide-react';
import { renderStatIcon } from '../constants/icons.jsx';

/**
 * Autocomplete Dropdown for parameter and entity references in formulas and inputs.
 * Supports @ and [ triggers, arrow key navigation, Enter/Tab to select.
 */
export default function AutocompleteDropdown({
  inputValue = '',
  cursorPosition = 0,
  stats = [],
  entities = [],
  selectedEntity = null,
  onSelect = () => {},
  isOpen = false,
  onClose = () => {},
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  // Extract the active query word under the cursor
  const { activeQuery, triggerChar, replaceRange } = useMemo(() => {
    if (!inputValue || cursorPosition < 0) {
      return { activeQuery: '', triggerChar: '', replaceRange: null };
    }

    const textBeforeCursor = inputValue.slice(0, cursorPosition);

    // Check for trigger char (@ or [)
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9_.]*)$/);
    if (atMatch) {
      return {
        activeQuery: atMatch[1],
        triggerChar: '@',
        replaceRange: [cursorPosition - atMatch[0].length, cursorPosition],
      };
    }

    const bracketMatch = textBeforeCursor.match(/\[([a-zA-Z0-9_.\s]*)$/);
    if (bracketMatch) {
      return {
        activeQuery: bracketMatch[1],
        triggerChar: '[',
        replaceRange: [cursorPosition - bracketMatch[0].length, cursorPosition],
      };
    }

    // Check for word without explicit trigger
    const wordMatch = textBeforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_.]*)$/);
    if (wordMatch && wordMatch[1].length >= 1) {
      return {
        activeQuery: wordMatch[1],
        triggerChar: '',
        replaceRange: [cursorPosition - wordMatch[1].length, cursorPosition],
      };
    }

    return { activeQuery: '', triggerChar: '', replaceRange: null };
  }, [inputValue, cursorPosition]);

  // Generate and filter suggestions
  const suggestions = useMemo(() => {
    if (!replaceRange && !isOpen) return [];

    const q = (activeQuery || '').toLowerCase().trim();
    const results = [];

    // 1. Parameters (Stats)
    stats.forEach(stat => {
      const match = !q || stat.name.toLowerCase().includes(q) || stat.id.toLowerCase().includes(q);
      if (match) {
        const currentVal = selectedEntity?.values?.[stat.id];
        results.push({
          type: 'stat',
          id: stat.id,
          name: stat.name,
          insertText: `[${stat.name}]`,
          subtext: typeof currentVal === 'number' ? `Value: ${currentVal}` : 'Parameter',
          stat,
          priority: 1,
        });
      }
    });

    // 2. Cross-Entity Parameters (e.g. ENT_01.STAT_01)
    if (q.includes('.') || entities.length > 1) {
      entities.forEach(ent => {
        stats.forEach(stat => {
          const combo = `${ent.name}.${stat.name}`;
          if (!q || combo.toLowerCase().includes(q)) {
            const val = ent.values?.[stat.id];
            results.push({
              type: 'entity-stat',
              id: `${ent.id}_${stat.id}`,
              name: combo,
              insertText: `[${combo}]`,
              subtext: `${ent.name} • ${val ?? '—'}`,
              entity: ent,
              stat,
              priority: 2,
            });
          }
        });
      });
    }

    // 3. Mathematical Functions
    const functions = [
      { name: 'avg', desc: 'Average of parameters', template: 'avg(' },
      { name: 'sum', desc: 'Sum of parameters', template: 'sum(' },
      { name: 'sqrt', desc: 'Square root', template: 'sqrt(' },
      { name: 'round', desc: 'Round to integer', template: 'round(' },
      { name: 'max', desc: 'Maximum value', template: 'max(' },
      { name: 'min', desc: 'Minimum value', template: 'min(' },
      { name: 'abs', desc: 'Absolute value', template: 'abs(' },
    ];

    functions.forEach(fn => {
      if (!q || fn.name.toLowerCase().includes(q)) {
        results.push({
          type: 'function',
          id: `fn_${fn.name}`,
          name: `${fn.name}()`,
          insertText: fn.template,
          subtext: fn.desc,
          priority: 3,
        });
      }
    });

    return results.slice(0, 8); // Top 8 items
  }, [activeQuery, entities, isOpen, replaceRange, selectedEntity, stats]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [activeQuery]);

  // Keyboard navigation handler
  useEffect(() => {
    if (suggestions.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [suggestions, selectedIndex]);

  const handleSelect = (item) => {
    if (!replaceRange) return;
    const [start, end] = replaceRange;
    const before = inputValue.slice(0, start);
    const after = inputValue.slice(end);
    const newValue = before + item.insertText + after;
    const nextCursor = start + item.insertText.length;
    onSelect(newValue, nextCursor);
    onClose();
  };

  if (suggestions.length === 0 || (!replaceRange && !isOpen)) {
    return null;
  }

  const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');

  return (
    <div
      ref={listRef}
      className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 font-mono border ${
        isLight
          ? 'bg-white border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.2)] text-zinc-900'
          : 'bg-[#121212] border-white/20 shadow-2xl text-white'
      }`}
    >
      <div className="p-1 max-h-56 overflow-y-auto custom-scrollbar">
        {suggestions.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors text-[9px] ${
                isSelected
                  ? isLight ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30' : 'bg-rose-500/20 text-white border border-rose-500/30'
                  : isLight ? 'text-zinc-700 hover:bg-black/5 border border-transparent' : 'text-zinc-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.type === 'stat' && (
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isLight ? 'bg-black/5 text-zinc-600' : 'bg-white/5 text-zinc-400'}`}>
                    {renderStatIcon(item.stat, 9)}
                  </div>
                )}
                {item.type === 'entity-stat' && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.entity?.color || '#f43f5e' }}
                  />
                )}
                {item.type === 'function' && (
                  <Calculator size={11} className={`${isLight ? 'text-zinc-400' : 'text-zinc-500'} shrink-0`} />
                )}

                <div className="truncate flex items-center gap-1.5">
                  <span className="font-bold">{item.name}</span>
                  <span className={`text-[7px] uppercase font-bold px-1 rounded ${
                    item.type === 'stat'
                      ? isLight ? 'bg-rose-500/10 text-rose-600' : 'bg-rose-500/20 text-rose-300'
                      : item.type === 'entity-stat'
                        ? isLight ? 'bg-blue-500/10 text-blue-600' : 'bg-blue-500/20 text-blue-300'
                        : isLight ? 'bg-black/5 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.type === 'stat' ? 'PARAM' : item.type === 'entity-stat' ? 'ENTITY' : 'FN'}
                  </span>
                </div>
              </div>

              <div className={`flex items-center gap-1 shrink-0 text-[8px] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <span>{item.subtext}</span>
                <ChevronRight size={10} className="opacity-40" />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`px-2 py-1 border-t flex items-center justify-between text-[7px] font-sans ${
        isLight ? 'bg-black/[0.03] border-black/5 text-zinc-500' : 'bg-black/40 border-white/5 text-zinc-500'
      }`}>
        <span>↑↓ Navigate • ↵ Select • Esc Dismiss</span>
        <span className={`font-mono ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>@{activeQuery || 'all'}</span>
      </div>
    </div>
  );
}
