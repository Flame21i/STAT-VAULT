import React, { memo } from 'react';
import { Search, X } from 'lucide-react';

const IconPickerModal = memo(({
  activeIconPicker,
  onClose,
  stats,
  filteredIcons,
  iconSearch,
  setIconSearch,
  onSelectIcon,
  theme = 'dark',
}) => {
  if (!activeIconPicker) return null;

  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.classList.contains('light'));
  const currentStat = stats?.find(s => s.id === activeIconPicker.id);

  // Position calculation with viewport boundaries
  const modalWidth = 270;
  const modalHeight = 350;
  const left = Math.min(Math.max(16, activeIconPicker.x || 100), window.innerWidth - modalWidth - 16);
  const top = Math.min(Math.max(16, activeIconPicker.y || 100), window.innerHeight - modalHeight - 16);

  return (
    <>
      {/* Backdrop without darkening or blurring */}
      <div
        className="fixed inset-0 z-[299] bg-transparent pointer-events-auto"
        onClick={onClose}
      />

      {/* Floating Modal */}
      <div
        className={`fixed z-[300] rounded-xl p-3 w-[270px] flex flex-col animate-scale-in border ${
          isLight
            ? 'bg-white border-black/10 shadow-[0_25px_60px_rgba(0,0,0,0.38),0_10px_22px_rgba(0,0,0,0.22)] text-zinc-900'
            : 'bg-[#0d0d0d] border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white'
        }`}
        style={{ left, top }}
        onClick={e => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between pb-2 border-b mb-2.5 ${isLight ? 'border-black/5' : 'border-white/5'}`}>
          <div className="flex items-center gap-1.5 truncate">
            <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              SELECT ICON
            </span>
            {currentStat && (
              <span className="text-[8px] font-bold text-rose-500 uppercase truncate max-w-[100px]">
                {currentStat.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-0.5 rounded transition-colors ${isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white'}`}
          >
            <X size={12} />
          </button>
        </div>

        {/* Search input */}
        <div className={`flex items-center gap-2 border rounded px-2 mb-2.5 ${
          isLight
            ? 'bg-black/[0.04] border-black/10 focus-within:border-rose-500/60'
            : 'bg-white/5 border-white/10 focus-within:border-rose-500/50'
        }`}>
          <Search size={10} className={`${isLight ? 'text-zinc-400' : 'text-zinc-500'} shrink-0`} />
          <input
            autoFocus
            placeholder="SEARCH SIGNATURES..."
            value={iconSearch}
            onChange={e => setIconSearch(e.target.value)}
            className={`bg-transparent border-none py-1.5 text-[8.5px] font-black focus:outline-none w-full uppercase ${
              isLight
                ? 'text-zinc-900 placeholder:text-zinc-400'
                : 'text-white placeholder:text-zinc-700'
            }`}
          />
          {iconSearch && (
            <button
              onClick={() => setIconSearch('')}
              className={`p-0.5 text-[8px] ${isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-600 hover:text-white'}`}
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Categories & Icons grid */}
        <div className="max-h-[240px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
          {filteredIcons.map(category => (
            <div key={category.category} className="space-y-1.5">
              <div className={`text-[7.5px] font-black uppercase tracking-widest border-b pb-1 flex justify-between items-center ${
                isLight ? 'text-zinc-500 border-black/5' : 'text-zinc-600 border-white/5'
              }`}>
                <span>{category.category}</span>
                <span className={`font-mono ${isLight ? 'opacity-60 text-zinc-500' : 'opacity-40 text-zinc-400'}`}>{category.icons.length}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {category.icons.map(item => {
                  const isSelected = currentStat?.iconName === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => onSelectIcon(activeIconPicker.id, 'icon', item.name)}
                      className={`p-1.5 rounded transition-all duration-150 flex items-center justify-center ${
                        isSelected
                          ? 'text-rose-600 bg-rose-500/15 border border-rose-500/30 font-bold'
                          : isLight
                            ? 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.05] border border-transparent'
                            : 'text-zinc-500 hover:text-white hover:bg-white/10 border border-transparent'
                      }`}
                      title={item.name}
                    >
                      <item.icon size={13} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredIcons.length === 0 && (
            <div className={`py-8 text-center text-[8.5px] font-black uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`}>
              No matching signatures found
            </div>
          )}
        </div>
      </div>
    </>
  );
});

IconPickerModal.displayName = 'IconPickerModal';
export default IconPickerModal;
