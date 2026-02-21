import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { forecast } from '../../utils/forecast';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CHANNEL_COLORS } from '../../utils/colors';

export default function ChannelForecastChart() {
  const { colors } = useTheme();
  const [horizon, setHorizon] = useState(30);
  const [visibleChannels, setVisibleChannels] = useState({
    meta: true,
    google: true,
    klaviyo: true,
    organic: true,
  });

  const shopifyData = useStore((state) => state.shopifyData);
  const storeMetaData = useStore((state) => state.metaData);
  const storeGoogleData = useStore((state) => state.googleData);
  const storeKlaviyoData = useStore((state) => state.klaviyoData);
  const storeGa4Data = useStore((state) => state.ga4Data);

  const chartData = useMemo(() => {
    // Use ALL available data for better forecasting (not filtered by dateRange)
    const historical = shopifyData || [];
    const metaData = storeMetaData || [];
    const googleData = storeGoogleData || [];
    const klaviyoData = storeKlaviyoData || [];
    const ga4Data = storeGa4Data || [];

    // Combine all data by date
    const dateMap = {};
    historical.forEach((d) => {
      dateMap[d.date] = { ...dateMap[d.date], date: d.date };
    });

    metaData.forEach((d) => {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date };
      dateMap[d.date].meta_actual = d.revenue;
    });

    googleData.forEach((d) => {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date };
      dateMap[d.date].google_actual = d.conversionValue;
    });

    klaviyoData.forEach((d) => {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date };
      dateMap[d.date].klaviyo_actual = d.flowRevenue + d.campaignRevenue;
    });

    ga4Data.forEach((d) => {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date };
      dateMap[d.date].organic_actual = d.organicSessions * (d.revenue / d.sessions);
    });

    const combined_data = Object.values(dateMap)
      .filter(d => d.date) // Remove entries without valid dates
      .sort((a, b) => {
        // Safe date comparison with null checks
        if (!a.date || !b.date) return 0;
        return a.date.localeCompare(b.date);
      });

    // Run forecasts for each channel
    const forecastResults = {};
    const channels = ['meta', 'google', 'klaviyo', 'organic'];

    channels.forEach((channel) => {
      const dataKey = `${channel}_actual`;
      const dataForForecast = combined_data
        .filter((d) => d[dataKey] !== undefined)
        .map((d) => ({
          date: d.date,
          value: d[dataKey],
        }));

      if (dataForForecast.length > 0) {
        forecastResults[channel] = forecast(dataForForecast, horizon, {
          method: 'auto',
          confidence: 0.95,
        });
      }
    });

    // Build final chart data
    const result = combined_data.map((d) => {
      const row = { date: d.date };
      row.meta_actual = d.meta_actual || null;
      row.google_actual = d.google_actual || null;
      row.klaviyo_actual = d.klaviyo_actual || null;
      row.organic_actual = d.organic_actual || null;
      return row;
    });

    // Add forecast data
    let maxForecastLength = 0;
    Object.values(forecastResults).forEach((fr) => {
      if (fr.values && fr.values.length > maxForecastLength) {
        maxForecastLength = fr.values.length;
      }
    });

    for (let i = 0; i < maxForecastLength; i++) {
      const row = {};
      channels.forEach((channel) => {
        if (forecastResults[channel] && forecastResults[channel].values[i]) {
          const forecastDate = forecastResults[channel].values[i].date;
          if (!row.date) row.date = forecastDate;
          row[`${channel}_forecast`] = forecastResults[channel].values[i].predicted;
        }
      });
      if (row.date) result.push(row);
    }

    return { data: result, forecasts: forecastResults };
  }, [shopifyData, storeMetaData, storeGoogleData, storeKlaviyoData, storeGa4Data, horizon]);

  const projections = useMemo(() => {
    const result = {};
    const channels = ['meta', 'google', 'klaviyo', 'organic'];

    channels.forEach((channel) => {
      const forecast_data = chartData.forecasts[channel];
      if (forecast_data && forecast_data.values.length > 0) {
        const total = forecast_data.values.reduce((sum, v) => sum + v.predicted, 0);
        result[channel] = {
          next30d: Math.round(total * 100) / 100,
          trend: forecast_data.trend,
        };
      }
    });

    return result;
  }, [chartData.forecasts]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload) return null;

    return (
      <div className="rounded p-3 shadow-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <p className="text-sm" style={{ color: colors.textSecondary }}>{payload[0].payload.date}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const toggleChannel = (channel) => {
    setVisibleChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  return (
    <div className="backdrop-blur rounded-xl p-6" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Channel Performance Forecast</h3>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Per-channel revenue projections</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 60].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                horizon === h
                  ? 'bg-purple-600 text-white'
                  : ''
              }`}
              style={horizon !== h ? { backgroundColor: colors.background, color: colors.textSecondary } : {}}
            >
              {h}d
            </button>
          ))}
        </div>
      </div>

      {/* Channel Toggles */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'meta', label: 'Meta Ads', color: CHANNEL_COLORS.meta },
          { key: 'google', label: 'Google Ads', color: CHANNEL_COLORS.google },
          { key: 'klaviyo', label: 'Klaviyo Email', color: CHANNEL_COLORS.klaviyo },
          { key: 'organic', label: 'Organic', color: CHANNEL_COLORS.organic },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggleChannel(key)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              backgroundColor: visibleChannels[key] ? colors.background : colors.surface,
              border: visibleChannels[key] ? `1px solid ${colors.border}` : '1px solid transparent',
              color: visibleChannels[key] ? colors.text : colors.textSecondary,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: color,
                opacity: visibleChannels[key] ? 1 : 0.5,
              }}
            />
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.data.length > 0 ? (
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
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

              {visibleChannels.meta && (
                <>
                  <Line type="monotone" dataKey="meta_actual" stroke={CHANNEL_COLORS.meta} strokeWidth={2} dot={false} name="Meta (Actual)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="meta_forecast" stroke={CHANNEL_COLORS.meta} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Meta (Forecast)" isAnimationActive={false} />
                </>
              )}

              {visibleChannels.google && (
                <>
                  <Line type="monotone" dataKey="google_actual" stroke={CHANNEL_COLORS.google} strokeWidth={2} dot={false} name="Google (Actual)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="google_forecast" stroke={CHANNEL_COLORS.google} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Google (Forecast)" isAnimationActive={false} />
                </>
              )}

              {visibleChannels.klaviyo && (
                <>
                  <Line type="monotone" dataKey="klaviyo_actual" stroke={CHANNEL_COLORS.klaviyo} strokeWidth={2} dot={false} name="Klaviyo (Actual)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="klaviyo_forecast" stroke={CHANNEL_COLORS.klaviyo} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Klaviyo (Forecast)" isAnimationActive={false} />
                </>
              )}

              {visibleChannels.organic && (
                <>
                  <Line type="monotone" dataKey="organic_actual" stroke={CHANNEL_COLORS.organic} strokeWidth={2} dot={false} name="Organic (Actual)" isAnimationActive={false} />
                  <Line type="monotone" dataKey="organic_forecast" stroke={CHANNEL_COLORS.organic} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Organic (Forecast)" isAnimationActive={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center" style={{ color: colors.textSecondary }}>
          No data available for forecast
        </div>
      )}

      {/* Channel Projections Table */}
      <div className="pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>Next 30-Day Projections</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'meta', label: 'Meta Ads', color: CHANNEL_COLORS.meta },
            { key: 'google', label: 'Google Ads', color: CHANNEL_COLORS.google },
            { key: 'klaviyo', label: 'Klaviyo', color: CHANNEL_COLORS.klaviyo },
            { key: 'organic', label: 'Organic', color: CHANNEL_COLORS.organic },
          ].map(({ key, label, color }) => {
            const projection = projections[key];
            return (
              <div
                key={key}
                className="rounded-lg p-3"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{label}</p>
                </div>
                <p className="text-lg font-semibold" style={{ color: colors.text }}>
                  {projection?.next30d ? formatCurrency(projection.next30d) : '$0'}
                </p>
                {projection?.trend && (
                  <p className={`text-xs mt-1 ${
                    projection.trend === 'up' ? 'text-green-400' : projection.trend === 'down' ? 'text-red-400' : ''
                  }`} style={projection.trend === 'flat' ? { color: colors.textSecondary } : {}}>
                    {projection.trend === 'up' ? '↑ Up' : projection.trend === 'down' ? '↓ Down' : '→ Flat'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
