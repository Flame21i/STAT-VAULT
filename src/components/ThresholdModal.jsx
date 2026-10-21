import React, { useState, useEffect } from 'react';
import { X, Sliders, AlertTriangle, AlertCircle, RotateCcw, Check } from 'lucide-react';

/**
 * Threshold Configuration Modal
 * Configures Minimum and Maximum threshold triggers:
 * - Minimum: triggers RED text, flashing red dot animation, and pushes a notification
 * - Maximum: triggers YELLOW text, flashing yellow dot animation, and pushes a notification
 * Supports individual stats, all filters (global stat threshold),
 * individual entities, and all entities (global entity threshold).
 */
const ThresholdModal = ({
  isOpen,
  onClose,
  targetType, // 'stat' | 'all-stats' | 'entity' | 'all-entities'
  targetTitle, // e.g. "Speed" or "All Filters" or "Alpha" or "All Entities"
  initialMin,
  initialMax,
  onSave,
  onClear,
  theme = 'dark',
}) => {
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.classList.contains('light'));
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMinVal(initialMin !== null && initialMin !== undefined ? String(initialMin) : '');
      setMaxVal(initialMax !== null && initialMax !== undefined ? String(initialMax) : '');
    }
  }, [isOpen, initialMin, initialMax]);

  if (!isOpen) return null;

  const handleSave = () => {
    const parsedMin = minVal.trim() === '' ? null : Number(minVal);
    const parsedMax = maxVal.trim() === '' ? null : Number(maxVal);
    onSave?.({
      min: isNaN(parsedMin) ? null : parsedMin,
      max: isNaN(parsedMax) ? null : parsedMax,
    });
    onClose();
  };

  const handleClear = () => {
    setMinVal('');
    setMaxVal('');
    onClear?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-auto">
      {/* Clean non-darkening, non-blurring transparent click backdrop */}
      <div
        className="fixed inset-0 z-[299] bg-transparent pointer-events-auto"
        onClick={onClose}
      />

      <div
        className={`relative z-[300] rounded-2xl p-5 w-[92vw] max-w-md animate-scale-in flex flex-col font-mono pointer-events-auto border ${
          isLight
            ? 'bg-white border-black/10 shadow-[0_25px_60px_rgba(0,0,0,0.4),0_10px_25px_rgba(0,0,0,0.25)] text-zinc-900'
            : 'bg-[#0c0c0c] border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.98)] text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-black/5' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Sliders size={14} />
            </div>
            <div>
              <h2 className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Threshold Triggers
              </h2>
              <p className={`text-[8.5px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Target: <span className="text-rose-500 font-bold uppercase">{targetTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <X size={15} />
          </button>
        </div>

        {/* Description */}
        <div className={`py-3 text-[8.5px] leading-relaxed border-b ${isLight ? 'text-zinc-600 border-black/5' : 'text-zinc-400 border-white/5'}`}>
          Define boundary limits. Falling below the minimum alerts in <span className="text-red-500 font-bold">RED</span>.
          Exceeding the maximum alerts in <span className="text-amber-500 font-bold">YELLOW</span>.
          Triggered items flash an animated indicator dot and push an instant notification.
        </div>

        {/* Inputs */}
        <div className="space-y-4 py-4">
          {/* Minimum input */}
          <div className={`p-3 rounded-xl space-y-1.5 border ${
            isLight ? 'bg-red-500/[0.05] border-red-500/20' : 'bg-red-950/20 border-red-500/25'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Minimum Threshold (Red Alert)
              </label>
              <span className="text-[7.5px] font-mono text-red-500/80 uppercase">Value &lt; Min</span>
            </div>
            <p className={`text-[7.5px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              When value drops below this number, text turns red with a flashing red dot and pushes a notification.
            </p>
            <div className="relative">
              <input
                type="number"
                value={minVal}
                onChange={e => setMinVal(e.target.value)}
                placeholder="No minimum (optional)"
                className={`w-full rounded-lg px-3 py-2 text-[11px] font-mono transition-colors focus:outline-none focus:border-red-400 border ${
                  isLight
                    ? 'bg-white border-red-500/30 text-zinc-900 placeholder:text-zinc-400'
                    : 'bg-black/60 border-red-500/30 text-white placeholder:text-zinc-600'
                }`}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
              {minVal !== '' && (
                <button
                  type="button"
                  onClick={() => setMinVal('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 ${
                    isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Maximum input */}
          <div className={`p-3 rounded-xl space-y-1.5 border ${
            isLight ? 'bg-amber-500/[0.05] border-yellow-500/20' : 'bg-amber-950/20 border-yellow-500/25'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                Maximum Threshold (Yellow Alert)
              </label>
              <span className="text-[7.5px] font-mono text-amber-500/80 uppercase">Value &gt; Max</span>
            </div>
            <p className={`text-[7.5px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              When value exceeds this number, text turns yellow with a flashing yellow dot and pushes a notification.
            </p>
            <div className="relative">
              <input
                type="number"
                value={maxVal}
                onChange={e => setMaxVal(e.target.value)}
                placeholder="No maximum (optional)"
                className={`w-full rounded-lg px-3 py-2 text-[11px] font-mono transition-colors focus:outline-none focus:border-yellow-400 border ${
                  isLight
                    ? 'bg-white border-yellow-500/30 text-zinc-900 placeholder:text-zinc-400'
                    : 'bg-black/60 border-yellow-500/30 text-white placeholder:text-zinc-600'
                }`}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
              {maxVal !== '' && (
                <button
                  type="button"
                  onClick={() => setMaxVal('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 ${
                    isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className={`flex items-center justify-between pt-3 border-t ${isLight ? 'border-black/5' : 'border-white/10'}`}>
          <button
            type="button"
            onClick={handleClear}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[8.5px] font-bold uppercase transition-colors cursor-pointer ${
              isLight
                ? 'border-black/10 text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
                : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RotateCcw size={11} />
            Clear
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg text-[8.5px] font-bold uppercase transition-colors cursor-pointer ${
                isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[8.5px] font-black uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer"
            >
              <Check size={12} />
              Save Trigger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdModal;
