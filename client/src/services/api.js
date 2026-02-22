const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api';

// Get shop domain from session (set by ShopifyProvider)
function getShopDomain() {
  return sessionStorage.getItem('shopDomain') || null;
}

// Helper for authenticated API calls — includes session token for embedded, X-Shop-Domain header for standalone
async function apiFetch(endpoint, options = {}) {
  const shopDomain = getShopDomain();
  let token = null;

  // Get session token from Shopify App Bridge if embedded
  if (window.shopify) {
    try {
      token = await window.shopify.idToken();
    } catch (err) {
      // Not embedded or token fetch failed
      if (import.meta.env.DEV) {
        console.debug('[apiFetch] Session token not available:', err.message);
      }
    }
  }

  // Fall back to stored JWT from our own auth (email/password or Shopify session endpoint)
  if (!token) {
    token = localStorage.getItem('ss_token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(shopDomain && { 'X-Shop-Domain': shopDomain }),
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
}

// Utility to check if backend is available
export async function isBackendAvailable() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Build query string from date range filter
// Always fetches 2x the range to support comparison with previous period
function buildDateQuery(dateRange) {
  if (!dateRange) return 'days=90';

  const { preset, customStart, customEnd } = dateRange;

  if (preset === 'custom' && customStart && customEnd) {
    return `startDate=${customStart}&endDate=${customEnd}`;
  }

  const presetDays = {
    today: 1,
    yesterday: 2,
    '7d': 7,
    '14d': 14,
    '30d': 30,
    '90d': 90,
    ytd: Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000) + 1,
  };

  return `days=${presetDays[preset] || 90}`;
}

// Get sync status (last sync time per platform)
export async function fetchSyncStatus() {
  try {
    const available = await isBackendAvailable();
    if (!available) return { platforms: {} };

    const response = await apiFetch('/data/sync-status');
    if (!response.ok) return { platforms: {} };
    return await response.json();
  } catch (error) {
    return { platforms: {} };
  }
}

// Get dashboard data (combined from all sources)
export async function fetchDashboardData(dateRange = null, { refresh = false } = {}) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      console.warn('[API] Backend unavailable — returning empty data (no mock fallback)');
      return {
        isLive: false,
        data: {
          shopify: [],
          meta: [],
          google: [],
          klaviyo: [],
          ga4: [],
          tiktok: [],
        },
      };
    }

    const query = buildDateQuery(dateRange) + (refresh ? '&refresh=true' : '');
    const response = await apiFetch(`/data/dashboard?${query}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');

    const data = await response.json();
    return {
      isLive: true,
      data: {
        shopify: data.shopify || [],
        meta: data.meta || [],
        google: data.google || [],
        klaviyo: data.klaviyo || [],
        ga4: data.ga4 || [],
        tiktok: data.tiktok || [],
      },
      timestamp: data.timestamp,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching dashboard data:', error);
    }
    return {
      isLive: false,
      data: {
        shopify: [],
        meta: [],
        google: [],
        klaviyo: [],
        ga4: [],
        tiktok: [],
      },
      error: error.message,
    };
  }
}

// Get connection status for all sources
export async function fetchConnectionStatus() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return {
        isLive: false,
        data: {
          shopify: { connected: false, status: 'red', lastSynced: null },
          meta: { connected: false, status: 'red', lastSynced: null },
          google: { connected: false, status: 'red', lastSynced: null },
          klaviyo: { connected: false, status: 'red', lastSynced: null },
          ga4: { connected: false, status: 'red', lastSynced: null },
        },
      };
    }

    const response = await apiFetch('/connections');
    if (!response.ok) throw new Error('Failed to fetch connection status');

    const data = await response.json();
    return {
      isLive: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching connection status:', error);
    }
    return {
      isLive: false,
      data: {
        shopify: { connected: false, status: 'red', lastSynced: null },
        meta: { connected: false, status: 'red', lastSynced: null },
        google: { connected: false, status: 'red', lastSynced: null },
        klaviyo: { connected: false, status: 'red', lastSynced: null },
        ga4: { connected: false, status: 'red', lastSynced: null },
      },
      error: error.message,
    };
  }
}

// Test a specific connection
export async function testConnection(source) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { connected: false, status: 'red', error: 'Backend unavailable' };
    }

    const response = await apiFetch(`/connections/${source}/test`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[API] Error testing connection for ${source}:`, error);
    }
    return {
      source,
      connected: false,
      status: 'red',
      error: error.message,
    };
  }
}

// Trigger manual sync for a source
export async function syncSource(source) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { error: 'Backend unavailable' };
    }

    const response = await apiFetch(`/connections/${source}/sync`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[API] Error syncing ${source}:`, error);
    }
    return {
      source,
      error: error.message,
    };
  }
}

// Get data for a specific source
export async function fetchSourceData(source) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: [] };
    }

    const response = await apiFetch(`/connections/${source}/data`);
    if (!response.ok) throw new Error('Failed to fetch source data');

    const responseData = await response.json();

    if (!responseData.connected) {
      return { isLive: false, data: [] };
    }

    return {
      isLive: true,
      data: responseData.data || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[API] Error fetching data for ${source}:`, error);
    }
    return { isLive: false, data: [], error: error.message };
  }
}

// Get specific data endpoints
export async function fetchShopifyOrders() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: [] };
    }

    const response = await apiFetch('/data/shopify/orders');
    if (!response.ok) throw new Error('Failed to fetch Shopify orders');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Shopify orders:', error);
    }
    return { isLive: false, data: [], error: error.message };
  }
}

export async function fetchMetaCampaigns() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: [] };
    }

    const response = await apiFetch('/data/meta/campaigns');
    if (!response.ok) throw new Error('Failed to fetch Meta campaigns');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Meta campaigns:', error);
    }
    return { isLive: false, data: [], error: error.message };
  }
}

export async function fetchGoogleCampaigns() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: [] };
    }

    const response = await apiFetch('/data/google/campaigns');
    if (!response.ok) throw new Error('Failed to fetch Google campaigns');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Google campaigns:', error);
    }
    return { isLive: false, data: [], error: error.message };
  }
}

export async function fetchKlaviyoFlows() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: [] };
    }

    const response = await apiFetch('/data/klaviyo/flows');
    if (!response.ok) throw new Error('Failed to fetch Klaviyo flows');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Klaviyo flows:', error);
    }
    return { isLive: false, data: [], error: error.message };
  }
}

export async function fetchGA4Sessions() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: [] };
    }

    const response = await apiFetch('/data/ga4/sessions');
    if (!response.ok) throw new Error('Failed to fetch GA4 sessions');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching GA4 sessions:', error);
    }
    return { isLive: false, data: [], error: error.message };
  }
}

// Invalidate cache
export async function invalidateCache(source = null) {
  try {
    const available = await isBackendAvailable();
    if (!available) return { message: 'Backend unavailable' };

    const response = await apiFetch('/data/invalidate', {
      method: 'POST',
      body: JSON.stringify({ source }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error invalidating cache:', error);
    }
    return { error: error.message };
  }
}

// Multi-Store Management API
export const multiStoreAPI = {
  // Get overview of all connected stores
  async getOverview(options = {}) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const queryParams = new URLSearchParams({
        timeRange: options.timeRange || '30d',
        metrics: options.metrics ? options.metrics.join(',') : 'all'
      }).toString();

      const response = await apiFetch(`/multi-store/overview?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error fetching multi-store overview:', error);
      }
      throw error;
    }
  },

  // Compare performance across stores
  async compareStores(options = {}) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const queryParams = new URLSearchParams({
        stores: options.stores || '',
        metrics: options.metrics || 'revenue,orders,conversion',
        timeRange: options.timeRange || '30d'
      }).toString();

      const response = await apiFetch(`/multi-store/compare?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error comparing stores:', error);
      }
      throw error;
    }
  },

  // Get consolidated metrics across all stores
  async getConsolidated(options = {}) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const queryParams = new URLSearchParams({
        timeRange: options.timeRange || '30d',
        includeBreakdown: options.includeBreakdown ? 'true' : 'false',
        currency: options.currency || 'USD'
      }).toString();

      const response = await apiFetch(`/multi-store/consolidated?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error fetching consolidated metrics:', error);
      }
      throw error;
    }
  },

  // Get store performance rankings
  async getRankings(options = {}) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const queryParams = new URLSearchParams({
        metric: options.metric || 'revenue',
        timeRange: options.timeRange || '30d',
        order: options.order || 'desc'
      }).toString();

      const response = await apiFetch(`/multi-store/rankings?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error fetching store rankings:', error);
      }
      throw error;
    }
  },

  // Get inventory optimization recommendations
  async getInventoryOptimization(options = {}) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const queryParams = new URLSearchParams({
        includeTransferRecommendations: options.includeTransferRecommendations ? 'true' : 'false'
      }).toString();

      const response = await apiFetch(`/multi-store/inventory-optimization?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error fetching inventory optimization:', error);
      }
      throw error;
    }
  },

  // Connect a new store
  async connectStore(storeData) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const response = await apiFetch('/multi-store/connect', {
        method: 'POST',
        body: JSON.stringify(storeData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error connecting store:', error);
      }
      throw error;
    }
  },

  // Disconnect a store
  async disconnectStore(storeId) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const response = await apiFetch(`/multi-store/disconnect/${storeId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error disconnecting store:', error);
      }
      throw error;
    }
  },

  // Get detailed analytics for a specific store
  async getStoreAnalytics(storeId, options = {}) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        return { success: false, error: 'Backend unavailable' };
      }

      const queryParams = new URLSearchParams({
        timeRange: options.timeRange || '30d',
        metrics: options.metrics ? options.metrics.join(',') : 'all'
      }).toString();

      const response = await apiFetch(`/multi-store/analytics/${storeId}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error fetching store analytics:', error);
      }
      throw error;
    }
  },

  // Export multi-store data
  async exportData(options = {}) {
    try {
      const available = await isBackendAvailable();
      if (!available) {
        throw new Error('Backend unavailable');
      }

      const queryParams = new URLSearchParams({
        format: options.format || 'csv',
        timeRange: options.timeRange || '30d',
        includeStores: options.includeStores || 'all'
      }).toString();

      const response = await apiFetch(`/multi-store/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // For CSV export, return text directly
      if (options.format === 'csv') {
        return await response.text();
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[API] Error exporting data:', error);
      }
      throw error;
    }
  }
};
