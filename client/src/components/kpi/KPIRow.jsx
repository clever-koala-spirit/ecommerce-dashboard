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
import { filterDataByDateRange, getPreviousPeriod } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

/**
 * Compute metrics from store data filtered by date range
 */
function computeMetrics(dateRange, fixedCosts, shopifyData, metaData, googleData) {
  // Get current period data
  const filteredShopify = filterDataByDateRange(shopifyData || [], dateRange);
  const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
  const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);

  // Get previous period for comparison
  const prevDateRange = getPreviousPeriod(dateRange);
  const prevShopify = filterDataByDateRange(shopifyData || [], prevDateRange);
  const prevMeta = filterDataByDateRange(metaData || [], prevDateRange);
  const prevGoogle = filterDataByDateRange(googleData || [], prevDateRange);

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
  // Use grossRevenue (total including shipping/tax) to match Shopify admin "Total sales"
  const currentGrossRevenue = sumProperty(filteredShopify, 'grossRevenue') || sumProperty(filteredShopify, 'revenue');

  // 2. Net Profit
  const currentRefunds = sumProperty(filteredShopify, 'refundAmount');
  const currentCogs = sumProperty(filteredShopify, 'cogs');
  const currentShipping = sumProperty(filteredShopify, 'shipping');
  const currentAdSpend = sumProperty(filteredMeta, 'spend') + sumProperty(filteredGoogle, 'spend');
  const currentPeriodFixedCosts = dailyFixedCost * filteredShopify.length;
  const currentNetProfit =
    currentGrossRevenue -
    currentRefunds -
    currentCogs -
    currentShipping -
    currentAdSpend -
    currentPeriodFixedCosts;

  // Shopify-only metrics
  const currentTotalOrders = sumProperty(filteredShopify, 'orders');
  const currentAov = currentTotalOrders > 0 ? currentGrossRevenue / currentTotalOrders : 0;
  const currentRefundCount = sumProperty(filteredShopify, 'refunds');
  const currentRefundAmount = currentRefunds;

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
  const prevGrossRevenue = sumProperty(prevShopify, 'grossRevenue') || sumProperty(prevShopify, 'revenue');

  // 2. Net Profit
  const prevRefunds = sumProperty(prevShopify, 'refundAmount');
  const prevCogs = sumProperty(prevShopify, 'cogs');
  const prevShipping = sumProperty(prevShopify, 'shipping');
  const prevAdSpend = sumProperty(prevMeta, 'spend') + sumProperty(prevGoogle, 'spend');
  const prevPeriodFixedCosts = dailyFixedCost * prevShopify.length;
  const prevNetProfit =
    prevGrossRevenue -
    prevRefunds -
    prevCogs -
    prevShipping -
    prevAdSpend -
    prevPeriodFixedCosts;

  const prevTotalOrders = sumProperty(prevShopify, 'orders');
  const prevAov = prevTotalOrders > 0 ? prevGrossRevenue / prevTotalOrders : 0;
  const prevRefundCount = sumProperty(prevShopify, 'refunds');
  const prevRefundAmount = prevRefunds;

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

  const grossRevenueSparkline = filteredShopify.map(d => d.grossRevenue || d.revenue || 0);
  const netProfitSparkline = filteredShopify.map((item) => {
    const refund = item.refundAmount || 0;
    const cogs = item.cogs || 0;
    const shipping = item.shipping || 0;

    const metaDate = filteredMeta.find((m) => m.date === item.date);
    const googleDate = filteredGoogle.find((g) => g.date === item.date);
    const adSpend = (metaDate?.spend || 0) + (googleDate?.spend || 0);

    return (
      item.revenue -
      refund -
      cogs -
      shipping -
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

    const metaDate = filteredMeta.find((m) => m.date === item.date);
    const googleDate = filteredGoogle.find((g) => g.date === item.date);
    const adSpend = (metaDate?.spend || 0) + (googleDate?.spend || 0);

    const profit =
      item.revenue -
      refund -
      cogs -
      shipping -
      adSpend -
      dailyFixedCost;
    return item.revenue > 0 ? (profit / item.revenue) * 100 : 0;
  });

  const ordersSparkline = getSparklineData(filteredShopify, 'orders');
  const aovSparkline = filteredShopify.map((item) =>
    item.orders > 0 ? item.grossRevenue / item.orders : 0
  );
  const refundSparkline = getSparklineData(filteredShopify, 'refundAmount');

  // Determine data availability
  const hasAdData = (metaData && metaData.length > 0) || (googleData && googleData.length > 0);
  const hasCOGS = (shopifyData || []).some((item) => item.cogs > 0);
  const hasFullCostData = hasAdData && hasCOGS;

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
        unavailable: false,
      },
      {
        title: 'Net Profit',
        current: currentNetProfit,
        previous: prevNetProfit,
        format: 'currency',
        sparkline: netProfitSparkline,
        icon: TrendingUp,
        accentColor: COLORS.GREEN[500],
        unavailable: !hasFullCostData,
        unavailableMessage: 'Connect ad platforms & add COGS to see this metric',
      },
      {
        title: 'Blended ROAS',
        current: currentBlendedRoas,
        previous: prevBlendedRoas,
        format: 'ratio',
        sparkline: roas,
        icon: Zap,
        accentColor: COLORS.ORANGE[500],
        unavailable: !hasAdData,
        unavailableMessage: 'Connect ad platforms to see this metric',
      },
      {
        title: 'Total Ad Spend',
        current: currentTotalAdSpend,
        previous: prevTotalAdSpend,
        format: 'currency',
        sparkline: adSpendSparkline,
        icon: ShoppingCart,
        accentColor: COLORS.RED[500],
        unavailable: !hasAdData,
        unavailableMessage: 'Connect ad platforms to see this metric',
      },
      {
        title: 'Blended CAC',
        current: currentBlendedCac,
        previous: prevBlendedCac,
        format: 'currency',
        sparkline: cacSparkline,
        icon: Users,
        accentColor: COLORS.PURPLE[500],
        unavailable: !hasAdData,
        unavailableMessage: 'Connect ad platforms to see this metric',
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
        unavailable: !hasFullCostData,
        unavailableMessage: 'Connect ad platforms & add COGS to see this metric',
      },
      {
        title: 'Total Orders',
        current: currentTotalOrders,
        previous: prevTotalOrders,
        format: 'number',
        sparkline: ordersSparkline,
        icon: ShoppingCart,
        accentColor: COLORS.BLUE[400],
        unavailable: false,
      },
      {
        title: 'AOV',
        current: currentAov,
        previous: prevAov,
        format: 'currency',
        sparkline: aovSparkline,
        icon: DollarSign,
        accentColor: COLORS.GREEN[400],
        unavailable: false,
      },
      {
        title: 'Refunds',
        current: currentRefundAmount,
        previous: prevRefundAmount,
        format: 'currency',
        sparkline: refundSparkline,
        icon: TrendingUp,
        accentColor: COLORS.RED[400],
        unavailable: false,
      },
    ],
  };
}

export default function KPIRow() {
  const dateRange = useStore((state) => state.dateRange);
  const fixedCosts = useStore((state) => state.fixedCosts);
  const shopifyData = useStore((state) => state.shopifyData);
  const metaData = useStore((state) => state.metaData);
  const googleData = useStore((state) => state.googleData);
  const isLoading = useStore((state) => state.isLoading);
  // isSyncingAny is a getter factory, compute directly instead
  const isSyncingAny = useStore((state) => {
    const loading = state.isLoading;
    if (!loading || typeof loading !== 'object') return false;
    return Object.values(loading).some((v) => v === true);
  });

  // Compute metrics using memoization to avoid unnecessary recalculations
  const { metrics } = useMemo(() => computeMetrics(dateRange, fixedCosts, shopifyData, metaData, googleData), [dateRange, fixedCosts, shopifyData, metaData, googleData]);

  const isAnyLoading = typeof isLoading === 'object'
    ? (isLoading?.shopify || isLoading?.meta || isLoading?.google || false)
    : !!isLoading;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-3 sm:gap-4 transition-all duration-300">
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
          unavailable={metric.unavailable}
          unavailableMessage={metric.unavailableMessage}
        />
      ))}
    </div>
  );
}
