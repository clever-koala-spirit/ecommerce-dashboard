import React, { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { formatNumber } from '../../utils/formatters';
import { FORECAST_COLORS, COLORS } from '../../utils/colors';

export default function CustomerGrowthForecastChart({ shopDomain }) {
  const { colors } = useTheme();
  const [horizon, setHorizon] = useState(30);
  const [viewMode, setViewMode] = useState('acquisition'); // acquisition, segments, lifetime
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customer forecast data
  useEffect(() => {
    const fetchCustomerForecast = async () => {
      if (!shopDomain) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/forecasts/customers?horizon=${horizon}&includeSegments=true&includeLifetime=true`,
          {
            headers: {
              'X-Shop-Domain': shopDomain
            }
          }
        );
        
        const result = await response.json();
        
        if (result.success) {
          setForecastData(result);
        } else {
          setError(result.error || 'Failed to fetch customer forecast');
        }
      } catch (err) {
        setError('Failed to fetch customer forecast data');
        console.error('Customer forecast fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerForecast();
  }, [shopDomain, horizon]);

  const acquisitionChartData = useMemo(() => {
    if (!forecastData?.forecast?.acquisition) return [];

    return forecastData.forecast.acquisition.map((day) => ({
      date: day.date,
      predicted: day.predicted,
      lower80: day.lower80,
      upper80: day.upper80,
      lower95: day.lower95,
      upper95: day.upper95
    }));
  }, [forecastData]);

  const weeklyGrowthData = useMemo(() => {
    if (!acquisitionChartData.length) return [];

    // Group by week
    const weeklyData = {};
    acquisitionChartData.forEach(day => {
      const date = new Date(day.date);
      const weekStart = startOfWeek(date);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: format(weekStart, 'MMM dd'),
          customers: 0,
          days: 0
        };
      }
      
      weeklyData[weekKey].customers += day.predicted;
      weeklyData[weekKey].days += 1;
    });

    return Object.values(weeklyData).map(week => ({
      ...week,
      avg_daily: Math.round((week.customers / week.days) * 10) / 10
    }));
  }, [acquisitionChartData]);

  const growthMetrics = forecastData?.growth || {};
  const trends = forecastData?.trends || {};
  const insights = forecastData?.insights || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    return (
      <div 
        className="rounded-lg p-4 shadow-lg border backdrop-blur-sm" 
        style={{ 
          backgroundColor: colors.surface + 'f0', 
          border: `1px solid ${colors.border}` 
        }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>
          {format(parseISO(data.date), 'MMM dd, yyyy')}
        </p>
        <div className="space-y-1">
          <p className="text-blue-400 font-medium">
            New Customers: {Math.round(data.predicted)}
          </p>
          <p className="text-gray-400 text-xs">
            Range: {Math.round(data.lower80)} - {Math.round(data.upper80)} (80% CI)
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="backdrop-blur rounded-xl p-6 h-full animate-pulse" 
           style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-600 rounded w-1/3"></div>
          <div className="h-64 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur rounded-xl p-6 h-full" 
           style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
            Customer Forecast Error
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur rounded-xl p-6 h-full" 
         style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1" style={{ color: colors.text }}>
            Customer Growth Forecast
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            ML-powered customer acquisition predictions
          </p>
        </div>
        
        {/* Growth Badge */}
        {growthMetrics.weekly_growth_rate && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            growthMetrics.weekly_growth_rate > 0 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {growthMetrics.weekly_growth_rate > 0 ? '+' : ''}{growthMetrics.weekly_growth_rate.toFixed(1)}% Weekly
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Horizon Selection */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Forecast Horizon
          </label>
          <div className="flex gap-1">
            {[14, 30, 60, 90].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                  horizon === h 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-blue-600/20'
                }`}
                style={horizon !== h ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
              >
                {h}d
              </button>
            ))}
          </div>
        </div>

        {/* View Mode */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            View Mode
          </label>
          <div className="flex gap-1">
            {[
              { key: 'acquisition', label: 'Acquisition' },
              { key: 'segments', label: 'Segments' },
              { key: 'lifetime', label: 'Lifetime Value' }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                  viewMode === mode.key 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-600/20'
                }`}
                style={viewMode !== mode.key ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      {viewMode === 'acquisition' && acquisitionChartData.length > 0 && (
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={acquisitionChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="customerConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              
              <XAxis
                dataKey="date"
                tick={{ fill: colors.textSecondary, fontSize: 11 }}
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                stroke={colors.border}
              />
              
              <YAxis
                tick={{ fill: colors.textSecondary, fontSize: 11 }}
                tickFormatter={(value) => Math.round(value)}
                stroke={colors.border}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="upper80"
                fill="url(#customerConfidence)"
                stroke="none"
                isAnimationActive={false}
              />
              
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
              
              <Line
                type="monotone"
                dataKey="lower80"
                stroke="#3B82F6"
                strokeWidth={1}
                strokeOpacity={0.5}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly Growth Chart */}
      {viewMode === 'acquisition' && weeklyGrowthData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
            Weekly Acquisition Trend
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: colors.textSecondary, fontSize: 11 }}
                  stroke={colors.border}
                />
                <YAxis 
                  tick={{ fill: colors.textSecondary, fontSize: 11 }}
                  stroke={colors.border}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'customers' ? Math.round(value) : value,
                    name === 'customers' ? 'New Customers' : 'Avg Daily'
                  ]}
                  labelStyle={{ color: colors.text }}
                  contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                />
                <Area 
                  dataKey="customers" 
                  fill="#3B82F6" 
                  stroke="#3B82F6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Customer Segments View */}
      {viewMode === 'segments' && forecastData?.forecast?.segments && (
        <div className="h-80 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {Object.entries(forecastData.forecast.segments).map(([segment, data]) => (
              <div
                key={segment}
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
              >
                <h4 className="text-sm font-semibold mb-2 capitalize" style={{ color: colors.text }}>
                  {segment.replace('_', ' ')}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Growth Rate</span>
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      +{(data.growth_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Confidence</span>
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      {(data.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  {/* Progress bar for confidence */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${data.confidence * 100}%`,
                        backgroundColor: data.confidence > 0.8 ? '#10B981' : data.confidence > 0.6 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifetime Value View */}
      {viewMode === 'lifetime' && forecastData?.forecast?.lifetimeValue && (
        <div className="h-80 mb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold mb-2" style={{ color: colors.text }}>
                ${forecastData.forecast.lifetimeValue.avg_ltv?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Average Customer Lifetime Value
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  forecastData.forecast.lifetimeValue.growth_trend > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {forecastData.forecast.lifetimeValue.growth_trend > 0 ? '+' : ''}
                  {(forecastData.forecast.lifetimeValue.growth_trend * 100).toFixed(1)}%
                </div>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Growth Trend
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: colors.text }}>
                  {(forecastData.forecast.lifetimeValue.confidence * 100).toFixed(0)}%
                </div>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Confidence
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Growth Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <div className="text-lg font-bold mb-1" style={{ color: colors.text }}>
            {growthMetrics.first_week_total || 0}
          </div>
          <p className="text-xs" style={{ color: colors.textSecondary }}>First Week</p>
        </div>
        
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <div className="text-lg font-bold mb-1" style={{ color: colors.text }}>
            {growthMetrics.last_week_total || 0}
          </div>
          <p className="text-xs" style={{ color: colors.textSecondary }}>Last Week</p>
        </div>
        
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <div className="text-lg font-bold mb-1" style={{ color: colors.text }}>
            {trends.recent ? `${trends.recent > 0 ? '+' : ''}${trends.recent.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-xs" style={{ color: colors.textSecondary }}>Recent Trend</p>
        </div>
        
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <div className="text-lg font-bold mb-1" style={{ color: colors.text }}>
            {forecastData?.accuracy?.mape ? `${forecastData.accuracy.mape.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-xs" style={{ color: colors.textSecondary }}>Forecast Error</p>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="pt-6 border-t" style={{ borderColor: colors.border }}>
          <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
            Customer Growth Insights
          </h4>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className="p-3 rounded-lg"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {insight.type === 'summary' ? '👥' : 
                     insight.type === 'growth' ? '📈' : 
                     insight.type === 'decline' ? '📉' : '💡'}
                  </span>
                  <div>
                    <h5 className="text-sm font-medium mb-1" style={{ color: colors.text }}>
                      {insight.title}
                    </h5>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}