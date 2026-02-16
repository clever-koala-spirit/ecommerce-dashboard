import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatNumber, filterDataByDateRange, formatDateShort } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div
        className="p-3 rounded border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <p className="font-semibold mb-1">{label}</p>
        <p>{payload[0].name}: {typeof value === 'number' ? value.toFixed(2) : value}x</p>
      </div>
    );
  }
  return null;
};

const TrendIndicator = ({ current, average, label }) => {
  const trend = current >= average ? 'up' : 'down';
  const isPositive = trend === 'up';
  const percentChange = average > 0 ? ((current - average) / average) * 100 : 0;

  return (
    <div className="mt-3 text-center">
      <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-1">
        {label}
      </p>
      <p style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold">
        {current.toFixed(2)}x
      </p>
      <p
        style={{
          color: isPositive ? COLORS.GREEN[500] : COLORS.RED[500],
        }}
        className="text-sm font-semibold"
      >
        {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}% vs avg
      </p>
    </div>
  );
};

export default function EfficiencyCharts() {
  const dateRange = useStore((state) => state.dateRange);
  const shopifyData = useStore((state) => state.shopifyData);
  const metaData = useStore((state) => state.metaData);
  const googleData = useStore((state) => state.googleData);

  const { merData, ltvCacData, contributionData, merStats, ltvCacStats, contributionStats } =
    useMemo(() => {
      const filteredShopify = filterDataByDateRange(shopifyData || [], dateRange);
      const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
      const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);

      // MER Chart Data (Marketing Efficiency Ratio = Revenue / Ad Spend)
      const merChartData = filteredShopify.map((shopifyItem) => {
        const metaItem = filteredMeta.find((d) => d.date === shopifyItem.date);
        const googleItem = filteredGoogle.find((d) => d.date === shopifyItem.date);

        const totalAdSpend = (metaItem?.spend || 0) + (googleItem?.spend || 0);
        const revenue = shopifyItem.revenue || 0;
        const mer = totalAdSpend > 0 ? revenue / totalAdSpend : 0;

        return {
          date: formatDateShort(shopifyItem.date),
          value: mer,
        };
      });

      const merValues = merChartData.map((d) => d.value).filter((v) => v > 0);
      const merAverage = merValues.length > 0 ? merValues.reduce((a, b) => a + b) / merValues.length : 0;
      const merCurrent = merValues.length > 0 ? merValues[merValues.length - 1] : 0;

      // LTV:CAC Ratio Chart Data
      const ltvCacChartData = filteredShopify.map((shopifyItem) => {
        const metaItem = filteredMeta.find((d) => d.date === shopifyItem.date);
        const googleItem = filteredGoogle.find((d) => d.date === shopifyItem.date);

        const totalAdSpend = (metaItem?.spend || 0) + (googleItem?.spend || 0);
        const totalPurchases = (metaItem?.purchases || 0) + (googleItem?.conversions || 0);

        const cac = totalPurchases > 0 ? totalAdSpend / totalPurchases : 0;
        const aov = shopifyItem.orders > 0 ? shopifyItem.revenue / shopifyItem.orders : 0;
        // Estimate LTV as 3x AOV for customer lifetime
        const ltv = aov * 3;
        const ratio = cac > 0 ? ltv / cac : 0;

        return {
          date: formatDateShort(shopifyItem.date),
          value: ratio,
        };
      });

      const ltvCacValues = ltvCacChartData.map((d) => d.value).filter((v) => v > 0);
      const ltvCacAverage = ltvCacValues.length > 0 ? ltvCacValues.reduce((a, b) => a + b) / ltvCacValues.length : 0;
      const ltvCacCurrent = ltvCacValues.length > 0 ? ltvCacValues[ltvCacValues.length - 1] : 0;

      // Contribution Margin per Order Chart Data
      const contributionChartData = filteredShopify.map((shopifyItem) => {
        const metaItem = filteredMeta.find((d) => d.date === shopifyItem.date);
        const googleItem = filteredGoogle.find((d) => d.date === shopifyItem.date);

        const totalAdSpend = (metaItem?.spend || 0) + (googleItem?.spend || 0);
        const orders = shopifyItem.orders || 1;
        const revenue = shopifyItem.revenue || 0;
        const cogs = shopifyItem.cogs || 0;
        const shipping = shopifyItem.shipping || 0;

        const contributionMargin = (revenue - cogs - shipping - totalAdSpend) / orders;

        return {
          date: formatDateShort(shopifyItem.date),
          value: Math.max(0, contributionMargin), // Ensure non-negative
        };
      });

      const contributionValues = contributionChartData.map((d) => d.value).filter((v) => v > 0);
      const contributionAverage =
        contributionValues.length > 0
          ? contributionValues.reduce((a, b) => a + b) / contributionValues.length
          : 0;
      const contributionCurrent =
        contributionValues.length > 0 ? contributionValues[contributionValues.length - 1] : 0;

      return {
        merData: merChartData,
        ltvCacData: ltvCacChartData,
        contributionData: contributionChartData,
        merStats: { current: merCurrent, average: merAverage },
        ltvCacStats: { current: ltvCacCurrent, average: ltvCacAverage },
        contributionStats: { current: contributionCurrent, average: contributionAverage },
      };
    }, [dateRange]);

  if (
    !merData ||
    merData.length === 0 ||
    !ltvCacData ||
    ltvCacData.length === 0 ||
    !contributionData ||
    contributionData.length === 0
  ) {
    return (
      <div
        className="glass-card p-5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
          Efficiency Metrics
        </h3>
        <div className="h-60 flex items-center justify-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Connect ad platforms in Settings to see efficiency metrics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card p-5"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-6">
        Efficiency Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MER Chart */}
        <div>
          <h4 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-3 text-sm">
            Marketing Efficiency Ratio
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={merData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                height={40}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={merStats.average}
                stroke={COLORS.GRAY[500]}
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${merStats.average.toFixed(1)}x`,
                  position: 'top',
                  fill: 'var(--color-text-secondary)',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.PURPLE[500]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <TrendIndicator
            current={merStats.current}
            average={merStats.average}
            label="Current MER"
          />
        </div>

        {/* LTV:CAC Chart */}
        <div>
          <h4 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-3 text-sm">
            LTV:CAC Ratio
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ltvCacData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                height={40}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={ltvCacStats.average}
                stroke={COLORS.GRAY[500]}
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${ltvCacStats.average.toFixed(1)}x`,
                  position: 'top',
                  fill: 'var(--color-text-secondary)',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.PURPLE[500]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <TrendIndicator
            current={ltvCacStats.current}
            average={ltvCacStats.average}
            label="Current Ratio"
          />
        </div>

        {/* Contribution Margin Chart */}
        <div>
          <h4 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-3 text-sm">
            Contribution per Order
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={contributionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                height={40}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
                tickFormatter={(value) => `$${(value / 1).toFixed(0)}`}
              />
              <Tooltip
                content={(props) => {
                  const { active, payload, label } = props;
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="p-3 rounded border"
                        style={{
                          backgroundColor: 'var(--color-bg-card)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        <p className="font-semibold mb-1">{label}</p>
                        <p>{formatCurrency(payload[0].value)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={contributionStats.average}
                stroke={COLORS.GRAY[500]}
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${formatCurrency(contributionStats.average)}`,
                  position: 'top',
                  fill: 'var(--color-text-secondary)',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.PURPLE[500]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-1">
              Current Per Order
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold">
              {formatCurrency(contributionStats.current)}
            </p>
            <p
              style={{
                color:
                  contributionStats.current >= contributionStats.average
                    ? COLORS.GREEN[500]
                    : COLORS.RED[500],
              }}
              className="text-sm font-semibold"
            >
              {contributionStats.current >= contributionStats.average ? '↑' : '↓'}{' '}
              {Math.abs(
                contributionStats.average > 0
                  ? ((contributionStats.current - contributionStats.average) /
                      contributionStats.average) *
                      100
                  : 0
              ).toFixed(1)}
              % vs avg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
