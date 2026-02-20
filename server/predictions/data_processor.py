"""
Data Processing Utilities
Handles data validation, cleaning, and preprocessing for predictions
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    """Utility class for data processing and validation"""
    
    @staticmethod
    def validate_merchant_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and clean merchant data
        
        Args:
            data: Raw merchant data
            
        Returns:
            Validated and cleaned data
        """
        
        validated = {}
        
        # Required fields with defaults
        required_fields = {
            'merchant_id': 'unknown',
            'revenue': 0,
            'orders': 0,
            'spend': 0,
            'conversion_rate': 0.02,
            'avg_order_value': 50
        }
        
        for field, default in required_fields.items():
            validated[field] = data.get(field, default)
        
        # Validate numeric fields
        numeric_fields = ['revenue', 'orders', 'spend', 'conversion_rate', 'avg_order_value']
        for field in numeric_fields:
            if field in validated:
                try:
                    validated[field] = max(0, float(validated[field]))
                except (ValueError, TypeError):
                    validated[field] = required_fields[field]
                    logger.warning(f"Invalid {field} value, using default")
        
        # Calculate derived metrics
        if validated['orders'] > 0 and validated['revenue'] > 0:
            validated['calculated_aov'] = validated['revenue'] / validated['orders']
        
        if validated['spend'] > 0 and validated['revenue'] > 0:
            validated['roas'] = validated['revenue'] / validated['spend']
        else:
            validated['roas'] = 0
        
        return validated
    
    @staticmethod
    def process_historical_data(data: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Process historical performance data
        
        Args:
            data: List of historical data points
            
        Returns:
            Processed DataFrame
        """
        
        if not data:
            return pd.DataFrame()
        
        df = pd.DataFrame(data)
        
        # Ensure date column
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
            df = df.dropna(subset=['date'])
            df = df.sort_values('date')
        else:
            logger.warning("No date column found in historical data")
            return pd.DataFrame()
        
        # Clean numeric columns
        numeric_cols = ['revenue', 'spend', 'orders', 'impressions', 'clicks', 'ctr', 'cpm']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # Calculate derived metrics
        if 'clicks' in df.columns and 'impressions' in df.columns:
            df['calculated_ctr'] = df['clicks'] / df['impressions'].replace(0, 1)
        
        if 'spend' in df.columns and 'clicks' in df.columns:
            df['calculated_cpc'] = df['spend'] / df['clicks'].replace(0, 1)
        
        if 'revenue' in df.columns and 'spend' in df.columns:
            df['roas'] = df['revenue'] / df['spend'].replace(0, 1)
        
        return df
    
    @staticmethod
    def extract_time_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract time-based features from DataFrame
        
        Args:
            df: DataFrame with date column
            
        Returns:
            DataFrame with time features
        """
        
        if 'date' not in df.columns or df.empty:
            return df
        
        df = df.copy()
        
        # Extract time components
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['quarter'] = df['date'].dt.quarter
        
        # Business time features
        df['is_weekend'] = df['day_of_week'].isin([5, 6])
        df['is_month_end'] = df['day_of_month'] >= 28
        df['is_quarter_end'] = df['month'].isin([3, 6, 9, 12]) & (df['day_of_month'] >= 28)
        
        # Seasonal features
        df['season'] = df['month'].map({
            12: 'winter', 1: 'winter', 2: 'winter',
            3: 'spring', 4: 'spring', 5: 'spring',
            6: 'summer', 7: 'summer', 8: 'summer',
            9: 'fall', 10: 'fall', 11: 'fall'
        })
        
        return df
    
    @staticmethod
    def calculate_moving_averages(df: pd.DataFrame, windows: List[int] = [7, 14, 30]) -> pd.DataFrame:
        """
        Calculate moving averages for key metrics
        
        Args:
            df: DataFrame with time series data
            windows: List of window sizes for moving averages
            
        Returns:
            DataFrame with moving averages
        """
        
        if df.empty:
            return df
        
        df = df.copy()
        
        # Metrics to calculate moving averages for
        metrics = ['revenue', 'spend', 'orders', 'roas', 'ctr']
        
        for metric in metrics:
            if metric in df.columns:
                for window in windows:
                    col_name = f'{metric}_ma{window}'
                    df[col_name] = df[metric].rolling(window=window, min_periods=1).mean()
        
        return df
    
    @staticmethod
    def detect_anomalies(df: pd.DataFrame, columns: List[str], threshold: float = 2.0) -> pd.DataFrame:
        """
        Detect anomalies in time series data using z-score
        
        Args:
            df: DataFrame with time series data
            columns: List of columns to check for anomalies
            threshold: Z-score threshold for anomaly detection
            
        Returns:
            DataFrame with anomaly flags
        """
        
        if df.empty:
            return df
        
        df = df.copy()
        
        for col in columns:
            if col in df.columns:
                # Calculate z-score
                mean_val = df[col].mean()
                std_val = df[col].std()
                
                if std_val > 0:
                    df[f'{col}_zscore'] = (df[col] - mean_val) / std_val
                    df[f'{col}_anomaly'] = np.abs(df[f'{col}_zscore']) > threshold
                else:
                    df[f'{col}_anomaly'] = False
        
        return df
    
    @staticmethod
    def aggregate_by_period(df: pd.DataFrame, period: str = 'D') -> pd.DataFrame:
        """
        Aggregate data by time period
        
        Args:
            df: DataFrame with date column
            period: Period for aggregation ('D', 'W', 'M', 'Q', 'Y')
            
        Returns:
            Aggregated DataFrame
        """
        
        if 'date' not in df.columns or df.empty:
            return df
        
        df = df.copy()
        df.set_index('date', inplace=True)
        
        # Aggregation functions for different metrics
        agg_funcs = {
            'revenue': 'sum',
            'spend': 'sum',
            'orders': 'sum',
            'impressions': 'sum',
            'clicks': 'sum',
            'ctr': 'mean',
            'cpm': 'mean',
            'roas': 'mean'
        }
        
        # Filter aggregation functions to only include existing columns
        agg_funcs = {col: func for col, func in agg_funcs.items() if col in df.columns}
        
        if not agg_funcs:
            return pd.DataFrame()
        
        aggregated = df.resample(period).agg(agg_funcs).reset_index()
        
        return aggregated
    
    @staticmethod
    def fill_missing_dates(df: pd.DataFrame, start_date: Optional[datetime] = None,
                          end_date: Optional[datetime] = None) -> pd.DataFrame:
        """
        Fill missing dates in time series with zero values
        
        Args:
            df: DataFrame with date column
            start_date: Start date for filling (default: min date in df)
            end_date: End date for filling (default: max date in df)
            
        Returns:
            DataFrame with filled dates
        """
        
        if 'date' not in df.columns or df.empty:
            return df
        
        df = df.copy()
        
        # Determine date range
        if start_date is None:
            start_date = df['date'].min()
        if end_date is None:
            end_date = df['date'].max()
        
        # Create complete date range
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # Create DataFrame with all dates
        full_df = pd.DataFrame({'date': date_range})
        
        # Merge with original data
        result = full_df.merge(df, on='date', how='left')
        
        # Fill missing numeric values with 0
        numeric_cols = result.select_dtypes(include=[np.number]).columns
        result[numeric_cols] = result[numeric_cols].fillna(0)
        
        return result
    
    @staticmethod
    def calculate_growth_rates(df: pd.DataFrame, periods: List[int] = [1, 7, 30]) -> pd.DataFrame:
        """
        Calculate growth rates for key metrics
        
        Args:
            df: DataFrame with time series data
            periods: List of periods to calculate growth rates for
            
        Returns:
            DataFrame with growth rate columns
        """
        
        if df.empty:
            return df
        
        df = df.copy()
        
        metrics = ['revenue', 'spend', 'orders', 'roas']
        
        for metric in metrics:
            if metric in df.columns:
                for period in periods:
                    col_name = f'{metric}_growth_{period}d'
                    
                    # Calculate percentage change
                    shifted = df[metric].shift(period)
                    df[col_name] = ((df[metric] - shifted) / shifted.replace(0, np.nan)) * 100
                    df[col_name] = df[col_name].fillna(0)
        
        return df
    
    @staticmethod
    def create_feature_matrix(merchant_data: Dict[str, Any], 
                            historical_data: List[Dict[str, Any]]) -> np.ndarray:
        """
        Create feature matrix for ML models
        
        Args:
            merchant_data: Current merchant data
            historical_data: Historical performance data
            
        Returns:
            Feature matrix as numpy array
        """
        
        features = []
        
        # Process merchant data
        validated_merchant = DataProcessor.validate_merchant_data(merchant_data)
        
        # Basic merchant features
        features.extend([
            validated_merchant.get('revenue', 0),
            validated_merchant.get('orders', 0),
            validated_merchant.get('spend', 0),
            validated_merchant.get('roas', 0),
            validated_merchant.get('conversion_rate', 0.02),
            validated_merchant.get('avg_order_value', 50)
        ])
        
        # Process historical data
        if historical_data:
            df = DataProcessor.process_historical_data(historical_data)
            
            if not df.empty:
                # Time series features
                df = DataProcessor.calculate_moving_averages(df)
                df = DataProcessor.calculate_growth_rates(df)
                
                # Recent performance features
                recent_df = df.tail(7)  # Last 7 days
                features.extend([
                    recent_df['revenue'].mean(),
                    recent_df['spend'].mean(),
                    recent_df['roas'].mean(),
                    recent_df['revenue'].std(),
                    len(df)  # Data points available
                ])
            else:
                # Default values when no historical data
                features.extend([0, 0, 0, 0, 0])
        else:
            # Default values when no historical data
            features.extend([0, 0, 0, 0, 0])
        
        return np.array(features).reshape(1, -1)

class ConfidenceCalculator:
    """Utility class for calculating prediction confidence scores"""
    
    @staticmethod
    def calculate_data_quality_score(data: Dict[str, Any]) -> float:
        """Calculate data quality score based on completeness and consistency"""
        
        required_fields = ['revenue', 'orders', 'spend', 'conversion_rate']
        
        # Completeness score
        present_fields = sum(1 for field in required_fields if field in data and data[field] is not None)
        completeness = present_fields / len(required_fields)
        
        # Consistency score (basic validation)
        consistency = 1.0
        
        # Check for logical consistency
        if 'revenue' in data and 'orders' in data and data['orders'] > 0:
            calculated_aov = data['revenue'] / data['orders']
            if 'avg_order_value' in data and data['avg_order_value'] > 0:
                aov_consistency = min(calculated_aov / data['avg_order_value'], 
                                    data['avg_order_value'] / calculated_aov)
                consistency *= aov_consistency
        
        if 'spend' in data and 'revenue' in data and data['spend'] > 0:
            roas = data['revenue'] / data['spend']
            if roas > 10:  # Suspiciously high ROAS
                consistency *= 0.8
            elif roas < 0.5:  # Very low ROAS
                consistency *= 0.9
        
        return (completeness + consistency) / 2
    
    @staticmethod
    def calculate_historical_confidence(historical_data: List[Dict[str, Any]]) -> float:
        """Calculate confidence based on historical data availability and quality"""
        
        if not historical_data:
            return 0.2
        
        data_points = len(historical_data)
        
        # Base confidence from data quantity
        if data_points >= 60:
            base_confidence = 0.95
        elif data_points >= 30:
            base_confidence = 0.85
        elif data_points >= 14:
            base_confidence = 0.7
        elif data_points >= 7:
            base_confidence = 0.55
        else:
            base_confidence = 0.3
        
        # Adjust for data consistency
        df = DataProcessor.process_historical_data(historical_data)
        
        if not df.empty and 'revenue' in df.columns:
            # Check for data variability (too much variability reduces confidence)
            cv = df['revenue'].std() / df['revenue'].mean() if df['revenue'].mean() > 0 else 1
            
            if cv > 2:  # Very high variability
                base_confidence *= 0.7
            elif cv > 1:  # High variability
                base_confidence *= 0.85
            
            # Check for recent data (more recent = higher confidence)
            if 'date' in df.columns:
                latest_date = df['date'].max()
                days_since_latest = (datetime.now() - latest_date).days
                
                if days_since_latest <= 1:
                    base_confidence *= 1.1
                elif days_since_latest <= 7:
                    base_confidence *= 1.0
                elif days_since_latest <= 30:
                    base_confidence *= 0.9
                else:
                    base_confidence *= 0.8
        
        return min(0.95, base_confidence)
    
    @staticmethod
    def calculate_model_confidence(prediction_variance: float, 
                                 training_accuracy: Optional[float] = None) -> float:
        """Calculate confidence based on model performance and prediction variance"""
        
        base_confidence = 0.7
        
        # Adjust for training accuracy if available
        if training_accuracy is not None:
            base_confidence = training_accuracy
        
        # Adjust for prediction variance (lower variance = higher confidence)
        if prediction_variance < 0.1:
            variance_factor = 1.1
        elif prediction_variance < 0.3:
            variance_factor = 1.0
        elif prediction_variance < 0.5:
            variance_factor = 0.9
        else:
            variance_factor = 0.8
        
        return min(0.95, base_confidence * variance_factor)
    
    @staticmethod
    def calculate_overall_confidence(data_quality: float, 
                                   historical_confidence: float,
                                   model_confidence: float,
                                   weights: Tuple[float, float, float] = (0.3, 0.4, 0.3)) -> float:
        """Calculate overall prediction confidence from component scores"""
        
        overall = (data_quality * weights[0] + 
                  historical_confidence * weights[1] + 
                  model_confidence * weights[2])
        
        return min(0.95, max(0.1, overall))