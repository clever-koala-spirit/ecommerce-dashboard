import { useEffect, useState, useCallback, useRef } from 'react';
import { isBackendAvailable, fetchDashboardData } from '../services/api';
import { mockData } from '../mock/mockData';

export function useLiveData(refreshIntervalMs = 300000) {
  const [data, setData] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectedSources, setConnectedSources] = useState(new Set());
  const refreshIntervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const available = await isBackendAvailable();

      if (available) {
        const result = await fetchDashboardData();
        setData(result.data);
        setIsLive(result.isLive);
        setLastUpdated(new Date());

        // Determine which sources are connected
        const connected = new Set();
        if (result.data.shopify?.length > 0) connected.add('shopify');
        if (result.data.meta?.length > 0) connected.add('meta');
        if (result.data.google?.length > 0) connected.add('google');
        if (result.data.klaviyo?.length > 0) connected.add('klaviyo');
        if (result.data.ga4?.length > 0) connected.add('ga4');

        setConnectedSources(connected);

        if (result.error) {
          console.warn('[useLiveData] Error from API:', result.error);
        }
      } else {
        // Backend not available, use mock data
        setData({
          shopify: mockData.shopify,
          meta: mockData.meta,
          google: mockData.google,
          klaviyo: mockData.klaviyo,
          ga4: mockData.ga4,
        });
        setIsLive(false);
        setLastUpdated(new Date());

        // All sources available in mock
        setConnectedSources(new Set(['shopify', 'meta', 'google', 'klaviyo', 'ga4']));
      }
    } catch (err) {
      console.error('[useLiveData] Error fetching data:', err);
      setError(err.message);

      // Fall back to mock data on error
      setData({
        shopify: mockData.shopify,
        meta: mockData.meta,
        google: mockData.google,
        klaviyo: mockData.klaviyo,
        ga4: mockData.ga4,
      });
      setIsLive(false);
      setLastUpdated(new Date());
      setConnectedSources(new Set(['shopify', 'meta', 'google', 'klaviyo', 'ga4']));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshIntervalMs > 0) {
      refreshIntervalRef.current = setInterval(fetchData, refreshIntervalMs);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchData, refreshIntervalMs]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLive,
    isLoading,
    error,
    lastUpdated,
    connectedSources,
    refresh,
  };
}

// Specialized hooks for individual data sources
export function useShopifyData(refreshIntervalMs = 300000) {
  const liveData = useLiveData(refreshIntervalMs);
  return {
    data: liveData.data?.shopify || mockData.shopify,
    isLive: liveData.isLive,
    isLoading: liveData.isLoading,
    error: liveData.error,
    lastUpdated: liveData.lastUpdated,
    refresh: liveData.refresh,
  };
}

export function useMetaData(refreshIntervalMs = 300000) {
  const liveData = useLiveData(refreshIntervalMs);
  return {
    data: liveData.data?.meta || mockData.meta,
    isLive: liveData.isLive,
    isLoading: liveData.isLoading,
    error: liveData.error,
    lastUpdated: liveData.lastUpdated,
    refresh: liveData.refresh,
  };
}

export function useGoogleData(refreshIntervalMs = 300000) {
  const liveData = useLiveData(refreshIntervalMs);
  return {
    data: liveData.data?.google || mockData.google,
    isLive: liveData.isLive,
    isLoading: liveData.isLoading,
    error: liveData.error,
    lastUpdated: liveData.lastUpdated,
    refresh: liveData.refresh,
  };
}

export function useKlaviyoData(refreshIntervalMs = 300000) {
  const liveData = useLiveData(refreshIntervalMs);
  return {
    data: liveData.data?.klaviyo || mockData.klaviyo,
    isLive: liveData.isLive,
    isLoading: liveData.isLoading,
    error: liveData.error,
    lastUpdated: liveData.lastUpdated,
    refresh: liveData.refresh,
  };
}

export function useGA4Data(refreshIntervalMs = 300000) {
  const liveData = useLiveData(refreshIntervalMs);
  return {
    data: liveData.data?.ga4 || mockData.ga4,
    isLive: liveData.isLive,
    isLoading: liveData.isLoading,
    error: liveData.error,
    lastUpdated: liveData.lastUpdated,
    refresh: liveData.refresh,
  };
}
