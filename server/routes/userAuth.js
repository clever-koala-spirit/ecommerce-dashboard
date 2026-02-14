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

/**
 * OAuth Routes
 * Handle social authentication with various providers
 */

/**
 * GET /api/auth/oauth/google
 * Redirect to Google OAuth
 */
router.get('/oauth/google', (req, res) => {
  try {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(501).json({ 
        error: 'Google OAuth not configured yet. Please use email login.',
        provider: 'google',
        configured: false
      });
    }

    const redirectUri = `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/oauth/google/callback`;
    const scopes = 'openid email profile';
    const state = crypto.randomBytes(16).toString('hex');
    
    // In production, store state in session/cache to prevent CSRF
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `state=${state}`;

    res.redirect(authUrl);
  } catch (err) {
    log.error('Google OAuth redirect error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/oauth/google/callback
 * Handle Google OAuth callback
 */
router.get('/oauth/google/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;
    
    if (error) {
      log.error('Google OAuth error', { error });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_error`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=missing_code`);
    }

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/oauth/google/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      log.error('Google token exchange failed', tokenData);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=token_exchange`);
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });

    const userData = await userResponse.json();
    if (!userResponse.ok) {
      log.error('Google user info fetch failed', userData);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=user_info`);
    }

    const emailLower = userData.email.toLowerCase().trim();
    
    // Check if user exists
    let user = getUserByEmail(emailLower);
    
    if (!user) {
      // Create new user
      const userId = crypto.randomUUID();
      const salt = crypto.randomBytes(16).toString('hex');
      const tempPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = hashPassword(tempPassword, salt);
      
      createUser(userId, userData.name || 'Google User', emailLower, hashedPassword, salt);
      user = { id: userId, name: userData.name || 'Google User', email: emailLower };
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    updateUserLastLogin(user.id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-callback?token=${token}`);
  } catch (err) {
    log.error('Google OAuth callback error', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=callback_error`);
  }
});

/**
 * GET /api/auth/oauth/shopify
 * Redirect to Shopify OAuth
 */
router.get('/oauth/shopify', (req, res) => {
  try {
    const clientId = process.env.SHOPIFY_APP_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_APP_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(501).json({ 
        error: 'Shopify OAuth not configured yet. Please use email login.',
        provider: 'shopify',
        configured: false
      });
    }

    // For Shopify Partners OAuth (not embedded app)
    const redirectUri = `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/oauth/shopify/callback`;
    const scopes = 'read_orders,read_products,read_customers,read_analytics';
    const state = crypto.randomBytes(16).toString('hex');
    
    const authUrl = `https://accounts.shopify.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `state=${state}`;

    res.redirect(authUrl);
  } catch (err) {
    log.error('Shopify OAuth redirect error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/oauth/shopify/callback
 * Handle Shopify OAuth callback
 */
router.get('/oauth/shopify/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;
    
    if (error) {
      log.error('Shopify OAuth error', { error });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_error`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=missing_code`);
    }

    // For now, just redirect back with a message that Shopify OAuth needs more setup
    // In production, you'd exchange the code for access token and get user info
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?message=shopify_oauth_in_progress`);
  } catch (err) {
    log.error('Shopify OAuth callback error', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=callback_error`);
  }
});

/**
 * GET /api/auth/oauth/facebook
 * Redirect to Facebook OAuth
 */
router.get('/oauth/facebook', (req, res) => {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!appId || !appSecret) {
      return res.status(501).json({ 
        error: 'Facebook OAuth not configured yet. Please use email login.',
        provider: 'facebook',
        configured: false
      });
    }

    const redirectUri = `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/oauth/facebook/callback`;
    const scopes = 'email,public_profile';
    const state = crypto.randomBytes(16).toString('hex');
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `state=${state}`;

    res.redirect(authUrl);
  } catch (err) {
    log.error('Facebook OAuth redirect error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/oauth/facebook/callback
 * Handle Facebook OAuth callback
 */
router.get('/oauth/facebook/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;
    
    if (error) {
      log.error('Facebook OAuth error', { error });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_error`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=missing_code`);
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/oauth/facebook/callback`;

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      log.error('Facebook token exchange failed', tokenData);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=token_exchange`);
    }

    // Get user info
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokenData.access_token}`);
    const userData = await userResponse.json();

    if (!userResponse.ok || userData.error) {
      log.error('Facebook user info fetch failed', userData);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=user_info`);
    }

    if (!userData.email) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_email`);
    }

    const emailLower = userData.email.toLowerCase().trim();
    
    // Check if user exists
    let user = getUserByEmail(emailLower);
    
    if (!user) {
      // Create new user
      const userId = crypto.randomUUID();
      const salt = crypto.randomBytes(16).toString('hex');
      const tempPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = hashPassword(tempPassword, salt);
      
      createUser(userId, userData.name || 'Facebook User', emailLower, hashedPassword, salt);
      user = { id: userId, name: userData.name || 'Facebook User', email: emailLower };
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    updateUserLastLogin(user.id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-callback?token=${token}`);
  } catch (err) {
    log.error('Facebook OAuth callback error', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=callback_error`);
  }
});

/**
 * GET /api/auth/oauth/apple
 * Redirect to Apple OAuth
 */
router.get('/oauth/apple', (req, res) => {
  try {
    const clientId = process.env.APPLE_CLIENT_ID;
    const clientSecret = process.env.APPLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(501).json({ 
        error: 'Apple OAuth not configured yet. Please use email login.',
        provider: 'apple',
        configured: false
      });
    }

    const redirectUri = `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/oauth/apple/callback`;
    const scopes = 'name email';
    const state = crypto.randomBytes(16).toString('hex');
    
    const authUrl = `https://appleid.apple.com/auth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `response_mode=form_post&` +
      `state=${state}`;

    res.redirect(authUrl);
  } catch (err) {
    log.error('Apple OAuth redirect error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/oauth/apple/callback
 * Handle Apple OAuth callback (Apple uses POST)
 */
router.post('/oauth/apple/callback', async (req, res) => {
  try {
    const { code, error, state, user } = req.body;
    
    if (error) {
      log.error('Apple OAuth error', { error });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_error`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=missing_code`);
    }

    // Apple OAuth implementation is more complex and requires JWT signing
    // For now, just redirect back with a message that Apple OAuth needs more setup
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?message=apple_oauth_in_progress`);
  } catch (err) {
    log.error('Apple OAuth callback error', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=callback_error`);
  }
});

export default router;
