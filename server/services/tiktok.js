import { queueRequest, withRetry } from '../middleware/rateLimiter.js';
import { getPlatformConnection, savePlatformConnection } from '../db/database.js';
import { log } from '../utils/logger.js';

const API_VERSION = 'v1.3';
const BASE_URL = 'https://business-api.tiktok.com/open_api';

export class TikTokService {
  constructor() {
    // Environment fallbacks
    this.appId = process.env.TIKTOK_APP_ID;
    this.appSecret = process.env.TIKTOK_APP_SECRET;
    this.accessToken = null;
    this.refreshToken = null;
    this.advertiserId = null;
    this.tokenExpiry = 0;
    this.shopDomain = null;
  }

  // Load credentials from database or environment
  loadCredentials(shopDomain) {
    this.shopDomain = shopDomain;
    
    if (shopDomain) {
      const connection = getPlatformConnection(shopDomain, 'tiktok');
      if (connection && connection.credentials) {
        this.accessToken = connection.credentials.accessToken;
        this.refreshToken = connection.credentials.refreshToken;
        this.advertiserId = connection.credentials.advertiserId;
        this.tokenExpiry = connection.credentials.expiresAt ? 
          new Date(connection.credentials.expiresAt).getTime() : 0;
        return true;
      }
    }
    
    // Fallback to environment variables
    return this.validateCredentials();
  }

  validateCredentials() {
    return !!(this.appId && this.appSecret && this.accessToken && this.advertiserId);
  }

  async getAccessToken() {
    // Check if current token is still valid (refresh 5 minutes before expiry)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available for TikTok');
    }

    try {
      const response = await fetch(`${BASE_URL}/${API_VERSION}/oauth2/refresh_token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: this.appId,
          secret: this.appSecret,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh TikTok token: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`TikTok token refresh error: ${data.message}`);
      }

      // Update tokens
      this.accessToken = data.data.access_token;
      this.refreshToken = data.data.refresh_token || this.refreshToken;
      this.tokenExpiry = Date.now() + (data.data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

      // Save updated credentials to database
      if (this.shopDomain) {
        const connection = getPlatformConnection(this.shopDomain, 'tiktok');
        if (connection) {
          const updatedCredentials = {
            ...connection.credentials,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expiresAt: new Date(this.tokenExpiry),
          };
          savePlatformConnection(this.shopDomain, 'tiktok', updatedCredentials);
        }
      }

      return this.accessToken;
    } catch (error) {
      log.error('[TikTok] Error refreshing access token:', error.message);
      throw error;
    }
  }

  async testConnection(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { 
        connected: false, 
        status: 'red', 
        error: 'TikTok API credentials not configured. Contact admin.'
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await withRetry(() =>
        queueRequest('tiktok', () =>
          fetch(`${BASE_URL}/${API_VERSION}/advertiser/info/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              advertiser_id: this.advertiserId,
              fields: ['name', 'status', 'currency']
            }),
          })
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
      log.error('[TikTok] Connection test failed:', error.message);
      return { connected: false, status: 'red', error: error.message };
    }
  }

  async fetchCampaigns(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'TikTok API credentials not configured' };
    }

    try {
      const accessToken = await this.getAccessToken();

      // First, get campaigns
      const campaignsResponse = await withRetry(() =>
        queueRequest('tiktok', () =>
          fetch(`${BASE_URL}/${API_VERSION}/campaign/get/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              advertiser_id: this.advertiserId,
              fields: ['campaign_id', 'campaign_name', 'status', 'objective_type'],
            }),
          })
        )
      );

      if (!campaignsResponse.ok) {
        throw new Error(`TikTok campaigns API error: ${campaignsResponse.status}`);
      }

      const campaignData = await campaignsResponse.json();

      if (campaignData.code !== 0) {
        throw new Error(`TikTok campaigns API error: ${campaignData.message}`);
      }

      const campaigns = campaignData.data?.list || [];

      // Get performance metrics for each campaign
      const campaignsWithMetrics = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            const metricsResponse = await withRetry(() =>
              queueRequest('tiktok', () =>
                fetch(`${BASE_URL}/${API_VERSION}/report/integrated/get/`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    advertiser_id: this.advertiserId,
                    dimensions: ['campaign_id'],
                    filters: [
                      {
                        field_name: 'campaign_id',
                        filter_type: 'IN',
                        filter_value: [campaign.campaign_id],
                      }
                    ],
                    start_date: dateRange.start,
                    end_date: dateRange.end,
                    metrics: [
                      'spend',
                      'impressions', 
                      'clicks',
                      'conversions',
                      'conversion_value',
                      'cpm',
                      'cpc',
                      'ctr'
                    ],
                    data_level: 'AUCTION_CAMPAIGN',
                  }),
                })
              )
            );

            let metrics = {
              spend: 0,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              conversionValue: 0,
              cpm: 0,
              cpc: 0,
              ctr: 0,
            };

            if (metricsResponse.ok) {
              const metricsData = await metricsResponse.json();
              if (metricsData.code === 0 && metricsData.data?.list?.length > 0) {
                const rawMetrics = metricsData.data.list[0].metrics;
                metrics = {
                  spend: parseFloat(rawMetrics.spend) || 0,
                  impressions: parseInt(rawMetrics.impressions) || 0,
                  clicks: parseInt(rawMetrics.clicks) || 0,
                  conversions: parseInt(rawMetrics.conversions) || 0,
                  conversionValue: parseFloat(rawMetrics.conversion_value) || 0,
                  cpm: parseFloat(rawMetrics.cpm) || 0,
                  cpc: parseFloat(rawMetrics.cpc) || 0,
                  ctr: parseFloat(rawMetrics.ctr) || 0,
                };
              }
            }

            return this.normalizeCampaign(campaign, metrics);
          } catch (error) {
            log.warn(`[TikTok] Failed to get metrics for campaign ${campaign.campaign_id}:`, error.message);
            return this.normalizeCampaign(campaign, {});
          }
        })
      );

      return {
        connected: true,
        data: campaignsWithMetrics.sort((a, b) => b.spend - a.spend),
      };
    } catch (error) {
      log.error('[TikTok] Error fetching campaigns:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchDailyMetrics(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'TikTok API credentials not configured' };
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await withRetry(() =>
        queueRequest('tiktok', () =>
          fetch(`${BASE_URL}/${API_VERSION}/report/integrated/get/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              advertiser_id: this.advertiserId,
              dimensions: ['stat_time_day'],
              start_date: dateRange.start,
              end_date: dateRange.end,
              metrics: [
                'spend',
                'impressions',
                'clicks',
                'conversions', 
                'conversion_value',
                'cpm',
                'cpc',
                'ctr'
              ],
              data_level: 'AUCTION_ADVERTISER',
            }),
          })
        )
      );

      if (!response.ok) {
        throw new Error(`TikTok daily metrics API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`TikTok daily metrics API error: ${data.message}`);
      }

      return {
        connected: true,
        data: (data.data?.list || [])
          .map((item) => this.normalizeMetrics(item))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      };
    } catch (error) {
      log.error('[TikTok] Error fetching daily metrics:', error.message);
      return { connected: false, error: error.message };
    }
  }

  normalizeCampaign(campaign, metrics = {}) {
    const spend = parseFloat(metrics.spend) || 0;
    const clicks = parseInt(metrics.clicks) || 0;
    const impressions = parseInt(metrics.impressions) || 0;
    const conversions = parseInt(metrics.conversions) || 0;
    const conversionValue = parseFloat(metrics.conversionValue) || 0;

    return {
      id: campaign.campaign_id,
      name: campaign.campaign_name,
      type: campaign.objective_type || 'CONVERSIONS',
      status: campaign.status,
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

  normalizeMetrics(item) {
    const dimensions = item.dimensions || {};
    const metrics = item.metrics || {};

    const spend = parseFloat(metrics.spend) || 0;
    const clicks = parseInt(metrics.clicks) || 0;
    const impressions = parseInt(metrics.impressions) || 0;
    const conversions = parseInt(metrics.conversions) || 0;
    const conversionValue = parseFloat(metrics.conversion_value) || 0;

    return {
      date: dimensions.stat_time_day,
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