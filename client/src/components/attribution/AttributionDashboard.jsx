import React, { useState, useMemo } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import AttributionModelSelector from './AttributionModelSelector';
import CustomerJourneyMap from './CustomerJourneyMap';
import ChannelAttributionChart from './ChannelAttributionChart';
import TouchpointAnalysis from './TouchpointAnalysis';

const AttributionDashboard = () => {
  const [selectedModel, setSelectedModel] = useState('data-driven');
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data - in real app this would come from API
  const attributionData = useMemo(() => ({
    overview: {
      totalRevenue: 125430,
      totalOrders: 842,
      averageOrderValue: 149,
      conversionRate: 3.2,
      revenueChange: 12.5,
      ordersChange: 8.3,
      aovChange: 3.8,
      conversionChange: -1.2
    },
    channels: [
      {
        name: 'Meta Ads',
        icon: '📘',
        revenue: 45230,
        orders: 304,
        aov: 148.8,
        roas: 4.2,
        attribution: 36.1,
        trend: 15.2
      },
      {
        name: 'Google Ads',
        icon: '🔍',
        revenue: 38940,
        orders: 261,
        aov: 149.2,
        roas: 3.8,
        attribution: 31.0,
        trend: -5.1
      },
      {
        name: 'TikTok Ads',
        icon: '🎵',
        revenue: 21080,
        orders: 142,
        aov: 148.5,
        roas: 5.1,
        attribution: 16.8,
        trend: 28.7
      },
      {
        name: 'Email',
        icon: '✉️',
        revenue: 12890,
        orders: 87,
        aov: 148.2,
        roas: 12.3,
        attribution: 10.3,
        trend: 4.2
      },
      {
        name: 'Organic Search',
        icon: '🌐',
        revenue: 7290,
        orders: 48,
        aov: 151.9,
        roas: 0,
        attribution: 5.8,
        trend: 2.1
      }
    ]
  }), [selectedModel, timeRange]);

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

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--color-bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family)' }}>
            Attribution Analytics
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Multi-touch attribution across all marketing channels
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
          </select>
          
          <AttributionModelSelector 
            selected={selectedModel}
            onChange={setSelectedModel}
          />
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(attributionData.overview.totalRevenue),
            change: attributionData.overview.revenueChange,
            icon: CurrencyDollarIcon,
            color: 'var(--color-green)'
          },
          {
            title: 'Orders',
            value: attributionData.overview.totalOrders.toLocaleString(),
            change: attributionData.overview.ordersChange,
            icon: ChartBarIcon,
            color: 'var(--color-blue)'
          },
          {
            title: 'Average Order Value',
            value: formatCurrency(attributionData.overview.averageOrderValue),
            change: attributionData.overview.aovChange,
            icon: ArrowTrendingUpIcon,
            color: 'var(--color-purple)'
          },
          {
            title: 'Conversion Rate',
            value: `${attributionData.overview.conversionRate}%`,
            change: attributionData.overview.conversionChange,
            icon: UserGroupIcon,
            color: 'var(--color-orange)'
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
                <span style={{ 
                  color: metric.change >= 0 ? 'var(--color-green)' : 'var(--color-red)'
                }}>
                  {formatPercent(metric.change)}
                </span>
              </div>
            </div>
            
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {metric.title}
            </h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Attribution Chart */}
        <div 
          className="rounded-2xl p-6 border"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Revenue Attribution
            </h2>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <InformationCircleIcon className="h-4 w-4" />
              <span>{selectedModel.replace('-', ' ')} model</span>
            </div>
          </div>
          <ChannelAttributionChart data={attributionData.channels} />
        </div>

        {/* Channel Performance Table */}
        <div 
          className="rounded-2xl p-6 border"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Channel Performance
            </h2>
            <EyeIcon className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
          </div>
          
          <div className="space-y-4">
            {attributionData.channels.map((channel, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-opacity-50"
                style={{ background: 'var(--color-bg-hover)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{channel.icon}</div>
                  <div>
                    <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {channel.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {channel.orders} orders • {formatCurrency(channel.aov)} AOV
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatCurrency(channel.revenue)}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {channel.roas ? `${channel.roas.toFixed(1)}x ROAS` : 'Organic'}
                    </span>
                    <span style={{ 
                      color: channel.trend >= 0 ? 'var(--color-green)' : 'var(--color-red)'
                    }}>
                      {formatPercent(channel.trend)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Journey & Touchpoint Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomerJourneyMap />
        </div>
        <div className="lg:col-span-1">
          <TouchpointAnalysis />
        </div>
      </div>
    </div>
  );
};

export default AttributionDashboard;