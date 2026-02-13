/**
 * AI Chat Service - Multi-provider LLM integration
 * Supports: OpenAI, Anthropic, Ollama
 */

export async function chatWithAI(message, conversationHistory, dataContext, config) {
  if (!config || !config.provider || !config.apiKey) {
    throw new Error('AI provider not configured. Please add your API key in Settings.');
  }

  const { provider, apiKey, model, baseUrl } = config;

  try {
    switch (provider) {
      case 'openai':
        return await chatWithOpenAI(message, conversationHistory, dataContext, apiKey, model);
      case 'anthropic':
        return await chatWithAnthropic(message, conversationHistory, dataContext, apiKey, model);
      case 'ollama':
        return await chatWithOllama(message, conversationHistory, dataContext, model, baseUrl);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error(`[AI Chat Error - ${provider}]`, error);
    throw error;
  }
}

async function chatWithOpenAI(message, conversationHistory, dataContext, apiKey, model) {
  const systemPrompt = buildSystemPrompt(dataContext);

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const responseText = data.choices[0]?.message?.content;

  return parseAIResponse(responseText);
}

async function chatWithAnthropic(message, conversationHistory, dataContext, apiKey, model) {
  const systemPrompt = buildSystemPrompt(dataContext);

  const messages = conversationHistory
    .map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))
    .concat([
      {
        role: 'user',
        content: message,
      },
    ]);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-opus-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const responseText = data.content[0]?.text;

  return parseAIResponse(responseText);
}

async function chatWithOllama(message, conversationHistory, dataContext, model, baseUrl) {
  const systemPrompt = buildSystemPrompt(dataContext);
  const ollamaUrl = baseUrl || 'http://localhost:11434';

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...conversationHistory.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'llama2',
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.message?.content;

  return parseAIResponse(responseText);
}

function buildSystemPrompt(dataContext) {
  return `You are an expert ecommerce data analyst embedded in a live dashboard. You have access to real-time business data.

CURRENT DATA SNAPSHOT:
${JSON.stringify(dataContext, null, 2)}

RULES:
- Always cite specific numbers from the data when available
- Shopify revenue is the source of truth
- Be honest about uncertainty and data gaps
- If asked to predict, reference confidence levels
- Keep responses concise and actionable (2-3 sentences max)
- You can suggest actions: showChart, runForecast, highlightMetric
- Format your response as JSON with "text" and "actions" fields
- Example: {"text": "Your response here.", "actions": ["showChart:revenue", "highlightMetric:roas"]}

Respond ONLY in JSON format with the exact structure shown above.`;
}

function parseAIResponse(responseText) {
  if (!responseText) {
    return {
      text: 'Unable to generate response. Please try again.',
      actions: [],
    };
  }

  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        text: parsed.text || responseText,
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      };
    }

    // Fallback: treat entire response as text
    return {
      text: responseText,
      actions: [],
    };
  } catch (error) {
    console.error('[JSON Parse Error]', error);
    return {
      text: responseText,
      actions: [],
    };
  }
}

export async function testAIConnection(config) {
  const testMessage = 'Hello, testing connection.';
  const testContext = {
    summary: 'Testing AI connection with empty context.',
  };

  try {
    const result = await chatWithAI(testMessage, [], testContext, config);
    return {
      success: true,
      message: 'Connection successful',
      response: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Connection failed',
      error: error.toString(),
    };
  }
}
