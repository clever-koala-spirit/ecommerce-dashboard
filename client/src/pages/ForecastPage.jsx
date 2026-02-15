import React from 'react';
import GoalTracker from '../components/forecast/GoalTracker';
import RevenueForecastChart from '../components/forecast/RevenueForecastChart';
import ProfitForecast from '../components/forecast/ProfitForecast';
import ChannelForecastChart from '../components/forecast/ChannelForecastChart';
import BudgetSimulator from '../components/forecast/BudgetSimulator';
import InsightsEngine from '../components/forecast/InsightsEngine';
import SampleDataBanner from '../components/SampleDataBanner';

export default function ForecastPage() {
  return (
    <div className="p-6">
      <SampleDataBanner />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-100">
          Forecasting & Predictive Analytics
        </h1>
        <p className="text-slate-400">
          AI-powered predictions using time series analysis on your historical data
        </p>
      </div>

      {/* Goal Tracker - Full Width */}
      <GoalTracker />

      {/* Row 1: Revenue Forecast + Profit Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueForecastChart />
        </div>
        <div className="lg:col-span-1">
          <ProfitForecast />
        </div>
      </div>

      {/* Row 2: Channel Forecast - Full Width */}
      <div className="mb-6">
        <ChannelForecastChart />
      </div>

      {/* Row 3: Budget Simulator - Full Width */}
      <div className="mb-6">
        <BudgetSimulator />
      </div>

      {/* Row 4: Insights - Full Width */}
      <div className="mb-6">
        <InsightsEngine />
      </div>

      {/* Footer Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mt-8">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-200">About These Forecasts</h3>
            <p className="text-sm text-blue-300 mt-2">
              All forecasting is performed client-side using pure JavaScript time series algorithms. We use exponential smoothing, Holt-Winters seasonal decomposition, and linear regression depending on your data characteristics. The system automatically detects seasonality patterns (weekly and monthly) and adjusts predictions accordingly. Confidence intervals widen over longer forecasts to reflect increasing uncertainty.
            </p>
            <p className="text-sm text-blue-300 mt-2">
              Budget simulator uses historical ROAS and CPA data to project revenue impact of different spending scenarios. Insights are generated automatically by analyzing anomalies, trends, channel performance, and conversion metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
