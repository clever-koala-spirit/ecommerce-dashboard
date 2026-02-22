import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

const StoreRankingsTable = ({ rankings, onStoreSelect }) => {
  if (!rankings?.rankings || rankings.rankings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center"
      >
        <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No Rankings Available
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Connect stores to see performance rankings
        </p>
      </motion.div>
    );
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-600 dark:text-slate-400">#{rank}</span>;
  };

  const getPerformanceColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'B': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'C': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'D': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-700/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Store Performance Rankings
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Ranked by {rankings.metric} • {rankings.totalStores} stores total
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Average</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(rankings.averageValue || 0)}
          </p>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Rank</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Store</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {rankings.metric === 'revenue' ? 'Revenue' :
                 rankings.metric === 'orders' ? 'Orders' :
                 rankings.metric === 'customers' ? 'Customers' :
                 rankings.metric === 'conversion_rate' ? 'Conversion' :
                 rankings.metric}
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Trend</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Grade</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rankings.rankings.map((store, index) => (
              <motion.tr
                key={store.storeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                {/* Rank */}
                <td className="py-4 px-2">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(store.rank)}
                  </div>
                </td>

                {/* Store Info */}
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {store.storeName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {store.domain}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Metric Value */}
                <td className="py-4 px-2 text-right">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {rankings.metric === 'revenue' ? formatCurrency(store.metricValue) :
                     rankings.metric === 'orders' ? formatNumber(store.metricValue) :
                     rankings.metric === 'customers' ? formatNumber(store.metricValue) :
                     rankings.metric === 'conversion_rate' ? formatPercent(store.metricValue) :
                     formatNumber(store.metricValue)}
                  </p>
                </td>

                {/* Trend */}
                <td className="py-4 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {store.changeFromPreviousPeriod > 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : store.changeFromPreviousPeriod < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`text-sm font-medium ${
                      store.changeFromPreviousPeriod > 0 ? 'text-emerald-600' :
                      store.changeFromPreviousPeriod < 0 ? 'text-red-500' :
                      'text-slate-500'
                    }`}>
                      {store.changeFromPreviousPeriod !== undefined 
                        ? `${Math.abs(store.changeFromPreviousPeriod).toFixed(1)}%`
                        : '—'
                      }
                    </span>
                  </div>
                </td>

                {/* Performance Grade */}
                <td className="py-4 px-2 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPerformanceColor(store.performanceGrade)}`}>
                    {store.performanceGrade || 'B'}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-2 text-right">
                  <button
                    onClick={() => onStoreSelect && onStoreSelect([store.storeId])}
                    className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Performer Callout */}
      {rankings.topPerformer && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-emerald-600" />
            <div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                Top Performer: {rankings.topPerformer.storeName}
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Leading with {formatCurrency(rankings.topPerformer.metricValue)} in {rankings.metric}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StoreRankingsTable;