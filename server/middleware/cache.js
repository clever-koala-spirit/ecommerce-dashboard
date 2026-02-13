import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export function cacheMiddleware(key, ttlSeconds = 300) {
  return (req, res, next) => {
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    const originalJson = res.json.bind(res);

    res.json = (data) => {
      cache.set(key, data, ttlSeconds);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

export function getCachedOrFetch(key, fetchFn, ttl = 300) {
  const cached = cache.get(key);

  if (cached) {
    return Promise.resolve(cached);
  }

  return fetchFn().then((data) => {
    cache.set(key, data, ttl);
    return data;
  });
}

export function invalidateCache(key) {
  cache.del(key);
}

export function invalidatePattern(pattern) {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  keys.forEach((key) => {
    if (regex.test(key)) {
      cache.del(key);
    }
  });
}

export function getCacheStats() {
  return cache.getStats();
}

export function clearCache() {
  cache.flushAll();
}
