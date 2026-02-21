import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const TouchpointAnalysis = () => {
  const touchpointData = [
    {
      position: 'First Touch',
      channels: [
        { name: 'TikTok Ads', percentage: 35, change: 12, icon: '🎵' },
        { name: 'Meta Ads', percentage: 28, change: -5, icon: '📘' },
        { name: 'Google Search', percentage: 22, change: 3, icon: '🔍' },
        { name: 'Direct', percentage: 15, change: 8, icon: '🔗' }
      ]
    },
    {
      position: 'Assist Touch',
      channels: [
        { name: 'Meta Ads', percentage: 42, change: 8, icon: '📘' },
        { name: 'Email', percentage: 25, change: 15, icon: '✉️' },
        { name: 'Google Ads', percentage: 18, change: -3, icon: '🔍' },
        { name: 'Website', percentage: 15, change: 5, icon: '🌐' }
      ]
    },
    {
      position: 'Last Touch',
      channels: [
        { name: 'Direct', percentage: 38, change: 22, icon: '🔗' },
        { name: 'Google Search', percentage: 31, change: 7, icon: '🔍' },
        { name: 'Email', percentage: 21, change: 12, icon: '✉️' },
        { name: 'Meta Ads', percentage: 10, change: -8, icon: '📘' }
      ]
    }
  ];

  const getTrendIcon = (change) => {
    if (change > 0) return ArrowTrendingUpIcon;
    if (change < 0) return ArrowTrendingDownIcon;
    return MinusIcon;
  };

  const getTrendColor = (change) => {
    if (change > 0) return 'var(--color-green)';
    if (change < 0) return 'var(--color-red)';
    return 'var(--color-text-secondary)';
  };

  return (
    <div 
      className="rounded-2xl p-6 border h-fit"
      style={{ 
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Touchpoint Analysis
        </h2>
      </div>

      <div className="space-y-6">
        {touchpointData.map((touchpoint, index) => (
          <div key={index}>
            <h3 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {touchpoint.position}
            </h3>
            
            <div className="space-y-3">
              {touchpoint.channels.map((channel, channelIndex) => {
                const TrendIcon = getTrendIcon(channel.change);
                
                return (
                  <div key={channelIndex} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg">{channel.icon}</span>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {channel.name}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mt-1">
                          <div 
                            className="h-1.5 rounded-full"
                            style={{ background: 'var(--color-bg-secondary)' }}
                          >
                            <div 
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${channel.percentage}%`,
                                background: 'var(--color-accent)'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {channel.percentage}%
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <TrendIcon 
                          className="h-3 w-3" 
                          style={{ color: getTrendColor(channel.change) }}
                        />
                        <span style={{ color: getTrendColor(channel.change) }}>
                          {Math.abs(channel.change)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {index < touchpointData.length - 1 && (
              <div 
                className="mt-4 pt-4 border-t"
                style={{ borderTop: '1px solid var(--color-border)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Insights Box */}
      <div 
        className="mt-6 p-4 rounded-xl"
        style={{ background: 'var(--color-accent)' + '10' }}
      >
        <div className="flex items-start gap-3">
          <SparklesIcon 
            className="h-5 w-5 mt-0.5" 
            style={{ color: 'var(--color-accent)' }}
          />
          <div>
            <h4 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Key Insight
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              TikTok is dominating first-touch attribution (+12%), while direct traffic is winning last-touch conversions (+22%). Consider reallocating budget from mid-funnel Meta campaigns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouchpointAnalysis;