"""
Customer Purchase Prediction Model
Predicts when customers will make their next purchase
Uses behavioral analysis and purchase cycle modeling
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, mean_absolute_error
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any, Tuple, Optional
import joblib
import os

logger = logging.getLogger(__name__)

class CustomerPurchasePredictor:
    """
    Predicts customer purchase behavior using:
    - Purchase cycle analysis
    - Behavioral pattern recognition
    - RFM (Recency, Frequency, Monetary) modeling
    - Seasonal purchase patterns
    - Product preference analysis
    """
    
    def __init__(self):
        self.timing_model = None  # Predicts days until next purchase
        self.probability_model = None  # Predicts likelihood of purchase
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Customer segments for behavior analysis
        self.segments = {
            'high_value': {'min_ltv': 500, 'min_orders': 3},
            'regular': {'min_ltv': 100, 'min_orders': 2},
            'new': {'min_ltv': 0, 'min_orders': 1}
        }
        
    def is_ready(self) -> bool:
        """Check if model is ready for predictions"""
        return self.is_trained or self._load_pretrained_model()
    
    def _load_pretrained_model(self) -> bool:
        """Load pre-trained models if available"""
        try:
            timing_path = "models/customer_timing_model.joblib"
            prob_path = "models/customer_probability_model.joblib"
            
            if os.path.exists(timing_path) and os.path.exists(prob_path):
                self.timing_model = joblib.load(timing_path)
                self.probability_model = joblib.load(prob_path)
                self.is_trained = True
                logger.info("Loaded pre-trained customer prediction models")
                return True
        except Exception as e:
            logger.warning(f"Could not load pre-trained models: {e}")
        return False
    
    def predict_next_purchase(self, customer_id: str, 
                            purchase_history: List[Dict[str, Any]],
                            behavior_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Predict when customer will make next purchase
        
        Args:
            customer_id: Unique customer identifier
            purchase_history: List of previous purchases
            behavior_data: Additional behavioral data (clicks, views, etc.)
            
        Returns:
            Prediction with timing, probability, and confidence
        """
        
        try:
            if not purchase_history:
                return self._new_customer_prediction(customer_id)
            
            # Extract customer features
            features = self._extract_customer_features(
                purchase_history, behavior_data
            )
            
            # Get customer segment
            segment = self._classify_customer_segment(purchase_history)
            
            if not self.is_trained:
                # Use rule-based prediction
                return self._rule_based_customer_prediction(
                    customer_id, purchase_history, segment, features
                )
            
            # Make ML predictions
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            
            # Predict days until next purchase
            days_to_purchase = self.timing_model.predict(features_scaled)[0]
            
            # Predict purchase probability
            purchase_probability = self.probability_model.predict_proba(features_scaled)[0][1]
            
            # Calculate confidence
            confidence = self._calculate_confidence(
                purchase_history, features, segment
            )
            
            # Generate explanation
            explanation = self._generate_explanation(
                days_to_purchase, purchase_probability, segment, purchase_history
            )
            
            # Generate actions
            actions = self._generate_actions(
                days_to_purchase, purchase_probability, segment, customer_id
            )
            
            return {
                'customer_id': customer_id,
                'days_to_purchase': max(1, int(days_to_purchase)),
                'purchase_probability': purchase_probability,
                'confidence': confidence,
                'segment': segment,
                'explanation': explanation,
                'actions': actions,
                'urgency_level': self._assess_urgency(days_to_purchase, purchase_probability)
            }
            
        except Exception as e:
            logger.error(f"Customer prediction failed for {customer_id}: {e}")
            return self._fallback_prediction(customer_id)
    
    def _extract_customer_features(self, purchase_history: List[Dict[str, Any]],
                                  behavior_data: Optional[Dict[str, Any]]) -> np.ndarray:
        """Extract features for customer prediction"""
        
        df = pd.DataFrame(purchase_history)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # RFM Analysis
        recency = (datetime.now() - df['date'].max()).days
        frequency = len(df)
        monetary = df['amount'].sum()
        
        # Purchase patterns
        avg_order_value = df['amount'].mean()
        days_between_purchases = []
        
        if len(df) > 1:
            for i in range(1, len(df)):
                days_diff = (df.iloc[i]['date'] - df.iloc[i-1]['date']).days
                days_between_purchases.append(days_diff)
        
        avg_days_between = np.mean(days_between_purchases) if days_between_purchases else 30
        std_days_between = np.std(days_between_purchases) if len(days_between_purchases) > 1 else 15
        
        # Seasonal patterns
        purchase_months = df['date'].dt.month.tolist()
        month_variety = len(set(purchase_months)) / 12.0
        
        # Recent activity
        last_30_days = df[df['date'] >= datetime.now() - timedelta(days=30)]
        recent_purchases = len(last_30_days)
        recent_amount = last_30_days['amount'].sum()
        
        # Behavioral features
        behavior_features = [0, 0, 0, 0]  # Default values
        if behavior_data:
            behavior_features = [
                behavior_data.get('email_opens_30d', 0),
                behavior_data.get('website_visits_30d', 0),
                behavior_data.get('product_views_30d', 0),
                behavior_data.get('cart_abandonment_rate', 0)
            ]
        
        # Trend features
        if len(df) >= 3:
            recent_trend = self._calculate_purchase_trend(df.tail(3))
        else:
            recent_trend = 0
        
        features = np.array([
            recency,                    # Days since last purchase
            frequency,                  # Total number of purchases
            monetary,                   # Total lifetime value
            avg_order_value,            # Average order value
            avg_days_between,           # Average days between purchases
            std_days_between,           # Consistency of purchase timing
            month_variety,              # Seasonal variety
            recent_purchases,           # Purchases in last 30 days
            recent_amount,              # Amount spent in last 30 days
            recent_trend,               # Recent purchase trend
            *behavior_features          # Behavioral signals
        ])
        
        return features
    
    def _calculate_purchase_trend(self, recent_df: pd.DataFrame) -> float:
        """Calculate trend in recent purchase behavior"""
        amounts = recent_df['amount'].values
        if len(amounts) < 2:
            return 0
        
        # Simple linear trend
        x = np.arange(len(amounts))
        slope = np.polyfit(x, amounts, 1)[0]
        return slope / recent_df['amount'].mean()  # Normalized slope
    
    def _classify_customer_segment(self, purchase_history: List[Dict[str, Any]]) -> str:
        """Classify customer into behavioral segment"""
        
        df = pd.DataFrame(purchase_history)
        total_value = df['amount'].sum()
        total_orders = len(df)
        
        for segment, criteria in self.segments.items():
            if (total_value >= criteria['min_ltv'] and 
                total_orders >= criteria['min_orders']):
                return segment
        
        return 'new'
    
    def _rule_based_customer_prediction(self, customer_id: str,
                                      purchase_history: List[Dict[str, Any]],
                                      segment: str, features: np.ndarray) -> Dict[str, Any]:
        """Rule-based prediction when ML model isn't available"""
        
        df = pd.DataFrame(purchase_history)
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate average purchase cycle
        if len(df) > 1:
            purchase_intervals = []
            for i in range(1, len(df)):
                days_diff = (df.iloc[i]['date'] - df.iloc[i-1]['date']).days
                purchase_intervals.append(days_diff)
            
            avg_cycle = np.mean(purchase_intervals)
            cycle_std = np.std(purchase_intervals) if len(purchase_intervals) > 1 else avg_cycle * 0.3
        else:
            # New customer defaults
            segment_cycles = {'high_value': 21, 'regular': 45, 'new': 60}
            avg_cycle = segment_cycles.get(segment, 45)
            cycle_std = avg_cycle * 0.3
        
        # Days since last purchase
        recency = (datetime.now() - df['date'].max()).days
        
        # Predict next purchase
        days_to_purchase = max(1, avg_cycle - recency)
        
        # Adjust for segment behavior
        segment_multipliers = {
            'high_value': 0.8,  # Faster repurchase
            'regular': 1.0,     # Average
            'new': 1.3          # Slower repurchase
        }
        
        days_to_purchase *= segment_multipliers.get(segment, 1.0)
        
        # Purchase probability based on cycle position
        cycle_position = recency / avg_cycle if avg_cycle > 0 else 0
        if cycle_position > 1.2:
            probability = 0.8  # Overdue
        elif cycle_position > 0.8:
            probability = 0.6  # Due soon
        else:
            probability = 0.3  # Not due yet
        
        return {
            'customer_id': customer_id,
            'days_to_purchase': max(1, int(days_to_purchase)),
            'purchase_probability': probability,
            'confidence': 0.65,  # Medium confidence for rule-based
            'segment': segment,
            'explanation': f"Based on {segment} customer patterns and {avg_cycle:.0f}-day cycle",
            'actions': self._generate_actions(days_to_purchase, probability, segment, customer_id),
            'urgency_level': self._assess_urgency(days_to_purchase, probability)
        }
    
    def _calculate_confidence(self, purchase_history: List[Dict[str, Any]],
                            features: np.ndarray, segment: str) -> float:
        """Calculate prediction confidence"""
        
        base_confidence = 0.5
        
        # More purchase history = higher confidence
        if len(purchase_history) >= 5:
            base_confidence = 0.9
        elif len(purchase_history) >= 3:
            base_confidence = 0.75
        elif len(purchase_history) >= 2:
            base_confidence = 0.6
        
        # Consistent purchase patterns = higher confidence
        if len(purchase_history) >= 3:
            df = pd.DataFrame(purchase_history)
            df['date'] = pd.to_datetime(df['date'])
            
            # Calculate consistency in purchase timing
            intervals = []
            for i in range(1, len(df)):
                days_diff = (df.iloc[i]['date'] - df.iloc[i-1]['date']).days
                intervals.append(days_diff)
            
            if len(intervals) > 1:
                cv = np.std(intervals) / np.mean(intervals) if np.mean(intervals) > 0 else 1
                consistency_factor = max(0.5, 1.0 - cv)
                base_confidence *= consistency_factor
        
        # Segment-specific adjustments
        segment_confidence = {
            'high_value': 1.1,  # More predictable
            'regular': 1.0,
            'new': 0.8          # Less predictable
        }
        
        base_confidence *= segment_confidence.get(segment, 1.0)
        
        return min(0.95, base_confidence)
    
    def _generate_explanation(self, days_to_purchase: float, probability: float,
                            segment: str, purchase_history: List[Dict[str, Any]]) -> str:
        """Generate human-readable explanation"""
        
        if days_to_purchase <= 3:
            timing_desc = "very soon"
        elif days_to_purchase <= 7:
            timing_desc = "within a week"
        elif days_to_purchase <= 14:
            timing_desc = "in the next 2 weeks"
        else:
            timing_desc = f"in about {int(days_to_purchase)} days"
        
        prob_desc = "high" if probability > 0.7 else "moderate" if probability > 0.4 else "low"
        
        cycle_info = ""
        if len(purchase_history) > 1:
            df = pd.DataFrame(purchase_history)
            df['date'] = pd.to_datetime(df['date'])
            last_purchase = (datetime.now() - df['date'].max()).days
            cycle_info = f" Last purchase was {last_purchase} days ago."
        
        return f"{segment.title()} customer with {prob_desc} probability of purchasing {timing_desc}.{cycle_info}"
    
    def _generate_actions(self, days_to_purchase: float, probability: float,
                         segment: str, customer_id: str) -> List[str]:
        """Generate recommended actions"""
        
        actions = []
        
        if days_to_purchase <= 3 and probability > 0.6:
            actions.extend([
                "HIGH PRIORITY: Send purchase reminder email",
                "Offer limited-time discount to trigger purchase",
                "Show personalized product recommendations",
                "Consider SMS reminder if opted in"
            ])
        elif days_to_purchase <= 7 and probability > 0.5:
            actions.extend([
                "Send nurturing email sequence",
                "Show retargeting ads with favorite products",
                "Offer free shipping incentive",
                "Share customer reviews and social proof"
            ])
        elif days_to_purchase <= 14:
            actions.extend([
                "Include in weekly newsletter",
                "Show educational content about products",
                "Highlight new arrivals that match preferences",
                "Send seasonal promotion"
            ])
        else:
            actions.extend([
                "Add to long-term nurture campaign",
                "Send monthly check-in email",
                "Track engagement and adjust strategy",
                "Focus on brand awareness content"
            ])
        
        # Segment-specific actions
        if segment == 'high_value':
            actions.append("Offer VIP customer exclusive access")
            actions.append("Provide dedicated customer service")
        elif segment == 'new':
            actions.append("Send welcome series and educational content")
            actions.append("Offer first-time buyer incentives")
        
        return actions
    
    def _assess_urgency(self, days_to_purchase: float, probability: float) -> str:
        """Assess urgency level for customer outreach"""
        
        urgency_score = probability / max(1, days_to_purchase / 7)
        
        if urgency_score > 0.3:
            return "HIGH"
        elif urgency_score > 0.15:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _new_customer_prediction(self, customer_id: str) -> Dict[str, Any]:
        """Handle prediction for customers with no purchase history"""
        
        return {
            'customer_id': customer_id,
            'days_to_purchase': 45,  # Average new customer cycle
            'purchase_probability': 0.25,  # Lower probability for new customers
            'confidence': 0.4,
            'segment': 'new',
            'explanation': "New customer with no purchase history. Using platform averages.",
            'actions': [
                "Send welcome email series",
                "Offer new customer discount",
                "Show popular products and reviews",
                "Track engagement for future predictions"
            ],
            'urgency_level': "LOW"
        }
    
    def _fallback_prediction(self, customer_id: str) -> Dict[str, Any]:
        """Fallback prediction when all else fails"""
        
        return {
            'customer_id': customer_id,
            'days_to_purchase': 30,
            'purchase_probability': 0.4,
            'confidence': 0.3,
            'segment': 'unknown',
            'explanation': "Limited data available. Using general estimates.",
            'actions': [
                "Collect more customer data",
                "Send general marketing content",
                "Monitor customer behavior"
            ],
            'urgency_level': "MEDIUM"
        }
    
    def batch_predict(self, customers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Predict purchase timing for multiple customers"""
        
        results = []
        for customer in customers:
            try:
                prediction = self.predict_next_purchase(
                    customer['customer_id'],
                    customer['purchase_history'],
                    customer.get('behavior_data')
                )
                results.append(prediction)
            except Exception as e:
                logger.warning(f"Failed to predict for customer {customer.get('customer_id', 'unknown')}: {e}")
                results.append(self._fallback_prediction(customer.get('customer_id', 'unknown')))
        
        return results
    
    def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train the customer prediction models"""
        
        try:
            # Prepare training data
            X_timing, y_timing, X_prob, y_prob = self._prepare_training_data(training_data)
            
            if len(X_timing) < 20:
                logger.warning("Insufficient training data for customer prediction models")
                return {'error': 'insufficient_data'}
            
            # Train timing model (regression)
            self.timing_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # Train probability model (classification)
            self.probability_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # Scale features
            X_timing_scaled = self.scaler.fit_transform(X_timing)
            X_prob_scaled = self.scaler.transform(X_prob)
            
            # Train models
            self.timing_model.fit(X_timing_scaled, y_timing)
            self.probability_model.fit(X_prob_scaled, y_prob)
            
            self.is_trained = True
            
            # Calculate metrics
            timing_mae = mean_absolute_error(y_timing, self.timing_model.predict(X_timing_scaled))
            
            # Save models
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.timing_model, 'models/customer_timing_model.joblib')
            joblib.dump(self.probability_model, 'models/customer_probability_model.joblib')
            joblib.dump(self.scaler, 'models/customer_scaler.joblib')
            
            logger.info(f"Customer prediction models trained. Timing MAE: {timing_mae:.2f} days")
            
            return {
                'timing_mae': timing_mae,
                'training_samples': len(X_timing),
                'models_saved': True
            }
            
        except Exception as e:
            logger.error(f"Customer model training failed: {e}")
            return {'error': str(e)}
    
    def _prepare_training_data(self, training_data: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Prepare training data for both models"""
        
        X_timing = []
        y_timing = []
        X_prob = []
        y_prob = []
        
        for item in training_data:
            try:
                features = self._extract_customer_features(
                    item['purchase_history'],
                    item.get('behavior_data')
                )
                
                X_timing.append(features)
                y_timing.append(item['actual_days_to_next_purchase'])
                
                X_prob.append(features)
                y_prob.append(1 if item['did_purchase'] else 0)
                
            except Exception as e:
                logger.warning(f"Skipping training sample: {e}")
                continue
        
        return (np.array(X_timing), np.array(y_timing), 
                np.array(X_prob), np.array(y_prob))