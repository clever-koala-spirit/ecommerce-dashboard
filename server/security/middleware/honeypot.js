/**
 * Pentagon Gateway - Honeypot Middleware
 * Detects and traps malicious actors attempting unauthorized access
 */

import crypto from 'crypto';

class HoneypotLayer {
  constructor() {
    this.trapSessions = new Map();
    this.blockedIPs = new Set();
    this.trapTypes = {
      'ADMIN_ACCESS': 'Unauthorized admin access attempt',
      'ENV_ACCESS': 'Environment file access attempt', 
      'BACKUP_ACCESS': 'Backup file access attempt',
      'CONFIG_ACCESS': 'Configuration file access attempt',
      'API_PROBE': 'API endpoint probing'
    };
  }

  // General middleware for request monitoring
  middleware() {
    return (req, res, next) => {
      const clientIP = this.getClientIP(req);
      
      // Check if IP is already blocked
      if (this.blockedIPs.has(clientIP)) {
        return this.serveTrapResponse(req, res, 'BLOCKED_IP');
      }
      
      // Check for suspicious patterns
      if (this.isSuspiciousRequest(req)) {
        this.logTrapActivity(clientIP, 'SUSPICIOUS_PATTERN', req);
        this.addToWatchList(clientIP);
      }
      
      next();
    };
  }

  // Create specific trap endpoint
  trap(trapType) {
    return (req, res) => {
      const clientIP = this.getClientIP(req);
      
      console.log(`🍯 HONEYPOT TRIGGERED: ${trapType} from ${clientIP}`);
      
      // Log the trap activation
      this.logTrapActivity(clientIP, trapType, req);
      
      // Add to blocked list if repeated attempts
      this.evaluateAndBlock(clientIP, trapType);
      
      // Serve convincing trap response
      this.serveTrapResponse(req, res, trapType);
    };
  }

  // Log trap activity for analysis
  logTrapActivity(ip, trapType, req) {
    const activity = {
      timestamp: new Date().toISOString(),
      ip: ip,
      trapType: trapType,
      userAgent: req.get('User-Agent') || 'unknown',
      path: req.path,
      method: req.method,
      headers: req.headers,
      sessionId: this.generateSessionId(ip)
    };
    
    // Store in trap sessions
    if (!this.trapSessions.has(ip)) {
      this.trapSessions.set(ip, []);
    }
    
    const sessions = this.trapSessions.get(ip);
    sessions.push(activity);
    
    // Keep only last 50 activities per IP
    if (sessions.length > 50) {
      sessions.shift();
    }
    
    // Log to security system
    console.log('🚨 HONEYPOT ACTIVITY:', JSON.stringify(activity, null, 2));
  }

  // Evaluate if IP should be blocked
  evaluateAndBlock(ip, trapType) {
    const sessions = this.trapSessions.get(ip) || [];
    const recentSessions = sessions.filter(s => 
      Date.now() - new Date(s.timestamp).getTime() < 60000 // Last 1 minute
    );
    
    // Block after 3 trap hits in 1 minute
    if (recentSessions.length >= 3) {
      this.blockedIPs.add(ip);
      console.log(`🚫 IP BLOCKED: ${ip} (${recentSessions.length} trap activations)`);
      
      // Auto-unblock after 1 hour
      setTimeout(() => {
        this.blockedIPs.delete(ip);
        console.log(`✅ IP UNBLOCKED: ${ip} (auto-unblock)`);
      }, 60 * 60 * 1000);
    }
  }

  // Add IP to watch list for monitoring
  addToWatchList(ip) {
    // Implementation would integrate with security monitoring system
    console.log(`👁️ ADDED TO WATCH LIST: ${ip}`);
  }

  // Serve convincing trap responses
  serveTrapResponse(req, res, trapType) {
    const responses = {
      'ADMIN_ACCESS': this.generateAdminTrapResponse(),
      'ENV_ACCESS': this.generateEnvTrapResponse(), 
      'BACKUP_ACCESS': this.generateBackupTrapResponse(),
      'BLOCKED_IP': this.generateBlockedResponse(),
      'SUSPICIOUS_PATTERN': this.generateGenericResponse()
    };
    
    const response = responses[trapType] || responses['SUSPICIOUS_PATTERN'];
    
    // Add delay to slow down attackers
    setTimeout(() => {
      res.status(response.status).json(response.body);
    }, Math.random() * 2000 + 1000); // 1-3 second delay
  }

  // Generate different trap responses
  generateAdminTrapResponse() {
    return {
      status: 401,
      body: {
        error: 'Authentication required',
        message: 'Please provide valid administrator credentials',
        loginUrl: '/admin/login',
        version: '2.1.3'
      }
    };
  }

  generateEnvTrapResponse() {
    return {
      status: 200,
      body: {
        // Fake environment data to waste attacker's time
        DATABASE_URL: 'postgresql://fake:fake@localhost:5432/honeypot',
        JWT_SECRET: 'fake_jwt_secret_not_real',
        API_KEY: 'hp_fake_api_key_12345',
        DEBUG: 'false'
      }
    };
  }

  generateBackupTrapResponse() {
    return {
      status: 200,
      body: {
        backups: [
          { file: 'backup_2024_01_fake.tar.gz', size: '2.3GB', date: '2024-01-15' },
          { file: 'backup_2024_02_fake.tar.gz', size: '2.1GB', date: '2024-02-01' }
        ],
        total: 2,
        downloadUrl: '/api/backup/download/'
      }
    };
  }

  generateBlockedResponse() {
    return {
      status: 403,
      body: {
        error: 'Access denied',
        message: 'Your IP has been flagged for suspicious activity',
        code: 'IP_BLOCKED'
      }
    };
  }

  generateGenericResponse() {
    return {
      status: 404,
      body: {
        error: 'Not found',
        message: 'The requested resource was not found'
      }
    };
  }

  // Check if request looks suspicious
  isSuspiciousRequest(req) {
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /\/etc\/passwd/, // System file access
      /\/proc\//, // Process information
      /php|asp|jsp/, // Suspicious file extensions
      /union.*select/i, // SQL injection
      /<script/i, // XSS attempts
      /base64_decode/i, // Malicious payloads
      /cmd|exec|system/i // Command injection
    ];
    
    const testStrings = [
      req.url,
      req.path,
      JSON.stringify(req.query),
      req.get('User-Agent') || ''
    ];
    
    return testStrings.some(str => 
      suspiciousPatterns.some(pattern => pattern.test(str))
    );
  }

  // Get real client IP
  getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '0.0.0.0';
  }

  // Generate session ID for tracking
  generateSessionId(ip) {
    return crypto.createHash('sha256')
      .update(ip + Date.now().toString())
      .digest('hex')
      .substring(0, 16);
  }

  // Get honeypot statistics
  getStats() {
    return {
      trapSessions: this.trapSessions.size,
      blockedIPs: this.blockedIPs.size,
      totalActivations: Array.from(this.trapSessions.values())
        .reduce((sum, sessions) => sum + sessions.length, 0)
    };
  }

  // Clear old data
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [ip, sessions] of this.trapSessions) {
      const recentSessions = sessions.filter(s => 
        new Date(s.timestamp).getTime() > oneHourAgo
      );
      
      if (recentSessions.length === 0) {
        this.trapSessions.delete(ip);
      } else {
        this.trapSessions.set(ip, recentSessions);
      }
    }
  }
}

export default HoneypotLayer;