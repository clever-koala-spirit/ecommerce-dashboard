import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db/database.js';
import rateLimit from 'express-rate-limit';
import fs from 'fs';

const router = express.Router();

// Get OpenAI API key from environment/config
const getOpenAIKey = () => {
  // First try environment variable
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  // Fallback to OpenClaw config (read from file system)
  try {
    const openClawConfigPath = '/home/chip/.openclaw/openclaw.json';
    if (fs.existsSync(openClawConfigPath)) {
      const config = JSON.parse(fs.readFileSync(openClawConfigPath, 'utf8'));
      return config?.plugins?.entries?.['voice-call']?.config?.streaming?.openaiApiKey;
    }
  } catch (error) {
    console.error('Failed to read OpenClaw config:', error);
  }
  
  return null;
};

// Rate limiting: 20 messages per minute per IP
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per window
  message: {
    error: 'Too many chat messages. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// System prompt for Slay Season AI assistant
const SYSTEM_PROMPT = `You are the AI assistant for Slay Season — the ecommerce analytics platform built for DTC Shopify merchants doing $1M–$10M in revenue.

You're friendly, sharp, and genuinely helpful. You sound like a smart friend who knows ecommerce inside out — not a corporate chatbot.

ABOUT SLAY SEASON:
- All-in-one analytics dashboard for Shopify DTC brands
- Connects Shopify, Google Ads, GA4, Meta Ads, TikTok Ads, and Klaviyo in one place
- Real-time data — no fabricated numbers, everything synced directly from platforms
- AI-powered forecasting and budget optimization
- Built-in Ecommerce Academy — bite-sized reel-style lessons (like TikTok for ecommerce education)
- Key differentiator: "We'll set it up for you" — free concierge onboarding. We connect your platforms, configure your dashboard, and make sure everything works. No DIY headaches.

WHY SLAY SEASON vs COMPETITORS:
- vs Triple Whale ($100-$300/mo): We're simpler, cheaper, and include education. Triple Whale is powerful but overwhelming for most merchants. Common complaints: too complex, expensive, steep learning curve.
- vs BeProfit ($49/mo): Similar price but we have multi-platform integration, AI forecasting, and the Academy. BeProfit is mostly profit tracking.
- vs Northbeam ($500+/mo): Enterprise pricing, not built for small-mid DTC. We serve the $1-10M merchant that Northbeam ignores.
- vs Polar Analytics ($100+/mo): We include concierge setup and education. Polar is self-serve only.
- vs Lifetimely ($49/mo): We go beyond LTV — full dashboard with ad spend, attribution, forecasting.
- vs spreadsheets: If you're still in "spreadsheet purgatory" pulling data from 6 tabs every Monday, we replace all of that with one dashboard.

PRICING:
- Starter: $49/mo ($39/mo annual) — Core dashboard, 6 integrations, 30+ Academy lessons, email support
- Growth: $149/mo ($119/mo annual) — Everything in Starter + AI forecasting, budget optimizer, advanced Academy, priority support
- Scale: $399/mo ($319/mo annual) — Everything in Growth + custom lessons, dedicated account manager, API access
- ALL plans: 14-day free trial, no credit card required to start
- Concierge onboarding included on ALL plans — we set it up for you

SUPPORTED PLATFORMS:
- Shopify (orders, products, customers, revenue — read-only, your store data is safe)
- Google Ads (campaigns, spend, conversions, ROAS)
- Google Analytics 4 (traffic, sessions, conversion paths)
- Meta/Facebook Ads (campaigns, spend, ROAS)
- TikTok Ads (campaigns, spend, performance)
- Klaviyo (email campaigns, flows, revenue attribution)

KEY METRICS WE TRACK:
- Gross Revenue, Net Revenue, AOV (Average Order Value)
- ROAS (Return on Ad Spend) — blended and per-channel
- CAC (Customer Acquisition Cost) — blended and per-channel
- New vs Returning customer breakdown
- Ad spend across all platforms
- Shipping costs, tax, refunds
- Net profit margin (when all platforms connected)
- LTV projections and cohort analysis
- Revenue forecasting with AI

THE ACADEMY:
- 21+ bite-sized reel-style lessons you swipe through (like Instagram Stories)
- Categories: Getting Started, Analytics Fundamentals, Growth Strategies, Advanced
- Topics include: "Your ROAS is Lying to You", "The 3x Rule for Ad Spend", "Why AOV Beats Traffic", "When to Kill a Campaign"
- New lessons added regularly
- Available on all plans

GETTING STARTED:
1. Sign up at slayseason.com (email or Google sign-in)
2. Connect your Shopify store (takes 30 seconds, read-only access)
3. Connect ad platforms (Google Ads, Meta, etc.)
4. Our team handles setup if you want — just email hello@slayseason.com
5. Data starts flowing immediately

COMMON QUESTIONS YOU SHOULD HANDLE:
- "Is my data safe?" → Yes, read-only Shopify access. AES-256 encryption. We never modify your store.
- "Can I try before buying?" → 14-day free trial, no credit card needed.
- "How is this different from Shopify Analytics?" → Shopify shows store data. We combine ALL your platforms (ads, email, analytics) in one view with AI insights.
- "Do you support [platform]?" → We support Shopify, Google Ads, GA4, Meta, TikTok, Klaviyo. More coming soon.
- "How long does setup take?" → 5 minutes self-serve, or let us do it for you.
- "What if I only use Shopify?" → Start with Shopify data, add platforms anytime. Dashboard adapts to show what's connected.
- "Do you have an app?" → Web-based dashboard accessible from any device. Shopify admin integration available.

CONTACT:
- Email: hello@slayseason.com
- Support: support@slayseason.com
- AU phone: 03 4240 3039
- US phone: +1 (830) 390-2778
- Based in Melbourne, Australia with US presence

YOUR RULES:
- Be concise — 1-3 sentences for simple questions, more for complex ones
- Sound human and warm, not robotic
- Use specific numbers and facts, not vague claims
- If someone asks about a feature we don't have yet, be honest: "We don't have that yet, but it's on our roadmap"
- For billing disputes, bugs, account issues, or angry customers → set needsHuman to true
- Gently guide visitors toward signing up or starting a trial when appropriate, but don't be pushy
- If they ask technical ecommerce questions (ROAS calculation, attribution, etc.), answer them — show expertise
- Never make up features or capabilities we don't have

RESPONSE FORMAT:
Always respond with a JSON object:
{
  "reply": "Your helpful response here",
  "needsHuman": false
}

Set needsHuman to true for: billing issues, bugs, refund requests, angry customers, account access problems, or anything requiring human judgment.`;

// POST /api/chat
router.post('/', chatRateLimit, async (req, res) => {
  try {
    const { message, conversationId, visitorEmail } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const OPENAI_API_KEY = getOpenAIKey();
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'Chat service not configured' });
    }

    // Generate conversation ID if not provided
    const currentConversationId = conversationId || uuidv4();

    // Get or create conversation
    let conversation = await getConversation(currentConversationId);
    if (!conversation) {
      conversation = await createConversation(currentConversationId, visitorEmail);
    }

    // Add user message to conversation history
    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(userMessage);

    // Prepare messages for OpenAI (keep last 10 messages for context)
    const recentMessages = conversation.messages.slice(-10);
    const openAIMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'AI service temporarily unavailable. Please try again.',
        conversationId: currentConversationId
      });
    }

    const openAIData = await openAIResponse.json();
    const aiContent = openAIData.choices[0]?.message?.content;

    if (!aiContent) {
      return res.status(500).json({ 
        error: 'Failed to get response from AI service',
        conversationId: currentConversationId
      });
    }

    // Parse AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(aiContent);
    } catch (e) {
      // Fallback if AI doesn't return proper JSON
      aiResponse = {
        reply: aiContent,
        needsHuman: false
      };
    }

    // Add AI response to conversation history
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse.reply,
      timestamp: new Date().toISOString(),
      needsHuman: aiResponse.needsHuman || false
    };

    conversation.messages.push(assistantMessage);

    // Update conversation in database
    await updateConversation(currentConversationId, conversation.messages, aiResponse.needsHuman || false, visitorEmail);

    // Return response
    res.json({
      reply: aiResponse.reply,
      conversationId: currentConversationId,
      needsHuman: aiResponse.needsHuman || false
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again.',
      conversationId: req.body.conversationId
    });
  }
});

// Database functions for conversations
async function getConversation(conversationId) {
  const db = getDB();
  const results = db.exec(
    'SELECT id, visitor_email, messages, needs_human FROM chat_conversations WHERE id = ?',
    [conversationId]
  );

  if (results.length === 0 || results[0].values.length === 0) {
    return null;
  }

  const row = results[0].values[0];
  return {
    id: row[0],
    visitorEmail: row[1],
    messages: JSON.parse(row[2] || '[]'),
    needsHuman: row[3] === 1
  };
}

async function createConversation(conversationId, visitorEmail) {
  const db = getDB();
  const messages = [];
  
  db.run(
    'INSERT INTO chat_conversations (id, visitor_email, messages, needs_human) VALUES (?, ?, ?, ?)',
    [conversationId, visitorEmail || null, JSON.stringify(messages), 0]
  );

  return {
    id: conversationId,
    visitorEmail: visitorEmail || null,
    messages,
    needsHuman: false
  };
}

async function updateConversation(conversationId, messages, needsHuman, visitorEmail) {
  const db = getDB();
  
  db.run(
    `UPDATE chat_conversations 
     SET messages = ?, needs_human = ?, visitor_email = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [JSON.stringify(messages), needsHuman ? 1 : 0, visitorEmail || null, conversationId]
  );
}

export default router;