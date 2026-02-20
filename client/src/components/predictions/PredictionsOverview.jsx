import { useState, useEffect } from 'react';
import { RefreshCw, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import PredictionCard from './PredictionCard';
import SlaySeasonInsights from './SlaySeasonInsights';
import { usePredictions } from '../../hooks/usePredictions';

export default function PredictionsOverview() {
  const { 
    predictions, 
    loading, 
    error, 
    fetchPredictions, 
    fetchSlaySeasonAnalysis 
  } = usePredictions();
  const [selectedView, setSelectedView] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchPredictions();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchPredictions();
      }, 5 * 60 * 1000); // Refresh every 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchPredictions]);

  const getUrgencyLevel = (predictions) => {
    if (!predictions || !predictions.predictions) return 'LOW';
    
    const urgencies = Object.values(predictions.predictions).map(p => 
      p.widget_config?.urgency || 'MEDIUM'
    );
    
    if (urgencies.includes('HIGH')) return 'HIGH';
    if (urgencies.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  };

  const renderPredictionCards = () => {
    if (!predictions || !predictions.predictions) return null;

    const predictionOrder = [
      'creative_fatigue',
      'budget_optimization', 
      'customer_prediction',
      'product_velocity',
      'cross_merchant'
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {predictionOrder.map(type => {
          const prediction = predictions.predictions[type];
          if (!prediction) return null;

          return (
            <PredictionCard
              key={type}
              prediction={{
                type: type,
                title: prediction.widget_config?.title || prediction.prediction,
                message: prediction.prediction,
                confidence: Math.round((prediction.confidence || 0.5) * 100),
                category: prediction.widget_config?.type || type,
                urgency: prediction.widget_config?.urgency || 'MEDIUM',
                timeframe: prediction.days_to_fatigue || 
                          prediction.days_to_purchase || 
                          7,
                action: prediction.actions?.[0] || 'View Details',
                metrics: getMetricsForPrediction(prediction, type),
                details: {
                  historicalAccuracy: Math.round((prediction.confidence || 0.5) * 100),
                  factors: prediction.actions || [],
                  impact: prediction.explanation || 'AI-powered prediction'
                }
              }}
              onAction={() => handlePredictionAction(type, prediction)}
            />
          );
        })}
      </div>
    );
  };

  const getMetricsForPrediction = (prediction, type) => {
    switch (type) {
      case 'budget_optimization':
        return {
          budgetChange: `+$${Math.round(prediction.budget_change || 1000)}`,
          revenueIncrease: `+${Math.round((prediction.revenue_increase || 0.23) * 100)}%`
        };
      case 'creative_fatigue':
        return {
          daysLeft: `${prediction.days_to_fatigue || 5}d`,
          riskLevel: prediction.risk_level || 'MEDIUM'
        };
      case 'customer_prediction':
        return {
          purchaseRate: `${Math.round((prediction.purchase_probability || 0.15) * 100)}%`,
          avgDays: `${prediction.days_to_purchase || 7}d`
        };
      case 'product_velocity':
        return {
          direction: prediction.direction || 'stable',
          change: `${Math.round((prediction.velocity_change || 0.12) * 100)}%`
        };
      default:
        return null;
    }
  };

  const handlePredictionAction = (type, prediction) => {
    // Handle specific actions for each prediction type
    console.log(`Action for ${type}:`, prediction.actions?.[0]);
    // TODO: Implement specific actions (navigate to campaigns, budget settings, etc.)
  };

  const urgencyLevel = getUrgencyLevel(predictions);
  const urgencyColor = urgencyLevel === 'HIGH' ? 'red' : 
                      urgencyLevel === 'MEDIUM' ? 'yellow' : 'green';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400">Generating AI predictions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <p>Failed to load predictions: {error}</p>
        </div>
        <button
          onClick={() => fetchPredictions()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Slay Season Intelligence
          </h1>
          <p className="text-gray-400">
            AI-powered predictions for exponential growth
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex items-center bg-black/20 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setSelectedView('slay-season');
                fetchSlaySeasonAnalysis();
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'slay-season'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Slay Season Analysis
            </button>
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-${urgencyColor}-100/10`}>
            <div className={`w-2 h-2 rounded-full bg-${urgencyColor}-500`}></div>
            <span className={`text-${urgencyColor}-400 text-sm font-medium`}>
              {urgencyLevel} Priority
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchPredictions()}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {predictions?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">High Priority</p>
                <p className="text-lg font-bold text-white">
                  {predictions.summary.high_priority_count}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Avg Confidence</p>
                <p className="text-lg font-bold text-white">
                  {Math.round(predictions.summary.average_confidence * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div>
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="text-sm font-medium text-white">
                {new Date(predictions.generated_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Auto Refresh</p>
                <p className="text-sm font-medium text-white">5 min</p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-blue-500' : 'bg-gray-600'
                } relative`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    autoRefresh ? 'transform translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {selectedView === 'overview' ? (
        <>
          <h2 className="text-lg font-semibold text-white mb-4">
            AI Predictions
          </h2>
          {renderPredictionCards()}
        </>
      ) : (
        <SlaySeasonInsights />
      )}
    </div>
  );
}