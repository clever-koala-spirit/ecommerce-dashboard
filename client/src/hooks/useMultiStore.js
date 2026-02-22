import { useState, useEffect, useCallback } from 'react';
import { multiStoreAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export const useMultiStore = (options = {}) => {
  const { timeRange = '30d', autoRefresh = true } = options;
  const [data, setData] = useState({
    overview: null,
    consolidated: null,
    rankings: null,
    inventoryOptimization: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const fetchOverview = useCallback(async () => {
    try {
      const response = await multiStoreAPI.getOverview({ timeRange });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch overview:', error);
      throw error;
    }
  }, [timeRange]);

  const fetchConsolidated = useCallback(async () => {
    try {
      const response = await multiStoreAPI.getConsolidated({ 
        timeRange, 
        includeBreakdown: true 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch consolidated data:', error);
      throw error;
    }
  }, [timeRange]);

  const fetchRankings = useCallback(async (metric = 'revenue') => {
    try {
      const response = await multiStoreAPI.getRankings({ 
        metric, 
        timeRange 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
      throw error;
    }
  }, [timeRange]);

  const fetchInventoryOptimization = useCallback(async () => {
    try {
      const response = await multiStoreAPI.getInventoryOptimization({ 
        includeTransferRecommendations: true 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch inventory optimization:', error);
      throw error;
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [overview, consolidated, rankings, inventoryOptimization] = await Promise.all([
        fetchOverview(),
        fetchConsolidated(),
        fetchRankings(),
        fetchInventoryOptimization()
      ]);

      setData({
        overview,
        consolidated,
        rankings,
        inventoryOptimization
      });
    } catch (error) {
      setError(error.message || 'Failed to fetch multi-store data');
      showToast('Error loading multi-store data', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchConsolidated, fetchRankings, fetchInventoryOptimization, showToast]);

  const compareStores = useCallback(async (storeIds, metrics = ['revenue', 'orders']) => {
    try {
      setLoading(true);
      const response = await multiStoreAPI.compareStores({
        stores: storeIds.join(','),
        metrics: metrics.join(','),
        timeRange
      });
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to compare stores');
      showToast('Error comparing stores', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [timeRange, showToast]);

  const getStoreAnalytics = useCallback(async (storeId) => {
    try {
      const response = await multiStoreAPI.getStoreAnalytics(storeId, { timeRange });
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to fetch store analytics');
      showToast('Error loading store analytics', 'error');
      throw error;
    }
  }, [timeRange, showToast]);

  const connectStore = useCallback(async (storeData) => {
    try {
      setLoading(true);
      const response = await multiStoreAPI.connectStore(storeData);
      showToast('Store connected successfully', 'success');
      
      // Refresh data after connecting
      await refreshData();
      
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to connect store');
      showToast('Error connecting store', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData, showToast]);

  const disconnectStore = useCallback(async (storeId) => {
    try {
      setLoading(true);
      await multiStoreAPI.disconnectStore(storeId);
      showToast('Store disconnected successfully', 'success');
      
      // Refresh data after disconnecting
      await refreshData();
    } catch (error) {
      setError(error.message || 'Failed to disconnect store');
      showToast('Error disconnecting store', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData, showToast]);

  const exportData = useCallback(async (options = {}) => {
    try {
      const { format = 'csv', includeStores = 'all' } = options;
      
      const response = await multiStoreAPI.exportData({
        format,
        timeRange,
        includeStores: includeStores === 'all' ? 'all' : includeStores.join(',')
      });

      // Create download link
      const blob = new Blob([response], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `multi-store-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Data exported successfully', 'success');
    } catch (error) {
      setError(error.message || 'Failed to export data');
      showToast('Error exporting data', 'error');
      throw error;
    }
  }, [timeRange, showToast]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        refreshData();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, loading, refreshData]);

  return {
    // Data
    overview: data.overview,
    consolidated: data.consolidated,
    rankings: data.rankings,
    inventoryOptimization: data.inventoryOptimization,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
    compareStores,
    getStoreAnalytics,
    connectStore,
    disconnectStore,
    exportData
  };
};

export default useMultiStore;