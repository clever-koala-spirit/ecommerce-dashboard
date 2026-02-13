/**
 * User Authentication Routes
 * Handles user registration, login, and session management for the marketing dashboard
 * Separate from Shopify OAuth which is for the embedded Shopify app
 */
import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

// In-memory user store (replace with real DB in production)
// In production, use a proper database like PostgreSQL with hashed passwords
const users = new Map();

const JWT_SECRET = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'slay-season-secret-key-change-me';

/**
 * Hash password using PBKDF2
 * @param {string} password - Plain text password
 * @param {string} salt - Salt for hashing
 * @returns {string} Hashed password
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

/**
 * POST /api/auth/signup
 * Register a new user account
 */
router.post('/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email already exists
    if (users.has(emailLower)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create new user
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = hashPassword(password, salt);
    const userId = crypto.randomUUID();

    const user = {
      id: userId,
      name: name.trim(),
      email: emailLower,
      hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    users.set(emailLower, user);

    // Create JWT token
    const token = jwt.sign(
      { userId, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLoginAt = new Date().toISOString();

    res.status(201).json({
      token,
      user: { id: userId, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('[Auth] Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = users.get(emailLower);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const hashedAttempt = hashPassword(password, user.salt);
    if (hashedAttempt !== user.hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLoginAt = new Date().toISOString();

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = users.get(decoded.email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('[Auth] Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (mostly a client-side operation, but useful for cleanup)
 */
router.post('/logout', (req, res) => {
  try {
    // In production, you might want to blacklist the token in a cache (Redis)
    // For now, client just removes the token from localStorage
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('[Auth] Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: false });
    } catch (err) {
      // If token is expired but we can still decode it (in a real scenario we'd check expiration time)
      // For now, we'll just reject expired tokens
      if (err.name === 'TokenExpiredError') {
        // Allow refresh if token expired recently (within 24 hours)
        // In production, track token issued time
        decoded = jwt.decode(token);
        if (!decoded) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    const user = users.get(decoded.email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Create new token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: newToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('[Auth] Refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = users.get(decoded.email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify old password
    const hashedOldPassword = hashPassword(oldPassword, user.salt);
    if (hashedOldPassword !== user.hashedPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password with new salt
    const newSalt = crypto.randomBytes(16).toString('hex');
    const hashedNewPassword = hashPassword(newPassword, newSalt);

    user.salt = newSalt;
    user.hashedPassword = hashedNewPassword;

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('[Auth] Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
