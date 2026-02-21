import { Bot } from 'grammy';
import { EventEmitter } from 'events';
import MessageEnvelope from '../bus/MessageEnvelope.js';

/**
 * JARVIS Telegram Adapter - Grammy-based thin bridge
 * 
 * Law 1: Swappable in 2 hours - clean interface to message bus
 * Law 4: Self-healing - auto-reconnect on errors
 * Law 7: Small, real, honest - under 200 lines
 */

export class TelegramAdapter extends EventEmitter {
  constructor(token) {
    super();
    
    if (!token) {
      throw new Error('Telegram bot token required');
    }
    
    this.bot = new Bot(token);
    this.isRunning = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    
    this.setupHandlers();
    this.setupErrorRecovery();
  }

  // Set up Grammy message handlers
  setupHandlers() {
    // Text messages
    this.bot.on('message:text', (ctx) => {
      const envelope = this.createEnvelope(ctx, {
        text: ctx.message.text
      });
      this.emit('message', envelope);
    });

    // Photos
    this.bot.on('message:photo', (ctx) => {
      const photos = ctx.message.photo.map(photo => ({
        type: 'image',
        url: photo.file_id, // Telegram file ID
        metadata: { width: photo.width, height: photo.height }
      }));
      
      const envelope = this.createEnvelope(ctx, {
        text: ctx.message.caption,
        media: photos
      });
      this.emit('message', envelope);
    });

    // Voice messages
    this.bot.on('message:voice', (ctx) => {
      const envelope = this.createEnvelope(ctx, {
        media: [{
          type: 'audio',
          url: ctx.message.voice.file_id,
          metadata: { duration: ctx.message.voice.duration }
        }]
      });
      this.emit('message', envelope);
    });

    // Documents
    this.bot.on('message:document', (ctx) => {
      const envelope = this.createEnvelope(ctx, {
        text: ctx.message.caption,
        attachments: [ctx.message.document.file_id],
        media: [{
          type: 'file',
          url: ctx.message.document.file_id,
          metadata: { 
            fileName: ctx.message.document.file_name,
            mimeType: ctx.message.document.mime_type,
            size: ctx.message.document.file_size
          }
        }]
      });
      this.emit('message', envelope);
    });

    // Command handler for /start, /help etc
    this.bot.on('message', (ctx, next) => {
      // Skip if already handled by specific handlers
      if (ctx.message.text?.startsWith('/')) {
        const envelope = this.createEnvelope(ctx, {
          text: ctx.message.text
        });
        envelope.data.intent = {
          detected: 'command',
          confidence: 1.0,
          entities: { command: ctx.message.text.split(' ')[0] }
        };
        this.emit('message', envelope);
        return;
      }
      next();
    });
  }

  // Create message envelope from Telegram context
  createEnvelope(ctx, content) {
    return MessageEnvelope.fromTelegram(ctx, content);
  }

  // Set up error recovery (Law 4)
  setupErrorRecovery() {
    this.bot.catch((err) => {
      console.error('❌ Grammy error:', err);
      this.emit('error', err);
      
      // Auto-recovery for network errors
      if (err.error_code === 429 || err.error_code === 502) {
        this.scheduleRestart();
      }
    });

    // Handle process errors
    process.on('uncaughtException', (err) => {
      if (err.message.includes('telegram') || err.message.includes('grammy')) {
        console.error('❌ Telegram adapter crash:', err);
        this.scheduleRestart();
      }
    });
  }

  // Start the adapter
  async start() {
    if (this.isRunning) return;
    
    try {
      console.log('🚀 Starting Telegram adapter...');
      
      // Test bot token
      const me = await this.bot.api.getMe();
      console.log(`✅ Bot connected: @${me.username}`);
      
      // Start polling
      await this.bot.start();
      this.isRunning = true;
      this.retryCount = 0;
      
      console.log('📡 Telegram adapter running');
      
    } catch (error) {
      console.error('❌ Failed to start Telegram adapter:', error);
      this.scheduleRestart();
    }
  }

  // Stop the adapter
  async stop() {
    if (!this.isRunning) return;
    
    try {
      await this.bot.stop();
      this.isRunning = false;
      console.log('⏹️ Telegram adapter stopped');
    } catch (error) {
      console.error('❌ Error stopping Telegram adapter:', error);
    }
  }

  // Send message through Telegram
  async send(chatId, message) {
    if (!this.isRunning) {
      throw new Error('Telegram adapter not running');
    }

    try {
      if (typeof message === 'string') {
        await this.bot.api.sendMessage(chatId, message);
      } else if (message.text) {
        await this.bot.api.sendMessage(chatId, message.text, message.options);
      } else {
        throw new Error('Invalid message format');
      }
    } catch (error) {
      console.error('❌ Failed to send Telegram message:', error);
      throw error;
    }
  }

  // Schedule restart with exponential backoff
  scheduleRestart() {
    if (this.retryCount >= this.maxRetries) {
      console.error('❌ Max retries reached, Telegram adapter disabled');
      return;
    }

    const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
    this.retryCount++;
    
    console.log(`🔄 Scheduling Telegram restart in ${delay}ms (attempt ${this.retryCount})`);
    
    setTimeout(async () => {
      await this.stop();
      await this.start();
    }, delay);
  }

  // Restart method for message bus
  async restart() {
    console.log('🔄 Telegram adapter restart requested');
    await this.stop();
    await this.start();
  }

  // Health check
  isHealthy() {
    return this.isRunning && this.retryCount < this.maxRetries;
  }

  // Get adapter stats
  getStats() {
    return {
      running: this.isRunning,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      healthy: this.isHealthy()
    };
  }
}

export default TelegramAdapter;