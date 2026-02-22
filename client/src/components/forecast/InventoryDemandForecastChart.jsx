import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { formatNumber } from '../../utils/formatters';

export default function InventoryDemandForecastChart({ shopDomain }) {
  const { colors } = useTheme();
  const [horizon, setHorizon] = useState(30);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('demand'); // demand, reorder, alphabetical
  const [showReorderOnly, setShowReorderOnly] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch inventory forecast data
  useEffect(() => {
    const fetchInventoryForecast = async () => {
      if (!shopDomain) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/forecasts/inventory?horizon=${horizon}&includeRecommendations=true&minDataPoints=14`,
          {
            headers: {
              'X-Shop-Domain': shopDomain
            }
          }
        );
        
        const result = await response.json();
        
        if (result.success) {
          setForecastData(result);
          // Auto-select first product if none selected
          if (!selectedProduct && Object.keys(result.forecasts).length > 0) {
            setSelectedProduct(Object.keys(result.forecasts)[0]);
          }
        } else {
          setError(result.error || 'Failed to fetch inventory forecast');
        }
      } catch (err) {
        setError('Failed to fetch inventory forecast data');
        console.error('Inventory forecast fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryForecast();
  }, [shopDomain, horizon]);

  const productList = useMemo(() => {
    if (!forecastData?.forecasts) return [];

    let products = Object.entries(forecastData.forecasts).map(([productId, forecast]) => {
      const totalDemand = forecast.forecast.reduce((sum, day) => sum + day.predicted_units, 0);
      const recommendations = forecastData.recommendations?.[productId] || forecast.recommendations || {};
      
      return {
        productId,
        totalDemand,
        avgDaily: totalDemand / forecast.forecast.length,
        reorderPoint: recommendations.reorder_point || 0,
        safetyStock: recommendations.safety_stock || 0,
        priority: recommendations.priority || 'medium',
        stockoutRisk: recommendations.stockout_risk || 'low',
        forecast: forecast.forecast
      };
    });

    // Filter by reorder alerts if selected
    if (showReorderOnly) {
      products = products.filter(p => p.reorderPoint > 0);
    }

    // Sort products
    products.sort((a, b) => {
      switch (sortBy) {
        case 'demand':
          return b.totalDemand - a.totalDemand;
        case 'reorder':
          return b.reorderPoint - a.reorderPoint;
        case 'alphabetical':
          return a.productId.localeCompare(b.productId);
        default:
          return b.totalDemand - a.totalDemand;
      }
    });

    return products;
  }, [forecastData, sortBy, showReorderOnly]);

  const selectedProductData = useMemo(() => {
    if (!selectedProduct || !forecastData?.forecasts?.[selectedProduct]) return null;

    const forecast = forecastData.forecasts[selectedProduct];
    const recommendations = forecastData.recommendations?.[selectedProduct] || forecast.recommendations || {};

    return {
      productId: selectedProduct,
      forecast: forecast.forecast,
      recommendations,
      model: forecast.model || 'holt_winters',
      dataPoints: forecast.dataPoints || 0
    };
  }, [selectedProduct, forecastData]);

  const chartData = useMemo(() => {
    if (!selectedProductData) return [];

    return selectedProductData.forecast.map((day, index) => ({
      date: day.date,
      predicted: day.predicted_units,
      lower: day.lower80,
      upper: day.upper80,
      dayIndex: index + 1
    }));
  }, [selectedProductData]);

  const insights = forecastData?.insights || [];
  const summary = forecastData?.summary || {};

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    return (
      <div 
        className="rounded-lg p-4 shadow-lg border backdrop-blur-sm" 
        style={{ 
          backgroundColor: colors.surface + 'f0', 
          border: `1px solid ${colors.border}` 
        }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>
          {format(parseISO(data.date), 'MMM dd, yyyy')}
        </p>
        <div className="space-y-1">
          <p className="text-orange-400 font-medium">
            Predicted Units: {Math.round(data.predicted)}
          </p>
          <p className="text-gray-400 text-xs">
            Range: {Math.round(data.lower)} - {Math.round(data.upper)} units
          </p>
        </div>
      </div>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return colors.textSecondary;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <div className="backdrop-blur rounded-xl p-6 h-full animate-pulse" 
           style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-600 rounded w-1/3"></div>
          <div className="h-64 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur rounded-xl p-6 h-full" 
           style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="text-center">
          <div className="text-red-400 mb-2">📦</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
            Inventory Forecast Error
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur rounded-xl p-6 h-full" 
         style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1" style={{ color: colors.text }}>
            Inventory Demand Forecast
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {summary.total_products || 0} products • {formatNumber(summary.total_demand_forecast || 0)} total demand forecast
          </p>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: colors.text }}>
              {productList.filter(p => p.stockoutRisk === 'high').length}
            </div>
            <p className="text-xs text-red-400">High Risk</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: colors.text }}>
              {productList.filter(p => p.priority === 'high').length}
            </div>
            <p className="text-xs text-orange-400">Priority</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Horizon Selection */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Forecast Horizon
          </label>
          <div className="flex gap-1">
            {[14, 30, 60].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                  horizon === h 
                    ? 'bg-orange-600 text-white' 
                    : 'hover:bg-orange-600/20'
                }`}
                style={horizon !== h ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
              >
                {h}d
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ 
              backgroundColor: colors.background, 
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <option value="demand">Total Demand</option>
            <option value="reorder">Reorder Point</option>
            <option value="alphabetical">Product ID</option>
          </select>
        </div>

        {/* Filter Options */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Filters
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showReorderOnly}
              onChange={(e) => setShowReorderOnly(e.target.checked)}
              className="rounded focus:ring-orange-500"
            />
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              Reorder Alerts Only
            </span>
          </label>
        </div>

        {/* Product Selection */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Selected Product
          </label>
          <select
            value={selectedProduct || ''}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ 
              backgroundColor: colors.background, 
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            {productList.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.productId} ({Math.round(product.totalDemand)} units)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chart */}
      {chartData.length > 0 && (
        <div className="h-80 mb-6">
          <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
            Demand Forecast: {selectedProduct}
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="demandConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              
              <XAxis
                dataKey="date"
                tick={{ fill: colors.textSecondary, fontSize: 11 }}
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                stroke={colors.border}
              />
              
              <YAxis
                tick={{ fill: colors.textSecondary, fontSize: 11 }}
                tickFormatter={(value) => Math.round(value)}
                stroke={colors.border}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="upper"
                fill="url(#demandConfidence)"
                stroke="none"
                isAnimationActive={false}
              />
              
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#F97316"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
              
              <Line
                type="monotone"
                dataKey="lower"
                stroke="#F97316"
                strokeWidth={1}
                strokeOpacity={0.5}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Product Recommendations Panel */}
      {selectedProductData && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
          <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
            Inventory Recommendations: {selectedProduct}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold mb-1" style={{ color: colors.text }}>
                {selectedProductData.recommendations.reorder_point || 0}
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Reorder Point</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold mb-1" style={{ color: colors.text }}>
                {selectedProductData.recommendations.safety_stock || 0}
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Safety Stock</p>
            </div>
            
            <div className="text-center">
              <div 
                className="text-lg font-bold mb-1 capitalize"
                style={{ color: getPriorityColor(selectedProductData.recommendations.priority) }}
              >
                {selectedProductData.recommendations.priority || 'Medium'}
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Priority</p>
            </div>
            
            <div className="text-center">
              <div 
                className="text-lg font-bold mb-1 capitalize"
                style={{ color: getRiskColor(selectedProductData.recommendations.stockout_risk) }}
              >
                {selectedProductData.recommendations.stockout_risk || 'Low'}
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Stockout Risk</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span style={{ color: colors.textSecondary }}>Avg Daily Demand: </span>
                <span style={{ color: colors.text }}>
                  {selectedProductData.recommendations.avg_daily_demand?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ color: colors.textSecondary }}>Demand Variability: </span>
                <span style={{ color: colors.text }}>
                  {selectedProductData.recommendations.demand_variability?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product List Table */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
          Product Demand Overview
        </h4>
        
        <div className="overflow-x-auto">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ backgroundColor: colors.background }}>
                <tr className="border-b" style={{ borderColor: colors.border }}>
                  <th className="text-left py-2 px-3" style={{ color: colors.text }}>Product ID</th>
                  <th className="text-right py-2 px-3" style={{ color: colors.text }}>Total Demand</th>
                  <th className="text-right py-2 px-3" style={{ color: colors.text }}>Avg Daily</th>
                  <th className="text-center py-2 px-3" style={{ color: colors.text }}>Priority</th>
                  <th className="text-center py-2 px-3" style={{ color: colors.text }}>Risk</th>
                  <th className="text-right py-2 px-3" style={{ color: colors.text }}>Reorder Point</th>
                </tr>
              </thead>
              <tbody>
                {productList.slice(0, 20).map((product) => (
                  <tr
                    key={product.productId}
                    className={`border-b cursor-pointer hover:bg-gray-700/20 ${
                      selectedProduct === product.productId ? 'bg-orange-600/10' : ''
                    }`}
                    style={{ borderColor: colors.border }}
                    onClick={() => setSelectedProduct(product.productId)}
                  >
                    <td className="py-2 px-3" style={{ color: colors.text }}>
                      {product.productId}
                    </td>
                    <td className="py-2 px-3 text-right" style={{ color: colors.text }}>
                      {Math.round(product.totalDemand)}
                    </td>
                    <td className="py-2 px-3 text-right" style={{ color: colors.text }}>
                      {product.avgDaily.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: getPriorityColor(product.priority) + '20',
                          color: getPriorityColor(product.priority)
                        }}
                      >
                        {product.priority}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: getRiskColor(product.stockoutRisk) + '20',
                          color: getRiskColor(product.stockoutRisk)
                        }}
                      >
                        {product.stockoutRisk}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right" style={{ color: colors.text }}>
                      {product.reorderPoint}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {productList.length > 20 && (
          <p className="text-xs mt-2 text-center" style={{ color: colors.textSecondary }}>
            Showing top 20 of {productList.length} products
          </p>
        )}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="pt-6 border-t" style={{ borderColor: colors.border }}>
          <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
            Inventory Insights
          </h4>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className="p-3 rounded-lg"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {insight.type === 'summary' ? '📦' : 
                     insight.type === 'high_demand' ? '🔥' : 
                     insight.type === 'reorder' ? '⚠️' : '💡'}
                  </span>
                  <div>
                    <h5 className="text-sm font-medium mb-1" style={{ color: colors.text }}>
                      {insight.title}
                    </h5>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      {insight.message}
                    </p>
                    {insight.products && (
                      <div className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                        Top products: {insight.products.slice(0, 3).map(p => p.productId).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}