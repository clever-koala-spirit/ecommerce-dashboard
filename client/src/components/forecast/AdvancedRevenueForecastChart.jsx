import React, { useMemo, useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { FORECAST_COLORS, COLORS } from '../../utils/colors';

export default function AdvancedRevenueForecastChart({ shopDomain }) {
  const { colors } = useTheme();
  const [horizon, setHorizon] = useState(30);
  const [confidence, setConfidence] = useState(0.95);
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch advanced forecast data
  useEffect(() => {
    const fetchForecast = async () => {
      if (!shopDomain) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/forecasts/revenue?horizon=${horizon}&confidence=${confidence}&includeScenarios=true`,
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
          setError(result.error || 'Failed to fetch forecast');
        }
      } catch (err) {
        setError('Failed to fetch forecast data');
        console.error('Forecast fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [shopDomain, horizon, confidence]);

  const chartData = useMemo(() => {
    if (!forecastData?.forecast?.daily) return [];

    const scenario = forecastData.scenarios?.[selectedScenario] || forecastData.forecast.daily;
    
    return scenario.map((day) => ({
      date: day.date,
      predicted: day.predicted,
      lower: confidence === 0.95 ? day.lower95 : day.lower80,
      upper: confidence === 0.95 ? day.upper95 : day.upper80,
      lowerBand: Math.max(0, day.predicted - (confidence === 0.95 ? day.lower95 : day.lower80)),
      upperBand: (confidence === 0.95 ? day.upper95 : day.upper95) - day.predicted
    }));
  }, [forecastData, selectedScenario, confidence]);

  const monthlyData = useMemo(() => {
    return forecastData?.forecast?.monthly || [];
  }, [forecastData]);

  const weeklyData = useMemo(() => {
    return forecastData?.forecast?.weekly || [];
  }, [forecastData]);

  const insights = forecastData?.insights || [];
  const accuracy = forecastData?.accuracy || {};

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
          <p className="text-purple-400 font-medium">
            Predicted: {formatCurrency(data.predicted)}
          </p>
          <p className="text-gray-400 text-xs">
            Range: {formatCurrency(data.lower)} - {formatCurrency(data.upper)}
          </p>
          <p className="text-gray-400 text-xs">
            Confidence: {(confidence * 100).toFixed(0)}%
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
            Forecast Error
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
            Advanced Revenue Forecast
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {forecastData?.metadata?.model_used || 'Auto-ML'} • {forecastData?.metadata?.dataPoints || 0} historical points
          </p>
        </div>
        
        {/* Model Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
            {forecastData?.model?.toUpperCase() || 'ENSEMBLE'}
          </div>
          <div 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: accuracy.mape <= 15 ? '#10B981' : accuracy.mape <= 25 ? '#F59E0B' : '#EF4444' + '20',
              color: accuracy.mape <= 15 ? '#10B981' : accuracy.mape <= 25 ? '#F59E0B' : '#EF4444'
            }}
          >
            {accuracy.mape ? `${accuracy.mape.toFixed(1)}% MAPE` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Horizon Selection */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Forecast Horizon
          </label>
          <div className="flex gap-1">
            {[7, 14, 30, 60, 90].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                  horizon === h 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-purple-600/20'
                }`}
                style={horizon !== h ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
              >
                {h}d
              </button>
            ))}
          </div>
        </div>

        {/* Confidence Level */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Confidence Level
          </label>
          <select
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-full px-3 py-1.5 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ 
              backgroundColor: colors.background, 
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <option value={0.8}>80% Confidence</option>
            <option value={0.95}>95% Confidence</option>
          </select>
        </div>

        {/* Scenario Selection */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>
            Scenario Planning
          </label>
          <div className="flex gap-1">
            {['pessimistic', 'realistic', 'optimistic'].map((scenario) => (
              <button
                key={scenario}
                onClick={() => setSelectedScenario(scenario)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition-all capitalize ${
                  selectedScenario === scenario 
                    ? scenario === 'pessimistic' ? 'bg-red-600 text-white'
                      : scenario === 'optimistic' ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'hover:bg-gray-600/20'
                }`}
                style={selectedScenario !== scenario ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
              >
                {scenario}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      {chartData.length > 0 ? (
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FORECAST_COLORS.confidence95} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={FORECAST_COLORS.confidence95} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid || colors.border} />
              
              <XAxis
                dataKey="date"
                tick={{ fill: colors.textSecondary, fontSize: 11 }}
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                stroke={colors.border}
                axisLine={{ stroke: colors.border }}
              />
              
              <YAxis
                tick={{ fill: colors.textSecondary, fontSize: 11 }}
                tickFormatter={(value) => formatNumber(value / 1000) + 'K'}
                stroke={colors.border}
                axisLine={{ stroke: colors.border }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="upper"
                fill="url(#confidenceGradient)"
                stroke="none"
                isAnimationActive={false}
              />
              
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={
                  selectedScenario === 'pessimistic' ? '#EF4444' :
                  selectedScenario === 'optimistic' ? '#10B981' : 
                  FORECAST_COLORS.predicted
                }
                strokeWidth={3}
                dot={false}
                strokeDasharray={selectedScenario !== 'realistic' ? "8 4" : "0"}
                isAnimationActive={false}
              />
              
              <Line
                type="monotone"
                dataKey="lower"
                stroke={FORECAST_COLORS.confidence95}
                strokeWidth={1}
                dot={false}
                strokeDasharray="2 2"
                strokeOpacity={0.6}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center" style={{ color: colors.textSecondary }}>
          No forecast data available
        </div>
      )}

      {/* Monthly Projections */}
      {monthlyData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
            Monthly Projections
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: colors.textSecondary, fontSize: 11 }}
                  stroke={colors.border}
                />
                <YAxis 
                  tick={{ fill: colors.textSecondary, fontSize: 11 }}
                  tickFormatter={(value) => formatNumber(value / 1000) + 'K'}
                  stroke={colors.border}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Projected Revenue']}
                  labelStyle={{ color: colors.text }}
                  contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                />
                <Bar 
                  dataKey="predicted" 
                  fill={FORECAST_COLORS.predicted}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="pt-6 border-t" style={{ borderColor: colors.border }}>
          <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
            AI Insights
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
                    {insight.type === 'summary' ? '📊' : 
                     insight.type === 'peak' ? '⚡' : 
                     insight.type === 'accuracy' ? '🎯' : '💡'}
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

      {/* Model Performance Metrics */}
      <div className="pt-6 mt-6 border-t" style={{ borderColor: colors.border }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
          Model Performance
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
            <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>MAPE</p>
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {accuracy.mape?.toFixed(1) || 'N/A'}%
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
            <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>RMSE</p>
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {accuracy.rmse ? formatCurrency(accuracy.rmse) : 'N/A'}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
            <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>MAE</p>
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {accuracy.mae ? formatCurrency(accuracy.mae) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}