/**
 * Creative Performance Leaderboard Widget
 * Shows which ad creatives work best vs worst with detailed analysis
 */

import { useState, useEffect } from 'react';
import { Play, Image, Trophy, AlertTriangle, BarChart3, Eye, MousePointer, DollarSign } from 'lucide-react';

export default function CreativePerformanceWidget({ onActionClick }) {
  const [selectedView, setSelectedView] = useState('performance');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const creativeData = {
    transformation_videos: {
      name: 'Transformation Videos',
      type: 'Video - Before/After',
      performance_grade: 'A+',
      ctr: 4.2,
      conversion_rate: 3.1,
      roas: 4.5,
      spend: 1659,
      revenue: 7470,
      impressions: 142800,
      clicks: 2856,
      fatigue_cycle: 14,
      best_audiences: ['Parents 25-45', 'Art enthusiasts'],
      creative_samples: [
        'Messy kitchen → Beautiful artwork (30s)',
        'Stress relief transformation (45s)',
        'Family activity before/after (60s)'
      ],
      status: 'scaling',
      recommendation: 'Scale +50% immediately - highest ROI',
      icon: Play,
      color: 'emerald'
    },
    family_bonding: {
      name: 'Family Bonding',
      type: 'Video - Family moments',
      performance_grade: 'A',
      ctr: 3.8,
      conversion_rate: 2.9,
      roas: 4.1,
      spend: 1106,
      revenue: 4662,
      impressions: 98400,
      clicks: 1893,
      fatigue_cycle: 18,
      best_audiences: ['Mothers 30-50', 'Grandparents'],
      creative_samples: [
        'Mom & daughter painting (45s)',
        'Grandpa teaching art (30s)',
        'Weekend family activity (60s)'
      ],
      status: 'optimizing',
      recommendation: 'Scale +30% gradually - strong retention',
      icon: Play,
      color: 'blue'
    },
    gift_scenarios: {
      name: 'Gift Scenarios',
      type: 'Carousel - Gift ideas',
      performance_grade: 'B+',
      ctr: 3.2,
      conversion_rate: 2.4,
      roas: 3.6,
      spend: 1327,
      revenue: 4340,
      impressions: 118600,
      clicks: 2134,
      fatigue_cycle: 12,
      best_audiences: ['Gift buyers', 'Holiday shoppers'],
      creative_samples: [
        'Perfect birthday gift showcase',
        'Holiday gift guide carousel',
        'Anniversary surprise ideas'
      ],
      status: 'refreshing',
      recommendation: 'Refresh creative - showing fatigue',
      icon: Image,
      color: 'yellow'
    },
    static_images: {
      name: 'Static Images',
      type: 'Image - Product shots',
      performance_grade: 'C+',
      ctr: 2.1,
      conversion_rate: 1.8,
      roas: 2.9,
      spend: 948,
      revenue: 1015,
      impressions: 89200,
      clicks: 1247,
      fatigue_cycle: 21,
      best_audiences: ['Price-sensitive buyers'],
      creative_samples: [
        'Product lineup on white background',
        'Kit contents spread out',
        'Price comparison graphics'
      ],
      status: 'testing',
      recommendation: 'Phase out except for testing',
      icon: Image,
      color: 'gray'
    }
  };

  const timeframeOptions = {
    '7d': '7 Days',
    '30d': '30 Days', 
    '90d': '90 Days'
  };

  const viewOptions = {
    'performance': 'Performance Ranking',
    'audience': 'Audience Analysis',
    'fatigue': 'Creative Fatigue',
    'rotation': 'Rotation Schedule'
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+') return 'text-emerald-600 bg-emerald-100';
    if (grade === 'A') return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scaling': return 'bg-emerald-100 text-emerald-800';
      case 'optimizing': return 'bg-blue-100 text-blue-800';
      case 'refreshing': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedCreatives = Object.entries(creativeData)
    .sort(([,a], [,b]) => b.roas - a.roas);

  const handleCreativeAction = (creativeName, action) => {
    if (onActionClick) {
      onActionClick('creative_performance', {
        text: action,
        creative: creativeName,
        type: 'creative_action'
      });
    }
  };

  const renderPerformanceView = () => (
    <div className="space-y-4">
      {sortedCreatives.map(([key, creative], index) => {
        const Icon = creative.icon;
        return (
          <div key={key} className={`
            border-2 rounded-2xl p-4 transition-all hover:shadow-md
            ${index === 0 ? 'border-emerald-300 bg-emerald-50' : 
              index === 1 ? 'border-blue-300 bg-blue-50' :
              'border-gray-200 bg-white'
            }
          `}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {index < 3 && (
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                      ${index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        'bg-amber-600'
                      }
                    `}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  )}
                  <Icon size={20} className={`text-${creative.color}-600`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{creative.name}</h4>
                  <p className="text-sm text-gray-600">{creative.type}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getGradeColor(creative.performance_grade)}`}>
                  {creative.performance_grade}
                </span>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(creative.roas)}x ROAS</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">CTR</p>
                <p className="font-semibold text-gray-900">{formatPercentage(creative.ctr)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">CVR</p>
                <p className="font-semibold text-gray-900">{formatPercentage(creative.conversion_rate)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="font-semibold text-gray-900">{formatCurrency(creative.revenue)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Fatigue</p>
                <p className="font-semibold text-gray-900">{creative.fatigue_cycle}d</p>
              </div>
            </div>

            {/* Status and Recommendation */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(creative.status)}`}>
                {creative.status.toUpperCase()}
              </span>
              <button
                onClick={() => handleCreativeAction(creative.name, creative.recommendation.split(' - ')[0])}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${index === 0 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {creative.recommendation.split(' - ')[0]}
              </button>
            </div>

            {/* Best Audiences */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Top Audiences:</p>
              <div className="flex flex-wrap gap-1">
                {creative.best_audiences.map((audience, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderFatigueView = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <AlertTriangle size={18} />
          Creative Fatigue Alert
        </h3>
        <p className="text-sm text-yellow-700">
          Gift Scenarios showing fatigue signs - refresh needed in 2 days
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sortedCreatives.map(([key, creative]) => {
          const daysLeft = creative.fatigue_cycle - Math.floor(Math.random() * creative.fatigue_cycle);
          const fatiguePercentage = ((creative.fatigue_cycle - daysLeft) / creative.fatigue_cycle * 100);
          
          return (
            <div key={key} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{creative.name}</h4>
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${daysLeft <= 3 ? 'bg-red-100 text-red-800' :
                    daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }
                `}>
                  {daysLeft}d left
                </span>
              </div>
              
              {/* Fatigue Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Fatigue Level</span>
                  <span>{fatiguePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      fatiguePercentage > 80 ? 'bg-red-500' :
                      fatiguePercentage > 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${fatiguePercentage}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-600">
                Refresh cycle: {creative.fatigue_cycle} days
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-3xl shadow-lg p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-xl">
            <Trophy size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Creative Performance</h2>
            <p className="text-gray-600">Leaderboard & Optimization</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Creative Spend</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(Object.values(creativeData).reduce((sum, c) => sum + c.spend, 0))}
          </p>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {Object.entries(viewOptions).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedView(key)}
            className={`
              px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all
              ${selectedView === key 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6">
        {Object.entries(timeframeOptions).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedTimeframe(key)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedTimeframe === key 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="mb-6">
        {selectedView === 'performance' && renderPerformanceView()}
        {selectedView === 'fatigue' && renderFatigueView()}
        {selectedView === 'audience' && (
          <div className="text-center py-8 text-gray-500">
            Audience analysis view - coming soon
          </div>
        )}
        {selectedView === 'rotation' && (
          <div className="text-center py-8 text-gray-500">
            Rotation schedule view - coming soon
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleCreativeAction('All', 'Refresh Low Performers')}
          className="bg-yellow-500 text-white font-semibold py-3 rounded-xl hover:bg-yellow-600 transition-colors"
        >
          Refresh Fatigued Creatives
        </button>
        <button
          onClick={() => handleCreativeAction('Top Performers', 'Scale Budget')}
          className="bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors"
        >
          Scale Top Performers
        </button>
      </div>
    </div>
  );
}