export const createForecastSlice = (set) => ({
  // State
  forecasts: {
    revenue: {
      values: [],
      confidence: 0.95,
      horizon: '30d',
      method: 'exponential_smoothing',
      generated: new Date(),
    },
    orders: {
      values: [],
      confidence: 0.9,
      horizon: '30d',
      method: 'exponential_smoothing',
      generated: new Date(),
    },
    aov: {
      values: [],
      confidence: 0.85,
      horizon: '30d',
      method: 'moving_average',
      generated: new Date(),
    },
    cac: {
      values: [],
      confidence: 0.8,
      horizon: '30d',
      method: 'exponential_smoothing',
      generated: new Date(),
    },
  },

  scenarios: [
    {
      id: 'scenario-1',
      name: 'Conservative',
      adjustments: { revenue: 0.9, spend: 1.1, roas: 0.82 },
      description: '10% lower revenue, 10% higher spend',
      created: new Date(),
    },
    {
      id: 'scenario-2',
      name: 'Optimistic',
      adjustments: { revenue: 1.15, spend: 1.0, roas: 1.15 },
      description: '15% higher revenue, same spend',
      created: new Date(),
    },
    {
      id: 'scenario-3',
      name: 'Current Trajectory',
      adjustments: { revenue: 1.0, spend: 1.0, roas: 1.0 },
      description: 'Continue current trend',
      created: new Date(),
    },
  ],

  activeHorizon: '30d',
  forecastMethod: 'auto',

  // Actions
  setForecast: (metric, data) => {
    set((state) => ({
      forecasts: {
        ...state.forecasts,
        [metric]: {
          ...state.forecasts[metric],
          ...data,
          generated: new Date(),
        },
      },
    }));
  },

  setForecastData: (metric, values, options = {}) => {
    set((state) => ({
      forecasts: {
        ...state.forecasts,
        [metric]: {
          ...state.forecasts[metric],
          values,
          ...options,
          generated: new Date(),
        },
      },
    }));
  },

  addScenario: (name, adjustments, description = '') => {
    set((state) => ({
      scenarios: [
        ...state.scenarios,
        {
          id: `scenario-${Date.now()}`,
          name,
          adjustments,
          description,
          created: new Date(),
        },
      ],
    }));
  },

  updateScenario: (scenarioId, updates) => {
    set((state) => ({
      scenarios: state.scenarios.map((s) =>
        s.id === scenarioId ? { ...s, ...updates } : s
      ),
    }));
  },

  deleteScenario: (scenarioId) => {
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== scenarioId),
    }));
  },

  setHorizon: (horizon) => {
    set((state) => ({
      activeHorizon: horizon,
    }));
  },

  setMethod: (method) => {
    set((state) => ({
      forecastMethod: method,
    }));
  },

  setMethodForMetric: (metric, method) => {
    set((state) => ({
      forecasts: {
        ...state.forecasts,
        [metric]: {
          ...state.forecasts[metric],
          method,
        },
      },
    }));
  },

  setConfidence: (metric, confidence) => {
    set((state) => ({
      forecasts: {
        ...state.forecasts,
        [metric]: {
          ...state.forecasts[metric],
          confidence,
        },
      },
    }));
  },

  refreshForecasts: () => {
    set((state) => {
      const newForecasts = { ...state.forecasts };
      Object.keys(newForecasts).forEach((metric) => {
        newForecasts[metric] = {
          ...newForecasts[metric],
          generated: new Date(),
        };
      });
      return { forecasts: newForecasts };
    });
  },

  clearForecasts: () => {
    set({
      forecasts: {
        revenue: {
          values: [],
          confidence: 0.95,
          horizon: '30d',
          method: 'exponential_smoothing',
          generated: new Date(),
        },
        orders: {
          values: [],
          confidence: 0.9,
          horizon: '30d',
          method: 'exponential_smoothing',
          generated: new Date(),
        },
        aov: {
          values: [],
          confidence: 0.85,
          horizon: '30d',
          method: 'moving_average',
          generated: new Date(),
        },
        cac: {
          values: [],
          confidence: 0.8,
          horizon: '30d',
          method: 'exponential_smoothing',
          generated: new Date(),
        },
      },
    });
  },

  // Getters
  getForecast: (metric) => {
    return (state) => state.forecasts[metric] || null;
  },

  getScenarios: () => {
    return (state) => state.scenarios;
  },

  getScenario: (scenarioId) => {
    return (state) => state.scenarios.find((s) => s.id === scenarioId);
  },
});
