/**
 * Customer Segmentation Chart Component
 * Beautiful pie/donut chart showing customer segments and tiers
 */

import React, { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function CustomerSegmentationChart({ data }) {
  const { colors, theme } = useTheme();

  const segmentColors = {
    'VIP': COLORS.PURPLE[500],
    'High Value': COLORS.BLUE[500],
    'Loyal': COLORS.GREEN[500],
    'Regular': COLORS.YELLOW[600],
    'One-time': COLORS.ORANGE[500],
    'New Customer': COLORS.CYAN[500],
    'At Risk': COLORS.RED[500]
  };

  const tierColors = {
    'Platinum': COLORS.PURPLE[500],
    'Gold': COLORS.YELLOW[600],
    'Silver': COLORS.GRAY[500],
    'Bronze': COLORS.ORANGE[500]
  };

  // Process segment data for chart
  const segmentChartData = useMemo(() => {
    if (!data?.segments) return [];
    
    return Object.entries(data.segments).map(([segment, count]) => ({
      name: segment,
      value: count,
      color: segmentColors[segment] || COLORS.GRAY[400]
    }));
  }, [data]);

  // Process tier data for chart  
  const tierChartData = useMemo(() => {
    if (!data?.tiers) return [];
    
    return Object.entries(data.tiers).map(([tier, count]) => ({
      name: tier,
      value: count,
      color: tierColors[tier] || COLORS.GRAY[400]
    }));
  }, [data]);

  const totalCustomers = segmentChartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    const percentage = totalCustomers > 0 ? (data.value / totalCustomers) * 100 : 0;
    
    return (
      <div
        className="rounded-lg p-3 shadow-lg border"
        style={{ 
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          color: colors.text
        }}
      >
        <p className="font-semibold text-sm" style={{ color: data.color }}>
          {data.name}
        </p>
        <p className="text-sm">
          {formatNumber(data.value)} customers ({percentage.toFixed(1)}%)
        </p>
      </div>
    );
  };

  // Custom label function
  const renderLabel = (entry) => {
    const percentage = totalCustomers > 0 ? (entry.value / totalCustomers) * 100 : 0;
    return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
  };

  if (!segmentChartData.length && !tierChartData.length) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          No segmentation data available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
        Customer Segmentation
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segments Chart */}
        {segmentChartData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>
              By Customer Segment
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {segmentChartData.map((entry, index) => (
                      <Cell 
                        key={`segment-cell-${index}`} 
                        fill={entry.color}
                        stroke={colors.border}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Segment Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {segmentChartData.map((segment) => {
                const percentage = totalCustomers > 0 ? (segment.value / totalCustomers) * 100 : 0;
                return (
                  <div key={segment.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: segment.color }}
                    />
                    <span className="text-xs flex-1" style={{ color: colors.text }}>
                      {segment.name}
                    </span>
                    <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tiers Chart */}
        {tierChartData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>
              By Customer Tier
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={400}
                    animationDuration={800}
                  >
                    {tierChartData.map((entry, index) => (
                      <Cell 
                        key={`tier-cell-${index}`} 
                        fill={entry.color}
                        stroke={colors.border}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Tier Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {tierChartData.map((tier) => {
                const percentage = totalCustomers > 0 ? (tier.value / totalCustomers) * 100 : 0;
                return (
                  <div key={tier.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ background: tier.color }}
                    />
                    <span className="text-xs flex-1" style={{ color: colors.text }}>
                      {tier.name}
                    </span>
                    <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: colors.border }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm" style={{ color: colors.textSecondary }}>Total Customers</p>
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {formatNumber(totalCustomers)}
            </p>
          </div>
          
          {segmentChartData.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-sm" style={{ color: colors.textSecondary }}>VIP + High Value</p>
                <p className="text-lg font-bold" style={{ color: COLORS.PURPLE[500] }}>
                  {formatNumber(
                    (data?.segments?.VIP || 0) + (data?.segments?.['High Value'] || 0)
                  )}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm" style={{ color: colors.textSecondary }}>At Risk</p>
                <p className="text-lg font-bold" style={{ color: COLORS.RED[500] }}>
                  {formatNumber(data?.segments?.['At Risk'] || 0)}
                </p>
              </div>
            </>
          )}
          
          {tierChartData.length > 0 && (
            <div className="text-center">
              <p className="text-sm" style={{ color: colors.textSecondary }}>Gold + Platinum</p>
              <p className="text-lg font-bold" style={{ color: COLORS.YELLOW[600] }}>
                {formatNumber(
                  (data?.tiers?.Gold || 0) + (data?.tiers?.Platinum || 0)
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}