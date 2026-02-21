/**
 * Scale-Up Stage Indicator Widget
 * 5-stage scaling progress with visual indicators and next actions
 */

import { useState, useEffect } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  TrendingUp,
  Users,
  Globe,
  Crown,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function ScaleUpStageWidget({ onActionClick }) {
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedStageView, setSelectedStageView] = useState(1);

  const stages = [
    {
      id: 1,
      name: 'Foundation',
      status: 'in_progress',
      completion: 75,
      target_revenue: 50000,
      timeline: '3 months',
      icon: Rocket,
      color: 'yellow',
      focus: 'AOV Optimization & Channel Efficiency',
      key_metrics: {
        aov_target: '$75 (+57%)',
        roas_maintain: '3.5x+',
        bundle_mix: '35%',
        creative_refresh: 'Weekly'
      },
      critical_actions: [
        'Launch $119 bundle strategy',
        'Implement subscription model',
        'Creative rotation system', 
        'Scale top campaigns 50%'
      ],
      investments: '$15K setup + tools',
      graduation_criteria: [
        '$50K monthly revenue for 2+ months',
        '3.5x+ ROAS sustained',
        'Bundles 35%+ of revenue',
        'Creative refresh operational'
      ],
      current_score: {
        product_market_fit: 95,
        unit_economics: 90,
        channel_efficiency: 85,
        operational_systems: 70,
        team_readiness: 80,
        overall: 84
      }
    },
    {
      id: 2,
      name: 'Channel Mastery',
      status: 'upcoming',
      completion: 0,
      target_revenue: 125000,
      timeline: '4 months',
      icon: TrendingUp,
      color: 'blue',
      focus: 'Multi-Channel Expansion & Audience Scaling',
      key_metrics: {
        channel_diversification: '3+ profitable',
        audience_expansion: '5x addressable',
        creative_efficiency: '4.5x+ ROAS',
        brand_recognition: '20% awareness'
      },
      critical_actions: [
        'TikTok advertising launch',
        'Amazon FBA implementation', 
        'Google Shopping scale 200%',
        'Influencer program (50 partners)'
      ],
      investments: '$50K inventory + creative',
      graduation_criteria: [
        '$125K monthly revenue',
        'No channel >60% revenue share',
        'All channels 3.0x+ ROAS',
        'Influencer 15% of sales'
      ],
      unlock_requirements: 'Complete Foundation stage'
    },
    {
      id: 3,
      name: 'Diversification',
      status: 'planned',
      completion: 0,
      target_revenue: 300000,
      timeline: '6 months',
      icon: Users,
      color: 'purple',
      focus: 'Product Line Extension & Retail Partnerships',
      key_metrics: {
        product_portfolio: '5+ profitable SKUs',
        retail_presence: '500+ stores',
        b2b_revenue: '20% of total',
        market_share: '0.5% category'
      },
      critical_actions: [
        'Premium paint kit line ($199-299)',
        'Retail partnerships (Target, Walmart)',
        'Educational/corporate sales',
        'International shipping setup'
      ],
      investments: '$110K development + partnerships',
      graduation_criteria: [
        '$300K monthly revenue',
        'Premium 25%+ of revenue',
        'Retail 30%+ of sales', 
        'Profitable in 5+ countries'
      ],
      unlock_requirements: 'Complete Channel Mastery'
    },
    {
      id: 4,
      name: 'Geographic Expansion',
      status: 'planned',
      completion: 0,
      target_revenue: 600000,
      timeline: '8 months',
      icon: Globe,
      color: 'green',
      focus: 'International Market Domination',
      key_metrics: {
        international_revenue: '50% of total',
        market_presence: '10+ countries',
        local_partnerships: '3+ per market',
        global_brand: 'Top 3 category'
      },
      critical_actions: [
        'Full UK/Canada/Australia launch',
        'Local marketing partnerships',
        'Multi-currency checkout',
        'Regional fulfillment centers'
      ],
      investments: '$580K international expansion',
      graduation_criteria: [
        '$600K monthly revenue',
        'International 50%+ revenue',
        'Profitable in 8+ countries',
        '>1% market share in top markets'
      ],
      unlock_requirements: 'Complete Diversification'
    },
    {
      id: 5,
      name: 'Multiplication',
      status: 'planned',
      completion: 0,
      target_revenue: 1000000,
      timeline: '12+ months',
      icon: Crown,
      color: 'gold',
      focus: 'Market Leadership & Ecosystem Creation',
      key_metrics: {
        market_leadership: '#1 or #2 category',
        ecosystem_revenue: '30% platform',
        customer_ltv: '$300+',
        exit_readiness: 'Acquisition ready'
      },
      critical_actions: [
        'Acquire complementary brands',
        'Launch marketplace platform',
        'Franchise/licensing opportunities',
        'IPO/exit preparation'
      ],
      investments: '$3M+ strategic capital',
      graduation_criteria: [
        '$1M+ monthly revenue',
        'Market leadership established',
        'Platform revenue operational',
        'Clear exit strategy'
      ],
      unlock_requirements: 'Complete Geographic Expansion'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status, completion) => {
    if (status === 'completed') return <CheckCircle2 size={20} className="text-green-600" />;
    if (status === 'in_progress') return <Clock size={20} className="text-yellow-600" />;
    return <Circle size={20} className="text-gray-400" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleStageAction = (stageName, action) => {
    if (onActionClick) {
      onActionClick('scaleup_stage', {
        text: action,
        stage: stageName,
        type: 'stage_action'
      });
    }
  };

  const selectedStage = stages.find(s => s.id === selectedStageView);

  const renderStageProgress = () => (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = stage.status === 'in_progress';
          const isCompleted = stage.status === 'completed';
          
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStageView(stage.id)}
              className={`
                relative p-3 rounded-xl transition-all text-center
                ${selectedStageView === stage.id 
                  ? `bg-${stage.color}-100 border-2 border-${stage.color}-400` 
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div className="absolute top-1/2 -right-1 w-2 h-0.5 bg-gray-300 z-0" />
              )}
              
              {/* Stage Icon and Info */}
              <div className="relative z-10">
                <Icon size={24} className={`mx-auto mb-2 ${isActive ? 'text-yellow-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="font-semibold text-xs text-gray-900">{stage.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(stage.target_revenue)}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className={`h-1 rounded-full transition-all bg-${stage.color}-500`}
                    style={{ width: `${stage.completion}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Stage Status */}
      <div className={`border-2 border-${selectedStage.color}-300 bg-${selectedStage.color}-50 rounded-2xl p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <selectedStage.icon size={32} className={`text-${selectedStage.color}-600`} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Stage {selectedStage.id}: {selectedStage.name}</h3>
              <p className="text-gray-600">{selectedStage.focus}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStage.status)}`}>
              {selectedStage.status.replace('_', ' ').toUpperCase()}
            </span>
            {selectedStage.completion > 0 && (
              <p className="text-sm text-gray-500 mt-1">{selectedStage.completion}% Complete</p>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.entries(selectedStage.key_metrics).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</p>
              <p className="font-semibold text-gray-900 text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Timeline and Investment */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">{selectedStage.timeline}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">{formatCurrency(selectedStage.target_revenue)}/month</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Investment Required</p>
            <p className="font-semibold text-gray-900">{selectedStage.investments}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStageDetails = () => (
    <div className="space-y-4">
      {/* Critical Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-orange-500" />
          Critical Actions
        </h3>
        <div className="space-y-2">
          {selectedStage.critical_actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleStageAction(selectedStage.name, action)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group"
            >
              <span className="font-medium text-gray-900">{action}</span>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Graduation Criteria */}
      {selectedStage.graduation_criteria && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <h3 className="font-semibold text-green-800 mb-3">🎯 Graduation Criteria</h3>
          <div className="space-y-2">
            {selectedStage.graduation_criteria.map((criteria, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm text-green-700">{criteria}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Score (for Foundation stage) */}
      {selectedStage.current_score && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-800 mb-3">📊 Stage Scorecard</h3>
          <div className="space-y-3">
            {Object.entries(selectedStage.current_score).map(([key, score]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-blue-700">{key.replace('_', ' ')}</span>
                  <span className="font-semibold text-blue-800">{score}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      score >= 90 ? 'bg-green-500' : 
                      score >= 80 ? 'bg-blue-500' : 
                      score >= 70 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlock Requirements */}
      {selectedStage.unlock_requirements && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-700 mb-2">🔒 Unlock Requirements</h3>
          <p className="text-sm text-gray-600">{selectedStage.unlock_requirements}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-3xl shadow-lg p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
            <Rocket size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Scale-Up Stage</h2>
            <p className="text-gray-600">5-Stage Growth Framework</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Stage</p>
          <p className="text-xl font-bold text-indigo-600">Stage {currentStage}</p>
          <p className="text-xs text-gray-500">75% Complete</p>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="mb-6">
        {renderStageProgress()}
      </div>

      {/* Stage Details */}
      <div className="mb-6">
        {renderStageDetails()}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleStageAction(selectedStage.name, 'View Stage Plan')}
          className="bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          View Detailed Plan
        </button>
        <button
          onClick={() => handleStageAction(selectedStage.name, 'Execute Next Action')}
          className="bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors"
        >
          Execute Next Action
        </button>
      </div>

      {/* Progress Footer */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span>Foundation Stage • Target: $50K/month • Timeline: 3 months</span>
        </div>
      </div>
    </div>
  );
}