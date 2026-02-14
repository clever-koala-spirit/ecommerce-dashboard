/**
 * Structured Logging with Winston
 * JSON-formatted logs for production monitoring and debugging
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured JSON logs
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Console format for development (pretty-printed)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let output = `${timestamp} [${level}] ${message}`;
    if (Object.keys(meta).length > 0) {
      output += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return output;
  })
);

// Log level configuration based on environment
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Create the logger
const logger = winston.createLogger({
  level: logLevel,
  format: jsonFormat,
  defaultMeta: {
    service: 'ecommerce-dashboard',
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error logs (only errors and above)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5,
      tailable: true
    }),

    // Combined logs (all levels)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      tailable: true
    }),

    // Security-specific logs
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          // Only log security-related events
          return info.category === 'security' ? info : false;
        })()
      )
    })
  ],
  
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: jsonFormat
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: jsonFormat
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
} else {
  // In production, still log to console but use JSON format for log aggregation
  logger.add(new winston.transports.Console({
    format: jsonFormat
  }));
}

// Convenience methods for common logging patterns
export const log = {
  // General logging
  debug: (message, meta = {}) => logger.debug(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, error = null, meta = {}) => {
    if (error instanceof Error) {
      logger.error(message, { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        ...meta 
      });
    } else {
      logger.error(message, { error, ...meta });
    }
  },

  // Security-specific logging
  security: (event, details = {}) => logger.warn(event, { 
    category: 'security',
    timestamp: new Date().toISOString(),
    ...details 
  }),

  // API request/response logging
  request: (req, res, duration) => {
    const logData = {
      category: 'api',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      shopDomain: req.shopDomain || 'anonymous',
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 200),
      contentLength: res.get('Content-Length') || 0
    };

    if (res.statusCode >= 400) {
      logger.warn('API request failed', logData);
    } else if (req.path.includes('/auth') || req.path.includes('/webhook')) {
      logger.info('API request', logData);
    } else {
      logger.debug('API request', logData);
    }
  },

  // Database operation logging
  database: (operation, table, meta = {}) => logger.debug(`Database ${operation}`, {
    category: 'database',
    operation,
    table,
    ...meta
  }),

  // Platform integration logging
  platform: (platform, operation, success, meta = {}) => {
    const level = success ? 'info' : 'error';
    logger[level](`Platform ${operation}`, {
      category: 'platform',
      platform,
      operation,
      success,
      ...meta
    });
  },

  // Business metrics logging (for monitoring/alerting)
  metric: (metric, value, tags = {}) => logger.info('Business metric', {
    category: 'metric',
    metric,
    value,
    tags,
    timestamp: new Date().toISOString()
  }),

  // Performance monitoring
  performance: (operation, duration, meta = {}) => {
    const level = duration > 5000 ? 'warn' : 'debug';
    logger[level](`Performance: ${operation}`, {
      category: 'performance',
      operation,
      duration: `${duration}ms`,
      slow: duration > 5000,
      ...meta
    });
  },

  // OAuth flow logging
  oauth: (platform, event, meta = {}) => logger.info(`OAuth ${event}`, {
    category: 'oauth',
    platform,
    event,
    ...meta
  }),

  // Payment/billing logging
  billing: (event, meta = {}) => logger.info(`Billing ${event}`, {
    category: 'billing',
    event,
    ...meta
  }),

  // Email service logging
  email: (event, recipient, meta = {}) => logger.info(`Email ${event}`, {
    category: 'email',
    event,
    recipient: recipient?.replace(/(..).*(@.*)/, '$1***$2'), // Mask email for privacy
    ...meta
  })
};

// Express middleware for request logging
export function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.request(req, res, duration);
  });
  
  next();
}

// Express middleware for error logging
export function errorLogger(err, req, res, next) {
  log.error('Express error handler', err, {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    shopDomain: req.shopDomain,
    ip: req.ip
  });
  
  next(err);
}

// Utility function to safely log sensitive data
export function maskSensitiveData(data) {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'access_token', 'refresh_token'];
  
  if (typeof data === 'string') {
    return data.replace(/./g, '*');
  }
  
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }
  
  if (data && typeof data === 'object') {
    const masked = {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        masked[key] = typeof value === 'string' ? '*'.repeat(Math.min(value.length, 8)) : '[REDACTED]';
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }
  
  return data;
}

export default logger;