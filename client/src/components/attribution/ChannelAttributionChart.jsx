import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ChannelAttributionChart = ({ data }) => {
  const chartData = data.map(channel => ({
    name: channel.name,
    value: channel.attribution,
    revenue: channel.revenue,
    color: getChannelColor(channel.name)
  }));

  function getChannelColor(channelName) {
    const colors = {
      'Meta Ads': '#1877F2',
      'Google Ads': '#4285F4',
      'TikTok Ads': '#000000',
      'Email': '#FF6B35',
      'Organic Search': '#34A853',
      'Direct': '#9333EA'
    };
    return colors[channelName] || '#6B7280';
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="rounded-xl p-3 border shadow-lg"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {data.name}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <div style={{ color: 'var(--color-text-secondary)' }}>
              Revenue: <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                ${data.revenue.toLocaleString()}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              Attribution: <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {data.value.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {entry.value}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {entry.payload.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChannelAttributionChart;