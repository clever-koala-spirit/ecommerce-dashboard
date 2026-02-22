/**
 * Custom hook for attribution data management - Mock version for testing
 * Simplified version for testing UI functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export const useAttributionData = (options = {}) => {
  const { 
    timeRange = '30d',
    modelType = 'ai_enhanced',
    autoRefresh = true,
    refreshInterval = 30000 
  } = options;

  const [data, setData] = useState({
    loading: false,
    error: null,
    attribution: null,
    journeys: [],
    touchpoints: [],
    insights: [],
    lastUpdated: new Date()
  });

  // Mock toast functionality
  const showToast = (message, type) => console.log(`Toast [${type}]:`, message);

  // Simplified mock data loading
  useEffect(() => {
    // Mock loading delay
    const timer = setTimeout(() => {
      setData(prev => ({
        ...prev,
        loading: false,
        attribution: {
          analytics: [],
          summary: {
            totalRevenue: 0,
            totalOrders: 0,
            conversionRate: 0
          }
        },
        lastUpdated: new Date()
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock functions
  const fetchAttributionData = useCallback(async () => {
    console.log('Mock: Fetching attribution data');
    return Promise.resolve();
  }, []);

  const trackTouchpoint = useCallback(async (touchpointData) => {
    console.log('Mock: Tracking touchpoint', touchpointData);
    return Promise.resolve({ success: true });
  }, []);

  // Computed metrics
  const metrics = useMemo(() => {
    if (!data.attribution?.analytics) return null;

    const channels = data.attribution.analytics;
    const summary = data.attribution.summary;

    return {
      totalRevenue: summary?.totalRevenue || 0,
      totalOrders: summary?.totalOrders || 0,
      averageOrderValue: summary?.totalRevenue && summary?.totalOrders 
        ? summary.totalRevenue / summary.totalOrders 
        : 0,
      conversionRate: summary?.conversionRate || 0,
      topChannels: channels.slice(0, 5),
      channelBreakdown: channels.reduce((acc, channel) => {
        acc[channel.channel] = {
          revenue: channel.revenue,
          percentage: (channel.revenue / (summary?.totalRevenue || 1)) * 100,
          orders: channel.orderCount,
          roas: channel.roas || 0
        };
        return acc;
      }, {}),
      trends: {
        revenueGrowth: summary?.revenueGrowth || 0,
        orderGrowth: summary?.orderGrowth || 0,
        aovGrowth: summary?.aovGrowth || 0
      }
    };
  }, [data.attribution]);

  // Journey analytics
  const journeyAnalytics = useMemo(() => {
    if (!data.journeys?.length) return null;

    const convertingJourneys = data.journeys.filter(j => j.conversions?.length > 0);
    
    return {
      totalJourneys: convertingJourneys.length,
      averagePathLength: convertingJourneys.length > 0
        ? convertingJourneys.reduce((sum, j) => sum + j.touchpoints.length, 0) / convertingJourneys.length
        : 0,
      averageTimeToConvert: convertingJourneys.length > 0
        ? convertingJourneys.reduce((sum, j) => sum + (j.timeToConversion || 0), 0) / convertingJourneys.length
        : 0,
      topPaths: getTopConversionPaths(convertingJourneys),
      channelTransitions: getChannelTransitions(convertingJourneys)
    };
  }, [data.journeys]);

  return {
    data,
    metrics,
    journeyAnalytics,
    loading: data.loading,
    error: data.error,
    lastUpdated: data.lastUpdated,
    actions: {
      refetch: fetchAttributionData,
      trackTouchpoint
    }
  };
};

// Helper functions
function getTopConversionPaths(journeys) {
  const pathMap = {};
  
  journeys.forEach(journey => {
    const pathString = journey.touchpoints.map(tp => tp.channel).join(' → ');
    if (!pathMap[pathString]) {
      pathMap[pathString] = {
        path: pathString,
        channels: journey.touchpoints.map(tp => tp.channel),
        count: 0,
        revenue: 0
      };
    }
    pathMap[pathString].count++;
    pathMap[pathString].revenue += journey.conversions.reduce((sum, conv) => sum + conv.revenue, 0);
  });
  
  return Object.values(pathMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function getChannelTransitions(journeys) {
  const transitionMap = {};
  
  journeys.forEach(journey => {
    for (let i = 0; i < journey.touchpoints.length - 1; i++) {
      const from = journey.touchpoints[i].channel;
      const to = journey.touchpoints[i + 1].channel;
      const key = `${from}_to_${to}`;
      
      if (!transitionMap[key]) {
        transitionMap[key] = { from, to, count: 0, revenue: 0 };
      }
      transitionMap[key].count++;
      transitionMap[key].revenue += journey.conversions.reduce((sum, conv) => sum + conv.revenue, 0);
    }
  });
  
  return Object.values(transitionMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export default useAttributionData;