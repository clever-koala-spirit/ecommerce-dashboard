import { EventEmitter } from 'events';
import MessageEnvelope from './MessageEnvelope.js';

/**
 * JARVIS Message Bus - Central nervous system
 * 
 * Law 1: Swappable adapters plug in/out in 2 hours
 * Law 4: Errors recover themselves through event handling
 * Law 7: Small, real, honest - just message routing
 */

export class MessageBus extends EventEmitter {
  constructor() {
    super();
    this.adapters = new Map();
    this.processors = new Map();
    this.messageHistory = new Map(); // Simple in-memory cache
    this.maxHistorySize = 1000; // Prevent memory leaks
    this.stats = {
      messagesProcessed: 0,
      errors: 0,
      recoveries: 0
    };

    // Set up error recovery (Law 4)
    this.setupErrorRecovery();
  }

  // Register channel adapter (Law 1: swappable)
  registerAdapter(channel, adapter) {
    this.adapters.set(channel, adapter);
    
    // Wire up adapter events to bus
    adapter.on('message', (envelope) => this.handleMessage(envelope));
    adapter.on('error', (error) => this.handleAdapterError(channel, error));
    
    console.log(`📡 Adapter registered: ${channel}`);
  }

  // Register message processor (router, AI, etc.)
  registerProcessor(name, processor) {
    this.processors.set(name, processor);
    console.log(`⚙️ Processor registered: ${name}`);
  }

  // Handle incoming message
  async handleMessage(envelope) {
    try {
      // Validate envelope
      if (!(envelope instanceof MessageEnvelope)) {
        throw new Error('Invalid message envelope');
      }

      const data = envelope.get();
      console.log(`📨 Processing message: ${data.id} from ${data.channel}:${data.channelId}`);

      // Store in history (simple cache for context)
      this.messageHistory.set(data.id, envelope);
      this.stats.messagesProcessed++;

      // Enforce size limit to prevent memory leaks
      if (this.messageHistory.size > this.maxHistorySize) {
        const oldestKey = this.messageHistory.keys().next().value;
        this.messageHistory.delete(oldestKey);
      }

      // Check context limits (Law 2)
      if (envelope.isContextNearLimit()) {
        console.warn(`⚠️ Context near limit for ${data.context.threadId}`);
        this.emit('context-warning', envelope);
      }

      // Emit to processors
      this.emit('message', envelope);
      
      // Update status
      envelope.data.status = 'processing';

    } catch (error) {
      console.error('❌ Message handling error:', error);
      envelope.addError('BUS_ERROR', error.message);
      this.handleError(envelope, error);
    }
  }

  // Send response back through appropriate adapter
  async sendResponse(envelope, response) {
    try {
      const data = envelope.get();
      const adapter = this.adapters.get(data.channel);
      
      if (!adapter) {
        throw new Error(`No adapter for channel: ${data.channel}`);
      }

      await adapter.send(data.channelId, response);
      envelope.data.status = 'completed';
      
      console.log(`📤 Response sent via ${data.channel}`);

    } catch (error) {
      console.error('❌ Response sending error:', error);
      envelope.addError('SEND_ERROR', error.message);
      this.handleError(envelope, error);
    }
  }

  // Error recovery system (Law 4)
  setupErrorRecovery() {
    this.on('error', (envelope, error) => {
      this.stats.errors++;
      
      // Auto-retry recoverable errors
      if (envelope.data.status === 'retry') {
        setTimeout(() => {
          console.log(`🔄 Retrying message: ${envelope.data.id}`);
          this.handleMessage(envelope);
          this.stats.recoveries++;
        }, 1000 * Math.pow(2, envelope.data.errors.length)); // Exponential backoff
      }
    });
  }

  // Handle adapter-specific errors
  handleAdapterError(channel, error) {
    console.error(`❌ Adapter error (${channel}):`, error);
    
    // Attempt to restart adapter after delay
    setTimeout(() => {
      console.log(`🔄 Attempting to restart ${channel} adapter`);
      const adapter = this.adapters.get(channel);
      if (adapter && adapter.restart) {
        adapter.restart();
      }
    }, 5000);
  }

  // Generic error handler
  handleError(envelope, error) {
    this.emit('error', envelope, error);
  }

  // Get bus statistics
  getStats() {
    return {
      ...this.stats,
      adapters: Array.from(this.adapters.keys()),
      processors: Array.from(this.processors.keys()),
      memoryUsage: this.messageHistory.size
    };
  }

  // Clean up old messages (prevent memory leaks)
  cleanup() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    let cleaned = 0;
    
    for (const [id, envelope] of this.messageHistory) {
      if (envelope.get().timestamp < cutoff) {
        this.messageHistory.delete(id);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old messages`);
    }
  }
}

export default MessageBus;