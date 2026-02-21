/**
 * Enhanced Prediction Widget - Human-Centered Design
 * Large fonts, clear recommendations, "Do this now" buttons
 * Apple-style mobile-first interface with drag/drop support
 */

import { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  Target,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  GripVertical
} from 'lucide-react';

const iconMap = {
  Zap,
  TrendingUp, 
  Clock,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
};

export default function PredictionWidget({ 
  prediction, 
  type, 
  onActionClick,
  onRefresh,
  className = "",
  draggable = true,
  realTimeUpdate = true
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time update every 30 seconds
  useEffect(() => {
    if (!realTimeUpdate) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      if (onRefresh) {
        onRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [realTimeUpdate, onRefresh]);

  if (!prediction || !prediction.widget_config) {
    return null;
  }

  const { widget_config } = prediction;
  const Icon = iconMap[widget_config.icon] || AlertCircle;

  // Handle action button click
  const handleActionClick = async () => {
    if (onActionClick) {
      setIsRefreshing(true);
      try {
        await onActionClick(type, prediction.action_button);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Get confidence indicator colors (traffic light system)
  const getConfidenceStyles = () => {
    switch (prediction.confidence) {
      case 'green':
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          accentColor: 'bg-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          dotColor: 'bg-green-500'
        };
      case 'yellow':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600', 
          accentColor: 'bg-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          dotColor: 'bg-yellow-500'
        };
      case 'red':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          accentColor: 'bg-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          accentColor: 'bg-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          dotColor: 'bg-blue-500'
        };
    }
  };

  const styles = getConfidenceStyles();

  // Format time ago
  const timeAgo = () => {
    const diff = Date.now() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div 
      className={`
        relative group
        ${styles.bgColor}
        border-2 rounded-3xl 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 ease-out
        ${draggable ? 'cursor-move' : ''}
        touch-manipulation
        ${className}
      `}
      draggable={draggable}
    >
      {/* Drag Handle */}
      {draggable && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-30 transition-opacity">
          <GripVertical size={20} className="text-gray-500" />
        </div>
      )}

      {/* Confidence Indicator */}
      <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${styles.dotColor} animate-pulse`} />

      {/* Widget Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${styles.accentColor} bg-opacity-10`}>
            <Icon size={24} className={styles.iconColor} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {widget_config.title}
            </h3>
            <p className="text-sm text-gray-500">
              Updated {timeAgo()}
            </p>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`
            px-3 py-1 text-xs font-medium rounded-full uppercase tracking-wide
            ${widget_config.urgency === 'HIGH' 
              ? 'bg-red-100 text-red-700' 
              : widget_config.urgency === 'MEDIUM' 
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-green-100 text-green-700'
            }
          `}>
            {widget_config.urgency} Priority
          </span>
          {realTimeUpdate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <RefreshCw size={12} className="animate-spin" />
              Live
            </div>
          )}
        </div>
      </div>

      {/* Prediction Content */}
      <div className="px-6 pb-6">
        {/* Main Recommendation - Large, Clear Text */}
        <div className="mb-6">
          <h4 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
            {prediction.recommendation}
          </h4>
          
          {/* Supporting Details */}
          {prediction.supporting_details && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {prediction.supporting_details}
            </p>
          )}
        </div>

        {/* Key Metrics Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Metric 1 */}
          {prediction.fatigue_score && (
            <div className="bg-white bg-opacity-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-1">Fatigue Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(prediction.fatigue_score * 100)}%
              </p>
            </div>
          )}
          
          {/* Metric 2 */}
          {prediction.expected_improvement && (
            <div className="bg-white bg-opacity-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-1">Expected Boost</p>
              <p className="text-2xl font-bold text-green-600">
                +{Math.round(prediction.expected_improvement * 100)}%
              </p>
            </div>
          )}

          {/* Metric 3 */}
          {prediction.days_remaining && (
            <div className="bg-white bg-opacity-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-1">Days Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {prediction.days_remaining}
              </p>
            </div>
          )}

          {/* Metric 4 */}
          {prediction.opportunity_score && (
            <div className="bg-white bg-opacity-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-1">Opportunity</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(prediction.opportunity_score * 100)}%
              </p>
            </div>
          )}
        </div>

        {/* Action Button - Large, Apple-style */}
        {prediction.action_button && (
          <div className="space-y-3">
            <button
              onClick={handleActionClick}
              disabled={isRefreshing}
              className={`
                w-full
                ${styles.buttonColor}
                text-white text-xl font-semibold
                py-4 px-6 
                rounded-2xl
                flex items-center justify-center gap-3
                transition-all duration-200
                transform hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg hover:shadow-xl
                touch-manipulation
              `}
            >
              {isRefreshing ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : (
                <>
                  <span>{prediction.action_button.text}</span>
                  <ArrowRight size={24} />
                </>
              )}
            </button>
            
            {/* Impact Estimate */}
            {prediction.action_button.estimated_impact && (
              <p className="text-center text-sm text-gray-600">
                Expected Impact: {prediction.action_button.estimated_impact}
              </p>
            )}
          </div>
        )}

        {/* Additional Actions */}
        {prediction.secondary_actions && prediction.secondary_actions.length > 0 && (
          <div className="mt-4 space-y-2">
            {prediction.secondary_actions.map((action, index) => (
              <button
                key={index}
                className="w-full text-left p-3 text-gray-700 hover:bg-white hover:bg-opacity-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gray-500" />
                  <span className="text-sm font-medium">{action}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <div className="text-center">
            <RefreshCw size={32} className={`${styles.iconColor} animate-spin mb-2`} />
            <p className="text-sm font-medium text-gray-600">Updating...</p>
          </div>
        </div>
      )}

      {/* Mobile-First Touch Indicators */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}