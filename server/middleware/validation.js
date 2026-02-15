/**
 * Input Validation Middleware
 * Comprehensive validation for all API endpoints using Joi
 */
import Joi from 'joi';

// Common validation patterns
const emailSchema = Joi.string().email().required();
const passwordSchema = Joi.string().min(8).max(128).required();
const platformSchema = Joi.string().valid('meta', 'google', 'klaviyo', 'ga4', 'shopify', 'tiktok').required();
const shopDomainSchema = Joi.string().pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/).required();

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi schema object
 * @param {string} property - Property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
function validateRequest(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace with validated/sanitized data
    req[property] = value;
    next();
  };
}

// --- Auth validation schemas ---
export const validateSignup = validateRequest(Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: emailSchema,
  password: passwordSchema
}));

export const validateLogin = validateRequest(Joi.object({
  email: emailSchema,
  password: Joi.string().required()
}));

export const validateChangePassword = validateRequest(Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: passwordSchema
}));

export const validateForgotPassword = validateRequest(Joi.object({
  email: emailSchema
}));

export const validateResetPassword = validateRequest(Joi.object({
  token: Joi.string().length(64).required(),
  newPassword: passwordSchema
}));

// --- OAuth validation schemas ---
export const validateOAuthInitiate = validateRequest(Joi.object({
  platform: platformSchema,
  redirectUri: Joi.string().uri().required()
}));

export const validateOAuthCallback = validateRequest(Joi.object({
  code: Joi.string().optional(),
  state: Joi.string().optional(),
  error: Joi.string().optional(),
  error_description: Joi.string().optional()
}).unknown(true), 'query');

// --- Platform connection validation ---
export const validatePlatformCredentials = validateRequest(Joi.object({
  platform: platformSchema,
  credentials: Joi.object().required()
}));

// --- Data query validation ---
export const validateDataQuery = validateRequest(Joi.object({
  dateRange: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().min(Joi.ref('start')).required()
  }).required(),
  metrics: Joi.array().items(Joi.string().valid(
    'revenue', 'orders', 'sessions', 'conversion_rate', 'aov',
    'ad_spend', 'roas', 'impressions', 'clicks', 'cpm', 'ctr',
    'email_revenue', 'email_opens', 'email_clicks', 'email_unsubscribes'
  )),
  granularity: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
  filters: Joi.object({
    channels: Joi.array().items(Joi.string().valid('shopify', 'meta', 'google', 'klaviyo')),
    campaigns: Joi.array().items(Joi.string()),
    products: Joi.array().items(Joi.string())
  }).default({})
}), 'query');

// --- Forecast validation ---
export const validateForecastRequest = validateRequest(Joi.object({
  metric: Joi.string().valid('revenue', 'orders', 'traffic').required(),
  horizon: Joi.number().integer().min(1).max(365).required(),
  method: Joi.string().valid('holt_winters', 'exponential', 'linear', 'wma').default('holt_winters'),
  confidence: Joi.number().min(0.5).max(0.99).default(0.95),
  seasonality: Joi.boolean().default(true)
}));

// --- Budget optimization validation ---
export const validateBudgetOptimization = validateRequest(Joi.object({
  totalBudget: Joi.number().positive().required(),
  channels: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    currentSpend: Joi.number().min(0).required(),
    minSpend: Joi.number().min(0).default(0),
    maxSpend: Joi.number().positive().required(),
    roas: Joi.number().positive().required()
  })).min(1).required(),
  constraints: Joi.object({
    maxChannelShare: Joi.number().min(0).max(1).default(0.8),
    minChannelShare: Joi.number().min(0).max(1).default(0.05),
    diversificationWeight: Joi.number().min(0).max(1).default(0.2)
  }).default({})
}));

// --- Fixed costs validation ---
export const validateFixedCost = validateRequest(Joi.object({
  label: Joi.string().trim().min(1).max(100).required(),
  monthlyAmount: Joi.number().positive().required(),
  category: Joi.string().valid('software', 'marketing', 'operations', 'shipping', 'other').default('other')
}));

// --- AI Chat validation ---
export const validateAIChat = validateRequest(Joi.object({
  message: Joi.string().trim().min(1).max(4000).required(),
  model: Joi.string().valid('gpt-4o', 'gpt-4', 'claude-3-opus', 'claude-3-sonnet', 'llama2').default('gpt-4o'),
  context: Joi.object({
    includeData: Joi.boolean().default(true),
    dateRange: Joi.object({
      start: Joi.date().iso().required(),
      end: Joi.date().iso().min(Joi.ref('start')).required()
    }).optional()
  }).default({})
}));

// --- Billing validation ---
export const validateCreateSubscription = validateRequest(Joi.object({
  priceId: Joi.string().required(),
  paymentMethodId: Joi.string().optional(),
  trial: Joi.boolean().default(false)
}));

export const validateUpdateSubscription = validateRequest(Joi.object({
  priceId: Joi.string().required()
}));

// --- Export validation ---
export const validateExportRequest = validateRequest(Joi.object({
  type: Joi.string().valid('csv', 'excel', 'pdf').required(),
  data: Joi.string().valid('dashboard', 'revenue', 'ads', 'email', 'costs').required(),
  dateRange: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().min(Joi.ref('start')).required()
  }).required(),
  filters: Joi.object({
    channels: Joi.array().items(Joi.string()),
    metrics: Joi.array().items(Joi.string())
  }).default({})
}));

// --- Webhook validation ---
export const validateWebhookPayload = (topic) => {
  const baseSchema = Joi.object({
    id: Joi.number().required(),
    created_at: Joi.string().isoDate().required(),
    updated_at: Joi.string().isoDate().required()
  });

  const schemas = {
    'app/uninstalled': baseSchema.keys({
      domain: Joi.string().required()
    }),
    'orders/create': baseSchema.keys({
      order_number: Joi.number().required(),
      total_price: Joi.string().required(),
      currency: Joi.string().length(3).required(),
      line_items: Joi.array().required()
    }),
    'orders/updated': baseSchema.keys({
      order_number: Joi.number().required(),
      total_price: Joi.string().required(),
      currency: Joi.string().length(3).required()
    }),
    'customers/create': baseSchema.keys({
      email: Joi.string().email().required(),
      first_name: Joi.string().allow('').default(''),
      last_name: Joi.string().allow('').default('')
    }),
    'customers/data_request': baseSchema.keys({
      shop_domain: Joi.string().required(),
      orders_requested: Joi.array().required()
    }),
    'customers/redact': baseSchema.keys({
      shop_domain: Joi.string().required(),
      customer: Joi.object().required()
    }),
    'shop/redact': baseSchema.keys({
      shop_domain: Joi.string().required()
    })
  };

  return validateRequest(schemas[topic] || baseSchema);
};

// --- Input sanitization ---
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// --- Express middleware to sanitize all inputs ---
export function sanitizeAllInputs(req, res, next) {
  if (req.body) req.body = sanitizeInput(req.body);
  // req.query is a readonly getter in Express 5 — sanitize values in place
  if (req.query) {
    const sanitized = sanitizeInput(req.query);
    for (const key of Object.keys(sanitized)) {
      req.query[key] = sanitized[key];
    }
  }
  if (req.params) {
    const sanitizedParams = sanitizeInput(req.params);
    for (const key of Object.keys(sanitizedParams)) {
      req.params[key] = sanitizedParams[key];
    }
  }
  next();
}

// --- Custom validation rules ---
Joi.extend((joi) => ({
  type: 'shopDomain',
  base: joi.string(),
  messages: {
    'shopDomain.format': '{{#label}} must be a valid Shopify domain (e.g., store.myshopify.com)'
  },
  rules: {
    format: {
      validate(value, helpers) {
        if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(value)) {
          return helpers.error('shopDomain.format');
        }
        return value;
      }
    }
  }
}));

// --- Error response formatter ---
export function formatValidationError(error) {
  return {
    error: 'Validation failed',
    details: error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, "'"),
      value: detail.context?.value
    })),
    code: 'VALIDATION_ERROR'
  };
}