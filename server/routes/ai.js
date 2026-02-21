import express from 'express';
import { chatWithAI, testAIConnection } from '../services/aiChat.js';
import { buildDataContext } from '../services/aiContext.js';
import { mockData } from '../mock/mockData.js';

const router = express.Router();

// In-memory storage for AI config (initialized lazily after dotenv loads)
let aiConfig = null;

function getAiConfig() {
  if (!aiConfig) {
    aiConfig = {
      provider: process.env.OPENAI_API_KEY ? 'openai' : null,
      model: 'gpt-4-turbo',
      apiKey: process.env.OPENAI_API_KEY || null,
    };
    
    // Debug log for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AI Config] Lazy init - Raw env OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
      console.log('[AI Config] Provider:', aiConfig.provider);
      console.log('[AI Config] Model:', aiConfig.model); 
      console.log('[AI Config] Has API Key:', !!aiConfig.apiKey);
      console.log('[AI Config] Key starts with:', aiConfig.apiKey?.substring(0, 10) + '...');
    }
  }
  return aiConfig;
}

// POST /api/ai/chat - Chat with AI (no auth required for better UX)
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], filters } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Check if AI is configured
    const config = getAiConfig();
    if (!config.provider || !config.apiKey) {
      return res.json({
        text: 'AI Assistant not yet configured. Please add your LLM API key in Settings.',
        actions: [],
        mock: true,
      });
    }

    // Build data context from dashboard data
    const dataContext = buildDataContext(mockData, filters);

    // Call AI service
    const response = await chatWithAI(message, history, dataContext, {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
    });

    return res.json(response);
  } catch (error) {
    console.error('[AI Chat Error]', error);
    return res.status(500).json({
      error: error.message || 'Failed to get AI response',
      text: 'An error occurred. Please check your API key and try again.',
      actions: [],
    });
  }
});

// GET /api/ai/config - Get current AI config (no API key returned)
router.get('/config', (req, res) => {
  const config = getAiConfig();
  return res.json({
    provider: config.provider,
    model: config.model,
    configured: !!config.apiKey,
  });
});

// POST /api/ai/config - Save AI config
router.post('/config', (req, res) => {
  try {
    const { provider, model, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    const validProviders = ['openai', 'anthropic', 'ollama'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({ error: `Invalid provider: ${provider}` });
    }

    // Store config
    aiConfig = {
      provider,
      model: model || getDefaultModel(provider),
      apiKey,
    };

    return res.json({
      success: true,
      message: 'AI configuration saved',
      provider: aiConfig.provider,
      model: aiConfig.model,
    });
  } catch (error) {
    console.error('[Config Error]', error);
    return res.status(500).json({ error: error.message || 'Failed to save configuration' });
  }
});

// POST /api/ai/test - Test AI connection
router.post('/test', async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    const result = await testAIConnection({
      provider,
      apiKey,
      model: model || getDefaultModel(provider),
    });

    return res.json(result);
  } catch (error) {
    console.error('[Test Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Connection test failed',
    });
  }
});

function getDefaultModel(provider) {
  const defaults = {
    openai: 'gpt-4-turbo',
    anthropic: 'claude-opus-4-6',
    ollama: 'llama2',
  };
  return defaults[provider] || 'gpt-4';
}

export default router;
