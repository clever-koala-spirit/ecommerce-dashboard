import React, { useState, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import ProfitTrendChart from './ProfitTrendChart';
import ProductProfitabilityTable from './ProductProfitabilityTable';
import ExpenseBreakdown from './ExpenseBreakdown';
import ProfitMetricsGrid from './ProfitMetricsGrid';

const ProfitLossDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState('summary'); // 'summary', 'detailed', 'product'

  // Mock data - in real app this would come from API
  const profitData = useMemo(() => ({
    summary: {
      totalRevenue: 142580,
      grossProfit: 87230,
      netProfit: 34120,
      profitMargin: 23.9,
      revenueChange: 15.3,
      grossProfitChange: 12.1,
      netProfitChange: 8.7,
      profitMarginChange: -2.1
    },
    expenses: {
      cogs: 55350, // Cost of Goods Sold
      fulfillment: 14250,
      advertising: 28940,
      processing: 3420,
      shipping: 5280,
      other: 1220
    },
    breakdown: {
      orders: 956,
      avgOrderValue: 149.15,
      avgProfitPerOrder: 35.69,
      profitableOrders: 924,
      profitability: 96.7
    }
  }), [timeRange]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getStatusColor = (value) => {
    return value >= 0 ? 'var(--color-green)' : 'var(--color-red)';
  };

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--color-bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family)' }}>
            Profit & Loss
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Real-time profit tracking across all channels and products
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ 
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <div className="flex items-center rounded-xl border" style={{ border: '1px solid var(--color-border)' }}>
            {[
              { id: 'summary', label: 'Summary', icon: ChartBarIcon },
              { id: 'detailed', label: 'Detailed', icon: EyeIcon },
              { id: 'product', label: 'Products', icon: CurrencyDollarIcon }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === mode.id ? 'rounded-xl' : ''
                }`}
                style={{
                  background: viewMode === mode.id ? 'var(--color-accent)' : 'transparent',
                  color: viewMode === mode.id ? 'white' : 'var(--color-text-primary)'
                }}
              >
                <mode.icon className="h-4 w-4" />
                {mode.label}
              </button>
            ))}
          </div>

          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-0 transition-all hover:scale-105"
            style={{ 
              background: 'var(--color-green)',
              color: 'white'
            }}
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export P&L
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(profitData.summary.totalRevenue),
            change: profitData.summary.revenueChange,
            icon: CurrencyDollarIcon,
            color: 'var(--color-blue)'
          },
          {
            title: 'Gross Profit',
            value: formatCurrency(profitData.summary.grossProfit),
            change: profitData.summary.grossProfitChange,
            icon: ArrowTrendingUpIcon,
            color: 'var(--color-green)',
            subtitle: `${((profitData.summary.grossProfit / profitData.summary.totalRevenue) * 100).toFixed(1)}% margin`
          },
          {
            title: 'Net Profit',
            value: formatCurrency(profitData.summary.netProfit),
            change: profitData.summary.netProfitChange,
            icon: ChartBarIcon,
            color: 'var(--color-purple)',
            subtitle: `${profitData.summary.profitMargin}% margin`
          },
          {
            title: 'Profit Per Order',
            value: formatCurrency(profitData.breakdown.avgProfitPerOrder),
            change: 5.3,
            icon: ArrowTrendingUpIcon,
            color: 'var(--color-orange)',
            subtitle: `${profitData.breakdown.profitableOrders}/${profitData.breakdown.orders} profitable`
          }
        ].map((metric, index) => (
          <div 
            key={index}
            className="rounded-2xl p-6 border transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            style={{ 
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ background: metric.color + '20' }}
              >
                <metric.icon 
                  className="h-6 w-6" 
                  style={{ color: metric.color }}
                />
              </div>
              
              <div className="flex items-center gap-1 text-sm font-medium">
                {metric.change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span style={{ color: getStatusColor(metric.change) }}>
                  {formatPercent(metric.change)}
                </span>
              </div>
            </div>
            
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {metric.title}
            </h3>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {metric.value}
            </p>
            {metric.subtitle && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {metric.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* P&L Waterfall Chart */}
      <ProfitTrendChart data={profitData} timeRange={timeRange} />

      {/* Content based on view mode */}
      {viewMode === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfitMetricsGrid data={profitData} />
          </div>
          <div className="lg:col-span-1">
            <ExpenseBreakdown expenses={profitData.expenses} />
          </div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseBreakdown expenses={profitData.expenses} detailed={true} />
          <ProfitMetricsGrid data={profitData} detailed={true} />
        </div>
      )}

      {viewMode === 'product' && (
        <ProductProfitabilityTable />
      )}
    </div>
  );
};

export default ProfitLossDashboard;