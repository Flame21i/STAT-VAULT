/** Convert a hex colour string to an rgba() string. */
export const hexToRgba = (hex, alpha) => {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(255, 255, 255, ${alpha})`;
  }
};

/** Return a random hex colour string. */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/** Palette of distinct, harmonious colors for parameter components. */
export const STAT_PALETTE = [
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#eab308', // yellow
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
];

/**
 * Flags an individual metric value that falls outside a specified range.
 *
 * @param {number|string} value - The metric value to evaluate.
 * @param {number} [minThreshold=30] - Minimum acceptable threshold.
 * @param {number} [maxThreshold=85] - Maximum acceptable threshold.
 * @returns {{ isOutOfRange: boolean, type: 'low' | 'high' | null, diff: number, threshold: number | null }}
 */
export const flagMetricOutOfRange = (value, minThreshold = 30, maxThreshold = 85) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) {
    return { isOutOfRange: false, type: null, diff: 0, threshold: null };
  }
  const min = typeof minThreshold === 'number' ? minThreshold : 30;
  const max = typeof maxThreshold === 'number' ? maxThreshold : 85;

  if (num < min) {
    return {
      isOutOfRange: true,
      type: 'low',
      diff: Number((min - num).toFixed(1)),
      threshold: min,
    };
  }
  if (num > max) {
    return {
      isOutOfRange: true,
      type: 'high',
      diff: Number((num - max).toFixed(1)),
      threshold: max,
    };
  }
  return { isOutOfRange: false, type: null, diff: 0, threshold: null };
};

/**
 * Flags all metrics in the registry that fall outside a specified range.
 * Scans entities and their metric values, returning detailed summary metrics,
 * fast lookup maps, and query helper functions.
 *
 * @param {Array} entities - Entities in the registry.
 * @param {Array} stats - Metric definitions in the registry.
 * @param {{ min?: number, max?: number, enabled?: boolean }} [range={ min: 30, max: 85, enabled: true }]
 * @returns {{
 *   totalFlagged: number,
 *   flaggedEntitiesCount: number,
 *   entityFlags: Record<string, { count: number, lowCount: number, highCount: number, low: Array, high: Array, metrics: Record<string, Object> }>,
 *   metricFlags: Record<string, { count: number, lowCount: number, highCount: number, low: Array, high: Array }>,
 *   flaggedList: Array<{ entityId: string, entityName: string, entityColor: string, statId: string, statName: string, value: number, type: 'low'|'high', diff: number, threshold: number }>,
 *   isEntityFlagged: (entityId: string) => boolean,
 *   isMetricFlagged: (statId: string, entityId?: string) => boolean|Object,
 *   getEntityFlagCount: (entityId: string) => number,
 *   getMetricFlagCount: (statId: string) => number,
 * }}
 */
export const flagRegistryMetrics = (entities = [], stats = [], range = { min: 30, max: 85, enabled: true }) => {
  const min = typeof range?.min === 'number' ? range.min : 30;
  const max = typeof range?.max === 'number' ? range.max : 85;
  const isEnabled = range?.enabled !== false;

  const entityFlags = {};
  const metricFlags = {};
  const flaggedList = [];
  let totalFlagged = 0;

  // Initialize maps for all stats
  stats.forEach(stat => {
    metricFlags[stat.id] = {
      count: 0,
      lowCount: 0,
      highCount: 0,
      low: [],
      high: [],
    };
  });

  entities.forEach(entity => {
    entityFlags[entity.id] = {
      count: 0,
      lowCount: 0,
      highCount: 0,
      low: [],
      high: [],
      metrics: {},
    };

    stats.forEach(stat => {
      const val = entity.values?.[stat.id] ?? 0;
      const effectiveMin = typeof stat.min === 'number' && stat.min > 0 ? stat.min : min;
      const effectiveMax = typeof stat.max === 'number' && stat.max < 100 ? stat.max : max;
      const result = isEnabled ? flagMetricOutOfRange(val, effectiveMin, effectiveMax) : { isOutOfRange: false };

      if (result.isOutOfRange) {
        totalFlagged++;
        const flagItem = {
          entityId: entity.id,
          entityName: entity.name,
          entityColor: entity.color,
          statId: stat.id,
          statName: stat.name,
          value: val,
          type: result.type,
          diff: result.diff,
          threshold: result.threshold,
        };

        entityFlags[entity.id].count++;
        entityFlags[entity.id].metrics[stat.id] = result;
        if (result.type === 'low') {
          entityFlags[entity.id].lowCount++;
          entityFlags[entity.id].low.push(flagItem);
        } else {
          entityFlags[entity.id].highCount++;
          entityFlags[entity.id].high.push(flagItem);
        }

        if (metricFlags[stat.id]) {
          metricFlags[stat.id].count++;
          if (result.type === 'low') {
            metricFlags[stat.id].lowCount++;
            metricFlags[stat.id].low.push(flagItem);
          } else {
            metricFlags[stat.id].highCount++;
            metricFlags[stat.id].high.push(flagItem);
          }
        }

        flaggedList.push(flagItem);
      }
    });
  });

  const flaggedEntitiesCount = Object.values(entityFlags).filter(e => e.count > 0).length;

  return {
    totalFlagged,
    flaggedEntitiesCount,
    entityFlags,
    metricFlags,
    flaggedList,
    isEntityFlagged: (entityId) => (entityFlags[entityId]?.count || 0) > 0,
    isMetricFlagged: (statId, entityId) => {
      if (entityId) {
        return entityFlags[entityId]?.metrics?.[statId] || false;
      }
      return (metricFlags[statId]?.count || 0) > 0;
    },
    getEntityFlagCount: (entityId) => entityFlags[entityId]?.count || 0,
    getMetricFlagCount: (statId) => metricFlags[statId]?.count || 0,
  };
};

/**
 * Returns distinct styling configurations for highlighted out-of-range metrics in the data table and registry.
 */
export const getOutOfRangeStyle = (flagResult) => {
  if (!flagResult?.isOutOfRange) return null;
  if (flagResult.type === 'high') {
    return {
      bgColor: 'rgba(245, 158, 11, 0.32)',
      borderColor: '#f59e0b',
      textColor: '#fde047',
      badgeColor: '#f59e0b',
      badgeText: '▲ HIGH',
      label: `Exceeds upper threshold (${flagResult.threshold})`,
    };
  }
  return {
    bgColor: 'rgba(239, 68, 68, 0.32)',
    borderColor: '#ef4444',
    textColor: '#fca5a5',
    badgeColor: '#ef4444',
    badgeText: '▼ LOW',
    label: `Below lower threshold (${flagResult.threshold})`,
  };
};
