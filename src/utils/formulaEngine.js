/**
 * Cross-Stat & Cross-Entity Formula Engine
 * Handles dependency resolution, cycle detection, topological sorting,
 * cross-entity lookups, global aggregates (AVG, MAX, MIN, SUM), and reactive evaluation.
 */

import { evaluateMathExpression, extractFormulaVariables } from './mathParser.js';

/**
 * Resolve a variable name/token to a stat ID, cross-entity reference, or global aggregate.
 */
export function resolveVariableToStatId(varName, allStats, allEntities = []) {
  if (!varName || !allStats) return null;
  const cleanVar = varName.trim();
  const lowerVar = cleanVar.toLowerCase();
  const normalizedVar = lowerVar.replace(/[\s_-]+/g, '');

  // 1. Direct ID match
  const byId = allStats.find(s => s.id.toLowerCase() === lowerVar);
  if (byId) return byId.id;

  // 2. Direct Name match
  const byName = allStats.find(s => s.name.toLowerCase() === lowerVar);
  if (byName) return byName.id;

  // 3. Normalized Name match
  const byNorm = allStats.find(s => s.name.toLowerCase().replace(/[\s_-]+/g, '') === normalizedVar);
  if (byNorm) return byNorm.id;

  // 4. Global aggregate shorthand: (AVG|MAX|MIN|SUM|MEDIAN)_ALL_<STAT>
  const aggMatch = cleanVar.match(/^(AVG|MAX|MIN|SUM|MEDIAN)_ALL_(.+)$/i);
  if (aggMatch) {
    const statPart = aggMatch[2];
    const resolvedStat = resolveVariableToStatId(statPart, allStats, allEntities);
    if (resolvedStat) return `AGG_${resolvedStat}`;
  }

  // 5. Cross-entity reference: <ENTITY>.<STAT_OR_TOTAL>
  if (cleanVar.includes('.')) {
    const parts = cleanVar.split('.');
    if (parts.length === 2) {
      const entName = parts[0].trim().toLowerCase();
      const statName = parts[1].trim().toLowerCase();

      const matchedEntity = allEntities.length === 0 || allEntities.some(
        e => e.id.toLowerCase() === entName || e.name.toLowerCase() === entName
      );

      if (matchedEntity) {
        if (statName === 'total' || statName === 'sum') {
          return `ENTITY_REF_${parts[0]}_TOTAL`;
        }
        const resolvedStat = resolveVariableToStatId(statName, allStats);
        if (resolvedStat) {
          return `ENTITY_REF_${parts[0]}_${resolvedStat}`;
        }
      }
    }
  }

  return null;
}

/**
 * Detect cycles in stat dependency graph using DFS.
 */
export function detectCycles(graph) {
  const visited = new Set();
  const recStack = new Set();
  const cyclicNodes = new Set();

  function dfs(node, path = []) {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = graph[node] || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (recStack.has(neighbor)) {
        const cycleStartIndex = path.indexOf(neighbor);
        const cyclePath = cycleStartIndex >= 0 ? path.slice(cycleStartIndex) : [neighbor, node];
        cyclePath.forEach(n => cyclicNodes.add(n));
      }
    }

    recStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return Array.from(cyclicNodes);
}

/**
 * Topologically sort formula stats so dependencies are computed before dependents.
 */
export function sortStatsTopologically(formulaStats, depGraph, cyclicIds) {
  const cyclicSet = new Set(cyclicIds);
  const validFormulaStats = formulaStats.filter(s => !cyclicSet.has(s.id));
  const visited = new Set();
  const sorted = [];

  function visit(node) {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    const deps = depGraph[node.id] || new Set();
    for (const depId of deps) {
      const depStat = validFormulaStats.find(s => s.id === depId);
      if (depStat && !visited.has(depStat.id)) {
        visit(depStat);
      }
    }

    sorted.push(node);
  }

  for (const stat of validFormulaStats) {
    visit(stat);
  }

  return sorted;
}

/**
 * Validate a formula for syntax, unknown references, self-references, cross-entity, and cycles.
 */
export function validateFormula(formula, currentStatId, allStats, allEntities = []) {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    return { valid: false, error: 'Formula cannot be empty', dependencies: [] };
  }

  const rawVars = extractFormulaVariables(formula);
  const resolvedDeps = [];
  const unknownVars = [];

  for (const v of rawVars) {
    const resolvedId = resolveVariableToStatId(v, allStats, allEntities);
    if (!resolvedId) {
      unknownVars.push(v);
    } else {
      resolvedDeps.push(resolvedId);
    }
  }

  if (unknownVars.length > 0) {
    return {
      valid: false,
      error: `Unknown parameter or entity: ${unknownVars.join(', ')}`,
      dependencies: resolvedDeps,
    };
  }

  // Check direct self-reference
  if (resolvedDeps.includes(currentStatId)) {
    return {
      valid: false,
      error: 'Cannot reference itself (circular dependency)',
      dependencies: resolvedDeps,
    };
  }

  // Build temporary dependency graph to test for indirect cycles
  const tempGraph = {};
  for (const s of allStats) {
    if (s.id === currentStatId) {
      tempGraph[s.id] = new Set(resolvedDeps.filter(d => !d.startsWith('AGG_') && !d.startsWith('ENTITY_REF_')));
    } else if (s.isFormula && s.formula) {
      const deps = extractFormulaVariables(s.formula)
        .map(v => resolveVariableToStatId(v, allStats, allEntities))
        .filter(d => d && !d.startsWith('AGG_') && !d.startsWith('ENTITY_REF_'));
      tempGraph[s.id] = new Set(deps);
    } else {
      tempGraph[s.id] = new Set();
    }
  }

  const cycles = detectCycles(tempGraph);
  if (cycles.includes(currentStatId)) {
    return {
      valid: false,
      error: 'Circular dependency detected (#CYCLE!)',
      dependencies: resolvedDeps,
    };
  }

  // Syntax check with mock context
  const mockContext = {};
  for (const s of allStats) {
    mockContext[s.id] = 10;
    mockContext[s.name] = 10;
    mockContext[`AVG_ALL_${s.name}`] = 10;
    mockContext[`AVG_ALL_${s.id}`] = 10;
    mockContext[`MAX_ALL_${s.name}`] = 10;
    mockContext[`MIN_ALL_${s.name}`] = 10;
    mockContext[`SUM_ALL_${s.name}`] = 10;
    mockContext[`MEDIAN_ALL_${s.name}`] = 10;
  }
  for (const e of allEntities) {
    mockContext[`${e.name}.TOTAL`] = 100;
    mockContext[`${e.id}.TOTAL`] = 100;
    for (const s of allStats) {
      mockContext[`${e.name}.${s.name}`] = 10;
      mockContext[`${e.name}.${s.id}`] = 10;
      mockContext[`${e.id}.${s.name}`] = 10;
      mockContext[`${e.id}.${s.id}`] = 10;
    }
  }

  const evalCheck = evaluateMathExpression(formula, 10, mockContext);
  if (!evalCheck.success) {
    return {
      valid: false,
      error: evalCheck.error || 'Invalid syntax',
      dependencies: resolvedDeps,
    };
  }

  return {
    valid: true,
    error: null,
    dependencies: resolvedDeps,
  };
}

/**
 * Evaluates all derived/formula stats across all entities in topological order.
 * Populates local stats, cross-entity lookups, and global aggregates.
 */
export function computeEntitiesWithFormulas(entities, stats) {
  if (!entities || !stats) return entities;

  const formulaStats = stats.filter(s => s.isFormula && s.formula && s.formula.trim() !== '');
  if (formulaStats.length === 0) return entities;

  // Build dependency graph
  const depGraph = {};
  for (const stat of stats) {
    depGraph[stat.id] = new Set();
  }

  for (const fStat of formulaStats) {
    const rawVars = extractFormulaVariables(fStat.formula);
    for (const v of rawVars) {
      const resolvedId = resolveVariableToStatId(v, stats, entities);
      if (resolvedId && !resolvedId.startsWith('AGG_') && !resolvedId.startsWith('ENTITY_REF_')) {
        depGraph[fStat.id].add(resolvedId);
      }
    }
  }

  const cyclicIds = detectCycles(depGraph);
  const orderedFormulaStats = sortStatsTopologically(formulaStats, depGraph, cyclicIds);

  // 1. Calculate global aggregates across all entities for base stats
  const globalAggregates = {};
  for (const stat of stats) {
    const vals = entities
      .map(e => e.values[stat.id])
      .filter(v => typeof v === 'number' && !isNaN(v));

    const count = vals.length || 1;
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = vals.length ? sum / count : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    const min = vals.length ? Math.min(...vals) : 0;

    let median = 0;
    if (vals.length) {
      const sorted = [...vals].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    const prefixes = [stat.id, stat.name];
    for (const p of prefixes) {
      globalAggregates[`AVG_ALL_${p}`] = avg;
      globalAggregates[`MAX_ALL_${p}`] = max;
      globalAggregates[`MIN_ALL_${p}`] = min;
      globalAggregates[`SUM_ALL_${p}`] = sum;
      globalAggregates[`MEDIAN_ALL_${p}`] = median;
    }
  }

  // 2. Pre-calculate cross-entity lookups
  const crossEntityLookups = {};
  for (const ent of entities) {
    let entTotal = 0;
    for (const stat of stats) {
      const v = ent.values[stat.id];
      const num = typeof v === 'number' && !isNaN(v) ? v : 0;
      entTotal += num;

      crossEntityLookups[`${ent.name}.${stat.name}`] = num;
      crossEntityLookups[`${ent.name}.${stat.id}`] = num;
      crossEntityLookups[`${ent.id}.${stat.name}`] = num;
      crossEntityLookups[`${ent.id}.${stat.id}`] = num;
    }
    crossEntityLookups[`${ent.name}.TOTAL`] = entTotal;
    crossEntityLookups[`${ent.id}.TOTAL`] = entTotal;
  }

  // 3. Evaluate each entity in topological order
  return entities.map(entity => {
    const values = { ...entity.values };

    // Build context with current entity values + aggregates + cross-entity lookups
    const context = {
      ...globalAggregates,
      ...crossEntityLookups,
    };

    for (const stat of stats) {
      const val = values[stat.id];
      const num = typeof val === 'number' && !isNaN(val) ? val : 0;
      context[stat.id] = num;
      context[stat.name] = num;
    }

    // Mark cyclic stats with null
    for (const cycleId of cyclicIds) {
      values[cycleId] = null;
    }

    // Evaluate in topological order
    for (const fStat of orderedFormulaStats) {
      // Re-populate context for previously evaluated formulas
      for (const key of Object.keys(values)) {
        const val = values[key];
        const num = typeof val === 'number' && !isNaN(val) ? val : 0;
        context[key] = num;
        const matchingStat = stats.find(s => s.id === key);
        if (matchingStat) {
          context[matchingStat.name] = num;
        }
      }

      const evalResult = evaluateMathExpression(fStat.formula, 0, context);
      if (evalResult.success && typeof evalResult.result === 'number' && !isNaN(evalResult.result)) {
        values[fStat.id] = evalResult.result;
        context[fStat.id] = evalResult.result;
        context[fStat.name] = evalResult.result;
      } else {
        values[fStat.id] = null;
      }
    }

    return {
      ...entity,
      values,
    };
  });
}

/**
 * Built-in formula template presets including cross-entity & global calculations
 */
export const FORMULA_PRESETS = [
  {
    id: 'sum',
    name: 'Sum of Parameters',
    category: 'Basic',
    description: 'Adds up selected parameters',
    generate: (statNames) => statNames.slice(0, 3).map(n => `[${n}]`).join(' + '),
  },
  {
    id: 'average',
    name: 'Average (Mean)',
    category: 'Basic',
    description: 'Calculates the arithmetic mean of parameters',
    generate: (statNames) => {
      const selected = statNames.slice(0, 3);
      return `(${selected.map(n => `[${n}]`).join(' + ')}) / ${selected.length || 1}`;
    },
  },
  {
    id: 'product',
    name: 'Product / DPS',
    category: 'Basic',
    description: 'Multiplies two parameters (e.g. Attack * Speed)',
    generate: (statNames) => {
      const a = statNames[0] || 'STAT_01';
      const b = statNames[1] || 'STAT_02';
      return `[${a}] * [${b}]`;
    },
  },
  {
    id: 'ratio',
    name: 'Ratio / Quotient',
    category: 'Basic',
    description: 'Divides one parameter by another safely',
    generate: (statNames) => {
      const a = statNames[0] || 'STAT_01';
      const b = statNames[1] || 'STAT_02';
      return `[${a}] / max([${b}], 1)`;
    },
  },
  {
    id: 'delta_baseline',
    name: 'Delta vs Baseline Entity',
    category: 'Cross-Entity',
    description: 'Difference between this entity and baseline (e.g. ENT_01)',
    generate: (statNames, entityNames) => {
      const s = statNames[0] || 'STAT_01';
      const baseline = (entityNames && entityNames[0]) || 'ENT_01';
      return `[${s}] - ${baseline}.${s}`;
    },
  },
  {
    id: 'pct_baseline',
    name: '% of Baseline Entity',
    category: 'Cross-Entity',
    description: 'Value expressed as percentage of baseline entity',
    generate: (statNames, entityNames) => {
      const s = statNames[0] || 'STAT_01';
      const baseline = (entityNames && entityNames[0]) || 'ENT_01';
      return `([${s}] / max(${baseline}.${s}, 1)) * 100`;
    },
  },
  {
    id: 'pct_global_avg',
    name: '% of Global Average',
    category: 'Global Aggregates',
    description: 'Ratio relative to average across all entities',
    generate: (statNames) => {
      const s = statNames[0] || 'STAT_01';
      return `([${s}] / max(AVG([${s}]), 1)) * 100`;
    },
  },
  {
    id: 'normalized_max',
    name: 'Normalized to Best (0-100)',
    category: 'Global Aggregates',
    description: 'Normalized relative to the highest entity',
    generate: (statNames) => {
      const s = statNames[0] || 'STAT_01';
      return `([${s}] / max(MAX([${s}]), 1)) * 100`;
    },
  },
  {
    id: 'weighted',
    name: 'Weighted Composite',
    category: 'Composite',
    description: 'Weights two parameters 60% and 40%',
    generate: (statNames) => {
      const a = statNames[0] || 'STAT_01';
      const b = statNames[1] || 'STAT_02';
      return `[${a}] * 0.6 + [${b}] * 0.4`;
    },
  },
  {
    id: 'peak_max',
    name: 'Peak / Maximum',
    category: 'Composite',
    description: 'Highest value among parameters',
    generate: (statNames) => `max(${statNames.slice(0, 3).map(n => `[${n}]`).join(', ')})`,
  },
];
