"""
Product Velocity Prediction Model
Predicts product demand trends and velocity changes
Uses time series analysis and market intelligence
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
import joblib
import os
from scipy import stats

logger = logging.getLogger(__name__)

class ProductVelocityPredictor:
    """
    Predicts product demand velocity using:
    - Time series trend analysis
    - Seasonal pattern recognition
    - Market trend correlation
    - Inventory turnover analysis
    - Social/search trend integration
    - Competitive product analysis
    """
    
    def __init__(self):
        self.velocity_model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Product categories with different velocity patterns
        self.category_patterns = {
            'fashion': {'seasonality': 0.8, 'trend_sensitivity': 0.9, 'lifecycle': 90},
            'electronics': {'seasonality': 0.4, 'trend_sensitivity': 0.7, 'lifecycle': 365},
            'beauty': {'seasonality': 0.6, 'trend_sensitivity': 0.8, 'lifecycle': 180},
            'home': {'seasonality': 0.3, 'trend_sensitivity': 0.5, 'lifecycle': 730},
            'sports': {'seasonality': 0.7, 'trend_sensitivity': 0.6, 'lifecycle': 270}
        }
        
        # Market trend indicators
        self.trend_indicators = [
            'search_volume_change',
            'social_mentions_change', 
            'competitor_pricing_change',
            'inventory_turnover_change'
        ]
        
    def is_ready(self) -> bool:
        """Check if model is ready for predictions"""
        return self.is_trained or self._load_pretrained_model()
    
    def _load_pretrained_model(self) -> bool:
        """Load pre-trained model if available"""
        try:
            model_path = "models/product_velocity_model.joblib"
            if os.path.exists(model_path):
                self.velocity_model = joblib.load(model_path)
                self.is_trained = True
                logger.info("Loaded pre-trained product velocity model")
                return True
        except Exception as e:
            logger.warning(f"Could not load pre-trained model: {e}")
        return False
    
    def predict_velocity(self, product_id: str, product_data: Dict[str, Any],
                        market_data: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Predict product velocity and demand trends
        
        Args:
            product_id: Unique product identifier
            product_data: Product information and sales history
            market_data: External market trend data
            
        Returns:
            Velocity prediction with direction, magnitude, and timing
        """
        
        try:
            # Extract features for velocity prediction
            features = self._extract_velocity_features(product_data, market_data)
            
            # Get product category for pattern matching
            category = product_data.get('category', 'general')
            
            if not self.is_trained:
                # Use rule-based prediction
                return self._rule_based_velocity_prediction(
                    product_id, product_data, category, features
                )
            
            # Make ML prediction
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            velocity_change = self.velocity_model.predict(features_scaled)[0]
            
            # Interpret velocity prediction
            direction = "upward" if velocity_change > 0.05 else "downward" if velocity_change < -0.05 else "stable"
            magnitude = abs(velocity_change)
            
            # Determine timeframe for prediction
            timeframe = self._determine_timeframe(category, magnitude)
            
            # Calculate confidence
            confidence = self._calculate_confidence(
                product_data, market_data, features
            )
            
            # Generate explanation
            explanation = self._generate_explanation(
                velocity_change, direction, category, product_data
            )
            
            # Generate actions
            actions = self._generate_actions(
                velocity_change, direction, magnitude, product_data
            )
            
            return {
                'product_id': product_id,
                'velocity_change': velocity_change,
                'direction': direction,
                'magnitude': magnitude,
                'timeframe': timeframe,
                'confidence': confidence,
                'explanation': explanation,
                'actions': actions,
                'risk_level': self._assess_risk_level(velocity_change, confidence)
            }
            
        except Exception as e:
            logger.error(f"Velocity prediction failed for {product_id}: {e}")
            return self._fallback_prediction(product_id)
    
    def _extract_velocity_features(self, product_data: Dict[str, Any],
                                  market_data: Optional[List[Dict[str, Any]]]) -> np.ndarray:
        """Extract features for velocity prediction"""
        
        # Basic product features
        current_velocity = product_data.get('units_sold_30d', 0) / 30.0
        price = product_data.get('price', 0)
        inventory_level = product_data.get('inventory', 0)
        days_since_launch = product_data.get('days_since_launch', 365)
        
        # Sales history analysis
        sales_history = product_data.get('sales_history', [])
        if sales_history and len(sales_history) >= 7:
            df = pd.DataFrame(sales_history)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # Calculate trends
            recent_trend = self._calculate_sales_trend(df.tail(14))
            velocity_variance = df['units_sold'].var()
            avg_daily_sales = df['units_sold'].mean()
            
            # Seasonal analysis
            seasonal_factor = self._calculate_seasonal_factor(df)
            
        else:
            # Default values for limited data
            recent_trend = 0
            velocity_variance = 1
            avg_daily_sales = current_velocity
            seasonal_factor = 1.0
        
        # Category-specific features
        category = product_data.get('category', 'general')
        category_features = self.category_patterns.get(category, {
            'seasonality': 0.5, 'trend_sensitivity': 0.5, 'lifecycle': 365
        })
        
        # Market trend features
        market_features = [0, 0, 0, 0]  # Default values
        if market_data and len(market_data) > 0:
            market_df = pd.DataFrame(market_data)
            market_features = [
                market_df.get('search_volume_change', [0])[-1] if 'search_volume_change' in market_df else 0,
                market_df.get('social_mentions_change', [0])[-1] if 'social_mentions_change' in market_df else 0,
                market_df.get('competitor_price_change', [0])[-1] if 'competitor_price_change' in market_df else 0,
                market_df.get('market_demand_change', [0])[-1] if 'market_demand_change' in market_df else 0
            ]
        
        # Product lifecycle position
        lifecycle_position = min(1.0, days_since_launch / category_features['lifecycle'])
        
        # Inventory pressure
        inventory_pressure = max(0, min(1.0, inventory_level / (current_velocity * 30)))
        
        # Competitive features
        competitive_products = product_data.get('competitive_products', 0)
        price_position = product_data.get('price_percentile', 0.5)  # 0-1 scale
        
        features = np.array([
            current_velocity,           # Current sales velocity
            recent_trend,               # Recent sales trend
            velocity_variance,          # Sales volatility
            seasonal_factor,            # Seasonal adjustment
            lifecycle_position,         # Product lifecycle position
            inventory_pressure,         # Inventory availability factor
            price_position,             # Price competitiveness
            competitive_products,       # Number of competitors
            category_features['seasonality'],      # Category seasonality
            category_features['trend_sensitivity'], # Category trend sensitivity
            *market_features           # External market indicators
        ])
        
        return features
    
    def _calculate_sales_trend(self, df: pd.DataFrame) -> float:
        """Calculate recent sales trend"""
        if len(df) < 3:
            return 0
        
        # Linear trend over recent period
        x = np.arange(len(df))
        y = df['units_sold'].values
        
        try:
            slope, _, _, _, _ = stats.linregress(x, y)
            return slope / df['units_sold'].mean() if df['units_sold'].mean() > 0 else 0
        except:
            return 0
    
    def _calculate_seasonal_factor(self, df: pd.DataFrame) -> float:
        """Calculate seasonal adjustment factor"""
        if len(df) < 30:
            return 1.0
        
        # Simple seasonal analysis based on day of week and month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        
        # Current month factor
        current_month = datetime.now().month
        if current_month in df['month'].values:
            current_month_sales = df[df['month'] == current_month]['units_sold'].mean()
            overall_avg = df['units_sold'].mean()
            return current_month_sales / overall_avg if overall_avg > 0 else 1.0
        
        return 1.0
    
    def _determine_timeframe(self, category: str, magnitude: float) -> str:
        """Determine appropriate timeframe for velocity prediction"""
        
        category_timeframes = {
            'fashion': {'high': '1 week', 'medium': '2 weeks', 'low': '1 month'},
            'electronics': {'high': '2 weeks', 'medium': '1 month', 'low': '2 months'},
            'beauty': {'high': '1 week', 'medium': '3 weeks', 'low': '6 weeks'},
            'home': {'high': '2 weeks', 'medium': '6 weeks', 'low': '3 months'},
            'sports': {'high': '1 week', 'medium': '2 weeks', 'low': '1 month'}
        }
        
        timeframes = category_timeframes.get(category, {
            'high': '2 weeks', 'medium': '1 month', 'low': '2 months'
        })
        
        if magnitude > 0.3:
            return timeframes['high']
        elif magnitude > 0.15:
            return timeframes['medium']
        else:
            return timeframes['low']
    
    def _rule_based_velocity_prediction(self, product_id: str, product_data: Dict[str, Any],
                                      category: str, features: np.ndarray) -> Dict[str, Any]:
        """Rule-based prediction when ML model isn't available"""
        
        current_velocity = features[0]
        recent_trend = features[1]
        seasonal_factor = features[3]
        lifecycle_position = features[4]
        
        # Base prediction on trend and lifecycle
        velocity_change = recent_trend * 0.5  # Conservative trend continuation
        
        # Lifecycle adjustments
        if lifecycle_position > 0.8:  # Mature product
            velocity_change *= 0.7  # Slower growth/faster decline
        elif lifecycle_position < 0.3:  # New product
            velocity_change *= 1.3  # More volatile
        
        # Seasonal adjustments
        velocity_change *= seasonal_factor
        
        # Category-specific adjustments
        category_multipliers = {
            'fashion': 1.2,     # High volatility
            'electronics': 0.8,  # More stable
            'beauty': 1.1,      # Trend-driven
            'home': 0.6,        # Very stable
            'sports': 0.9       # Seasonal but stable
        }
        
        velocity_change *= category_multipliers.get(category, 1.0)
        
        # Determine direction and magnitude
        direction = "upward" if velocity_change > 0.05 else "downward" if velocity_change < -0.05 else "stable"
        magnitude = abs(velocity_change)
        timeframe = self._determine_timeframe(category, magnitude)
        
        return {
            'product_id': product_id,
            'velocity_change': velocity_change,
            'direction': direction,
            'magnitude': magnitude,
            'timeframe': timeframe,
            'confidence': 0.6,  # Medium confidence for rule-based
            'explanation': f"Based on {category} category patterns and recent {timeframe} trends",
            'actions': self._generate_actions(velocity_change, direction, magnitude, product_data),
            'risk_level': self._assess_risk_level(velocity_change, 0.6)
        }
    
    def _calculate_confidence(self, product_data: Dict[str, Any],
                            market_data: Optional[List[Dict[str, Any]]],
                            features: np.ndarray) -> float:
        """Calculate prediction confidence"""
        
        base_confidence = 0.5
        
        # More sales history = higher confidence
        sales_history = product_data.get('sales_history', [])
        if len(sales_history) >= 60:
            base_confidence = 0.9
        elif len(sales_history) >= 30:
            base_confidence = 0.75
        elif len(sales_history) >= 14:
            base_confidence = 0.6
        
        # Market data availability
        if market_data and len(market_data) > 0:
            base_confidence *= 1.1
        
        # Product maturity (more mature = more predictable)
        days_since_launch = product_data.get('days_since_launch', 365)
        if days_since_launch > 180:
            base_confidence *= 1.1
        elif days_since_launch < 30:
            base_confidence *= 0.8
        
        # Velocity consistency (lower variance = higher confidence)
        velocity_variance = features[2]
        if velocity_variance < 0.5:
            base_confidence *= 1.1
        elif velocity_variance > 2.0:
            base_confidence *= 0.9
        
        return min(0.95, base_confidence)
    
    def _generate_explanation(self, velocity_change: float, direction: str,
                            category: str, product_data: Dict[str, Any]) -> str:
        """Generate human-readable explanation"""
        
        magnitude_desc = "significantly" if abs(velocity_change) > 0.3 else "moderately" if abs(velocity_change) > 0.15 else "slightly"
        
        if direction == "upward":
            trend_desc = f"demand increasing {magnitude_desc}"
        elif direction == "downward":
            trend_desc = f"demand declining {magnitude_desc}"
        else:
            trend_desc = "demand remaining stable"
        
        # Add context based on product characteristics
        context = []
        
        days_since_launch = product_data.get('days_since_launch', 365)
        if days_since_launch < 30:
            context.append("new product launch momentum")
        elif days_since_launch > 365:
            context.append("mature product lifecycle")
        
        if product_data.get('inventory', 0) < product_data.get('units_sold_30d', 0):
            context.append("low inventory levels")
        
        context_str = f" driven by {', '.join(context)}" if context else ""
        
        return f"{category.title()} product showing {trend_desc}{context_str}."
    
    def _generate_actions(self, velocity_change: float, direction: str,
                         magnitude: float, product_data: Dict[str, Any]) -> List[str]:
        """Generate recommended actions based on velocity prediction"""
        
        actions = []
        
        if direction == "upward" and magnitude > 0.2:
            actions.extend([
                "OPPORTUNITY: Increase inventory levels immediately",
                "Scale up marketing spend for this product",
                "Consider raising price if demand outstrips supply",
                "Prepare for potential stockouts",
                "Bundle with related products to maximize revenue"
            ])
        elif direction == "upward" and magnitude > 0.1:
            actions.extend([
                "Increase marketing budget allocation",
                "Monitor inventory levels closely",
                "Prepare for increased demand",
                "Consider promotional campaigns to capitalize on trend"
            ])
        elif direction == "downward" and magnitude > 0.2:
            actions.extend([
                "WARNING: Significant demand decline expected",
                "Reduce inventory orders immediately",
                "Implement clearance pricing strategy",
                "Shift marketing budget to better-performing products",
                "Analyze customer feedback for improvement opportunities"
            ])
        elif direction == "downward" and magnitude > 0.1:
            actions.extend([
                "Monitor performance closely",
                "Consider promotional discounts to maintain velocity",
                "Reduce marketing spend gradually",
                "Investigate causes of decline"
            ])
        else:
            actions.extend([
                "Maintain current strategy",
                "Continue monitoring performance",
                "Look for optimization opportunities",
                "Consider testing new marketing approaches"
            ])
        
        # Inventory-specific recommendations
        current_inventory = product_data.get('inventory', 0)
        monthly_velocity = product_data.get('units_sold_30d', 0)
        
        if current_inventory < monthly_velocity * 0.5:
            actions.append("URGENT: Restock immediately - low inventory risk")
        elif current_inventory > monthly_velocity * 2:
            actions.append("Consider reducing inventory levels - overstocked")
        
        return actions
    
    def _assess_risk_level(self, velocity_change: float, confidence: float) -> str:
        """Assess risk level of velocity prediction"""
        
        magnitude = abs(velocity_change)
        
        if magnitude > 0.3 or confidence < 0.5:
            return "HIGH"
        elif magnitude > 0.15 or confidence < 0.7:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _fallback_prediction(self, product_id: str) -> Dict[str, Any]:
        """Fallback prediction when all else fails"""
        
        return {
            'product_id': product_id,
            'velocity_change': 0.0,
            'direction': "stable",
            'magnitude': 0.0,
            'timeframe': "2 weeks",
            'confidence': 0.3,
            'explanation': "Limited data available. Using stable demand assumption.",
            'actions': [
                "Collect more product performance data",
                "Monitor sales trends closely",
                "Maintain current inventory levels"
            ],
            'risk_level': "MEDIUM"
        }
    
    def batch_predict(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Predict velocity for multiple products"""
        
        results = []
        for product in products:
            try:
                prediction = self.predict_velocity(
                    product['product_id'],
                    product['product_data'],
                    product.get('market_data')
                )
                results.append(prediction)
            except Exception as e:
                logger.warning(f"Failed to predict velocity for product {product.get('product_id', 'unknown')}: {e}")
                results.append(self._fallback_prediction(product.get('product_id', 'unknown')))
        
        return results
    
    def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train the velocity prediction model"""
        
        try:
            # Prepare training data
            X, y = self._prepare_training_data(training_data)
            
            if len(X) < 20:
                logger.warning("Insufficient training data for velocity prediction model")
                return {'error': 'insufficient_data'}
            
            # Create and train model
            self.velocity_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.velocity_model.fit(X_scaled, y)
            self.is_trained = True
            
            # Calculate metrics
            y_pred = self.velocity_model.predict(X_scaled)
            mae = mean_absolute_error(y, y_pred)
            
            # Save model
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.velocity_model, 'models/product_velocity_model.joblib')
            joblib.dump(self.scaler, 'models/product_velocity_scaler.joblib')
            
            logger.info(f"Product velocity model trained. MAE: {mae:.3f}")
            
            return {
                'mae': mae,
                'training_samples': len(X),
                'model_saved': True
            }
            
        except Exception as e:
            logger.error(f"Velocity model training failed: {e}")
            return {'error': str(e)}
    
    def _prepare_training_data(self, training_data: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data for velocity model"""
        
        X = []
        y = []
        
        for item in training_data:
            try:
                features = self._extract_velocity_features(
                    item['product_data'],
                    item.get('market_data')
                )
                
                X.append(features)
                y.append(item['actual_velocity_change'])
                
            except Exception as e:
                logger.warning(f"Skipping training sample: {e}")
                continue
        
        return np.array(X), np.array(y)