import { EventEmitter } from 'events';

/**
 * JARVIS Basic Router - Intent detection -> response routing
 * 
 * Law 1: Swappable routing strategies in 2 hours
 * Law 2: Context-aware routing based on token limits
 * Law 7: Small, real, honest - basic but functional
 */

export class BasicRouter extends EventEmitter {
  constructor(messageBus) {
    super();
    this.messageBus = messageBus;
    this.intents = new Map();
    this.responseHandlers = new Map();
    this.stats = {
      intentsDetected: 0,
      routingDecisions: 0,
      fallbacks: 0
    };

    this.setupIntents();
    this.setupRouting();
  }

  // Define basic intents (expandable)
  setupIntents() {
    // Command intents
    this.intents.set('greeting', {
      patterns: [/^(hi|hello|hey|good morning|good afternoon)/i],
      confidence: 0.9,
      handler: 'conversation'
    });

    this.intents.set('help', {
      patterns: [/^(help|what can you do|\?|\/help)/i],
      confidence: 0.95,
      handler: 'help'
    });

    this.intents.set('task', {
      patterns: [/^(do |can you |please |could you |task:|todo:)/i],
      confidence: 0.8,
      handler: 'task'
    });

    this.intents.set('query', {
      patterns: [/^(what|who|where|when|why|how|is |are |can |will )/i],
      confidence: 0.7,
      handler: 'query'
    });

    this.intents.set('code', {
      patterns: [/^(code|program|script|function|debug|fix|build)/i, /```/],
      confidence: 0.85,
      handler: 'code'
    });

    this.intents.set('command', {
      patterns: [/^\/\w+/],
      confidence: 1.0,
      handler: 'command'
    });

    console.log(`🧠 Router initialized with ${this.intents.size} intent patterns`);
  }

  // Set up routing handlers
  setupRouting() {
    // Register response handlers
    this.responseHandlers.set('conversation', this.handleConversation.bind(this));
    this.responseHandlers.set('help', this.handleHelp.bind(this));
    this.responseHandlers.set('task', this.handleTask.bind(this));
    this.responseHandlers.set('query', this.handleQuery.bind(this));
    this.responseHandlers.set('code', this.handleCode.bind(this));
    this.responseHandlers.set('command', this.handleCommand.bind(this));

    // Listen to message bus
    this.messageBus.on('message', (envelope) => this.processMessage(envelope));
  }

  // Main message processing
  async processMessage(envelope) {
    try {
      const data = envelope.get();
      const text = data.content.text || '';

      console.log(`🧠 Routing message: "${text.substring(0, 50)}..."`);

      // Detect intent
      const intent = this.detectIntent(text);
      envelope.data.intent = intent;
      this.stats.intentsDetected++;

      // Choose routing strategy based on context (Law 2)
      const routing = this.chooseRouting(envelope, intent);
      envelope.data.routing = routing;
      this.stats.routingDecisions++;

      // Route to appropriate handler
      const handler = this.responseHandlers.get(intent.detected || 'fallback');
      if (handler) {
        await handler(envelope);
      } else {
        await this.handleFallback(envelope);
        this.stats.fallbacks++;
      }

    } catch (error) {
      console.error('❌ Router processing error:', error);
      envelope.addError('ROUTER_ERROR', error.message);
      await this.handleFallback(envelope);
    }
  }

  // Intent detection using pattern matching
  detectIntent(text) {
    let bestMatch = { detected: 'fallback', confidence: 0.1 };

    for (const [intentName, intentData] of this.intents) {
      for (const pattern of intentData.patterns) {
        if (pattern.test(text)) {
          if (intentData.confidence > bestMatch.confidence) {
            bestMatch = {
              detected: intentName,
              confidence: intentData.confidence,
              entities: this.extractEntities(text, intentName)
            };
          }
        }
      }
    }

    return bestMatch;
  }

  // Simple entity extraction
  extractEntities(text, intent) {
    const entities = {};

    switch (intent) {
      case 'command':
        const cmd = text.match(/^\/(\w+)/);
        if (cmd) entities.command = cmd[1];
        break;
      
      case 'task':
        entities.action = text.replace(/^(do |can you |please |could you |task:|todo:)/i, '').trim();
        break;
      
      case 'query':
        entities.question = text.trim();
        break;
    }

    return entities;
  }

  // Choose optimal routing based on context
  chooseRouting(envelope, intent) {
    const data = envelope.get();
    const routing = {
      targetModel: 'claude-sonnet',
      maxTokens: 4000,
      temperature: 0.7
    };

    // Adjust based on intent
    switch (intent.detected) {
      case 'code':
        routing.targetModel = 'deepseek-r1'; // Best for coding
        routing.temperature = 0.1; // More precise
        break;
      
      case 'query':
        routing.targetModel = 'claude-sonnet'; // Good reasoning
        break;
      
      case 'task':
        routing.maxTokens = 2000; // Usually shorter responses
        break;
      
      case 'help':
        routing.maxTokens = 1000; // Brief help responses
        routing.temperature = 0.3; // Consistent help
        break;
    }

    // Adjust for context limits (Law 2)
    if (data.context.tokenCount > 50000) {
      routing.maxTokens = Math.min(routing.maxTokens, 2000);
      console.warn(`⚠️ Reducing response tokens due to context limit`);
    }

    return routing;
  }

  // Response handlers
  async handleConversation(envelope) {
    const response = this.generateConversationResponse(envelope);
    await this.messageBus.sendResponse(envelope, response);
  }

  async handleHelp(envelope) {
    const response = `🤖 JARVIS Phase 1 - Available Commands:

🗣️ **Conversation**: Just talk to me naturally
❓ **Questions**: Ask me anything
📝 **Tasks**: Tell me what you need done
💻 **Code**: Share code for review/debugging
📋 **Commands**: /help, /status, /stats

I'm designed with Leo's Laws:
• Swappable in 2 hours ⚡
• Context is finite 📊
• Errors recover themselves 🔄
• Ship small, ship real, ship honest 📦`;

    await this.messageBus.sendResponse(envelope, response);
  }

  async handleTask(envelope) {
    const data = envelope.get();
    const task = data.intent.entities?.action || 'unspecified task';
    
    const response = `📝 Task acknowledged: "${task}"

I'm routing this to the appropriate handler. In Phase 1, I can help with:
- Planning and breaking down tasks
- Code-related tasks  
- Information gathering
- Simple automation suggestions

More advanced task execution coming in Phase 2! 🚀`;

    await this.messageBus.sendResponse(envelope, response);
  }

  async handleQuery(envelope) {
    const response = `🤔 I see you have a question! 

In Phase 1, I can provide basic responses. For complex queries, I'm routing this to the best available model based on the topic.

Advanced query processing with multi-model routing and vector memory coming soon! 🧠`;

    await this.messageBus.sendResponse(envelope, response);
  }

  async handleCode(envelope) {
    const response = `💻 Code detected! 

I can help with:
- Code review and suggestions
- Bug identification  
- Architecture feedback
- Implementation planning

Advanced code analysis with specialized models coming in the next update! ⚡`;

    await this.messageBus.sendResponse(envelope, response);
  }

  async handleCommand(envelope) {
    const data = envelope.get();
    const command = data.intent.entities?.command;
    
    switch (command) {
      case 'status':
        const busStats = this.messageBus.getStats();
        const routerStats = this.getStats();
        const response = `📊 JARVIS Status:

**Message Bus**: ${busStats.messagesProcessed} processed, ${busStats.errors} errors
**Router**: ${routerStats.intentsDetected} intents, ${routerStats.routingDecisions} routes
**Adapters**: ${busStats.adapters.join(', ')}
**Health**: ${busStats.errors < 5 ? '✅ Good' : '⚠️ Issues detected'}`;
        
        await this.messageBus.sendResponse(envelope, response);
        break;
        
      default:
        await this.handleHelp(envelope);
    }
  }

  async handleFallback(envelope) {
    const response = `🤖 I'm processing your message, but I'm still learning!

Phase 1 focuses on core routing. Advanced understanding and multi-model intelligence coming soon! 

Try asking for /help to see what I can do right now. 🚀`;

    await this.messageBus.sendResponse(envelope, response);
  }

  // Generate contextual conversation responses
  generateConversationResponse(envelope) {
    const data = envelope.get();
    const responses = [
      `Hello! I'm JARVIS Phase 1 🤖 How can I help you today?`,
      `Hi there! I'm getting smarter every day. What's on your mind?`,
      `Hey! Ready to help with whatever you need. What should we tackle?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get router statistics
  getStats() {
    return {
      ...this.stats,
      intentsRegistered: this.intents.size,
      handlersRegistered: this.responseHandlers.size
    };
  }

  // Add new intent (for extensibility - Law 1)
  addIntent(name, patterns, confidence, handler) {
    this.intents.set(name, { patterns, confidence, handler });
    console.log(`🧠 Added intent: ${name}`);
  }

  // Add new response handler  
  addHandler(name, handler) {
    this.responseHandlers.set(name, handler);
    console.log(`⚙️ Added handler: ${name}`);
  }
}

export default BasicRouter;