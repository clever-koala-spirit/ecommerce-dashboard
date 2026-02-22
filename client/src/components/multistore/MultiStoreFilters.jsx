import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Building2, 
  BarChart3,
  ChevronDown 
} from 'lucide-react';

const TIME_RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' }
];

const METRICS = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'orders', label: 'Orders' },
  { value: 'customers', label: 'Customers' },
  { value: 'conversion_rate', label: 'Conversion Rate' },
  { value: 'avg_order_value', label: 'Average Order Value' },
  { value: 'profit_margin', label: 'Profit Margin' }
];

const MultiStoreFilters = ({
  timeRange,
  onTimeRangeChange,
  selectedStores,
  onStoresChange,
  stores = [],
  comparisonMetric,
  onMetricChange
}) => {
  const handleStoreToggle = (storeId) => {
    const newSelection = selectedStores.includes(storeId)
      ? selectedStores.filter(id => id !== storeId)
      : [...selectedStores, storeId];
    onStoresChange(newSelection);
  };

  const selectAllStores = () => {
    onStoresChange(stores.map(store => store.id));
  };

  const clearStores = () => {
    onStoresChange([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Time Range Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4" />
            <span>Period:</span>
          </div>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
            >
              {TIME_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <BarChart3 className="w-4 h-4" />
            <span>Metric:</span>
          </div>
          <div className="relative">
            <select
              value={comparisonMetric}
              onChange={(e) => onMetricChange(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
            >
              {METRICS.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Store Selector */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4" />
              <span>Stores:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllStores}
                className="px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-md transition-colors"
              >
                All
              </button>
              <button
                onClick={clearStores}
                className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                None
              </button>
            </div>

            <div className="flex-1 flex flex-wrap gap-2">
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => handleStoreToggle(store.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedStores.includes(store.id)
                      ? 'bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-600'
                  }`}
                >
                  {store.store_name || store.connected_shop}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Store Count */}
          {stores.length > 0 && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {selectedStores.length === 0
                ? `Showing all ${stores.length} stores`
                : `${selectedStores.length} of ${stores.length} stores selected`
              }
            </div>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Quick Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              High Performers
            </button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              Needs Attention
            </button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              Recent Growth
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MultiStoreFilters;