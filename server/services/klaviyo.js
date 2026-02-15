import { queueRequest, withRetry } from '../middleware/rateLimiter.js';
import { getPlatformConnection } from '../db/database.js';

const API_VERSION = '2024-10-15';
const BASE_URL = 'https://a.klaviyo.com/api';

export class KlaviyoService {
  constructor() {
    // Fallback to environment variable if available
    this.apiKey = process.env.KLAVIYO_API_KEY;
    this.shopDomain = null;
  }

  // Load credentials from database or environment
  loadCredentials(shopDomain) {
    this.shopDomain = shopDomain;
    
    if (shopDomain) {
      const connection = getPlatformConnection(shopDomain, 'klaviyo');
      if (connection && connection.credentials) {
        this.apiKey = connection.credentials.accessToken; // Klaviyo API key stored as accessToken
        return true;
      }
    }
    
    // Fallback to environment variable
    return this.validateCredentials();
  }

  validateCredentials() {
    return !!this.apiKey;
  }

  async testConnection(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, status: 'red', error: 'Missing API key' };
    }

    try {
      const response = await withRetry(() =>
        queueRequest('klaviyo', () =>
          fetch(`${BASE_URL}/accounts/`, {
            headers: this.getHeaders(),
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
      const accountName = data?.data?.[0]?.attributes?.contact_information?.organization_name
        || data?.data?.[0]?.id
        || 'Klaviyo Account';

      return {
        connected: true,
        status: 'green',
        message: accountName,
      };
    } catch (error) {
      return { connected: false, status: 'red', error: error.message };
    }
  }

  async fetchFlows(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing API key' };
    }

    try {
      const flows = [];
      let cursor = null;

      while (true) {
        const url = new URL(`${BASE_URL}/flows/`);
        url.searchParams.append('fields[flows]', 'name,status,created');
        url.searchParams.append('page[size]', '100');

        if (cursor) {
          url.searchParams.append('page[cursor]', cursor);
        }

        const response = await withRetry(() =>
          queueRequest('klaviyo', () =>
            fetch(url.toString(), {
              headers: this.getHeaders(),
            })
          )
        );

        if (!response.ok) {
          throw new Error(`Klaviyo API error: ${response.status}`);
        }

        const data = await response.json();

        flows.push(
          ...(data.data || []).map((flow) => this.normalizeFlow(flow))
        );

        if (!data.links?.next) {
          break;
        }

        const nextUrl = new URL(data.links.next);
        cursor = nextUrl.searchParams.get('page[cursor]');
      }

      return { connected: true, data: flows };
    } catch (error) {
      console.error('[Klaviyo] Error fetching flows:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchCampaigns(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing API key' };
    }

    try {
      const campaigns = [];
      let cursor = null;

      while (true) {
        const url = new URL(`${BASE_URL}/campaigns/`);
        url.searchParams.append('fields[campaigns]', 'name,status,created,updated');
        url.searchParams.append('page[size]', '100');

        if (cursor) {
          url.searchParams.append('page[cursor]', cursor);
        }

        const response = await withRetry(() =>
          queueRequest('klaviyo', () =>
            fetch(url.toString(), {
              headers: this.getHeaders(),
            })
          )
        );

        if (!response.ok) {
          throw new Error(`Klaviyo API error: ${response.status}`);
        }

        const data = await response.json();

        campaigns.push(
          ...(data.data || [])
            .filter((campaign) => {
              const created = new Date(campaign.attributes.created);
              return (
                created >= new Date(dateRange.start) &&
                created <= new Date(dateRange.end)
              );
            })
            .map((campaign) => this.normalizeCampaign(campaign))
        );

        if (!data.links?.next) {
          break;
        }

        const nextUrl = new URL(data.links.next);
        cursor = nextUrl.searchParams.get('page[cursor]');
      }

      return { connected: true, data: campaigns };
    } catch (error) {
      console.error('[Klaviyo] Error fetching campaigns:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchMetrics(dateRange, shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing API key' };
    }

    try {
      const url = new URL(`${BASE_URL}/metrics/`);
      url.searchParams.append('fields[metrics]', 'name,created');
      url.searchParams.append('page[size]', '100');

      const response = await withRetry(() =>
        queueRequest('klaviyo', () =>
          fetch(url.toString(), {
            headers: this.getHeaders(),
          })
        )
      );

      if (!response.ok) {
        throw new Error(`Klaviyo API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        connected: true,
        data: (data.data || [])
          .map((metric) => ({
            id: metric.id,
            name: metric.attributes.name,
            created: metric.attributes.created,
          }))
          .slice(0, 20),
      };
    } catch (error) {
      console.error('[Klaviyo] Error fetching metrics:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchListStats(shopDomain = null) {
    if (shopDomain) {
      this.loadCredentials(shopDomain);
    }

    if (!this.validateCredentials()) {
      return { connected: false, error: 'Missing API key' };
    }

    try {
      const lists = [];
      let cursor = null;

      while (true) {
        const url = new URL(`${BASE_URL}/lists/`);
        url.searchParams.append(
          'fields[lists]',
          'name,created,updated,profile_count'
        );
        url.searchParams.append('page[size]', '100');

        if (cursor) {
          url.searchParams.append('page[cursor]', cursor);
        }

        const response = await withRetry(() =>
          queueRequest('klaviyo', () =>
            fetch(url.toString(), {
              headers: this.getHeaders(),
            })
          )
        );

        if (!response.ok) {
          throw new Error(`Klaviyo API error: ${response.status}`);
        }

        const data = await response.json();

        lists.push(
          ...(data.data || []).map((list) => ({
            id: list.id,
            name: list.attributes.name,
            subscribers: list.attributes.profile_count || 0,
            created: list.attributes.created,
            updated: list.attributes.updated,
          }))
        );

        if (!data.links?.next) {
          break;
        }

        const nextUrl = new URL(data.links.next);
        cursor = nextUrl.searchParams.get('page[cursor]');
      }

      const totalSubscribers = lists.reduce((sum, l) => sum + l.subscribers, 0);

      return {
        connected: true,
        data: {
          lists: lists,
          totalSubscribers: totalSubscribers,
          totalLists: lists.length,
        },
      };
    } catch (error) {
      console.error('[Klaviyo] Error fetching list stats:', error.message);
      return { connected: false, error: error.message };
    }
  }

  normalizeFlow(flow) {
    return {
      id: flow.id,
      name: flow.attributes.name,
      status: flow.attributes.status,
      created: flow.attributes.created,
      revenue: 0, // Would need additional API call to get flow revenue
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
    };
  }

  normalizeCampaign(campaign) {
    const created = new Date(campaign.attributes.created);

    return {
      id: campaign.id,
      name: campaign.attributes.name,
      status: campaign.attributes.status,
      sentDate: created.toISOString().split('T')[0],
      sent: 0,
      opened: 0,
      clicked: 0,
      revenue: 0,
      openRate: 0,
      clickRate: 0,
    };
  }

  getHeaders() {
    return {
      'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
      'revision': API_VERSION,
      'Content-Type': 'application/json',
    };
  }
}

export const klaviyoService = new KlaviyoService();