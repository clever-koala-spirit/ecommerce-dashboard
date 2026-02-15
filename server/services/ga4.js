import { queueRequest, withRetry } from '../middleware/rateLimiter.js';
import { getPlatformConnection } from '../db/database.js';

export class GA4Service {
  constructor() {
    // Fallback to environment variables if available
    this.propertyId = process.env.GA4_PROPERTY_ID;
    this.clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
    this.shopDomain = null;
  }

  // Load credentials from database or environment
  loadCredentials(shopDomain) {
    this.shopDomain = shopDomain;
    
    if (shopDomain) {
      const connection = getPlatformConnection(shopDomain, 'ga4');
      if (connection && connection.credentials) {
        this.accessToken = connection.credentials.accessToken;
        this.refreshToken = connection.credentials.refreshToken;
        this.tokenExpiry = connection.credentials.expiresAt ? new Date(connection.credentials.expiresAt).getTime() : 0;
        this.propertyId = connection.credentials.propertyId || this.propertyId;
        return true;
      }
    }
    
    // Fallback to environment variables - requires property ID
    return this.validateCredentials();
  }

  validateCredentials() {
    return !!(
      this.propertyId &&
      this.clientId &&
      this.clientSecret &&
      (this.refreshToken || this.accessToken)
    );
  }

  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 min before expiry

      return this.accessToken;
    } catch (error) {
      console.error('[GA4] Error getting access token:', error.message);
      throw error;
    }
  }

  async testConnection(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, status: 'red', error: 'Missing credentials or property ID' };
    }

    try {
      const accessToken = await this.getAccessToken();

      // Test by fetching property metadata
      const response = await withRetry(() =>
        queueRequest('ga4', () =>
          fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}/metadata`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          )
        )
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          connected: false,
          status: 'red',
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      return {
        connected: true,
        status: 'green',
        message: `GA4 Property ${this.propertyId}`,
      };
    } catch (error) {
      return { connected: false, status: 'red', error: error.message };
    }
  }

  async fetchDailyMetrics(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing credentials' };
    }

    try {
      const accessToken = await this.getAccessToken();

      const body = {
        dateRanges: [
          {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        ],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalRevenue' },
          { name: 'conversions' },
        ],
      };

      const response = await withRetry(() =>
        queueRequest('ga4', () =>
          fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }
          )
        )
      );

      if (!response.ok) {
        throw new Error(`GA4 API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        connected: true,
        data: this.normalizeMetrics(data),
      };
    } catch (error) {
      console.error('[GA4] Error fetching daily metrics:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchChannelBreakdown(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing credentials' };
    }

    try {
      const accessToken = await this.getAccessToken();

      const body = {
        dateRanges: [
          {
            startDate: dateRange.start,
            endDate: dateRange.end,
          },
        ],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalRevenue' },
          { name: 'conversions' },
        ],
      };

      const response = await withRetry(() =>
        queueRequest('ga4', () =>
          fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }
          )
        )
      );

      if (!response.ok) {
        throw new Error(`GA4 API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        connected: true,
        data: this.normalizeChannels(data),
      };
    } catch (error) {
      console.error('[GA4] Error fetching channel breakdown:', error.message);
      return { connected: false, error: error.message };
    }
  }

  normalizeMetrics(data) {
    if (!data.rows) return [];

    return data.rows.map((row) => {
      const date = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value) || 0;
      const revenue = parseFloat(row.metricValues[1].value) || 0;
      const conversions = parseInt(row.metricValues[2].value) || 0;

      return {
        date,
        sessions,
        revenue: Math.round(revenue * 100) / 100,
        conversions,
        revenuePerSession:
          sessions > 0 ? Math.round((revenue / sessions) * 100) / 100 : 0,
      };
    });
  }

  normalizeChannels(data) {
    if (!data.rows) return [];

    return data.rows.map((row) => {
      const channel = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value) || 0;
      const revenue = parseFloat(row.metricValues[1].value) || 0;
      const conversions = parseInt(row.metricValues[2].value) || 0;

      return {
        channel,
        sessions,
        revenue: Math.round(revenue * 100) / 100,
        conversions,
        revenuePerSession:
          sessions > 0 ? Math.round((revenue / sessions) * 100) / 100 : 0,
      };
    });
  }
}

export const ga4Service = new GA4Service();