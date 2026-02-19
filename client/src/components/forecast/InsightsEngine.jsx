import React, { useMemo, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { filterDataByDateRange } from '../../utils/formatters';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

export default function InsightsEngine() {
  const dateRange = useStore((state) => state.dateRange);
  const addInsights = useStore((state) => state.addInsights);
  const storeShopifyData = useStore((state) => state.shopifyData);
  const storeMetaData = useStore((state) => state.metaData);
  const storeGoogleData = useStore((state) => state.googleData);
  const storeKlaviyoData = useStore((state) => state.klaviyoData);
  const storeGa4Data = useStore((state) => state.ga4Data);

  const insights = useMemo(() => {
    const generatedInsights = [];

    // Get all relevant data
    const shopifyData = filterDataByDateRange(storeShopifyData || [], dateRange);
    const metaData = filterDataByDateRange(storeMetaData || [], dateRange);
    const googleData = filterDataByDateRange(storeGoogleData || [], dateRange);
    const klaviyoData = filterDataByDateRange(storeKlaviyoData || [], dateRange);
    const ga4Data = filterDataByDateRange(storeGa4Data || [], dateRange);

    if (shopifyData.length === 0) return [];

    // ANOMALY DETECTION
    // Check for revenue anomalies
    const revenues = shopifyData.map((d) => d.revenue);
    const revenueMean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const revenueStdDev = Math.sqrt(
      revenues.reduce((sum, v) => sum + Math.pow(v - revenueMean, 2), 0) / revenues.length
    );

    revenues.forEach((value, idx) => {
      const zScore = Math.abs((value - revenueMean) / revenueStdDev);
      if (zScore > 2.5) {
        const dateStr = shopifyData[idx].date;
        const direction = value > revenueMean ? 'spike' : 'dip';
        generatedInsights.push({
          id: `anomaly-revenue-${idx}`,
          severity: direction === 'spike' ? 'info' : 'warning',
          title: `Revenue ${direction === 'spike' ? 'Spike' : 'Dip'} Detected`,
          body:
            direction === 'spike'
              ? `Revenue jumped to ${formatCurrency(value)} on ${dateStr}, ${((zScore - 1) * 50).toFixed(0)}% above normal.`
              : `Revenue dropped to ${formatCurrency(value)} on ${dateStr}. Investigate potential issues.`,
          action: 'View Details',
          timestamp: new Date(),
          metric: 'revenue',
        });
      }
    });

    // TREND DETECTION
    // Check for declining revenue trend (3+ days)
    const last7days = shopifyData.slice(-7);
    let declineCount = 0;
    for (let i = 1; i < last7days.length; i++) {
      if (last7days[i].revenue < last7days[i - 1].revenue) {
        declineCount++;
      }
    }

    if (declineCount >= 4) {
      generatedInsights.push({
        id: 'trend-revenue-decline',
        severity: 'warning',
        title: 'Revenue Decline Trend',
        body: `Revenue has declined ${declineCount} out of the last 6 days. 7-day average: ${formatCurrency(
          last7days.reduce((sum, d) => sum + d.revenue, 0) / last7days.length
        )}.`,
        action: 'Analyze Causes',
        timestamp: new Date(),
        metric: 'revenue',
      });
    }

    // Check for improving trend (3+ consecutive days up)
    let improveCount = 0;
    for (let i = 1; i < last7days.length; i++) {
      if (last7days[i].revenue > last7days[i - 1].revenue) {
        improveCount++;
      } else {
        improveCount = 0;
      }
    }

    if (improveCount >= 3) {
      generatedInsights.push({
        id: 'trend-revenue-improvement',
        severity: 'success',
        title: 'Strong Revenue Growth',
        body: `Revenue has grown for ${improveCount} consecutive days. Keep momentum with current strategies.`,
        action: 'View Performance',
        timestamp: new Date(),
        metric: 'revenue',
      });
    }

    // CHANNEL COMPARISON
    // ROAS comparison
    const metaAvgROAS = metaData.reduce((sum, d) => sum + (d.roas || 0), 0) / Math.max(1, metaData.length);
    const googleAvgROAS = googleData.reduce((sum, d) => sum + (d.roas || 0), 0) / Math.max(1, googleData.length);

    if (googleAvgROAS > metaAvgROAS * 1.2) {
      generatedInsights.push({
        id: 'opportunity-google-outperforms',
        severity: 'info',
        title: 'Google Ads Outperforming Meta',
        body: `Google ROAS (${googleAvgROAS.toFixed(2)}x) is ${(((googleAvgROAS - metaAvgROAS) / metaAvgROAS) * 100).toFixed(0)}% higher than Meta (${metaAvgROAS.toFixed(2)}x). Consider increasing Google budget.`,
        action: 'Rebalance Budget',
        timestamp: new Date(),
        metric: 'roas',
      });
    }

    // CPA comparison
    const metaCPA = metaData.reduce((sum, d) => sum + (d.cpa || 0), 0) / Math.max(1, metaData.length);
    const googleCPA = googleData.reduce((sum, d) => sum + (d.cpa || 0), 0) / Math.max(1, googleData.length);

    if (metaCPA > googleCPA * 1.3) {
      generatedInsights.push({
        id: 'warning-meta-high-cpa',
        severity: 'warning',
        title: 'Meta CPA Rising',
        body: `Meta CPA (${formatCurrency(metaCPA)}) is significantly higher than Google (${formatCurrency(
          googleCPA
        )}). Review Meta campaign targeting and bid strategy.`,
        action: 'Optimize Campaigns',
        timestamp: new Date(),
        metric: 'cpa',
      });
    }

    // CONVERSION METRICS
    // Check conversion rate
    if (ga4Data.length > 0) {
      const conversionRates = ga4Data.map((d) => d.conversionRate);
      const convMean = conversionRates.reduce((a, b) => a + b, 0) / conversionRates.length;
      const recentConv = conversionRates.slice(-5).reduce((a, b) => a + b, 0) / 5;

      if (recentConv < convMean * 0.85) {
        generatedInsights.push({
          id: 'warning-conv-rate-declining',
          severity: 'warning',
          title: 'Conversion Rate Declining',
          body: `Recent conversion rate (${recentConv.toFixed(2)}%) is ${(((recentConv - convMean) / convMean) * 100).toFixed(0)}% below your 30-day average (${convMean.toFixed(2)}%). Check product pages and checkout flow.`,
          action: 'Review Funnel',
          timestamp: new Date(),
          metric: 'conversion_rate',
        });
      }
    }

    // REFUND RATE
    const last30Refunds = shopifyData.slice(-30);
    const avgRefundRate =
      last30Refunds.reduce((sum, d) => sum + (d.refunds || 0), 0) /
      Math.max(1, last30Refunds.reduce((sum, d) => sum + (d.orders || 0), 0));

    if (avgRefundRate > 0.05) {
      generatedInsights.push({
        id: 'warning-high-refund-rate',
        severity: 'warning',
        title: 'High Refund Rate Alert',
        body: `Your 30-day refund rate is ${formatPercent(avgRefundRate)}, above the 3-5% industry benchmark. Investigate product quality or shipping issues.`,
        action: 'Review Refunds',
        timestamp: new Date(),
        metric: 'refund_rate',
      });
    }

    // POSITIVE SIGNALS
    // Email performance
    if (klaviyoData.length > 0) {
      const emailRevenue = klaviyoData.reduce((sum, d) => sum + (d.flowRevenue || 0) + (d.campaignRevenue || 0), 0);
      const totalRevenue = shopifyData.reduce((sum, d) => sum + d.revenue, 0);
      const emailShare = (emailRevenue / totalRevenue) * 100;

      if (emailShare > 18) {
        generatedInsights.push({
          id: 'success-email-strong',
          severity: 'success',
          title: 'Email Performance Excellent',
          body: `Email is driving ${emailShare.toFixed(1)}% of revenue, above your typical 18%. Your flows and campaigns are performing well.`,
          action: 'View Flows',
          timestamp: new Date(),
          metric: 'email_revenue',
        });
      }
    }

    // AOV trend
    const last7AOV = shopifyData.slice(-7).map((d) => d.aov);
    const aovTrend = last7AOV.reduce((a, b) => a + b, 0) / last7AOV.length;
    const prev7AOV = shopifyData.slice(-14, -7).map((d) => d.aov);
    const prevAOVTrend = prev7AOV.reduce((a, b) => a + b, 0) / prev7AOV.length;

    if (aovTrend > prevAOVTrend * 1.08) {
      generatedInsights.push({
        id: 'success-aov-increasing',
        severity: 'success',
        title: 'Average Order Value Growing',
        body: `AOV increased to ${formatCurrency(aovTrend)}, up ${(
          ((aovTrend - prevAOVTrend) / prevAOVTrend) *
          100
        ).toFixed(1)}% from previous week. Your upselling is working.`,
        action: 'View Products',
        timestamp: new Date(),
        metric: 'aov',
      });
    }

    // INVENTORY/SUPPLY SIGNALS
    // Check for stocked products driving revenue
    const topRevenue = shopifyData.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7;
    const topOrders = shopifyData.slice(-7).reduce((sum, d) => sum + d.orders, 0) / 7;

    if (topOrders > 90 && topRevenue > 1500) {
      generatedInsights.push({
        id: 'info-strong-demand',
        severity: 'info',
        title: 'Strong Demand Signal',
        body: `Recent 7-day average: ${formatNumber(topOrders)} orders/day generating ${formatCurrency(
          topRevenue * 7
        )} weekly. Consider increasing inventory investment.`,
        action: 'Review Stock',
        timestamp: new Date(),
        metric: 'orders',
      });
    }

    return generatedInsights;
  }, [dateRange, storeShopifyData, storeMetaData, storeGoogleData, storeKlaviyoData, storeGa4Data]);

  // Push insights to store on change
  useEffect(() => {
    if (insights.length > 0) {
      addInsights(insights);
    }
  }, [insights, addInsights]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return '🔵';
      case 'success':
        return '🟢';
      default:
        return '◯';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      default:
        return 'border-slate-600/30 bg-slate-600/10';
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-100">Insights</h3>
        <p className="text-sm text-slate-400 mt-1">
          {insights.length} automated insights from your data
        </p>
      </div>

      {/* Insights List */}
      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.slice(0, 8).map((insight) => (
            <div
              key={insight.id}
              className={`rounded-lg p-4 border ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">{getSeverityIcon(insight.severity)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${getSeverityTextColor(insight.severity)}`}>
                    {insight.title}
                  </h4>
                  <p className="text-sm text-slate-300 mt-1">{insight.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">No insights available for this date range.</p>
        </div>
      )}

      {/* Footer */}
      {insights.length > 8 && (
        <div className="border-t border-slate-700/50 pt-4 mt-4">
          <p className="text-xs text-slate-400 text-center">
            Showing 8 of {insights.length} insights
          </p>
        </div>
      )}
    </div>
  );
}
