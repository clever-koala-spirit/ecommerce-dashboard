import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  TrendingUpIcon, 
  LightBulbIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const RevenueOptimizerPage = () => {
  const [optimizations, setOptimizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [successStories, setSuccessStories] = useState([]);
  const [showQuickWins, setShowQuickWins] = useState(false);

  useEffect(() => {
    loadOptimizations();
    loadSuccessStories();
  }, [selectedCategory]);

  const loadOptimizations = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await api.get('/revenue-optimizer/recommendations', { params });
      
      if (response.data.success) {
        setOptimizations(response.data.data.optimizations);
        setSummary(response.data.data.summary);
      } else {
        setError(response.data.error || 'Failed to load optimizations');
      }
    } catch (err) {
      setError('Failed to load revenue optimizations');
      console.error('Error loading optimizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuccessStories = async () => {
    try {
      const response = await api.get('/revenue-optimizer/success-stories');
      if (response.data.success) {
        setSuccessStories(response.data.data.stories);
      }
    } catch (err) {
      console.error('Error loading success stories:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Pricing Optimization': return CurrencyDollarIcon;
      case 'Product Mix': return ChartBarIcon;
      case 'Customer Optimization': return UserGroupIcon;
      case 'Marketing Optimization': return TrendingUpIcon;
      case 'Conversion Optimization': return FireIcon;
      case 'Inventory Optimization': return ClockIcon;
      case 'Upsell/Cross-sell': return ArrowRightIcon;
      default: return LightBulbIcon;
    }
  };

  const handleTrackImplementation = async (optimizationId) => {
    try {
      await api.post('/revenue-optimizer/track-implementation', {
        optimizationId,
        implementationDate: new Date().toISOString(),
        notes: 'Tracked from dashboard'
      });
      
      // Show success feedback
      alert('Implementation tracked! We\'ll monitor the results for you.');
    } catch (err) {
      console.error('Error tracking implementation:', err);
      alert('Failed to track implementation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Revenue Optimizer - Slay Season</title>
        <meta name="description" content="AI-powered revenue optimization recommendations that beat competitors by providing specific, measurable actions to increase revenue." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUpIcon className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">
                AI Revenue Optimizer
              </h1>
              <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
                Get specific, measurable actions that directly increase your revenue. 
                Our AI analyzes your store data and provides recommendations worth thousands per month.
              </p>
              
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2">
                      ${summary.totalProjectedMonthlyRevenue?.toLocaleString()}
                    </div>
                    <div className="text-indigo-100">Monthly Potential</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2">
                      {summary.totalRecommendations}
                    </div>
                    <div className="text-indigo-100">Recommendations</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2">
                      {summary.quickWins}
                    </div>
                    <div className="text-indigo-100">Quick Wins</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && <ErrorMessage message={error} />}

          {/* Filter Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { key: 'all', label: 'All Recommendations' },
                { key: 'pricing', label: 'Pricing' },
                { key: 'marketing', label: 'Marketing' },
                { key: 'customer', label: 'Customer' },
                { key: 'conversion', label: 'Conversion' },
                { key: 'inventory', label: 'Inventory' },
                { key: 'upsell', label: 'Upsells' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCategory === tab.key
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Top Recommendation */}
          {optimizations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 Top Recommendation
              </h2>
              <OptimizationCard 
                optimization={optimizations[0]} 
                isTopRecommendation={true}
                onTrackImplementation={handleTrackImplementation}
              />
            </div>
          )}

          {/* All Recommendations */}
          {optimizations.length > 1 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                All Recommendations
              </h2>
              <div className="space-y-6">
                {optimizations.slice(1).map((optimization, index) => (
                  <OptimizationCard 
                    key={index}
                    optimization={optimization}
                    onTrackImplementation={handleTrackImplementation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Success Stories */}
          {successStories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Success Stories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {successStories.map(story => (
                  <div key={story.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {story.industry}
                      </span>
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {story.storeSize}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-600 mb-2">
                      {story.result}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      "{story.quote}"
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Revenue: {story.metrics.revenueIncrease}</span>
                      <span>Time: {story.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Boost Your Revenue?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              These AI-powered recommendations are based on analysis of 847+ stores like yours. 
              The average store increases revenue by $12,400/month after implementation.
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Schedule Implementation Call
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Optimization Card Component
const OptimizationCard = ({ optimization, isTopRecommendation = false, onTrackImplementation }) => {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = getCategoryIcon(optimization.category);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Price Optimization': return CurrencyDollarIcon;
      case 'Product Mix': return ChartBarIcon;
      case 'Customer Optimization': return UserGroupIcon;
      case 'Marketing Optimization': return TrendingUpIcon;
      case 'Conversion Optimization': return FireIcon;
      case 'Inventory Optimization': return ClockIcon;
      case 'Upsell/Cross-sell': return ArrowRightIcon;
      default: return LightBulbIcon;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all duration-200 ${
      isTopRecommendation 
        ? 'border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-100 dark:ring-indigo-900' 
        : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isTopRecommendation ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <IconComponent className={`w-5 h-5 ${isTopRecommendation ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {optimization.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {optimization.category}
              </p>
            </div>
          </div>
          {isTopRecommendation && (
            <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
              TOP PICK
            </span>
          )}
        </div>

        {/* Revenue Impact */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +${optimization.projectedMonthlyRevenue.toLocaleString()}/month
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Projected revenue increase
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(optimization.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Confidence
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(optimization.difficulty)}`}>
            {optimization.difficulty}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(optimization.riskLevel)}`}>
            {optimization.riskLevel} risk
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
            <ClockIcon className="w-3 h-3 inline mr-1" />
            {optimization.timeToImplement}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {optimization.description}
        </p>

        {/* KPI Impact */}
        {optimization.kpiImpact && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Expected Impact:
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(optimization.kpiImpact).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-500 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {expanded && (
          <div className="border-t dark:border-gray-700 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Implementation Steps:
            </h4>
            <ul className="space-y-2">
              {optimization.actionItems.map((item, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700 mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
          >
            {expanded ? 'Show Less' : 'View Implementation Steps'}
          </button>
          <div className="flex space-x-3">
            <button 
              onClick={() => onTrackImplementation(optimization.type)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4 inline mr-1" />
              Mark as Implemented
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOptimizerPage;