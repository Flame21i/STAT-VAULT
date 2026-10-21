/**
 * Statistical Analysis & Calculations Suite
 * Provides descriptive statistics, normalization transforms, and correlation analysis.
 */

// Helper to filter valid numbers
function getCleanNumbers(values) {
  return values
    .map(v => (typeof v === 'number' && !isNaN(v) && isFinite(v) ? v : null))
    .filter(v => v !== null);
}

/**
 * Calculates comprehensive descriptive statistics for an array of numbers.
 */
export function calculateDescriptiveStats(rawValues) {
  const nums = getCleanNumbers(rawValues).sort((a, b) => a - b);
  const n = nums.length;

  if (n === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      range: 0,
      stdDev: 0,
      variance: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      sum: 0,
    };
  }

  const sum = nums.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

  // Variance & Standard Deviation
  const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);

  // Quartiles
  const getPercentile = (p) => {
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (nums[base + 1] !== undefined) {
      return nums[base] + rest * (nums[base + 1] - nums[base]);
    }
    return nums[base];
  };

  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;

  const min = nums[0];
  const max = nums[n - 1];
  const range = max - min;

  const round = (num) => Math.round(num * 100) / 100;

  return {
    count: n,
    mean: round(mean),
    median: round(median),
    min: round(min),
    max: round(max),
    range: round(range),
    stdDev: round(stdDev),
    variance: round(variance),
    q1: round(q1),
    q3: round(q3),
    iqr: round(iqr),
    sum: round(sum),
  };
}

/**
 * Normalizes an array of values based on the selected normalization mode:
 * - 'raw': returns original values
 * - 'minmax': scales to [0, 100]% (x - min) / (max - min) * 100
 * - 'zscore': scales to standard deviations (x - mean) / stdDev
 */
export function normalizeValues(values, mode = 'raw') {
  if (mode === 'raw') return values;

  const stats = calculateDescriptiveStats(values);
  if (stats.count === 0) return values;

  if (mode === 'minmax') {
    const range = stats.max - stats.min;
    if (range === 0) return values.map(() => 50); // Center if identical
    return values.map(v => {
      if (typeof v !== 'number' || isNaN(v)) return v;
      return Math.round(((v - stats.min) / range) * 100 * 10) / 10;
    });
  }

  if (mode === 'zscore') {
    const s = stats.stdDev || 1;
    return values.map(v => {
      if (typeof v !== 'number' || isNaN(v)) return v;
      return Math.round(((v - stats.mean) / s) * 100) / 100;
    });
  }

  return values;
}

/**
 * Calculates Pearson Correlation Coefficient (r) between two numeric arrays.
 * r ranges from -1.0 (perfect negative) to +1.0 (perfect positive).
 */
export function calculatePearsonCorrelation(arrA, arrB) {
  const pairs = [];
  for (let i = 0; i < Math.min(arrA.length, arrB.length); i++) {
    const a = arrA[i];
    const b = arrB[i];
    if (typeof a === 'number' && !isNaN(a) && typeof b === 'number' && !isNaN(b)) {
      pairs.push([a, b]);
    }
  }

  const n = pairs.length;
  if (n < 2) return 0;

  const sumA = pairs.reduce((acc, p) => acc + p[0], 0);
  const sumB = pairs.reduce((acc, p) => acc + p[1], 0);
  const meanA = sumA / n;
  const meanB = sumB / n;

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (const [a, b] of pairs) {
    const diffA = a - meanA;
    const diffB = b - meanB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }

  const denominator = Math.sqrt(denomA * denomB);
  if (denominator === 0) return 0;

  return Math.round((numerator / denominator) * 100) / 100;
}

/**
 * Computes the full Pearson correlation matrix between all active stats across entities.
 */
export function calculateCorrelationMatrix(entities, stats) {
  const activeStats = stats.filter(s => s.visible !== false);
  const matrix = {};

  for (const statA of activeStats) {
    matrix[statA.id] = {};
    const valuesA = entities.map(e => e.values[statA.id]);

    for (const statB of activeStats) {
      if (statA.id === statB.id) {
        matrix[statA.id][statB.id] = 1;
      } else if (matrix[statB.id] && matrix[statB.id][statA.id] !== undefined) {
        matrix[statA.id][statB.id] = matrix[statB.id][statA.id];
      } else {
        const valuesB = entities.map(e => e.values[statB.id]);
        matrix[statA.id][statB.id] = calculatePearsonCorrelation(valuesA, valuesB);
      }
    }
  }

  return { activeStats, matrix };
}
