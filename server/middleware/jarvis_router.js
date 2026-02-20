/**
 * JARVIS Multi-AI Failover Router - Error Recovery & Resilience
 * Provides intelligent failover between multiple AI services for high availability
 */

import { log } from '../utils/logger.js';
import { getDB } from '../db/database.js';

class JARVISRouter {
  constructor() {
    this.services = new Map();
    this.failoverHistory = new Map();
    this.circuitBreakers = new Map();
    this.healthChecks = new Map();
    this.initializeServices();
    this.startHealthMonitoring();
  }

  /**
   * Initialize available AI services and endpoints
   */
  initializeServices() {
    // Primary services configuration
    this.services.set('openai-gpt4', {
      name: 'OpenAI GPT-4',
      endpoint: 'https://api.openai.com/v1/',
      priority: 1,
      status: 'healthy',
      lastError: null,
      errorCount: 0,
      responseTime: 0,
      specialties: ['general', 'creative_fatigue', 'customer_timing']
    });

    this.services.set('anthropic-claude', {
      name: 'Anthropic Claude',
      endpoint: 'https://api.anthropic.com/',
      priority: 2,
      status: 'healthy',
      lastError: null,
      errorCount: 0,
      responseTime: 0,
      specialties: ['analysis', 'budget_optimization', 'cross_merchant']
    });

    this.services.set('local-python-models', {
      name: 'Local Python Models',
      endpoint: 'local',
      priority: 3,
      status: 'healthy',
      lastError: null,
      errorCount: 0,
      responseTime: 0,
      specialties: ['all']
    });

    this.services.set('fallback-heuristics', {
      name: 'Fallback Heuristics',
      endpoint: 'local',
      priority: 4,
      status: 'healthy',
      lastError: null,
      errorCount: 0,
      responseTime: 0,
      specialties: ['all']
    });

    // Initialize circuit breakers for each service
    this.services.forEach((service, serviceId) => {
      this.circuitBreakers.set(serviceId, {
        state: 'closed', // closed, open, half-open
        failureCount: 0,
        lastFailureTime: null,
        successCount: 0,
        threshold: 5, // failures before opening
        timeout: 60000, // 1 minute before trying half-open
        halfOpenMaxCalls: 3
      });
    });

    log('🤖 JARVIS: Multi-AI services initialized');
  }

  /**
   * Start health monitoring for all services
   */
  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    log('🤖 JARVIS: Health monitoring started');
  }

  /**
   * Perform health checks on all services
   */
  async performHealthChecks() {
    for (const [serviceId, service] of this.services) {
      try {
        const startTime = Date.now();
        const isHealthy = await this.checkServiceHealth(serviceId, service);
        const responseTime = Date.now() - startTime;

        service.responseTime = responseTime;
        service.status = isHealthy ? 'healthy' : 'unhealthy';

        if (isHealthy) {
          this.recordSuccess(serviceId);
        }

        this.healthChecks.set(serviceId, {
          timestamp: new Date().toISOString(),
          status: service.status,
          responseTime: responseTime,
          lastError: service.lastError
        });

      } catch (error) {
        service.status = 'unhealthy';
        service.lastError = error.message;
        this.recordFailure(serviceId, error);
      }
    }
  }

  /**
   * Check individual service health
   */
  async checkServiceHealth(serviceId, service) {
    switch (serviceId) {
      case 'openai-gpt4':
        return await this.checkOpenAIHealth();
      case 'anthropic-claude':
        return await this.checkAnthropicHealth();
      case 'local-python-models':
        return await this.checkLocalModelsHealth();
      case 'fallback-heuristics':
        return true; // Always available
      default:
        return false;
    }
  }

  /**
   * Check OpenAI service health
   */
  async checkOpenAIHealth() {
    try {
      // Simple health check - would use actual API in production
      return process.env.OPENAI_API_KEY ? true : false;
    } catch {
      return false;
    }
  }

  /**
   * Check Anthropic service health
   */
  async checkAnthropicHealth() {
    try {
      return process.env.ANTHROPIC_API_KEY ? true : false;
    } catch {
      return false;
    }
  }

  /**
   * Check local Python models health
   */
  async checkLocalModelsHealth() {
    try {
      // Check if Python models directory exists and is accessible
      const fs = await import('fs');
      return fs.existsSync('/home/chip/.openclaw/workspace/slay-season-predictions/models/');
    } catch {
      return false;
    }
  }

  /**
   * Main failover execution function
   */
  async executeWithFailover(operation, operationType, options = {}) {
    const startTime = Date.now();
    const { maxRetries = 3, timeout = 30000, preferredService = null } = options;

    // Get available services for this operation type
    const availableServices = this.getAvailableServices(operationType);
    
    if (availableServices.length === 0) {
      throw new Error('No services available for operation');
    }

    // Sort by priority and health status
    const sortedServices = this.prioritizeServices(availableServices, preferredService);
    
    log(`🤖 JARVIS: Attempting ${operationType} with ${sortedServices.length} services available`);

    let lastError = null;
    let attempts = 0;

    for (const serviceId of sortedServices) {
      if (attempts >= maxRetries) {
        break;
      }

      try {
        // Check circuit breaker
        if (!this.canCallService(serviceId)) {
          log(`🤖 JARVIS: Circuit breaker open for ${serviceId}, skipping`);
          continue;
        }

        attempts++;
        log(`🤖 JARVIS: Trying ${serviceId} (attempt ${attempts})`);

        // Execute operation with timeout
        const result = await Promise.race([
          operation(serviceId),
          this.createTimeoutPromise(timeout)
        ]);

        // Record success
        this.recordSuccess(serviceId);
        
        const duration = Date.now() - startTime;
        log(`🤖 JARVIS: Success with ${serviceId} in ${duration}ms`);

        // Log successful failover
        await this.logFailoverEvent({
          operation_type: operationType,
          service_used: serviceId,
          attempts: attempts,
          duration: duration,
          status: 'success'
        });

        return result;

      } catch (error) {
        lastError = error;
        this.recordFailure(serviceId, error);
        
        log.warn(`JARVIS: ${serviceId} failed for ${operationType}:`, error.message);
        
        // Continue to next service unless this is the last attempt
        if (attempts < maxRetries && this.getNextAvailableService(sortedServices, serviceId)) {
          continue;
        }
      }
    }

    // All services failed
    const duration = Date.now() - startTime;
    log.error(`JARVIS: All services failed for ${operationType} after ${attempts} attempts in ${duration}ms`);

    await this.logFailoverEvent({
      operation_type: operationType,
      service_used: null,
      attempts: attempts,
      duration: duration,
      status: 'failure',
      error: lastError?.message
    });

    throw new Error(`All AI services failed for ${operationType}: ${lastError?.message}`);
  }

  /**
   * Get available services for operation type
   */
  getAvailableServices(operationType) {
    const available = [];
    
    for (const [serviceId, service] of this.services) {
      if (service.specialties.includes('all') || service.specialties.includes(operationType)) {
        if (service.status === 'healthy' || serviceId === 'fallback-heuristics') {
          available.push(serviceId);
        }
      }
    }

    return available;
  }

  /**
   * Prioritize services based on health, priority, and preference
   */
  prioritizeServices(serviceIds, preferredService = null) {
    return serviceIds.sort((a, b) => {
      const serviceA = this.services.get(a);
      const serviceB = this.services.get(b);

      // Preferred service gets highest priority
      if (preferredService === a) return -1;
      if (preferredService === b) return 1;

      // Health status
      if (serviceA.status === 'healthy' && serviceB.status !== 'healthy') return -1;
      if (serviceB.status === 'healthy' && serviceA.status !== 'healthy') return 1;

      // Priority (lower number = higher priority)
      if (serviceA.priority !== serviceB.priority) {
        return serviceA.priority - serviceB.priority;
      }

      // Response time (lower is better)
      return serviceA.responseTime - serviceB.responseTime;
    });
  }

  /**
   * Check if service can be called (circuit breaker logic)
   */
  canCallService(serviceId) {
    const breaker = this.circuitBreakers.get(serviceId);
    if (!breaker) return true;

    const now = Date.now();

    switch (breaker.state) {
      case 'closed':
        return true;

      case 'open':
        if (now - breaker.lastFailureTime >= breaker.timeout) {
          breaker.state = 'half-open';
          breaker.successCount = 0;
          log(`🤖 JARVIS: Circuit breaker half-open for ${serviceId}`);
          return true;
        }
        return false;

      case 'half-open':
        return breaker.successCount < breaker.halfOpenMaxCalls;

      default:
        return true;
    }
  }

  /**
   * Record successful service call
   */
  recordSuccess(serviceId) {
    const service = this.services.get(serviceId);
    const breaker = this.circuitBreakers.get(serviceId);

    if (service) {
      service.errorCount = Math.max(0, service.errorCount - 1);
      service.lastError = null;
    }

    if (breaker) {
      breaker.successCount++;
      
      if (breaker.state === 'half-open' && breaker.successCount >= breaker.halfOpenMaxCalls) {
        breaker.state = 'closed';
        breaker.failureCount = 0;
        log(`🤖 JARVIS: Circuit breaker closed for ${serviceId}`);
      }
    }
  }

  /**
   * Record service failure
   */
  recordFailure(serviceId, error) {
    const service = this.services.get(serviceId);
    const breaker = this.circuitBreakers.get(serviceId);

    if (service) {
      service.errorCount++;
      service.lastError = error.message;
    }

    if (breaker) {
      breaker.failureCount++;
      breaker.lastFailureTime = Date.now();

      if (breaker.failureCount >= breaker.threshold) {
        breaker.state = 'open';
        log(`🤖 JARVIS: Circuit breaker opened for ${serviceId} after ${breaker.failureCount} failures`);
      }
    }
  }

  /**
   * Get next available service after a failure
   */
  getNextAvailableService(sortedServices, failedService) {
    const currentIndex = sortedServices.indexOf(failedService);
    return sortedServices[currentIndex + 1] || null;
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timeout after ${timeout}ms`)), timeout);
    });
  }

  /**
   * Log failover events for analysis
   */
  async logFailoverEvent(eventData) {
    try {
      const db = getDB();
      if (!db) return;

      // Create table if not exists
      db.exec(`
        CREATE TABLE IF NOT EXISTS jarvis_failover_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          operation_type TEXT NOT NULL,
          service_used TEXT,
          attempts INTEGER DEFAULT 1,
          duration INTEGER,
          status TEXT NOT NULL,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const stmt = db.prepare(`
        INSERT INTO jarvis_failover_log (
          timestamp, operation_type, service_used, attempts, duration, status, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        new Date().toISOString(),
        eventData.operation_type,
        eventData.service_used,
        eventData.attempts,
        eventData.duration,
        eventData.status,
        eventData.error
      );

    } catch (error) {
      log.error('JARVIS: Failed to log failover event:', error);
    }
  }

  /**
   * Get system status and metrics
   */
  getSystemStatus() {
    const services = {};
    const circuitBreakers = {};

    for (const [serviceId, service] of this.services) {
      services[serviceId] = {
        name: service.name,
        status: service.status,
        errorCount: service.errorCount,
        responseTime: service.responseTime,
        lastError: service.lastError
      };
    }

    for (const [serviceId, breaker] of this.circuitBreakers) {
      circuitBreakers[serviceId] = {
        state: breaker.state,
        failureCount: breaker.failureCount,
        successCount: breaker.successCount
      };
    }

    return {
      services,
      circuitBreakers,
      healthChecks: Object.fromEntries(this.healthChecks),
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
const jarvisRouter = new JARVISRouter();

/**
 * Main failover function for external use
 */
export const jarvisFailover = async (operation, operationType, options = {}) => {
  return await jarvisRouter.executeWithFailover(operation, operationType, options);
};

/**
 * Get JARVIS system status
 */
export const getJARVISStatus = () => {
  return jarvisRouter.getSystemStatus();
};

/**
 * Express middleware to add JARVIS error recovery
 */
export const jarvisErrorRecovery = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // If there's an error in the response, try to recover
    if (data && data.error && req.path.includes('/predictions/')) {
      // Log the error for JARVIS analysis
      jarvisRouter.logFailoverEvent({
        operation_type: 'api_response_error',
        service_used: 'primary_api',
        attempts: 1,
        duration: 0,
        status: 'error',
        error: data.error
      });

      // Add JARVIS recovery metadata
      data._jarvis_recovery = {
        fallback_available: true,
        retry_recommended: true,
        next_check_in: '30s'
      };
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Health check endpoint data
 */
export const getHealthCheckData = () => {
  return jarvisRouter.getSystemStatus();
};

log('🤖 JARVIS Multi-AI Failover Router initialized');
export default jarvisRouter;