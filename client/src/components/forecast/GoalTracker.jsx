import React, { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { mockData } from '../../mock/mockData';
import { forecast } from '../../utils/forecast';
import { filterDataByDateRange } from '../../utils/formatters';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

export default function GoalTracker() {
  const dateRange = useStore((state) => state.dateRange);
  const [revenueGoal, setRevenueGoal] = useState(1350000); // Monthly target
  const [profitGoal, setProfitGoal] = useState(405000); // Monthly profit target
  const [editMode, setEditMode] = useState(false);

  const goals = useMemo(() => {
    const historicalData = filterDataByDateRange(mockData.shopify || [], dateRange);

    if (historicalData.length === 0) {
      return {
        projectedRevenue: 0,
        projectedProfit: 0,
        revenueProgress: 0,
        profitProgress: 0,
        probability: 0,
        daysRemaining: 0,
        status: 'unknown',
      };
    }

    // Get current month progress
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthData = historicalData.filter((d) => {
      const itemDate = new Date(d.date);
      return itemDate >= monthStart && itemDate <= monthEnd;
    });

    const currentMonthRevenue = currentMonthData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const currentMonthCOGS = currentMonthData.reduce((sum, d) => sum + (d.cogs || 0), 0);

    // Run forecast for rest of month
    const lastDaysInMonth = historicalData.slice(-30);
    const dataForForecast = lastDaysInMonth.map((d) => ({
      date: d.date,
      value: d.revenue,
    }));

    const daysLeft = Math.ceil((monthEnd - now) / (1000 * 60 * 60 * 24));
    const forecastResult = forecast(dataForForecast, daysLeft, {
      method: 'auto',
      confidence: 0.95,
    });

    // Project remaining revenue
    const projectedAdditionalRevenue = forecastResult.values.reduce((sum, v) => sum + v.predicted, 0);
    const projectedMonthRevenue = currentMonthRevenue + projectedAdditionalRevenue;

    // Estimate profit (40% COGS, 8% platform fees, ~27.5k ad spend)
    const cogsPercentage = currentMonthRevenue > 0 ? currentMonthCOGS / currentMonthRevenue : 0.4;
    const estimatedCOGS = projectedMonthRevenue * cogsPercentage;
    const estimatedFees = projectedMonthRevenue * 0.08;
    const estimatedAdSpend = 27500;
    const estimatedOtherCosts = 3000;

    const projectedMonthProfit = projectedMonthRevenue - estimatedCOGS - estimatedFees - estimatedAdSpend - estimatedOtherCosts;

    // Calculate probability (using confidence intervals)
    let revenueProbability = 50;
    let profitProbability = 50;

    if (forecastResult.values.length > 0) {
      const avgUpper = forecastResult.values.reduce((sum, v) => sum + v.upper, 0) / forecastResult.values.length;
      const avgLower = forecastResult.values.reduce((sum, v) => sum + v.lower, 0) / forecastResult.values.length;

      // Rough probability calculation
      const revenueDiff = revenueGoal - currentMonthRevenue;
      const midpoint = (avgUpper + avgLower) / 2;

      if (revenueDiff > 0) {
        const needed = revenueDiff / daysLeft;
        const margin = (midpoint - needed) / midpoint;
        revenueProbability = Math.min(95, Math.max(5, 50 + margin * 40));
      } else {
        revenueProbability = 95;
      }

      profitProbability = projectedMonthProfit >= profitGoal ? 85 : 40;
    }

    const revenueProgress = (currentMonthRevenue / revenueGoal) * 100;
    const profitProgress = (projectedMonthProfit / profitGoal) * 100;

    // Status determination
    let status = 'on-pace';
    if (revenueProgress < 60 && daysLeft > 10) {
      status = 'behind';
    } else if (revenueProgress > 80) {
      status = 'ahead';
    }

    return {
      currentMonthRevenue,
      projectedRevenue: projectedMonthRevenue,
      projectedProfit: projectedMonthProfit,
      revenueProgress: Math.min(100, revenueProgress),
      profitProgress: Math.min(100, profitProgress),
      revenueProbability: Math.round(revenueProbability),
      profitProbability: Math.round(profitProbability),
      daysRemaining: daysLeft,
      status,
      monthEnd: monthEnd.toLocaleDateString(),
    };
  }, [dateRange, revenueGoal, profitGoal]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ahead':
        return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Ahead' };
      case 'behind':
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Behind' };
      case 'on-pace':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'On Pace' };
      default:
        return { bg: 'bg-slate-600/20', text: 'text-slate-400', label: 'Unknown' };
    }
  };

  const statusColor = getStatusColor(goals.status);

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Monthly Goals</h3>
          <p className="text-sm text-slate-400 mt-1">
            {goals.daysRemaining} days remaining in month
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-sm transition-all"
        >
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Edit Mode */}
      {editMode && (
        <div className="bg-slate-700/30 rounded-lg p-4 mb-6 border border-slate-700/50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Monthly Revenue Target
              </label>
              <input
                type="number"
                value={revenueGoal}
                onChange={(e) => setRevenueGoal(parseFloat(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Monthly Profit Target
              </label>
              <input
                type="number"
                value={profitGoal}
                onChange={(e) => setProfitGoal(parseFloat(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Goal */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400">Revenue Goal</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                {formatCurrency(revenueGoal)}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg ${statusColor.bg} ${statusColor.text} text-xs font-semibold`}
            >
              {statusColor.label}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-slate-300">
                {formatCurrency(goals.currentMonthRevenue)} / {formatCurrency(revenueGoal)}
              </span>
              <span className="text-sm font-semibold text-slate-100">
                {Math.round(goals.revenueProgress)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                style={{ width: `${goals.revenueProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-700/20 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Projected Month-End</p>
            <p className="text-lg font-semibold text-blue-400">
              {formatCurrency(goals.projectedRevenue)}
            </p>
            <p className={`text-xs mt-2 ${
              goals.revenueProbability > 70
                ? 'text-green-400'
                : goals.revenueProbability > 40
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {goals.revenueProbability}% probability of hitting goal
            </p>
          </div>
        </div>

        {/* Profit Goal */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400">Profit Goal</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                {formatCurrency(profitGoal)}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg ${
                goals.profitProbability > 70
                  ? 'bg-green-500/20 text-green-400'
                  : goals.profitProbability > 40
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              } text-xs font-semibold`}
            >
              {goals.profitProbability}% Likely
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-slate-300">
                Projected: {formatCurrency(goals.projectedProfit)}
              </span>
              <span className="text-sm font-semibold text-slate-100">
                {Math.round(goals.profitProgress)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden border border-slate-700/50">
              <div
                className={`h-full transition-all duration-500 ${
                  goals.projectedProfit > profitGoal
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}
                style={{ width: `${goals.profitProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-700/20 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Projected Margin</p>
            <p className="text-lg font-semibold text-green-400">
              {goals.projectedRevenue > 0
                ? ((goals.projectedProfit / goals.projectedRevenue) * 100).toFixed(1)
                : '0'}
              %
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {goals.daysRemaining} days remaining
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="border-t border-slate-700/50 pt-4 mt-6">
        {goals.status === 'ahead' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-300">
              ✓ You're ahead of pace! At current trends, you'll exceed your revenue goal.
            </p>
          </div>
        )}
        {goals.status === 'on-pace' && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              → You're on pace to hit your revenue goal. Maintain current performance.
            </p>
          </div>
        )}
        {goals.status === 'behind' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-300">
              ⚠ You're behind pace. Consider increasing ad spend or promotions to reach your goal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
