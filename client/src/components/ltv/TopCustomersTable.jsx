/**
 * Top Customers Table Component
 * Interactive table showing highest LTV customers with detailed metrics
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import {
  StarIcon,
  EyeIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function TopCustomersTable({ customers = [], onCustomerClick }) {
  const { colors, theme } = useTheme();
  const [sortField, setSortField] = useState('predictedLTV');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  // Filter and sort customers
  const processedCustomers = useMemo(() => {
    let filtered = customers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(customer => 
        customer.customerId?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter(customer => customer.tier === filterTier);
    }

    // Sort customers
    filtered.sort((a, b) => {
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered.slice(0, 50); // Limit to top 50 for performance
  }, [customers, searchQuery, filterTier, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get tier styling
  const getTierStyling = (tier) => {
    const styles = {
      'Platinum': { color: COLORS.PURPLE[500], bg: `${COLORS.PURPLE[500]}20` },
      'Gold': { color: COLORS.YELLOW[600], bg: `${COLORS.YELLOW[600]}20` },
      'Silver': { color: COLORS.GRAY[500], bg: `${COLORS.GRAY[500]}20` },
      'Bronze': { color: COLORS.ORANGE[500], bg: `${COLORS.ORANGE[500]}20` }
    };
    return styles[tier] || { color: colors.textSecondary, bg: colors.bg };
  };

  // Get risk styling
  const getRiskStyling = (risk) => {
    const styles = {
      'Low': { color: COLORS.GREEN[500], bg: `${COLORS.GREEN[500]}20` },
      'Medium': { color: COLORS.YELLOW[600], bg: `${COLORS.YELLOW[600]}20` },
      'High': { color: COLORS.ORANGE[500], bg: `${COLORS.ORANGE[500]}20` },
      'Critical': { color: COLORS.RED[500], bg: `${COLORS.RED[500]}20` }
    };
    return styles[risk] || { color: colors.textSecondary, bg: colors.bg };
  };

  // Column configuration
  const columns = [
    { 
      id: 'rank', 
      label: '#', 
      width: 'w-12',
      render: (customer, index) => (
        <div className="flex items-center justify-center">
          {index < 3 ? (
            <TrophyIcon 
              className="h-4 w-4" 
              style={{ color: index === 0 ? COLORS.YELLOW[600] : index === 1 ? COLORS.GRAY[500] : COLORS.ORANGE[500] }}
            />
          ) : (
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              {index + 1}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'customerId',
      label: 'Customer ID',
      sortable: false,
      width: 'w-32',
      render: (customer) => (
        <div>
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            {customer.customerId?.toString().slice(-8) || 'Unknown'}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ background: getTierStyling(customer.tier).color }}
            />
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              {customer.tier}
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'predictedLTV',
      label: 'Predicted LTV',
      sortable: true,
      width: 'w-28',
      render: (customer) => (
        <div>
          <p className="text-sm font-bold" style={{ color: COLORS.GREEN[500] }}>
            {formatCurrency(customer.predictedLTV || 0)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div 
              className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"
              style={{ background: colors.border }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (customer.confidence || 0) * 100)}%`,
                  background: customer.confidence > 0.7 ? COLORS.GREEN[500] : 
                             customer.confidence > 0.4 ? COLORS.YELLOW[600] : COLORS.RED[500]
                }}
              />
            </div>
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              {Math.round((customer.confidence || 0) * 100)}%
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'historicalLTV',
      label: 'Historical LTV',
      sortable: true,
      width: 'w-28',
      render: (customer) => (
        <div>
          <p className="text-sm font-mono" style={{ color: colors.text }}>
            {formatCurrency(customer.historicalLTV || 0)}
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            {formatNumber(customer.orderCount || 0)} orders
          </p>
        </div>
      )
    },
    {
      id: 'segment',
      label: 'Segment',
      sortable: true,
      width: 'w-24',
      render: (customer) => {
        const tierStyle = getTierStyling(customer.tier);
        return (
          <div>
            <span 
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ 
                color: tierStyle.color,
                background: tierStyle.bg 
              }}
            >
              {customer.segment}
            </span>
          </div>
        );
      }
    },
    {
      id: 'risk',
      label: 'Risk',
      sortable: true,
      width: 'w-20',
      render: (customer) => {
        const riskStyle = getRiskStyling(customer.risk);
        const RiskIcon = customer.risk === 'Critical' || customer.risk === 'High' 
          ? ExclamationTriangleIcon 
          : StarIcon;
        
        return (
          <div className="flex items-center gap-1">
            <RiskIcon className="h-3 w-3" style={{ color: riskStyle.color }} />
            <span 
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ 
                color: riskStyle.color,
                background: riskStyle.bg 
              }}
            >
              {customer.risk}
            </span>
          </div>
        );
      }
    },
    {
      id: 'churnProbability',
      label: 'Churn Risk',
      sortable: true,
      width: 'w-24',
      render: (customer) => {
        const churnPercent = (customer.churnProbability || 0) * 100;
        const churnColor = churnPercent > 70 ? COLORS.RED[500] :
                          churnPercent > 40 ? COLORS.YELLOW[600] : COLORS.GREEN[500];
        
        return (
          <div>
            <p className="text-sm font-medium" style={{ color: churnColor }}>
              {churnPercent.toFixed(0)}%
            </p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1" style={{ background: colors.border }}>
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${churnPercent}%`,
                  background: churnColor
                }}
              />
            </div>
          </div>
        );
      }
    },
    {
      id: 'lastOrderDate',
      label: 'Last Order',
      sortable: true,
      width: 'w-28',
      render: (customer) => (
        <div>
          <p className="text-sm" style={{ color: colors.text }}>
            {customer.lastOrderDate ? formatDate(new Date(customer.lastOrderDate)) : 'Never'}
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            {customer.avgDaysBetweenOrders 
              ? `~${Math.round(customer.avgDaysBetweenOrders)}d cycle`
              : 'One-time'
            }
          </p>
        </div>
      )
    },
    {
      id: 'actions',
      label: '',
      width: 'w-16',
      render: (customer) => (
        <button
          onClick={() => onCustomerClick?.(customer)}
          className="p-2 rounded-lg hover:scale-105 transition-all duration-200"
          style={{ 
            background: colors.bg,
            color: COLORS.BLUE[500]
          }}
          title="View customer details"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      )
    }
  ];

  const SortableHeader = ({ column }) => {
    if (!column.sortable) {
      return (
        <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
          {column.label}
        </span>
      );
    }

    return (
      <button
        onClick={() => handleSort(column.id)}
        className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
        style={{ color: colors.textSecondary }}
      >
        {column.label}
        {sortField === column.id && (
          sortDirection === 'asc' ? 
            <ChevronUpIcon className="h-3 w-3" /> : 
            <ChevronDownIcon className="h-3 w-3" />
        )}
      </button>
    );
  };

  if (!customers?.length) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <TrophyIcon className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: colors.textSecondary }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>No Customer Data</h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Customer data will appear here once you have orders.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
            <TrophyIcon className="h-5 w-5" style={{ color: COLORS.YELLOW[600] }} />
            Top Customers by LTV
          </h3>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Your highest lifetime value customers with ML predictions
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border text-sm w-48"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text
              }}
            />
          </div>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <option value="all">All Tiers</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
              {columns.map(column => (
                <th key={column.id} className={`text-left py-3 px-4 ${column.width}`}>
                  <SortableHeader column={column} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedCustomers.map((customer, index) => (
              <tr
                key={customer.customerId}
                className="group hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => onCustomerClick?.(customer)}
              >
                {columns.map(column => (
                  <td key={column.id} className={`py-4 px-4 ${column.width}`}>
                    {column.render(customer, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: colors.border }}>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Showing {processedCustomers.length} of {customers.length} customers
        </p>
        
        <div className="flex items-center gap-4 text-xs" style={{ color: colors.textSecondary }}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: COLORS.GREEN[500] }} />
            <span>Low churn risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: COLORS.YELLOW[600] }} />
            <span>Medium churn risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: COLORS.RED[500] }} />
            <span>High churn risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}