"""
Creative Fatigue Prediction Model
Predicts when ad creatives will hit performance fatigue
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error
from scipy.stats import linregress
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import joblib
import os

logger = logging.getLogger(__name__)

class CreativeFatiguePredictor:
    """
    Predicts creative fatigue using multiple signals:
    - CTR decline rate
    - CPM increase rate  
    - Engagement drop patterns
    - Historical fatigue cycles
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            'ctr_trend', 'cpm_trend', 'engagement_trend', 'frequency_avg',
            'days_running', 'impressions_total', 'spend_total',
            'platform_factor', 'creative_type_factor', 'audience_size'
        ]
        
    def is_ready(self) -> bool:
        """Check if model is ready for predictions"""
        return self.is_trained or self._load_pretrained_model()
    
    def _load_pretrained_model(self) -> bool:
        """Load pre-trained model if available"""
        try:
            model_path = "models/creative_fatigue_model.joblib"
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.is_trained = True
                logger.info("Loaded pre-trained creative fatigue model")
                return True
        except Exception as e:
            logger.warning(f"Could not load pre-trained model: {e}")
        return False
    
    def extract_features(self, current_metrics: Dict[str, float], 
                        historical_data: List[Dict[str, Any]], 
                        platform: str) -> np.ndarray:
        """Extract features for fatigue prediction"""
        
        # Convert historical data to DataFrame
        df = pd.DataFrame(historical_data)
        if len(df) < 3:
            # Not enough data for trend analysis, use defaults
            return self._get_default_features(current_metrics, platform)
        
        df = df.sort_values('date')
        
        # Calculate trends over last 7 days
        recent_df = df.tail(7)
        
        # CTR trend (slope of CTR over time)
        ctr_values = recent_df['ctr'].values
        days = np.arange(len(ctr_values))
        ctr_slope, _, _, _, _ = linregress(days, ctr_values)
        
        # CPM trend
        cpm_values = recent_df['cpm'].values
        cpm_slope, _, _, _, _ = linregress(days, cpm_values)
        
        # Engagement trend
        if 'engagement_rate' in recent_df.columns:
            eng_values = recent_df['engagement_rate'].values
            eng_slope, _, _, _, _ = linregress(days, eng_values)
        else:
            eng_slope = 0
        
        # Platform factors
        platform_factors = {
            'facebook': 1.0,
            'instagram': 1.2,  # Generally faster fatigue
            'google': 0.8,     # Slower fatigue
            'tiktok': 1.5      # Very fast fatigue
        }
        
        features = np.array([
            ctr_slope,  # Negative slope indicates declining CTR
            cpm_slope,  # Positive slope indicates increasing costs
            eng_slope,  # Negative slope indicates declining engagement
            df['frequency'].mean() if 'frequency' in df.columns else 2.0,
            len(df),    # Days running
            df['impressions'].sum(),
            df['spend'].sum(),
            platform_factors.get(platform.lower(), 1.0),
            current_metrics.get('creative_type_factor', 1.0),
            current_metrics.get('audience_size', 100000)
        ])
        
        return features.reshape(1, -1)
    
    def _get_default_features(self, current_metrics: Dict[str, float], 
                             platform: str) -> np.ndarray:
        """Generate default features when insufficient historical data"""
        platform_factors = {
            'facebook': 1.0, 'instagram': 1.2, 'google': 0.8, 'tiktok': 1.5
        }
        
        # Conservative estimates
        features = np.array([
            -0.001,  # Small negative CTR trend
            0.05,    # Small positive CPM trend
            -0.005,  # Small negative engagement trend
            current_metrics.get('frequency', 2.0),
            current_metrics.get('days_running', 3),
            current_metrics.get('impressions', 10000),
            current_metrics.get('spend', 500),
            platform_factors.get(platform.lower(), 1.0),
            1.0,     # Default creative type
            100000   # Default audience size
        ])
        
        return features.reshape(1, -1)
    
    def predict_fatigue(self, creative_id: str, platform: str,
                       current_metrics: Dict[str, float],
                       historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict creative fatigue timeline
        
        Args:
            creative_id: Unique identifier for the creative
            platform: Ad platform (facebook, google, etc.)
            current_metrics: Current performance metrics
            historical_data: Historical performance data
            
        Returns:
            Dict with prediction results
        """
        
        try:
            # Extract features
            features = self.extract_features(current_metrics, historical_data, platform)
            
            if not self.is_trained:
                # Use rule-based prediction if no trained model
                return self._rule_based_prediction(features, current_metrics, platform)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make prediction
            days_to_fatigue = self.model.predict(features_scaled)[0]
            
            # Calculate confidence based on feature stability
            confidence = self._calculate_confidence(features, historical_data)
            
            # Generate explanation
            explanation = self._generate_explanation(features, days_to_fatigue, platform)
            
            # Generate recommended actions
            actions = self._generate_actions(days_to_fatigue, current_metrics, platform)
            
            return {
                'creative_id': creative_id,
                'days_to_fatigue': max(1, int(days_to_fatigue)),
                'confidence': confidence,
                'explanation': explanation,
                'actions': actions,
                'risk_level': self._assess_risk_level(days_to_fatigue)
            }
            
        except Exception as e:
            logger.error(f"Fatigue prediction failed for {creative_id}: {e}")
            return self._fallback_prediction(creative_id, platform)
    
    def _rule_based_prediction(self, features: np.ndarray, 
                              current_metrics: Dict[str, float],
                              platform: str) -> Dict[str, Any]:
        """Rule-based prediction when model isn't trained"""
        
        # Platform-specific base fatigue cycles
        base_cycles = {
            'facebook': 7,
            'instagram': 5,
            'google': 14,
            'tiktok': 3
        }
        
        base_days = base_cycles.get(platform.lower(), 7)
        
        # Adjust based on current performance
        ctr = current_metrics.get('ctr', 0.02)
        frequency = current_metrics.get('frequency', 2.0)
        
        # Higher frequency = faster fatigue
        frequency_factor = max(0.5, 2.0 - (frequency - 1.0) * 0.3)
        
        # Lower CTR = closer to fatigue
        ctr_factor = min(2.0, max(0.3, ctr / 0.02))
        
        predicted_days = int(base_days * frequency_factor * ctr_factor)
        
        return {
            'days_to_fatigue': max(1, predicted_days),
            'confidence': 0.65,  # Medium confidence for rule-based
            'explanation': f"Based on {platform} typical cycles and current metrics",
            'actions': self._generate_actions(predicted_days, current_metrics, platform),
            'risk_level': self._assess_risk_level(predicted_days)
        }
    
    def _calculate_confidence(self, features: np.ndarray, 
                             historical_data: List[Dict[str, Any]]) -> float:
        """Calculate prediction confidence score"""
        
        if len(historical_data) < 3:
            return 0.4  # Low confidence with little data
        
        # More data points = higher confidence
        data_confidence = min(0.9, len(historical_data) / 14.0)
        
        # Trend stability (less variance = higher confidence)
        df = pd.DataFrame(historical_data)
        ctr_variance = df['ctr'].var() if 'ctr' in df.columns else 0.001
        stability_confidence = 1.0 / (1.0 + ctr_variance * 1000)
        
        return (data_confidence + stability_confidence) / 2.0
    
    def _generate_explanation(self, features: np.ndarray, 
                             days_to_fatigue: float, platform: str) -> str:
        """Generate human-readable explanation"""
        
        risk_level = self._assess_risk_level(days_to_fatigue)
        
        if days_to_fatigue <= 2:
            return f"Creative showing strong fatigue signals on {platform}. CTR declining and CPM rising rapidly."
        elif days_to_fatigue <= 5:
            return f"Creative approaching fatigue on {platform}. Performance trends indicate declining effectiveness."
        else:
            return f"Creative still performing well on {platform}. Expected to maintain effectiveness for several more days."
    
    def _generate_actions(self, days_to_fatigue: float, 
                         current_metrics: Dict[str, float], 
                         platform: str) -> List[str]:
        """Generate recommended actions based on prediction"""
        
        actions = []
        
        if days_to_fatigue <= 2:
            actions.extend([
                "URGENT: Pause creative immediately",
                "Launch fresh creative variations",
                "Reduce frequency to extend lifespan",
                "Test new audiences with existing creative"
            ])
        elif days_to_fatigue <= 5:
            actions.extend([
                "Prepare new creative variations",
                "Begin A/B testing fresh concepts", 
                "Consider reducing budget allocation",
                "Monitor performance daily"
            ])
        else:
            actions.extend([
                "Continue monitoring performance",
                "Prepare backup creatives",
                "Test minor creative variations",
                "Optimize targeting while performance is strong"
            ])
        
        return actions
    
    def _assess_risk_level(self, days_to_fatigue: float) -> str:
        """Assess fatigue risk level"""
        if days_to_fatigue <= 2:
            return "HIGH"
        elif days_to_fatigue <= 5:
            return "MEDIUM" 
        else:
            return "LOW"
    
    def _fallback_prediction(self, creative_id: str, platform: str) -> Dict[str, Any]:
        """Fallback prediction when all else fails"""
        return {
            'creative_id': creative_id,
            'days_to_fatigue': 5,  # Conservative estimate
            'confidence': 0.3,     # Low confidence
            'explanation': f"Limited data available. Using {platform} platform averages.",
            'actions': [
                "Collect more performance data",
                "Monitor closely over next 48 hours",
                "Prepare backup creatives"
            ],
            'risk_level': "MEDIUM"
        }
    
    def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train the fatigue prediction model"""
        
        try:
            # Prepare training data
            X, y = self._prepare_training_data(training_data)
            
            if len(X) < 10:
                logger.warning("Insufficient training data for model")
                return {'error': 'insufficient_data'}
            
            # Train model
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train
            self.model.fit(X_scaled, y)
            self.is_trained = True
            
            # Save model
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.model, 'models/creative_fatigue_model.joblib')
            joblib.dump(self.scaler, 'models/creative_fatigue_scaler.joblib')
            
            # Calculate training metrics
            y_pred = self.model.predict(X_scaled)
            mae = mean_absolute_error(y, y_pred)
            
            logger.info(f"Creative fatigue model trained. MAE: {mae:.2f} days")
            
            return {
                'mae': mae,
                'training_samples': len(X),
                'model_saved': True
            }
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            return {'error': str(e)}
    
    def _prepare_training_data(self, training_data: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for model training"""
        
        X = []
        y = []
        
        for item in training_data:
            try:
                features = self.extract_features(
                    item['current_metrics'],
                    item['historical_data'], 
                    item['platform']
                )
                
                X.append(features.flatten())
                y.append(item['actual_fatigue_days'])
                
            except Exception as e:
                logger.warning(f"Skipping training sample: {e}")
                continue
        
        return np.array(X), np.array(y)