import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db/database.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Get OpenAI API key from environment/config
const getOpenAIKey = () => {
  // First try environment variable
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  // Fallback to OpenClaw config (read from file system)
  try {
    const fs = await import('fs');
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
const SYSTEM_PROMPT = `You are a helpful AI assistant for Slay Season, an ecommerce analytics platform for Shopify DTC merchants.

ABOUT SLAY SEASON:
- Ecommerce analytics platform specifically designed for Shopify direct-to-consumer merchants
- Integrates with Shopify, Google Ads, GA4, Klaviyo, TikTok Ads, Meta Ads
- Key differentiator: "We set it up for you" - concierge onboarding service
- Provides comprehensive analytics, forecasting, and insights for ecommerce businesses

PRICING:
- Starter Plan: $49/month
- Growth Plan: $149/month  
- Scale Plan: $399/month
- All plans include 14-day free trial
- Annual discount available

HOW TO GET STARTED:
1. Sign up at slayseason.com
2. Connect your Shopify store
3. We handle the rest of the setup for you (concierge onboarding)

SUPPORT:
- Email: hello@slayseason.com
- For technical issues, billing disputes, or complex account problems, escalate to human support

YOUR ROLE:
- Be friendly, helpful, and concise
- Sound human, not robotic
- Answer questions about features, pricing, and getting started
- Help visitors understand the value proposition
- If you cannot help with billing disputes, technical bugs, or complex account issues, set needsHuman to true
- Keep responses under 3 sentences when possible

RESPONSE FORMAT:
You must respond with a JSON object containing:
{
  "reply": "Your helpful response here",
  "needsHuman": false
}

If you determine that a human agent should handle the request (billing disputes, bugs, complex technical issues, angry customers), set needsHuman to true and include an appropriate message about connecting them with the team.`;

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