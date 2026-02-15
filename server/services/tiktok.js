import { queueRequest, withRetry } from '../middleware/rateLimiter.js';
import { getPlatformConnection } from '../db/database.js';

const API_VERSION = 'v1.3';
const BASE_URL = 'https://business-api.tiktok.com/open_api';

export class TikTokService {
  constructor() {
    // Fallback to environment variables if available
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    this.advertiserId = process.env.TIKTOK_ADVERTISER_ID;
    this.shopDomain = null;
  }

  // Load credentials from database or environment
  loadCredentials(shopDomain) {
    this.shopDomain = shopDomain;
    
    if (shopDomain) {
      const connection = getPlatformConnection(shopDomain, 'tiktok');
      if (connection && connection.credentials) {
        this.accessToken = connection.credentials.accessToken;
        this.advertiserId = connection.credentials.advertiserId;
        return true;
      }
    }
    
    // Fallback to environment variables (likely not configured)
    return this.validateCredentials();
  }

  validateCredentials() {
    return !!(this.accessToken && this.advertiserId);
  }

  async testConnection(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { 
        connected: false, 
        status: 'yellow', 
        error: 'Coming Soon - TikTok Ads integration is being developed',
        message: 'TikTok Ads - Coming Soon'
      };
    }

    try {
      const response = await withRetry(() =>
        queueRequest('tiktok', () =>
          fetch(
            `${BASE_URL}/${API_VERSION}/advertiser/info/`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
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

      const data = await response.json();

      if (data.code !== 0) {
        return {
          connected: false,
          status: 'red',
          error: `TikTok API error: ${data.message}`,
        };
      }

      const advertiser = data.data?.list?.[0];
      return {
        connected: true,
        status: 'green',
        message: advertiser?.name || `TikTok Advertiser ${this.advertiserId}`,
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
      return { connected: false, error: 'TikTok Ads integration coming soon' };
    }

    try {
      const response = await withRetry(() =>
        queueRequest('tiktok', () =>
          fetch(
            `${BASE_URL}/${API_VERSION}/campaign/get/`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          )
        )
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      const campaigns = (data.data?.list || [])
        .map((campaign) => this.normalizeCampaign(campaign))
        .sort((a, b) => b.spend - a.spend);

      return {
        connected: true,
        data: campaigns,
      };
    } catch (error) {
      console.error('[TikTok] Error fetching campaigns:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchDailyMetrics(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'TikTok Ads integration coming soon' };
    }

    try {
      const response = await withRetry(() =>
        queueRequest('tiktok', () =>
          fetch(
            `${BASE_URL}/${API_VERSION}/report/integrated/get/`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          )
        )
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`TikTok API error: ${data.message}`);
      }

      return {
        connected: true,
        data: (data.data?.list || [])
          .map((item) => this.normalizeMetrics(item))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      };
    } catch (error) {
      console.error('[TikTok] Error fetching daily metrics:', error.message);
      return { connected: false, error: error.message };
    }
  }

  normalizeCampaign(campaign) {
    return {
      id: campaign.campaign_id,
      name: campaign.campaign_name,
      status: campaign.status,
      spend: 0, // Would need additional API call for metrics
      clicks: 0,
      impressions: 0,
      conversions: 0,
      cpc: 0,
      ctr: 0,
      roas: 0,
      cpa: 0,
    };
  }

  normalizeMetrics(item) {
    const spend = parseFloat(item.spend) || 0;
    const clicks = parseInt(item.clicks) || 0;
    const impressions = parseInt(item.impressions) || 0;
    const conversions = parseInt(item.conversions) || 0;
    const conversionValue = parseFloat(item.conversion_value) || 0;

    return {
      date: item.stat_time_day,
      spend: Math.round(spend * 100) / 100,
      clicks: clicks,
      impressions: impressions,
      conversions: conversions,
      conversionValue: Math.round(conversionValue * 100) / 100,
      cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0,
      ctr: impressions > 0 ? Math.round(((clicks / impressions) * 100) * 100) / 100 : 0,
      roas: spend > 0 ? Math.round((conversionValue / spend) * 100) / 100 : 0,
      cpa: conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : 0,
    };
  }
}

export const tiktokService = new TikTokService();