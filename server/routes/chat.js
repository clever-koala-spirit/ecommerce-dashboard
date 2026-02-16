import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db/database.js';
import rateLimit from 'express-rate-limit';
import fs from 'fs';

const router = express.Router();

// Get OpenAI API key from environment/config
const getOpenAIKey = () => {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
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

// Ensure chat_contacts table exists
function ensureContactsTable() {
  const db = getDB();
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      conversation_count INTEGER DEFAULT 1,
      notes TEXT
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_chat_contacts_email ON chat_contacts(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_chat_contacts_name ON chat_contacts(name)`);
}

// Upsert contact and return contact ID
function upsertContact(name, email) {
  const db = getDB();
  ensureContactsTable();

  // Try to find existing contact by email first, then by name
  let existing = null;
  if (email) {
    const results = db.exec('SELECT id FROM chat_contacts WHERE email = ?', [email]);
    if (results.length > 0 && results[0].values.length > 0) {
      existing = results[0].values[0][0];
    }
  }
  if (!existing && name) {
    const results = db.exec('SELECT id FROM chat_contacts WHERE name = ? AND email IS NULL', [name]);
    if (results.length > 0 && results[0].values.length > 0) {
      existing = results[0].values[0][0];
    }
  }

  if (existing) {
    db.run(
      `UPDATE chat_contacts SET last_seen = CURRENT_TIMESTAMP, conversation_count = conversation_count + 1, name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?`,
      [name || null, email || null, existing]
    );
    return existing;
  } else {
    db.run(
      'INSERT INTO chat_contacts (name, email) VALUES (?, ?)',
      [name || 'Unknown', email || null]
    );
    const result = db.exec('SELECT last_insert_rowid()');
    return result[0].values[0][0];
  }
}

// Rate limiting: 20 messages per minute per IP
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many chat messages. Please slow down.', retryAfter: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

// System prompt
const SYSTEM_PROMPT = `You are Slay AI — the friendly assistant for Slay Season, an ecommerce analytics platform for DTC Shopify merchants doing $1M–$10M.

Keep replies short (1-3 sentences). Sound like a smart friend, not a chatbot.

ABOUT SLAY SEASON:
- All-in-one analytics: Shopify, Google Ads, GA4, Meta Ads, TikTok Ads, Klaviyo
- Real-time data, AI forecasting, budget optimization
- Ecommerce Academy — bite-sized video lessons
- Free concierge onboarding on all plans — we set it up for you

SETUP GUIDES (proactively offer to walk users through these):

🔗 Connecting Shopify:
1. Go to Settings (gear icon, bottom left)
2. Find "Shopify" under Integrations
3. Click "Connect"
4. Enter your myshopify.com store URL
5. Click "Authorize" — grants read-only access (we never modify your store)
6. Data starts syncing in ~2 minutes

🔗 Connecting Google Ads:
1. Go to Settings → Google Ads
2. Click "Connect"
3. Sign in with the Google account that owns your Ads account
4. Select the ad account(s) to connect
5. Done! Historical data imports within an hour

🔗 Connecting Meta/Facebook Ads:
1. Settings → Meta Ads → Connect
2. Log in to Facebook, authorize Slay Season
3. Select your ad account(s)
4. Data syncs within 30 minutes

🔗 Connecting other platforms (GA4, TikTok, Klaviyo):
- Same flow: Settings → [Platform] → Connect → Authorize
- Each takes under 2 minutes

🔧 TROUBLESHOOTING:
- "Data not showing": Wait 5-10 min after connecting. If still empty, disconnect and reconnect.
- "Connection failed": Check you're using the right account. Try incognito browser. Clear cookies.
- "Numbers look wrong": Check date range (top right). Make sure the right store/account is selected.
- "Can't connect Shopify": Make sure you're the store owner or have admin access.
- Still stuck? Email support@slayseason.com or reply here and we'll get a human to help.

PRICING:
- Starter: $49/mo ($39/mo annual) — core dashboard, 6 integrations, Academy, email support
- Growth: $149/mo ($119/mo annual) — + AI forecasting, budget optimizer, priority support
- Scale: $399/mo ($319/mo annual) — + custom lessons, dedicated AM, API access
- All plans: 14-day free trial, no credit card needed

COMPETITORS (be honest, not pushy):
- vs Triple Whale: We're simpler & cheaper. TW is powerful but complex.
- vs Northbeam: Enterprise pricing, not for small-mid DTC.
- vs spreadsheets: We replace your 6-tab Monday morning data pull.

CONTACT:
- Email: hello@slayseason.com / support@slayseason.com
- AU: 03 4240 3039 | US: +1 (830) 390-2778

BEHAVIOR:
- Use the visitor's name naturally once you know it
- Proactively offer to walk them through setup if they're new
- Be concise — short paragraphs, not walls of text
- If they seem lost, suggest: "Want me to walk you through connecting your Shopify store?"
- For billing issues, bugs, refunds, angry customers → set needsHuman to true

RESPONSE FORMAT — always return JSON:
{ "reply": "your response", "needsHuman": false }`;

// POST /api/chat
router.post('/', chatRateLimit, async (req, res) => {
  try {
    const { message, conversationId, visitorEmail, visitorName } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const OPENAI_API_KEY = getOpenAIKey();
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'Chat service not configured' });
    }

    const currentConversationId = conversationId || uuidv4();

    // Upsert contact if we have name
    let contactId = null;
    if (visitorName) {
      try {
        contactId = upsertContact(visitorName, visitorEmail);
      } catch (e) {
        console.error('Failed to upsert contact:', e);
      }
    }

    // Get or create conversation
    let conversation = await getConversation(currentConversationId);
    if (!conversation) {
      conversation = await createConversation(currentConversationId, visitorEmail, contactId);
    } else if (contactId) {
      // Link contact to existing conversation
      try {
        const db = getDB();
        db.run('UPDATE chat_conversations SET contact_id = ? WHERE id = ?', [contactId, currentConversationId]);
      } catch (e) { /* column might not exist yet */ }
    }

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };
    conversation.messages.push(userMessage);

    // Build prompt
    let personalizedPrompt = SYSTEM_PROMPT;
    if (visitorName) personalizedPrompt += `\n\nThe user's name is ${visitorName}. Use it naturally.`;
    if (visitorEmail) personalizedPrompt += `\nTheir email is ${visitorEmail}.`;

    const recentMessages = conversation.messages.slice(-10);
    const openAIMessages = [
      { role: 'system', content: personalizedPrompt },
      ...recentMessages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

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
      return res.status(500).json({ error: 'AI service temporarily unavailable.', conversationId: currentConversationId });
    }

    const openAIData = await openAIResponse.json();
    const aiContent = openAIData.choices[0]?.message?.content;

    if (!aiContent) {
      return res.status(500).json({ error: 'Failed to get AI response', conversationId: currentConversationId });
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(aiContent);
    } catch (e) {
      aiResponse = { reply: aiContent, needsHuman: false };
    }

    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.reply,
      timestamp: new Date().toISOString(),
      needsHuman: aiResponse.needsHuman || false
    });

    await updateConversation(currentConversationId, conversation.messages, aiResponse.needsHuman || false, visitorEmail);

    res.json({
      reply: aiResponse.reply,
      conversationId: currentConversationId,
      needsHuman: aiResponse.needsHuman || false
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Internal server error.', conversationId: req.body.conversationId });
  }
});

// GET /api/chat/contacts — list all contacts
router.get('/contacts', async (req, res) => {
  try {
    ensureContactsTable();
    const db = getDB();
    const results = db.exec('SELECT id, name, email, first_seen, last_seen, conversation_count, notes FROM chat_contacts ORDER BY last_seen DESC');
    
    if (!results.length || !results[0].values.length) {
      return res.json({ contacts: [] });
    }

    const contacts = results[0].values.map(row => ({
      id: row[0],
      name: row[1],
      email: row[2],
      firstSeen: row[3],
      lastSeen: row[4],
      conversationCount: row[5],
      notes: row[6]
    }));

    res.json({ contacts });
  } catch (error) {
    console.error('Contacts endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Database helpers
async function getConversation(conversationId) {
  const db = getDB();
  const results = db.exec(
    'SELECT id, visitor_email, messages, needs_human FROM chat_conversations WHERE id = ?',
    [conversationId]
  );
  if (!results.length || !results[0].values.length) return null;
  const row = results[0].values[0];
  return {
    id: row[0],
    visitorEmail: row[1],
    messages: JSON.parse(row[2] || '[]'),
    needsHuman: row[3] === 1
  };
}

async function createConversation(conversationId, visitorEmail, contactId) {
  const db = getDB();
  
  // Try adding contact_id column if missing
  try {
    db.run('ALTER TABLE chat_conversations ADD COLUMN contact_id INTEGER');
  } catch (e) { /* already exists */ }

  const messages = [];
  db.run(
    'INSERT INTO chat_conversations (id, visitor_email, messages, needs_human, contact_id) VALUES (?, ?, ?, ?, ?)',
    [conversationId, visitorEmail || null, JSON.stringify(messages), 0, contactId || null]
  );
  return { id: conversationId, visitorEmail: visitorEmail || null, messages, needsHuman: false };
}

async function updateConversation(conversationId, messages, needsHuman, visitorEmail) {
  const db = getDB();
  db.run(
    `UPDATE chat_conversations SET messages = ?, needs_human = ?, visitor_email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [JSON.stringify(messages), needsHuman ? 1 : 0, visitorEmail || null, conversationId]
  );
}

export default router;
