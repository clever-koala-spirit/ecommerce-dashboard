import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import SEO from '../components/common/SEO';
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
import { SkeletonChart, SkeletonTable } from '../components/common/SkeletonCard';
import { ErrorState } from '../components/common/EmptyState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const fetchDashboardData = useStore((state) => state.fetchDashboardData);
  const dateRange = useStore((state) => state.dateRange);
  const isLoading = useStore((state) => state.isLoading);
  const errors = useStore((state) => state.errors);
  const [fetchError, setFetchError] = useState(null);

  const isAnyLoading = typeof isLoading === 'object'
    ? Object.values(isLoading).some((v) => v === true)
    : !!isLoading;

  const hasFatalError = fetchError && !isAnyLoading;

  // Fetch real data on mount and when date range changes
  const loadData = () => {
    setFetchError(null);
    fetchDashboardData(dateRange).catch((err) => {
      console.error('[DashboardPage] Failed to fetch dashboard data:', err);
      setFetchError(err.message || 'Failed to load dashboard data');
    });
  };

  useEffect(() => {
    loadData();
  }, [fetchDashboardData, dateRange.preset, dateRange.customStart, dateRange.customEnd]);

  return (
    <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 page-content">
      <SEO title="Dashboard" description="Your real-time ecommerce profit dashboard." path="/dashboard" />
      <ConnectionStatusBar />
      <SampleDataBanner />
      {/* Code Editor */}
      <CodeEditor />

      {/* Custom Widgets */}
      <CustomWidgetRow />

      {/* Fatal error state */}
      {hasFatalError && (
        <div className="glass-card" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <ErrorState
            message={fetchError}
            onRetry={loadData}
          />
        </div>
      )}

      {/* Hero KPI Row */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.05s', animationFillMode: 'backwards' }}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Key Metrics
        </h2>
        <KPIRow />
      </div>

      {/* Revenue Overview */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Revenue Overview
        </h2>
        {isAnyLoading && !hasFatalError ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><SkeletonChart /></div>
            <SkeletonChart />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RevenueWaterfall />
            </div>
            <RevenueByChannel />
          </div>
        )}
      </div>

      {/* Channel Performance */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Channel Performance
        </h2>
        {isAnyLoading && !hasFatalError ? (
          <SkeletonTable />
        ) : (
          <ChannelPerformanceTable />
        )}
      </div>

      {/* Ad Spend Analysis */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Ad Spend Analysis
        </h2>
        {isAnyLoading && !hasFatalError ? (
          <SkeletonChart />
        ) : (
          <PaidAdsChart />
        )}
      </div>

      {/* Email Performance */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Email Performance
        </h2>
        {isAnyLoading && !hasFatalError ? (
          <SkeletonChart />
        ) : (
          <KlaviyoChart />
        )}
      </div>

      {/* Cost Analysis */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Cost Analysis
        </h2>
        {isAnyLoading && !hasFatalError ? (
          <SkeletonChart />
        ) : (
          <CostBreakdownChart />
        )}
      </div>

      {/* Efficiency Metrics */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.35s', animationFillMode: 'backwards' }}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Efficiency Metrics
        </h2>
        {isAnyLoading && !hasFatalError ? (
          <SkeletonChart />
        ) : (
          <EfficiencyCharts />
        )}
      </div>
    </div>
  );
}
