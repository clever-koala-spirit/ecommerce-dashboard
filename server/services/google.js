import { queueRequest, withRetry } from '../middleware/rateLimiter.js';
import { getPlatformConnection } from '../db/database.js';

export class GoogleAdsService {
  constructor() {
    // Fallback to environment variables if available
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    this.clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    this.accessToken = null;
    this.tokenExpiry = 0;
    this.shopDomain = null;
  }

  // Load credentials from database or environment
  loadCredentials(shopDomain) {
    this.shopDomain = shopDomain;
    
    if (shopDomain) {
      const connection = getPlatformConnection(shopDomain, 'google');
      if (connection && connection.credentials) {
        this.accessToken = connection.credentials.accessToken;
        this.refreshToken = connection.credentials.refreshToken;
        this.tokenExpiry = connection.credentials.expiresAt ? new Date(connection.credentials.expiresAt).getTime() : 0;
        this.customerId = connection.credentials.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
        return true;
      }
    }
    
    // Fallback to environment variables
    return this.validateCredentials();
  }

  validateCredentials() {
    return !!(
      this.developerToken &&
      this.clientId &&
      this.clientSecret &&
      (this.refreshToken || this.accessToken) &&
      this.customerId
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
      console.error('[Google Ads] Error getting access token:', error.message);
      throw error;
    }
  }

  async testConnection(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, status: 'red', error: 'Missing credentials' };
    }

    if (!this.developerToken) {
      return { 
        connected: false, 
        status: 'red', 
        error: 'Google Ads Developer Token required' 
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await withRetry(() =>
        queueRequest('google', () =>
          fetch('https://googleads.googleapis.com/v20/customers:listAccessibleCustomers', {
            headers: this.getHeaders(accessToken),
          })
        )
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          connected: false,
          status: 'red',
          error: `Google Ads API rejected request (HTTP ${response.status}). Developer token may need Basic Access approval.`,
        };
      }

      return {
        connected: true,
        status: 'green',
        message: `Google Ads (${this.customerId})`,
      };
    } catch (error) {
      return { connected: false, status: 'red', error: error.message };
    }
  }

  async fetchCampaigns(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing credentials' };
    }

    try {
      const accessToken = await this.getAccessToken();

      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.cost_micros,
          metrics.clicks,
          metrics.impressions,
          metrics.conversions,
          metrics.all_conversions_value
        FROM campaign
        WHERE campaign.status != REMOVED
          AND segments.date >= '${dateRange.start}'
          AND segments.date <= '${dateRange.end}'
      `;

      const customerId = this.customerId.replace(/-/g, '');

      const response = await withRetry(() =>
        queueRequest('google', () =>
          fetch(`https://googleads.googleapis.com/v20/customers/${customerId}/googleAds:search`, {
            method: 'POST',
            headers: this.getHeaders(accessToken),
            body: JSON.stringify({ query }),
          })
        )
      );

      if (!response.ok) {
        throw new Error(`Google Ads API error: ${response.status}`);
      }

      const data = await response.json();

      const campaigns = (data.results || [])
        .map((result) => this.normalizeCampaign(result.campaign, result.metrics))
        .sort((a, b) => b.spend - a.spend);

      return {
        connected: true,
        data: campaigns,
      };
    } catch (error) {
      console.error('[Google Ads] Error fetching campaigns:', error.message);
      return { connected: false, error: error.message };
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

      const query = `
        SELECT
          segments.date,
          metrics.cost_micros,
          metrics.clicks,
          metrics.impressions,
          metrics.conversions,
          metrics.all_conversions_value
        FROM campaign
        WHERE segments.date >= '${dateRange.start}'
          AND segments.date <= '${dateRange.end}'
      `;

      const customerId = this.customerId.replace(/-/g, '');

      const response = await withRetry(() =>
        queueRequest('google', () =>
          fetch(`https://googleads.googleapis.com/v20/customers/${customerId}/googleAds:search`, {
            method: 'POST',
            headers: this.getHeaders(accessToken),
            body: JSON.stringify({ query }),
          })
        )
      );

      if (!response.ok) {
        throw new Error(`Google Ads API error: ${response.status}`);
      }

      const data = await response.json();

      const aggregated = {};

      (data.results || []).forEach((result) => {
        const date = result.segments.date;
        if (!aggregated[date]) {
          aggregated[date] = {
            date,
            spend: 0,
            clicks: 0,
            impressions: 0,
            conversions: 0,
            conversionValue: 0,
          };
        }

        const metrics = result.metrics;
        aggregated[date].spend += Number(metrics.cost_micros || 0) / 1000000;
        aggregated[date].clicks += Number(metrics.clicks || 0);
        aggregated[date].impressions += Number(metrics.impressions || 0);
        aggregated[date].conversions += Number(metrics.conversions || 0);
        aggregated[date].conversionValue += Number(metrics.all_conversions_value || 0);
      });

      return {
        connected: true,
        data: Object.values(aggregated)
          .map((day) => ({
            date: day.date,
            spend: Math.round(day.spend * 100) / 100,
            clicks: day.clicks,
            impressions: day.impressions,
            cpc: day.clicks > 0 ? Math.round((day.spend / day.clicks) * 100) / 100 : 0,
            ctr: day.impressions > 0 ? Math.round(((day.clicks / day.impressions) * 100) * 100) / 100 : 0,
            conversions: day.conversions,
            conversionValue: Math.round(day.conversionValue * 100) / 100,
            roas: day.spend > 0 ? Math.round((day.conversionValue / day.spend) * 100) / 100 : 0,
            cpa: day.conversions > 0 ? Math.round((day.spend / day.conversions) * 100) / 100 : 0,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      };
    } catch (error) {
      console.error('[Google Ads] Error fetching daily metrics:', error.message);
      return { connected: false, error: error.message };
    }
  }

  normalizeCampaign(campaign, metrics) {
    const spend = Number(metrics?.cost_micros || 0) / 1000000;
    const clicks = Number(metrics?.clicks || 0);
    const impressions = Number(metrics?.impressions || 0);
    const conversions = Number(metrics?.conversions || 0);
    const conversionValue = Number(metrics?.all_conversions_value || 0);

    return {
      id: campaign.id,
      name: campaign.name,
      type: 'Search', // Would need to determine from campaign type
      status: campaign.status || 'ENABLED',
      spend: Math.round(spend * 100) / 100,
      clicks: clicks,
      impressions: impressions,
      cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0,
      ctr: impressions > 0 ? Math.round(((clicks / impressions) * 100) * 100) / 100 : 0,
      conversions: conversions,
      conversionValue: Math.round(conversionValue * 100) / 100,
      roas: spend > 0 ? Math.round((conversionValue / spend) * 100) / 100 : 0,
      cpa: conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : 0,
    };
  }

  getHeaders(accessToken) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'developer-token': this.developerToken,
    };
  }
}

export const googleAdsService = new GoogleAdsService();