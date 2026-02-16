import { mockData } from '../mock/mockData';

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

// Get dashboard data (combined from all sources)
export async function fetchDashboardData() {
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

    const response = await apiFetch('/data/dashboard');
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
      const mockDataMap = {
        shopify: mockData.shopify,
        meta: mockData.meta,
        google: mockData.google,
        klaviyo: mockData.klaviyo,
        ga4: mockData.ga4,
      };
      return {
        isLive: false,
        data: mockDataMap[source] || [],
      };
    }

    const response = await apiFetch(`/connections/${source}/data`);
    if (!response.ok) throw new Error('Failed to fetch source data');

    const responseData = await response.json();

    if (!responseData.connected) {
      const mockDataMap = {
        shopify: mockData.shopify,
        meta: mockData.meta,
        google: mockData.google,
        klaviyo: mockData.klaviyo,
        ga4: mockData.ga4,
      };
      return {
        isLive: false,
        data: mockDataMap[source] || [],
      };
    }

    return {
      isLive: true,
      data: responseData.data || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[API] Error fetching data for ${source}:`, error);
    }
    const mockDataMap = {
      shopify: mockData.shopify,
      meta: mockData.meta,
      google: mockData.google,
      klaviyo: mockData.klaviyo,
      ga4: mockData.ga4,
    };
    return {
      isLive: false,
      data: mockDataMap[source] || [],
      error: error.message,
    };
  }
}

// Get specific data endpoints
export async function fetchShopifyOrders() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: mockData.shopify };
    }

    const response = await apiFetch('/data/shopify/orders');
    if (!response.ok) throw new Error('Failed to fetch Shopify orders');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || mockData.shopify,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Shopify orders:', error);
    }
    return { isLive: false, data: mockData.shopify, error: error.message };
  }
}

export async function fetchMetaCampaigns() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: mockData.metaCampaigns };
    }

    const response = await apiFetch('/data/meta/campaigns');
    if (!response.ok) throw new Error('Failed to fetch Meta campaigns');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || mockData.metaCampaigns,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Meta campaigns:', error);
    }
    return { isLive: false, data: mockData.metaCampaigns, error: error.message };
  }
}

export async function fetchGoogleCampaigns() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: mockData.googleCampaigns };
    }

    const response = await apiFetch('/data/google/campaigns');
    if (!response.ok) throw new Error('Failed to fetch Google campaigns');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || mockData.googleCampaigns,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Google campaigns:', error);
    }
    return { isLive: false, data: mockData.googleCampaigns, error: error.message };
  }
}

export async function fetchKlaviyoFlows() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: mockData.klaviyoFlows };
    }

    const response = await apiFetch('/data/klaviyo/flows');
    if (!response.ok) throw new Error('Failed to fetch Klaviyo flows');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || mockData.klaviyoFlows,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching Klaviyo flows:', error);
    }
    return { isLive: false, data: mockData.klaviyoFlows, error: error.message };
  }
}

export async function fetchGA4Sessions() {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return { isLive: false, data: mockData.ga4 };
    }

    const response = await apiFetch('/data/ga4/sessions');
    if (!response.ok) throw new Error('Failed to fetch GA4 sessions');

    const data = await response.json();
    return {
      isLive: true,
      data: data.data || mockData.ga4,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching GA4 sessions:', error);
    }
    return { isLive: false, data: mockData.ga4, error: error.message };
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
