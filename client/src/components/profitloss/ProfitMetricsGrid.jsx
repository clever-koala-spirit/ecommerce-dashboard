import React from 'react';
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ProfitMetricsGrid = ({ data, detailed = false }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const formatChange = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const basicMetrics = [
    {
      title: 'Gross Margin',
      value: formatPercent((data.summary.grossProfit / data.summary.totalRevenue) * 100),
      change: 2.3,
      description: 'Revenue minus COGS',
      icon: CalculatorIcon,
      color: 'var(--color-green)'
    },
    {
      title: 'Net Margin',
      value: formatPercent(data.summary.profitMargin),
      change: data.summary.profitMarginChange,
      description: 'Final profit after all expenses',
      icon: ChartBarIcon,
      color: 'var(--color-purple)'
    },
    {
      title: 'ROAS',
      value: `${(data.summary.totalRevenue / data.expenses.advertising).toFixed(1)}x`,
      change: 8.2,
      description: 'Return on Ad Spend',
      icon: ArrowTrendingUpIcon,
      color: 'var(--color-blue)'
    },
    {
      title: 'Break-even Orders',
      value: Math.round(data.expenses.advertising / data.breakdown.avgProfitPerOrder).toLocaleString(),
      change: -5.1,
      description: 'Orders needed to cover ad spend',
      icon: CurrencyDollarIcon,
      color: 'var(--color-orange)'
    }
  ];

  const advancedMetrics = [
    {
      title: 'LTV:CAC Ratio',
      value: '3.2:1',
      change: 12.5,
      description: 'Lifetime Value to Customer Acquisition Cost',
      target: '> 3:1',
      status: 'good'
    },
    {
      title: 'Payback Period',
      value: '45 days',
      change: -8.3,
      description: 'Time to recover customer acquisition cost',
      target: '< 60 days',
      status: 'good'
    },
    {
      title: 'Contribution Margin',
      value: formatPercent(68.2),
      change: 3.1,
      description: 'Revenue minus variable costs',
      target: '> 60%',
      status: 'good'
    },
    {
      title: 'Cash Conversion Cycle',
      value: '18 days',
      change: 2.1,
      description: 'Time to convert inventory to cash',
      target: '< 30 days',
      status: 'good'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'var(--color-green)';
      case 'warning': return 'var(--color-orange)';
      case 'danger': return 'var(--color-red)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const MetricCard = ({ metric, isAdvanced = false }) => (
    <div 
      className="rounded-2xl p-6 border transition-all duration-200 hover:scale-[1.02]"
      style={{ 
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {!isAdvanced && (
            <div 
              className="p-2 rounded-lg"
              style={{ background: metric.color + '20' }}
            >
              <metric.icon 
                className="h-5 w-5" 
                style={{ color: metric.color }}
              />
            </div>
          )}
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {metric.title}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {metric.description}
            </p>
          </div>
        </div>
        
        {metric.change !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            {metric.change >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span style={{ 
              color: metric.change >= 0 ? 'var(--color-green)' : 'var(--color-red)'
            }}>
              {formatChange(metric.change)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {metric.value}
          </p>
          {isAdvanced && metric.target && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Target: <span style={{ color: getStatusColor(metric.status) }}>
                {metric.target}
              </span>
            </p>
          )}
        </div>
        
        {isAdvanced && metric.status && (
          <div 
            className="w-3 h-3 rounded-full"
            style={{ background: getStatusColor(metric.status) }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="rounded-2xl p-6 border"
      style={{ 
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Profitability Metrics
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {detailed ? 'Advanced profit analysis' : 'Key performance indicators'}
          </p>
        </div>
        
        <InformationCircleIcon 
          className="h-6 w-6" 
          style={{ color: 'var(--color-text-secondary)' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {basicMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {detailed && (
        <>
          <div 
            className="my-6 border-t pt-6"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Advanced Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {advancedMetrics.map((metric, index) => (
                <MetricCard key={index} metric={metric} isAdvanced={true} />
              ))}
            </div>
          </div>

          {/* Insights Panel */}
          <div 
            className="mt-6 p-4 rounded-xl"
            style={{ background: 'var(--color-accent)' + '10' }}
          >
            <div className="flex items-start gap-3">
              <ArrowTrendingUpIcon 
                className="h-5 w-5 mt-0.5" 
                style={{ color: 'var(--color-accent)' }}
              />
              <div>
                <h4 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Profitability Insights
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li>• Your gross margin is healthy at 61%, above industry average of 55%</li>
                  <li>• ROAS of {(data.summary.totalRevenue / data.expenses.advertising).toFixed(1)}x indicates efficient ad spend</li>
                  <li>• 97% order profitability suggests good product-market fit</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitMetricsGrid;