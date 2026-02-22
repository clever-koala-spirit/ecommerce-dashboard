import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

const COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#6366f1', '#8b5cf6', '#14b8a6'
];

const CHART_TYPES = [
  { key: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { key: 'line', label: 'Line Chart', icon: LineChartIcon },
  { key: 'pie', label: 'Pie Chart', icon: PieChartIcon }
];

const METRICS = [
  { key: 'revenue', label: 'Revenue', formatter: formatCurrency },
  { key: 'orders', label: 'Orders', formatter: formatNumber },
  { key: 'customers', label: 'Customers', formatter: formatNumber },
  { key: 'conversion_rate', label: 'Conversion Rate', formatter: formatPercent },
  { key: 'avg_order_value', label: 'Average Order Value', formatter: formatCurrency },
  { key: 'profit_margin', label: 'Profit Margin', formatter: formatPercent }
];

const StoreComparisonChart = ({ 
  stores = [], 
  selectedStores = [], 
  metric = 'revenue',
  timeRange = '30d' 
}) => {
  const [chartType, setChartType] = useState('bar');
  const [showTrends, setShowTrends] = useState(false);

  const selectedMetric = METRICS.find(m => m.key === metric) || METRICS[0];
  
  const chartData = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    const filteredStores = selectedStores.length > 0 
      ? stores.filter(store => selectedStores.includes(store.id))
      : stores;

    return filteredStores.map((store, index) => ({
      name: store.store_name || store.connected_shop,
      storeName: store.store_name || store.connected_shop,
      storeId: store.id,
      value: store.metrics?.[metric] || 0,
      color: COLORS[index % COLORS.length],
      trend: store.trends?.[metric]?.change || 0,
      ...store.metrics // Include all metrics for tooltip
    }));
  }, [stores, selectedStores, metric]);

  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const averageValue = useMemo(() => {
    return chartData.length > 0 ? totalValue / chartData.length : 0;
  }, [totalValue, chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {data.storeName}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-slate-600 dark:text-slate-400">{selectedMetric.label}:</span>{' '}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {selectedMetric.formatter(data.value)}
              </span>
            </p>
            {showTrends && data.trend !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-slate-600 dark:text-slate-400">Trend:</span>
                {data.trend > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : data.trend < 0 ? (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-400" />
                )}
                <span className={`font-medium ${
                  data.trend > 0 ? 'text-emerald-600' : 
                  data.trend < 0 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {Math.abs(data.trend).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-slate-500 dark:text-slate-400">
          No data available for comparison
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Store Performance Comparison
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Comparing {chartData.length} stores by {selectedMetric.label.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Type Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {CHART_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => setChartType(type.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  chartType === type.key
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>

          {/* Show Trends Toggle */}
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showTrends}
              onChange={(e) => setShowTrends(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500"
            />
            Show Trends
          </label>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {selectedMetric.formatter(totalValue)}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Average</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {selectedMetric.formatter(averageValue)}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Stores</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {chartData.length}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        {renderChart()}
      </div>

      {/* Performance Analysis */}
      {chartData.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Performance Analysis
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performer */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <h5 className="text-emerald-800 dark:text-emerald-200 font-semibold mb-2">
                Top Performer
              </h5>
              {(() => {
                const topStore = chartData.reduce((max, store) => 
                  store.value > max.value ? store : max
                );
                return (
                  <div>
                    <p className="text-emerald-900 dark:text-emerald-100 font-medium">
                      {topStore.storeName}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                      {selectedMetric.formatter(topStore.value)}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Improvement Opportunity */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <h5 className="text-amber-800 dark:text-amber-200 font-semibold mb-2">
                Needs Attention
              </h5>
              {(() => {
                const bottomStore = chartData.reduce((min, store) => 
                  store.value < min.value ? store : min
                );
                return (
                  <div>
                    <p className="text-amber-900 dark:text-amber-100 font-medium">
                      {bottomStore.storeName}
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      {selectedMetric.formatter(bottomStore.value)}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StoreComparisonChart;