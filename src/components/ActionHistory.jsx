import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { History, ChevronUp, ChevronDown, RotateCcw, Trash2, Cpu, User } from 'lucide-react';

/**
 * Compact Action History panel rendered at the bottom of the left pane.
 * - Guarantees chronological order with the most recent action at the bottom.
 * - Auto-scrolls to the newest action.
 * - Ultra-compact, high-density display.
 * - Clicking any action immediately restores that state snapshot.
 */
const ActionHistory = memo(({
  theme = 'dark',
  history = [],
  activeHistoryId,
  onRestore,
  onClear,
}) => {
  const isLight = theme === 'light';
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('action_history_expanded');
      if (saved !== null) return JSON.parse(saved);
      const savedCollapsed = localStorage.getItem('action_history_collapsed');
      if (savedCollapsed !== null) return !JSON.parse(savedCollapsed);
      return true;
    } catch {
      return true;
    }
  });
  const scrollRef = useRef(null);

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('action_history_expanded', JSON.stringify(next));
        localStorage.setItem('action_history_collapsed', JSON.stringify(!next));
      } catch {}
      return next;
    });
  };

  // Pack together duplicate actions and track xcount
  const packedHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const map = new Map();

    for (const item of sorted) {
      if (!item || !item.action) continue;
      const key = item.action.trim().toLowerCase();

      if (map.has(key)) {
        const existing = map.get(key);
        existing.count = (existing.count || 1) + 1;
        existing.latestItem = item;
        existing.formattedTime = item.formattedTime || item.dateStr || existing.formattedTime;
        existing.dateStr = item.dateStr || existing.dateStr;
        existing.timestamp = item.timestamp || existing.timestamp;
        if (item.input !== undefined && item.input !== '') {
          existing.input = item.input;
        }
        if (item.source) {
          existing.source = item.source;
        }
        existing.snapshot = item.snapshot || existing.snapshot;
        if (!existing.allIds) existing.allIds = [existing.id];
        existing.allIds.push(item.id);
        // Move to the end so most recently updated action stays at the bottom
        map.delete(key);
        map.set(key, existing);
      } else {
        map.set(key, {
          ...item,
          count: 1,
          latestItem: item,
          allIds: [item.id],
        });
      }
    }

    return Array.from(map.values());
  }, [history]);

  // Auto-scroll to the bottom whenever history changes or panel is expanded
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [packedHistory.length, isExpanded]);

  return (
    <div className={`border-t flex flex-col shrink-0 font-mono select-none transition-colors duration-200 ${
      isLight ? 'bg-[#e4e6e9] border-black/[0.08]' : 'bg-[#080808] border-white/5'
    }`}>
      {/* Ultra-compact header bar */}
      <div
        className={`px-2 py-1 flex items-center justify-between cursor-pointer border-b h-6 transition-colors duration-200 ${
          isLight ? 'bg-black/[0.03] hover:bg-black/[0.06] border-black/[0.08]' : 'bg-black/40 hover:bg-black/60 border-white/5'
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <History size={11} className="text-rose-500 shrink-0" />
          <span className={`text-[8px] font-bold uppercase tracking-wider truncate ${
            isLight ? 'text-zinc-700' : 'text-zinc-300'
          }`}>
            Action History
          </span>
          <span className={`px-1.5 py-0.2 rounded-full text-[6.5px] font-bold tabular-nums ${
            isLight ? 'bg-black/[0.06] text-zinc-700' : 'bg-white/10 text-zinc-300'
          }`}>
            {packedHistory.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {packedHistory.length > 0 && isExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isLight ? 'text-zinc-500 hover:text-rose-600 hover:bg-black/5' : 'text-zinc-500 hover:text-rose-400 hover:bg-white/5'
              }`}
              title="Clear Action History"
            >
              <Trash2 size={9.5} />
            </button>
          )}
          <button
            type="button"
            className={`p-1 transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {isExpanded ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          </button>
        </div>
      </div>

      {/* Informative expanded list - most recent action at the bottom */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="max-h-80 overflow-y-auto p-2 space-y-2.5 custom-scrollbar"
        >
          {packedHistory.length === 0 ? (
            <div className={`py-6 text-center text-[8px] uppercase font-bold tracking-wider ${
              isLight ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              No actions recorded yet
            </div>
          ) : (
            packedHistory.map((item, index) => {
              const isLatest = index === packedHistory.length - 1;
              const isActive = activeHistoryId
                ? (item.allIds?.includes(activeHistoryId) || activeHistoryId === item.id)
                : isLatest;
              const isApi = item.source === 'API';
              const isFormula = item.source === 'Formula Engine';
              const entCount = item.snapshot?.entities?.length ?? 0;
              const statCount = item.snapshot?.stats?.length ?? 0;
              const selectedCount = item.snapshot?.selectedIds?.length ?? 0;

              return (
                <div
                  key={item.id}
                  onClick={() => onRestore?.(item.latestItem || item)}
                  className={`group relative p-2.5 rounded-xl border text-left cursor-pointer transition-all shadow-xs space-y-2 ${
                    isActive
                      ? isLight
                        ? 'bg-rose-500/15 border-rose-500/35 ring-1 ring-rose-500/20 shadow-sm'
                        : 'bg-rose-500/20 border-rose-500/40 ring-1 ring-rose-500/30 shadow-md'
                      : isLight
                        ? 'bg-white border-black/[0.08] hover:bg-white hover:border-black/[0.18] hover:shadow-md'
                        : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                  title="Click to restore this snapshot"
                >
                  {/* Header Row: Timestamp, Source & Restore */}
                  <div className="flex items-center justify-between gap-1.5 text-[7.5px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-mono font-bold tabular-nums px-1.5 py-0.5 rounded ${
                        isLight ? 'bg-black/[0.04] text-zinc-600' : 'bg-white/5 text-zinc-400'
                      }`}>
                        {item.formattedTime || item.dateStr}
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[6.5px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                          isApi
                            ? isLight
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : isFormula
                              ? isLight
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isLight
                                ? 'bg-black/[0.03] text-zinc-700 border-black/[0.08]'
                                : 'bg-white/5 text-zinc-300 border-white/10'
                        }`}
                      >
                        {isApi ? <Cpu size={7.5} /> : <User size={7.5} />}
                        {item.source || 'User'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Multiplier badge for packed duplicate actions */}
                      {item.count > 1 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[7px] font-mono font-black tabular-nums border ${
                            isActive
                              ? isLight
                                ? 'bg-rose-500/25 text-rose-800 border-rose-500/40'
                                : 'bg-rose-500/30 text-rose-200 border-rose-500/50'
                              : isLight
                                ? 'bg-black/[0.06] text-zinc-700 border-black/10'
                                : 'bg-white/10 text-zinc-200 border-white/15'
                          }`}
                          title={`${item.count} duplicate actions grouped`}
                        >
                          ×{item.count}
                        </span>
                      )}

                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold uppercase text-[7.5px] transition-all group-hover:bg-rose-500 group-hover:text-white">
                        <RotateCcw size={8} />
                        <span>Restore</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Description */}
                  <div className={`text-[9px] font-bold uppercase tracking-tight leading-snug ${
                    isActive
                      ? isLight ? 'text-rose-950 font-black' : 'text-rose-50 font-black'
                      : isLight ? 'text-zinc-800 group-hover:text-zinc-950' : 'text-zinc-100 group-hover:text-white'
                  }`}>
                    {item.action}
                  </div>

                  {/* Input parameter detail */}
                  {item.input && (
                    <div className={`px-2 py-1 rounded text-[7.5px] font-mono break-all border ${
                      isLight
                        ? 'bg-black/[0.03] border-black/[0.05] text-zinc-600'
                        : 'bg-black/30 border-white/5 text-zinc-400'
                    }`}>
                      <span className="opacity-60 mr-1">Input:</span>
                      <span className="font-semibold">{item.input}</span>
                    </div>
                  )}

                  {/* Informative Snapshot State Metadata */}
                  <div className={`flex items-center justify-between text-[7px] font-mono pt-1.5 border-t ${
                    isLight ? 'border-black/[0.06] text-zinc-500' : 'border-white/5 text-zinc-500'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>{entCount} Entities</span>
                      <span>•</span>
                      <span>{statCount} Parameters</span>
                    </div>
                    {selectedCount > 0 && (
                      <span className="text-rose-500 font-bold">
                        {selectedCount} Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

ActionHistory.displayName = 'ActionHistory';
export default ActionHistory;
