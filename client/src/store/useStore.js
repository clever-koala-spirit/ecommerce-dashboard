import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createFilterSlice } from './slices/filterSlice';
import { createDataSlice } from './slices/dataSlice';
import { createForecastSlice } from './slices/forecastSlice';
import { createConnectionSlice } from './slices/connectionSlice';
import { createCostSlice } from './slices/costSlice';
import { createInsightSlice } from './slices/insightSlice';
import { createUiSlice } from './slices/uiSlice';

// Compose all slices into a single store using Zustand's slice pattern
export const useStore = create(
  devtools(
    persist(
      (set, get, api) => ({
        // Filter Slice
        ...createFilterSlice(set, get, api),

        // Data Slice
        ...createDataSlice(set, get, api),

        // Forecast Slice
        ...createForecastSlice(set, get, api),

        // Connection Slice
        ...createConnectionSlice(set, get, api),

        // Cost Slice
        ...createCostSlice(set, get, api),

        // Insight Slice
        ...createInsightSlice(set, get, api),

        // UI Slice
        ...createUiSlice(set, get, api),
      }),
      {
        name: 'ecommerce-dashboard-store',
        partialize: (state) => ({
          // Only persist UI preferences, filters, and costs
          // Don't persist live data that should be fresh on reload
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          activeTab: state.activeTab,
          selectedMetrics: state.selectedMetrics,
          chartLayout: state.chartLayout,
          compactMode: state.compactMode,
          showGridlines: state.showGridlines,
          animationsEnabled: state.animationsEnabled,
          autoRefresh: state.autoRefresh,
          refreshInterval: state.refreshInterval,
          notificationPosition: state.notificationPosition,
          dateRange: state.dateRange,
          comparisonEnabled: state.comparisonEnabled,
          comparisonPeriod: state.comparisonPeriod,
          selectedChannels: state.selectedChannels,
          customerType: state.customerType,
          savedViews: state.savedViews,
          fixedCosts: state.fixedCosts,
          forecastMethod: state.forecastMethod,
          activeHorizon: state.activeHorizon,
        }),
      }
    ),
    {
      name: 'ecommerce-dashboard',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Export individual slice getters for convenience
export const useFilters = () =>
  useStore((state) => ({
    dateRange: state.dateRange,
    comparisonEnabled: state.comparisonEnabled,
    comparisonPeriod: state.comparisonPeriod,
    selectedChannels: state.selectedChannels,
    customerType: state.customerType,
    savedViews: state.savedViews,
    setDateRange: state.setDateRange,
    toggleComparison: state.toggleComparison,
    setChannels: state.setChannels,
    toggleChannel: state.toggleChannel,
    setCustomerType: state.setCustomerType,
    saveView: state.saveView,
    loadView: state.loadView,
    deleteView: state.deleteView,
    updateView: state.updateView,
    resetFilters: state.resetFilters,
  }));

export const useData = () =>
  useStore((state) => ({
    shopifyData: state.shopifyData,
    metaData: state.metaData,
    googleData: state.googleData,
    klaviyoData: state.klaviyoData,
    ga4Data: state.ga4Data,
    isLoading: state.isLoading,
    lastSynced: state.lastSynced,
    errors: state.errors,
    setSourceData: state.setSourceData,
    setLoading: state.setLoading,
    setError: state.setError,
    setSynced: state.setSynced,
    setAllData: state.setAllData,
    clearData: state.clearData,
    clearAllData: state.clearAllData,
    isSyncingAny: state.isSyncingAny,
  }));

export const useForecast = () =>
  useStore((state) => ({
    forecasts: state.forecasts,
    scenarios: state.scenarios,
    activeHorizon: state.activeHorizon,
    forecastMethod: state.forecastMethod,
    setForecast: state.setForecast,
    setForecastData: state.setForecastData,
    addScenario: state.addScenario,
    updateScenario: state.updateScenario,
    deleteScenario: state.deleteScenario,
    setHorizon: state.setHorizon,
    setMethod: state.setMethod,
    setMethodForMetric: state.setMethodForMetric,
    setConfidence: state.setConfidence,
    refreshForecasts: state.refreshForecasts,
    clearForecasts: state.clearForecasts,
    getForecast: state.getForecast,
    getScenarios: state.getScenarios,
    getScenario: state.getScenario,
  }));

export const useConnections = () =>
  useStore((state) => ({
    connections: state.connections,
    setConnectionStatus: state.setConnectionStatus,
    setStatus: state.setStatus,
    updateConfig: state.updateConfig,
    setConfig: state.setConfig,
    setError: state.setError,
    clearError: state.clearError,
    updateLastSynced: state.updateLastSynced,
    connect: state.connect,
    disconnect: state.disconnect,
    getConnection: state.getConnection,
    getConnectionStatus: state.getConnectionStatus,
    isConnected: state.isConnected,
    getConnectedSources: state.getConnectedSources,
    hasErrors: state.hasErrors,
    getAllConnections: state.getAllConnections,
  }));

export const useCosts = () =>
  useStore((state) => ({
    fixedCosts: state.fixedCosts,
    addCost: state.addCost,
    updateCost: state.updateCost,
    removeCost: state.removeCost,
    toggleCost: state.toggleCost,
    setIsActive: state.setIsActive,
    updateMonthlyAmount: state.updateMonthlyAmount,
    bulkUpdateCosts: state.bulkUpdateCosts,
    getTotalMonthlyCosts: state.getTotalMonthlyCosts,
    getTotalCosts: state.getTotalCosts,
    getCostsByCategory: state.getCostsByCategory,
    getCost: state.getCost,
    getAllCosts: state.getAllCosts,
    getActiveCosts: state.getActiveCosts,
    getInactiveCosts: state.getInactiveCosts,
  }));

export const useInsights = () =>
  useStore((state) => ({
    insights: state.insights,
    addInsight: state.addInsight,
    addInsights: state.addInsights,
    dismissInsight: state.dismissInsight,
    undismissInsight: state.undismissInsight,
    snoozeInsight: state.snoozeInsight,
    unsnoozeInsight: state.unsnoozeInsight,
    bookmarkInsight: state.bookmarkInsight,
    setBookmarked: state.setBookmarked,
    deleteInsight: state.deleteInsight,
    clearDismissed: state.clearDismissed,
    clearSnoozed: state.clearSnoozed,
    clearAll: state.clearAll,
    getInsights: state.getInsights,
    getDismissedInsights: state.getDismissedInsights,
    getSnoozedInsights: state.getSnoozedInsights,
    getBookmarkedInsights: state.getBookmarkedInsights,
    getInsightsBySeverity: state.getInsightsBySeverity,
    getUnreadCount: state.getUnreadCount,
    getErrorCount: state.getErrorCount,
    getWarningCount: state.getWarningCount,
    getInsight: state.getInsight,
    getAllInsights: state.getAllInsights,
    getRecentInsights: state.getRecentInsights,
  }));

export const useUI = () =>
  useStore((state) => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    activeTab: state.activeTab,
    editorOpen: state.editorOpen,
    chatOpen: state.chatOpen,
    selectedMetrics: state.selectedMetrics,
    chartLayout: state.chartLayout,
    refreshInterval: state.refreshInterval,
    autoRefresh: state.autoRefresh,
    expandedSections: state.expandedSections,
    modalOpen: state.modalOpen,
    notificationPosition: state.notificationPosition,
    compactMode: state.compactMode,
    showGridlines: state.showGridlines,
    animationsEnabled: state.animationsEnabled,
    toggleTheme: state.toggleTheme,
    setTheme: state.setTheme,
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setActiveTab: state.setActiveTab,
    toggleEditor: state.toggleEditor,
    setEditorOpen: state.setEditorOpen,
    toggleChat: state.toggleChat,
    setChatOpen: state.setChatOpen,
    setSelectedMetrics: state.setSelectedMetrics,
    toggleMetric: state.toggleMetric,
    setChartLayout: state.setChartLayout,
    setRefreshInterval: state.setRefreshInterval,
    toggleAutoRefresh: state.toggleAutoRefresh,
    setAutoRefresh: state.setAutoRefresh,
    toggleSection: state.toggleSection,
    setExpandedSection: state.setExpandedSection,
    expandAllSections: state.expandAllSections,
    collapseAllSections: state.collapseAllSections,
    openModal: state.openModal,
    closeModal: state.closeModal,
    setNotificationPosition: state.setNotificationPosition,
    toggleCompactMode: state.toggleCompactMode,
    setCompactMode: state.setCompactMode,
    toggleGridlines: state.toggleGridlines,
    setGridlines: state.setGridlines,
    toggleAnimations: state.toggleAnimations,
    setAnimations: state.setAnimations,
    resetUIPreferences: state.resetUIPreferences,
    getTheme: state.getTheme,
    getActiveTab: state.getActiveTab,
    getSelectedMetrics: state.getSelectedMetrics,
    getChartLayout: state.getChartLayout,
    getAutoRefreshSettings: state.getAutoRefreshSettings,
    getSectionState: state.getSectionState,
    getModalState: state.getModalState,
    isModalOpen: state.isModalOpen,
  }));

// Utility selectors
export const useShopifyData = () => useStore((state) => state.shopifyData);
export const useMetaData = () => useStore((state) => state.metaData);
export const useGoogleData = () => useStore((state) => state.googleData);
export const useKlaviyoData = () => useStore((state) => state.klaviyoData);
export const useGA4Data = () => useStore((state) => state.ga4Data);

export const useLoadingState = () =>
  useStore((state) => ({
    isLoading: state.isLoading,
    isSyncingAny: state.isSyncingAny,
  }));

export const useErrorState = () =>
  useStore((state) => ({
    errors: state.errors,
    hasErrors: state.hasErrors,
  }));

export const useDateRange = () => useStore((state) => state.dateRange);
export const useComparison = () =>
  useStore((state) => ({
    comparisonEnabled: state.comparisonEnabled,
    comparisonPeriod: state.comparisonPeriod,
    toggleComparison: state.toggleComparison,
    setComparisonPeriod: state.setComparisonPeriod,
  }));

export const useSelectedChannels = () =>
  useStore((state) => ({
    selectedChannels: state.selectedChannels,
    setChannels: state.setChannels,
    toggleChannel: state.toggleChannel,
  }));

export const useFixedCosts = () => useStore((state) => state.fixedCosts);
export const useForecastScenarios = () => useStore((state) => state.scenarios);

export const useConnectionStatus = (source) =>
  useStore((state) => state.connections[source] || null);

export const useIsSynced = (source) =>
  useStore((state) => ({
    synced: state.lastSynced[source],
    loading: state.isLoading[source],
    error: state.errors[source],
  }));

export default useStore;
