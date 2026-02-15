import { queueRequest, withRetry } from '../middleware/rateLimiter.js';
import { getPlatformConnection } from '../db/database.js';

const API_VERSION = 'v19.0';
const FIELDS = 'campaign_id,campaign_name,spend,impressions,clicks,cpc,ctr,actions,action_values';

export class MetaService {
  constructor() {
    // Fallback to environment variables if available
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.adAccountId = process.env.META_AD_ACCOUNT_ID;
    this.businessId = process.env.META_BUSINESS_ID;
    this.shopDomain = null;
  }

  // Load credentials from database or environment
  loadCredentials(shopDomain) {
    this.shopDomain = shopDomain;
    
    if (shopDomain) {
      const connection = getPlatformConnection(shopDomain, 'meta');
      if (connection && connection.credentials) {
        this.accessToken = connection.credentials.accessToken;
        this.adAccountId = connection.credentials.adAccountId;
        return true;
      }
    }
    
    // Fallback to environment variables (likely not configured)
    return this.validateCredentials();
  }

  validateCredentials() {
    return !!(this.accessToken && this.adAccountId);
  }

  async testConnection(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { 
        connected: false, 
        status: 'red', 
        error: 'Meta Ads API credentials not configured. Contact admin.' 
      };
    }

    try {
      const response = await withRetry(() =>
        queueRequest('meta', () =>
          fetch(
            `https://graph.facebook.com/${API_VERSION}/${this.adAccountId}?access_token=${this.accessToken}`
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

      return {
        connected: true,
        status: 'green',
        message: data.name || 'Meta Ads Account',
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
      const campaigns = [];
      let after = null;
      const startDate = this.formatDateForMeta(dateRange.start);
      const endDate = this.formatDateForMeta(dateRange.end);

      while (true) {
        const url = new URL(
          `https://graph.facebook.com/${API_VERSION}/${this.adAccountId}/campaigns`
        );

        url.searchParams.append('fields', FIELDS);
        url.searchParams.append('access_token', this.accessToken);
        url.searchParams.append('limit', 100);

        if (after) {
          url.searchParams.append('after', after);
        }

        const response = await withRetry(() => queueRequest('meta', () => fetch(url)));

        if (!response.ok) {
          throw new Error(`Meta API error: ${response.status}`);
        }

        const data = await response.json();

        campaigns.push(...(data.data || []).map((c) => this.normalizeCampaign(c)));

        if (!data.paging?.cursors?.after) {
          break;
        }

        after = data.paging.cursors.after;
      }

      return {
        connected: true,
        data: campaigns
          .filter((c) => c.spend > 0)
          .sort((a, b) => b.spend - a.spend),
      };
    } catch (error) {
      console.error('[Meta] Error fetching campaigns:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchDailyInsights(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing credentials' };
    }

    try {
      const startDate = this.formatDateForMeta(dateRange.start);
      const endDate = this.formatDateForMeta(dateRange.end);

      const url = new URL(
        `https://graph.facebook.com/${API_VERSION}/${this.adAccountId}/insights`
      );

      url.searchParams.append('fields', 'spend,impressions,clicks,actions,action_values');
      url.searchParams.append('access_token', this.accessToken);
      url.searchParams.append('time_range', JSON.stringify({ since: startDate, until: endDate }));
      url.searchParams.append('time_increment', 1);
      url.searchParams.append('limit', 1000);

      const response = await withRetry(() => queueRequest('meta', () => fetch(url)));

      if (!response.ok) {
        throw new Error(`Meta API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        connected: true,
        data: (data.data || [])
          .map((insight) => this.normalizeInsight(insight, startDate, endDate))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      };
    } catch (error) {
      console.error('[Meta] Error fetching daily insights:', error.message);
      return { connected: false, error: error.message };
    }
  }

  normalizeCampaign(campaign) {
    const spend = parseFloat(campaign.spend) || 0;
    const impressions = parseInt(campaign.impressions) || 0;
    const clicks = parseInt(campaign.clicks) || 0;
    const revenue =
      parseFloat(
        campaign.action_values?.find?.((a) => a.action_type === 'purchase')?.value
      ) || 0;

    return {
      id: campaign.campaign_id,
      name: campaign.campaign_name,
      spend: spend,
      impressions: impressions,
      clicks: clicks,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      revenue: revenue,
      roas: spend > 0 ? revenue / spend : 0,
      status: 'active',
    };
  }

  normalizeInsight(insight, startDate, endDate) {
    const spend = parseFloat(insight.spend) || 0;
    const impressions = parseInt(insight.impressions) || 0;
    const clicks = parseInt(insight.clicks) || 0;
    const revenue =
      parseFloat(
        insight.action_values?.find?.((a) => a.action_type === 'purchase')?.value
      ) || 0;

    const date = insight.date_start || startDate;

    return {
      date,
      spend: spend,
      impressions: impressions,
      clicks: clicks,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      purchases: Math.round(revenue / 85),
      revenue: revenue,
      roas: spend > 0 ? revenue / spend : 0,
      cpa: Math.round(revenue / 85) > 0 ? spend / Math.round(revenue / 85) : 0,
    };
  }

  formatDateForMeta(dateString) {
    return dateString.split('T')[0];
  }
}

export const metaService = new MetaService();