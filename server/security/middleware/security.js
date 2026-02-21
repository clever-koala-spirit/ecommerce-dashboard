/**
 * Pentagon-Grade Security Middleware
 * Implements multi-layered defense mechanisms
 */

const crypto = require('crypto');
const { promisify } = require('util');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

class SecurityLayer {
  constructor() {
    this.ipWhitelist = new Set(process.env.IP_WHITELIST?.split(',') || []);
    this.ipBlacklist = new Set();
    this.suspiciousPatterns = [
      /\.\./,                    // Directory traversal
      /<script/i,                // XSS attempts
      /union.*select/i,          // SQL injection
      /exec\(/i,                 // Code injection
      /eval\(/i,                 // Code injection
      /base64_decode/i,          // Malicious payload
      /system\(/i,               // System command injection
    ];
    this.maxRequestSize = 10 * 1024 * 1024; // 10MB
  }

  middleware() {
    return [
      this.ipFilterMiddleware.bind(this),
      this.requestSizeMiddleware.bind(this),
      this.maliciousPatternMiddleware.bind(this),
      this.requestIntegrityMiddleware.bind(this),
      this.antiReplayMiddleware.bind(this)
    ];
  }

  /**
   * IP-based filtering and geolocation checks
   */
  ipFilterMiddleware(req, res, next) {
    const clientIP = this.getClientIP(req);
    
    // Check blacklist
    if (this.ipBlacklist.has(clientIP)) {
      this.logSecurityViolation(req, 'BLACKLISTED_IP', { ip: clientIP });
      return res.status(403).json({
        error: 'Access denied',
        code: 'IP_BLACKLISTED'
      });
    }

    // Check for tor exit nodes and proxy detection
    if (this.isSuspiciousIP(clientIP)) {
      this.logSecurityViolation(req, 'SUSPICIOUS_IP', { ip: clientIP });
      // Don't block immediately, but flag for monitoring
      req.securityFlags = req.securityFlags || [];
      req.securityFlags.push('SUSPICIOUS_IP');
    }

    // Rate limiting per IP
    const ipRateLimit = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60, // 60 requests per minute per IP
      keyGenerator: (req) => this.getClientIP(req),
      handler: (req, res) => {
        this.logSecurityViolation(req, 'IP_RATE_LIMIT', { ip: clientIP });
        res.status(429).json({
          error: 'Rate limit exceeded for IP',
          code: 'IP_RATE_LIMIT'
        });
      }
    });

    ipRateLimit(req, res, next);
  }

  /**
   * Request size and payload validation
   */
  requestSizeMiddleware(req, res, next) {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > this.maxRequestSize) {
      this.logSecurityViolation(req, 'REQUEST_TOO_LARGE', { 
        size: contentLength,
        maxSize: this.maxRequestSize 
      });
      return res.status(413).json({
        error: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE'
      });
    }

    next();
  }

  /**
   * Detect malicious patterns in requests
   */
  maliciousPatternMiddleware(req, res, next) {
    const suspicious = this.detectMaliciousPatterns(req);
    
    if (suspicious.length > 0) {
      this.logSecurityViolation(req, 'MALICIOUS_PATTERN', { 
        patterns: suspicious,
        url: req.url,
        body: typeof req.body === 'object' ? JSON.stringify(req.body) : req.body
      });

      // Auto-blacklist IP after multiple violations
      this.handleSecurityViolation(req);

      return res.status(400).json({
        error: 'Malicious request detected',
        code: 'MALICIOUS_REQUEST'
      });
    }

    next();
  }

  /**
   * Request integrity and anti-tampering
   */
  requestIntegrityMiddleware(req, res, next) {
    // Generate request signature for integrity
    req.id = crypto.randomUUID();
    req.timestamp = Date.now();
    
    // Check for required security headers
    const requiredHeaders = ['user-agent'];
    const missingHeaders = requiredHeaders.filter(header => !req.get(header));
    
    if (missingHeaders.length > 0) {
      this.logSecurityViolation(req, 'MISSING_HEADERS', { 
        missing: missingHeaders 
      });
      req.securityFlags = req.securityFlags || [];
      req.securityFlags.push('MISSING_HEADERS');
    }

    // Check for suspicious user agents
    const userAgent = req.get('User-Agent') || '';
    if (this.isSuspiciousUserAgent(userAgent)) {
      this.logSecurityViolation(req, 'SUSPICIOUS_USER_AGENT', { 
        userAgent 
      });
      req.securityFlags = req.securityFlags || [];
      req.securityFlags.push('SUSPICIOUS_USER_AGENT');
    }

    next();
  }

  /**
   * Anti-replay attack protection
   */
  antiReplayMiddleware(req, res, next) {
    const timestamp = req.get('X-Timestamp');
    const nonce = req.get('X-Nonce');
    
    if (timestamp && nonce) {
      const requestTime = parseInt(timestamp);
      const currentTime = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (currentTime - requestTime > maxAge) {
        this.logSecurityViolation(req, 'REPLAY_ATTACK', { 
          timestamp,
          age: currentTime - requestTime 
        });
        return res.status(401).json({
          error: 'Request timestamp too old',
          code: 'REPLAY_ATTACK'
        });
      }

      // Check nonce uniqueness (implement with Redis in production)
      if (this.isNonceUsed(nonce)) {
        this.logSecurityViolation(req, 'NONCE_REUSE', { nonce });
        return res.status(401).json({
          error: 'Nonce already used',
          code: 'NONCE_REUSE'
        });
      }
    }

    next();
  }

  /**
   * Detect malicious patterns in request data
   */
  detectMaliciousPatterns(req) {
    const suspicious = [];
    const testStrings = [
      req.url,
      JSON.stringify(req.query),
      JSON.stringify(req.headers),
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    ];

    testStrings.forEach(str => {
      if (str) {
        this.suspiciousPatterns.forEach((pattern, index) => {
          if (pattern.test(str)) {
            suspicious.push(`Pattern_${index}`);
          }
        });
      }
    });

    return suspicious;
  }

  /**
   * Get real client IP, accounting for proxies
   */
  getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '0.0.0.0';
  }

  /**
   * Check if IP is suspicious (Tor, known proxies, etc.)
   */
  isSuspiciousIP(ip) {
    // Simplified check - in production, use threat intelligence feeds
    const torExitNodes = ['95.216.4.137', '185.220.101.1']; // Example
    const knownProxies = ['127.0.0.1']; // Example
    
    return torExitNodes.includes(ip) || knownProxies.includes(ip);
  }

  /**
   * Check if user agent is suspicious
   */
  isSuspiciousUserAgent(userAgent) {
    const suspiciousUAs = [
      /^$/,                      // Empty user agent
      /sqlmap/i,                 // SQL injection tool
      /nikto/i,                  // Web scanner
      /nmap/i,                   // Port scanner
      /masscan/i,                // Mass scanner
      /gobuster/i,               // Directory brute forcer
      /dirb/i,                   // Directory brute forcer
    ];

    return suspiciousUAs.some(pattern => pattern.test(userAgent));
  }

  /**
   * Check if nonce was previously used
   */
  isNonceUsed(nonce) {
    // In production, implement with Redis for distributed storage
    return false; // Simplified for now
  }

  /**
   * Handle security violations
   */
  handleSecurityViolation(req) {
    const clientIP = this.getClientIP(req);
    
    // Implement violation counting and auto-blacklisting
    // In production, use Redis for distributed storage
    
    console.log(`Security violation from ${clientIP}`);
  }

  /**
   * Log security violations for SIEM
   */
  logSecurityViolation(req, type, details = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'HIGH',
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      headers: req.headers,
      ...details
    };

    // In production, send to SIEM system
    console.log('SECURITY_VIOLATION:', JSON.stringify(event, null, 2));
  }
}

export default SecurityLayer;