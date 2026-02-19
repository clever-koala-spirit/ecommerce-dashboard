import React, { useMemo, useState } from 'react';
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
} from 'recharts';
import { format, parseISO, addDays } from 'date-fns';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { forecast } from '../../utils/forecast';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { FORECAST_COLORS, COLORS } from '../../utils/colors';

export default function RevenueForecastChart() {
  const { colors } = useTheme();
  const [horizon, setHorizon] = useState(30);
  const shopifyData = useStore((state) => state.shopifyData);

  const chartData = useMemo(() => {
    // Use ALL available historical data for better forecasting
    const historicalData = shopifyData || [];

    const dataForForecast = historicalData.map((d) => ({
      date: d.date,
      value: d.revenue,
    }));

    if (dataForForecast.length === 0) {
      return { data: [], forecast: null, metrics: {} };
    }

    const forecastResult = forecast(dataForForecast, horizon, {
      method: 'auto',
      confidence: 0.95,
    });

    const combinedData = [
      ...historicalData.map((d) => ({
        date: d.date,
        actual: d.revenue,
        predicted: null,
        lower: null,
        upper: null,
      })),
      ...forecastResult.values.map((f) => ({
        date: f.date,
        actual: null,
        predicted: f.predicted,
        lower: f.lower,
        upper: f.upper,
      })),
    ];

    return {
      data: combinedData,
      forecast: forecastResult,
      metrics: forecastResult.metrics,
    };
  }, [shopifyData, horizon]);

  const monthlyProjection = useMemo(() => {
    if (!chartData.forecast || chartData.forecast.values.length === 0) {
      return [];
    }

    const monthData = {};
    chartData.forecast.values.forEach((item) => {
      const month = format(parseISO(item.date), 'MMM yyyy');
      if (!monthData[month]) {
        monthData[month] = { revenue: 0, days: 0 };
      }
      monthData[month].revenue += item.predicted;
      monthData[month].days += 1;
    });

    return Object.entries(monthData).map(([month, data]) => ({
      month,
      projected: Math.round(data.revenue * 100) / 100,
    }));
  }, [chartData.forecast]);

  const trendDirection = chartData.forecast?.trend || 'flat';
  const accuracy = chartData.metrics.mape || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    const data = payload[0].payload;
    return (
      <div className="rounded p-3 shadow-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <p className="text-sm" style={{ color: colors.textSecondary }}>{data.date}</p>
        {data.actual !== null && (
          <p className="text-blue-400 font-medium">
            Actual: {formatCurrency(data.actual)}
          </p>
        )}
        {data.predicted !== null && (
          <>
            <p className="text-purple-400 font-medium">
              Predicted: {formatCurrency(data.predicted)}
            </p>
            <p className="text-purple-300 text-xs">
              Range: {formatCurrency(data.lower)} - {formatCurrency(data.upper)}
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="backdrop-blur rounded-xl p-6 h-full" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Revenue Forecast</h3>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {chartData.forecast?.dataPoints || 0} days historical data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.background }}>
            <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              Accuracy: {accuracy.toFixed(1)}%
            </span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              trendDirection === 'up'
                ? 'bg-green-500/20 text-green-400'
                : trendDirection === 'down'
                ? 'bg-red-500/20 text-red-400'
                : ''
            }`}
            style={trendDirection === 'flat' ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
          >
            {trendDirection === 'up' ? '↑ Up' : trendDirection === 'down' ? '↓ Down' : '→ Flat'}
          </div>
        </div>
      </div>

      {/* Horizon Buttons */}
      <div className="flex gap-2 mb-6">
        {[7, 14, 30, 60, 90].map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              horizon === h ? 'bg-purple-600 text-white' : ''
            }`}
            style={horizon !== h ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
          >
            {h}d
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.data.length > 0 ? (
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData.data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FORECAST_COLORS.confidence95} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={FORECAST_COLORS.confidence95} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid || colors.border} />
              <XAxis
                dataKey="date"
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                stroke={colors.border}
              />
              <YAxis
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value / 1000) + 'K'}
                stroke={colors.border}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              <Area
                type="monotone"
                dataKey="upper"
                fill="url(#colorConfidence)"
                stroke="none"
                name="95% CI Upper"
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="actual"
                stroke={FORECAST_COLORS.actual}
                strokeWidth={2.5}
                dot={false}
                name="Actual Revenue"
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="predicted"
                stroke={FORECAST_COLORS.predicted}
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                name="Forecasted Revenue"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center" style={{ color: colors.textSecondary }}>
          No data available for forecast
        </div>
      )}

      {/* Monthly Projections */}
      <div className="pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>Monthly Projections</h4>
        <div className="grid grid-cols-2 gap-3">
          {monthlyProjection.slice(0, 4).map((month, idx) => (
            <div
              key={idx}
              className="rounded-lg p-3"
              style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
            >
              <p className="text-xs" style={{ color: colors.textSecondary }}>{month.month}</p>
              <p className="text-lg font-semibold mt-1" style={{ color: colors.text }}>
                {formatCurrency(month.projected)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Accuracy Metrics</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded p-3" style={{ backgroundColor: colors.background }}>
            <p className="text-xs" style={{ color: colors.textSecondary }}>MAPE</p>
            <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
              {chartData.metrics.mape?.toFixed(1) || 'N/A'}%
            </p>
          </div>
          <div className="rounded p-3" style={{ backgroundColor: colors.background }}>
            <p className="text-xs" style={{ color: colors.textSecondary }}>RMSE</p>
            <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
              {formatCurrency(chartData.metrics.rmse || 0)}
            </p>
          </div>
          <div className="rounded p-3" style={{ backgroundColor: colors.background }}>
            <p className="text-xs" style={{ color: colors.textSecondary }}>MAE</p>
            <p className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
              {formatCurrency(chartData.metrics.mae || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
