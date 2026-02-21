#!/usr/bin/env node

/**
 * JARVIS Phase 1: Core Router & Telegram Adapter
 * 
 * Main entry point - brings all components together
 * Following Leo's Laws:
 * - Law 1: Swappable in 2 hours (loose coupling)
 * - Law 2: Context is finite (track tokens like money)
 * - Law 4: Errors recover themselves
 * - Law 7: Ship small, ship real, ship honest
 */

import { config } from 'dotenv';
import MessageBus from './bus/MessageBus.js';
import TelegramAdapter from './adapters/TelegramAdapter.js';
import BasicRouter from './router/BasicRouter.js';
import ContextManager from './context/ContextManager.js';
import ErrorRecovery from './recovery/ErrorRecovery.js';

// Load environment variables
config();

class JARVIS {
  constructor() {
    this.components = {};
    this.isRunning = false;
    this.startTime = null;
    
    console.log('🤖 JARVIS Phase 1 - Initializing...');
    this.initialize();
  }

  // Initialize all components
  async initialize() {
    try {
      console.log('⚡ Initializing components...');
      
      // 1. MESSAGE BUS - Central nervous system
      console.log('📡 Starting Message Bus...');
      this.components.messageBus = new MessageBus();
      
      // 2. CONTEXT MANAGEMENT - Token tracking
      console.log('🧠 Starting Context Manager...');
      this.components.contextManager = new ContextManager({
        maxTokens: 100000, // Prevent 171k overflow
        warningThreshold: 0.8,
        chunkSize: 4000
      });
      
      // 3. ERROR RECOVERY - Self-healing system
      console.log('🛡️ Starting Error Recovery...');
      this.components.errorRecovery = new ErrorRecovery(this.components.messageBus);
      
      // 4. BASIC ROUTER - Intent detection and routing
      console.log('🧠 Starting Basic Router...');
      this.components.router = new BasicRouter(this.components.messageBus);
      
      // 5. TELEGRAM ADAPTER - Grammy-based bridge
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      if (telegramToken) {
        console.log('📱 Starting Telegram Adapter...');
        this.components.telegramAdapter = new TelegramAdapter(telegramToken);
        this.components.messageBus.registerAdapter('telegram', this.components.telegramAdapter);
      } else {
        console.warn('⚠️ No Telegram token provided, adapter disabled');
      }
      
      this.wireComponents();
      
      console.log('✅ All components initialized');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  // Wire components together (Law 1: loose coupling)
  wireComponents() {
    const { messageBus, contextManager, errorRecovery, router } = this.components;
    
    // Context manager tracks all messages
    messageBus.on('message', (envelope) => {
      contextManager.trackMessage(envelope);
    });
    
    // Error recovery handles context warnings
    contextManager.on('context-warning', (data) => {
      console.log(`⚠️ Context warning: ${data.threadId}`);
    });
    
    // Force chunking when recovery system requests it
    errorRecovery.on('force-chunk', (threadId) => {
      contextManager.forceChunk(threadId);
    });
    
    // Health monitoring
    errorRecovery.on('health-warning', (data) => {
      console.warn('🏥 System health warning:', data);
      this.performHealthCheck();
    });
    
    // Circuit breaker notifications
    errorRecovery.on('circuit-break', (data) => {
      console.log(`🚫 Circuit breaker active: ${data.errorType}`);
    });
    
    console.log('🔗 Components wired together');
  }

  // Start JARVIS
  async start() {
    if (this.isRunning) {
      console.log('⚠️ JARVIS is already running');
      return;
    }
    
    try {
      console.log('🚀 Starting JARVIS Phase 1...');
      this.startTime = Date.now();
      
      // Start Telegram adapter if available
      if (this.components.telegramAdapter) {
        await this.components.telegramAdapter.start();
      }
      
      this.isRunning = true;
      
      // Set up periodic maintenance
      this.setupMaintenance();
      
      // Set up graceful shutdown
      this.setupShutdown();
      
      console.log(`
🤖 JARVIS Phase 1 - ONLINE
=========================
📡 Message Bus: Active
🧠 Context Manager: Active (100k token limit)
🛡️ Error Recovery: Active
🧠 Router: Active (${this.components.router.getStats().intentsRegistered} intents)
📱 Telegram: ${this.components.telegramAdapter ? 'Active' : 'Disabled'}

Laws in Effect:
• Swappable in 2 hours ⚡
• Context is finite 📊
• Errors recover themselves 🔄
• Ship small, ship real, honest 📦

Ready to serve! 🚀
`);
      
    } catch (error) {
      console.error('❌ Failed to start JARVIS:', error);
      throw error;
    }
  }

  // Stop JARVIS
  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ JARVIS is not running');
      return;
    }
    
    try {
      console.log('⏹️ Stopping JARVIS...');
      this.isRunning = false;
      
      // Stop Telegram adapter
      if (this.components.telegramAdapter) {
        await this.components.telegramAdapter.stop();
      }
      
      // Cleanup components
      if (this.components.messageBus) {
        this.components.messageBus.cleanup();
      }
      
      if (this.components.contextManager) {
        this.components.contextManager.cleanup();
      }
      
      console.log('✅ JARVIS stopped gracefully');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  // Set up periodic maintenance tasks
  setupMaintenance() {
    // Cleanup old data every hour
    setInterval(() => {
      if (!this.isRunning) return;
      
      console.log('🧹 Performing maintenance...');
      
      try {
        // Cleanup message bus
        if (this.components.messageBus) {
          this.components.messageBus.cleanup();
        }
        
        // Cleanup context manager
        if (this.components.contextManager) {
          this.components.contextManager.cleanup();
        }
        
        console.log('✅ Maintenance completed');
      } catch (error) {
        console.error('❌ Maintenance error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
    
    // Health check every 5 minutes
    setInterval(() => {
      if (this.isRunning) {
        this.performHealthCheck();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Perform system health check
  performHealthCheck() {
    const status = this.getStatus();
    const busStats = this.components.messageBus?.getStats();
    const errorStats = this.components.errorRecovery?.getStats();
    
    console.log(`🏥 Health Check - Uptime: ${status.uptime}, Messages: ${busStats?.messagesProcessed || 0}, Errors: ${errorStats?.errorsDetected || 0}`);
    
    // Check for concerning patterns
    if (errorStats?.errorsDetected > 50) {
      console.warn('⚠️ High error count detected');
    }
    
    if (errorStats?.recoveryRate < 80) {
      console.warn('⚠️ Low recovery rate detected');
    }
  }

  // Set up graceful shutdown handlers
  setupShutdown() {
    const gracefulShutdown = async (signal) => {
      console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      // Let error recovery system handle it
      if (this.components.errorRecovery) {
        this.components.errorRecovery.handleSystemError('UNCAUGHT_EXCEPTION', error);
      }
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection:', reason);
      // Let error recovery system handle it
      if (this.components.errorRecovery) {
        this.components.errorRecovery.handleSystemError('UNHANDLED_REJECTION', reason);
      }
    });
  }

  // Get system status
  getStatus() {
    const uptime = this.startTime ? Date.now() - this.startTime : 0;
    
    return {
      running: this.isRunning,
      uptime: this.formatUptime(uptime),
      startTime: this.startTime,
      components: {
        messageBus: !!this.components.messageBus,
        contextManager: !!this.components.contextManager,
        errorRecovery: !!this.components.errorRecovery,
        router: !!this.components.router,
        telegramAdapter: !!this.components.telegramAdapter
      },
      stats: {
        messageBus: this.components.messageBus?.getStats(),
        contextManager: this.components.contextManager?.getStats(),
        errorRecovery: this.components.errorRecovery?.getStats(),
        router: this.components.router?.getStats(),
        telegramAdapter: this.components.telegramAdapter?.getStats()
      }
    };
  }

  // Format uptime for display
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const jarvis = new JARVIS();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
    default:
      // Start JARVIS
      jarvis.start().catch(error => {
        console.error('❌ Failed to start JARVIS:', error);
        process.exit(1);
      });
      break;
      
    case 'status':
      // Show status and exit
      console.log(JSON.stringify(jarvis.getStatus(), null, 2));
      break;
      
    case 'test':
      // Quick test
      console.log('🧪 Running quick test...');
      await jarvis.start();
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('📊 Status:', jarvis.getStatus());
      await jarvis.stop();
      console.log('✅ Test completed');
      break;
  }
}

export default JARVIS;