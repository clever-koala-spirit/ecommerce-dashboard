/**
 * Contact Form Routes
 * POST /api/contact — submit a contact form message
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { getDB } from '../db/database.js';
import { log } from '../utils/logger.js';

const router = express.Router();

// Rate limit: 5 submissions per hour per IP
const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: 'Too many contact submissions. Please try again later.' },
});

router.post('/', contactRateLimiter, (req, res) => {
  try {
    const { name, email, subject, message, company } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 200) {
      return res.status(400).json({ error: 'Name must be between 1 and 200 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 5000) {
      return res.status(400).json({ error: 'Message must be between 5 and 5000 characters.' });
    }

    const db = getDB();
    db.run(
      `INSERT INTO contact_submissions (name, email, company, subject, message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        (company || '').trim() || null,
        (subject || 'general').trim(),
        message.trim(),
        req.ip,
      ]
    );

    log.info('Contact form submission', { email: email.replace(/(..).*(@.*)/, '$1***$2'), subject });

    res.json({ success: true, message: 'Your message has been received. We\'ll get back to you within 24 hours.' });
  } catch (err) {
    log.error('Contact form error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
