import { useState } from 'react';
import { AlertTriangle, TrendingUp, Calendar, Target, ArrowRight, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

// FIXED: Robust confidence handling for all data types
const getConfidenceStyle = (confidence) => {
  let numericConfidence = 50; // safe fallback
  
  // Handle various confidence formats consistently
  if (typeof confidence === 'string') {
    const lowerConf = confidence.toLowerCase();
    if (lowerConf === 'red') numericConfidence = 30;
    else if (lowerConf === 'yellow') numericConfidence = 70;
    else if (lowerConf === 'green') numericConfidence = 90;
    else {
      // Try parsing as percentage string "70%"
      const parsed = parseFloat(confidence.replace('%', ''));
      if (!isNaN(parsed)) numericConfidence = Math.max(0, Math.min(100, parsed));
    }
  } else if (typeof confidence === 'number' && !isNaN(confidence)) {
    // Handle decimal (0.7) or percentage (70) formats
    if (confidence <= 1) {
      numericConfidence = Math.max(0, Math.min(100, confidence * 100));
    } else {
      numericConfidence = Math.max(0, Math.min(100, confidence));
    }
  }
  
  // Return consistent styling based on numeric confidence
  if (numericConfidence >= 85) return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
  if (numericConfidence >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
  return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
};

// FIXED: Consistent confidence percentage display with fallback
const getConfidencePercentage = (confidence, confidenceScore) => {
  // First try confidenceScore if available
  if (typeof confidenceScore === 'number' && !isNaN(confidenceScore)) {
    return Math.round(Math.max(0, Math.min(100, confidenceScore)));
  }
  
  if (typeof confidence === 'string') {
    const lowerConf = confidence.toLowerCase();
    if (lowerConf === 'red' || lowerConf === 'low') return 30;
    if (lowerConf === 'yellow' || lowerConf === 'medium') return 70;
    if (lowerConf === 'green' || lowerConf === 'high') return 90;
    
    // Try parsing percentage strings
    const parsed = parseFloat(confidence.replace('%', ''));
    if (!isNaN(parsed)) return Math.round(Math.max(0, Math.min(100, parsed)));
  }
  
  if (typeof confidence === 'number' && !isNaN(confidence)) {
    // Handle decimal (0.7) or percentage (70) formats
    if (confidence <= 1) {
      return Math.round(Math.max(0, Math.min(100, confidence * 100)));
    } else {
      return Math.round(Math.max(0, Math.min(100, confidence)));
    }
  }
  
  return 50; // safe fallback
};

const getPriorityIcon = (type) => {
  switch (type) {
    case 'fatigue': return AlertTriangle;
    case 'budget': return TrendingUp;
    case 'timing': return Calendar;
    case 'velocity': return Target;
    default: return AlertTriangle;
  }
};

export default function PredictionCard({ prediction, onAction, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const confidenceStyle = getConfidenceStyle(prediction.confidence);
  const confidencePercentage = getConfidencePercentage(prediction.confidence, prediction.confidenceScore);
  const IconComponent = getPriorityIcon(prediction.type);
  
  const formatTimeframe = (days) => {
    if (days < 1) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `in ${days} days`;
    return format(addDays(new Date(), days), 'MMM d');
  };

  return (
    <div
      className={`glass-card p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${confidenceStyle.bg}`}>
            <IconComponent className={`w-4 h-4 ${confidenceStyle.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white truncate">
              {prediction.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {prediction.category}
            </p>
          </div>
        </div>
        
        {/* FIXED: Confidence Badge - Always shows valid percentage */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${confidenceStyle.bg} ${confidenceStyle.text} flex items-center space-x-1`}>
          <div className={`w-1.5 h-1.5 rounded-full ${confidenceStyle.dot}`}></div>
          <span>{confidencePercentage}%</span>
        </div>
      </div>

      {/* Prediction Message */}
      <div className="space-y-2 mb-3">
        <p className="text-sm text-gray-200 leading-relaxed">
          {prediction.message}
        </p>
        
        {prediction.timeframe && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Expected {formatTimeframe(prediction.timeframe)}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      {prediction.metrics && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {Object.entries(prediction.metrics).map(([key, value]) => (
            <div key={key} className="text-center p-2 bg-black/20 rounded-lg">
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {prediction.action && (
        <button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          onClick={(e) => {
            e.stopPropagation();
            onAction && onAction(prediction);
          }}
        >
          <span>{prediction.action}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}

      {/* Expandable Details */}
      {isExpanded && prediction.details && (
        <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-300">PREDICTION DETAILS</h4>
            <ChevronRight className="w-3 h-3 text-gray-400 transform rotate-90" />
          </div>
          
          {prediction.details.historicalAccuracy && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Historical Accuracy:</span>
              <span className="text-white font-medium">{prediction.details.historicalAccuracy}%</span>
            </div>
          )}
          
          {prediction.details.factors && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Key Factors:</div>
              <ul className="text-xs text-gray-300 space-y-1">
                {prediction.details.factors.map((factor, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {prediction.details.impact && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Expected Impact:</span>
              <span className="text-white font-medium">{prediction.details.impact}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}