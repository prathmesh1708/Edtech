// Dependency-free fixed-window rate limiter factory (same approach as dikshaRateLimit.js).
// In memory: fine for the single PM2 instance; use a shared store if the backend scales out.
// Behind a reverse proxy, set TRUST_PROXY so req.ip is the client, not the proxy.
export const createRateLimiter = ({ windowMs, max, key = (req) => req.ip || 'unknown', code = 'RATE_LIMITED', message }) => {
  const hits = new Map();
  const limiter = (req, res, next) => {
    const now = Date.now();
    const k = key(req);
    let entry = hits.get(k);
    if (!entry || entry.resetAt <= now) {
      if (hits.size >= 10000) for (const [x, e] of hits) if (e.resetAt <= now) hits.delete(x);
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(k, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, code, message });
    }
    next();
  };
  limiter.reset = () => hits.clear();
  return limiter;
};

const identity = (req) => String(req.body?.email || req.body?.phone || req.body?.mobile || '').toLowerCase().trim();

// Sign-in attempts: per IP + account (stops password guessing on one account) and per IP
// overall (stops spraying many accounts from one machine).
export const authAccountLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: (req) => `${req.ip}|${identity(req)}`,
  code: 'TOO_MANY_ATTEMPTS',
  message: 'Too many attempts. Please wait 15 minutes and try again.',
});

export const authIpLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  code: 'TOO_MANY_ATTEMPTS',
  message: 'Too many attempts from this network. Please wait and try again.',
});
