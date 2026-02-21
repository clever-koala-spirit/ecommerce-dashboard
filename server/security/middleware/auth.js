/**
 * Pentagon Gateway - Authentication Middleware
 * JWT-based authentication with security classification support
 */

import jwt from 'jsonwebtoken';

class AuthLayer {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'pentagon-gateway-secret';
    this.classificationHierarchy = {
      'RESTRICTED': 0,
      'CONFIDENTIAL': 1,
      'SECRET': 2,
      'TOP_SECRET': 3
    };
  }

  // Main authentication middleware
  middleware() {
    return (req, res, next) => {
      try {
        const token = this.extractToken(req);
        
        if (!token) {
          return res.status(401).json({
            error: 'Authentication required',
            code: 'NO_TOKEN'
          });
        }

        const decoded = jwt.verify(token, this.jwtSecret);
        req.user = decoded;
        
        // Add security context
        req.securityContext = {
          classification: decoded.classification || 'RESTRICTED',
          clearanceLevel: this.classificationHierarchy[decoded.classification] || 0
        };

        next();
      } catch (error) {
        console.error('Authentication failed:', error.message);
        res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
    };
  }

  // Classification requirement middleware
  requireClassification(requiredClassification) {
    return (req, res, next) => {
      const userLevel = req.securityContext?.clearanceLevel || 0;
      const requiredLevel = this.classificationHierarchy[requiredClassification] || 0;
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Insufficient security clearance',
          code: 'INSUFFICIENT_CLEARANCE',
          required: requiredClassification,
          current: req.securityContext?.classification || 'RESTRICTED'
        });
      }
      
      next();
    };
  }

  // Extract JWT token from request
  extractToken(req) {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    
    // Check query parameter (for WebSocket upgrades)
    if (req.query.token) {
      return req.query.token;
    }
    
    // Check cookie
    if (req.cookies && req.cookies.auth_token) {
      return req.cookies.auth_token;
    }
    
    return null;
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        classification: user.classification,
        clearance: user.classification
      },
      this.jwtSecret,
      { 
        expiresIn: '24h',
        issuer: 'pentagon-gateway',
        audience: 'pentagon-users'
      }
    );
  }

  // Verify token without middleware
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // Check if user has required classification
  hasClassification(userClassification, requiredClassification) {
    const userLevel = this.classificationHierarchy[userClassification] || 0;
    const requiredLevel = this.classificationHierarchy[requiredClassification] || 0;
    return userLevel >= requiredLevel;
  }
}

export default AuthLayer;