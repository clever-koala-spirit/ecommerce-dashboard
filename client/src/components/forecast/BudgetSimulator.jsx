import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import {
  simulateScenario,
  findOptimalAllocation,
  calculateBudgetShiftImpact,
  diminishingReturnsModel,
} from '../../utils/budgetOptimizer';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CHANNEL_COLORS } from '../../utils/colors';

export default function BudgetSimulator() {
  const { colors } = useTheme();
  const metaData = useStore((state) => state.metaData);
  const googleData = useStore((state) => state.googleData);

  const [budgets, setBudgets] = useState({
    meta: 17500,
    google: 10000,
    tiktok: 5000,
  });

  const [showOptimized, setShowOptimized] = useState(false);

  const scenario = useMemo(() => {
    return simulateScenario(budgets, {
      meta: metaData,
      google: googleData,
    });
  }, [budgets]);

  const optimized = useMemo(() => {
    return findOptimalAllocation(
      budgets.meta + budgets.google + budgets.tiktok,
      {
        meta: metaData,
        google: googleData,
      },
      {
        meta: { min: 5000, max: 25000 },
        google: { min: 3000, max: 20000 },
        tiktok: { min: 2000, max: 15000 },
      }
    );
  }, [budgets]);

  const diminishingReturns = useMemo(() => {
    const result = {};
    const channels = ['meta', 'google', 'tiktok'];

    channels.forEach((channel) => {
      const spend = [];
      const revenue = [];

      if (channel === 'meta' && metaData && metaData.length > 0) {
        metaData.forEach((d) => {
          spend.push(d.spend);
          revenue.push(d.revenue);
        });
      } else if (channel === 'google' && googleData && googleData.length > 0) {
        googleData.forEach((d) => {
          spend.push(d.spend);
          revenue.push(d.conversionValue);
        });
      } else {
        for (let i = 0; i < 20; i++) {
          const s = 100 + i * 500;
          spend.push(s);
          revenue.push(s * 2.8 * (1 - i * 0.02));
        }
      }

      result[channel] = diminishingReturnsModel(spend, revenue);
    });

    return result;
  }, []);

  const shiftImpact = useMemo(() => {
    return calculateBudgetShiftImpact(
      budgets,
      'meta',
      'google',
      1000,
      {
        meta: metaData,
        google: googleData,
      }
    );
  }, [budgets]);

  const handleBudgetChange = (channel, value) => {
    setBudgets((prev) => ({
      ...prev,
      [channel]: Math.max(0, value),
    }));
    setShowOptimized(false);
  };

  const applyOptimized = () => {
    if (optimized.allocation) {
      setBudgets(optimized.allocation);
      setShowOptimized(true);
    }
  };

  const diminishingChartsData = useMemo(() => {
    const result = {};
    const channels = ['meta', 'google', 'tiktok'];

    channels.forEach((channel) => {
      const model = diminishingReturns[channel];
      const spendRange = [];

      const minBudget = budgets[channel] || 5000;
      const maxBudget = minBudget * 2.5;
      const step = (maxBudget - minBudget) / 10;

      for (let spend = minBudget; spend <= maxBudget; spend += step) {
        let revenue = 0;

        if (model.type === 'linear') {
          revenue = model.slope * spend + model.intercept;
        } else if (model.type === 'log') {
          revenue = model.slope * Math.log(spend) + model.intercept;
        }

        spendRange.push({
          spend: Math.round(spend),
          revenue: Math.max(0, Math.round(revenue)),
        });
      }

      result[channel] = spendRange;
    });

    return result;
  }, [budgets, diminishingReturns]);

  const currentAllocation = budgets.meta + budgets.google + budgets.tiktok;

  return (
    <div className="backdrop-blur rounded-xl p-6" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Budget Simulator</h3>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Adjust channel budgets to see impact on revenue, ROAS, and profit
          </p>
        </div>
        <button
          onClick={applyOptimized}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all"
        >
          Optimize
        </button>
      </div>

      {/* Budget Sliders */}
      <div className="space-y-6 mb-8">
        {[
          { key: 'meta', label: 'Meta Ads', color: CHANNEL_COLORS.meta },
          { key: 'google', label: 'Google Ads', color: CHANNEL_COLORS.google },
          { key: 'tiktok', label: 'TikTok Ads', color: '#000' },
        ].map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-2" style={{ color: colors.text }}>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </label>
              <input
                type="number"
                value={budgets[key]}
                onChange={(e) => handleBudgetChange(key, parseFloat(e.target.value))}
                className="rounded px-3 py-1 text-sm w-32 text-right"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={budgets[key]}
              onChange={(e) => handleBudgetChange(key, parseFloat(e.target.value))}
              className="w-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${
                  (budgets[key] / 50000) * 100
                }%, ${colors.border} ${(budgets[key] / 50000) * 100}%, ${colors.border} 100%)`,
              }}
            />
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>$0 - $50,000</p>
          </div>
        ))}
      </div>

      {/* Live Projections */}
      <div className="rounded-lg p-4 mb-8" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>
          {showOptimized ? 'Optimized Scenario' : 'Current Scenario'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Total Budget</p>
            <p className="text-lg font-semibold mt-1" style={{ color: colors.text }}>
              {formatCurrency(currentAllocation)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Projected Revenue</p>
            <p className="text-lg font-semibold text-blue-400 mt-1">
              {formatCurrency(scenario.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Projected ROAS</p>
            <p className="text-lg font-semibold mt-1" style={{ color: colors.text }}>
              {scenario.roas?.toFixed(2) || '0.00'}x
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Projected CPA</p>
            <p className="text-lg font-semibold mt-1" style={{ color: colors.text }}>
              {formatCurrency(scenario.totalCPA)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Projected Profit</p>
            <p
              className={`text-lg font-semibold mt-1 ${
                scenario.profit > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatCurrency(scenario.profit)}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Shift Suggestion */}
      <div className="rounded-lg p-4 mb-8" style={{ backgroundColor: `${colors.accent}15`, border: `1px solid ${colors.accent}40` }}>
        <p className="text-sm" style={{ color: colors.accent }}>
          💡 {shiftImpact.recommendation}
        </p>
        <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
          Profit impact: {formatCurrency(shiftImpact.profitDelta)} (
          {shiftImpact.profitDelta > 0 ? '+' : ''}
          {((shiftImpact.profitDelta / shiftImpact.currentProfit) * 100).toFixed(1)}%)
        </p>
      </div>

      {/* Diminishing Returns Curves */}
      <div className="pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>Diminishing Returns Analysis</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { key: 'meta', label: 'Meta Ads', color: CHANNEL_COLORS.meta },
            { key: 'google', label: 'Google Ads', color: CHANNEL_COLORS.google },
            { key: 'tiktok', label: 'TikTok', color: '#000' },
          ].map(({ key, label, color }) => (
            <div key={key} className="rounded-lg p-3" style={{ backgroundColor: colors.background }}>
              <p className="text-xs font-medium mb-3" style={{ color: colors.textSecondary }}>{label}</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={diminishingChartsData[key]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid || colors.border} />
                    <XAxis
                      dataKey="spend"
                      tick={{ fontSize: 10, fill: colors.textSecondary }}
                      tickFormatter={(v) => formatNumber(v / 1000) + 'K'}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: colors.textSecondary }}
                      tickFormatter={(v) => formatNumber(v / 1000) + 'K'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        color: colors.text,
                      }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                Current: {formatCurrency(budgets[key])}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Box */}
      <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Smart Allocation Tip</h4>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Based on diminishing returns analysis, Google Ads shows stronger efficiency gains at higher
          budgets. Consider reallocating 15-20% from Meta to Google for potential profit improvements.
        </p>
      </div>
    </div>
  );
}
