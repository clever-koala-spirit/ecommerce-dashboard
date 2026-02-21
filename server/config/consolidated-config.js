/**
 * Consolidated Configuration for Slay Season Platform
 * Includes settings for ML models, JARVIS, Pentagon security, and main ecommerce features
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '127.0.0.1',
    environment: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://api.slayseason.com',
      'https://slayseason.com'
    ]
  },

  // Security Configuration (Pentagon Integration)
  security: {
    encryption: {
      key: process.env.ENCRYPTION_KEY,
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      iterations: 100000
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
      issuer: 'slay-season',
      audience: 'slay-season-users'
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    predictionRateLimit: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 20, // predictions per window
      skipSuccessfulRequests: false
    },
    honeypot: {
      enabled: true,
      logLevel: 'warn',
      banDuration: 3600000 // 1 hour in ms
    }
  },

  // ML Model Configuration
  ml: {
    models: {
      budgetOptimizer: {
        enabled: true,
        modelPath: './models/budget_optimizer.py',
        confidence_threshold: 0.7,
        max_processing_time: 30000, // 30 seconds
        fallback: 'historical_average'
      },
      customerPurchase: {
        enabled: true,
        modelPath: './models/customer_purchase.py',
        confidence_threshold: 0.6,
        max_processing_time: 15000, // 15 seconds
        fallback: 'demographic_baseline'
      },
      productVelocity: {
        enabled: true,
        modelPath: './models/product_velocity.py',
        confidence_threshold: 0.65,
        max_processing_time: 20000, // 20 seconds
        fallback: 'seasonal_trends'
      },
      creativeFatigue: {
        enabled: true,
        modelPath: './models/creative_fatigue.py',
        confidence_threshold: 0.7,
        max_processing_time: 25000, // 25 seconds
        fallback: 'performance_degradation_analysis'
      },
      crossMerchant: {
        enabled: true,
        modelPath: './models/cross_merchant.py',
        confidence_threshold: 0.8,
        max_processing_time: 35000, // 35 seconds
        fallback: 'industry_benchmarks'
      }
    },
    python: {
      executable: process.env.PYTHON_PATH || 'python3',
      timeout: 60000, // 60 seconds max for Python processes
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      virtualEnv: process.env.VIRTUAL_ENV_PATH || null
    }
  },

  // JARVIS Configuration (AI Failover System)
  jarvis: {
    errorRecovery: {
      enabled: true,
      maxRetries: 3,
      retryDelays: [1000, 5000, 15000], // Progressive delays in ms
      fallbackStrategies: {
        ml_failure: 'historical_data',
        api_timeout: 'cached_response',
        system_overload: 'simplified_calculation',
        data_corruption: 'clean_fallback'
      },
      circuit_breaker: {
        failure_threshold: 5,
        recovery_timeout: 60000, // 1 minute
        half_open_max_calls: 3
      }
    },
    contextManager: {
      enabled: true,
      maxContextSize: 1024 * 50, // 50KB
      contextTtl: 3600000, // 1 hour
      compressionEnabled: true
    },
    router: {
      enabled: true,
      healthCheckInterval: 30000, // 30 seconds
      serviceRegistry: {
        ml_service: 'http://localhost:5000',
        prediction_cache: 'redis://localhost:6379'
      }
    }
  },

  // Database Configuration
  database: {
    type: 'sqlite',
    path: process.env.DB_PATH || './data.db',
    encryption: true,
    backup: {
      enabled: true,
      interval: 86400000, // 24 hours
      retention: 30 // Keep 30 days of backups
    }
  },

  // Third-party Services
  services: {
    shopify: {
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecret: process.env.SHOPIFY_API_SECRET,
      scopes: 'read_products,read_orders,read_customers,read_analytics',
      hostName: process.env.SHOPIFY_APP_URL || 'https://api.slayseason.com'
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'noreply@slayseason.com',
      templates: {
        welcome: process.env.SENDGRID_WELCOME_TEMPLATE,
        prediction_report: process.env.SENDGRID_PREDICTION_TEMPLATE
      }
    }
  },

  // Cron Job Configuration
  cron: {
    snapshots: {
      schedule: '0 0 * * *', // Daily at midnight
      enabled: true
    },
    dataSync: {
      schedule: '0 */6 * * *', // Every 6 hours
      enabled: true
    },
    modelRetraining: {
      schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
      enabled: process.env.NODE_ENV === 'production'
    },
    healthCheck: {
      schedule: '*/5 * * * *', // Every 5 minutes
      enabled: true
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'simple',
    file: {
      enabled: true,
      path: './logs',
      maxSize: '10m',
      maxFiles: '30d'
    },
    console: {
      enabled: process.env.NODE_ENV !== 'production',
      colorize: true
    },
    audit: {
      enabled: true,
      sensitiveFields: ['password', 'token', 'key', 'secret'],
      retention: 90 // days
    }
  },

  // Cache Configuration
  cache: {
    type: 'memory', // Can be 'memory' or 'redis'
    ttl: 3600, // 1 hour default TTL
    prediction_cache: {
      ttl: 1800, // 30 minutes for predictions
      maxSize: 1000 // Max cached predictions
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null
    }
  },

  // Feature Flags
  features: {
    predictions: {
      enabled: true,
      beta: false
    },
    jarvis_failover: {
      enabled: true,
      beta: false
    },
    pentagon_security: {
      enabled: true,
      advanced_encryption: true,
      audit_logging: true
    },
    cross_merchant_insights: {
      enabled: true,
      beta: true
    },
    real_time_optimization: {
      enabled: false,
      beta: true
    }
  }
};

// Configuration validation
export const validateConfig = () => {
  const required = [
    'ENCRYPTION_KEY',
    'JWT_SECRET',
    'SHOPIFY_API_KEY',
    'SHOPIFY_API_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate encryption key length
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }

  return true;
};

// Export individual config sections for convenience
export const { server, security, ml, jarvis, database, services, cron, logging, cache, features } = config;

export default config;