import { queueRequest, withRetry } from '../middleware/rateLimiter.js';

const SHOPIFY_API_VERSION = '2024-01';

export class ShopifyService {
  constructor() {
    this.storeUrl = process.env.SHOPIFY_STORE_URL;
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.connected = this.validateCredentials();
  }

  validateCredentials() {
    return !!(this.storeUrl && this.accessToken);
  }

  async testConnection() {
    if (!this.connected) {
      return { connected: false, status: 'red', error: 'Missing credentials' };
    }

    try {
      const response = await queueRequest('shopify', () =>
        fetch(`https://${this.storeUrl}/admin/api/${SHOPIFY_API_VERSION}/shop.json`, {
          headers: this.getHeaders(),
        })
      );

      if (!response.ok) {
        return {
          connected: false,
          status: 'red',
          error: `HTTP ${response.status}`,
        };
      }

      return { connected: true, status: 'green', shopName: (await response.json()).shop.name };
    } catch (error) {
      return { connected: false, status: 'red', error: error.message };
    }
  }

  async fetchOrders(dateRange) {
    if (!this.connected) {
      return { connected: false };
    }

    try {
      const orders = [];
      let cursor = null;
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      while (true) {
        const query = this.buildOrdersQuery(cursor, startDate, endDate);

        const response = await withRetry(() =>
          queueRequest('shopify', () =>
            fetch(
              `https://${this.storeUrl}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
              {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ query }),
              }
            )
          )
        );

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
        }

        const edges = data.data.orders.edges || [];
        orders.push(
          ...edges.map((edge) => this.normalizeOrder(edge.node))
        );

        if (!data.data.orders.pageInfo.hasNextPage) {
          break;
        }

        cursor = edges[edges.length - 1].cursor;
      }

      return {
        connected: true,
        data: this.aggregateOrdersByDate(orders),
      };
    } catch (error) {
      console.error('[Shopify] Error fetching orders:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchProducts() {
    if (!this.connected) {
      return { connected: false };
    }

    try {
      const products = [];
      let cursor = null;

      while (true) {
        const query = this.buildProductsQuery(cursor);

        const response = await withRetry(() =>
          queueRequest('shopify', () =>
            fetch(
              `https://${this.storeUrl}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
              {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ query }),
              }
            )
          )
        );

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
        }

        const edges = data.data.products.edges || [];
        products.push(...edges.map((edge) => this.normalizeProduct(edge.node)));

        if (!data.data.products.pageInfo.hasNextPage) {
          break;
        }

        cursor = edges[edges.length - 1].cursor;
      }

      return {
        connected: true,
        data: products.sort((a, b) => b.revenue - a.revenue).slice(0, 20),
      };
    } catch (error) {
      console.error('[Shopify] Error fetching products:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async fetchCustomers(dateRange) {
    if (!this.connected) {
      return { connected: false };
    }

    try {
      const customers = [];
      let cursor = null;
      const startDate = new Date(dateRange.start);

      while (true) {
        const query = this.buildCustomersQuery(cursor, startDate);

        const response = await withRetry(() =>
          queueRequest('shopify', () =>
            fetch(
              `https://${this.storeUrl}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
              {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ query }),
              }
            )
          )
        );

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
        }

        const edges = data.data.customers.edges || [];
        customers.push(
          ...edges.map((edge) => this.normalizeCustomer(edge.node))
        );

        if (!data.data.customers.pageInfo.hasNextPage) {
          break;
        }

        cursor = edges[edges.length - 1].cursor;
      }

      return { connected: true, data: customers };
    } catch (error) {
      console.error('[Shopify] Error fetching customers:', error.message);
      return { connected: false, error: error.message };
    }
  }

  getHeaders() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    };
  }

  buildOrdersQuery(cursor, startDate, endDate) {
    const after = cursor ? `after: "${cursor}"` : '';
    const dateFilter = `created:>='${startDate.toISOString().split('T')[0]}' created:<='${endDate.toISOString().split('T')[0]}'`;

    return `
      query {
        orders(first: 250, ${after}, query: "${dateFilter}") {
          edges {
            cursor
            node {
              id
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalTotalSet {
                      shopMoney {
                        amount
                      }
                    }
                  }
                }
              }
              customer {
                firstName
                email
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
  }

  buildProductsQuery(cursor) {
    const after = cursor ? `after: "${cursor}"` : '';

    return `
      query {
        products(first: 250, ${after}) {
          edges {
            cursor
            node {
              id
              title
              totalInventory
              priceRange {
                minVariantPrice {
                  amount
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
  }

  buildCustomersQuery(cursor, startDate) {
    const after = cursor ? `after: "${cursor}"` : '';
    const dateFilter = `created:>='${startDate.toISOString().split('T')[0]}'`;

    return `
      query {
        customers(first: 250, ${after}, query: "${dateFilter}") {
          edges {
            cursor
            node {
              id
              firstName
              email
              totalSpent
              numberOfOrders
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
  }

  normalizeOrder(order) {
    return {
      id: order.id,
      date: order.createdAt.split('T')[0],
      revenue: parseFloat(order.totalPriceSet.shopMoney.amount),
      items: order.lineItems.edges.length,
      customer: order.customer?.firstName || 'Anonymous',
    };
  }

  normalizeProduct(product) {
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    const revenue = price * product.totalInventory * 0.5; // Estimate

    return {
      id: product.id,
      title: product.title,
      revenue: Math.round(revenue * 100) / 100,
      inventory: product.totalInventory,
      price: price,
    };
  }

  normalizeCustomer(customer) {
    return {
      id: customer.id,
      name: customer.firstName,
      email: customer.email,
      totalSpent: parseFloat(customer.totalSpent),
      orderCount: customer.numberOfOrders,
    };
  }

  aggregateOrdersByDate(orders) {
    const aggregated = {};

    orders.forEach((order) => {
      if (!aggregated[order.date]) {
        aggregated[order.date] = {
          date: order.date,
          orders: 0,
          revenue: 0,
          newCustomers: 0,
          returningCustomers: 0,
          aov: 0,
          cogs: 0,
          shipping: 0,
          transactionFees: 0,
          refunds: 0,
          refundAmount: 0,
        };
      }

      aggregated[order.date].orders += 1;
      aggregated[order.date].revenue += order.revenue;
      aggregated[order.date].transactionFees += order.revenue * 0.029;
    });

    return Object.values(aggregated)
      .map((day) => ({
        ...day,
        aov: day.orders > 0 ? Math.round((day.revenue / day.orders) * 100) / 100 : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

export const shopifyService = new ShopifyService();
