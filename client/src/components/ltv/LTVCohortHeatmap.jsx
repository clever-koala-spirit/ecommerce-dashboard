/**
 * LTV Cohort Heatmap Component
 * Interactive cohort analysis with beautiful heatmap visualization
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import {
  CalendarIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export default function LTVCohortHeatmap({ data }) {
  const { colors, theme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('avgLTV');
  const [hoveredCell, setHoveredCell] = useState(null);

  const metrics = [
    { id: 'avgLTV', label: 'Average LTV', format: formatCurrency },
    { id: 'totalRevenue', label: 'Total Revenue', format: formatCurrency },
    { id: 'totalCustomers', label: 'Customer Count', format: formatNumber },
    { id: 'repeatRate', label: 'Repeat Rate', format: formatPercent }
  ];

  // Process cohort data for heatmap
  const processedData = useMemo(() => {
    if (!data?.cohorts) return [];
    
    return data.cohorts.map(cohort => ({
      period: cohort.period,
      totalCustomers: cohort.totalCustomers,
      totalRevenue: cohort.totalRevenue,
      avgLTV: cohort.avgLTV,
      repeatRate: cohort.repeatRate,
      repeatCustomers: cohort.repeatCustomers,
      retention: cohort.retention || {}
    }));
  }, [data]);

  // Get value range for color scaling
  const valueRange = useMemo(() => {
    if (!processedData.length) return { min: 0, max: 100 };
    
    const values = processedData.map(d => d[selectedMetric]).filter(v => v !== undefined && v !== null);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [processedData, selectedMetric]);

  // Get color intensity based on value
  const getColorIntensity = (value) => {
    if (valueRange.max === valueRange.min) return 0.5;
    return (value - valueRange.min) / (valueRange.max - valueRange.min);
  };

  // Get retention data for heatmap
  const retentionData = useMemo(() => {
    const maxRetentionMonths = 12;
    const retentionMatrix = [];
    
    processedData.forEach((cohort, cohortIndex) => {
      const row = {
        period: cohort.period,
        totalCustomers: cohort.totalCustomers,
        cells: []
      };
      
      for (let month = 0; month <= maxRetentionMonths; month++) {
        if (month === 0) {
          // Month 0 is always 100% (initial cohort)
          row.cells.push({
            month,
            value: 100,
            customers: cohort.totalCustomers,
            label: '100%'
          });
        } else {
          const retentionKey = `month${month}`;
          const retentionValue = cohort.retention[retentionKey];
          
          if (retentionValue !== undefined) {
            const customers = Math.round((retentionValue / 100) * cohort.totalCustomers);
            row.cells.push({
              month,
              value: retentionValue,
              customers,
              label: `${retentionValue.toFixed(1)}%`
            });
          } else {
            row.cells.push({
              month,
              value: null,
              customers: 0,
              label: 'N/A'
            });
          }
        }
      }
      
      retentionMatrix.push(row);
    });
    
    return retentionMatrix;
  }, [processedData]);

  if (!data?.cohorts?.length) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: colors.textSecondary }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>No Cohort Data Available</h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Cohort analysis requires at least 2 months of customer data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cohort Metrics Overview */}
      <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
              <CalendarIcon className="h-5 w-5" style={{ color: COLORS.BLUE[500] }} />
              Cohort Performance Overview
            </h3>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Customer behavior analysis by acquisition period
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Metric:
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text
              }}
            >
              {metrics.map(metric => (
                <option key={metric.id} value={metric.id}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cohort Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th className="text-left py-3 px-4 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Cohort
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Customers
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Avg LTV
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  Repeat Rate
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  {metrics.find(m => m.id === selectedMetric)?.label}
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((cohort, index) => {
                const intensity = getColorIntensity(cohort[selectedMetric]);
                const currentMetric = metrics.find(m => m.id === selectedMetric);
                
                return (
                  <tr 
                    key={cohort.period}
                    className="hover:bg-opacity-50 transition-all duration-200"
                    onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        {cohort.period}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-mono" style={{ color: colors.text }}>
                        {formatNumber(cohort.totalCustomers)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-mono" style={{ color: colors.text }}>
                        {formatCurrency(cohort.totalRevenue)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-mono" style={{ color: COLORS.GREEN[500] }}>
                        {formatCurrency(cohort.avgLTV)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span 
                        className="text-sm font-semibold px-2 py-1 rounded-md"
                        style={{
                          color: cohort.repeatRate >= 30 ? COLORS.GREEN[500] : 
                                 cohort.repeatRate >= 15 ? COLORS.YELLOW[600] : COLORS.RED[500],
                          background: cohort.repeatRate >= 30 ? `${COLORS.GREEN[500]}20` : 
                                     cohort.repeatRate >= 15 ? `${COLORS.YELLOW[600]}20` : `${COLORS.RED[500]}20`
                        }}
                      >
                        {formatPercent(cohort.repeatRate)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div 
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
                        style={{
                          background: `rgba(59, 130, 246, ${0.1 + intensity * 0.8})`,
                          color: intensity > 0.5 ? 'white' : COLORS.BLUE[600]
                        }}
                      >
                        {currentMetric?.format(cohort[selectedMetric]) || 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retention Heatmap */}
      <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
              <EyeIcon className="h-5 w-5" style={{ color: COLORS.PURPLE[500] }} />
              Retention Heatmap
            </h3>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Customer retention percentage by cohort and time period
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
            <span>Low</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map(intensity => (
                <div
                  key={intensity}
                  className="w-4 h-4 rounded"
                  style={{ background: `rgba(34, 197, 94, ${intensity})` }}
                />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Heatmap Header */}
            <div className="flex border-b" style={{ borderColor: colors.border }}>
              <div className="w-24 p-2 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                Cohort
              </div>
              <div className="w-16 p-2 text-xs font-semibold text-center" style={{ color: colors.textSecondary }}>
                Size
              </div>
              {Array.from({ length: 13 }, (_, i) => (
                <div key={i} className="w-16 p-2 text-xs font-semibold text-center" style={{ color: colors.textSecondary }}>
                  {i === 0 ? 'M0' : `M${i}`}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            {retentionData.map((row, rowIndex) => (
              <div key={row.period} className="flex hover:bg-opacity-30 transition-colors" 
                   onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="w-24 p-2 text-sm font-medium" style={{ color: colors.text }}>
                  {row.period}
                </div>
                <div className="w-16 p-2 text-xs text-center" style={{ color: colors.textSecondary }}>
                  {formatNumber(row.totalCustomers)}
                </div>
                {row.cells.map((cell, cellIndex) => {
                  const isHovered = hoveredCell === `${rowIndex}-${cellIndex}`;
                  const intensity = cell.value ? cell.value / 100 : 0;
                  
                  return (
                    <div
                      key={cellIndex}
                      className="w-16 p-2 relative cursor-pointer transition-all duration-200 hover:scale-110"
                      onMouseEnter={() => setHoveredCell(`${rowIndex}-${cellIndex}`)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div
                        className="w-full h-8 rounded flex items-center justify-center text-xs font-semibold transition-all duration-200"
                        style={{
                          background: cell.value !== null 
                            ? `rgba(34, 197, 94, ${intensity})`
                            : 'rgba(156, 163, 175, 0.2)',
                          color: intensity > 0.5 ? 'white' : colors.text,
                          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                        }}
                      >
                        {cell.label}
                      </div>
                      
                      {/* Tooltip */}
                      {isHovered && cell.value !== null && (
                        <div
                          className="absolute z-10 bg-black text-white text-xs rounded py-2 px-3 whitespace-nowrap pointer-events-none"
                          style={{
                            top: '-45px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                          }}
                        >
                          <div className="font-semibold">{row.period}</div>
                          <div>Month {cell.month}: {cell.label}</div>
                          <div>{formatNumber(cell.customers)} customers</div>
                          <div
                            className="absolute bottom-0 left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"
                            style={{ transform: 'translateX(-50%) translateY(100%)' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 rounded-lg" style={{ background: colors.bg }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
            Understanding the Heatmap
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs" style={{ color: colors.textSecondary }}>
            <div>
              <strong style={{ color: COLORS.GREEN[500] }}>Green cells:</strong> Higher retention rates indicate loyal customers
            </div>
            <div>
              <strong style={{ color: colors.text }}>M0:</strong> Initial cohort (always 100%)
            </div>
            <div>
              <strong style={{ color: colors.text }}>M1-M12:</strong> Retention after 1-12 months
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}