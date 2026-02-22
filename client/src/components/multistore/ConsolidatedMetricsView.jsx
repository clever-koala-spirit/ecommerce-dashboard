import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const ConsolidatedMetricsView = ({ consolidated, timeRange = '30d' }) => {
  const [expandedBreakdown, setExpandedBreakdown] = useState('byStore');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const metrics = useMemo(() => {
    if (!consolidated?.summary) return [];

    return [
      {
        key: 'revenue',
        label: 'Total Revenue',
        value: consolidated.summary.revenue || 0,
        formatter: formatCurrency,
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        trend: consolidated.trends?.revenue?.change || 0
      },
      {
        key: 'orders',
        label: 'Total Orders',
        value: consolidated.summary.orders || 0,
        formatter: formatNumber,
        icon: ShoppingCart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        trend: consolidated.trends?.orders?.change || 0
      },
      {
        key: 'customers',
        label: 'Total Customers',
        value: consolidated.summary.customers || 0,
        formatter: formatNumber,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        trend: consolidated.trends?.customers?.change || 0
      },
      {
        key: 'avg_order_value',
        label: 'Average Order Value',
        value: consolidated.summary.avg_order_value || 0,
        formatter: formatCurrency,
        icon: Target,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        trend: consolidated.trends?.avg_order_value?.change || 0
      },
      {
        key: 'conversion_rate',
        label: 'Avg. Conversion Rate',
        value: consolidated.summary.conversion_rate || 0,
        formatter: formatPercent,
        icon: Percent,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        trend: consolidated.trends?.conversion_rate?.change || 0
      },
      {
        key: 'total_inventory',
        label: 'Total Inventory',
        value: consolidated.summary.total_inventory || 0,
        formatter: formatNumber,
        icon: Building2,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        trend: consolidated.trends?.total_inventory?.change || 0
      }
    ];
  }, [consolidated]);

  const storeBreakdownData = useMemo(() => {
    if (!consolidated?.breakdown?.byStore) return [];

    return consolidated.breakdown.byStore.map((store, index) => ({
      name: store.storeName,
      revenue: store.metrics.revenue || 0,
      orders: store.metrics.orders || 0,
      customers: store.metrics.customers || 0,
      percentage: store.percentageOfTotal?.revenue || 0,
      color: COLORS[index % COLORS.length]
    }));
  }, [consolidated]);

  const regionBreakdownData = useMemo(() => {
    if (!consolidated?.breakdown?.byRegion) return [];

    return Object.entries(consolidated.breakdown.byRegion).map(([region, data], index) => ({
      name: region,
      value: data.revenue || 0,
      color: COLORS[index % COLORS.length]
    }));
  }, [consolidated]);

  if (!consolidated) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className="flex items-center gap-1">
                {metric.trend > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : metric.trend < 0 ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                ) : null}
                <span className={`text-sm font-medium ${
                  metric.trend > 0 ? 'text-emerald-600' : 
                  metric.trend < 0 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {metric.trend !== 0 ? `${Math.abs(metric.trend).toFixed(1)}%` : '—'}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {metric.formatter(metric.value)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Consolidated Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Consolidated Performance Overview
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Aggregated metrics across {consolidated.storeCount} stores for the {timeRange} period
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400">Currency</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {consolidated.currency || 'USD'}
            </p>
          </div>
        </div>

        {/* Performance Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Breakdown */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Total Revenue</h4>
            </div>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              {formatCurrency(consolidated.summary.revenue || 0)}
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Across all connected stores
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Total Orders</h4>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {formatNumber(consolidated.summary.orders || 0)}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {formatCurrency(consolidated.summary.avg_order_value || 0)} average value
            </p>
          </div>

          {/* Customer Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Active Customers</h4>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {formatNumber(consolidated.summary.customers || 0)}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {formatPercent(consolidated.summary.conversion_rate || 0)} conversion rate
            </p>
          </div>
        </div>
      </motion.div>

      {/* Breakdown Sections */}
      {consolidated.breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Performance Breakdown
          </h3>

          {/* Breakdown Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'byStore', label: 'By Store' },
              { key: 'byRegion', label: 'By Region' },
              { key: 'byChannel', label: 'By Channel' }
            ].map((breakdown) => (
              <button
                key={breakdown.key}
                onClick={() => setExpandedBreakdown(breakdown.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  expandedBreakdown === breakdown.key
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {breakdown.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {expandedBreakdown === 'byStore' && storeBreakdownData.length > 0 && (
              <motion.div
                key="byStore"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Store Performance Bar Chart */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Revenue by Store
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={storeBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={[formatCurrency, 'Revenue']}
                          labelStyle={{ color: '#1f2937' }}
                        />
                        <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Store Contribution Pie Chart */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Revenue Distribution
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={storeBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {storeBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={[formatCurrency, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Store Details Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Store</th>
                        <th className="text-right py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Revenue</th>
                        <th className="text-right py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Orders</th>
                        <th className="text-right py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Customers</th>
                        <th className="text-right py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeBreakdownData.map((store, index) => (
                        <tr key={index} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: store.color }}
                              />
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {store.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-3 text-slate-900 dark:text-slate-100">
                            {formatCurrency(store.revenue)}
                          </td>
                          <td className="text-right py-3 text-slate-700 dark:text-slate-300">
                            {formatNumber(store.orders)}
                          </td>
                          <td className="text-right py-3 text-slate-700 dark:text-slate-300">
                            {formatNumber(store.customers)}
                          </td>
                          <td className="text-right py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                              {store.percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default ConsolidatedMetricsView;