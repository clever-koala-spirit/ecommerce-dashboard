"""
Budget Optimization Model
Recommends optimal budget allocation for maximum ROI
Uses advanced ML to find the sweet spot between spend and returns
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from scipy.optimize import minimize_scalar
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import joblib
import os

logger = logging.getLogger(__name__)

class BudgetOptimizer:
    """
    Advanced budget optimization using:
    - ROI curve modeling
    - Diminishing returns analysis
    - Platform-specific efficiency curves
    - Seasonal adjustment factors
    - Risk-adjusted recommendations
    """
    
    def __init__(self):
        self.roi_model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.platform_efficiency = {
            'facebook': 1.0,
            'google': 1.1,    # Slightly better ROI historically
            'instagram': 0.9,  # Lower conversion rates
            'tiktok': 0.8      # Newer platform, less optimized
        }
        
    def is_ready(self) -> bool:
        """Check if model is ready for predictions"""
        return self.is_trained or self._load_pretrained_model()
    
    def _load_pretrained_model(self) -> bool:
        """Load pre-trained model if available"""
        try:
            model_path = "models/budget_optimizer_model.joblib"
            if os.path.exists(model_path):
                self.roi_model = joblib.load(model_path)
                self.is_trained = True
                logger.info("Loaded pre-trained budget optimization model")
                return True
        except Exception as e:
            logger.warning(f"Could not load pre-trained model: {e}")
        return False
    
    def optimize(self, current_spend: float, current_revenue: float,
                historical_performance: List[Dict[str, Any]], 
                constraints: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Optimize budget allocation for maximum ROI
        
        Args:
            current_spend: Current daily/weekly spend
            current_revenue: Current revenue from that spend
            historical_performance: Performance data over time
            constraints: Budget constraints and limits
            
        Returns:
            Optimization recommendations with confidence scores
        """
        
        try:
            # Analyze current performance
            current_roi = current_revenue / current_spend if current_spend > 0 else 0
            
            # Extract features for optimization
            features = self._extract_optimization_features(
                current_spend, current_revenue, historical_performance
            )
            
            # Find optimal budget range
            optimal_spend, expected_revenue = self._find_optimal_spend(
                features, current_spend, current_revenue, constraints
            )
            
            # Calculate confidence based on data quality
            confidence = self._calculate_confidence(historical_performance, features)
            
            # Generate recommendations
            budget_change = optimal_spend - current_spend
            revenue_increase = (expected_revenue - current_revenue) / current_revenue
            
            # Risk assessment
            risk_level = self._assess_risk(budget_change, current_spend, confidence)
            
            # Generate explanation
            explanation = self._generate_explanation(
                current_spend, optimal_spend, current_roi, expected_revenue / optimal_spend
            )
            
            # Generate actionable steps
            actions = self._generate_actions(
                budget_change, revenue_increase, risk_level, constraints
            )
            
            return {
                'current_spend': current_spend,
                'optimal_spend': optimal_spend,
                'budget_change': budget_change,
                'current_revenue': current_revenue,
                'expected_revenue': expected_revenue,
                'revenue_increase': revenue_increase,
                'current_roi': current_roi,
                'expected_roi': expected_revenue / optimal_spend,
                'confidence': confidence,
                'risk_level': risk_level,
                'explanation': explanation,
                'actions': actions
            }
            
        except Exception as e:
            logger.error(f"Budget optimization failed: {e}")
            return self._fallback_optimization(current_spend, current_revenue)
    
    def _extract_optimization_features(self, current_spend: float, 
                                     current_revenue: float,
                                     historical_data: List[Dict[str, Any]]) -> np.ndarray:
        """Extract features for budget optimization"""
        
        if len(historical_data) < 7:
            # Not enough data, use basic features
            return np.array([
                current_spend,
                current_revenue,
                current_revenue / current_spend if current_spend > 0 else 0,
                1.0,  # Default efficiency
                0.0,  # No trend data
                1.0,  # Default seasonality
                0.5   # Medium confidence
            ]).reshape(1, -1)
        
        df = pd.DataFrame(historical_data)
        df = df.sort_values('date')
        
        # Calculate moving averages and trends
        df['spend_ma7'] = df['spend'].rolling(7).mean()
        df['revenue_ma7'] = df['revenue'].rolling(7).mean()
        df['roi'] = df['revenue'] / df['spend']
        df['roi_ma7'] = df['roi'].rolling(7).mean()
        
        # Trend analysis
        recent_spend_trend = self._calculate_trend(df['spend'].tail(14).values)
        recent_revenue_trend = self._calculate_trend(df['revenue'].tail(14).values)
        roi_trend = self._calculate_trend(df['roi'].tail(14).values)
        
        # Efficiency score (how well current spend converts)
        avg_roi = df['roi'].mean()
        current_roi = current_revenue / current_spend if current_spend > 0 else 0
        efficiency_score = current_roi / avg_roi if avg_roi > 0 else 1.0
        
        # Seasonality factor (simplified)
        day_of_week = datetime.now().weekday()
        seasonality_factors = [1.0, 1.05, 1.1, 1.15, 1.2, 0.9, 0.8]  # Mon-Sun
        seasonality = seasonality_factors[day_of_week]
        
        # Platform performance (if available)
        platform_performance = self._calculate_platform_performance(df)
        
        features = np.array([
            current_spend,
            current_revenue,
            current_roi,
            efficiency_score,
            roi_trend,
            seasonality,
            platform_performance,
            len(df),  # Data points available
            df['spend'].var(),  # Spend variability
            df['roi'].var()     # ROI variability
        ]).reshape(1, -1)
        
        return features
    
    def _calculate_trend(self, values: np.ndarray) -> float:
        """Calculate trend slope for a series of values"""
        if len(values) < 3:
            return 0.0
        
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        return slope
    
    def _calculate_platform_performance(self, df: pd.DataFrame) -> float:
        """Calculate overall platform performance factor"""
        if 'platform' not in df.columns:
            return 1.0
        
        platform_rois = {}
        for platform in df['platform'].unique():
            platform_df = df[df['platform'] == platform]
            platform_rois[platform] = platform_df['roi'].mean()
        
        # Weighted average based on spend
        total_performance = 0
        total_spend = 0
        
        for platform, roi in platform_rois.items():
            platform_spend = df[df['platform'] == platform]['spend'].sum()
            efficiency = self.platform_efficiency.get(platform.lower(), 1.0)
            total_performance += roi * efficiency * platform_spend
            total_spend += platform_spend
        
        return total_performance / total_spend if total_spend > 0 else 1.0
    
    def _find_optimal_spend(self, features: np.ndarray, current_spend: float,
                          current_revenue: float, constraints: Optional[Dict[str, Any]]) -> Tuple[float, float]:
        """Find optimal spend level using ROI curve modeling"""
        
        # Define constraints
        min_spend = constraints.get('min_spend', current_spend * 0.5) if constraints else current_spend * 0.5
        max_spend = constraints.get('max_spend', current_spend * 3.0) if constraints else current_spend * 3.0
        
        if not self.is_trained:
            # Use rule-based optimization
            return self._rule_based_optimization(current_spend, current_revenue, constraints)
        
        def negative_roi_function(spend):
            """Function to minimize (negative ROI)"""
            try:
                # Modify features for this spend level
                modified_features = features.copy()
                modified_features[0, 0] = spend  # Update spend
                
                # Predict revenue for this spend level
                predicted_revenue = self.roi_model.predict(modified_features)[0] * spend
                
                # Return negative ROI (we want to maximize ROI)
                roi = predicted_revenue / spend if spend > 0 else 0
                return -roi
                
            except:
                return -1.0  # Fallback
        
        # Find optimal spend
        result = minimize_scalar(
            negative_roi_function,
            bounds=(min_spend, max_spend),
            method='bounded'
        )
        
        optimal_spend = result.x
        expected_roi = -result.fun
        expected_revenue = expected_roi * optimal_spend
        
        return optimal_spend, expected_revenue
    
    def _rule_based_optimization(self, current_spend: float, current_revenue: float,
                               constraints: Optional[Dict[str, Any]]) -> Tuple[float, float]:
        """Rule-based optimization when model isn't available"""
        
        current_roi = current_revenue / current_spend if current_spend > 0 else 0
        
        # Conservative increase if ROI is good
        if current_roi > 3.0:  # Good ROI, can increase spend
            optimal_spend = current_spend * 1.4
        elif current_roi > 2.0:  # Decent ROI, moderate increase
            optimal_spend = current_spend * 1.2
        elif current_roi > 1.0:  # Break-even+, small increase
            optimal_spend = current_spend * 1.1
        else:  # Poor ROI, consider reducing
            optimal_spend = current_spend * 0.9
        
        # Apply constraints
        if constraints:
            optimal_spend = max(constraints.get('min_spend', 0), optimal_spend)
            optimal_spend = min(constraints.get('max_spend', optimal_spend * 2), optimal_spend)
        
        # Assume slight diminishing returns
        expected_roi = current_roi * 0.95  # Slight decrease due to increased spend
        expected_revenue = expected_roi * optimal_spend
        
        return optimal_spend, expected_revenue
    
    def _calculate_confidence(self, historical_data: List[Dict[str, Any]], 
                            features: np.ndarray) -> float:
        """Calculate confidence in optimization recommendation"""
        
        base_confidence = 0.4
        
        # More data = higher confidence
        if len(historical_data) >= 30:
            base_confidence = 0.9
        elif len(historical_data) >= 14:
            base_confidence = 0.75
        elif len(historical_data) >= 7:
            base_confidence = 0.6
        
        # Stable performance = higher confidence
        if len(historical_data) >= 7:
            df = pd.DataFrame(historical_data)
            roi_variance = df['revenue'].var() / df['spend'].var() if df['spend'].var() > 0 else 1
            stability_factor = min(1.0, 1.0 / (1.0 + roi_variance))
            base_confidence *= stability_factor
        
        return min(0.95, base_confidence)
    
    def _assess_risk(self, budget_change: float, current_spend: float, confidence: float) -> str:
        """Assess risk level of budget change recommendation"""
        
        change_percent = abs(budget_change) / current_spend if current_spend > 0 else 0
        
        if change_percent > 0.5 or confidence < 0.5:
            return "HIGH"
        elif change_percent > 0.25 or confidence < 0.7:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_explanation(self, current_spend: float, optimal_spend: float,
                            current_roi: float, expected_roi: float) -> str:
        """Generate human-readable explanation"""
        
        change_percent = (optimal_spend - current_spend) / current_spend
        roi_change = expected_roi - current_roi
        
        if change_percent > 0.1:
            return f"Increasing budget by {change_percent:.0%} should improve ROI from {current_roi:.1f}x to {expected_roi:.1f}x based on performance curves."
        elif change_percent < -0.1:
            return f"Reducing budget by {abs(change_percent):.0%} should improve efficiency. Current spend may be hitting diminishing returns."
        else:
            return f"Current budget is near optimal. Minor adjustment of {change_percent:.0%} recommended for fine-tuning."
    
    def _generate_actions(self, budget_change: float, revenue_increase: float,
                         risk_level: str, constraints: Optional[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations"""
        
        actions = []
        
        if abs(budget_change) < 50:
            actions.append("Current budget is well-optimized")
            actions.append("Monitor performance and make minor adjustments")
        elif budget_change > 0:
            if risk_level == "HIGH":
                actions.extend([
                    f"CAUTION: Large budget increase recommended (+${budget_change:.0f})",
                    "Test increase gradually in 25% increments",
                    "Monitor ROI closely for first 7 days",
                    "Have rollback plan ready"
                ])
            else:
                actions.extend([
                    f"Increase budget by ${budget_change:.0f}",
                    f"Expected revenue increase: {revenue_increase:.0%}",
                    "Monitor performance over next 3-5 days",
                    "Scale further if results are positive"
                ])
        else:
            actions.extend([
                f"Reduce budget by ${abs(budget_change):.0f}",
                "Hitting diminishing returns at current spend level",
                "Focus on improving creative performance",
                "Reallocate savings to testing new audiences"
            ])
        
        # Add platform-specific recommendations
        actions.extend([
            "Review performance by platform and time of day",
            "Consider dayparting optimizations",
            "Test budget allocation across different campaigns"
        ])
        
        return actions
    
    def _fallback_optimization(self, current_spend: float, current_revenue: float) -> Dict[str, Any]:
        """Fallback when optimization fails"""
        
        current_roi = current_revenue / current_spend if current_spend > 0 else 0
        
        return {
            'current_spend': current_spend,
            'optimal_spend': current_spend * 1.1,  # Conservative 10% increase
            'budget_change': current_spend * 0.1,
            'current_revenue': current_revenue,
            'expected_revenue': current_revenue * 1.05,  # Conservative 5% increase
            'revenue_increase': 0.05,
            'current_roi': current_roi,
            'expected_roi': current_roi * 0.95,  # Account for diminishing returns
            'confidence': 0.3,
            'risk_level': "MEDIUM",
            'explanation': "Limited data available. Using conservative optimization strategy.",
            'actions': [
                "Collect more performance data for better optimization",
                "Test small budget increases gradually",
                "Monitor ROI closely"
            ]
        }
    
    def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train the budget optimization model"""
        
        try:
            # Prepare training data
            X, y = self._prepare_training_data(training_data)
            
            if len(X) < 20:
                logger.warning("Insufficient training data for budget optimization model")
                return {'error': 'insufficient_data'}
            
            # Create and train model
            self.roi_model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.roi_model.fit(X_scaled, y)
            self.is_trained = True
            
            # Cross-validation score
            cv_scores = cross_val_score(self.roi_model, X_scaled, y, cv=5, scoring='r2')
            
            # Save model
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.roi_model, 'models/budget_optimizer_model.joblib')
            joblib.dump(self.scaler, 'models/budget_optimizer_scaler.joblib')
            
            logger.info(f"Budget optimization model trained. CV R²: {cv_scores.mean():.3f}")
            
            return {
                'cv_r2_mean': cv_scores.mean(),
                'cv_r2_std': cv_scores.std(),
                'training_samples': len(X),
                'model_saved': True
            }
            
        except Exception as e:
            logger.error(f"Budget optimization model training failed: {e}")
            return {'error': str(e)}
    
    def _prepare_training_data(self, training_data: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data for model"""
        
        X = []
        y = []
        
        for item in training_data:
            try:
                features = self._extract_optimization_features(
                    item['spend'],
                    item['revenue'],
                    item.get('historical_data', [])
                )
                
                X.append(features.flatten())
                y.append(item['roi'])  # Target is ROI
                
            except Exception as e:
                logger.warning(f"Skipping training sample: {e}")
                continue
        
        return np.array(X), np.array(y)