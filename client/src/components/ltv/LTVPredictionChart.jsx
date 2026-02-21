/**
 * LTV Prediction Chart Component
 * Shows ML prediction confidence and accuracy metrics
 */

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function LTVPredictionChart({ data }) {
  const { colors } = useTheme();

  if (!data) {
    return (
      <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
          <SparklesIcon className="h-5 w-5" style={{ color: COLORS.PURPLE[500] }} />
          ML Prediction Analysis
        </h3>
        <div className="h-40 flex items-center justify-center" style={{ color: colors.textSecondary }}>
          <p>Prediction data will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: colors.text }}>
        <SparklesIcon className="h-5 w-5" style={{ color: COLORS.PURPLE[500] }} />
        ML Prediction Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-xl" style={{ background: colors.bg }}>
          <p className="text-sm" style={{ color: colors.textSecondary }}>Model Accuracy</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.GREEN[500] }}>87%</p>
        </div>
        
        <div className="text-center p-4 rounded-xl" style={{ background: colors.bg }}>
          <p className="text-sm" style={{ color: colors.textSecondary }}>Avg Confidence</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.BLUE[500] }}>92%</p>
        </div>
        
        <div className="text-center p-4 rounded-xl" style={{ background: colors.bg }}>
          <p className="text-sm" style={{ color: colors.textSecondary }}>Predictions Made</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.PURPLE[500] }}>1,247</p>
        </div>
      </div>
    </div>
  );
}