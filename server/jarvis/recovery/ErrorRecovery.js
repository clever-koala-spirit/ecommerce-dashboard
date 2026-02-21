import { EventEmitter } from 'events';

/**
 * JARVIS Error Recovery System - Self-healing, no manual intervention
 * 
 * Law 4: Errors recover themselves
 * Law 7: Small, real, honest - practical recovery strategies
 */

export class ErrorRecovery extends EventEmitter {
  constructor(messageBus, options = {}) {
    super();
    
    this.messageBus = messageBus;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000; // Base delay in ms
    this.maxBackoff = options.maxBackoff || 30000; // Max backoff (30s)
    
    this.errorHistory = new Map(); // Error patterns for learning
    this.recoveryStrategies = new Map();
    this.circuitBreakers = new Map(); // Prevent cascade failures
    
    this.stats = {
      errorsDetected: 0,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      circuitBreaks: 0
    };

    this.setupRecoveryStrategies();
    this.setupMonitoring();
    
    console.log('🛡️ Error Recovery System initialized');
  }

  // Define recovery strategies for different error types
  setupRecoveryStrategies() {
    // Network errors - retry with backoff
    this.recoveryStrategies.set('NETWORK_ERROR', {
      maxRetries: 5,
      backoff: 'exponential',
      strategy: this.networkErrorRecovery.bind(this)
    });

    // API rate limiting - backoff and rotate
    this.recoveryStrategies.set('RATE_LIMIT', {
      maxRetries: 3,
      backoff: 'exponential',
      strategy: this.rateLimitRecovery.bind(this)
    });

    // Token limit exceeded - context chunking
    this.recoveryStrategies.set('TOKEN_LIMIT', {
      maxRetries: 2,
      backoff: 'linear',
      strategy: this.tokenLimitRecovery.bind(this)
    });

    // Parse/validation errors - sanitize input
    this.recoveryStrategies.set('PARSE_ERROR', {
      maxRetries: 2,
      backoff: 'none',
      strategy: this.parseErrorRecovery.bind(this)
    });

    // Telegram API errors
    this.recoveryStrategies.set('TELEGRAM_ERROR', {
      maxRetries: 3,
      backoff: 'exponential',
      strategy: this.telegramErrorRecovery.bind(this)
    });

    // Generic bus errors
    this.recoveryStrategies.set('BUS_ERROR', {
      maxRetries: 2,
      backoff: 'linear',
      strategy: this.busErrorRecovery.bind(this)
    });

    // Circuit breaker recovery
    this.recoveryStrategies.set('CIRCUIT_BREAK', {
      maxRetries: 1,
      backoff: 'fixed',
      strategy: this.circuitBreakerRecovery.bind(this)
    });

    console.log(`🛡️ Recovery strategies loaded: ${this.recoveryStrategies.size}`);
  }

  // Set up error monitoring
  setupMonitoring() {
    // Monitor message bus errors
    this.messageBus.on('error', (envelope, error) => {
      this.handleError(envelope, error);
    });

    // Monitor context warnings
    this.messageBus.on('context-warning', (data) => {
      this.handleContextWarning(data);
    });

    // Monitor process-level errors
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Promise Rejection:', reason);
      this.handleSystemError('UNHANDLED_REJECTION', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      this.handleSystemError('UNCAUGHT_EXCEPTION', error);
    });

    // Periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute

    console.log('🏥 Error monitoring active');
  }

  // Main error handling entry point
  async handleError(envelope, error) {
    try {
      this.stats.errorsDetected++;
      
      // Classify error
      const errorType = this.classifyError(error);
      console.log(`🚨 Error detected: ${errorType} - ${error.message}`);
      
      // Track error pattern
      this.trackErrorPattern(errorType, error, envelope);
      
      // Check circuit breaker
      if (this.shouldCircuitBreak(errorType)) {
        await this.triggerCircuitBreaker(errorType);
        return;
      }
      
      // Attempt recovery
      await this.attemptRecovery(envelope, errorType, error);
      
    } catch (recoveryError) {
      console.error('❌ Recovery system error:', recoveryError);
      // Fallback: basic error response
      await this.fallbackErrorResponse(envelope);
    }
  }

  // Classify error into recovery categories
  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    const code = error.code || error.error_code || '';
    
    // Network-related errors
    if (message.includes('network') || message.includes('timeout') || 
        message.includes('connection') || code.includes('NETWORK')) {
      return 'NETWORK_ERROR';
    }
    
    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests') || 
        code === 429 || code === '429') {
      return 'RATE_LIMIT';
    }
    
    // Token/context limits
    if (message.includes('token') || message.includes('context') || 
        message.includes('maximum') || message.includes('limit exceeded')) {
      return 'TOKEN_LIMIT';
    }
    
    // Parse/validation errors
    if (message.includes('parse') || message.includes('invalid') || 
        message.includes('validation') || message.includes('schema')) {
      return 'PARSE_ERROR';
    }
    
    // Telegram-specific errors
    if (message.includes('telegram') || message.includes('grammy') || 
        error.error_code || message.includes('bot')) {
      return 'TELEGRAM_ERROR';
    }
    
    // Bus errors
    if (message.includes('bus') || message.includes('envelope') || 
        message.includes('routing')) {
      return 'BUS_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  // Track error patterns for learning
  trackErrorPattern(errorType, error, envelope) {
    if (!this.errorHistory.has(errorType)) {
      this.errorHistory.set(errorType, {
        count: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        patterns: new Map()
      });
    }
    
    const pattern = this.errorHistory.get(errorType);
    pattern.count++;
    pattern.lastSeen = Date.now();
    
    // Track specific error messages
    const key = error.message?.substring(0, 50) || 'unknown';
    pattern.patterns.set(key, (pattern.patterns.get(key) || 0) + 1);
  }

  // Check if circuit breaker should trigger
  shouldCircuitBreak(errorType) {
    const pattern = this.errorHistory.get(errorType);
    if (!pattern) return false;
    
    // Trigger if too many errors in short time
    const recentWindow = 5 * 60 * 1000; // 5 minutes
    const errorThreshold = 10;
    
    if (pattern.count >= errorThreshold && 
        (Date.now() - pattern.firstSeen) < recentWindow) {
      return true;
    }
    
    return false;
  }

  // Trigger circuit breaker
  async triggerCircuitBreaker(errorType) {
    console.log(`🚫 Circuit breaker triggered for ${errorType}`);
    
    this.circuitBreakers.set(errorType, {
      triggered: Date.now(),
      duration: 5 * 60 * 1000, // 5 minutes
      errorsSuppressed: 0
    });
    
    this.stats.circuitBreaks++;
    this.emit('circuit-break', { errorType });
    
    // Auto-reset after duration
    setTimeout(() => {
      this.resetCircuitBreaker(errorType);
    }, this.circuitBreakers.get(errorType).duration);
  }

  // Reset circuit breaker
  resetCircuitBreaker(errorType) {
    const breaker = this.circuitBreakers.get(errorType);
    if (breaker) {
      console.log(`✅ Circuit breaker reset for ${errorType} (suppressed ${breaker.errorsSuppressed} errors)`);
      this.circuitBreakers.delete(errorType);
    }
  }

  // Attempt error recovery
  async attemptRecovery(envelope, errorType, error) {
    const strategy = this.recoveryStrategies.get(errorType) || 
                    this.recoveryStrategies.get('BUS_ERROR'); // Default
    
    const data = envelope.get();
    const retryCount = data.errors.length;
    
    // Check retry limits
    if (retryCount >= strategy.maxRetries) {
      console.log(`❌ Max retries exceeded for ${errorType}`);
      this.stats.failedRecoveries++;
      await this.fallbackErrorResponse(envelope);
      return;
    }
    
    this.stats.recoveryAttempts++;
    
    // Calculate delay based on backoff strategy
    const delay = this.calculateBackoff(strategy.backoff, retryCount);
    
    console.log(`🔄 Attempting recovery for ${errorType} (attempt ${retryCount + 1}/${strategy.maxRetries}) in ${delay}ms`);
    
    // Wait before retry
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
      // Execute recovery strategy
      await strategy.strategy(envelope, error);
      this.stats.successfulRecoveries++;
      console.log(`✅ Recovery successful for ${errorType}`);
      
    } catch (recoveryError) {
      console.error(`❌ Recovery failed for ${errorType}:`, recoveryError);
      envelope.addError(`${errorType}_RECOVERY_FAILED`, recoveryError.message);
      
      // Retry if within limits
      if (retryCount + 1 < strategy.maxRetries) {
        await this.attemptRecovery(envelope, errorType, recoveryError);
      } else {
        await this.fallbackErrorResponse(envelope);
      }
    }
  }

  // Calculate backoff delay
  calculateBackoff(strategy, retryCount) {
    switch (strategy) {
      case 'exponential':
        return Math.min(this.retryDelay * Math.pow(2, retryCount), this.maxBackoff);
      case 'linear':
        return this.retryDelay * (retryCount + 1);
      case 'fixed':
        return this.retryDelay;
      case 'none':
      default:
        return 0;
    }
  }

  // Recovery strategies
  async networkErrorRecovery(envelope, error) {
    // For network errors, just retry the original operation
    const data = envelope.get();
    console.log(`🌐 Retrying network operation for message ${data.id}`);
    
    // Reset status for retry
    envelope.data.status = 'pending';
    await this.messageBus.handleMessage(envelope);
  }

  async rateLimitRecovery(envelope, error) {
    console.log('⏱️ Rate limit recovery - waiting before retry');
    
    // Extract rate limit info if available
    const retryAfter = error.parameters?.retry_after || 60;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    
    envelope.data.status = 'pending';
    await this.messageBus.handleMessage(envelope);
  }

  async tokenLimitRecovery(envelope, error) {
    console.log('📊 Token limit recovery - triggering context chunking');
    
    const data = envelope.get();
    this.emit('force-chunk', data.context.threadId);
    
    // Reduce response size
    if (data.routing) {
      data.routing.maxTokens = Math.min(data.routing.maxTokens || 4000, 2000);
    }
    
    envelope.data.status = 'pending';
    await this.messageBus.handleMessage(envelope);
  }

  async parseErrorRecovery(envelope, error) {
    console.log('🔧 Parse error recovery - sanitizing input');
    
    const data = envelope.get();
    if (data.content.text) {
      // Basic sanitization
      data.content.text = data.content.text
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
        .replace(/\x00/g, '') // Remove null bytes
        .trim();
    }
    
    envelope.data.status = 'pending';
    await this.messageBus.handleMessage(envelope);
  }

  async telegramErrorRecovery(envelope, error) {
    console.log('📱 Telegram error recovery');
    
    // For certain Telegram errors, modify the response format
    if (error.error_code === 400) {
      // Bad request - simplify response
      envelope.data.routing = { 
        ...envelope.data.routing,
        maxTokens: 1000,
        temperature: 0.3
      };
    }
    
    envelope.data.status = 'pending';
    await this.messageBus.handleMessage(envelope);
  }

  async busErrorRecovery(envelope, error) {
    console.log('🚌 Bus error recovery - resetting envelope');
    
    // Reset envelope to clean state
    envelope.data.status = 'pending';
    envelope.data.errors = envelope.data.errors.slice(-1); // Keep only last error
    
    await this.messageBus.handleMessage(envelope);
  }

  async circuitBreakerRecovery(envelope, error) {
    console.log('🚫 Circuit breaker active - using fallback response');
    await this.fallbackErrorResponse(envelope);
  }

  // Context warning handler
  async handleContextWarning(data) {
    console.log(`⚠️ Context warning: ${data.threadId} at ${Math.round(data.usage * 100)}%`);
    
    // Proactively chunk if very high
    if (data.usage > 0.9) {
      this.emit('force-chunk', data.threadId);
    }
  }

  // System-level error handler
  async handleSystemError(type, error) {
    console.error(`🚨 System error (${type}):`, error);
    
    // Log for analysis
    this.stats.errorsDetected++;
    
    // Attempt graceful recovery
    try {
      // Clean up resources
      if (this.messageBus) {
        this.messageBus.cleanup();
      }
      
      // Reset error counters if too high
      if (this.stats.errorsDetected > 100) {
        this.resetStats();
      }
      
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
  }

  // Fallback error response when all recovery fails
  async fallbackErrorResponse(envelope) {
    try {
      const response = "🤖 I encountered an issue processing your message, but I'm designed to recover automatically. Please try again, and I'll do my best to help! If the problem persists, I'm learning and improving with each interaction.";
      
      await this.messageBus.sendResponse(envelope, response);
      
    } catch (fallbackError) {
      console.error('❌ Even fallback response failed:', fallbackError);
      // At this point, log and hope for system recovery
    }
  }

  // Periodic health check
  performHealthCheck() {
    const errorRate = this.stats.errorsDetected / (this.stats.errorsDetected + this.stats.successfulRecoveries || 1);
    
    if (errorRate > 0.5) {
      console.warn(`🏥 High error rate detected: ${Math.round(errorRate * 100)}%`);
      this.emit('health-warning', { errorRate, stats: this.stats });
    }
    
    // Reset old circuit breakers
    for (const [errorType, breaker] of this.circuitBreakers) {
      if (Date.now() - breaker.triggered > breaker.duration) {
        this.resetCircuitBreaker(errorType);
      }
    }
    
    // Clean old error history
    this.cleanupErrorHistory();
  }

  // Clean up old error patterns
  cleanupErrorHistory() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - maxAge;
    
    for (const [errorType, pattern] of this.errorHistory) {
      if (pattern.lastSeen < cutoff) {
        this.errorHistory.delete(errorType);
      }
    }
  }

  // Reset statistics
  resetStats() {
    console.log('📊 Resetting error recovery statistics');
    this.stats = {
      errorsDetected: 0,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      circuitBreaks: 0
    };
  }

  // Get recovery statistics
  getStats() {
    const errorTypes = Array.from(this.errorHistory.keys());
    const activeCircuitBreakers = Array.from(this.circuitBreakers.keys());
    
    return {
      ...this.stats,
      errorTypes,
      activeCircuitBreakers,
      recoveryRate: this.stats.recoveryAttempts > 0 ? 
        Math.round((this.stats.successfulRecoveries / this.stats.recoveryAttempts) * 100) : 0
    };
  }
}

export default ErrorRecovery;