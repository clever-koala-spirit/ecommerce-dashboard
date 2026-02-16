/**
 * Newsletter Routes
 * POST /api/newsletter — subscribe to newsletter
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';

const router = express.Router();

const newsletterRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: 'Too many requests. Please try again later.' },
});

router.post('/', newsletterRateLimiter, (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailLower = email.toLowerCase().trim();
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const db = getDB();

    // Check if already subscribed
    const existing = db.exec(
      `SELECT id, status FROM newsletter_subscribers WHERE email = ?`,
      [emailLower]
    );

    if (existing.length > 0 && existing[0].values.length > 0) {
      const status = existing[0].values[0][1];
      if (status === 'active') {
        return res.json({ success: true, message: 'You\'re already subscribed!' });
      }
      // Re-activate
      db.run(`UPDATE newsletter_subscribers SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE email = ?`, [emailLower]);
      return res.json({ success: true, message: 'Welcome back! You\'ve been re-subscribed.' });
    }

    db.run(
      `INSERT INTO newsletter_subscribers (email, ip_address) VALUES (?, ?)`,
      [emailLower, req.ip]
    );

    log.info('Newsletter subscription', { email: emailLower.replace(/(..).*(@.*)/, '$1***$2') });

    res.json({ success: true, message: 'Successfully subscribed! Welcome aboard.' });
  } catch (err) {
    log.error('Newsletter subscription error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
