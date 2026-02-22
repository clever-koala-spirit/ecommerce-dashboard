import React from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowRightLeft, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { formatNumber, formatCurrency } from '../../utils/formatters';

const InventoryOptimizationPanel = ({ optimization, stores = [] }) => {
  if (!optimization || optimization.recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center"
      >
        <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No Inventory Optimization Data
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Connect multiple stores to get inventory optimization recommendations
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Total Recommendations
            </h4>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {optimization.summary.totalRecommendations}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
              Estimated Impact
            </h4>
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(optimization.summary.estimatedImpact)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              Transfer Opportunities
            </h4>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {optimization.summary.transferOpportunities}
          </p>
        </motion.div>
      </div>

      {/* Recommendations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Inventory Optimization Recommendations
        </h3>

        <div className="space-y-4">
          {optimization.recommendations.slice(0, 5).map((rec, index) => (
            <motion.div
              key={rec.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                {rec.recommendation_type === 'transfer' ? (
                  <ArrowRightLeft className="w-4 h-4 text-violet-600" />
                ) : rec.recommendation_type === 'restock' ? (
                  <Package className="w-4 h-4 text-blue-600" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {rec.recommendation_type === 'transfer' ? 'Transfer Recommendation' :
                       rec.recommendation_type === 'restock' ? 'Restock Recommendation' :
                       'Optimization Suggestion'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Product ID: {rec.product_id}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rec.confidence_score >= 0.8 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    rec.confidence_score >= 0.6 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {Math.round((rec.confidence_score || 0) * 100)}% confidence
                  </span>
                </div>

                {rec.from_store && rec.to_store && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>From: <strong>{rec.from_store}</strong></span>
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>To: <strong>{rec.to_store}</strong></span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {rec.quantity_recommended && (
                      <span className="text-slate-700 dark:text-slate-300">
                        Qty: <strong>{formatNumber(rec.quantity_recommended)}</strong>
                      </span>
                    )}
                    {rec.estimated_impact && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Impact: <strong>{formatCurrency(rec.estimated_impact)}</strong>
                      </span>
                    )}
                  </div>
                  <button className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {optimization.recommendations.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
              View All {optimization.recommendations.length} Recommendations
            </button>
          </div>
        )}
      </motion.div>

      {/* Transfer Matrix */}
      {optimization.transferMatrix && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Inter-Store Transfer Matrix
          </h3>
          
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(optimization.transferMatrix || {}).map(([fromStore, transfers]) => (
                <div key={fromStore} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    From: {fromStore}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(transfers).map(([toStore, value]) => (
                      <div key={toStore} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          To {toStore}:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatNumber(value)} items
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {optimization.insights && optimization.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Key Insights
            </h3>
          </div>
          <div className="space-y-3">
            {optimization.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  {insight.message || insight}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InventoryOptimizationPanel;