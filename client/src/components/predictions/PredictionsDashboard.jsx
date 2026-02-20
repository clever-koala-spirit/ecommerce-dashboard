/**
 * Slay Season Predictions Dashboard - v1.1 Integration
 * Human-centered design with real-time ML predictions
 * Apple-style drag/drop widgets, mobile-first interface
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Settings, 
  BarChart3,
  Shield,
  Zap,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import PredictionWidget from './PredictionWidget';
import { usePredictions } from '../../hooks/usePredictions';

export default function PredictionsDashboard() {
  const {
    predictions,
    loading,
    error,
    fetchPredictions,
    startRealTimeUpdates,
    stopRealTimeUpdates
  } = usePredictions();

  const [widgetLayout, setWidgetLayout] = useState([
    'creative_fatigue',
    'budget_optimization',
    'customer_timing',
    'product_velocity', 
    'cross_merchant'
  ]);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalPredictions: 0,
    highPriorityAlerts: 0,
    confidenceScore: 0,
    lastUpdate: null
  });

  // Initialize dashboard
  useEffect(() => {
    fetchPredictions();
    
    if (realTimeEnabled) {
      const cleanup = startRealTimeUpdates();
      return cleanup;
    }
  }, [fetchPredictions, startRealTimeUpdates, realTimeEnabled]);

  // Update dashboard stats when predictions change
  useEffect(() => {
    if (predictions?.predictions) {
      const predList = Object.values(predictions.predictions);
      const highPriority = predList.filter(p => p.widget_config?.urgency === 'HIGH').length;
      const avgConfidence = predList.reduce((sum, p) => {
        const confidenceScore = p.confidence === 'green' ? 0.9 : p.confidence === 'yellow' ? 0.6 : 0.3;
        return sum + confidenceScore;
      }, 0) / predList.length;

      setDashboardStats({
        totalPredictions: predList.length,
        highPriorityAlerts: highPriority,
        confidenceScore: Math.round(avgConfidence * 100),
        lastUpdate: new Date(predictions.generated_at)
      });
    }
  }, [predictions]);

  // Handle widget action clicks
  const handleWidgetAction = useCallback(async (widgetType, actionButton) => {
    console.log(`🎯 Action triggered: ${widgetType} - ${actionButton.text}`);
    
    // Here you would implement specific actions based on widget type
    switch (widgetType) {
      case 'creative_fatigue':
        // Navigate to creative management or trigger creative refresh
        console.log('Navigating to creative refresh...');
        break;
      case 'budget_optimization':
        // Open budget adjustment interface
        console.log('Opening budget optimizer...');
        break;
      case 'customer_timing':
        // Launch targeted campaign workflow
        console.log('Launching customer campaign...');
        break;
      case 'product_velocity':
        // Open inventory management
        console.log('Opening inventory manager...');
        break;
      case 'cross_merchant':
        // Show competitive analysis details
        console.log('Opening competitive analysis...');
        break;
    }

    // Refresh predictions after action
    setTimeout(() => {
      fetchPredictions();
    }, 2000);
  }, [fetchPredictions]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    await fetchPredictions();
  }, [fetchPredictions]);

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    const newState = !realTimeEnabled;
    setRealTimeEnabled(newState);
    
    if (newState) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }
  }, [realTimeEnabled, startRealTimeUpdates, stopRealTimeUpdates]);

  // Get system status indicator
  const getSystemStatus = () => {
    if (loading) return { status: 'loading', color: 'text-blue-500' };
    if (error) return { status: 'error', color: 'text-red-500' };
    if (dashboardStats.highPriorityAlerts > 0) return { status: 'alert', color: 'text-yellow-500' };
    return { status: 'healthy', color: 'text-green-500' };
  };

  const systemStatus = getSystemStatus();

  // Render error state
  if (error && !predictions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load predictions. Check your connection and try again.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Dashboard Header */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title & Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Slay Season Intelligence
                  </h1>
                  <p className="text-sm text-gray-500">
                    Real-time ML Predictions
                  </p>
                </div>
              </div>

              {/* System Status */}
              <div className="hidden sm:flex items-center gap-2">
                <Activity size={16} className={systemStatus.color} />
                <span className={`text-sm font-medium ${systemStatus.color}`}>
                  {systemStatus.status === 'loading' && 'Updating...'}
                  {systemStatus.status === 'error' && 'Offline'}
                  {systemStatus.status === 'alert' && 'Alerts Active'}
                  {systemStatus.status === 'healthy' && 'All Systems Go'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Dashboard Stats */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{dashboardStats.totalPredictions}</p>
                  <p className="text-gray-500">Predictions</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-yellow-600">{dashboardStats.highPriorityAlerts}</p>
                  <p className="text-gray-500">High Priority</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">{dashboardStats.confidenceScore}%</p>
                  <p className="text-gray-500">Confidence</p>
                </div>
              </div>

              {/* Real-time Toggle */}
              <button
                onClick={toggleRealTime}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-colors
                  ${realTimeEnabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {realTimeEnabled ? 'Live' : 'Paused'}
              </button>

              {/* Manual Refresh */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && !predictions && (
          <div className="text-center py-12">
            <RefreshCw size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Intelligence...
            </h3>
            <p className="text-gray-600">
              Analyzing your data with Pentagon-grade security
            </p>
          </div>
        )}

        {/* Pentagon Security Notice */}
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Pentagon-Grade Security Active</p>
              <p className="text-sm text-green-700">
                All predictions encrypted with AES-256-GCM • Multi-AI failover enabled • Real-time audit logging
              </p>
            </div>
          </div>
        </div>

        {/* Predictions Grid */}
        {predictions?.predictions && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
            {widgetLayout.map((widgetType) => {
              const prediction = predictions.predictions[widgetType];
              if (!prediction) return null;

              return (
                <PredictionWidget
                  key={widgetType}
                  prediction={prediction}
                  type={widgetType}
                  onActionClick={handleWidgetAction}
                  onRefresh={handleRefresh}
                  className="h-fit"
                  draggable={true}
                  realTimeUpdate={realTimeEnabled}
                />
              );
            })}
          </div>
        )}

        {/* JARVIS Status Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-70 rounded-full text-sm text-gray-600">
            <Zap size={16} className="text-blue-500" />
            <span>
              Powered by JARVIS Multi-AI Router • Last updated {dashboardStats.lastUpdate?.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Quick Actions Bar - Mobile */}
        <div className="fixed bottom-6 left-4 right-4 lg:hidden">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleWidgetAction('creative_fatigue', { text: 'Refresh Creative' })}
                className="flex flex-col items-center gap-1 p-3 bg-yellow-50 rounded-xl"
              >
                <Zap size={20} className="text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">Creative</span>
              </button>
              <button
                onClick={() => handleWidgetAction('budget_optimization', { text: 'Optimize Budget' })}
                className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-xl"
              >
                <TrendingUp size={20} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">Budget</span>
              </button>
              <button
                onClick={toggleRealTime}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-xl
                  ${realTimeEnabled ? 'bg-blue-50' : 'bg-gray-50'}
                `}
              >
                <Activity size={20} className={realTimeEnabled ? 'text-blue-600' : 'text-gray-600'} />
                <span className={`text-xs font-medium ${realTimeEnabled ? 'text-blue-700' : 'text-gray-700'}`}>
                  {realTimeEnabled ? 'Live' : 'Paused'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}