export const createUiSlice = (set) => ({
  // State
  theme: 'dark', // 'dark' or 'light'
  sidebarOpen: true,
  activeTab: 'dashboard', // 'dashboard', 'forecast', 'settings', 'analytics'
  editorOpen: false,
  chatOpen: false,
  selectedMetrics: ['revenue', 'orders', 'aov', 'roas'],
  chartLayout: 'grid', // 'grid' or 'list'
  refreshInterval: 300000, // 5 minutes in milliseconds
  autoRefresh: true,
  expandedSections: {
    shopify: true,
    meta: true,
    google: true,
    klaviyo: true,
    ga4: true,
  },
  modalOpen: null, // null or modal name like 'settings', 'addCost', etc.
  notificationPosition: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  compactMode: false,
  showGridlines: false,
  animationsEnabled: true,
  customWidgets: [],
  customMetrics: [],

  // Actions
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    }));
  },

  setTheme: (theme) => {
    set((state) => ({
      theme: ['dark', 'light'].includes(theme) ? theme : state.theme,
    }));
  },

  toggleSidebar: () => {
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    }));
  },

  setSidebarOpen: (open) => {
    set((state) => ({
      sidebarOpen: open,
    }));
  },

  setActiveTab: (tab) => {
    set((state) => ({
      activeTab: tab,
    }));
  },

  toggleEditor: () => {
    set((state) => ({
      editorOpen: !state.editorOpen,
    }));
  },

  setEditorOpen: (open) => {
    set((state) => ({
      editorOpen: open,
    }));
  },

  toggleChat: () => {
    set((state) => ({
      chatOpen: !state.chatOpen,
    }));
  },

  setChatOpen: (open) => {
    set((state) => ({
      chatOpen: open,
    }));
  },

  setSelectedMetrics: (metrics) => {
    set((state) => ({
      selectedMetrics: Array.isArray(metrics) ? metrics : [metrics],
    }));
  },

  toggleMetric: (metric) => {
    set((state) => ({
      selectedMetrics: state.selectedMetrics.includes(metric)
        ? state.selectedMetrics.filter((m) => m !== metric)
        : [...state.selectedMetrics, metric],
    }));
  },

  setChartLayout: (layout) => {
    set((state) => ({
      chartLayout: ['grid', 'list'].includes(layout) ? layout : state.chartLayout,
    }));
  },

  setRefreshInterval: (interval) => {
    set((state) => ({
      refreshInterval: Math.max(30000, interval), // Minimum 30 seconds
    }));
  },

  toggleAutoRefresh: () => {
    set((state) => ({
      autoRefresh: !state.autoRefresh,
    }));
  },

  setAutoRefresh: (enabled) => {
    set((state) => ({
      autoRefresh: enabled,
    }));
  },

  toggleSection: (section) => {
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [section]: !state.expandedSections[section],
      },
    }));
  },

  setExpandedSection: (section, expanded) => {
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [section]: expanded,
      },
    }));
  },

  expandAllSections: () => {
    set((state) => {
      const newSections = {};
      Object.keys(state.expandedSections).forEach((key) => {
        newSections[key] = true;
      });
      return { expandedSections: newSections };
    });
  },

  collapseAllSections: () => {
    set((state) => {
      const newSections = {};
      Object.keys(state.expandedSections).forEach((key) => {
        newSections[key] = false;
      });
      return { expandedSections: newSections };
    });
  },

  openModal: (modalName) => {
    set((state) => ({
      modalOpen: modalName,
    }));
  },

  closeModal: () => {
    set((state) => ({
      modalOpen: null,
    }));
  },

  setNotificationPosition: (position) => {
    set((state) => ({
      notificationPosition: position,
    }));
  },

  toggleCompactMode: () => {
    set((state) => ({
      compactMode: !state.compactMode,
    }));
  },

  setCompactMode: (compact) => {
    set((state) => ({
      compactMode: compact,
    }));
  },

  toggleGridlines: () => {
    set((state) => ({
      showGridlines: !state.showGridlines,
    }));
  },

  setGridlines: (show) => {
    set((state) => ({
      showGridlines: show,
    }));
  },

  toggleAnimations: () => {
    set((state) => ({
      animationsEnabled: !state.animationsEnabled,
    }));
  },

  setAnimations: (enabled) => {
    set((state) => ({
      animationsEnabled: enabled,
    }));
  },

  addCustomWidget: (widget) => {
    set((state) => ({
      customWidgets: [
        ...state.customWidgets,
        { ...widget, id: `widget-${Date.now()}` },
      ],
    }));
  },

  removeCustomWidget: (widgetId) => {
    set((state) => ({
      customWidgets: state.customWidgets.filter((w) => w.id !== widgetId),
    }));
  },

  clearCustomWidgets: () => {
    set((state) => ({
      customWidgets: [],
    }));
  },

  addCustomMetric: (metric) => {
    set((state) => ({
      customMetrics: [
        ...state.customMetrics,
        { ...metric, id: `metric-${Date.now()}` },
      ],
    }));
  },

  removeCustomMetric: (metricId) => {
    set((state) => ({
      customMetrics: state.customMetrics.filter((m) => m.id !== metricId),
    }));
  },

  resetUIPreferences: () => {
    set({
      theme: 'dark',
      sidebarOpen: true,
      activeTab: 'dashboard',
      editorOpen: false,
      chatOpen: false,
      selectedMetrics: ['revenue', 'orders', 'aov', 'roas'],
      chartLayout: 'grid',
      refreshInterval: 300000,
      autoRefresh: true,
      expandedSections: {
        shopify: true,
        meta: true,
        google: true,
        klaviyo: true,
        ga4: true,
      },
      modalOpen: null,
      notificationPosition: 'bottom-right',
      compactMode: false,
      showGridlines: false,
      animationsEnabled: true,
      customWidgets: [],
      customMetrics: [],
    });
  },

  // Getters
  getTheme: () => {
    return (state) => state.theme;
  },

  getActiveTab: () => {
    return (state) => state.activeTab;
  },

  getSelectedMetrics: () => {
    return (state) => state.selectedMetrics;
  },

  getChartLayout: () => {
    return (state) => state.chartLayout;
  },

  getAutoRefreshSettings: () => {
    return (state) => ({
      enabled: state.autoRefresh,
      interval: state.refreshInterval,
    });
  },

  getSectionState: (section) => {
    return (state) => state.expandedSections[section] ?? true;
  },

  getModalState: () => {
    return (state) => state.modalOpen;
  },

  isModalOpen: (modalName) => {
    return (state) => state.modalOpen === modalName;
  },
});
