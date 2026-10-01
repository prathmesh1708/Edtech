// Dependency-free fixed-window rate limiter for the DIKSHA proxy routes only.
// Keyed on req.ip. Behind a reverse proxy without `trust proxy`, req.ip is the
// proxy's address and every client shares one bucket — see DIKSHA_INTEGRATION.md.
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;
const MAX_TRACKED_IPS = 10000;

const hits = new Map();

export const resetDikshaRateLimit = () => hits.clear();

const prune = (now) => {
  for (const [ip, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(ip);
  }
};

export const dikshaRateLimit = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  let entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    if (hits.size >= MAX_TRACKED_IPS) prune(now);
    entry = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(ip, entry);
  }
  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait a moment and try again.',
    });
  }
  next();
};

export default dikshaRateLimit;
