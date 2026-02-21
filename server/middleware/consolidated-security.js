const logger = require('winston');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');

// Import Pentagon security components
const encryption = require('../security/crypto/encryption');
const honeypot = require('../security/middleware/honeypot');
const securityHeaders = require('../security/middleware/security');

// Import JARVIS error recovery
const ErrorRecovery = require('../jarvis/recovery/ErrorRecovery');

// Import existing Slay Season auth
const { verifyToken } = require('../auth/tokenValidation');
const { checkPermissions } = require('../auth/permissions');

class ConsolidatedSecurity {
    constructor() {
        this.errorRecovery = new ErrorRecovery();
        this.setupRateLimiting();
        this.setupSecurityHeaders();
    }

    setupRateLimiting() {
        // Enhanced rate limiting with Pentagon features
        this.standardRateLimit = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: async (req, res, next) => {
                logger.warn('Rate limit exceeded', { 
                    ip: req.ip, 
                    userAgent: req.get('User-Agent'),
                    path: req.path 
                });
                
                // Pentagon honeypot integration
                await honeypot.logSuspiciousActivity(req);
                
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
                });
            }
        });

        // Strict rate limiting for prediction endpoints
        this.predictionRateLimit = rateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 20, // limit each IP to 20 prediction requests per 5 minutes
            message: {
                error: 'Too many prediction requests, please try again later.',
                retryAfter: '5 minutes'
            }
        });
    }

    setupSecurityHeaders() {
        this.helmetConfig = helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://api.stripe.com", "https://checkout.stripe.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            crossOriginEmbedderPolicy: false
        });
    }

    // Consolidated authentication middleware
    authenticate() {
        return async (req, res, next) => {
            try {
                // Extract token from Authorization header or cookies
                const token = req.headers.authorization?.split(' ')[1] || 
                             req.cookies?.access_token;

                if (!token) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication token required'
                    });
                }

                // Verify token with existing Slay Season auth
                const decoded = await verifyToken(token);
                
                // Pentagon encryption verification for sensitive data
                if (req.body && req.body.encrypted) {
                    try {
                        req.body = await encryption.decrypt(req.body.encrypted);
                    } catch (decryptError) {
                        logger.warn('Failed to decrypt request body', { 
                            userId: decoded.userId,
                            error: decryptError.message 
                        });
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid encrypted payload'
                        });
                    }
                }

                // Attach user info to request
                req.user = {
                    id: decoded.userId,
                    email: decoded.email,
                    role: decoded.role,
                    permissions: decoded.permissions,
                    sessionId: decoded.sessionId
                };

                // Log successful authentication
                logger.info('User authenticated successfully', {
                    userId: req.user.id,
                    ip: req.ip,
                    path: req.path,
                    method: req.method
                });

                next();

            } catch (error) {
                // JARVIS error recovery for auth failures
                const recovery = await this.errorRecovery.handleError(error, {
                    context: 'authentication',
                    fallback: 'guest_access'
                });

                if (recovery.resolved && recovery.allowGuestAccess) {
                    req.user = { role: 'guest', permissions: [] };
                    next();
                } else {
                    logger.warn('Authentication failed', { 
                        error: error.message,
                        ip: req.ip,
                        userAgent: req.get('User-Agent')
                    });

                    res.status(401).json({
                        success: false,
                        error: 'Invalid or expired token'
                    });
                }
            }
        };
    }

    // Permission-based authorization
    authorize(requiredPermissions = []) {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required'
                    });
                }

                // Check permissions using existing Slay Season system
                const hasPermission = await checkPermissions(
                    req.user.id, 
                    requiredPermissions
                );

                if (!hasPermission && req.user.role !== 'admin') {
                    logger.warn('Permission denied', {
                        userId: req.user.id,
                        requiredPermissions,
                        userRole: req.user.role,
                        path: req.path
                    });

                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions'
                    });
                }

                next();

            } catch (error) {
                logger.error('Authorization check failed', { 
                    error: error.message,
                    userId: req.user?.id 
                });

                res.status(500).json({
                    success: false,
                    error: 'Authorization service unavailable'
                });
            }
        };
    }

    // Input validation and sanitization
    validateInput() {
        return (req, res, next) => {
            try {
                // Pentagon security input validation
                if (securityHeaders.validateInput) {
                    const validation = securityHeaders.validateInput(req.body);
                    if (!validation.isValid) {
                        logger.warn('Input validation failed', {
                            errors: validation.errors,
                            userId: req.user?.id,
                            ip: req.ip
                        });

                        return res.status(400).json({
                            success: false,
                            error: 'Invalid input data',
                            details: validation.errors
                        });
                    }
                }

                // Sanitize inputs
                if (req.body) {
                    req.body = this.sanitizeObject(req.body);
                }

                if (req.query) {
                    req.query = this.sanitizeObject(req.query);
                }

                next();

            } catch (error) {
                logger.error('Input validation error', { 
                    error: error.message,
                    userId: req.user?.id 
                });

                res.status(400).json({
                    success: false,
                    error: 'Input validation failed'
                });
            }
        };
    }

    // Sanitize object recursively
    sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                // Basic sanitization - remove potential XSS vectors
                sanitized[key] = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .trim();
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    // Comprehensive security middleware stack
    getSecurityStack() {
        return [
            this.helmetConfig,
            honeypot.middleware(),
            this.standardRateLimit,
            this.validateInput(),
            this.authenticate(),
        ];
    }

    // Prediction-specific security stack
    getPredictionSecurityStack() {
        return [
            this.helmetConfig,
            honeypot.middleware(),
            this.predictionRateLimit,
            this.validateInput(),
            this.authenticate(),
            this.authorize(['predictions:read', 'ml:access'])
        ];
    }

    // Admin-only security stack
    getAdminSecurityStack() {
        return [
            this.helmetConfig,
            honeypot.middleware(),
            this.standardRateLimit,
            this.validateInput(),
            this.authenticate(),
            this.authorize(['admin:read', 'admin:write'])
        ];
    }
}

module.exports = new ConsolidatedSecurity();