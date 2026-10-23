// Dependency-free per-user, per-minute limiter for AI chat requests.
// Keyed on the authenticated user id (mount after `protect`), so students behind one
// school network do not share a bucket. The daily cap is enforced in the controller
// from MongoDB so it survives restarts.
const WINDOW_MS = 60 * 1000;
const MAX_TRACKED_USERS = 10000;

const hits = new Map();

export const resetAiRateLimit = () => hits.clear();

const perMinute = () => {
  const n = Number(process.env.AI_RATE_LIMIT_PER_MINUTE);
  return Number.isFinite(n) && n > 0 ? n : 6;
};

const prune = (now) => {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
};

export const aiRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = String(req.user?._id || req.ip || 'unknown');

  let entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    if (hits.size >= MAX_TRACKED_USERS) prune(now);
    entry = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(key, entry);
  }
  entry.count += 1;

  if (entry.count > perMinute()) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      code: 'AI_RATE_LIMITED',
      message: `You're asking very fast! Please wait ${retryAfter} seconds and try again.`,
    });
  }
  next();
};

export default aiRateLimit;
