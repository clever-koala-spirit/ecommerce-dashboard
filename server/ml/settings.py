"""
Configuration settings for Slay Season Prediction Engine
Environment-specific settings and constants
"""

import os
from typing import Dict, Any
from datetime import timedelta

class Settings:
    """Application configuration settings"""
    
    # Application Info
    APP_NAME = "Slay Season Prediction Engine"
    APP_VERSION = "1.0.0"
    APP_DESCRIPTION = "AI-powered predictions for e-commerce dominance"
    
    # API Configuration
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    API_RELOAD = os.getenv("API_RELOAD", "false").lower() == "true"
    
    # Database Configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./slay_season.db")
    
    # Redis Configuration (for caching and queues)
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # External API Keys
    SHOPIFY_API_KEY = os.getenv("SHOPIFY_API_KEY")
    SHOPIFY_API_SECRET = os.getenv("SHOPIFY_API_SECRET")
    META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
    GOOGLE_ADS_DEVELOPER_TOKEN = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")
    
    # ML Model Configuration
    MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "./models/")
    MODEL_AUTO_RETRAIN = os.getenv("MODEL_AUTO_RETRAIN", "true").lower() == "true"
    MODEL_RETRAIN_INTERVAL_HOURS = int(os.getenv("MODEL_RETRAIN_INTERVAL_HOURS", "168"))  # Weekly
    
    # Prediction Configuration
    PREDICTION_CACHE_TTL_MINUTES = int(os.getenv("PREDICTION_CACHE_TTL_MINUTES", "30"))
    PREDICTION_BATCH_SIZE = int(os.getenv("PREDICTION_BATCH_SIZE", "100"))
    MIN_CONFIDENCE_THRESHOLD = float(os.getenv("MIN_CONFIDENCE_THRESHOLD", "0.3"))
    
    # Dashboard Integration
    DASHBOARD_API_URL = os.getenv("DASHBOARD_API_URL", "http://localhost:3000/api")
    DASHBOARD_API_KEY = os.getenv("DASHBOARD_API_KEY")
    DASHBOARD_WEBHOOK_SECRET = os.getenv("DASHBOARD_WEBHOOK_SECRET")
    
    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    API_KEY_HEADER = os.getenv("API_KEY_HEADER", "X-API-Key")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # Performance Tuning
    WORKER_PROCESSES = int(os.getenv("WORKER_PROCESSES", "1"))
    MAX_REQUEST_SIZE = int(os.getenv("MAX_REQUEST_SIZE", "10485760"))  # 10MB
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "300"))  # 5 minutes
    
    # Feature Flags
    ENABLE_CREATIVE_FATIGUE = os.getenv("ENABLE_CREATIVE_FATIGUE", "true").lower() == "true"
    ENABLE_BUDGET_OPTIMIZATION = os.getenv("ENABLE_BUDGET_OPTIMIZATION", "true").lower() == "true"
    ENABLE_CUSTOMER_PREDICTION = os.getenv("ENABLE_CUSTOMER_PREDICTION", "true").lower() == "true"
    ENABLE_PRODUCT_VELOCITY = os.getenv("ENABLE_PRODUCT_VELOCITY", "true").lower() == "true"
    ENABLE_CROSS_MERCHANT = os.getenv("ENABLE_CROSS_MERCHANT", "true").lower() == "true"
    
    @classmethod
    def get_database_config(cls) -> Dict[str, Any]:
        """Get database configuration"""
        return {
            "url": cls.DATABASE_URL,
            "pool_size": 10,
            "max_overflow": 20,
            "pool_pre_ping": True,
            "pool_recycle": 3600
        }
    
    @classmethod
    def get_redis_config(cls) -> Dict[str, Any]:
        """Get Redis configuration"""
        return {
            "url": cls.REDIS_URL,
            "socket_connect_timeout": 5,
            "socket_timeout": 5,
            "retry_on_timeout": True,
            "health_check_interval": 30
        }
    
    @classmethod
    def get_model_config(cls) -> Dict[str, Any]:
        """Get ML model configuration"""
        return {
            "storage_path": cls.MODEL_STORAGE_PATH,
            "auto_retrain": cls.MODEL_AUTO_RETRAIN,
            "retrain_interval": timedelta(hours=cls.MODEL_RETRAIN_INTERVAL_HOURS),
            "min_training_samples": {
                "creative_fatigue": 50,
                "budget_optimization": 100,
                "customer_prediction": 200,
                "product_velocity": 75,
                "cross_merchant": 25
            },
            "hyperparameters": {
                "creative_fatigue": {
                    "n_estimators": 100,
                    "max_depth": 10,
                    "random_state": 42
                },
                "budget_optimization": {
                    "n_estimators": 100,
                    "learning_rate": 0.1,
                    "max_depth": 6
                },
                "customer_prediction": {
                    "n_estimators": 100,
                    "max_depth": 10,
                    "class_weight": "balanced"
                },
                "product_velocity": {
                    "n_estimators": 100,
                    "max_depth": 8,
                    "random_state": 42
                }
            }
        }
    
    @classmethod
    def get_prediction_config(cls) -> Dict[str, Any]:
        """Get prediction configuration"""
        return {
            "cache_ttl": timedelta(minutes=cls.PREDICTION_CACHE_TTL_MINUTES),
            "batch_size": cls.PREDICTION_BATCH_SIZE,
            "min_confidence": cls.MIN_CONFIDENCE_THRESHOLD,
            "enabled_predictions": {
                "creative_fatigue": cls.ENABLE_CREATIVE_FATIGUE,
                "budget_optimization": cls.ENABLE_BUDGET_OPTIMIZATION,
                "customer_prediction": cls.ENABLE_CUSTOMER_PREDICTION,
                "product_velocity": cls.ENABLE_PRODUCT_VELOCITY,
                "cross_merchant": cls.ENABLE_CROSS_MERCHANT
            },
            "default_timeframes": {
                "creative_fatigue": "days",
                "budget_optimization": "monthly",
                "customer_prediction": "days",
                "product_velocity": "weeks",
                "cross_merchant": "quarterly"
            }
        }
    
    @classmethod
    def get_external_api_config(cls) -> Dict[str, Any]:
        """Get external API configuration"""
        return {
            "shopify": {
                "api_key": cls.SHOPIFY_API_KEY,
                "api_secret": cls.SHOPIFY_API_SECRET,
                "api_version": "2024-01",
                "timeout": 30,
                "retry_attempts": 3
            },
            "meta": {
                "access_token": cls.META_ACCESS_TOKEN,
                "api_version": "v19.0",
                "timeout": 30,
                "retry_attempts": 3
            },
            "google_ads": {
                "developer_token": cls.GOOGLE_ADS_DEVELOPER_TOKEN,
                "timeout": 30,
                "retry_attempts": 3
            }
        }
    
    @classmethod
    def is_development(cls) -> bool:
        """Check if running in development mode"""
        return os.getenv("ENVIRONMENT", "development") == "development"
    
    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production mode"""
        return os.getenv("ENVIRONMENT", "development") == "production"

# Platform-specific configurations
PLATFORM_CONFIGS = {
    "facebook": {
        "fatigue_cycle_days": 7,
        "optimal_frequency": 2.0,
        "ctr_warning_threshold": 0.02,
        "cpm_warning_multiplier": 1.5
    },
    "instagram": {
        "fatigue_cycle_days": 5,
        "optimal_frequency": 2.5,
        "ctr_warning_threshold": 0.015,
        "cpm_warning_multiplier": 1.6
    },
    "google": {
        "fatigue_cycle_days": 14,
        "optimal_frequency": 3.0,
        "ctr_warning_threshold": 0.025,
        "cpm_warning_multiplier": 1.3
    },
    "tiktok": {
        "fatigue_cycle_days": 3,
        "optimal_frequency": 4.0,
        "ctr_warning_threshold": 0.01,
        "cpm_warning_multiplier": 2.0
    }
}

# Industry benchmarks
INDUSTRY_BENCHMARKS = {
    "beauty": {
        "conversion_rate": {"excellent": 0.05, "good": 0.035, "average": 0.025, "poor": 0.015},
        "aov": {"excellent": 75, "good": 55, "average": 40, "poor": 25},
        "roas": {"excellent": 4.5, "good": 3.5, "average": 2.5, "poor": 1.5},
        "customer_retention": {"excellent": 0.45, "good": 0.35, "average": 0.25, "poor": 0.15}
    },
    "fashion": {
        "conversion_rate": {"excellent": 0.04, "good": 0.03, "average": 0.02, "poor": 0.012},
        "aov": {"excellent": 85, "good": 65, "average": 45, "poor": 30},
        "roas": {"excellent": 4.0, "good": 3.0, "average": 2.2, "poor": 1.3},
        "customer_retention": {"excellent": 0.35, "good": 0.28, "average": 0.20, "poor": 0.12}
    },
    "electronics": {
        "conversion_rate": {"excellent": 0.06, "good": 0.045, "average": 0.03, "poor": 0.018},
        "aov": {"excellent": 200, "good": 150, "average": 100, "poor": 60},
        "roas": {"excellent": 5.0, "good": 3.8, "average": 2.8, "poor": 1.8},
        "customer_retention": {"excellent": 0.5, "good": 0.4, "average": 0.3, "poor": 0.2}
    }
}

# Prediction accuracy thresholds
ACCURACY_THRESHOLDS = {
    "creative_fatigue": {
        "excellent": 0.9,
        "good": 0.8,
        "acceptable": 0.7,
        "retrain": 0.6
    },
    "budget_optimization": {
        "excellent": 0.85,
        "good": 0.75,
        "acceptable": 0.65,
        "retrain": 0.55
    },
    "customer_prediction": {
        "excellent": 0.8,
        "good": 0.7,
        "acceptable": 0.6,
        "retrain": 0.5
    },
    "product_velocity": {
        "excellent": 0.75,
        "good": 0.65,
        "acceptable": 0.55,
        "retrain": 0.45
    }
}