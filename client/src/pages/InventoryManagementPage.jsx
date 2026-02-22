import { useState, useEffect, useCallback } from 'react';
import { useShopify } from '../providers/ShopifyProvider';

// Apple-style inventory management dashboard with comprehensive analytics
function InventoryManagementPage() {
  const { shopDomain } = useShopify();
  
  // State management
  const [inventoryData, setInventoryData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [turnoverData, setTurnoverData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    stock_status: 'all',
    velocity_class: 'all',
    product_type: 'all',
    vendor: 'all',
    needs_action: false,
    search: '',
    sort_by: 'stock_status'
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch inventory data
  const fetchInventoryData = useCallback(async () => {
    if (!shopDomain) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = { 'X-Shop-Id': shopDomain };
      
      // Fetch all inventory data in parallel
      const [inventoryRes, alertsRes, turnoverRes, summaryRes] = await Promise.all([
        fetch('/api/inventory/levels?' + new URLSearchParams({
          ...filters,
          needs_action: filters.needs_action.toString()
        }), { headers }),
        fetch('/api/inventory/alerts?types=all&limit=20', { headers }),
        fetch('/api/inventory/turnover?period=90&limit=10', { headers }),
        fetch('/api/inventory/summary', { headers })
      ]);

      if (!inventoryRes.ok) throw new Error('Failed to fetch inventory data');
      if (!alertsRes.ok) throw new Error('Failed to fetch alerts');
      if (!turnoverRes.ok) throw new Error('Failed to fetch turnover data');
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');

      const [inventory, alertsData, turnover, summaryData] = await Promise.all([
        inventoryRes.json(),
        alertsRes.json(),
        turnoverRes.json(),
        summaryRes.json()
      ]);

      setInventoryData(inventory.data);
      setAlerts(alertsData.data.alerts);
      setTurnoverData(turnover.data);
      setSummary(summaryData.data);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [shopDomain, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'out_of_stock': '#FF3B30',
      'critical_low': '#FF9500',
      'low_stock': '#FFCC00',
      'normal': '#34C759',
      'healthy': '#30D158',
      'overstocked': '#007AFF'
    };
    return colors[status] || '#8E8E93';
  };

  // Get velocity badge color
  const getVelocityColor = (velocity) => {
    const colors = {
      'fast_moving': '#30D158',
      'medium_moving': '#34C759',
      'slow_moving': '#FFCC00',
      'dead_stock': '#FF3B30'
    };
    return colors[velocity] || '#8E8E93';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercent = (value, decimals = 1) => {
    return `${(value || 0).toFixed(decimals)}%`;
  };

  // Export inventory data
  const handleExport = () => {
    if (!inventoryData?.products) return;
    
    const csvData = [
      ['Product', 'SKU', 'Stock', 'Status', 'Velocity', 'Days Remaining', 'Stock Value', 'Action Needed'].join(','),
      ...inventoryData.products.map(product => [
        `"${product.title}"`,
        product.sku || '',
        product.inventory_quantity,
        product.stock_status,
        product.velocity_class,
        product.days_remaining,
        product.stock_value.toFixed(2),
        product.action_required
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Inventory</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={fetchInventoryData}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0b0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
              <p className="text-white/60 mt-1">
                Comprehensive inventory tracking, analytics, and optimization
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={fetchInventoryData}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6 bg-white/5 p-1 rounded-xl">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'levels', name: 'Stock Levels', icon: '📦' },
              { id: 'alerts', name: 'Alerts', icon: '🚨', badge: alerts.length },
              { id: 'turnover', name: 'Turnover', icon: '🔄' },
              { id: 'forecast', name: 'Forecast', icon: '🔮' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.badge && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab 
            summary={summary} 
            alerts={alerts} 
            turnoverData={turnoverData}
            formatCurrency={formatCurrency}
            formatPercent={formatPercent}
          />
        )}
        
        {activeTab === 'levels' && (
          <StockLevelsTab 
            inventoryData={inventoryData}
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            getStatusColor={getStatusColor}
            getVelocityColor={getVelocityColor}
            formatCurrency={formatCurrency}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
          />
        )}
        
        {activeTab === 'alerts' && (
          <AlertsTab 
            alerts={alerts}
            getStatusColor={getStatusColor}
            formatCurrency={formatCurrency}
          />
        )}
        
        {activeTab === 'turnover' && (
          <TurnoverTab 
            turnoverData={turnoverData}
            formatCurrency={formatCurrency}
            formatPercent={formatPercent}
          />
        )}
        
        {activeTab === 'forecast' && (
          <ForecastTab 
            shopDomain={shopDomain}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ summary, alerts, turnoverData, formatCurrency, formatPercent }) {
  if (!summary) return <div>Loading overview...</div>;

  const kpiCards = [
    {
      title: 'Total Products',
      value: summary.kpis.total_products.toLocaleString(),
      subtitle: 'Active variants',
      color: 'blue'
    },
    {
      title: 'Stock Value',
      value: formatCurrency(summary.kpis.total_stock_value),
      subtitle: 'Total inventory value',
      color: 'green'
    },
    {
      title: 'Health Score',
      value: `${summary.health_score}/100`,
      subtitle: formatPercent(summary.kpis.healthy_stock_percentage) + ' healthy stock',
      color: summary.health_score >= 80 ? 'green' : summary.health_score >= 60 ? 'yellow' : 'red'
    },
    {
      title: 'Avg Turnover',
      value: summary.kpis.avg_inventory_turnover.toFixed(1),
      subtitle: 'Times per year',
      color: 'purple'
    },
    {
      title: 'Dead Stock',
      value: formatCurrency(summary.kpis.dead_stock_value),
      subtitle: formatPercent(summary.kpis.dead_stock_percentage) + ' of total value',
      color: 'red'
    },
    {
      title: 'Urgent Actions',
      value: summary.kpis.urgent_actions_needed.toString(),
      subtitle: 'Need immediate attention',
      color: 'orange'
    }
  ];

  const getCardColor = (color) => {
    const colors = {
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30',
      yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
      red: 'from-red-500/20 to-red-600/20 border-red-500/30',
      purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl bg-gradient-to-br ${getCardColor(card.color)} border backdrop-blur-sm`}
          >
            <h3 className="text-sm font-medium text-white/70 mb-2">{card.title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-sm text-white/60">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Stock Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(summary.stock_distribution).map(([status, count]) => {
              const percentage = summary.kpis.total_products > 0 
                ? (count / summary.kpis.total_products * 100).toFixed(1)
                : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    <span className="text-white capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium">{count}</span>
                    <span className="text-white/60 text-sm ml-2">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Velocity Distribution</h3>
          <div className="space-y-3">
            {Object.entries(summary.velocity_distribution).map(([velocity, count]) => {
              const percentage = summary.kpis.total_products > 0 
                ? (count / summary.kpis.total_products * 100).toFixed(1)
                : 0;
              
              return (
                <div key={velocity} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: getVelocityColor(velocity) }}
                    />
                    <span className="text-white capitalize">
                      {velocity.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium">{count}</span>
                    <span className="text-white/60 text-sm ml-2">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Recommended Actions</h3>
          <div className="space-y-4">
            {summary.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start p-4 bg-white/5 rounded-xl">
                <div className={`w-2 h-2 rounded-full mr-3 mt-2 ${
                  rec.priority === 'high' ? 'bg-red-400' :
                  rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                  <p className="text-white/70 text-sm mb-2">{rec.description}</p>
                  <p className="text-white/60 text-sm">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stock Levels Tab Component (continuation in next chunk due to length)
function StockLevelsTab({ 
  inventoryData, 
  filters, 
  onFilterChange, 
  onSearch, 
  getStatusColor, 
  getVelocityColor,
  formatCurrency,
  selectedProduct,
  setSelectedProduct,
  showDetails,
  setShowDetails 
}) {
  if (!inventoryData) return <div>Loading stock levels...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Product name, SKU, or barcode..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Stock Status</label>
            <select
              value={filters.stock_status}
              onChange={(e) => onFilterChange('stock_status', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="critical_low">Critical Low</option>
              <option value="low_stock">Low Stock</option>
              <option value="normal">Normal</option>
              <option value="healthy">Healthy</option>
              <option value="overstocked">Overstocked</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Velocity</label>
            <select
              value={filters.velocity_class}
              onChange={(e) => onFilterChange('velocity_class', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Velocities</option>
              <option value="fast_moving">Fast Moving</option>
              <option value="medium_moving">Medium Moving</option>
              <option value="slow_moving">Slow Moving</option>
              <option value="dead_stock">Dead Stock</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Sort By</label>
            <select
              value={filters.sort_by}
              onChange={(e) => onFilterChange('sort_by', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stock_status">Stock Status</option>
              <option value="velocity">Sales Velocity</option>
              <option value="stock_value">Stock Value</option>
              <option value="days_remaining">Days Remaining</option>
              <option value="title">Product Name</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.needs_action}
              onChange={(e) => onFilterChange('needs_action', e.target.checked)}
              className="mr-2 rounded focus:ring-blue-500"
            />
            <span className="text-white">Show only products needing action</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Velocity</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Days Left</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Value</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {inventoryData.products?.slice(0, 50).map((product, index) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowDetails(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{product.title}</div>
                      {product.variant_title && product.variant_title !== 'Default Title' && (
                        <div className="text-sm text-white/60">{product.variant_title}</div>
                      )}
                      {product.sku && (
                        <div className="text-xs text-white/50">SKU: {product.sku}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{product.inventory_quantity || 0}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: getStatusColor(product.stock_status) + '20',
                        color: getStatusColor(product.stock_status)
                      }}
                    >
                      {product.stock_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: getVelocityColor(product.velocity_class) + '20',
                          color: getVelocityColor(product.velocity_class)
                        }}
                      >
                        {product.velocity_class.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="text-xs text-white/60 mt-1">
                        {product.sales_velocity.toFixed(2)}/day
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">
                      {product.days_remaining === 999 ? '∞' : product.days_remaining}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{formatCurrency(product.stock_value)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-xs font-medium ${
                      product.action_required === 'urgent_reorder' || product.action_required === 'reorder_now' 
                        ? 'text-red-400' 
                        : product.action_required === 'liquidate'
                        ? 'text-orange-400'
                        : 'text-white/60'
                    }`}>
                      {product.action_required.replace('_', ' ').toUpperCase()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {inventoryData.products?.length > 50 && (
          <div className="px-6 py-4 border-t border-white/10 text-center text-white/60">
            Showing first 50 of {inventoryData.products.length} products. Use filters to narrow results.
          </div>
        )}
      </div>
      
      {/* Product Details Modal */}
      {showDetails && selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct}
          onClose={() => setShowDetails(false)}
          getStatusColor={getStatusColor}
          getVelocityColor={getVelocityColor}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

// Product Details Modal Component
function ProductDetailsModal({ product, onClose, getStatusColor, getVelocityColor, formatCurrency }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1f] rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{product.title}</h2>
            {product.variant_title && product.variant_title !== 'Default Title' && (
              <p className="text-white/60">{product.variant_title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white/70 mb-1">Current Stock</h4>
              <p className="text-2xl font-bold text-white">{product.inventory_quantity || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="text-sm font-medium text-white/70 mb-1">Stock Value</h4>
              <p className="text-2xl font-bold text-white">{formatCurrency(product.stock_value)}</p>
            </div>
          </div>
          
          {/* Status and Velocity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-2">Stock Status</h4>
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: getStatusColor(product.stock_status) + '20',
                  color: getStatusColor(product.stock_status)
                }}
              >
                {product.stock_status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-2">Velocity Class</h4>
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: getVelocityColor(product.velocity_class) + '20',
                  color: getVelocityColor(product.velocity_class)
                }}
              >
                {product.velocity_class.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* Analytics */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Analytics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Sales Velocity:</span>
                <span className="text-white ml-2 font-medium">{product.sales_velocity?.toFixed(2)}/day</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Days Remaining:</span>
                <span className="text-white ml-2 font-medium">
                  {product.days_remaining === 999 ? '∞' : product.days_remaining}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Turnover Rate:</span>
                <span className="text-white ml-2 font-medium">{product.inventory_turnover?.toFixed(1)}x/year</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Reorder Point:</span>
                <span className="text-white ml-2 font-medium">{product.reorder_point}</span>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Recommended Action</h4>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-400 font-medium mb-1">
                {product.action_required.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-white/70 text-sm">
                {getActionDescription(product.action_required, product)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for action descriptions
function getActionDescription(action, product) {
  switch (action) {
    case 'urgent_reorder':
      return 'This product is out of stock or critically low. Place an emergency order immediately to prevent lost sales.';
    case 'reorder_now':
      return `Stock has reached the reorder point of ${product.reorder_point} units. Order ${product.reorder_quantity} units to maintain healthy stock levels.`;
    case 'liquidate':
      return 'This is dead stock with no recent sales. Consider promotional campaigns, bundles, or liquidation to free up capital.';
    case 'discount_or_bundle':
      return 'Sales velocity is slow. Consider discounts, bundles, or marketing campaigns to increase movement.';
    case 'reduce_orders':
      return 'Stock levels are higher than needed. Reduce future orders to prevent overstocking.';
    default:
      return 'Continue monitoring this product. Stock levels and sales velocity are within normal ranges.';
  }
}

// Alerts Tab Component
function AlertsTab({ alerts, getStatusColor, formatCurrency }) {
  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#FF3B30',
      'high': '#FF9500', 
      'medium': '#FFCC00',
      'low': '#34C759'
    };
    return colors[severity] || '#8E8E93';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Inventory Alerts</h3>
        <p className="text-white/60">
          {alerts.length} alerts requiring attention
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">All Clear!</h3>
          <p className="text-white/60">No urgent inventory alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  />
                  <div>
                    <h4 className="font-medium text-white">{alert.title}</h4>
                    {alert.variant_title && alert.variant_title !== 'Default Title' && (
                      <p className="text-sm text-white/60">{alert.variant_title}</p>
                    )}
                  </div>
                </div>
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: getSeverityColor(alert.severity) + '20',
                    color: getSeverityColor(alert.severity)
                  }}
                >
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              
              <p className="text-white/70 mb-3">{alert.message}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-white/60">
                  Action: <span className="text-white">{alert.recommended_action.replace('_', ' ')}</span>
                </div>
                <div className="text-white/60">
                  Priority: <span className="text-white">{alert.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Turnover Tab Component
function TurnoverTab({ turnoverData, formatCurrency, formatPercent }) {
  if (!turnoverData) return <div>Loading turnover data...</div>;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Inventory Turnover Analysis</h3>
        <p className="text-white/60">
          Average turnover: {turnoverData.summary.avg_turnover.toFixed(1)}x per year
        </p>
      </div>

      {/* Turnover Distribution */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Turnover Distribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(turnoverData.summary.turnover_distribution).map(([category, count]) => (
            <div key={category} className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-sm text-white/60 capitalize">{category.replace('_', ' ')}</div>
              <div className="text-xs text-white/50 mt-1">
                {formatPercent(count / turnoverData.summary.total_products * 100)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Top Performers</h4>
          <div className="space-y-3">
            {turnoverData.summary.top_performers?.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <div className="font-medium text-white">{product.title}</div>
                  <div className="text-sm text-white/60">{formatCurrency(product.total_stock_value)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-400">{product.avg_turnover.toFixed(1)}x</div>
                  <div className="text-xs text-white/60">per year</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Needs Improvement</h4>
          <div className="space-y-3">
            {turnoverData.summary.worst_performers?.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <div className="font-medium text-white">{product.title}</div>
                  <div className="text-sm text-white/60">{formatCurrency(product.total_stock_value)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-400">{product.avg_turnover.toFixed(1)}x</div>
                  <div className="text-xs text-white/60">per year</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Forecast Tab Component  
function ForecastTab({ shopDomain, formatCurrency }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!shopDomain) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `/api/inventory/forecast?days=${days}`,
          { headers: { 'X-Shop-Id': shopDomain } }
        );
        
        if (response.ok) {
          const data = await response.json();
          setForecastData(data.data);
        }
      } catch (error) {
        console.error('Error fetching forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [shopDomain, days]);

  if (loading) {
    return <div className="text-center text-white/60 py-8">Loading forecast...</div>;
  }

  if (!forecastData) {
    return <div className="text-center text-white/60 py-8">Unable to load forecast data</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Inventory Forecast</h3>
          <p className="text-white/60">
            Predicting stock levels based on current sales velocity
          </p>
        </div>
        <div>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
          <h4 className="text-sm font-medium text-white/70 mb-2">Will Stockout</h4>
          <div className="text-2xl font-bold text-red-400">{forecastData.summary.will_stockout}</div>
          <p className="text-sm text-white/60">products in {days} days</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <h4 className="text-sm font-medium text-white/70 mb-2">Need Reorder Soon</h4>
          <div className="text-2xl font-bold text-yellow-400">{forecastData.summary.need_reorder_soon}</div>
          <p className="text-sm text-white/60">within 14 days</p>
        </div>
        
        <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <h4 className="text-sm font-medium text-white/70 mb-2">Avg Days to Stockout</h4>
          <div className="text-2xl font-bold text-blue-400">
            {forecastData.summary.avg_days_until_stockout?.toFixed(0) || 'N/A'}
          </div>
          <p className="text-sm text-white/60">for at-risk products</p>
        </div>
      </div>

      {/* Forecast List */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h4 className="font-semibold text-white">Products at Risk</h4>
        </div>
        <div className="divide-y divide-white/10">
          {forecastData.forecasts
            ?.filter(f => f.predictions.stockout_in_days !== null || f.predictions.reorder_needed_in_days !== null)
            .slice(0, 10)
            .map((forecast, index) => (
            <div key={index} className="p-4 hover:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-white">{forecast.title}</div>
                  {forecast.variant_title && forecast.variant_title !== 'Default Title' && (
                    <div className="text-sm text-white/60">{forecast.variant_title}</div>
                  )}
                </div>
                <div className="text-right text-sm">
                  <div className="text-white">Current: {forecast.current_stock}</div>
                  <div className="text-white/60">Velocity: {forecast.sales_velocity.toFixed(2)}/day</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex space-x-4">
                  {forecast.predictions.stockout_in_days && (
                    <div className="text-red-400">
                      Stockout in {forecast.predictions.stockout_in_days} days
                    </div>
                  )}
                  {forecast.predictions.reorder_needed_in_days && (
                    <div className="text-yellow-400">
                      Reorder in {forecast.predictions.reorder_needed_in_days} days
                    </div>
                  )}
                </div>
                <div className="text-white/60">
                  End stock: {forecast.predictions.stock_at_end_of_period}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper functions for status colors (defined earlier but repeated for context)
function getStatusColor(status) {
  const colors = {
    'out_of_stock': '#FF3B30',
    'critical_low': '#FF9500',
    'low_stock': '#FFCC00',
    'normal': '#34C759',
    'healthy': '#30D158',
    'overstocked': '#007AFF'
  };
  return colors[status] || '#8E8E93';
}

function getVelocityColor(velocity) {
  const colors = {
    'fast_moving': '#30D158',
    'medium_moving': '#34C759',
    'slow_moving': '#FFCC00',
    'dead_stock': '#FF3B30'
  };
  return colors[velocity] || '#8E8E93';
}

export default InventoryManagementPage;