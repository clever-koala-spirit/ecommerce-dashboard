import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Plus,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Zap,
  Target,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { useMultiStore } from '../hooks/useMultiStore';
import StoreComparisonChart from '../components/multistore/StoreComparisonChart';
import ConsolidatedMetricsView from '../components/multistore/ConsolidatedMetricsView';
import StoreRankingsTable from '../components/multistore/StoreRankingsTable';
import InventoryOptimizationPanel from '../components/multistore/InventoryOptimizationPanel';
import StoreConnectionModal from '../components/multistore/StoreConnectionModal';
import MultiStoreFilters from '../components/multistore/MultiStoreFilters';
import ExportModal from '../components/multistore/ExportModal';

const MultiStoreManagementPage = () => {
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedStores, setSelectedStores] = useState([]);
  const [comparisonMetric, setComparisonMetric] = useState('revenue');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    overview,
    consolidated,
    rankings,
    inventoryOptimization,
    loading,
    error,
    refreshData,
    connectStore,
    disconnectStore,
    exportData
  } = useMultiStore({ timeRange });

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loading, refreshData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const performanceMetrics = useMemo(() => {
    if (!overview?.consolidatedMetrics) return null;

    const metrics = overview.consolidatedMetrics;
    return [
      {
        key: 'revenue',
        label: 'Total Revenue',
        value: formatCurrency(metrics.revenue),
        change: 12.5, // Would calculate from trends
        icon: DollarSign,
        color: 'text-emerald-600'
      },
      {
        key: 'orders',
        label: 'Total Orders',
        value: formatNumber(metrics.orders),
        change: 8.3,
        icon: ShoppingCart,
        color: 'text-blue-600'
      },
      {
        key: 'customers',
        label: 'Active Customers',
        value: formatNumber(metrics.customers),
        change: 15.7,
        icon: Users,
        color: 'text-purple-600'
      },
      {
        key: 'aov',
        label: 'Average Order Value',
        value: formatCurrency(metrics.avg_order_value),
        change: -2.1,
        icon: Target,
        color: 'text-orange-600'
      }
    ];
  }, [overview]);

  if (loading && !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                    Multi-Store Management
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {overview?.totalStores || 0} stores connected • Last updated {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={() => setShowConnectionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Connect Store
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Performance Overview Cards */}
        {performanceMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${metric.color} bg-opacity-10 flex items-center justify-center`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {metric.change > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {Math.abs(metric.change)}% vs last period
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'comparison', label: 'Store Comparison', icon: PieChart },
              { key: 'consolidated', label: 'Consolidated View', icon: Target },
              { key: 'rankings', label: 'Performance Rankings', icon: TrendingUp },
              { key: 'inventory', label: 'Inventory Optimization', icon: Package }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeView === tab.key
                    ? 'text-violet-600 border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <MultiStoreFilters
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          selectedStores={selectedStores}
          onStoresChange={setSelectedStores}
          stores={overview?.stores || []}
          comparisonMetric={comparisonMetric}
          onMetricChange={setComparisonMetric}
        />

        {/* Active View Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'overview' && (
              <StoreOverview 
                overview={overview} 
                onStoreSelect={setSelectedStores}
                selectedStores={selectedStores}
              />
            )}

            {activeView === 'comparison' && (
              <StoreComparisonChart
                stores={overview?.stores || []}
                selectedStores={selectedStores}
                metric={comparisonMetric}
                timeRange={timeRange}
              />
            )}

            {activeView === 'consolidated' && (
              <ConsolidatedMetricsView
                consolidated={consolidated}
                timeRange={timeRange}
              />
            )}

            {activeView === 'rankings' && (
              <StoreRankingsTable
                rankings={rankings}
                onStoreSelect={setSelectedStores}
              />
            )}

            {activeView === 'inventory' && (
              <InventoryOptimizationPanel
                optimization={inventoryOptimization}
                stores={overview?.stores || []}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Alerts Section */}
        {overview?.alerts && overview.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                Multi-Store Alerts
              </h3>
            </div>
            <div className="space-y-3">
              {overview.alerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-sm">{alert.message}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <StoreConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        onConnect={connectStore}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportData}
        stores={overview?.stores || []}
        timeRange={timeRange}
      />
    </div>
  );
};

// Store Overview Component
const StoreOverview = ({ overview, onStoreSelect, selectedStores }) => {
  if (!overview?.stores?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No Stores Connected
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          Connect your first store to start managing multiple locations from a single dashboard.
        </p>
        <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
          Connect Your First Store
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {overview.stores.map((store, index) => (
        <motion.div
          key={store.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 overflow-hidden"
        >
          <div className="p-6">
            {/* Store Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {store.store_name || store.connected_shop}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {store.connected_shop}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  store.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
                <span className={`text-xs font-medium ${
                  store.status === 'active' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {store.status}
                </span>
              </div>
            </div>

            {/* Store Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Revenue</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(store.metrics?.revenue || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Orders</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatNumber(store.metrics?.orders || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Conversion</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatPercent(store.metrics?.conversion_rate || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">AOV</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(store.metrics?.avg_order_value || 0)}
                </p>
              </div>
            </div>

            {/* Store Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStoreSelect([...selectedStores, store.id])}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className={`h-1 ${
            (store.ranking?.rank || 0) <= 3 ? 'bg-emerald-500' :
            (store.ranking?.rank || 0) <= 6 ? 'bg-amber-500' : 'bg-red-500'
          }`} />
        </motion.div>
      ))}
    </div>
  );
};

export default MultiStoreManagementPage;