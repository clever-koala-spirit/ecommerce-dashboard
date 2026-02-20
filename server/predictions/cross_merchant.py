"""
Cross-Merchant Intelligence Model
Provides competitive insights and benchmarks across similar merchants
Uses collaborative intelligence to identify opportunities
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
import joblib
import os

logger = logging.getLogger(__name__)

class CrossMerchantIntelligence:
    """
    Provides cross-merchant insights using:
    - Merchant similarity clustering
    - Performance benchmarking
    - Best practice identification
    - Opportunity scoring
    - Competitive gap analysis
    - Success pattern recognition
    """
    
    def __init__(self):
        self.similarity_model = None
        self.scaler = StandardScaler()
        self.is_ready_state = False
        
        # Merchant archetypes and their characteristics
        self.merchant_archetypes = {
            'high_volume_low_margin': {
                'order_volume': (1000, float('inf')),
                'avg_order_value': (0, 50),
                'profit_margin': (0, 0.2),
                'characteristics': ['high frequency', 'price sensitive customers', 'scale efficiency']
            },
            'premium_brand': {
                'order_volume': (50, 500),
                'avg_order_value': (100, float('inf')),
                'profit_margin': (0.3, 1.0),
                'characteristics': ['brand loyalty', 'quality focus', 'premium positioning']
            },
            'mid_market': {
                'order_volume': (200, 1000),
                'avg_order_value': (50, 150),
                'profit_margin': (0.15, 0.35),
                'characteristics': ['balanced approach', 'growth focused', 'optimization oriented']
            },
            'niche_specialist': {
                'order_volume': (10, 200),
                'avg_order_value': (75, 300),
                'profit_margin': (0.25, 0.6),
                'characteristics': ['specialized products', 'expert positioning', 'loyal customer base']
            }
        }
        
        # Performance benchmarks by archetype
        self.benchmarks = {
            'conversion_rate': {'excellent': 0.05, 'good': 0.03, 'average': 0.02, 'poor': 0.01},
            'customer_retention': {'excellent': 0.6, 'good': 0.4, 'average': 0.25, 'poor': 0.15},
            'lifetime_value': {'excellent': 500, 'good': 300, 'average': 200, 'poor': 100},
            'roas': {'excellent': 4.0, 'good': 3.0, 'average': 2.5, 'poor': 2.0}
        }
        
    def is_ready(self) -> bool:
        """Check if intelligence system is ready"""
        if not self.is_ready_state:
            self._initialize_intelligence()
        return self.is_ready_state
    
    def _initialize_intelligence(self) -> bool:
        """Initialize intelligence system with baseline data"""
        try:
            # Load or create baseline merchant data
            baseline_path = "data/merchant_baseline.json"
            if os.path.exists(baseline_path):
                # Load existing baseline
                self.is_ready_state = True
                logger.info("Loaded merchant intelligence baseline")
                return True
            else:
                # Create minimal baseline for demonstration
                self._create_baseline_data()
                self.is_ready_state = True
                logger.info("Created baseline merchant intelligence data")
                return True
        except Exception as e:
            logger.warning(f"Could not initialize intelligence system: {e}")
            return False
    
    def _create_baseline_data(self):
        """Create baseline merchant data for comparisons"""
        # This would normally be populated from real merchant data
        # For now, create synthetic baseline data
        self.baseline_merchants = {
            'high_volume_low_margin': {
                'count': 15,
                'avg_metrics': {
                    'conversion_rate': 0.025,
                    'aov': 35,
                    'customer_retention': 0.3,
                    'roas': 2.8,
                    'lifetime_value': 180
                }
            },
            'premium_brand': {
                'count': 8,
                'avg_metrics': {
                    'conversion_rate': 0.04,
                    'aov': 180,
                    'customer_retention': 0.5,
                    'roas': 3.5,
                    'lifetime_value': 450
                }
            },
            'mid_market': {
                'count': 25,
                'avg_metrics': {
                    'conversion_rate': 0.03,
                    'aov': 85,
                    'customer_retention': 0.35,
                    'roas': 3.0,
                    'lifetime_value': 280
                }
            },
            'niche_specialist': {
                'count': 12,
                'avg_metrics': {
                    'conversion_rate': 0.045,
                    'aov': 150,
                    'customer_retention': 0.45,
                    'roas': 3.8,
                    'lifetime_value': 380
                }
            }
        }
    
    def get_insights(self, merchant_profile: Dict[str, Any],
                    benchmark_categories: List[str]) -> Dict[str, Any]:
        """
        Generate cross-merchant intelligence insights
        
        Args:
            merchant_profile: Current merchant's profile and metrics
            benchmark_categories: Categories to benchmark against
            
        Returns:
            Intelligence insights with opportunities and recommendations
        """
        
        try:
            # Classify merchant archetype
            archetype = self._classify_merchant_archetype(merchant_profile)
            
            # Find similar merchants
            similar_merchants = self._find_similar_merchants(merchant_profile, archetype)
            
            # Perform benchmark analysis
            benchmark_results = self._perform_benchmark_analysis(
                merchant_profile, archetype, benchmark_categories
            )
            
            # Identify opportunities
            opportunities = self._identify_opportunities(
                merchant_profile, benchmark_results, similar_merchants
            )
            
            # Calculate confidence based on data quality and sample size
            confidence = self._calculate_confidence(
                merchant_profile, similar_merchants, archetype
            )
            
            # Generate top opportunity recommendation
            top_opportunity = self._select_top_opportunity(opportunities)
            
            # Generate explanation
            explanation = self._generate_explanation(
                archetype, benchmark_results, top_opportunity
            )
            
            # Generate actionable recommendations
            actions = self._generate_actions(opportunities, archetype, merchant_profile)
            
            return {
                'merchant_archetype': archetype,
                'similar_merchants_count': len(similar_merchants),
                'benchmark_results': benchmark_results,
                'opportunities': opportunities,
                'top_opportunity': top_opportunity['name'],
                'opportunity_metric': f"+{top_opportunity['impact']:.0%} {top_opportunity['metric']}",
                'confidence': confidence,
                'explanation': explanation,
                'actions': actions
            }
            
        except Exception as e:
            logger.error(f"Cross-merchant intelligence failed: {e}")
            return self._fallback_insights(merchant_profile)
    
    def _classify_merchant_archetype(self, merchant_profile: Dict[str, Any]) -> str:
        """Classify merchant into archetype based on business metrics"""
        
        order_volume = merchant_profile.get('monthly_orders', 0)
        aov = merchant_profile.get('avg_order_value', 0)
        margin = merchant_profile.get('profit_margin', 0.2)
        
        # Score each archetype
        archetype_scores = {}
        
        for archetype, criteria in self.merchant_archetypes.items():
            score = 0
            
            # Order volume score
            vol_min, vol_max = criteria['order_volume']
            if vol_min <= order_volume <= vol_max:
                score += 1
            
            # AOV score
            aov_min, aov_max = criteria['avg_order_value']
            if aov_min <= aov <= aov_max:
                score += 1
            
            # Margin score
            margin_min, margin_max = criteria['profit_margin']
            if margin_min <= margin <= margin_max:
                score += 1
            
            archetype_scores[archetype] = score
        
        # Return archetype with highest score
        best_archetype = max(archetype_scores.items(), key=lambda x: x[1])
        return best_archetype[0] if best_archetype[1] > 0 else 'mid_market'
    
    def _find_similar_merchants(self, merchant_profile: Dict[str, Any], 
                              archetype: str) -> List[Dict[str, Any]]:
        """Find merchants with similar profiles for benchmarking"""
        
        # In a real implementation, this would query a database of merchant profiles
        # For demonstration, we'll use synthetic similar merchants
        
        base_metrics = self.baseline_merchants[archetype]['avg_metrics']
        similar_count = self.baseline_merchants[archetype]['count']
        
        similar_merchants = []
        for i in range(min(10, similar_count)):  # Return up to 10 similar merchants
            # Generate synthetic merchant with some variance
            variance_factor = np.random.normal(1.0, 0.15)  # ±15% variance
            
            similar_merchant = {
                'merchant_id': f"similar_{archetype}_{i}",
                'conversion_rate': base_metrics['conversion_rate'] * variance_factor,
                'aov': base_metrics['aov'] * variance_factor,
                'customer_retention': base_metrics['customer_retention'] * variance_factor,
                'roas': base_metrics['roas'] * variance_factor,
                'lifetime_value': base_metrics['lifetime_value'] * variance_factor
            }
            similar_merchants.append(similar_merchant)
        
        return similar_merchants
    
    def _perform_benchmark_analysis(self, merchant_profile: Dict[str, Any],
                                  archetype: str, benchmark_categories: List[str]) -> Dict[str, Any]:
        """Perform detailed benchmark analysis"""
        
        results = {}
        base_metrics = self.baseline_merchants[archetype]['avg_metrics']
        
        # Analyze each requested benchmark category
        for category in benchmark_categories:
            if category in merchant_profile and category in base_metrics:
                current_value = merchant_profile[category]
                benchmark_value = base_metrics[category]
                
                # Calculate performance ratio
                if benchmark_value > 0:
                    performance_ratio = current_value / benchmark_value
                    
                    if performance_ratio >= 1.2:
                        performance_level = 'excellent'
                        gap_description = f"+{(performance_ratio - 1) * 100:.0f}% above average"
                    elif performance_ratio >= 1.1:
                        performance_level = 'good'
                        gap_description = f"+{(performance_ratio - 1) * 100:.0f}% above average"
                    elif performance_ratio >= 0.9:
                        performance_level = 'average'
                        gap_description = "near average"
                    else:
                        performance_level = 'below_average'
                        gap_description = f"{(1 - performance_ratio) * 100:.0f}% below average"
                    
                    results[category] = {
                        'current_value': current_value,
                        'benchmark_value': benchmark_value,
                        'performance_ratio': performance_ratio,
                        'performance_level': performance_level,
                        'gap_description': gap_description,
                        'improvement_potential': max(0, benchmark_value - current_value)
                    }
        
        return results
    
    def _identify_opportunities(self, merchant_profile: Dict[str, Any],
                              benchmark_results: Dict[str, Any],
                              similar_merchants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify improvement opportunities based on benchmarks"""
        
        opportunities = []
        
        # Analyze each benchmark for opportunities
        for metric, results in benchmark_results.items():
            if results['performance_level'] in ['below_average', 'average']:
                # Calculate potential impact
                improvement_potential = results['improvement_potential']
                current_value = results['current_value']
                
                if improvement_potential > 0:
                    impact_percentage = improvement_potential / current_value
                    
                    # Determine difficulty and timeline
                    difficulty, timeline = self._assess_improvement_difficulty(metric, impact_percentage)
                    
                    opportunity = {
                        'name': f"Improve {metric.replace('_', ' ').title()}",
                        'metric': metric,
                        'current_value': current_value,
                        'target_value': results['benchmark_value'],
                        'impact': impact_percentage,
                        'difficulty': difficulty,
                        'timeline': timeline,
                        'description': self._get_opportunity_description(metric, impact_percentage)
                    }
                    
                    opportunities.append(opportunity)
        
        # Sort by impact potential
        opportunities.sort(key=lambda x: x['impact'], reverse=True)
        
        return opportunities
    
    def _assess_improvement_difficulty(self, metric: str, impact: float) -> Tuple[str, str]:
        """Assess difficulty and timeline for improvement"""
        
        # Metric-specific difficulty assessments
        difficulty_map = {
            'conversion_rate': ('medium', '2-3 months'),
            'roas': ('medium', '1-2 months'),
            'customer_retention': ('hard', '3-6 months'),
            'avg_order_value': ('easy', '2-4 weeks'),
            'lifetime_value': ('hard', '6-12 months')
        }
        
        base_difficulty, base_timeline = difficulty_map.get(metric, ('medium', '1-3 months'))
        
        # Adjust for impact size
        if impact > 0.5:  # >50% improvement needed
            difficulty = 'hard'
            timeline = '3-6 months'
        elif impact > 0.25:  # 25-50% improvement
            difficulty = 'medium'
            timeline = '1-3 months'
        else:  # <25% improvement
            difficulty = 'easy'
            timeline = '2-6 weeks'
        
        return difficulty, timeline
    
    def _get_opportunity_description(self, metric: str, impact: float) -> str:
        """Get description for improvement opportunity"""
        
        descriptions = {
            'conversion_rate': f"Optimize checkout flow and product pages to increase conversions by {impact:.0%}",
            'roas': f"Improve ad targeting and creative performance to boost ROAS by {impact:.0%}",
            'customer_retention': f"Implement retention campaigns to improve repeat purchase rate by {impact:.0%}",
            'avg_order_value': f"Use upselling and bundling strategies to increase AOV by {impact:.0%}",
            'lifetime_value': f"Focus on customer experience and retention to grow LTV by {impact:.0%}"
        }
        
        return descriptions.get(metric, f"Improve {metric} by {impact:.0%} through strategic optimization")
    
    def _select_top_opportunity(self, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Select the top opportunity based on impact and feasibility"""
        
        if not opportunities:
            return {
                'name': 'Data Collection',
                'impact': 0.1,
                'metric': 'analytics',
                'description': 'Focus on collecting more performance data for better insights'
            }
        
        # Score opportunities by impact/difficulty ratio
        for opp in opportunities:
            difficulty_scores = {'easy': 3, 'medium': 2, 'hard': 1}
            difficulty_score = difficulty_scores.get(opp['difficulty'], 2)
            opp['feasibility_score'] = opp['impact'] * difficulty_score
        
        # Return highest scoring opportunity
        return max(opportunities, key=lambda x: x['feasibility_score'])
    
    def _calculate_confidence(self, merchant_profile: Dict[str, Any],
                            similar_merchants: List[Dict[str, Any]], 
                            archetype: str) -> float:
        """Calculate confidence in insights"""
        
        base_confidence = 0.6
        
        # More similar merchants = higher confidence
        similar_count = len(similar_merchants)
        if similar_count >= 8:
            base_confidence = 0.9
        elif similar_count >= 5:
            base_confidence = 0.8
        elif similar_count >= 3:
            base_confidence = 0.7
        
        # Complete merchant profile = higher confidence
        profile_completeness = sum(1 for key in ['monthly_orders', 'avg_order_value', 'conversion_rate', 'roas'] 
                                 if key in merchant_profile) / 4.0
        base_confidence *= profile_completeness
        
        # Well-established archetype = higher confidence
        archetype_confidence = {
            'mid_market': 1.0,
            'premium_brand': 0.95,
            'high_volume_low_margin': 0.9,
            'niche_specialist': 0.85
        }
        base_confidence *= archetype_confidence.get(archetype, 0.8)
        
        return min(0.95, base_confidence)
    
    def _generate_explanation(self, archetype: str, benchmark_results: Dict[str, Any],
                            top_opportunity: Dict[str, Any]) -> str:
        """Generate explanation of insights"""
        
        archetype_desc = {
            'high_volume_low_margin': 'high-volume, efficiency-focused',
            'premium_brand': 'premium, brand-focused',
            'mid_market': 'balanced growth-oriented',
            'niche_specialist': 'specialized, expertise-driven'
        }
        
        business_type = archetype_desc.get(archetype, 'similar')
        
        # Find worst performing metric
        worst_metric = None
        worst_gap = 0
        
        for metric, results in benchmark_results.items():
            if results['performance_ratio'] < 1.0:
                gap = 1.0 - results['performance_ratio']
                if gap > worst_gap:
                    worst_gap = gap
                    worst_metric = metric
        
        if worst_metric:
            return f"Compared to {business_type} businesses, your {worst_metric.replace('_', ' ')} is {worst_gap:.0%} below average. {top_opportunity['description']}"
        else:
            return f"Your {business_type} business is performing well across key metrics. Focus on {top_opportunity['name'].lower()} for continued growth."
    
    def _generate_actions(self, opportunities: List[Dict[str, Any]], 
                         archetype: str, merchant_profile: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        
        actions = []
        
        # Top 3 opportunities
        for opp in opportunities[:3]:
            if opp['difficulty'] == 'easy':
                urgency = "QUICK WIN: "
            elif opp['impact'] > 0.3:
                urgency = "HIGH IMPACT: "
            else:
                urgency = ""
            
            actions.append(f"{urgency}{opp['description']}")
        
        # Archetype-specific recommendations
        archetype_actions = {
            'high_volume_low_margin': [
                "Focus on automation and process efficiency",
                "Implement dynamic pricing strategies",
                "Optimize supply chain and inventory management"
            ],
            'premium_brand': [
                "Invest in brand storytelling and content",
                "Enhance customer service experience",
                "Build exclusive customer communities"
            ],
            'mid_market': [
                "Balance growth investments across channels",
                "Implement comprehensive testing programs",
                "Focus on customer acquisition cost optimization"
            ],
            'niche_specialist': [
                "Leverage expertise for content marketing",
                "Build strategic partnerships in your niche",
                "Develop customer education programs"
            ]
        }
        
        actions.extend(archetype_actions.get(archetype, [])[:2])
        
        return actions
    
    def _fallback_insights(self, merchant_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback insights when analysis fails"""
        
        return {
            'merchant_archetype': 'unknown',
            'similar_merchants_count': 0,
            'benchmark_results': {},
            'opportunities': [],
            'top_opportunity': 'Data Collection',
            'opportunity_metric': '+15% analytics improvement',
            'confidence': 0.3,
            'explanation': "Limited data available for merchant comparison. Focus on data collection and baseline establishment.",
            'actions': [
                "Implement comprehensive analytics tracking",
                "Collect customer behavior data",
                "Establish performance baselines",
                "Connect all marketing channels for data integration"
            ]
        }
    
    def update_merchant_database(self, merchant_data: Dict[str, Any]) -> bool:
        """Update the merchant intelligence database with new data"""
        
        try:
            # In a real implementation, this would update a database
            # For now, we'll simulate the update
            logger.info(f"Updated merchant database with data for {merchant_data.get('merchant_id', 'unknown')}")
            return True
        except Exception as e:
            logger.error(f"Failed to update merchant database: {e}")
            return False
    
    def get_benchmark_report(self, archetype: str) -> Dict[str, Any]:
        """Generate a detailed benchmark report for an archetype"""
        
        if archetype not in self.baseline_merchants:
            return {'error': 'Unknown archetype'}
        
        archetype_data = self.baseline_merchants[archetype]
        
        return {
            'archetype': archetype,
            'merchant_count': archetype_data['count'],
            'characteristics': self.merchant_archetypes[archetype]['characteristics'],
            'average_metrics': archetype_data['avg_metrics'],
            'benchmarks': {
                metric: {
                    'excellent': self.benchmarks[metric]['excellent'],
                    'good': self.benchmarks[metric]['good'],
                    'average': self.benchmarks[metric]['average']
                }
                for metric in self.benchmarks.keys()
                if metric in archetype_data['avg_metrics']
            }
        }