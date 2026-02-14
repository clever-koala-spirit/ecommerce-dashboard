/**
 * Shopify App Bridge Provider
 * Wraps the app for embedded Shopify admin experience
 * Falls back gracefully for standalone mode (development/slayseason.com)
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ShopifyContext = createContext(null);

// Parse shop domain from URL params or localStorage
function getShopDomain() {
  const params = new URLSearchParams(window.location.search);
  const shopFromUrl = params.get('shop');

  if (shopFromUrl) {
    sessionStorage.setItem('shopDomain', shopFromUrl);
    return shopFromUrl;
  }

  return sessionStorage.getItem('shopDomain') || null;
}

// Check if we're running inside Shopify admin
function isEmbedded() {
  try {
    return window.top !== window.self;
  } catch {
    return true; // If we can't access top, we're probably embedded
  }
}

export function ShopifyProvider({ children }) {
  const [shop, setShop] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const embedded = isEmbedded();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  // Authenticated fetch — includes session token for embedded, falls back to X-Shop-Domain header
  const authenticatedFetch = useCallback(async (endpoint, options = {}) => {
    const shopDomain = shop?.domain || getShopDomain();
    let token = null;

    // Get session token from Shopify App Bridge if embedded
    if (embedded && window.shopify) {
      try {
        token = await window.shopify.idToken();
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[ShopifyProvider] Failed to get session token:', err.message);
        }
        // Continue without token — will fall back to X-Shop-Domain header
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(shopDomain && { 'X-Shop-Domain': shopDomain }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      // Redirect to auth if not authenticated
      const authUrl = `${apiUrl}/auth?shop=${shopDomain}`;
      if (embedded) {
        // In embedded mode, redirect the parent frame
        try {
          window.top.location.href = authUrl;
        } catch {
          window.location.href = authUrl;
        }
      } else {
        window.location.href = authUrl;
      }
      throw new Error('Authentication required');
    }

    return response;
  }, [shop, apiUrl, embedded]);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      const shopDomain = getShopDomain();

      if (!shopDomain) {
        // No shop domain — show connect page
        setIsLoading(false);
        return;
      }

      try {
        let token = null;

        // Get session token from Shopify App Bridge if embedded
        if (embedded && window.shopify) {
          try {
            token = await window.shopify.idToken();
          } catch (err) {
            if (import.meta.env.DEV) {
              console.warn('[ShopifyProvider] Failed to get session token during auth check:', err.message);
            }
          }
        }

        const headers = {
          'X-Shop-Domain': shopDomain,
          ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const response = await fetch(`${apiUrl}/auth/session?shop=${shopDomain}`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setShop(data.shop);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[ShopifyProvider] Auth check failed:', err);
        }
        setError('Failed to verify authentication');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [apiUrl, embedded]);

  // Connect to Shopify (start OAuth)
  const connectShop = useCallback((shopDomain) => {
    if (!shopDomain) return;

    // Ensure .myshopify.com suffix
    const domain = shopDomain.includes('.myshopify.com')
      ? shopDomain
      : `${shopDomain}.myshopify.com`;

    window.location.href = `${apiUrl}/auth?shop=${domain}`;
  }, [apiUrl]);

  // Disconnect / logout
  const disconnect = useCallback(() => {
    sessionStorage.removeItem('shopDomain');
    setShop(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    shop,
    isAuthenticated,
    isLoading,
    isEmbedded: embedded,
    error,
    authenticatedFetch,
    connectShop,
    disconnect,
  };

  return (
    <ShopifyContext.Provider value={value}>
      {children}
    </ShopifyContext.Provider>
  );
}

export function useShopify() {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopify must be used within a ShopifyProvider');
  }
  return context;
}

export default ShopifyProvider;
