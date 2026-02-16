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
import { forecast } from '../../utils/forecast';
import { filterDataByDateRange } from '../../utils/formatters';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { FORECAST_COLORS, COLORS } from '../../utils/colors';

export default function RevenueForecastChart() {
  const [horizon, setHorizon] = useState(30);
  const dateRange = useStore((state) => state.dateRange);
  const shopifyData = useStore((state) => state.shopifyData);

  const chartData = useMemo(() => {
    // Get historical revenue data
    const historicalData = filterDataByDateRange(shopifyData || [], dateRange);

    // Prepare data for forecast function
    const dataForForecast = historicalData.map((d) => ({
      date: d.date,
      value: d.revenue,
    }));

    if (dataForForecast.length === 0) {
      return { data: [], forecast: null, metrics: {} };
    }

    // Run forecast
    const forecastResult = forecast(dataForForecast, horizon, {
      method: 'auto',
      confidence: 0.95,
    });

    // Combine historical and forecast data
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
  }, [dateRange, horizon]);

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
      <div className="bg-slate-800 border border-slate-700 rounded p-3 shadow-lg">
        <p className="text-slate-300 text-sm">{data.date}</p>
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
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Revenue Forecast</h3>
          <p className="text-sm text-slate-400 mt-1">
            {chartData.forecast?.dataPoints || 0} days historical data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-700/50 px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-slate-300">
              Accuracy: {accuracy.toFixed(1)}%
            </span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              trendDirection === 'up'
                ? 'bg-green-500/20 text-green-400'
                : trendDirection === 'down'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-600/50 text-slate-300'
            }`}
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
              horizon === h
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
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
                  <stop
                    offset="5%"
                    stopColor={FORECAST_COLORS.confidence95}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={FORECAST_COLORS.confidence95}
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                stroke="#475569"
              />
              <YAxis
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value / 1000) + 'K'}
                stroke="#475569"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {/* Confidence interval band */}
              <Area
                type="monotone"
                dataKey="upper"
                fill="url(#colorConfidence)"
                stroke="none"
                name="95% CI Upper"
                isAnimationActive={false}
              />

              {/* Actual revenue */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke={FORECAST_COLORS.actual}
                strokeWidth={2.5}
                dot={false}
                name="Actual Revenue"
                isAnimationActive={false}
              />

              {/* Forecast */}
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
        <div className="h-64 flex items-center justify-center text-slate-400">
          No data available for forecast
        </div>
      )}

      {/* Monthly Projections */}
      <div className="border-t border-slate-700/50 pt-6">
        <h4 className="text-sm font-semibold text-slate-100 mb-4">Monthly Projections</h4>
        <div className="grid grid-cols-2 gap-3">
          {monthlyProjection.slice(0, 4).map((month, idx) => (
            <div
              key={idx}
              className="bg-slate-700/30 rounded-lg p-3 border border-slate-700/50"
            >
              <p className="text-xs text-slate-400">{month.month}</p>
              <p className="text-lg font-semibold text-slate-100 mt-1">
                {formatCurrency(month.projected)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="border-t border-slate-700/50 pt-6 mt-6">
        <h4 className="text-sm font-semibold text-slate-100 mb-3">Accuracy Metrics</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-700/20 rounded p-3">
            <p className="text-xs text-slate-400">MAPE</p>
            <p className="text-sm font-semibold text-slate-100 mt-1">
              {chartData.metrics.mape?.toFixed(1) || 'N/A'}%
            </p>
          </div>
          <div className="bg-slate-700/20 rounded p-3">
            <p className="text-xs text-slate-400">RMSE</p>
            <p className="text-sm font-semibold text-slate-100 mt-1">
              {formatCurrency(chartData.metrics.rmse || 0)}
            </p>
          </div>
          <div className="bg-slate-700/20 rounded p-3">
            <p className="text-xs text-slate-400">MAE</p>
            <p className="text-sm font-semibold text-slate-100 mt-1">
              {formatCurrency(chartData.metrics.mae || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
