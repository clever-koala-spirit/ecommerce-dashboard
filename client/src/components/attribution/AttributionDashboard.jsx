import React, { useState, useMemo } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  InformationCircleIcon,
  ChartPieIcon,
  FunnelIcon,
  MapIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import useAttributionData from '../../hooks/useAttributionData';
import AttributionModelSelector from './AttributionModelSelector';
import CustomerJourneyMap from './CustomerJourneyMap';
import ChannelAttributionChart from './ChannelAttributionChart';
import TouchpointAnalysis from './TouchpointAnalysis';
import SankeyJourneyChart from './SankeyJourneyChart';
import AttributionFunnelChart from './AttributionFunnelChart';
import AttributionHeatmap from './AttributionHeatmap';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const AttributionDashboard = () => {
  const [selectedModel, setSelectedModel] = useState('ai_enhanced');
  const [timeRange, setTimeRange] = useState('30d');
  const [activeView, setActiveView] = useState('overview'); // overview, journey, funnel, heatmap

  // Real data from API
  const { 
    data, 
    metrics, 
    journeyAnalytics, 
    loading, 
    error, 
    lastUpdated,
    actions 
  } = useAttributionData({
    timeRange,
    modelType: selectedModel,
    autoRefresh: true
  });

  const views = [
    { 
      key: 'overview', 
      label: 'Overview', 
      icon: ChartPieIcon,
      description: 'Channel performance & attribution'
    },
    { 
      key: 'journey', 
      label: 'Journey Flow', 
      icon: MapIcon,
      description: 'Customer path visualization'
    },
    { 
      key: 'funnel', 
      label: 'Attribution Funnel', 
      icon: FunnelIcon,
      description: 'Stage-by-stage breakdown'
    },
    { 
      key: 'heatmap', 
      label: 'Performance Heatmap', 
      icon: FireIcon,
      description: 'Timing patterns'
    }
  ];

  // Transform data for components
  const channelData = useMemo(() => {
    if (!metrics?.topChannels) return [];
    
    return metrics.topChannels.map(channel => ({
      name: channel.channel,
      icon: getChannelIcon(channel.channel),
      revenue: channel.revenue,
      orders: channel.orderCount || 0,
      aov: channel.revenue / Math.max(channel.orderCount || 1, 1),
      roas: channel.roas || 0,
      attribution: channel.weight * 100,
      trend: Math.random() * 20 - 10 // In real implementation, calculate from historical data
    }));
  }, [metrics]);

  const getChannelIcon = (channelName) => {
    const icons = {
      'Meta Ads': '📘',
      'Google Ads': '🔍', 
      'TikTok Ads': '🎵',
      'Email': '✉️',
      'Organic Search': '🌐',
      'Direct': '🔗',
      'Referral': '🔄',
      'Display': '🎨'
    };
    return icons[channelName] || '📊';
  };

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

  if (loading && !data.attribution) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-page)' }}>
        <LoadingSpinner size="large" message="Loading attribution data..." />
      </div>
    );
  }

  if (error && !data.attribution) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--color-bg-page)' }}>
        <ErrorMessage 
          message={error}
          onRetry={actions.refetch}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--color-bg-page)' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family)' }}>
              Attribution Analytics
            </h1>
            {loading && <LoadingSpinner size="small" />}
          </div>
          <p className="text-base mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Multi-touch attribution across all marketing channels
          </p>
          {lastUpdated && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
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

      {/* View Navigation */}
      <div className="flex flex-wrap gap-2 p-1 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
        {views.map(view => {
          const Icon = view.icon;
          return (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeView === view.key ? 'shadow-sm' : 'hover:opacity-80'
              }`}
              style={{
                background: activeView === view.key ? 'var(--color-bg-card)' : 'transparent',
                color: activeView === view.key ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
              title={view.description}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* Key Metrics Overview */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Revenue',
              value: formatCurrency(metrics?.totalRevenue || 0),
              change: metrics?.trends?.revenueGrowth || 0,
              icon: CurrencyDollarIcon,
              color: 'var(--color-green)'
            },
            {
              title: 'Orders',
              value: (metrics?.totalOrders || 0).toLocaleString(),
              change: metrics?.trends?.orderGrowth || 0,
              icon: ChartBarIcon,
              color: 'var(--color-blue)'
            },
            {
              title: 'Average Order Value',
              value: formatCurrency(metrics?.averageOrderValue || 0),
              change: metrics?.trends?.aovGrowth || 0,
              icon: ArrowTrendingUpIcon,
              color: 'var(--color-purple)'
            },
            {
              title: 'Conversion Rate',
              value: `${(metrics?.conversionRate || 0).toFixed(1)}%`,
              change: Math.random() * 10 - 5, // Replace with real conversion rate change
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
      )}

      {/* Overview View */}
      {activeView === 'overview' && (
        <>
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
                  <span>{selectedModel.replace('_', ' ')} model</span>
                </div>
              </div>
              <ChannelAttributionChart data={channelData} />
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
                {channelData.map((channel, index) => (
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
              <CustomerJourneyMap journeys={data.journeys || []} />
            </div>
            <div className="lg:col-span-1">
              <TouchpointAnalysis />
            </div>
          </div>
        </>
      )}

      {/* Journey Flow View */}
      {activeView === 'journey' && (
        <div 
          className="rounded-2xl p-6 border"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Customer Journey Flow
            </h2>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <InformationCircleIcon className="h-4 w-4" />
              <span>Sankey diagram of customer paths</span>
            </div>
          </div>
          <SankeyJourneyChart journeys={data.journeys || []} />
        </div>
      )}

      {/* Funnel View */}
      {activeView === 'funnel' && (
        <div 
          className="rounded-2xl p-6 border"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Attribution Funnel Analysis
            </h2>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <InformationCircleIcon className="h-4 w-4" />
              <span>Stage-by-stage attribution breakdown</span>
            </div>
          </div>
          <AttributionFunnelChart 
            attributionData={data.attribution}
            journeyData={journeyAnalytics}
          />
        </div>
      )}

      {/* Heatmap View */}
      {activeView === 'heatmap' && (
        <div 
          className="rounded-2xl p-6 border"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <AttributionHeatmap 
            attributionData={data.attribution}
            timeRange={timeRange}
          />
        </div>
      )}
    </div>
  );
};

export default AttributionDashboard;