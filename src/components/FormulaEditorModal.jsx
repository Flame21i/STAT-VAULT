import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calculator, X, Check, AlertCircle, Sparkles, Plus,
  Sigma, User,
} from 'lucide-react';
import {
  validateFormula,
  FORMULA_PRESETS,
} from '../utils/formulaEngine.js';
import { evaluateMathExpression } from '../utils/mathParser.js';
import CalculationAutocomplete from './CalculationAutocomplete.jsx';

export default function FormulaEditorModal({
  stat,
  allStats,
  allEntities = [],
  selectedEntity,
  onSave,
  onClose,
  theme = 'dark',
}) {
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.classList.contains('light'));
  const [isFormula, setIsFormula] = useState(stat?.isFormula ?? true);
  const [formula, setFormula] = useState(stat?.formula ?? '');
  const [cursorPos, setCursorPos] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeTab, setActiveTab] = useState('parameters'); // 'parameters' | 'entities' | 'aggregates' | 'presets'
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const otherStats = useMemo(() => {
    return (allStats || []).filter(s => s.id !== stat?.id);
  }, [allStats, stat?.id]);

  // Real-time formula validation
  const validation = useMemo(() => {
    if (!isFormula) return { valid: true, error: null, dependencies: [] };
    return validateFormula(formula, stat?.id, allStats, allEntities);
  }, [formula, isFormula, stat?.id, allStats, allEntities]);

  // Compute live preview for current selected entity
  const livePreview = useMemo(() => {
    if (!isFormula || !validation.valid || !selectedEntity) return null;

    // Build context
    const context = {};

    // 1. Local stats
    allStats.forEach(s => {
      const val = selectedEntity.values[s.id];
      const num = typeof val === 'number' && !isNaN(val) ? val : 0;
      context[s.id] = num;
      context[s.name] = num;
    });

    // 2. Cross-entity lookups
    allEntities.forEach(ent => {
      let entTotal = 0;
      allStats.forEach(s => {
        const v = ent.values[s.id];
        const num = typeof v === 'number' && !isNaN(v) ? v : 0;
        entTotal += num;
        context[`${ent.name}.${s.name}`] = num;
        context[`${ent.name}.${s.id}`] = num;
        context[`${ent.id}.${s.name}`] = num;
        context[`${ent.id}.${s.id}`] = num;
      });
      context[`${ent.name}.TOTAL`] = entTotal;
      context[`${ent.id}.TOTAL`] = entTotal;
    });

    // 3. Global aggregates
    allStats.forEach(s => {
      const vals = allEntities
        .map(e => e.values[s.id])
        .filter(v => typeof v === 'number' && !isNaN(v));

      const count = vals.length || 1;
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / count : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const min = vals.length ? Math.min(...vals) : 0;

      const prefixes = [s.id, s.name];
      prefixes.forEach(p => {
        context[`AVG_ALL_${p}`] = avg;
        context[`MAX_ALL_${p}`] = max;
        context[`MIN_ALL_${p}`] = min;
        context[`SUM_ALL_${p}`] = sum;
      });
    });

    const res = evaluateMathExpression(formula, 0, context);
    return res.success ? res.result : null;
  }, [isFormula, validation.valid, formula, selectedEntity, allStats, allEntities]);

  const insertText = (snippet) => {
    const el = inputRef.current;
    if (!el) {
      setFormula(prev => prev + snippet);
      return;
    }
    const start = el.selectionStart || formula.length;
    const end = el.selectionEnd || formula.length;
    const next = formula.substring(0, start) + snippet + formula.substring(end);
    setFormula(next);
    setTimeout(() => {
      el.focus();
      const newPos = start + snippet.length;
      el.setSelectionRange(newPos, newPos);
      setCursorPos(newPos);
    }, 0);
  };

  const applyPreset = (preset) => {
    const names = otherStats.map(s => s.name);
    const entityNames = allEntities.map(e => e.name);
    const generated = preset.generate(names, entityNames);
    setFormula(generated);
    setIsFormula(true);
    inputRef.current?.focus();
  };

  const handleSave = () => {
    if (isFormula && !validation.valid) return;
    onSave({
      ...stat,
      isFormula,
      formula: isFormula ? formula.trim() : null,
    });
    onClose();
  };

  const updateCursor = (e) => {
    const pos = e.target.selectionStart || 0;
    setCursorPos(pos);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`rounded-xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border ${
          isLight
            ? 'bg-white border-black/10 shadow-[0_25px_60px_rgba(0,0,0,0.4),0_10px_25px_rgba(0,0,0,0.25)] text-zinc-900'
            : 'bg-[#111111] border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.98)] text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'bg-black/[0.02] border-black/5' : 'bg-black/30 border-white/5'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Calculator size={14} />
            </div>
            <div>
              <h2 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Formula Configuration & Cross-Entity Engine
                <span className="text-[8px] font-mono font-normal text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  {stat?.name}
                </span>
              </h2>
              <p className={`text-[9px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Create formulas referencing parameters, baseline entities (e.g. ENT_01), or global averages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Mode Switcher */}
          <div className={`flex rounded-lg p-1 gap-1 border ${isLight ? 'bg-black/[0.04] border-black/5' : 'bg-black/40 border-white/5'}`}>
            <button
              type="button"
              onClick={() => setIsFormula(true)}
              className={`flex-1 py-1.5 px-3 rounded text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isFormula
                  ? isLight ? 'bg-rose-500/20 text-rose-700 border border-rose-500/30 shadow-xs' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                  : isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Calculator size={11} />
              <span>Computed / Formula (fx)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFormula(false)}
              className={`flex-1 py-1.5 px-3 rounded text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isFormula
                  ? isLight ? 'bg-white text-zinc-900 border border-black/10 shadow-xs' : 'bg-white/10 text-white border border-white/20 shadow-xs'
                  : isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>Manual Input (Slider)</span>
            </button>
          </div>

          {isFormula ? (
            <div className="space-y-3.5">
              {/* Formula Input with Autocomplete Container */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between text-[9px]">
                  <label className="font-bold uppercase tracking-wider text-zinc-400">
                    Formula Expression
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAutocomplete(prev => !prev)}
                      className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                        showAutocomplete
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <Sparkles size={9} />
                      <span>Autocomplete ({showAutocomplete ? 'ON' : 'OFF'})</span>
                    </button>
                    <span className="text-[8px] font-mono text-zinc-500">
                      Type @ or [ to autocomplete
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={formula}
                    onChange={e => {
                      setFormula(e.target.value);
                      updateCursor(e);
                      setShowAutocomplete(true);
                    }}
                    onFocus={e => {
                      updateCursor(e);
                      setShowAutocomplete(true);
                    }}
                    onClick={updateCursor}
                    onKeyUp={updateCursor}
                    placeholder="e.g. [ATK] - ENT_01.ATK  or  ([ATK] / AVG(ATK)) * 100"
                    className={`w-full bg-black/50 border rounded-lg px-3 py-2.5 text-xs font-mono font-bold text-white placeholder-zinc-700 outline-none transition-all ${
                      validation.valid
                        ? 'border-emerald-500/40 focus:border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                        : 'border-amber-500/40 focus:border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                    }`}
                  />
                  {formula && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormula('');
                        inputRef.current?.focus();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 p-1"
                    >
                      <X size={12} />
                    </button>
                  )}

                  {/* Autocomplete dropdown anchored to formula input */}
                  <CalculationAutocomplete
                    inputRef={inputRef}
                    value={formula}
                    cursorPos={cursorPos}
                    allStats={allStats}
                    allEntities={allEntities}
                    currentEntity={selectedEntity}
                    isOpen={showAutocomplete}
                    onClose={() => setShowAutocomplete(false)}
                    onSelect={(newText, newPos) => {
                      setFormula(newText);
                      setCursorPos(newPos);
                      setShowAutocomplete(false);
                      setTimeout(() => {
                        inputRef.current?.focus();
                        inputRef.current?.setSelectionRange(newPos, newPos);
                      }, 0);
                    }}
                  />
                </div>

                {/* Status & Preview Bar */}
                <div className="flex items-center justify-between min-h-[22px] px-1 text-[8.5px] font-mono">
                  {validation.valid ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check size={11} className="shrink-0" />
                      <span>Syntax Valid</span>
                      {livePreview !== null && selectedEntity && (
                        <span className="text-zinc-400 ml-1">
                          • Preview ({selectedEntity.name}): <strong className="text-white font-bold">{livePreview}</strong>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <AlertCircle size={11} className="shrink-0" />
                      <span>{validation.error}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Tabs for Insertion Helpers */}
              <div className="flex border-b border-white/5 gap-2 text-[8px] font-mono uppercase">
                <button
                  type="button"
                  onClick={() => setActiveTab('parameters')}
                  className={`pb-1 border-b-2 font-bold transition-colors cursor-pointer ${
                    activeTab === 'parameters'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Parameters ({otherStats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('entities')}
                  className={`pb-1 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'entities'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <User size={9} />
                  <span>Cross-Entity ({allEntities.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('aggregates')}
                  className={`pb-1 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'aggregates'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Sigma size={9} />
                  <span>Global Aggregates</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`pb-1 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === 'presets'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Sparkles size={9} />
                  <span>Presets ({FORMULA_PRESETS.length})</span>
                </button>
              </div>

              {/* Tab 1: Parameters */}
              {activeTab === 'parameters' && (
                <div className="space-y-1.5 bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <div className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Click to insert parameter</span>
                    <span className="font-mono text-[7px] text-zinc-600">{otherStats.length} Available</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {otherStats.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => insertText(`[${s.name}]`)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 text-[8.5px] font-mono font-bold text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={9} className="opacity-60" />
                        <span>[{s.name}]</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Cross-Entity References */}
              {activeTab === 'entities' && (
                <div className="space-y-1.5 bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <div className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">
                    Insert baseline entity parameter or total
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                    {allEntities.map(ent => (
                      <React.Fragment key={ent.id}>
                        <button
                          type="button"
                          onClick={() => insertText(`${ent.name}.TOTAL`)}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/5 text-[8.5px] font-mono font-bold text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ent.color }} />
                          <span>{ent.name}.TOTAL</span>
                        </button>
                        {allStats.slice(0, 2).map(s => (
                          <button
                            key={`${ent.id}_${s.id}`}
                            type="button"
                            onClick={() => insertText(`${ent.name}.${s.name}`)}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/5 text-[8.5px] font-mono text-zinc-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ent.color }} />
                            <span>{ent.name}.{s.name}</span>
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Global Aggregates */}
              {activeTab === 'aggregates' && (
                <div className="space-y-1.5 bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <div className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">
                    Global metrics across all entities
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {allStats.slice(0, 4).map(s => (
                      <React.Fragment key={s.id}>
                        <button
                          type="button"
                          onClick={() => insertText(`AVG([${s.name}])`)}
                          className="p-1.5 text-left rounded bg-white/[0.03] hover:bg-indigo-500/10 hover:border-indigo-500/30 border border-white/5 transition-all cursor-pointer"
                        >
                          <div className="text-[8px] font-bold text-indigo-300">AVG({s.name})</div>
                          <div className="text-[7px] text-zinc-600">Global average of {s.name}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertText(`MAX([${s.name}])`)}
                          className="p-1.5 text-left rounded bg-white/[0.03] hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/5 transition-all cursor-pointer"
                        >
                          <div className="text-[8px] font-bold text-emerald-300">MAX({s.name})</div>
                          <div className="text-[7px] text-zinc-600">Maximum of {s.name}</div>
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Formula Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-1.5 bg-black/30 p-2.5 rounded-lg border border-white/5">
                  <div className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} className="text-rose-400" />
                    <span>Quick Presets & Cross-Entity Formulas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                    {FORMULA_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="p-1.5 text-left rounded bg-white/[0.03] hover:bg-rose-500/10 hover:border-rose-500/30 border border-white/5 transition-all cursor-pointer group"
                      >
                        <div className="text-[8px] font-bold text-zinc-300 group-hover:text-rose-300 flex items-center justify-between">
                          <span>{preset.name}</span>
                          <span className="text-[6.5px] px-1 py-0.2 rounded bg-white/5 text-zinc-500 font-mono">
                            {preset.category}
                          </span>
                        </div>
                        <div className="text-[7px] text-zinc-600 truncate">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Operators & Math Function Pills */}
              <div className="space-y-1 bg-black/20 p-2 rounded-lg border border-white/5">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[7px] font-bold text-zinc-600 uppercase mr-1">Operators:</span>
                  {[' + ', ' - ', ' * ', ' / ', ' ^ ', '(', ')'].map(op => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => insertText(op)}
                      className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[8.5px] font-mono font-bold text-zinc-300 transition-colors cursor-pointer"
                    >
                      {op.trim()}
                    </button>
                  ))}
                  <span className="text-[7px] font-bold text-zinc-600 uppercase mx-1">Functions:</span>
                  {['sqrt(', 'round(', 'abs(', 'delta(', 'avg(', 'max(', 'min('].map(fn => (
                    <button
                      key={fn}
                      type="button"
                      onClick={() => insertText(fn)}
                      className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[8px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {fn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-center space-y-2">
              <p className="text-[9px] text-zinc-400">
                This parameter is configured as a <strong className="text-white">Manual Input</strong>.
              </p>
              <p className="text-[8px] text-zinc-600">
                Users can edit its values freely using the slider and text input.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-3 border-t flex items-center justify-between shrink-0 ${isLight ? 'bg-black/[0.02] border-black/5' : 'bg-black/40 border-white/5'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer ${
              isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isFormula && !validation.valid}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 ${
              isFormula && !validation.valid
                ? isLight ? 'opacity-40 cursor-not-allowed bg-zinc-200 text-zinc-400' : 'opacity-40 cursor-not-allowed bg-zinc-800 text-zinc-500'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50 cursor-pointer'
            }`}
          >
            <Check size={12} />
            <span>Apply Formula</span>
          </button>
        </div>
      </div>
    </div>
  );
}
