/**
 * LTV Trends Chart Component
 * Shows LTV trends over time with forecasting
 */

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function LTVTrendsChart({ data }) {
  const { colors } = useTheme();

  if (!data?.trends?.length) {
    return (
      <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          LTV Trends Over Time
        </h3>
        <div className="h-64 flex items-center justify-center" style={{ color: colors.textSecondary }}>
          <div className="text-center">
            <ArrowTrendingUpIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Insufficient data for trend analysis</p>
          </div>
        </div>
      </div>
    );
  }

  // Combine historical and forecast data
  const chartData = [
    ...data.trends.map(trend => ({
      ...trend,
      type: 'historical'
    })),
    ...data.forecast?.map(forecast => ({
      ...forecast,
      type: 'forecast'
    })) || []
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div
        className="p-3 rounded-xl shadow-lg border"
        style={{ 
          background: colors.bgCard, 
          border: `1px solid ${colors.border}`,
          color: colors.text
        }}
      >
        <p className="text-sm font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span style={{ color: COLORS.GREEN[500] }}>Avg LTV: </span>
            {formatCurrency(data.avgLTV)}
          </p>
          <p className="text-sm">
            <span style={{ color: COLORS.BLUE[500] }}>New Customers: </span>
            {data.newCustomers || 0}
          </p>
          {data.isForecast && (
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Forecast • {Math.round((data.confidence || 0) * 100)}% confidence
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
            <ArrowTrendingUpIcon className="h-5 w-5" style={{ color: COLORS.GREEN[500] }} />
            LTV Trends Over Time
          </h3>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Historical performance with ML-powered forecasting
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis 
              dataKey="period" 
              tick={{ fill: colors.textSecondary, fontSize: 12 }}
              axisLine={{ stroke: colors.border }}
            />
            <YAxis 
              tick={{ fill: colors.textSecondary, fontSize: 12 }}
              axisLine={{ stroke: colors.border }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Historical data area */}
            <Area
              type="monotone"
              dataKey="avgLTV"
              stroke={COLORS.GREEN[500]}
              fill={COLORS.GREEN[500]}
              fillOpacity={0.1}
              strokeWidth={2}
              connectNulls={false}
              dot={{ fill: COLORS.GREEN[500], strokeWidth: 2, r: 4 }}
            />
            
            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="avgLTV"
              stroke={COLORS.BLUE[500]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: COLORS.BLUE[500], strokeWidth: 2, r: 3 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ background: COLORS.GREEN[500] }} />
          <span className="text-xs" style={{ color: colors.textSecondary }}>Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 border-dashed border-t-2" style={{ borderColor: COLORS.BLUE[500] }} />
          <span className="text-xs" style={{ color: colors.textSecondary }}>Forecast</span>
        </div>
      </div>
    </div>
  );
}