import { useMemo, useState } from 'react';
import { Sparkles, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, X, Brain } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useStore } from '../../store/useStore';
import { filterDataByDateRange, formatCurrency, formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

function generateSmartInsights(shopifyData, metaData, googleData, dateRange) {
  const insights = [];
  const filtered = filterDataByDateRange(shopifyData || [], dateRange);
  const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
  const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);

  if (filtered.length < 3) return insights;

  const sum = (arr, p) => arr.reduce((s, d) => s + (d[p] || 0), 0);

  // 1. ANOMALY DETECTION — Z-score on revenue
  const revenues = filtered.map(d => d.grossRevenue || d.revenue || 0);
  const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
  const stdDev = Math.sqrt(revenues.reduce((s, v) => s + (v - mean) ** 2, 0) / revenues.length);

  if (stdDev > 0) {
    const last = revenues[revenues.length - 1];
    const z = (last - mean) / stdDev;
    if (z > 2) {
      insights.push({
        type: 'anomaly', severity: 'success', icon: TrendingUp,
        title: 'Revenue spike detected',
        body: `Yesterday's revenue (${formatCurrency(last)}) was ${(z * 1).toFixed(1)}σ above average. Investigate what drove this — replicate the winning formula.`,
        action: 'Analyze spike',
      });
    } else if (z < -2) {
      insights.push({
        type: 'anomaly', severity: 'warning', icon: TrendingDown,
        title: 'Revenue dip detected',
        body: `Yesterday's revenue (${formatCurrency(last)}) dropped ${Math.abs(z).toFixed(1)}σ below average. Check ad delivery, site uptime, or inventory issues.`,
        action: 'Investigate',
      });
    }
  }

  // 2. TREND ANALYSIS — 7-day momentum
  if (filtered.length >= 14) {
    const recent7 = filtered.slice(-7);
    const prev7 = filtered.slice(-14, -7);
    const recentRev = sum(recent7, 'grossRevenue') || sum(recent7, 'revenue');
    const prevRev = sum(prev7, 'grossRevenue') || sum(prev7, 'revenue');
    const change = prevRev > 0 ? ((recentRev - prevRev) / prevRev) * 100 : 0;

    if (Math.abs(change) > 10) {
      insights.push({
        type: 'trend', severity: change > 0 ? 'success' : 'warning', icon: change > 0 ? TrendingUp : TrendingDown,
        title: change > 0 ? 'Strong growth momentum' : 'Revenue trending down',
        body: `Week-over-week revenue ${change > 0 ? 'grew' : 'declined'} ${Math.abs(change).toFixed(1)}%. ${change > 0 ? 'Current strategies are working — consider scaling ad spend.' : 'Review campaigns, check for seasonal patterns, or test new creatives.'}`,
        action: change > 0 ? 'Scale up' : 'Review strategy',
      });
    }
  }

  // 3. AD SPEND EFFICIENCY
  const metaSpend = sum(filteredMeta, 'spend');
  const googleSpend = sum(filteredGoogle, 'spend');
  const metaRev = sum(filteredMeta, 'revenue');
  const googleRev = sum(filteredGoogle, 'conversionValue');

  if (metaSpend > 0 && googleSpend > 0) {
    const metaRoas = metaRev / metaSpend;
    const googleRoas = googleRev / googleSpend;

    if (metaRoas > googleRoas * 1.5) {
      insights.push({
        type: 'recommendation', severity: 'info', icon: Lightbulb,
        title: 'Reallocate budget to Meta',
        body: `Meta ROAS (${metaRoas.toFixed(2)}x) is ${((metaRoas / googleRoas - 1) * 100).toFixed(0)}% higher than Google (${googleRoas.toFixed(2)}x). Shifting 20% of Google budget to Meta could increase returns by ~${formatCurrency((metaRoas - googleRoas) * googleSpend * 0.2)}.`,
        action: 'Optimize budget',
      });
    } else if (googleRoas > metaRoas * 1.5) {
      insights.push({
        type: 'recommendation', severity: 'info', icon: Lightbulb,
        title: 'Reallocate budget to Google',
        body: `Google ROAS (${googleRoas.toFixed(2)}x) is outperforming Meta (${metaRoas.toFixed(2)}x). Consider shifting budget toward Google for better returns.`,
        action: 'Optimize budget',
      });
    }
  }

  // 4. AOV OPPORTUNITY
  const totalOrders = sum(filtered, 'orders');
  const totalRevenue = sum(filtered, 'grossRevenue') || sum(filtered, 'revenue');
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (aov > 0 && aov < 80) {
    insights.push({
      type: 'recommendation', severity: 'info', icon: Lightbulb,
      title: 'AOV growth opportunity',
      body: `Your AOV is ${formatCurrency(aov)}. Brands in your range typically see 15-25% AOV lifts from bundle offers, free shipping thresholds, or post-purchase upsells.`,
      action: 'Increase AOV',
    });
  }

  // 5. CUSTOMER RETENTION
  const newCustomers = sum(filtered, 'newCustomers');
  const returningCustomers = sum(filtered, 'returningCustomers');
  const repeatRate = (newCustomers + returningCustomers) > 0 ? returningCustomers / (newCustomers + returningCustomers) * 100 : 0;

  if (repeatRate < 20 && newCustomers > 10) {
    insights.push({
      type: 'recommendation', severity: 'warning', icon: AlertTriangle,
      title: 'Low repeat purchase rate',
      body: `Only ${repeatRate.toFixed(1)}% of customers are returning. Industry average is 25-30%. Implement post-purchase email flows, loyalty rewards, or subscription offers.`,
      action: 'Improve retention',
    });
  } else if (repeatRate > 35) {
    insights.push({
      type: 'trend', severity: 'success', icon: TrendingUp,
      title: 'Excellent customer loyalty',
      body: `${repeatRate.toFixed(1)}% repeat rate is well above industry average. Your retention strategies are working — consider referral programs to amplify growth.`,
      action: 'Launch referrals',
    });
  }

  return insights.slice(0, 3); // Max 3 insights shown
}

const severityConfig = {
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#22c55e' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
  info: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', color: '#6366f1' },
};

export default function AIInsightsBanner() {
  const { colors, theme } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const metaData = useStore(s => s.metaData);
  const googleData = useStore(s => s.googleData);
  const dateRange = useStore(s => s.dateRange);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const insights = useMemo(
    () => generateSmartInsights(shopifyData, metaData, googleData, dateRange),
    [shopifyData, metaData, googleData, dateRange]
  );

  if (dismissed || insights.length === 0) return null;

  const primary = insights[0];
  const rest = insights.slice(1);
  const config = severityConfig[primary.severity] || severityConfig.info;
  const Icon = primary.icon;

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ border: `1px solid ${config.border}` }}>
      {/* Primary insight */}
      <div className="p-4 flex items-start gap-3" style={{ background: config.bg }}>
        <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${config.color}15` }}>
          <Brain size={18} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={{ background: `${config.color}15`, color: config.color }}>
              AI Insight
            </span>
            <span className="text-[10px] font-medium capitalize" style={{ color: colors.textTertiary }}>{primary.type}</span>
          </div>
          <h4 className="text-sm font-semibold" style={{ color: colors.text }}>{primary.title}</h4>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: colors.textSecondary }}>{primary.body}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {rest.length > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200"
              style={{ background: `${config.color}12`, color: config.color }}
            >
              +{rest.length} more
            </button>
          )}
          <button onClick={() => setDismissed(true)} className="p-1 rounded-md transition-opacity opacity-50 hover:opacity-100" style={{ color: colors.textTertiary }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Expanded insights */}
      {expanded && rest.length > 0 && (
        <div className="border-t" style={{ borderColor: config.border }}>
          {rest.map((insight, i) => {
            const cfg = severityConfig[insight.severity] || severityConfig.info;
            const IIcon = insight.icon;
            return (
              <div key={i} className="p-3 flex items-start gap-3" style={{ background: cfg.bg, borderBottom: i < rest.length - 1 ? `1px solid ${cfg.border}` : 'none' }}>
                <IIcon size={14} style={{ color: cfg.color, marginTop: 2 }} />
                <div className="flex-1">
                  <h5 className="text-xs font-semibold" style={{ color: colors.text }}>{insight.title}</h5>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>{insight.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
