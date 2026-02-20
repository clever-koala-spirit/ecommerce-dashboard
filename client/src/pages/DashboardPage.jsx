import { useEffect, useState, useMemo } from 'react';
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
import TotalSalesChart from '../components/charts/TotalSalesChart';
import BestSellingProducts from '../components/charts/BestSellingProducts';
import InsightsEngine from '../components/forecast/InsightsEngine';
import SampleDataBanner from '../components/SampleDataBanner';
import ConnectionStatusBar from '../components/connections/ConnectionStatusBar';
import DataFreshnessBar from '../components/common/DataFreshnessBar';
import AIInsightsBanner from '../components/ai/AIInsightsBanner';
import PredictionsOverview from '../components/predictions/PredictionsOverview';
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
    <div className="p-6 lg:p-8 space-y-6 page-content" style={{ maxWidth: '1440px' }}>
      <SEO title="Dashboard" description="Your real-time ecommerce profit dashboard." path="/dashboard" />
      <DataFreshnessBar />
      <SampleDataBanner />
      <AIInsightsBanner />
      <CodeEditor />
      <CustomWidgetRow />

      {/* Fatal error */}
      {hasFatalError && (
        <div className="glass-card p-6">
          <ErrorState message={fetchError} onRetry={loadData} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.05s', animationFillMode: 'backwards' }}>
        <KPIRow />
      </div>

      {/* AI Predictions Section */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.08s', animationFillMode: 'backwards' }}>
        <PredictionsOverview />
      </div>

      {/* Total Sales - Main Chart */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <TotalSalesChart />
      </div>

      {/* Secondary Charts - 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
        {isAnyLoading && !hasFatalError ? (
          <>
            <SkeletonChart />
            <SkeletonChart />
          </>
        ) : (
          <>
            <RevenueWaterfall />
            <RevenueByChannel />
          </>
        )}
      </div>

      {/* Best Selling Products */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
        <BestSellingProducts />
      </div>

      {/* Channel Performance */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}>
        {isAnyLoading && !hasFatalError ? <SkeletonTable /> : <ChannelPerformanceTable />}
      </div>

      {/* Ad Spend */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
        {isAnyLoading && !hasFatalError ? <SkeletonChart /> : <PaidAdsChart />}
      </div>

      {/* Email Performance */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.35s', animationFillMode: 'backwards' }}>
        {isAnyLoading && !hasFatalError ? <SkeletonChart /> : <KlaviyoChart />}
      </div>

      {/* Cost & Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
        {isAnyLoading && !hasFatalError ? (
          <><SkeletonChart /><SkeletonChart /></>
        ) : (
          <><CostBreakdownChart /><EfficiencyCharts /></>
        )}
      </div>
    </div>
  );
}
