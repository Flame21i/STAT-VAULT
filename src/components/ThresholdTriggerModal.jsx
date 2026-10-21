import React, { useState, useEffect, memo } from 'react';
import { X, SlidersHorizontal, AlertTriangle, Check, Trash2, Bell } from 'lucide-react';

/**
 * ThresholdTriggerModal
 * Configures threshold triggers for individual or global stats/entities.
 * - Minimum input triggers RED alert and pushes a notification when value < min.
 * - Maximum input triggers YELLOW alert and pushes a notification when value > max.
 * - Non-darkening, non-blurring transparent backdrop.
 */
const ThresholdTriggerModal = memo(({
  isOpen,
  onClose,
  targetType, // 'filter-global' | 'filter-stat' | 'entity-global' | 'entity-single'
  targetTitle,
  initialThreshold = { min: '', max: '', enabled: false },
  onSave,
  onClear,
}) => {
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMinVal(initialThreshold?.min !== undefined && initialThreshold?.min !== null ? String(initialThreshold.min) : '');
      setMaxVal(initialThreshold?.max !== undefined && initialThreshold?.max !== null ? String(initialThreshold.max) : '');
      setEnabled(Boolean(initialThreshold?.enabled));
    }
  }, [isOpen, initialThreshold]);

  if (!isOpen) return null;

  const handleApply = (e) => {
    e?.preventDefault();
    const parsedMin = minVal.trim() === '' ? null : Number(minVal);
    const parsedMax = maxVal.trim() === '' ? null : Number(maxVal);

    onSave({
      min: parsedMin !== null && !isNaN(parsedMin) ? parsedMin : null,
      max: parsedMax !== null && !isNaN(parsedMax) ? parsedMax : null,
      enabled: enabled || (parsedMin !== null || parsedMax !== null),
    });
    onClose();
  };

  const handleReset = () => {
    setMinVal('');
    setMaxVal('');
    setEnabled(false);
    onClear?.();
    onClose();
  };

  return (
    <>
      {/* Transparent backdrop - no darkening or blurring */}
      <div
        className="fixed inset-0 z-[499] bg-transparent pointer-events-auto"
        onClick={onClose}
      />

      {/* Floating Modal */}
      <div
        className="fixed z-[500] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0c0c0c] border border-white/20 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.98)] p-5 w-[92vw] max-w-md flex flex-col animate-scale-in select-none font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-sm">
              <SlidersHorizontal size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase text-white tracking-widest">
                  THRESHOLD TRIGGER
                </span>
                <span className="px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase bg-white/5 text-zinc-400 border border-white/10">
                  {targetType?.includes('global') ? 'GLOBAL' : 'INDIVIDUAL'}
                </span>
              </div>
              <p className="text-[8px] text-rose-400 font-bold uppercase tracking-wider truncate max-w-[260px]">
                {targetTitle || 'Target Parameters'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Description Banner */}
        <div className="my-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1 text-[8px] text-zinc-400">
          <div className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            <span>MINIMUM LIMIT: Value &lt; min triggers RED alert &amp; notification</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
            <span>MAXIMUM LIMIT: Value &gt; max triggers YELLOW alert &amp; notification</span>
          </div>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleApply} className="space-y-3.5">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div>
              <span className="text-[9px] font-bold uppercase text-zinc-300 block">
                Enable Trigger
              </span>
              <span className="text-[7.5px] text-zinc-500 uppercase">
                Active alerts and visual notifications
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(prev => !prev)}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                enabled ? 'bg-rose-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Minimum Input (Triggers RED) */}
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-red-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-black uppercase text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                MINIMUM THRESHOLD (RED)
              </label>
              <span className="text-[7.5px] text-zinc-500 uppercase">Alert if &lt; min</span>
            </div>
            <input
              type="number"
              step="any"
              placeholder="e.g. 25 (triggers RED alert)"
              value={minVal}
              onChange={e => setMinVal(e.target.value)}
              className="w-full bg-[#111111] border border-red-500/30 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-white placeholder-zinc-700 outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Maximum Input (Triggers YELLOW) */}
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                MAXIMUM THRESHOLD (YELLOW)
              </label>
              <span className="text-[7.5px] text-zinc-500 uppercase">Alert if &gt; max</span>
            </div>
            <input
              type="number"
              step="any"
              placeholder="e.g. 80 (triggers YELLOW alert)"
              value={maxVal}
              onChange={e => setMaxVal(e.target.value)}
              className="w-full bg-[#111111] border border-amber-500/30 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-white placeholder-zinc-700 outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[8px] font-black uppercase bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                <Check size={12} />
                <span>Save Trigger</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
});

ThresholdTriggerModal.displayName = 'ThresholdTriggerModal';
export default ThresholdTriggerModal;
