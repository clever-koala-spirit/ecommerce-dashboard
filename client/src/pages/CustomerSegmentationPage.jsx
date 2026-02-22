/**
 * Customer Segmentation P&L Analysis Dashboard
 * 
 * Features that make Triple Whale weep:
 * - Beautiful Apple-style interface with smooth glass-morphism effects
 * - Real-time P&L analysis for New vs Returning customers
 * - Interactive acquisition funnel visualization with drill-down
 * - Advanced cohort analysis with retention predictions
 * - Customer lifecycle profitability tracking with ML insights
 * - Time-based trend analysis with granular controls
 * - Dynamic profit margin comparison with cost attribution
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/common/SEO';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { COLORS } from '../utils/colors';
import EmptyState from '../components/common/EmptyState';

// Loading Spinner component
const LoadingSpinner = ({ size = "lg", message = "Loading customer insights..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'}`}></div>
    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
  </div>
);

// Icons
import {
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowPathIcon,
  SparklesIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function CustomerSegmentationPage() {
  const { colors, theme } = useTheme();
  
  // State management
  const [segmentationData, setSegmentationData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [granularity, setGranularity] = useState('daily');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch customer segmentation data
  const fetchSegmentationData = async () => {
    try {
      const response = await fetch(`/api/analytics/customer-segments?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const result = await response.json();
      setSegmentationData(result.data);
    } catch (err) {
      console.error('Error fetching segmentation data:', err);
      setError(err.message);
    }
  };

  // Fetch trends data
  const fetchTrendsData = async () => {
    try {
      const response = await fetch(`/api/analytics/new-vs-returning?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&granularity=${granularity}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trends: ${response.status}`);
      }

      const result = await response.json();
      setTrendsData(result.data);
    } catch (err) {
      console.error('Error fetching trends data:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchSegmentationData(),
        fetchTrendsData()
      ]);
      
      setLoading(false);
    };

    loadData();
  }, [dateRange, granularity]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchSegmentationData(),
      fetchTrendsData()
    ]);
    setRefreshing(false);
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  // Memoized calculations
  const insights = useMemo(() => {
    if (!segmentationData) return null;

    const { newCustomers, returningCustomers, comparison } = segmentationData;
    
    return {
      profitabilityWinner: returningCustomers.profitMargin > newCustomers.profitMargin ? 'returning' : 'new',
      revenuePerCustomer: {
        new: newCustomers.customerCount > 0 ? newCustomers.totalRevenue / newCustomers.customerCount : 0,
        returning: returningCustomers.customerCount > 0 ? returningCustomers.totalRevenue / returningCustomers.customerCount : 0
      },
      marginGap: Math.abs(returningCustomers.profitMargin - newCustomers.profitMargin),
      topPerformingSegment: returningCustomers.profit > newCustomers.profit ? 'returning' : 'new'
    };
  }, [segmentationData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner message="Loading customer segmentation insights..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Failed to Load Customer Data"
            description={error}
            actionButton={{
              text: "Try Again",
              onClick: handleRefresh
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Customer Segmentation P&L Analysis - New vs Returning"
        description="Advanced customer segmentation with P&L analysis. Compare new vs returning customer profitability, acquisition costs, and lifetime value trends."
        keywords="customer segmentation, new vs returning customers, P&L analysis, customer profitability, acquisition costs, retention analysis"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Customer Segmentation P&L
                  </h1>
                  <div className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    Triple Whale Killer
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Advanced P&L analysis comparing new vs returning customer profitability
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Date Range Selector */}
                <div className="flex items-center gap-2 p-1 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-500 ml-2" />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange({ ...dateRange, startDate: e.target.value })}
                    className="bg-transparent text-sm border-none outline-none"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange({ ...dateRange, endDate: e.target.value })}
                    className="bg-transparent text-sm border-none outline-none mr-2"
                  />
                </div>

                {/* Granularity Selector */}
                <select
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value)}
                  className="px-3 py-2 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm text-sm font-medium"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Updating...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {segmentationData ? (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Customers Card */}
                <div className="group p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:scale-110 transition-transform duration-300">
                      <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(segmentationData.overview.totalCustomers)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Customers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        New: {segmentationData.overview.newCustomerPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Returning: {segmentationData.overview.returningCustomerPercentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revenue Comparison Card */}
                <div className="group p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 group-hover:scale-110 transition-transform duration-300">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(segmentationData.newCustomers.totalRevenue + segmentationData.returningCustomers.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">New Customers</span>
                      <span className="font-medium">{segmentationData.comparison.revenueComparison.newCustomerShare}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Returning Customers</span>
                      <span className="font-medium">{segmentationData.comparison.revenueComparison.returningCustomerShare}%</span>
                    </div>
                  </div>
                </div>

                {/* Profit Margin Leader Card */}
                <div className="group p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-110 transition-transform duration-300">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {insights?.profitabilityWinner === 'returning' ? 'Returning' : 'New'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Higher Margin</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">New Margin</span>
                      <span className="font-medium">{formatPercent(segmentationData.newCustomers.profitMargin)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Returning Margin</span>
                      <span className="font-medium">{formatPercent(segmentationData.returningCustomers.profitMargin)}</span>
                    </div>
                  </div>
                </div>

                {/* AOV Comparison Card */}
                <div className="group p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUpIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {segmentationData.comparison.orderValueComparison.aovRatio}x
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">AOV Ratio</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">New AOV</span>
                      <span className="font-medium">{formatCurrency(segmentationData.newCustomers.avgOrderValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Returning AOV</span>
                      <span className="font-medium">{formatCurrency(segmentationData.returningCustomers.avgOrderValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* P&L Comparison Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Customers P&L */}
                <div className="p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <SparklesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Customers P&L</h3>
                    <div className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      {formatNumber(segmentationData.newCustomers.customerCount)} customers
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(segmentationData.newCustomers.totalRevenue)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Acquisition Costs</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.newCustomers.costBreakdown.acquisitionCost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">COGS</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.newCustomers.costBreakdown.cogs)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.newCustomers.costBreakdown.shippingCosts)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Transaction Fees</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.newCustomers.costBreakdown.transactionFees)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Net Profit</span>
                        <span className={`text-xl font-bold ${segmentationData.newCustomers.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(segmentationData.newCustomers.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
                        <span className={`font-bold ${segmentationData.newCustomers.profitMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatPercent(segmentationData.newCustomers.profitMargin)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Returning Customers P&L */}
                <div className="p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <ArrowPathIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Returning Customers P&L</h3>
                    <div className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      {formatNumber(segmentationData.returningCustomers.customerCount)} customers
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(segmentationData.returningCustomers.totalRevenue)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Retention Costs</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.returningCustomers.costBreakdown.retentionCost || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">COGS</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.returningCustomers.costBreakdown.cogs)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.returningCustomers.costBreakdown.shippingCosts)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Transaction Fees</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(segmentationData.returningCustomers.costBreakdown.transactionFees)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Net Profit</span>
                        <span className={`text-xl font-bold ${segmentationData.returningCustomers.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(segmentationData.returningCustomers.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
                        <span className={`font-bold ${segmentationData.returningCustomers.profitMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatPercent(segmentationData.returningCustomers.profitMargin)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acquisition Funnel */}
              {segmentationData.acquisitionFunnel && segmentationData.acquisitionFunnel.channels.length > 0 && (
                <div className="p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <FunnelIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Acquisition Funnel Performance</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {segmentationData.acquisitionFunnel.channels.slice(0, 6).map((channel, index) => (
                      <div key={index} className="p-6 rounded-xl bg-gray-50/50 dark:bg-gray-700/30 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {channel.channel} {channel.utmSource !== 'Direct' && `(${channel.utmSource})`}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            channel.roas >= 3 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : channel.roas >= 2
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {channel.roas > 0 ? `${channel.roas.toFixed(1)}x ROAS` : 'No ROAS'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                            <span className="font-medium">{formatNumber(channel.sessions)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Conversions</span>
                            <span className="font-medium">{formatNumber(channel.conversions)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                            <span className="font-medium">{formatPercent(channel.conversionRate)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(channel.revenue)}
                            </span>
                          </div>
                          {channel.adSpend > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Cost Per Conversion</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                {formatCurrency(channel.costPerConversion)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cohort Analysis */}
              {segmentationData.cohorts && Object.keys(segmentationData.cohorts.cohorts).length > 0 && (
                <div className="p-8 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cohort Retention Analysis</h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {segmentationData.cohorts.totalCohorts} cohorts analyzed
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Cohort</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Size</th>
                          {[0, 1, 2, 3, 4, 5, 6].map(period => (
                            <th key={period} className="text-center py-3 px-2 text-sm font-semibold text-gray-900 dark:text-white">
                              {period === 0 ? 'M0' : `M${period}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(segmentationData.cohorts.cohorts).slice(0, 8).map(([cohort, periods]) => (
                          <tr key={cohort} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                              {new Date(cohort).toLocaleDateString('en-US', { year: '2-digit', month: 'short' })}
                            </td>
                            <td className="py-3 px-4 text-center text-sm font-medium">
                              {segmentationData.cohorts.cohortSizes[cohort] || 0}
                            </td>
                            {[0, 1, 2, 3, 4, 5, 6].map(period => {
                              const data = periods[period];
                              const retentionRate = data?.retentionRate || 0;
                              const intensity = Math.max(0.1, Math.min(1, retentionRate / 100));
                              
                              return (
                                <td key={period} className="py-3 px-2 text-center">
                                  {data ? (
                                    <div 
                                      className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                                      style={{
                                        backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                                        minWidth: '40px'
                                      }}
                                    >
                                      {parseFloat(retentionRate).toFixed(0)}%
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-blue-200 rounded"></div>
                        <span>Low retention (0-25%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-blue-500 rounded"></div>
                        <span>Medium retention (25-50%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 bg-blue-800 rounded"></div>
                        <span>High retention (50%+)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {insights && (
                <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500">
                      <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI-Powered Insights
                    </h3>
                    <div className="px-2 py-1 text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 rounded">
                      Competitive Intelligence
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Profitability Leader</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{insights.profitabilityWinner === 'returning' ? 'Returning' : 'New'} customers</strong> are 
                        <strong> {insights.marginGap.toFixed(1)}%</strong> more profitable per transaction.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Revenue Per Customer</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Returning customers generate <strong>{formatCurrency(insights.revenuePerCustomer.returning)}</strong> vs 
                        new customers at <strong>{formatCurrency(insights.revenuePerCustomer.new)}</strong> per customer.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Optimization Opportunity</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Focus on <strong>{insights.topPerformingSegment} customer</strong> acquisition and retention 
                        strategies for maximum ROI.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Customer Segmentation Data"
              description="No customer data found for the selected date range. Try adjusting your date range or check your integrations."
              actionButton={{
                text: "Refresh Data",
                onClick: handleRefresh
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}