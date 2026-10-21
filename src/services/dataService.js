/**
 * Centralized Data Management Service
 * Manages entities, metrics, and historical comparison datasets with local persistence
 * and mock state object initialization.
 */

const STORAGE_KEY = 'statvault-pro-state';
const HISTORICAL_STORAGE_KEY = 'statvault-historical-datasets';

// Default pre-seeded metrics
export const DEFAULT_METRICS = [
  { id: 's1', name: 'VELOCITY', visible: false, editing: false, iconType: 'icon', iconName: 'Rocket', unit: 'pts' },
  { id: 's2', name: 'ACCURACY', visible: false, editing: false, iconType: 'icon', iconName: 'Target', unit: '%' },
  { id: 's3', name: 'STABILITY', visible: false, editing: false, iconType: 'icon', iconName: 'Shield', unit: 'idx' },
  { id: 's4', name: 'EFFICIENCY', visible: false, editing: false, iconType: 'icon', iconName: 'Cpu', unit: '%' },
  { id: 's5', name: 'RESILIENCE', visible: false, editing: false, iconType: 'icon', iconName: 'Flame', unit: 'lvl' },
  { id: 's6', name: 'CAPACITY', visible: false, editing: false, iconType: 'icon', iconName: 'Database', unit: 'GB' },
];

// Default pre-seeded entities
export const DEFAULT_ENTITIES = [
  { id: 'e1', name: 'ALPHA-01', visible: true, color: '#10b981', values: { s1: 85, s2: 90, s3: 75, s4: 65, s5: 80, s6: 70 } },
  { id: 'e2', name: 'BETA-02', visible: true, color: '#3b82f6', values: { s1: 65, s2: 85, s3: 90, s4: 95, s5: 60, s6: 75 } },
  { id: 'e3', name: 'GAMMA-03', visible: true, color: '#f59e0b', values: { s1: 90, s2: 70, s3: 60, s4: 80, s5: 85, s6: 90 } },
  { id: 'e4', name: 'DELTA-04', visible: true, color: '#ec4899', values: { s1: 45, s2: 60, s3: 85, s4: 70, s5: 90, s6: 80 } },
];

// Default pre-seeded historical comparison datasets
export const DEFAULT_HISTORICAL_DATASETS = [
  {
    id: 'hist-q1-baseline',
    name: 'Q1 Benchmark Baseline',
    date: '2026-01-15T09:00:00Z',
    description: 'Initial quarterly benchmarking run across all four core units.',
    entities: [
      { id: 'e1', name: 'ALPHA-01', color: '#10b981', values: { s1: 70, s2: 80, s3: 65, s4: 55, s5: 70, s6: 60 } },
      { id: 'e2', name: 'BETA-02', color: '#3b82f6', values: { s1: 55, s2: 75, s3: 80, s4: 85, s5: 50, s6: 65 } },
      { id: 'e3', name: 'GAMMA-03', color: '#f59e0b', values: { s1: 80, s2: 60, s3: 55, s4: 70, s5: 75, s6: 80 } },
      { id: 'e4', name: 'DELTA-04', color: '#ec4899', values: { s1: 40, s2: 50, s3: 75, s4: 60, s5: 80, s6: 70 } },
    ],
    metrics: DEFAULT_METRICS,
  },
  {
    id: 'hist-sprint-audit',
    name: 'Sprint 14 Audit Review',
    date: '2026-02-28T14:30:00Z',
    description: 'Mid-quarter stress test and performance calibration.',
    entities: [
      { id: 'e1', name: 'ALPHA-01', color: '#10b981', values: { s1: 80, s2: 85, s3: 70, s4: 60, s5: 75, s6: 68 } },
      { id: 'e2', name: 'BETA-02', color: '#3b82f6', values: { s1: 60, s2: 80, s3: 88, s4: 90, s5: 58, s6: 70 } },
      { id: 'e3', name: 'GAMMA-03', color: '#f59e0b', values: { s1: 88, s2: 68, s3: 58, s4: 75, s5: 80, s6: 85 } },
      { id: 'e4', name: 'DELTA-04', color: '#ec4899', values: { s1: 42, s2: 55, s3: 82, s4: 68, s5: 88, s6: 75 } },
    ],
    metrics: DEFAULT_METRICS,
  },
  {
    id: 'hist-target-goals',
    name: 'Target Threshold Goals (v2.0)',
    date: '2026-03-10T12:00:00Z',
    description: 'Target performance thresholds established for high-efficiency tier.',
    entities: [
      { id: 'e1', name: 'ALPHA-01', color: '#10b981', values: { s1: 95, s2: 95, s3: 85, s4: 80, s5: 90, s6: 85 } },
      { id: 'e2', name: 'BETA-02', color: '#3b82f6', values: { s1: 80, s2: 90, s3: 95, s4: 98, s5: 75, s6: 85 } },
      { id: 'e3', name: 'GAMMA-03', color: '#f59e0b', values: { s1: 95, s2: 85, s3: 75, s4: 90, s5: 90, s6: 95 } },
      { id: 'e4', name: 'DELTA-04', color: '#ec4899', values: { s1: 60, s2: 75, s3: 90, s4: 85, s5: 95, s6: 90 } },
    ],
    metrics: DEFAULT_METRICS,
  },
];

class DataManagementService {
  constructor() {
    this._listeners = new Set();
    this._state = this._loadInitialState();
    this._historicalDatasets = this._loadHistoricalDatasets();
  }

  // ─── Internal Storage Loaders ─────────────────────────────────────────────
  _loadInitialState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          entities: parsed.entities?.length ? parsed.entities : DEFAULT_ENTITIES,
          metrics: parsed.stats?.length ? parsed.stats : DEFAULT_METRICS,
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return {
      entities: DEFAULT_ENTITIES,
      metrics: DEFAULT_METRICS,
      lastUpdated: new Date().toISOString(),
    };
  }

  _loadHistoricalDatasets() {
    try {
      const stored = localStorage.getItem(HISTORICAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load historical datasets', e);
    }
    return [...DEFAULT_HISTORICAL_DATASETS];
  }

  _persistHistoricalDatasets() {
    try {
      localStorage.setItem(HISTORICAL_STORAGE_KEY, JSON.stringify(this._historicalDatasets));
    } catch (e) {
      console.warn('Failed to persist historical datasets', e);
    }
  }

  _notify() {
    this._listeners.forEach(cb => {
      try { cb(this.getState()); } catch (e) { console.error('Listener callback error', e); }
    });
  }

  // ─── Subscription ─────────────────────────────────────────────────────────
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  // ─── State Accessors ──────────────────────────────────────────────────────
  getState() {
    return {
      entities: [...this._state.entities],
      metrics: [...this._state.metrics],
      historicalDatasets: [...this._historicalDatasets],
      lastUpdated: this._state.lastUpdated,
    };
  }

  // ─── Entities API ─────────────────────────────────────────────────────────
  getEntities() {
    return [...this._state.entities];
  }

  getEntityById(id) {
    return this._state.entities.find(e => e.id === id) || null;
  }

  setEntities(newEntities) {
    this._state.entities = typeof newEntities === 'function' ? newEntities(this._state.entities) : newEntities;
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return this.getEntities();
  }

  addEntity(entityData) {
    const id = entityData.id || `e_${crypto.randomUUID()}`;
    const newEntity = {
      id,
      name: entityData.name || `ENT_${String(this._state.entities.length + 1).padStart(2, '0')}`,
      visible: entityData.visible ?? true,
      color: entityData.color || '#10b981',
      values: entityData.values || this._generateInitialEntityValues(),
    };
    this._state.entities.push(newEntity);
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return newEntity;
  }

  updateEntity(id, updates) {
    const index = this._state.entities.findIndex(e => e.id === id);
    if (index === -1) return null;
    this._state.entities[index] = { ...this._state.entities[index], ...updates };
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return this._state.entities[index];
  }

  removeEntity(id) {
    this._state.entities = this._state.entities.filter(e => e.id !== id);
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return true;
  }

  toggleEntityVisibility(id) {
    const entity = this.getEntityById(id);
    if (entity) {
      entity.visible = !entity.visible;
      this._state.lastUpdated = new Date().toISOString();
      this._notify();
    }
  }

  updateStatValue(entityId, metricId, value) {
    const entity = this.getEntityById(entityId);
    if (entity) {
      entity.values[metricId] = Number(value) || 0;
      this._state.lastUpdated = new Date().toISOString();
      this._notify();
    }
  }

  // ─── Metrics API ──────────────────────────────────────────────────────────
  getMetrics() {
    return [...this._state.metrics];
  }

  getMetricById(id) {
    return this._state.metrics.find(m => m.id === id) || null;
  }

  setMetrics(newMetrics) {
    this._state.metrics = typeof newMetrics === 'function' ? newMetrics(this._state.metrics) : newMetrics;
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return this.getMetrics();
  }

  addMetric(metricData) {
    const id = metricData.id || `s_${crypto.randomUUID()}`;
    const newMetric = {
      id,
      name: (metricData.name || `STAT_${String(this._state.metrics.length + 1).padStart(2, '0')}`).toUpperCase(),
      visible: metricData.visible ?? false,
      editing: false,
      iconType: metricData.iconType || 'icon',
      iconName: metricData.iconName || 'Hashtag',
      unit: metricData.unit || 'pts',
    };
    this._state.metrics.push(newMetric);
    // Add default 0 value to all entities
    this._state.entities.forEach(entity => {
      if (entity.values[id] === undefined) {
        entity.values[id] = 0;
      }
    });
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return newMetric;
  }

  updateMetric(id, updates) {
    const index = this._state.metrics.findIndex(m => m.id === id);
    if (index === -1) return null;
    this._state.metrics[index] = { ...this._state.metrics[index], ...updates };
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return this._state.metrics[index];
  }

  removeMetric(id) {
    this._state.metrics = this._state.metrics.filter(m => m.id !== id);
    this._state.entities.forEach(entity => {
      delete entity.values[id];
    });
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return true;
  }

  toggleMetricVisibility(id) {
    const metric = this.getMetricById(id);
    if (metric) {
      metric.visible = !metric.visible;
      this._state.lastUpdated = new Date().toISOString();
      this._notify();
    }
  }

  // ─── Historical Comparison Datasets API ───────────────────────────────────
  getHistoricalDatasets() {
    return [...this._historicalDatasets];
  }

  getHistoricalDatasetById(id) {
    return this._historicalDatasets.find(d => d.id === id) || null;
  }

  /**
   * Save a snapshot of current or provided entities and metrics as a historical comparison dataset.
   */
  saveHistoricalSnapshot(name, description = '', customEntities = null, customMetrics = null) {
    const snapshot = {
      id: `hist_${crypto.randomUUID()}`,
      name: name.trim() || `Snapshot ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      description: description.trim() || 'Manual dashboard historical snapshot.',
      entities: JSON.parse(JSON.stringify(customEntities || this._state.entities)),
      metrics: JSON.parse(JSON.stringify(customMetrics || this._state.metrics)),
    };
    this._historicalDatasets.unshift(snapshot);
    this._persistHistoricalDatasets();
    this._notify();
    return snapshot;
  }

  deleteHistoricalDataset(id) {
    this._historicalDatasets = this._historicalDatasets.filter(d => d.id !== id);
    this._persistHistoricalDatasets();
    this._notify();
    return true;
  }

  /**
   * Computes delta comparisons between current entities and a historical dataset.
   * Returns a breakdown of score changes, delta totals, and percentage improvements.
   */
  compareWithHistorical(historicalId, currentEntities = this._state.entities, activeMetrics = this._state.metrics) {
    const historical = this.getHistoricalDatasetById(historicalId);
    if (!historical) return null;

    const histEntityMap = new Map(historical.entities.map(e => [e.id, e]));
    const comparisons = [];

    currentEntities.forEach(current => {
      const hist = histEntityMap.get(current.id);
      const metricDeltas = {};
      let currentTotal = 0;
      let histTotal = 0;

      activeMetrics.forEach(metric => {
        const currVal = current.values[metric.id] ?? 0;
        const histVal = hist ? (hist.values[metric.id] ?? 0) : 0;
        const diff = currVal - histVal;
        currentTotal += currVal;
        histTotal += histVal;

        metricDeltas[metric.id] = {
          metricName: metric.name,
          current: currVal,
          historical: histVal,
          diff,
          percentChange: histVal !== 0 ? ((diff / histVal) * 100).toFixed(1) : (diff > 0 ? '+100' : '0'),
        };
      });

      const totalDiff = currentTotal - histTotal;
      const totalPercent = histTotal !== 0 ? ((totalDiff / histTotal) * 100).toFixed(1) : '0';

      comparisons.push({
        entityId: current.id,
        entityName: current.name,
        color: current.color,
        hasHistorical: Boolean(hist),
        currentTotal,
        histTotal,
        totalDiff,
        totalPercent,
        metricDeltas,
      });
    });

    return {
      historicalId: historical.id,
      historicalName: historical.name,
      historicalDate: historical.date,
      comparisons,
    };
  }

  restoreHistoricalSnapshot(id) {
    const snapshot = this.getHistoricalDatasetById(id);
    if (!snapshot) return null;
    this._state.entities = JSON.parse(JSON.stringify(snapshot.entities));
    if (snapshot.metrics?.length) {
      this._state.metrics = JSON.parse(JSON.stringify(snapshot.metrics));
    }
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return {
      entities: this._state.entities,
      metrics: this._state.metrics,
    };
  }

  /**
   * Evaluates and flags metrics across all entities in the registry against a specified range.
   *
   * @param {{ min?: number, max?: number, enabled?: boolean }} [range={ min: 30, max: 85, enabled: true }]
   * @returns Flagged registry analysis object.
   */
  flagRegistryMetrics(range = { min: 30, max: 85, enabled: true }) {
    const min = typeof range?.min === 'number' ? range.min : 30;
    const max = typeof range?.max === 'number' ? range.max : 85;
    const isEnabled = range?.enabled !== false;

    const entities = this.getEntities();
    const metrics = this.getMetrics();
    const entityFlags = {};
    const metricFlags = {};
    const flaggedList = [];
    let totalFlagged = 0;

    metrics.forEach(metric => {
      metricFlags[metric.id] = { count: 0, lowCount: 0, highCount: 0, low: [], high: [] };
    });

    entities.forEach(entity => {
      entityFlags[entity.id] = { count: 0, lowCount: 0, highCount: 0, low: [], high: [], metrics: {} };
      metrics.forEach(metric => {
        const val = entity.values?.[metric.id] ?? 0;
        if (!isEnabled) return;
        if (val < min) {
          totalFlagged++;
          const flag = { entityId: entity.id, metricId: metric.id, value: val, type: 'low', diff: Number((min - val).toFixed(1)), threshold: min };
          entityFlags[entity.id].count++;
          entityFlags[entity.id].lowCount++;
          entityFlags[entity.id].low.push(flag);
          entityFlags[entity.id].metrics[metric.id] = flag;
          metricFlags[metric.id].count++;
          metricFlags[metric.id].lowCount++;
          metricFlags[metric.id].low.push(flag);
          flaggedList.push(flag);
        } else if (val > max) {
          totalFlagged++;
          const flag = { entityId: entity.id, metricId: metric.id, value: val, type: 'high', diff: Number((val - max).toFixed(1)), threshold: max };
          entityFlags[entity.id].count++;
          entityFlags[entity.id].highCount++;
          entityFlags[entity.id].high.push(flag);
          entityFlags[entity.id].metrics[metric.id] = flag;
          metricFlags[metric.id].count++;
          metricFlags[metric.id].highCount++;
          metricFlags[metric.id].high.push(flag);
          flaggedList.push(flag);
        }
      });
    });

    return {
      totalFlagged,
      flaggedEntitiesCount: Object.values(entityFlags).filter(e => e.count > 0).length,
      entityFlags,
      metricFlags,
      flaggedList,
    };
  }

  resetToDefaults() {
    this._state.entities = JSON.parse(JSON.stringify(DEFAULT_ENTITIES));
    this._state.metrics = JSON.parse(JSON.stringify(DEFAULT_METRICS));
    this._historicalDatasets = [...DEFAULT_HISTORICAL_DATASETS];
    this._persistHistoricalDatasets();
    this._state.lastUpdated = new Date().toISOString();
    this._notify();
    return this.getState();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  _generateInitialEntityValues() {
    const values = {};
    this._state.metrics.forEach(metric => {
      values[metric.id] = Math.floor(Math.random() * 80) + 20;
    });
    return values;
  }
}

// Export singleton instance
export const dataService = new DataManagementService();
export default dataService;
