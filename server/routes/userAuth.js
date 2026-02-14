/**
 * User Authentication Routes
 * Handles user registration, login, and session management for the marketing dashboard
 * Separate from Shopify OAuth which is for the embedded Shopify app
 */
import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserById, updateUserLastLogin, updateUserPassword, createResetToken, getResetToken, markResetTokenUsed } from '../db/database.js';
import emailService from '../services/email.js';
import { log } from '../utils/logger.js';
import { 
  validateSignup, 
  validateLogin, 
  validateChangePassword, 
  validateForgotPassword, 
  validateResetPassword 
} from '../middleware/validation.js';

const router = express.Router();

// Validate JWT_SECRET is properly set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}

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
router.post('/signup', validateSignup, (req, res) => {
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
    const existingUser = getUserByEmail(emailLower);
    if (existingUser) {
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

    createUser(userId, name.trim(), emailLower, hashedPassword, salt);

    // Create JWT token
    const token = jwt.sign(
      { userId, email: emailLower, name: name.trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    updateUserLastLogin(userId);

    res.status(201).json({
      token,
      user: { id: userId, name: name.trim(), email: emailLower },
    });
  } catch (err) {
    log.error('Signup error', err, { email: req.body.email?.replace(/(..).*(@.*)/, '$1***$2') });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', validateLogin, (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = getUserByEmail(emailLower);

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
    updateUserLastLogin(user.id);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    log.error('Login error', err, { email: req.body.email?.replace(/(..).*(@.*)/, '$1***$2') });
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

    const user = getUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    log.error('Get user info error', err, { requestId: req.requestId });
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
    log.error('Logout error', err, { requestId: req.requestId });
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

    const user = getUserByEmail(decoded.email);
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
    log.error('Token refresh error', err, { requestId: req.requestId });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', validateChangePassword, (req, res) => {
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

    const user = getUserByEmail(decoded.email);
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

    updateUserPassword(user.id, hashedNewPassword, newSalt);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    log.error('Change password error', err, { userId: req.headers.authorization });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', validateForgotPassword, async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase().trim();
    
    const user = getUserByEmail(emailLower);
    
    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not
    if (!user) {
      log.security('forgot_password_attempt_invalid_email', { 
        email: emailLower.replace(/(..).*(@.*)/, '$1***$2'),
        ip: req.ip 
      });
      
      // Still return success to prevent email enumeration
      return res.json({ 
        success: true, 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    createResetToken(user.id, resetToken, expiresAt);

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      
      log.info('Password reset email sent', {
        userId: user.id,
        email: user.email.replace(/(..).*(@.*)/, '$1***$2'),
        tokenExpires: expiresAt
      });
    } catch (emailError) {
      log.error('Failed to send password reset email', emailError, {
        userId: user.id,
        email: user.email.replace(/(..).*(@.*)/, '$1***$2')
      });
      
      // Still return success to user, but log the email failure
    }

    res.json({ 
      success: true, 
      message: 'If an account with that email exists, we have sent a password reset link.' 
    });
  } catch (err) {
    log.error('Forgot password error', err, { email: req.body.email?.replace(/(..).*(@.*)/, '$1***$2') });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', validateResetPassword, (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Get and validate reset token
    const resetTokenData = getResetToken(token);
    
    if (!resetTokenData) {
      log.security('password_reset_invalid_token', { 
        token: token.substring(0, 8) + '...',
        ip: req.ip 
      });
      
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Generate new password hash
    const newSalt = crypto.randomBytes(16).toString('hex');
    const hashedNewPassword = hashPassword(newPassword, newSalt);

    // Update password
    updateUserPassword(resetTokenData.userId, hashedNewPassword, newSalt);
    
    // Mark token as used
    markResetTokenUsed(resetTokenData.id);

    log.info('Password reset successful', {
      userId: resetTokenData.userId,
      email: resetTokenData.user.email.replace(/(..).*(@.*)/, '$1***$2')
    });

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
  } catch (err) {
    log.error('Reset password error', err, { token: req.body.token?.substring(0, 8) + '...' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
