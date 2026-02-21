/**
 * Path to 10x Growth Widget - Leo's Specific Requirements
 * Shows roadmap from $29K to $297K-594K/month
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, DollarSign, Calendar, ArrowRight } from 'lucide-react';

export default function PathTo10xWidget({ onActionClick }) {
  const [selectedScenario, setSelectedScenario] = useState('conservative');
  
  const currentMetrics = {
    revenue: 29000,
    orders: 608,
    aov: 47.70,
    roas: 3.78,
    spend: 7900
  };

  const scenarios = {
    conservative: {
      name: '10x Conservative',
      target_revenue: 297000,
      timeline: '18 months',
      multiplier: '10.2x',
      confidence: 'high',
      color: 'green'
    },
    aggressive: {
      name: '20x Aggressive', 
      target_revenue: 594000,
      timeline: '24 months',
      multiplier: '20.5x',
      confidence: 'medium',
      color: 'blue'
    }
  };

  const growthPath = [
    {
      stage: 'Foundation',
      months: 3,
      revenue: 50000,
      key_lever: 'AOV Optimization (2.5x)',
      actions: ['Launch $119 bundles', 'Subscription model'],
      status: 'in_progress'
    },
    {
      stage: 'Channel Mastery', 
      months: 7,
      revenue: 125000,
      key_lever: 'TikTok + Amazon (2.2x)',
      actions: ['TikTok ads', 'Amazon FBA'],
      status: 'upcoming'
    },
    {
      stage: 'Diversification',
      months: 13,
      revenue: 300000,
      key_lever: 'Retail + B2B (2.8x)',
      actions: ['Target partnership', 'Premium line'],
      status: 'planned'
    },
    {
      stage: 'Geographic',
      months: 18,
      revenue: 600000,
      key_lever: 'International (4.2x)',
      actions: ['UK launch', 'EU expansion'],
      status: 'planned'
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleTakeAction = (action, stage) => {
    if (onActionClick) {
      onActionClick('path_to_10x', {
        text: action,
        stage: stage,
        type: 'growth_action'
      });
    }
  };

  const scenario = scenarios[selectedScenario];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl shadow-lg p-6">
      {/* Widget Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-600 rounded-xl">
          <TrendingUp size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Path to 10x Growth</h2>
          <p className="text-gray-600">From $29K to $297K-594K/month</p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex gap-2 mb-6">
        {Object.entries(scenarios).map(([key, scen]) => (
          <button
            key={key}
            onClick={() => setSelectedScenario(key)}
            className={`
              flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all
              ${selectedScenario === key 
                ? `bg-${scen.color}-600 text-white shadow-lg` 
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-center">
              <div className="text-lg font-bold">{scen.multiplier}</div>
              <div className="text-xs opacity-90">{scen.name}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Current vs Target Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Current Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMetrics.revenue)}</p>
          <p className="text-xs text-gray-500">per month</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-600 mb-1">Target Revenue</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(scenario.target_revenue)}</p>
          <p className="text-xs text-emerald-600">in {scenario.timeline}</p>
        </div>
      </div>

      {/* Growth Roadmap */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target size={20} />
          Growth Roadmap
        </h3>
        
        {growthPath.map((stage, index) => (
          <div key={stage.stage} className="relative">
            {/* Connection Line */}
            {index < growthPath.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300" />
            )}
            
            <div className={`
              border-2 rounded-2xl p-4 transition-all
              ${stage.status === 'in_progress' 
                ? 'border-yellow-300 bg-yellow-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white
                    ${stage.status === 'in_progress' 
                      ? 'bg-yellow-500' 
                      : stage.status === 'upcoming'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{stage.stage}</h4>
                    <p className="text-sm text-gray-600">Month {stage.months} • {formatCurrency(stage.revenue)}</p>
                  </div>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(stage.status)}
                `}>
                  {stage.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">{stage.key_lever}</p>
                <div className="flex flex-wrap gap-2">
                  {stage.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => handleTakeAction(action, stage.stage)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Success Factors */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap size={18} />
          Critical Success Factors
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Maintain 3.5x+ ROAS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>AOV to $119 (2.5x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span>3+ profitable channels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>International expansion</span>
          </div>
        </div>
      </div>

      {/* Next Action */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Next Critical Action</h3>
          <Calendar size={18} />
        </div>
        <p className="text-sm mb-3 opacity-90">
          Launch $119 bundle strategy to achieve 2.5x AOV increase
        </p>
        <button
          onClick={() => handleTakeAction('Launch Bundle Strategy', 'Foundation')}
          className="w-full bg-white text-emerald-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <span>Execute Bundle Launch</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Timeline Indicator */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span>Month 2 of 18 • Foundation Stage • 75% Complete</span>
        </div>
      </div>
    </div>
  );
}