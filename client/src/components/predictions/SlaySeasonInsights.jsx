import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Zap, 
  Star,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Users,
  BarChart3
} from 'lucide-react';
import { usePredictions } from '../../hooks/usePredictions';

export default function SlaySeasonInsights() {
  const { slaySeasonAnalysis, loading, fetchSlaySeasonAnalysis } = usePredictions();
  const [activeTab, setActiveTab] = useState('growth');

  useEffect(() => {
    if (!slaySeasonAnalysis) {
      fetchSlaySeasonAnalysis();
    }
  }, [slaySeasonAnalysis, fetchSlaySeasonAnalysis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-gray-400">Analyzing Slay Season performance...</p>
        </div>
      </div>
    );
  }

  if (!slaySeasonAnalysis?.slay_season_insights) {
    return (
      <div className="glass-card p-6">
        <p className="text-gray-400">No Slay Season analysis available</p>
      </div>
    );
  }

  const insights = slaySeasonAnalysis.slay_season_insights;

  const tabs = [
    { id: 'growth', label: '10-20x Growth', icon: TrendingUp },
    { id: 'creative', label: 'Creative Performance', icon: Zap },
    { id: 'products', label: 'Product Matrix', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaign Optimization', icon: Target },
    { id: 'scale', label: 'Scale Recommendations', icon: Star }
  ];

  const renderGrowthAnalysis = () => (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-green-400" />
          <span>Growth Trajectory Analysis</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-2">Current Performance</h4>
            <p className="text-gray-300 text-sm mb-4">
              {insights.growth_analysis.current_trajectory}
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="text-white font-medium">$29,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ROAS</span>
                <span className="text-green-400 font-medium">3.67x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Orders</span>
                <span className="text-white font-medium">608</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Growth Potential</h4>
            <p className="text-purple-300 text-sm mb-4">
              {insights.growth_analysis.growth_potential}
            </p>
            
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg">
              <p className="text-white font-medium text-center">
                {insights.growth_analysis.timeline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Levers */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Growth Levers</h3>
        <div className="grid gap-3">
          {insights.growth_analysis.key_levers.map((lever, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 flex-1">{lever}</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCreativePerformance = () => (
    <div className="space-y-6">
      {/* Fatigue Alert */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Fatigue Analysis</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            insights.creative_performance.current_fatigue_risk === 'HIGH' 
              ? 'bg-red-100/20 text-red-400'
              : insights.creative_performance.current_fatigue_risk === 'MEDIUM'
              ? 'bg-yellow-100/20 text-yellow-400'
              : 'bg-green-100/20 text-green-400'
          }`}>
            {insights.creative_performance.current_fatigue_risk} RISK
          </span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(insights.creative_performance.performance_breakdown).map(([type, data]) => (
            <div key={type} className="bg-black/20 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">{type}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance</span>
                  <span className={`font-medium ${
                    data.performance === 'High' ? 'text-green-400' :
                    data.performance === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {data.performance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fatigue</span>
                  <span className="text-white">{data.fatigue_days}d</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Creative Recommendations</h3>
        <div className="space-y-3">
          {insights.creative_performance.recommendations.map((rec, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 flex-1">{rec}</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductMatrix = () => (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span>Top Performing Products</span>
        </h3>
        
        <div className="space-y-3">
          {insights.product_performance.top_performers.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div>
                <h4 className="text-white font-medium">{product.sku}</h4>
                <p className="text-green-400 text-sm">Margin: {product.margin}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-lg">{product.velocity}</p>
                <p className="text-gray-400 text-sm">velocity</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Underperformers */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Attention Needed</span>
        </h3>
        
        <div className="space-y-3">
          {insights.product_performance.underperformers.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div>
                <h4 className="text-white font-medium">{product.sku}</h4>
                <p className="text-red-400 text-sm">{product.recommendation}</p>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-bold text-lg">{product.velocity}</p>
                <p className="text-gray-400 text-sm">velocity</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCampaignOptimization = () => (
    <div className="space-y-6">
      {/* Meta Campaigns */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-blue-400" />
          <span>Meta Campaigns</span>
        </h3>
        
        {insights.campaign_optimization.meta_campaigns.current_spend && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/20 rounded-lg">
              <p className="text-gray-400 mb-1">Current Spend</p>
              <p className="text-white font-bold text-xl">
                ${Math.round(insights.campaign_optimization.meta_campaigns.current_spend).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 mb-1">Recommended</p>
              <p className="text-blue-400 font-bold text-xl">
                ${Math.round(insights.campaign_optimization.meta_campaigns.recommended_spend).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 mb-1">Expected Return</p>
              <p className="text-green-400 font-bold text-xl">
                {insights.campaign_optimization.meta_campaigns.expected_return}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Campaigns */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-orange-400" />
          <span>Google Campaigns</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-black/20 rounded-lg">
            <p className="text-gray-400 mb-1">Current Spend</p>
            <p className="text-white font-bold text-xl">
              ${Math.round(insights.campaign_optimization.google_campaigns.current_spend).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-orange-400 mb-1">Recommended</p>
            <p className="text-orange-400 font-bold text-xl">
              ${Math.round(insights.campaign_optimization.google_campaigns.recommended_spend).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-green-400 mb-1">Expected Return</p>
            <p className="text-green-400 font-bold text-xl">
              {insights.campaign_optimization.google_campaigns.expected_return}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScaleRecommendations = () => (
    <div className="space-y-4">
      {insights.scale_recommendations.map((rec, index) => (
        <div key={index} className={`glass-card p-6 border-l-4 ${
          rec.priority === 'HIGH' 
            ? 'border-red-500' 
            : rec.priority === 'MEDIUM' 
            ? 'border-yellow-500' 
            : 'border-green-500'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rec.priority === 'HIGH' 
                    ? 'bg-red-100/20 text-red-400'
                    : rec.priority === 'MEDIUM'
                    ? 'bg-yellow-100/20 text-yellow-400'
                    : 'bg-green-100/20 text-green-400'
                }`}>
                  {rec.priority}
                </span>
                <span className="text-gray-400 text-sm">{rec.timeline}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">{rec.action}</h3>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-bold text-lg">{rec.expected_impact}</p>
              <p className="text-gray-400 text-sm">projected</p>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
              <span>Implement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 bg-black/20 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'growth' && renderGrowthAnalysis()}
        {activeTab === 'creative' && renderCreativePerformance()}
        {activeTab === 'products' && renderProductMatrix()}
        {activeTab === 'campaigns' && renderCampaignOptimization()}
        {activeTab === 'scale' && renderScaleRecommendations()}
      </div>
    </div>
  );
}