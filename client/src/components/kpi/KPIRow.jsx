import { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Zap,
  ShoppingCart,
  Users,
  BarChart3,
} from 'lucide-react';
import KPICard from './KPICard';
import { useStore } from '../../store/useStore';
import { mockData } from '../../mock/mockData';
import { filterDataByDateRange, getPreviousPeriod } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

/**
 * Compute metrics from mock data filtered by date range
 */
function computeMetrics(dateRange, fixedCosts) {
  // Get current period data
  const filteredShopify = filterDataByDateRange(mockData.shopify || [], dateRange);
  const filteredMeta = filterDataByDateRange(mockData.meta || [], dateRange);
  const filteredGoogle = filterDataByDateRange(mockData.google || [], dateRange);

  // Get previous period for comparison
  const prevDateRange = getPreviousPeriod(dateRange);
  const prevShopify = filterDataByDateRange(mockData.shopify || [], prevDateRange);
  const prevMeta = filterDataByDateRange(mockData.meta || [], prevDateRange);
  const prevGoogle = filterDataByDateRange(mockData.google || [], prevDateRange);

  // Calculate monthly fixed costs
  const monthlyFixedCosts = (fixedCosts || [])
    .filter((cost) => cost.isActive !== false)
    .reduce((sum, cost) => sum + (cost.monthlyAmount || 0), 0);

  // Daily fixed cost (approximate)
  const dailyFixedCost = monthlyFixedCosts / 30;

  // Helper function to sum a property from an array
  const sumProperty = (arr, prop) => {
    return arr.reduce((sum, item) => sum + (item[prop] || 0), 0);
  };

  // ========== CURRENT PERIOD ==========
  // 1. Gross Revenue
  const currentGrossRevenue = sumProperty(filteredShopify, 'revenue');

  // 2. Net Profit
  const currentRefunds = sumProperty(filteredShopify, 'refundAmount');
  const currentCogs = sumProperty(filteredShopify, 'cogs');
  const currentShipping = sumProperty(filteredShopify, 'shipping');
  const currentTransactionFees = sumProperty(filteredShopify, 'transactionFees');
  const currentAdSpend = sumProperty(filteredMeta, 'spend') + sumProperty(filteredGoogle, 'spend');
  const currentPeriodFixedCosts = dailyFixedCost * filteredShopify.length;
  const currentNetProfit =
    currentGrossRevenue -
    currentRefunds -
    currentCogs -
    currentShipping -
    currentTransactionFees -
    currentAdSpend -
    currentPeriodFixedCosts;

  // 3. Blended ROAS
  const currentMetaRevenue = sumProperty(filteredMeta, 'revenue');
  const currentGoogleRevenue = sumProperty(filteredGoogle, 'conversionValue');
  const currentTotalAdRevenue = currentMetaRevenue + currentGoogleRevenue;
  const currentBlendedRoas = currentAdSpend > 0 ? currentTotalAdRevenue / currentAdSpend : 0;

  // 4. Total Ad Spend
  const currentTotalAdSpend = currentAdSpend;

  // 5. Blended CAC
  const currentNewCustomers = sumProperty(filteredShopify, 'newCustomers');
  const currentBlendedCac = currentNewCustomers > 0 ? currentAdSpend / currentNewCustomers : 0;

  // 6. Net Margin %
  const currentNetMarginPercent = currentGrossRevenue > 0
    ? (currentNetProfit / currentGrossRevenue) * 100
    : 0;

  // ========== PREVIOUS PERIOD ==========
  // 1. Gross Revenue
  const prevGrossRevenue = sumProperty(prevShopify, 'revenue');

  // 2. Net Profit
  const prevRefunds = sumProperty(prevShopify, 'refundAmount');
  const prevCogs = sumProperty(prevShopify, 'cogs');
  const prevShipping = sumProperty(prevShopify, 'shipping');
  const prevTransactionFees = sumProperty(prevShopify, 'transactionFees');
  const prevAdSpend = sumProperty(prevMeta, 'spend') + sumProperty(prevGoogle, 'spend');
  const prevPeriodFixedCosts = dailyFixedCost * prevShopify.length;
  const prevNetProfit =
    prevGrossRevenue -
    prevRefunds -
    prevCogs -
    prevShipping -
    prevTransactionFees -
    prevAdSpend -
    prevPeriodFixedCosts;

  // 3. Blended ROAS
  const prevMetaRevenue = sumProperty(prevMeta, 'revenue');
  const prevGoogleRevenue = sumProperty(prevGoogle, 'conversionValue');
  const prevTotalAdRevenue = prevMetaRevenue + prevGoogleRevenue;
  const prevBlendedRoas = prevAdSpend > 0 ? prevTotalAdRevenue / prevAdSpend : 0;

  // 4. Total Ad Spend
  const prevTotalAdSpend = prevAdSpend;

  // 5. Blended CAC
  const prevNewCustomers = sumProperty(prevShopify, 'newCustomers');
  const prevBlendedCac = prevNewCustomers > 0 ? prevAdSpend / prevNewCustomers : 0;

  // 6. Net Margin %
  const prevNetMarginPercent = prevGrossRevenue > 0
    ? (prevNetProfit / prevGrossRevenue) * 100
    : 0;

  // ========== SPARKLINE DATA ==========
  const getSparklineData = (arr, prop) => {
    return arr.map((item) => item[prop] || 0);
  };

  const grossRevenueSparkline = getSparklineData(filteredShopify, 'revenue');
  const netProfitSparkline = filteredShopify.map((item) => {
    const refund = item.refundAmount || 0;
    const cogs = item.cogs || 0;
    const shipping = item.shipping || 0;
    const fees = item.transactionFees || 0;

    // Get meta and google for same date
    const metaDate = filteredMeta.find((m) => m.date === item.date);
    const googleDate = filteredGoogle.find((g) => g.date === item.date);
    const adSpend = (metaDate?.spend || 0) + (googleDate?.spend || 0);

    return (
      item.revenue -
      refund -
      cogs -
      shipping -
      fees -
      adSpend -
      dailyFixedCost
    );
  });

  const roas = filteredMeta.map((item) => {
    const metaRev = item.revenue || 0;
    const googleDate = filteredGoogle.find((g) => g.date === item.date);
    const googleRev = googleDate?.conversionValue || 0;
    const totalRev = metaRev + googleRev;
    const metaSpend = item.spend || 0;
    const googleSpend = googleDate?.spend || 0;
    const totalSpend = metaSpend + googleSpend;
    return totalSpend > 0 ? totalRev / totalSpend : 0;
  });

  const adSpendSparkline = filteredMeta.map((item) => {
    const metaSpend = item.spend || 0;
    const googleDate = filteredGoogle.find((g) => g.date === item.date);
    const googleSpend = googleDate?.spend || 0;
    return metaSpend + googleSpend;
  });

  const cacSparkline = filteredShopify.map((item) => {
    const newCustomers = item.newCustomers || 1;
    const metaDate = filteredMeta.find((m) => m.date === item.date);
    const googleDate = filteredGoogle.find((g) => g.date === item.date);
    const adSpend = (metaDate?.spend || 0) + (googleDate?.spend || 0);
    return adSpend / newCustomers;
  });

  const marginSparkline = filteredShopify.map((item) => {
    const refund = item.refundAmount || 0;
    const cogs = item.cogs || 0;
    const shipping = item.shipping || 0;
    const fees = item.transactionFees || 0;

    const metaDate = filteredMeta.find((m) => m.date === item.date);
    const googleDate = filteredGoogle.find((g) => g.date === item.date);
    const adSpend = (metaDate?.spend || 0) + (googleDate?.spend || 0);

    const profit =
      item.revenue -
      refund -
      cogs -
      shipping -
      fees -
      adSpend -
      dailyFixedCost;
    return item.revenue > 0 ? (profit / item.revenue) * 100 : 0;
  });

  return {
    metrics: [
      {
        title: 'Gross Revenue',
        current: currentGrossRevenue,
        previous: prevGrossRevenue,
        format: 'currency',
        sparkline: grossRevenueSparkline,
        icon: DollarSign,
        accentColor: COLORS.BLUE[500],
      },
      {
        title: 'Net Profit',
        current: currentNetProfit,
        previous: prevNetProfit,
        format: 'currency',
        sparkline: netProfitSparkline,
        icon: TrendingUp,
        accentColor: COLORS.GREEN[500],
      },
      {
        title: 'Blended ROAS',
        current: currentBlendedRoas,
        previous: prevBlendedRoas,
        format: 'ratio',
        sparkline: roas,
        icon: Zap,
        accentColor: COLORS.ORANGE[500],
      },
      {
        title: 'Total Ad Spend',
        current: currentTotalAdSpend,
        previous: prevTotalAdSpend,
        format: 'currency',
        sparkline: adSpendSparkline,
        icon: ShoppingCart,
        accentColor: COLORS.RED[500],
      },
      {
        title: 'Blended CAC',
        current: currentBlendedCac,
        previous: prevBlendedCac,
        format: 'currency',
        sparkline: cacSparkline,
        icon: Users,
        accentColor: COLORS.PURPLE[500],
      },
      {
        title: 'Net Margin %',
        current: currentNetMarginPercent,
        previous: prevNetMarginPercent,
        format: 'percent',
        suffix: '%',
        sparkline: marginSparkline,
        icon: BarChart3,
        accentColor: COLORS.CYAN[500],
      },
    ],
  };
}

export default function KPIRow() {
  const dateRange = useStore((state) => state.dateRange);
  const fixedCosts = useStore((state) => state.fixedCosts);
  const isLoading = useStore((state) => state.isLoading);
  // isSyncingAny is a getter factory, compute directly instead
  const isSyncingAny = useStore((state) => {
    const loading = state.isLoading;
    if (!loading || typeof loading !== 'object') return false;
    return Object.values(loading).some((v) => v === true);
  });

  // Compute metrics using memoization to avoid unnecessary recalculations
  const { metrics } = useMemo(() => computeMetrics(dateRange, fixedCosts), [dateRange, fixedCosts]);

  const isAnyLoading = typeof isLoading === 'object'
    ? (isLoading?.shopify || isLoading?.meta || isLoading?.google || false)
    : !!isLoading;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4 transition-all duration-300">
      {metrics.map((metric) => (
        <KPICard
          key={metric.title}
          title={metric.title}
          value={metric.current}
          previousValue={metric.previous}
          format={metric.format}
          suffix={metric.suffix}
          sparklineData={metric.sparkline}
          icon={metric.icon}
          accentColor={metric.accentColor}
          loading={isAnyLoading || isSyncingAny}
        />
      ))}
    </div>
  );
}
