/**
 * Attribution Funnel Chart - Shows how customers progress through the conversion funnel
 * with attribution breakdowns at each stage
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const AttributionFunnelChart = ({ attributionData, journeyData, className = '' }) => {
  const funnelData = useMemo(() => {
    if (!attributionData?.analytics || !journeyData) return [];

    // Define funnel stages
    const stages = [
      {
        name: 'Awareness',
        description: 'First touchpoint with brand',
        color: '#3B82F6',
        channels: ['Organic Search', 'Display', 'Social', 'Referral']
      },
      {
        name: 'Interest',
        description: 'Engaged with content/ads',
        color: '#8B5CF6', 
        channels: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'YouTube']
      },
      {
        name: 'Consideration',
        description: 'Viewed products/compared options',
        color: '#F59E0B',
        channels: ['Email', 'Retargeting', 'Search']
      },
      {
        name: 'Intent',
        description: 'Added to cart or similar action',
        color: '#EF4444',
        channels: ['Direct', 'Email', 'SMS']
      },
      {
        name: 'Purchase',
        description: 'Completed transaction',
        color: '#10B981',
        channels: ['Direct', 'Email', 'Checkout']
      }
    ];

    // Calculate metrics for each stage
    const stageMetrics = stages.map((stage, index) => {
      // Get channels relevant to this stage
      const stageChannels = attributionData.analytics.filter(channel => 
        stage.channels.some(sc => channel.channel.toLowerCase().includes(sc.toLowerCase()))
      );

      // Calculate stage value (this is simplified - in real implementation you'd have stage-specific data)
      const stageRevenue = stageChannels.reduce((sum, channel) => sum + channel.revenue, 0);
      const stageOrders = stageChannels.reduce((sum, channel) => sum + (channel.orderCount || 0), 0);
      
      // Simulate funnel drop-off (in real implementation, you'd track actual stage completion)
      const dropOffRate = Math.pow(0.4, index); // Each stage loses 60%
      const visitors = Math.round((attributionData.summary?.totalOrders || 1000) / dropOffRate);
      
      const conversionRate = index === 0 ? 100 : (visitors / (stages[index - 1]?.visitors || visitors)) * 100;
      
      return {
        ...stage,
        revenue: stageRevenue,
        orders: stageOrders,
        visitors,
        conversionRate,
        attributionBreakdown: stageChannels.map(channel => ({
          channel: channel.channel,
          revenue: channel.revenue,
          percentage: (channel.revenue / Math.max(stageRevenue, 1)) * 100,
          color: getChannelColor(channel.channel)
        }))
      };
    });

    return stageMetrics;
  }, [attributionData, journeyData]);

  const getChannelColor = (channelName) => {
    const colors = {
      'Meta Ads': '#1877F2',
      'Google Ads': '#EA4335', 
      'TikTok Ads': '#000000',
      'Email': '#10B981',
      'Organic Search': '#8B5CF6',
      'Direct': '#F59E0B',
      'Referral': '#EF4444',
      'Display': '#06B6D4',
      'SMS': '#F97316'
    };
    return colors[channelName] || '#6B7280';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="rounded-xl p-4 border shadow-lg max-w-xs"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {data.name} Stage
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            {data.description}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>Visitors:</span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {formatNumber(data.visitors)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>Revenue:</span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrency(data.revenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>Conversion Rate:</span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {data.conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {data.attributionBreakdown.length > 0 && (
            <>
              <div className="border-t mt-3 pt-3" style={{ borderColor: 'var(--color-border)' }}>
                <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Channel Attribution:
                </h4>
                <div className="space-y-1">
                  {data.attributionBreakdown.slice(0, 3).map((channel, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: channel.color }}
                        />
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {channel.channel}
                        </span>
                      </div>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {channel.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  if (!funnelData.length) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">No Funnel Data</h3>
          <p className="text-sm">Attribution funnel will appear when you have customer journey data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Funnel Visualization */}
      <div className="mb-8">
        <div className="flex flex-col items-center space-y-2">
          {funnelData.map((stage, index) => {
            const width = Math.max(20, 100 - (index * 15)); // Decreasing width
            const maxRevenue = Math.max(...funnelData.map(s => s.revenue));
            const revenueWidth = Math.max(10, (stage.revenue / maxRevenue) * 80);
            
            return (
              <div key={stage.name} className="w-full flex items-center justify-center">
                <div 
                  className="rounded-lg p-6 text-center transition-all hover:scale-105 cursor-pointer shadow-sm relative"
                  style={{ 
                    width: `${width}%`,
                    background: stage.color,
                    minWidth: '200px'
                  }}
                >
                  <h3 className="text-lg font-bold text-white mb-1">
                    {stage.name}
                  </h3>
                  <p className="text-white/90 text-sm mb-2">
                    {formatNumber(stage.visitors)} visitors
                  </p>
                  <p className="text-white/80 text-xs">
                    {formatCurrency(stage.revenue)} revenue
                  </p>
                  
                  {/* Conversion Rate Badge */}
                  {index > 0 && (
                    <div 
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        background: 'var(--color-bg-card)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {stage.conversionRate.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Bar Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Revenue by Funnel Stage
        </h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Attribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {funnelData.map((stage, index) => (
          <div 
            key={stage.name}
            className="rounded-lg p-4"
            style={{ 
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {stage.name}
              </h4>
            </div>
            
            <div className="space-y-2">
              {stage.attributionBreakdown.slice(0, 4).map((channel, channelIndex) => (
                <div key={channelIndex} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    />
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {channel.channel}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(channel.revenue)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {channel.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttributionFunnelChart;