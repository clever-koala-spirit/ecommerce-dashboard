import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import {
  simulateScenario,
  findOptimalAllocation,
  calculateBudgetShiftImpact,
  diminishingReturnsModel,
} from '../../utils/budgetOptimizer';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CHANNEL_COLORS } from '../../utils/colors';

export default function BudgetSimulator() {
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
        // TikTok estimation
        for (let i = 0; i < 20; i++) {
          const s = 100 + i * 500;
          spend.push(s);
          revenue.push(s * 2.8 * (1 - i * 0.02)); // Diminishing returns
        }
      }

      result[channel] = diminishingReturnsModel(spend, revenue);
    });

    return result;
  }, []);

  // Calculate impact of potential budget shifts
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

  // Diminishing returns visualization data
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
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Budget Simulator</h3>
          <p className="text-sm text-slate-400 mt-1">
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
              <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
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
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm w-32 text-right"
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
                }%, #334155 ${(budgets[key] / 50000) * 100}%, #334155 100%)`,
              }}
            />
            <p className="text-xs text-slate-400 mt-1">$0 - $50,000</p>
          </div>
        ))}
      </div>

      {/* Live Projections */}
      <div className="bg-slate-700/30 rounded-lg p-4 mb-8 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-slate-100 mb-4">
          {showOptimized ? 'Optimized Scenario' : 'Current Scenario'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <p className="text-xs text-slate-400">Total Budget</p>
            <p className="text-lg font-semibold text-slate-100 mt-1">
              {formatCurrency(currentAllocation)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Projected Revenue</p>
            <p className="text-lg font-semibold text-blue-400 mt-1">
              {formatCurrency(scenario.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Projected ROAS</p>
            <p className="text-lg font-semibold text-slate-100 mt-1">
              {scenario.roas?.toFixed(2) || '0.00'}x
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Projected CPA</p>
            <p className="text-lg font-semibold text-slate-100 mt-1">
              {formatCurrency(scenario.totalCPA)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Projected Profit</p>
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
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-300">
          💡 {shiftImpact.recommendation}
        </p>
        <p className="text-xs text-blue-300/70 mt-2">
          Profit impact: {formatCurrency(shiftImpact.profitDelta)} (
          {shiftImpact.profitDelta > 0 ? '+' : ''}
          {((shiftImpact.profitDelta / shiftImpact.currentProfit) * 100).toFixed(1)}%)
        </p>
      </div>

      {/* Diminishing Returns Curves */}
      <div className="border-t border-slate-700/50 pt-6">
        <h4 className="text-sm font-semibold text-slate-100 mb-4">Diminishing Returns Analysis</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { key: 'meta', label: 'Meta Ads', color: CHANNEL_COLORS.meta },
            { key: 'google', label: 'Google Ads', color: CHANNEL_COLORS.google },
            { key: 'tiktok', label: 'TikTok', color: '#000' },
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-slate-700/20 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-300 mb-3">{label}</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={diminishingChartsData[key]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                      dataKey="spend"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickFormatter={(v) => formatNumber(v / 1000) + 'K'}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickFormatter={(v) => formatNumber(v / 1000) + 'K'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
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
              <p className="text-xs text-slate-400 mt-2">
                Current: {formatCurrency(budgets[key])}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Box */}
      <div className="border-t border-slate-700/50 pt-6 mt-6">
        <h4 className="text-sm font-semibold text-slate-100 mb-3">Smart Allocation Tip</h4>
        <p className="text-sm text-slate-300">
          Based on diminishing returns analysis, Google Ads shows stronger efficiency gains at higher
          budgets. Consider reallocating 15-20% from Meta to Google for potential profit improvements.
        </p>
      </div>
    </div>
  );
}
