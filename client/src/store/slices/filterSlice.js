export const createFilterSlice = (set) => ({
  // State
  dateRange: {
    preset: '30d',
    start: null,
    end: null,
    customStart: null,
    customEnd: null,
  },
  comparisonEnabled: false,
  comparisonPeriod: 'previous_period',
  selectedChannels: ['shopify', 'meta', 'google', 'klaviyo', 'ga4'],
  customerType: 'all', // 'all', 'new', 'returning'
  savedViews: [
    {
      id: 'view-1',
      name: 'Sales Performance',
      filters: {
        preset: '30d',
        channels: ['shopify'],
        customerType: 'all',
      },
    },
    {
      id: 'view-2',
      name: 'Ad Performance',
      filters: {
        preset: '7d',
        channels: ['meta', 'google'],
        customerType: 'all',
      },
    },
  ],

  // Actions
  setDateRange: (preset, customStart = null, customEnd = null) => {
    set((state) => {
      const newDateRange = {
        ...state.dateRange,
        preset,
        customStart,
        customEnd,
      };
      
      // Store the actual start/end dates for consistent filtering
      if (customStart && customEnd) {
        newDateRange.start = customStart;
        newDateRange.end = customEnd;
      } else {
        // Clear custom dates when using presets
        newDateRange.start = null;
        newDateRange.end = null;
      }
      
      return { dateRange: newDateRange };
    });
  },

  toggleComparison: (enabled) => {
    set((state) => ({
      comparisonEnabled: enabled !== undefined ? enabled : !state.comparisonEnabled,
    }));
  },

  setComparisonPeriod: (period) => {
    set((state) => ({
      comparisonPeriod: period,
    }));
  },

  setChannels: (channels) => {
    set((state) => ({
      selectedChannels: Array.isArray(channels) ? channels : [channels],
    }));
  },

  toggleChannel: (channel) => {
    set((state) => ({
      selectedChannels: state.selectedChannels.includes(channel)
        ? state.selectedChannels.filter((c) => c !== channel)
        : [...state.selectedChannels, channel],
    }));
  },

  setCustomerType: (type) => {
    set((state) => ({
      customerType: type,
    }));
  },

  saveView: (name, filters) => {
    set((state) => ({
      savedViews: [
        ...state.savedViews,
        {
          id: `view-${Date.now()}`,
          name,
          filters,
        },
      ],
    }));
  },

  loadView: (viewId) => {
    set((state) => {
      const view = state.savedViews.find((v) => v.id === viewId);
      if (!view) return state;
      return {
        dateRange: {
          ...state.dateRange,
          preset: view.filters.preset,
        },
        selectedChannels: view.filters.channels || state.selectedChannels,
        customerType: view.filters.customerType || state.customerType,
      };
    });
  },

  deleteView: (viewId) => {
    set((state) => ({
      savedViews: state.savedViews.filter((v) => v.id !== viewId),
    }));
  },

  updateView: (viewId, name, filters) => {
    set((state) => ({
      savedViews: state.savedViews.map((v) =>
        v.id === viewId ? { ...v, name, filters } : v
      ),
    }));
  },

  resetFilters: () => {
    set({
      dateRange: {
        preset: '30d',
        start: null,
        end: null,
        customStart: null,
        customEnd: null,
      },
      comparisonEnabled: false,
      comparisonPeriod: 'previous_period',
      selectedChannels: ['shopify', 'meta', 'google', 'klaviyo', 'ga4'],
      customerType: 'all',
    });
  },
});
