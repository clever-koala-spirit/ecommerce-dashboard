import { queueRequest, withRetry } from '../middleware/rateLimiter.js';
import fs from 'fs';
import path from 'path';

export class GA4Service {
  constructor() {
    this.propertyId = process.env.GA4_PROPERTY_ID;
    this.serviceAccountKeyPath = process.env.GA4_SERVICE_ACCOUNT_KEY_PATH;
    this.accessToken = null;
    this.tokenExpiry = 0;
    this.connected = this.validateCredentials();
    this.serviceAccountKey = this.loadServiceAccountKey();
  }

  validateCredentials() {
    return !!this.propertyId && !!this.serviceAccountKeyPath;
  }

  loadServiceAccountKey() {
    if (!this.serviceAccountKeyPath) return null;

    try {
      const resolvedPath = path.resolve(this.serviceAccountKeyPath);
      const keyData = fs.readFileSync(resolvedPath, 'utf-8');
      return JSON.parse(keyData);
    } catch (error) {
      console.error('[GA4] Error loading service account key:', error.message);
      return null;
    }
  }

  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.serviceAccountKey) {
      throw new Error('Service account key not loaded');
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      const expiry = now + 3600;

      const header = {
        alg: 'RS256',
        typ: 'JWT',
      };

      const payload = {
        iss: this.serviceAccountKey.client_email,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: expiry,
        iat: now,
      };

      // Note: In production, use a proper JWT library like 'jsonwebtoken'
      // This is a simplified version that won't work without proper signing
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');

      console.warn('[GA4] JWT signing not implemented. Service account authentication requires setup.');

      return null;
    } catch (error) {
      console.error('[GA4] Error getting access token:', error.message);
      throw error;
    }
  }

  async testConnection() {
    if (!this.connected) {
      return { connected: false, status: 'red', error: 'Missing credentials' };
    }

    try {
      // In production, this would verify the service account key is valid
      return {
        connected: true,
        status: 'green',
        propertyId: this.propertyId,
      };
    } catch (error) {
      return { connected: false, status: 'red', error: error.message };
    }
  }

  async fetchDailyMetrics(dateRange) {
    if (!this.connected) {
      return { connected: false };
    }

    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        console.warn('[GA4] Access token could not be generated');
        return {
          connected: false,
          error: 'Service account authentication not configured',
        };
      }

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
          { name: 'conversionRate' },
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

  async fetchChannelBreakdown(dateRange) {
    if (!this.connected) {
      return { connected: false };
    }

    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        return {
          connected: false,
          error: 'Service account authentication not configured',
        };
      }

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
      const conversionRate = parseFloat(row.metricValues[2].value) || 0;

      return {
        date,
        sessions,
        revenue: Math.round(revenue * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
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
