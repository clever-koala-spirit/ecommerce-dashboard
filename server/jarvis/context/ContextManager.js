import { EventEmitter } from 'events';

/**
 * JARVIS Context Manager - Token tracking & chunked processing
 * 
 * Law 2: Context is finite (track tokens like money)
 * Law 4: Errors recover themselves (auto-chunking when near limits)
 * Law 7: Small, real, honest - prevent 171k overflow
 */

export class ContextManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.maxTokens = options.maxTokens || 100000; // Default context limit
    this.warningThreshold = options.warningThreshold || 0.8; // Warn at 80%
    this.chunkSize = options.chunkSize || 4000; // Chunk size for processing
    
    this.contexts = new Map(); // Thread ID -> context data
    this.tokenCache = new Map(); // Cache token counts
    
    this.stats = {
      contextsTracked: 0,
      tokensTracked: 0,
      chunksProcessed: 0,
      overflows: 0,
      recoveries: 0
    };

    console.log(`🧠 Context Manager initialized (max: ${this.maxTokens} tokens)`);
  }

  // Track message in context
  trackMessage(envelope) {
    const data = envelope.get();
    const threadId = data.context.threadId || 'default';
    
    // Get or create context
    let context = this.contexts.get(threadId);
    if (!context) {
      context = {
        threadId,
        messages: [],
        totalTokens: 0,
        created: Date.now(),
        lastActive: Date.now(),
        chunks: []
      };
      this.contexts.set(threadId, context);
      this.stats.contextsTracked++;
    }

    // Calculate tokens
    const tokens = this.estimateTokens(data.content.text || '');
    
    // Add to context
    context.messages.push({
      id: data.id,
      timestamp: data.timestamp,
      tokens,
      content: data.content.text,
      role: data.user.role
    });
    
    context.totalTokens += tokens;
    context.lastActive = Date.now();
    data.context.tokenCount = context.totalTokens;
    
    this.stats.tokensTracked += tokens;

    console.log(`📊 Context ${threadId}: ${context.totalTokens}/${this.maxTokens} tokens`);

    // Check if approaching limits
    this.checkLimits(threadId, context);
    
    return context;
  }

  // Estimate token count (improved version)
  estimateTokens(text) {
    if (!text) return 0;
    
    // Cache frequent calculations
    if (this.tokenCache.has(text)) {
      return this.tokenCache.get(text);
    }

    // Rough token estimation:
    // - Average 4 chars per token
    // - Adjust for common patterns
    let tokens = Math.ceil(text.length / 4);
    
    // Adjust for code blocks (more dense)
    if (text.includes('```') || text.includes('function') || text.includes('class')) {
      tokens *= 1.2;
    }
    
    // Adjust for lists and formatting (less dense)
    if (text.includes('\n-') || text.includes('\n*') || text.includes('\n1.')) {
      tokens *= 0.9;
    }

    // Cache if text is substantial
    if (text.length > 100) {
      // Prevent cache bloat
      if (this.tokenCache.size > 1000) {
        const oldestKey = this.tokenCache.keys().next().value;
        this.tokenCache.delete(oldestKey);
      }
      this.tokenCache.set(text, tokens);
    }

    return Math.round(tokens);
  }

  // Check context limits and handle overflow
  checkLimits(threadId, context) {
    const usage = context.totalTokens / this.maxTokens;
    
    if (usage >= this.warningThreshold) {
      console.warn(`⚠️ Context ${threadId} at ${Math.round(usage * 100)}% capacity`);
      this.emit('context-warning', { threadId, usage, context });
      
      // Auto-chunk if near limit (Law 4: self-healing)
      if (usage >= 0.95) {
        this.handleOverflow(threadId, context);
      }
    }
  }

  // Handle context overflow with chunking
  handleOverflow(threadId, context) {
    console.log(`🔄 Handling overflow for context ${threadId}`);
    this.stats.overflows++;
    
    try {
      // Create summary chunk from old messages
      const cutoff = Math.floor(context.messages.length * 0.3); // Keep last 70%
      const oldMessages = context.messages.slice(0, cutoff);
      const recentMessages = context.messages.slice(cutoff);
      
      // Create summary of old messages
      const summary = this.createSummary(oldMessages);
      
      // Create chunk for archival
      const chunk = {
        id: `chunk_${Date.now()}`,
        threadId,
        startTime: oldMessages[0]?.timestamp,
        endTime: oldMessages[oldMessages.length - 1]?.timestamp,
        messageCount: oldMessages.length,
        summary,
        tokens: oldMessages.reduce((sum, msg) => sum + msg.tokens, 0),
        created: Date.now()
      };
      
      context.chunks.push(chunk);
      
      // Update context with recent messages only
      context.messages = recentMessages;
      context.totalTokens = recentMessages.reduce((sum, msg) => sum + msg.tokens, 0);
      context.totalTokens += this.estimateTokens(summary); // Add summary tokens
      
      this.stats.chunksProcessed++;
      this.stats.recoveries++;
      
      console.log(`✅ Context ${threadId} chunked: ${chunk.messageCount} msgs -> summary`);
      this.emit('context-chunked', { threadId, chunk, context });
      
    } catch (error) {
      console.error('❌ Context chunking failed:', error);
      // Fallback: just truncate old messages
      context.messages = context.messages.slice(-50); // Keep last 50 messages
      context.totalTokens = context.messages.reduce((sum, msg) => sum + msg.tokens, 0);
    }
  }

  // Create summary of message chunk
  createSummary(messages) {
    if (!messages.length) return '';
    
    const topics = new Set();
    const keywords = new Set();
    let codeBlocks = 0;
    let questions = 0;
    
    messages.forEach(msg => {
      const text = msg.content || '';
      
      // Extract key topics (simple keyword extraction)
      const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
      words.forEach(word => {
        if (word.length > 5 && !word.match(/^(this|that|with|from|they|them|have|been|will|would|could|should)$/)) {
          keywords.add(word);
        }
      });
      
      // Count patterns
      if (text.includes('```')) codeBlocks++;
      if (text.includes('?')) questions++;
    });

    // Build summary
    const topKeywords = Array.from(keywords).slice(0, 5).join(', ');
    
    return `[SUMMARY: ${messages.length} messages from ${new Date(messages[0].timestamp).toISOString().split('T')[0]}. Topics: ${topKeywords}. ${codeBlocks} code blocks, ${questions} questions.]`;
  }

  // Get context for thread
  getContext(threadId) {
    return this.contexts.get(threadId);
  }

  // Get recent context (optimized for response generation)
  getRecentContext(threadId, maxTokens = null) {
    const context = this.contexts.get(threadId);
    if (!context) return null;
    
    const targetTokens = maxTokens || (this.maxTokens * 0.6); // Use 60% of max by default
    
    // Start with most recent messages and work backwards
    let tokens = 0;
    const recentMessages = [];
    
    for (let i = context.messages.length - 1; i >= 0; i--) {
      const msg = context.messages[i];
      if (tokens + msg.tokens > targetTokens) break;
      
      recentMessages.unshift(msg);
      tokens += msg.tokens;
    }
    
    return {
      ...context,
      messages: recentMessages,
      totalTokens: tokens,
      hasMoreHistory: recentMessages.length < context.messages.length,
      chunks: context.chunks
    };
  }

  // Clean up old contexts
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;
    
    for (const [threadId, context] of this.contexts) {
      if (context.lastActive < cutoff) {
        // Archive context before deletion
        if (context.messages.length > 10) {
          console.log(`📦 Archiving context ${threadId} (${context.messages.length} messages)`);
          // TODO: Store in persistent storage
        }
        
        this.contexts.delete(threadId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old contexts`);
    }
    
    // Also clean token cache
    if (this.tokenCache.size > 2000) {
      this.tokenCache.clear();
      console.log('🧹 Cleared token cache');
    }
  }

  // Get statistics
  getStats() {
    const activeContexts = this.contexts.size;
    const totalTokens = Array.from(this.contexts.values())
      .reduce((sum, ctx) => sum + ctx.totalTokens, 0);
    
    return {
      ...this.stats,
      activeContexts,
      totalTokens,
      averageTokensPerContext: activeContexts ? Math.round(totalTokens / activeContexts) : 0,
      cacheSize: this.tokenCache.size,
      memoryUsage: Math.round(totalTokens / this.maxTokens * 100) + '%'
    };
  }

  // Force chunk a context (manual intervention)
  forceChunk(threadId) {
    const context = this.contexts.get(threadId);
    if (!context) return false;
    
    this.handleOverflow(threadId, context);
    return true;
  }

  // Set new limits (runtime adjustment)
  setLimits(maxTokens, warningThreshold = 0.8) {
    this.maxTokens = maxTokens;
    this.warningThreshold = warningThreshold;
    console.log(`📊 Context limits updated: ${maxTokens} tokens, ${Math.round(warningThreshold * 100)}% warning`);
  }
}

export default ContextManager;