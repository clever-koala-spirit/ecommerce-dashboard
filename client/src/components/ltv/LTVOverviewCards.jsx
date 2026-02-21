/**
 * LTV Overview Cards Component
 * Beautiful Apple-style KPI cards showing key LTV metrics
 */

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import {
  ArrowTrendingUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export default function LTVOverviewCards({ data }) {
  const { colors } = useTheme();

  if (!data) return null;

  const cards = [
    {
      id: 'avg_ltv',
      title: 'Average LTV',
      value: formatCurrency(data.avgPredictedLTV || 0),
      subtitle: `Historical: ${formatCurrency(data.avgHistoricalLTV || 0)}`,
      icon: CurrencyDollarIcon,
      color: COLORS.GREEN[500],
      background: `linear-gradient(135deg, ${COLORS.GREEN[500]}20, ${COLORS.GREEN[500]}10)`,
      change: data.avgPredictedLTV > data.avgHistoricalLTV ? 'up' : 'neutral',
      changeValue: data.avgHistoricalLTV > 0 
        ? ((data.avgPredictedLTV - data.avgHistoricalLTV) / data.avgHistoricalLTV * 100).toFixed(1)
        : 0
    },
    {
      id: 'ltv_cac',
      title: 'LTV:CAC Ratio',
      value: `${(data.ltvCacRatio || 0).toFixed(1)}x`,
      subtitle: `Target: 3.0x+`,
      icon: ArrowTrendingUpIcon,
      color: data.ltvCacRatio >= 3 ? COLORS.GREEN[500] : data.ltvCacRatio >= 1 ? COLORS.YELLOW[600] : COLORS.RED[500],
      background: data.ltvCacRatio >= 3 
        ? `linear-gradient(135deg, ${COLORS.GREEN[500]}20, ${COLORS.GREEN[500]}10)`
        : data.ltvCacRatio >= 1 
        ? `linear-gradient(135deg, ${COLORS.YELLOW[600]}20, ${COLORS.YELLOW[600]}10)`
        : `linear-gradient(135deg, ${COLORS.RED[500]}20, ${COLORS.RED[500]}10)`,
      change: data.ltvCacRatio >= 3 ? 'up' : data.ltvCacRatio >= 1 ? 'neutral' : 'down'
    },
    {
      id: 'repeat_rate',
      title: 'Repeat Purchase Rate',
      value: formatPercent(data.repeatPurchaseRate || 0),
      subtitle: `${formatNumber(data.returningCustomers)} returning customers`,
      icon: UsersIcon,
      color: data.repeatPurchaseRate >= 30 ? COLORS.BLUE[500] : data.repeatPurchaseRate >= 15 ? COLORS.YELLOW[600] : COLORS.ORANGE[500],
      background: data.repeatPurchaseRate >= 30
        ? `linear-gradient(135deg, ${COLORS.BLUE[500]}20, ${COLORS.BLUE[500]}10)`
        : data.repeatPurchaseRate >= 15
        ? `linear-gradient(135deg, ${COLORS.YELLOW[600]}20, ${COLORS.YELLOW[600]}10)`
        : `linear-gradient(135deg, ${COLORS.ORANGE[500]}20, ${COLORS.ORANGE[500]}10)`,
      change: data.repeatPurchaseRate >= 30 ? 'up' : 'neutral'
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      value: formatCurrency(data.avgOrderValue || 0),
      subtitle: `${formatNumber(data.totalOrders)} total orders`,
      icon: ShoppingCartIcon,
      color: COLORS.PURPLE[500],
      background: `linear-gradient(135deg, ${COLORS.PURPLE[500]}20, ${COLORS.PURPLE[500]}10)`,
      change: 'neutral'
    },
    {
      id: 'cac',
      title: 'Customer Acquisition Cost',
      value: formatCurrency(data.cac || 0),
      subtitle: `${formatNumber(data.newCustomers)} new customers`,
      icon: CurrencyDollarIcon,
      color: COLORS.RED[500],
      background: `linear-gradient(135deg, ${COLORS.RED[500]}20, ${COLORS.RED[500]}10)`,
      change: 'down' // Lower CAC is better
    },
    {
      id: 'total_customers',
      title: 'Total Customers',
      value: formatNumber(data.totalCustomers || 0),
      subtitle: `${formatNumber(data.newCustomers)} new in period`,
      icon: UsersIcon,
      color: COLORS.CYAN[500],
      background: `linear-gradient(135deg, ${COLORS.CYAN[500]}20, ${COLORS.CYAN[500]}10)`,
      change: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <div
            key={card.id}
            className="group relative overflow-hidden rounded-2xl p-5 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer"
            style={{ 
              background: card.background,
              border: `1px solid ${card.color}40`,
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            {/* Icon */}
            <div 
              className="flex-shrink-0 p-2 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300"
              style={{ background: `${card.color}20` }}
            >
              <IconComponent 
                className="h-5 w-5" 
                style={{ color: card.color }}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {card.title}
              </p>
              
              <div className="flex items-end justify-between">
                <p 
                  className="text-xl lg:text-2xl font-bold leading-none"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>
                
                {card.change !== 'neutral' && card.changeValue && card.changeValue !== '0.0' && (
                  <div className="flex items-center gap-1">
                    {card.change === 'up' ? (
                      <ArrowUpIcon className="h-3 w-3" style={{ color: COLORS.GREEN[500] }} />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" style={{ color: COLORS.RED[500] }} />
                    )}
                    <span 
                      className="text-xs font-medium"
                      style={{ color: card.change === 'up' ? COLORS.GREEN[500] : COLORS.RED[500] }}
                    >
                      {Math.abs(card.changeValue)}%
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-xs leading-tight" style={{ color: colors.textSecondary }}>
                {card.subtitle}
              </p>
            </div>

            {/* Subtle hover effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none"
            />

            {/* Special indicators for important metrics */}
            {card.id === 'ltv_cac' && data.ltvCacRatio >= 3 && (
              <div className="absolute top-2 right-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: COLORS.GREEN[500] }}
                />
              </div>
            )}
            
            {card.id === 'repeat_rate' && data.repeatPurchaseRate >= 40 && (
              <div className="absolute top-2 right-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: COLORS.BLUE[500] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Add CSS animation keyframes (inject into document head)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}