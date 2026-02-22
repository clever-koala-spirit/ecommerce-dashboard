// Enhanced Inventory Analytics Service
// Provides comprehensive inventory tracking, analytics, and optimization
class InventoryAnalyticsService {
  constructor(dbAdapter, shopifyService) {
    this.db = dbAdapter;
    this.shopify = shopifyService;
  }

  // Get real-time inventory levels with analytics
  async getInventoryLevels(shopId, filters = {}) {
    try {
      console.log('🏪 Getting inventory levels for shop:', shopId);

      // Get Shopify products with inventory data
      const shopifyProducts = await this.shopify.fetchProducts();

      if (!shopifyProducts?.length) {
        return { products: [], summary: this.getEmptySummary() };
      }

      // Get sales velocity data from the last 90 days
      const salesData = await this.getSalesVelocityData(shopId, 90);
      
      // Get cost data if available
      const costData = await this.getCostData(shopId);

      // Process each product with enhanced analytics
      const processedProducts = [];
      
      for (const product of shopifyProducts) {
        if (!product.variants || product.variants.length === 0) continue;

        for (const variant of product.variants) {
          const analytics = await this.calculateVariantAnalytics(
            shopId, 
            product, 
            variant, 
            salesData, 
            costData
          );

          processedProducts.push({
            id: variant.id,
            product_id: product.id,
            title: product.title,
            variant_title: variant.title,
            sku: variant.sku,
            barcode: variant.barcode,
            vendor: product.vendor,
            product_type: product.product_type,
            handle: product.handle,
            created_at: product.created_at,
            
            // Inventory data
            inventory_quantity: variant.inventory_quantity || 0,
            inventory_policy: variant.inventory_policy,
            inventory_management: variant.inventory_management,
            inventory_item_id: variant.inventory_item_id,
            
            // Pricing
            price: parseFloat(variant.price),
            compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
            cost_per_item: costData[variant.id]?.cost || null,
            
            // Enhanced analytics
            ...analytics
          });
        }
      }

      // Apply filters
      let filteredProducts = this.applyFilters(processedProducts, filters);

      // Sort by specified criteria
      filteredProducts = this.sortProducts(filteredProducts, filters.sort_by || 'stock_status');

      // Generate summary statistics
      const summary = this.generateInventorySummary(filteredProducts);

      return {
        products: filteredProducts,
        summary,
        metadata: {
          total_products: filteredProducts.length,
          filters_applied: Object.keys(filters).length,
          last_updated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Error getting inventory levels:', error);
      throw new Error(`Failed to get inventory levels: ${error.message}`);
    }
  }

  // Calculate comprehensive analytics for a variant
  async calculateVariantAnalytics(shopId, product, variant, salesData, costData) {
    const variantSales = salesData[variant.id] || { quantity: 0, revenue: 0, orders: 0 };
    const dailySales = variantSales.quantity / 90; // Average daily sales over 90 days
    const currentStock = variant.inventory_quantity || 0;
    const price = parseFloat(variant.price);
    const cost = costData[variant.id]?.cost || 0;

    // Stock status determination
    const stockStatus = this.determineStockStatus(currentStock, dailySales);
    
    // Days of inventory remaining
    const daysRemaining = dailySales > 0 ? Math.floor(currentStock / dailySales) : 999;
    
    // Velocity classification
    const velocityClass = this.classifyVelocity(dailySales, price);
    
    // Reorder calculations
    const reorderPoint = this.calculateReorderPoint(dailySales, 14, 7); // 14 day lead time, 7 day safety stock
    const reorderQuantity = this.calculateReorderQuantity(dailySales, 30, reorderPoint, currentStock);
    
    // Turnover calculations (based on 90-day period)
    const avgInventory = currentStock; // Simplified - in real implementation, use historical average
    const inventoryTurnover = avgInventory > 0 ? (variantSales.quantity / avgInventory) * 4 : 0; // Annualized
    
    // Dead stock analysis
    const isDead = dailySales === 0 && currentStock > 0;
    const isSlowMoving = dailySales > 0 && dailySales < 0.1 && currentStock > 30; // Less than 1 sale per 10 days
    
    // Financial metrics
    const stockValue = currentStock * cost;
    const potentialRevenue = currentStock * price;
    const profitMargin = cost > 0 ? ((price - cost) / price) * 100 : 0;

    // Opportunity analysis
    const stockoutRisk = this.calculateStockoutRisk(currentStock, dailySales, 14);
    const excessRisk = this.calculateExcessRisk(currentStock, dailySales, 90);

    return {
      // Sales performance
      sales_velocity: dailySales,
      velocity_class: velocityClass,
      total_sales_90d: variantSales.quantity,
      total_revenue_90d: variantSales.revenue,
      total_orders_90d: variantSales.orders,
      
      // Stock analysis
      stock_status: stockStatus,
      days_remaining: daysRemaining,
      is_dead_stock: isDead,
      is_slow_moving: isSlowMoving,
      
      // Reorder management
      reorder_point: reorderPoint,
      reorder_quantity: reorderQuantity,
      needs_reorder: currentStock <= reorderPoint,
      
      // Turnover metrics
      inventory_turnover: inventoryTurnover,
      turnover_classification: this.classifyTurnover(inventoryTurnover),
      
      // Financial metrics
      stock_value: stockValue,
      potential_revenue: potentialRevenue,
      profit_margin: profitMargin,
      
      // Risk analysis
      stockout_risk: stockoutRisk,
      excess_risk: excessRisk,
      
      // Recommendations
      action_required: this.getActionRecommendation(currentStock, dailySales, reorderPoint, isDead, isSlowMoving),
      priority: this.calculatePriority(stockStatus, stockoutRisk, excessRisk, profitMargin)
    };
  }

  // Get sales velocity data for inventory calculations
  async getSalesVelocityData(shopId, days = 90) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Get orders from the specified period
      const dateRange = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };
      const orders = await this.shopify.fetchOrders(dateRange);

      const velocityData = {};

      if (orders && orders.length > 0) {
        // Process each order to build velocity data
        orders.forEach(order => {
          if (!order.line_items) return;
          
          order.line_items.forEach(item => {
            const variantId = item.variant_id;
            if (!variantId) return;

            if (!velocityData[variantId]) {
              velocityData[variantId] = {
                quantity: 0,
                revenue: 0,
                orders: 0
              };
            }

            velocityData[variantId].quantity += item.quantity;
            velocityData[variantId].revenue += parseFloat(item.price) * item.quantity;
            velocityData[variantId].orders += 1;
          });
        });
      }

      return velocityData;
    } catch (error) {
      console.error('❌ Error getting sales velocity data:', error);
      return {};
    }
  }

  // Get cost data for products
  async getCostData(shopId) {
    try {
      // Try to get cost data from database or external source
      const costs = await this.db.all(`
        SELECT variant_id, cost_per_item as cost 
        FROM product_costs 
        WHERE shop_id = ?
      `, [shopId]);

      const costData = {};
      if (costs && costs.length > 0) {
        costs.forEach(cost => {
          costData[cost.variant_id] = { cost: parseFloat(cost.cost) };
        });
      }

      return costData;
    } catch (error) {
      console.error('❌ Error getting cost data:', error);
      return {};
    }
  }

  // Determine stock status based on current stock and sales velocity
  determineStockStatus(stock, dailySales) {
    if (stock <= 0) return 'out_of_stock';
    if (dailySales === 0) return stock > 0 ? 'overstocked' : 'no_sales';
    
    const daysRemaining = stock / dailySales;
    
    if (daysRemaining <= 7) return 'critical_low';
    if (daysRemaining <= 14) return 'low_stock';
    if (daysRemaining <= 30) return 'normal';
    if (daysRemaining <= 90) return 'healthy';
    return 'overstocked';
  }

  // Classify velocity based on sales rate and price point
  classifyVelocity(dailySales, price) {
    // Adjust thresholds based on price point
    const priceMultiplier = price < 25 ? 2 : price < 100 ? 1 : 0.5;
    
    const adjustedDaily = dailySales * priceMultiplier;
    
    if (adjustedDaily >= 2) return 'fast_moving';
    if (adjustedDaily >= 0.5) return 'medium_moving';
    if (adjustedDaily > 0) return 'slow_moving';
    return 'dead_stock';
  }

  // Calculate optimal reorder point
  calculateReorderPoint(dailySales, leadTimeDays, safetyStockDays) {
    return Math.ceil(dailySales * (leadTimeDays + safetyStockDays));
  }

  // Calculate optimal reorder quantity
  calculateReorderQuantity(dailySales, reviewPeriodDays, reorderPoint, currentStock) {
    const demandDuringPeriod = dailySales * reviewPeriodDays;
    const targetStock = demandDuringPeriod + reorderPoint;
    return Math.max(0, Math.ceil(targetStock - currentStock));
  }

  // Classify inventory turnover
  classifyTurnover(turnover) {
    if (turnover >= 12) return 'excellent';
    if (turnover >= 8) return 'good';
    if (turnover >= 4) return 'average';
    if (turnover >= 2) return 'poor';
    return 'very_poor';
  }

  // Calculate stockout risk (0-100%)
  calculateStockoutRisk(stock, dailySales, leadTimeDays) {
    if (dailySales === 0) return 0;
    const daysRemaining = stock / dailySales;
    if (daysRemaining <= leadTimeDays) return Math.min(100, 100 - (daysRemaining / leadTimeDays) * 100);
    return Math.max(0, 20 - (daysRemaining / leadTimeDays) * 20);
  }

  // Calculate excess stock risk (0-100%)
  calculateExcessRisk(stock, dailySales, maxDaysSupply) {
    if (dailySales === 0 && stock > 0) return 100;
    if (dailySales === 0) return 0;
    
    const daysSupply = stock / dailySales;
    if (daysSupply <= maxDaysSupply) return 0;
    return Math.min(100, (daysSupply / maxDaysSupply - 1) * 50);
  }

  // Get action recommendation
  getActionRecommendation(stock, dailySales, reorderPoint, isDead, isSlowMoving) {
    if (stock <= 0) return 'urgent_reorder';
    if (stock <= reorderPoint && dailySales > 0) return 'reorder_now';
    if (isDead) return 'liquidate';
    if (isSlowMoving) return 'discount_or_bundle';
    if (stock > reorderPoint * 3 && dailySales > 0) return 'reduce_orders';
    return 'monitor';
  }

  // Calculate priority score
  calculatePriority(stockStatus, stockoutRisk, excessRisk, profitMargin) {
    let priority = 0;
    
    // Stock status priority
    const statusScores = {
      'out_of_stock': 100,
      'critical_low': 90,
      'low_stock': 70,
      'normal': 30,
      'healthy': 20,
      'overstocked': 60
    };
    
    priority += statusScores[stockStatus] || 0;
    priority += stockoutRisk * 0.5;
    priority += excessRisk * 0.3;
    priority += Math.max(0, profitMargin * 0.2);
    
    return Math.min(100, Math.max(0, priority));
  }

  // Apply filters to inventory data
  applyFilters(products, filters) {
    let filtered = [...products];

    if (filters.stock_status && filters.stock_status !== 'all') {
      filtered = filtered.filter(p => p.stock_status === filters.stock_status);
    }

    if (filters.velocity_class && filters.velocity_class !== 'all') {
      filtered = filtered.filter(p => p.velocity_class === filters.velocity_class);
    }

    if (filters.product_type && filters.product_type !== 'all') {
      filtered = filtered.filter(p => p.product_type === filters.product_type);
    }

    if (filters.vendor && filters.vendor !== 'all') {
      filtered = filtered.filter(p => p.vendor === filters.vendor);
    }

    if (filters.needs_action) {
      filtered = filtered.filter(p => 
        ['urgent_reorder', 'reorder_now', 'liquidate'].includes(p.action_required)
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search) ||
        p.barcode?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  // Sort products by specified criteria
  sortProducts(products, sortBy) {
    const sortFunctions = {
      'stock_status': (a, b) => b.priority - a.priority,
      'velocity': (a, b) => b.sales_velocity - a.sales_velocity,
      'stock_value': (a, b) => b.stock_value - a.stock_value,
      'turnover': (a, b) => b.inventory_turnover - a.inventory_turnover,
      'days_remaining': (a, b) => a.days_remaining - b.days_remaining,
      'title': (a, b) => a.title.localeCompare(b.title),
      'created_at': (a, b) => new Date(b.created_at) - new Date(a.created_at)
    };

    const sortFn = sortFunctions[sortBy] || sortFunctions['stock_status'];
    return products.sort(sortFn);
  }

  // Generate inventory summary statistics
  generateInventorySummary(products) {
    const total = products.length;
    if (total === 0) return this.getEmptySummary();

    const summary = {
      total_products: total,
      total_stock_value: products.reduce((sum, p) => sum + p.stock_value, 0),
      total_potential_revenue: products.reduce((sum, p) => sum + p.potential_revenue, 0),
      
      // Stock status breakdown
      stock_status: {
        out_of_stock: products.filter(p => p.stock_status === 'out_of_stock').length,
        critical_low: products.filter(p => p.stock_status === 'critical_low').length,
        low_stock: products.filter(p => p.stock_status === 'low_stock').length,
        normal: products.filter(p => p.stock_status === 'normal').length,
        healthy: products.filter(p => p.stock_status === 'healthy').length,
        overstocked: products.filter(p => p.stock_status === 'overstocked').length
      },
      
      // Velocity breakdown
      velocity: {
        fast_moving: products.filter(p => p.velocity_class === 'fast_moving').length,
        medium_moving: products.filter(p => p.velocity_class === 'medium_moving').length,
        slow_moving: products.filter(p => p.velocity_class === 'slow_moving').length,
        dead_stock: products.filter(p => p.velocity_class === 'dead_stock').length
      },
      
      // Actions required
      actions_needed: {
        urgent_reorder: products.filter(p => p.action_required === 'urgent_reorder').length,
        reorder_now: products.filter(p => p.action_required === 'reorder_now').length,
        liquidate: products.filter(p => p.action_required === 'liquidate').length,
        discount_or_bundle: products.filter(p => p.action_required === 'discount_or_bundle').length,
        reduce_orders: products.filter(p => p.action_required === 'reduce_orders').length,
        monitor: products.filter(p => p.action_required === 'monitor').length
      },
      
      // Key metrics
      avg_turnover: products.reduce((sum, p) => sum + p.inventory_turnover, 0) / total,
      dead_stock_value: products.filter(p => p.is_dead_stock).reduce((sum, p) => sum + p.stock_value, 0),
      reorder_needed_count: products.filter(p => p.needs_reorder).length,
      high_priority_count: products.filter(p => p.priority >= 70).length
    };

    return summary;
  }

  // Get empty summary for when no products are found
  getEmptySummary() {
    return {
      total_products: 0,
      total_stock_value: 0,
      total_potential_revenue: 0,
      stock_status: {
        out_of_stock: 0,
        critical_low: 0,
        low_stock: 0,
        normal: 0,
        healthy: 0,
        overstocked: 0
      },
      velocity: {
        fast_moving: 0,
        medium_moving: 0,
        slow_moving: 0,
        dead_stock: 0
      },
      actions_needed: {
        urgent_reorder: 0,
        reorder_now: 0,
        liquidate: 0,
        discount_or_bundle: 0,
        reduce_orders: 0,
        monitor: 0
      },
      avg_turnover: 0,
      dead_stock_value: 0,
      reorder_needed_count: 0,
      high_priority_count: 0
    };
  }

  // Get inventory turnover analysis
  async getInventoryTurnover(shopId, period = 90) {
    try {
      console.log('📊 Calculating inventory turnover for shop:', shopId);

      const inventoryData = await this.getInventoryLevels(shopId);
      const products = inventoryData.products;

      if (!products.length) {
        return { turnover_analysis: [], summary: { avg_turnover: 0, total_products: 0 } };
      }

      // Group by product for turnover analysis
      const productGroups = {};
      products.forEach(variant => {
        if (!productGroups[variant.product_id]) {
          productGroups[variant.product_id] = {
            product_id: variant.product_id,
            title: variant.title,
            product_type: variant.product_type,
            vendor: variant.vendor,
            variants: [],
            total_stock_value: 0,
            total_revenue_90d: 0,
            avg_turnover: 0
          };
        }
        
        const group = productGroups[variant.product_id];
        group.variants.push(variant);
        group.total_stock_value += variant.stock_value;
        group.total_revenue_90d += variant.total_revenue_90d;
      });

      // Calculate turnover for each product
      const turnoverAnalysis = Object.values(productGroups).map(product => {
        const totalTurnover = product.variants.reduce((sum, v) => sum + v.inventory_turnover, 0);
        product.avg_turnover = totalTurnover / product.variants.length;
        
        return {
          ...product,
          turnover_classification: this.classifyTurnover(product.avg_turnover),
          variants_count: product.variants.length,
          best_performer: product.variants.reduce((best, current) => 
            current.inventory_turnover > best.inventory_turnover ? current : best
          ),
          worst_performer: product.variants.reduce((worst, current) => 
            current.inventory_turnover < worst.inventory_turnover ? current : worst
          )
        };
      });

      // Sort by turnover performance
      turnoverAnalysis.sort((a, b) => b.avg_turnover - a.avg_turnover);

      const summary = {
        total_products: turnoverAnalysis.length,
        avg_turnover: turnoverAnalysis.reduce((sum, p) => sum + p.avg_turnover, 0) / turnoverAnalysis.length,
        turnover_distribution: {
          excellent: turnoverAnalysis.filter(p => p.avg_turnover >= 12).length,
          good: turnoverAnalysis.filter(p => p.avg_turnover >= 8 && p.avg_turnover < 12).length,
          average: turnoverAnalysis.filter(p => p.avg_turnover >= 4 && p.avg_turnover < 8).length,
          poor: turnoverAnalysis.filter(p => p.avg_turnover >= 2 && p.avg_turnover < 4).length,
          very_poor: turnoverAnalysis.filter(p => p.avg_turnover < 2).length
        },
        top_performers: turnoverAnalysis.slice(0, 5),
        worst_performers: turnoverAnalysis.slice(-5).reverse()
      };

      return {
        turnover_analysis: turnoverAnalysis,
        summary,
        period_days: period,
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error calculating inventory turnover:', error);
      throw new Error(`Failed to calculate inventory turnover: ${error.message}`);
    }
  }

  // Get inventory alerts and recommendations
  async getInventoryAlerts(shopId, alertTypes = ['all']) {
    try {
      console.log('🚨 Getting inventory alerts for shop:', shopId);

      const inventoryData = await this.getInventoryLevels(shopId);
      const products = inventoryData.products;

      const alerts = [];

      products.forEach(product => {
        // Stock alerts
        if (alertTypes.includes('all') || alertTypes.includes('stock')) {
          if (product.stock_status === 'out_of_stock') {
            alerts.push({
              type: 'out_of_stock',
              severity: 'critical',
              product_id: product.product_id,
              variant_id: product.id,
              title: product.title,
              variant_title: product.variant_title,
              message: `${product.title} is out of stock`,
              current_stock: product.inventory_quantity,
              recommended_action: 'urgent_reorder',
              priority: 100,
              created_at: new Date().toISOString()
            });
          } else if (product.stock_status === 'critical_low') {
            alerts.push({
              type: 'critical_low',
              severity: 'high',
              product_id: product.product_id,
              variant_id: product.id,
              title: product.title,
              variant_title: product.variant_title,
              message: `${product.title} has critically low stock (${product.days_remaining} days remaining)`,
              current_stock: product.inventory_quantity,
              days_remaining: product.days_remaining,
              recommended_action: 'reorder_now',
              priority: 90,
              created_at: new Date().toISOString()
            });
          } else if (product.needs_reorder) {
            alerts.push({
              type: 'reorder_needed',
              severity: 'medium',
              product_id: product.product_id,
              variant_id: product.id,
              title: product.title,
              variant_title: product.variant_title,
              message: `${product.title} has reached reorder point`,
              current_stock: product.inventory_quantity,
              reorder_point: product.reorder_point,
              reorder_quantity: product.reorder_quantity,
              recommended_action: 'reorder_now',
              priority: 70,
              created_at: new Date().toISOString()
            });
          }
        }

        // Dead stock alerts
        if (alertTypes.includes('all') || alertTypes.includes('dead_stock')) {
          if (product.is_dead_stock) {
            alerts.push({
              type: 'dead_stock',
              severity: 'medium',
              product_id: product.product_id,
              variant_id: product.id,
              title: product.title,
              variant_title: product.variant_title,
              message: `${product.title} is dead stock with $${product.stock_value.toFixed(2)} tied up`,
              stock_value: product.stock_value,
              current_stock: product.inventory_quantity,
              recommended_action: 'liquidate',
              priority: 60,
              created_at: new Date().toISOString()
            });
          } else if (product.is_slow_moving) {
            alerts.push({
              type: 'slow_moving',
              severity: 'low',
              product_id: product.product_id,
              variant_id: product.id,
              title: product.title,
              variant_title: product.variant_title,
              message: `${product.title} is moving slowly (${product.sales_velocity.toFixed(2)} units/day)`,
              sales_velocity: product.sales_velocity,
              current_stock: product.inventory_quantity,
              recommended_action: 'discount_or_bundle',
              priority: 40,
              created_at: new Date().toISOString()
            });
          }
        }

        // Overstock alerts
        if (alertTypes.includes('all') || alertTypes.includes('overstock')) {
          if (product.excess_risk > 50) {
            alerts.push({
              type: 'overstock',
              severity: 'medium',
              product_id: product.product_id,
              variant_id: product.id,
              title: product.title,
              variant_title: product.variant_title,
              message: `${product.title} is overstocked with ${product.days_remaining} days of inventory`,
              excess_risk: product.excess_risk,
              days_remaining: product.days_remaining,
              current_stock: product.inventory_quantity,
              recommended_action: 'reduce_orders',
              priority: 50,
              created_at: new Date().toISOString()
            });
          }
        }

        // High-value stock alerts
        if (alertTypes.includes('all') || alertTypes.includes('high_value')) {
          if (product.stockout_risk > 70 && product.stock_value > 1000) {
            alerts.push({
              type: 'high_value_risk',
              severity: 'high',
              product_id: product.product_id,
              variant_id: product.id,
              title: product.title,
              variant_title: product.variant_title,
              message: `High-value product ${product.title} at risk of stockout ($${product.stock_value.toFixed(2)} inventory value)`,
              stockout_risk: product.stockout_risk,
              stock_value: product.stock_value,
              current_stock: product.inventory_quantity,
              recommended_action: 'urgent_reorder',
              priority: 85,
              created_at: new Date().toISOString()
            });
          }
        }
      });

      // Sort alerts by priority (highest first)
      alerts.sort((a, b) => b.priority - a.priority);

      // Generate alert summary
      const alertSummary = {
        total_alerts: alerts.length,
        critical_alerts: alerts.filter(a => a.severity === 'critical').length,
        high_priority: alerts.filter(a => a.severity === 'high').length,
        medium_priority: alerts.filter(a => a.severity === 'medium').length,
        low_priority: alerts.filter(a => a.severity === 'low').length,
        
        by_type: {
          out_of_stock: alerts.filter(a => a.type === 'out_of_stock').length,
          critical_low: alerts.filter(a => a.type === 'critical_low').length,
          reorder_needed: alerts.filter(a => a.type === 'reorder_needed').length,
          dead_stock: alerts.filter(a => a.type === 'dead_stock').length,
          slow_moving: alerts.filter(a => a.type === 'slow_moving').length,
          overstock: alerts.filter(a => a.type === 'overstock').length,
          high_value_risk: alerts.filter(a => a.type === 'high_value_risk').length
        },
        
        total_dead_stock_value: alerts
          .filter(a => a.type === 'dead_stock')
          .reduce((sum, a) => sum + (a.stock_value || 0), 0)
      };

      return {
        alerts,
        summary: alertSummary,
        last_updated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting inventory alerts:', error);
      throw new Error(`Failed to get inventory alerts: ${error.message}`);
    }
  }
}

export default InventoryAnalyticsService;