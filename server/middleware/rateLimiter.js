class RequestQueue {
  constructor(requestsPerSecond) {
    this.requestsPerSecond = requestsPerSecond;
    this.queue = [];
    this.lastRequestTime = 0;
    this.minIntervalMs = 1000 / requestsPerSecond;
  }

  async enqueue(fn) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    return fn();
  }
}

export const platformLimits = {
  shopify: 2, // 2 requests per second
  meta: 200 / 3600, // 200 per hour = ~0.056 per second
  google: 10, // 10 requests per second
  klaviyo: 3, // 3 requests per second
  ga4: 10, // 10 requests per second
};

const queues = {
  shopify: new RequestQueue(platformLimits.shopify),
  meta: new RequestQueue(platformLimits.meta),
  google: new RequestQueue(platformLimits.google),
  klaviyo: new RequestQueue(platformLimits.klaviyo),
  ga4: new RequestQueue(platformLimits.ga4),
};

export async function queueRequest(platform, fn) {
  const queue = queues[platform];
  if (!queue) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return queue.enqueue(fn);
}

export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * delay * 0.1;
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

export async function withCacheAndFallback(
  cacheKey,
  fetchFn,
  cache,
  mockData,
  ttlSeconds = 300
) {
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const data = await fetchFn();
    cache.set(cacheKey, data, ttlSeconds);
    return data;
  } catch (error) {
    console.error(`[RateLimiter] Error fetching ${cacheKey}:`, error.message);

    if (mockData) {
      console.warn(`[RateLimiter] Falling back to mock data for ${cacheKey}`);
      return mockData;
    }

    throw error;
  }
}

export async function validateCredentials(credentials) {
  if (!credentials) {
    return { valid: false, reason: 'No credentials provided' };
  }

  for (const [key, value] of Object.entries(credentials)) {
    if (!value || value.trim() === '') {
      return { valid: false, reason: `Missing credential: ${key}` };
    }
  }

  return { valid: true };
}
