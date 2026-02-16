import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import KPIRow from '../components/kpi/KPIRow';
import CustomWidgetRow from '../components/editor/CustomWidgetRow';
import CodeEditor from '../components/editor/CodeEditor';
import RevenueWaterfall from '../components/charts/RevenueWaterfall';
import RevenueByChannel from '../components/charts/RevenueByChannel';
import ChannelPerformanceTable from '../components/charts/ChannelPerformanceTable';
import PaidAdsChart from '../components/charts/PaidAdsChart';
import KlaviyoChart from '../components/charts/KlaviyoChart';
import CostBreakdownChart from '../components/charts/CostBreakdownChart';
import EfficiencyCharts from '../components/charts/EfficiencyCharts';
import InsightsEngine from '../components/forecast/InsightsEngine';
import SampleDataBanner from '../components/SampleDataBanner';
import ConnectionStatusBar from '../components/connections/ConnectionStatusBar';

export default function DashboardPage() {
  const navigate = useNavigate();
  const fetchDashboardData = useStore((state) => state.fetchDashboardData);
  const dateRange = useStore((state) => state.dateRange);

  // Fetch real data on mount and when date range changes
  useEffect(() => {
    fetchDashboardData(dateRange).catch((err) => {
      console.error('[DashboardPage] Failed to fetch dashboard data:', err);
    });
  }, [fetchDashboardData, dateRange.preset, dateRange.customStart, dateRange.customEnd]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 page-content">
      <ConnectionStatusBar />
      <SampleDataBanner />
      {/* Code Editor */}
      <CodeEditor />

      {/* Custom Widgets */}
      <CustomWidgetRow />

      {/* Hero KPI Row */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Key Metrics
        </h2>
        <KPIRow />
      </div>

      {/* Revenue Overview */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Revenue Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueWaterfall />
          </div>
          <RevenueByChannel />
        </div>
      </div>

      {/* Channel Performance */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Channel Performance
        </h2>
        <ChannelPerformanceTable />
      </div>

      {/* Ad Spend Analysis */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Ad Spend Analysis
        </h2>
        <PaidAdsChart />
      </div>

      {/* Email Performance */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Email Performance
        </h2>
        <KlaviyoChart />
      </div>

      {/* Cost Analysis */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Cost Analysis
        </h2>
        <CostBreakdownChart />
      </div>

      {/* Efficiency Metrics */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Efficiency Metrics
        </h2>
        <EfficiencyCharts />
      </div>
    </div>
  );
}
