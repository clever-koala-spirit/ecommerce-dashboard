/**
 * Product Profitability Matrix Widget
 * Shows which paint kit variants sell best with profit analysis
 */

import { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, Percent, ShoppingCart, Target } from 'lucide-react';

export default function ProductProfitabilityWidget({ onActionClick }) {
  const [selectedView, setSelectedView] = useState('profitability');
  const [selectedMetric, setSelectedMetric] = useState('profit_margin');

  const productData = {
    beginner_kit: {
      name: 'Paintly Beginner Kit',
      sku: 'PKT-BEG-001',
      price: 39.99,
      cogs: 18.50,
      revenue_share: 45,
      orders: 274,
      revenue: 10956,
      profit_margin: 53.8,
      conversion_rate: 2.8,
      inventory_turns: 12,
      performance_grade: 'A',
      recommendations: ['Scale marketing', 'Bundle upsell'],
      color: 'emerald'
    },
    intermediate_kit: {
      name: 'Paintly Intermediate Kit', 
      sku: 'PKT-INT-002',
      price: 69.99,
      cogs: 29.40,
      revenue_share: 35,
      orders: 152,
      revenue: 10639,
      profit_margin: 58.0,
      conversion_rate: 2.1,
      inventory_turns: 8,
      performance_grade: 'A-',
      recommendations: ['Increase inventory', 'Target promotion'],
      color: 'blue'
    },
    advanced_kit: {
      name: 'Paintly Advanced Kit',
      sku: 'PKT-ADV-003', 
      price: 119.99,
      cogs: 46.80,
      revenue_share: 15,
      orders: 61,
      revenue: 7319,
      profit_margin: 61.0,
      conversion_rate: 1.4,
      inventory_turns: 4,
      performance_grade: 'B+',
      recommendations: ['Premium positioning', 'Influencer targeting'],
      color: 'purple'
    },
    accessories: {
      name: 'Paint Accessories',
      sku: 'PKT-ACC-004',
      price: 19.99,
      cogs: 6.40,
      revenue_share: 5,
      orders: 121,
      revenue: 2419,
      profit_margin: 68.0,
      conversion_rate: 4.2,
      inventory_turns: 18,
      performance_grade: 'B',
      recommendations: ['Bundle strategy', 'Cross-sell optimization'],
      color: 'orange'
    }
  };

  const viewOptions = {
    'profitability': 'Profitability Matrix',
    'performance': 'Sales Performance',
    'optimization': 'Optimization Opportunities'
  };

  const metricOptions = {
    'profit_margin': 'Profit Margin %',
    'revenue': 'Revenue Volume',
    'orders': 'Order Volume',
    'conversion_rate': 'Conversion Rate'
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-emerald-600 bg-emerald-100';
    if (grade.startsWith('A-')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getPositionInMatrix = (product) => {
    // Matrix: High Margin/High Volume = Star, High Margin/Low Volume = Question Mark
    // Low Margin/High Volume = Cash Cow, Low Margin/Low Volume = Dog
    const isHighMargin = product.profit_margin > 55;
    const isHighVolume = product.orders > 150;
    
    if (isHighMargin && isHighVolume) return { category: 'Star', color: 'emerald', icon: '⭐' };
    if (isHighMargin && !isHighVolume) return { category: 'Question Mark', color: 'blue', icon: '❓' };
    if (!isHighMargin && isHighVolume) return { category: 'Cash Cow', color: 'yellow', icon: '🐄' };
    return { category: 'Dog', color: 'gray', icon: '🐕' };
  };

  const totalRevenue = Object.values(productData).reduce((sum, p) => sum + p.revenue, 0);
  const averageMargin = Object.values(productData).reduce((sum, p) => sum + p.profit_margin, 0) / Object.keys(productData).length;

  const handleProductAction = (productName, action) => {
    if (onActionClick) {
      onActionClick('product_profitability', {
        text: action,
        product: productName,
        type: 'product_action'
      });
    }
  };

  const renderProfitabilityMatrix = () => (
    <div className="space-y-4">
      {/* Matrix Categories */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
            ⭐ Stars <span className="text-xs bg-emerald-100 px-2 py-1 rounded-full">High Margin + High Volume</span>
          </h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            ❓ Question Marks <span className="text-xs bg-blue-100 px-2 py-1 rounded-full">High Margin + Low Volume</span>
          </h3>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
            🐄 Cash Cows <span className="text-xs bg-yellow-100 px-2 py-1 rounded-full">Low Margin + High Volume</span>
          </h3>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            🐕 Dogs <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Low Margin + Low Volume</span>
          </h3>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(productData).map(([key, product]) => {
          const matrixPosition = getPositionInMatrix(product);
          return (
            <div key={key} className={`
              border-2 rounded-2xl p-4 transition-all hover:shadow-lg
              border-${matrixPosition.color}-300 bg-${matrixPosition.color}-50
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{matrixPosition.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getGradeColor(product.performance_grade)}`}>
                    {product.performance_grade}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{matrixPosition.category}</p>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Margin</p>
                  <p className="font-bold text-gray-900">{formatPercentage(product.profit_margin)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="font-bold text-gray-900">{product.orders}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">CVR</p>
                  <p className="font-bold text-gray-900">{formatPercentage(product.conversion_rate)}</p>
                </div>
              </div>

              {/* Revenue Share Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Revenue Share</span>
                  <span>{product.revenue_share}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-${matrixPosition.color}-500`}
                    style={{ width: `${product.revenue_share}%` }}
                  />
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                {product.recommendations.map((rec, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleProductAction(product.name, rec)}
                    className="w-full text-left p-2 text-xs bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    💡 {rec}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderOptimizationView = () => (
    <div className="space-y-6">
      {/* Top Opportunities */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
        <h3 className="font-semibold mb-3">🎯 Top Revenue Optimization Opportunities</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Bundle Intermediate + Accessories</span>
            <span className="font-bold">+$8.2K/month</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Premium positioning for Advanced</span>
            <span className="font-bold">+$4.7K/month</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Beginner kit upsell funnel</span>
            <span className="font-bold">+$6.1K/month</span>
          </div>
        </div>
      </div>

      {/* Profit Optimization Matrix */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={18} />
            Margin Leaders
          </h3>
          <div className="space-y-2">
            {Object.entries(productData)
              .sort(([,a], [,b]) => b.profit_margin - a.profit_margin)
              .slice(0, 2)
              .map(([key, product]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm">{product.name.split(' ').slice(-1)[0]}</span>
                  <span className="font-semibold text-emerald-600">
                    {formatPercentage(product.profit_margin)}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={18} />
            Volume Leaders
          </h3>
          <div className="space-y-2">
            {Object.entries(productData)
              .sort(([,a], [,b]) => b.orders - a.orders)
              .slice(0, 2)
              .map(([key, product]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm">{product.name.split(' ').slice(-1)[0]}</span>
                  <span className="font-semibold text-blue-600">
                    {product.orders} orders
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Bundle Opportunities */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <h3 className="font-semibold text-blue-900 mb-3">📦 Strategic Bundle Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-3">
            <h4 className="font-medium mb-2">Beginner → Intermediate Upsell</h4>
            <p className="text-sm text-gray-600 mb-2">Current: $40 → Target: $70</p>
            <div className="text-sm">
              <span className="text-green-600 font-semibold">+$30 AOV</span>
              <span className="text-gray-500 ml-2">• 25% upsell rate</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <h4 className="font-medium mb-2">Accessory Cross-Sell Bundle</h4>
            <p className="text-sm text-gray-600 mb-2">Kit + Accessories: $119</p>
            <div className="text-sm">
              <span className="text-green-600 font-semibold">68% margin</span>
              <span className="text-gray-500 ml-2">• High profit add-on</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl shadow-lg p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Package size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Profitability</h2>
            <p className="text-gray-600">Performance & Optimization Matrix</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500">Avg. Margin: {formatPercentage(averageMargin)}</p>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6">
        {Object.entries(viewOptions).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedView(key)}
            className={`
              px-4 py-2 rounded-xl font-medium text-sm transition-all
              ${selectedView === key 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="mb-6">
        {selectedView === 'profitability' && renderProfitabilityMatrix()}
        {selectedView === 'optimization' && renderOptimizationView()}
        {selectedView === 'performance' && (
          <div className="text-center py-8 text-gray-500">
            Performance analysis view - coming soon
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleProductAction('Bundle Strategy', 'Launch Bundles')}
          className="bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm"
        >
          Launch Bundles
        </button>
        <button
          onClick={() => handleProductAction('Intermediate Kit', 'Scale Inventory')}
          className="bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors text-sm"
        >
          Scale Winners
        </button>
        <button
          onClick={() => handleProductAction('Premium Line', 'Premium Positioning')}
          className="bg-purple-500 text-white font-semibold py-3 rounded-xl hover:bg-purple-600 transition-colors text-sm"
        >
          Premium Push
        </button>
      </div>
    </div>
  );
}