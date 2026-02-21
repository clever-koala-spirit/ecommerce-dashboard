import { z } from 'zod';

/**
 * Standard Message Envelope for JARVIS
 * 
 * Law 1: Swappable in 2 hours - Any channel can plug into this format
 * Law 2: Context is finite - Token tracking built into envelope
 */

// Message envelope schema
export const MessageEnvelopeSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  channel: z.enum(['telegram', 'discord', 'whatsapp', 'voice', 'internal']),
  channelId: z.string(), // chat/user/room ID
  
  // User context
  user: z.object({
    id: z.string(),
    name: z.string().optional(),
    role: z.enum(['user', 'admin', 'system']).default('user')
  }),
  
  // Message content
  content: z.object({
    text: z.string().optional(),
    media: z.array(z.object({
      type: z.enum(['image', 'video', 'audio', 'file']),
      url: z.string(),
      metadata: z.record(z.any()).optional()
    })).optional(),
    attachments: z.array(z.string()).optional()
  }),
  
  // Context management (Law 2: finite context)
  context: z.object({
    threadId: z.string().optional(), // conversation thread
    replyTo: z.string().optional(), // message ID being replied to
    tokenCount: z.number().default(0), // estimated tokens used
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
  }),
  
  // Intent and routing
  intent: z.object({
    detected: z.string().optional(), // detected intent type
    confidence: z.number().min(0).max(1).optional(),
    entities: z.record(z.any()).optional()
  }).optional(),
  
  // Error handling (Law 4: self-healing)
  status: z.enum(['pending', 'processing', 'completed', 'error', 'retry']).default('pending'),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    timestamp: z.number(),
    recoverable: z.boolean()
  })).default([]),
  
  // Response routing
  routing: z.object({
    targetModel: z.string().optional(), // which AI model to use
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(2).optional()
  }).optional()
});

export class MessageEnvelope {
  constructor(data) {
    this.data = MessageEnvelopeSchema.parse(data);
  }

  // Create from Telegram message
  static fromTelegram(ctx, content) {
    return new MessageEnvelope({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      channel: 'telegram',
      channelId: ctx.chat.id.toString(),
      user: {
        id: ctx.from.id.toString(),
        name: ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ''),
        role: 'user'
      },
      content: {
        text: content.text,
        media: content.media,
        attachments: content.attachments
      },
      context: {
        threadId: `tg_${ctx.chat.id}`,
        tokenCount: this.estimateTokens(content.text || ''),
        priority: 'normal'
      },
      status: 'pending'
    });
  }

  // Estimate token count (rough approximation)
  static estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4); // ~4 chars per token
  }

  // Add error with auto-recovery logic
  addError(code, message, recoverable = true) {
    this.data.errors.push({
      code,
      message,
      timestamp: Date.now(),
      recoverable
    });
    
    if (recoverable && this.data.errors.length < 3) {
      this.data.status = 'retry';
    } else {
      this.data.status = 'error';
    }
  }

  // Check if context is approaching limits (Law 2)
  isContextNearLimit(maxTokens = 100000) {
    return this.data.context.tokenCount > maxTokens * 0.8;
  }

  // Serialize for logging/storage
  toJSON() {
    return this.data;
  }

  // Get data
  get() {
    return this.data;
  }
}

export default MessageEnvelope;