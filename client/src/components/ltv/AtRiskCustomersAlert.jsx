/**
 * At-Risk Customers Alert Component
 * Critical alert banner for customers at risk of churning
 */

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import {
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function AtRiskCustomersAlert({ customers = [] }) {
  const { colors, theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!customers?.length || isDismissed) return null;

  // Sort customers by predicted LTV (highest value at risk first)
  const sortedCustomers = customers
    .sort((a, b) => (b.predictedLTV || 0) - (a.predictedLTV || 0))
    .slice(0, 10); // Show top 10 at-risk customers

  const totalAtRiskValue = sortedCustomers.reduce((sum, c) => sum + (c.predictedLTV || 0), 0);
  const criticalCustomers = sortedCustomers.filter(c => c.risk === 'Critical').length;
  const highRiskCustomers = sortedCustomers.filter(c => c.risk === 'High').length;

  return (
    <div 
      className="rounded-2xl border-2 p-4 animate-pulse-subtle"
      style={{ 
        background: `linear-gradient(135deg, ${COLORS.RED[50]}, ${COLORS.ORANGE[50]})`,
        borderColor: COLORS.RED[200],
        borderLeft: `6px solid ${COLORS.RED[500]}`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-xl animate-bounce-subtle"
            style={{ background: COLORS.RED[500] }}
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold" style={{ color: COLORS.RED[700] }}>
              ⚠️ Customer Churn Alert
            </h3>
            <p className="text-sm" style={{ color: COLORS.RED[600] }}>
              {customers.length} high-value customers at risk • 
              Potential lost revenue: {formatCurrency(totalAtRiskValue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              background: COLORS.RED[500], 
              color: 'white',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}
          >
            {isExpanded ? 'Collapse' : 'View Details'}
            {isExpanded ? 
              <ChevronDownIcon className="h-4 w-4" /> : 
              <ChevronRightIcon className="h-4 w-4" />
            }
          </button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
            style={{ color: COLORS.RED[500] }}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <p className="text-sm font-medium" style={{ color: COLORS.RED[600] }}>
            Critical Risk
          </p>
          <p className="text-xl font-bold" style={{ color: COLORS.RED[700] }}>
            {criticalCustomers}
          </p>
        </div>
        
        <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
          <p className="text-sm font-medium" style={{ color: COLORS.ORANGE[600] }}>
            High Risk
          </p>
          <p className="text-xl font-bold" style={{ color: COLORS.ORANGE[700] }}>
            {highRiskCustomers}
          </p>
        </div>
        
        <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
          <p className="text-sm font-medium" style={{ color: COLORS.GREEN[600] }}>
            Recoverable Value
          </p>
          <p className="text-xl font-bold" style={{ color: COLORS.GREEN[700] }}>
            {formatCurrency(totalAtRiskValue * 0.3)} {/* Assume 30% recovery rate */}
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-6 space-y-4">
          <div className="border-t pt-4" style={{ borderColor: COLORS.RED[200] }}>
            <h4 className="text-md font-semibold mb-3" style={{ color: COLORS.RED[700] }}>
              Immediate Action Required
            </h4>
            
            <div className="grid gap-3">
              {sortedCustomers.slice(0, 5).map((customer, index) => (
                <div 
                  key={customer.customerId}
                  className="flex items-center justify-between p-3 rounded-lg hover:scale-[1.01] transition-transform cursor-pointer"
                  style={{ 
                    background: theme === 'light' ? 'white' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${COLORS.RED[200]}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ 
                        background: customer.risk === 'Critical' ? COLORS.RED[500] : COLORS.ORANGE[500] 
                      }}
                    >
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" style={{ color: colors.textSecondary }} />
                        <span className="text-sm font-medium" style={{ color: colors.text }}>
                          Customer #{customer.customerId?.toString().slice(-8)}
                        </span>
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ 
                            background: customer.risk === 'Critical' ? COLORS.RED[100] : COLORS.ORANGE[100],
                            color: customer.risk === 'Critical' ? COLORS.RED[700] : COLORS.ORANGE[700]
                          }}
                        >
                          {customer.risk} Risk
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: colors.textSecondary }}>
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="h-3 w-3" />
                          <span>LTV: {formatCurrency(customer.predictedLTV)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            Last order: {customer.lastOrderDate ? 
                              Math.round((new Date() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24)) + 'd ago' :
                              'Never'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: COLORS.GREEN[600] }}>
                      {formatCurrency(customer.predictedLTV * 0.3)}
                    </p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      recoverable
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: COLORS.RED[200] }}>
            <button 
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                background: COLORS.RED[500], 
                color: 'white',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
            >
              🎯 Launch Win-Back Campaign
            </button>
            
            <button 
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                background: COLORS.ORANGE[500], 
                color: 'white',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              📧 Send Personalized Offers
            </button>
            
            <button 
              className="py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                background: colors.bg, 
                color: colors.text,
                border: `1px solid ${colors.border}`
              }}
            >
              📊 View Full Analysis
            </button>
          </div>

          {/* Pro Tip */}
          <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: `1px solid ${COLORS.BLUE[200]}` }}>
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: COLORS.BLUE[700] }}>
              💡 <strong>Pro Tip:</strong> 
              Customers with 70%+ churn probability but high LTV should receive immediate personal outreach. 
              A 30% win-back rate can recover {formatCurrency(totalAtRiskValue * 0.3)} in revenue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Add CSS for subtle animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.95; }
    }
    
    @keyframes bounce-subtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    
    .animate-pulse-subtle {
      animation: pulse-subtle 3s infinite;
    }
    
    .animate-bounce-subtle {
      animation: bounce-subtle 2s infinite;
    }
  `;
  if (!document.querySelector('style[data-ltv-animations]')) {
    style.setAttribute('data-ltv-animations', 'true');
    document.head.appendChild(style);
  }
}