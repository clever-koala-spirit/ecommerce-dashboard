/**
 * Customer LTV Explorer Component
 * Interactive customer search and detailed LTV analysis
 */

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function CustomerLTVExplorer({ customers = [], onCustomerSelect, selectedCustomer }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.customerId?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer List */}
      <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: colors.text }}>
          <UserIcon className="h-5 w-5" style={{ color: COLORS.BLUE[500] }} />
          Customer Explorer
        </h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: colors.textSecondary }} />
          <input
            type="text"
            placeholder="Search by customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          />
        </div>

        {/* Customer List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCustomers.map(customer => (
            <div
              key={customer.customerId}
              onClick={() => onCustomerSelect(customer)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                selectedCustomer?.customerId === customer.customerId ? 'ring-2' : ''
              }`}
              style={{
                background: selectedCustomer?.customerId === customer.customerId 
                  ? `${COLORS.BLUE[500]}20` 
                  : colors.bg,
                ringColor: COLORS.BLUE[500],
                border: `1px solid ${selectedCustomer?.customerId === customer.customerId ? COLORS.BLUE[500] : colors.border}`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.text }}>
                    Customer #{customer.customerId?.toString().slice(-8)}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {customer.segment} • {customer.tier}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: COLORS.GREEN[500] }}>
                    {formatCurrency(customer.predictedLTV)}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    Predicted LTV
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Details */}
      <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: colors.text }}>
          <ChartBarIcon className="h-5 w-5" style={{ color: COLORS.GREEN[500] }} />
          Customer Details
        </h3>

        {selectedCustomer ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg" style={{ background: colors.bg }}>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Predicted LTV</p>
                <p className="text-xl font-bold" style={{ color: COLORS.GREEN[500] }}>
                  {formatCurrency(selectedCustomer.predictedLTV)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: colors.bg }}>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Historical LTV</p>
                <p className="text-xl font-bold" style={{ color: colors.text }}>
                  {formatCurrency(selectedCustomer.historicalLTV)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: colors.textSecondary }}>Order Count:</span>
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {formatNumber(selectedCustomer.orderCount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: colors.textSecondary }}>Segment:</span>
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {selectedCustomer.segment}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: colors.textSecondary }}>Tier:</span>
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {selectedCustomer.tier}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: colors.textSecondary }}>Risk Level:</span>
                <span 
                  className="text-sm font-medium px-2 py-1 rounded"
                  style={{ 
                    color: selectedCustomer.risk === 'High' || selectedCustomer.risk === 'Critical' 
                      ? COLORS.RED[700] : COLORS.GREEN[700],
                    background: selectedCustomer.risk === 'High' || selectedCustomer.risk === 'Critical'
                      ? COLORS.RED[100] : COLORS.GREEN[100]
                  }}
                >
                  {selectedCustomer.risk}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: colors.textSecondary }}>
            <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a customer to view detailed LTV analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}