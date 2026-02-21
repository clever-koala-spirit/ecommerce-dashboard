import React from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Triple Whale style dashboard component
export default function TripleWhaleStyle() {
  const mainMetrics = [
    {
      title: 'Blended ROAS',
      value: '4.2x',
      subtitle: 'All channels',
      change: '+12.3%',
      isPositive: true,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Revenue',
      value: '$125,430',
      subtitle: 'Last 30 days',
      change: '+15.7%',
      isPositive: true,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'New Customers',
      value: '1,243',
      subtitle: 'First-time buyers',
      change: '+8.9%',
      isPositive: true,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'AOV',
      value: '$149.71',
      subtitle: 'Average order value',
      change: '-2.1%',
      isPositive: false,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const channelMetrics = [
    {
      channel: 'Meta Ads',
      spend: '$28,940',
      revenue: '$121,548',
      roas: '4.2x',
      orders: 812,
      icon: '📘',
      color: '#1877F2'
    },
    {
      channel: 'Google Ads',
      spend: '$15,670',
      revenue: '$59,542',
      roas: '3.8x', 
      orders: 399,
      icon: '🔍',
      color: '#4285F4'
    },
    {
      channel: 'TikTok Ads',
      spend: '$8,240',
      revenue: '$42,024',
      roas: '5.1x',
      orders: 281,
      icon: '🎵',
      color: '#000000'
    },
    {
      channel: 'Email',
      spend: '$1,050',
      revenue: '$12,890',
      roas: '12.3x',
      orders: 87,
      icon: '✉️',
      color: '#FF6B35'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last 30 days • Updated 2 minutes ago
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
            Export
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main KPI Cards - Triple Whale Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            {/* Gradient accent */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.color}`} />
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {metric.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {metric.subtitle}
                </p>
              </div>
              
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                metric.isPositive 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {metric.isPositive ? (
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                )}
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Performance - Triple Whale Style */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Channel Performance
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Blended attribution model
          </div>
        </div>

        <div className="space-y-4">
          {channelMetrics.map((channel, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Channel Info */}
              <div className="flex items-center gap-4">
                <div className="text-2xl">{channel.icon}</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {channel.channel}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {channel.orders} orders
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Spend</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {channel.spend}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {channel.revenue}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">ROAS</p>
                  <p className={`font-bold text-lg ${
                    parseFloat(channel.roas) >= 4.0 
                      ? 'text-green-600 dark:text-green-400' 
                      : parseFloat(channel.roas) >= 2.0
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {channel.roas}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Converting Paths
          </h3>
          <div className="space-y-3">
            {[
              { path: 'Meta → Email → Direct', conversions: 127, value: '$18,905' },
              { path: 'Google → Direct', conversions: 89, value: '$13,340' },
              { path: 'TikTok → Meta → Direct', conversions: 64, value: '$9,560' },
              { path: 'Email → Direct', conversions: 45, value: '$6,750' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.path}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.conversions} conversions
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Customer Journey Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg. touchpoints</span>
              <span className="font-semibold text-gray-900 dark:text-white">3.4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Time to purchase</span>
              <span className="font-semibold text-gray-900 dark:text-white">5.2 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Top first-touch</span>
              <span className="font-semibold text-gray-900 dark:text-white">Meta Ads</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Top last-touch</span>
              <span className="font-semibold text-gray-900 dark:text-white">Direct</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}