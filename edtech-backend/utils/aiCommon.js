// Shared by the AI tutor, practice and admin controllers: error responses, input
// readers and the per-student daily limit.
import AITutorChat from '../models/AITutorChat.js';
import PracticeQuiz from '../models/PracticeQuiz.js';
import { GeminiError } from '../services/geminiService.js';

const IST_OFFSET_MS = 330 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

// AI failures are answered here and never reach the global errorHandler (which returns
// stack traces outside production). An upstream 401/403 must never become a 401:
// the frontend logs the user out on any 401.
const ERROR_MAP = {
  NOT_CONFIGURED: [503, 'AI_NOT_CONFIGURED', 'The AI tutor is not available right now. Please try again later.'],
  TIMEOUT: [504, 'AI_TIMEOUT', 'The AI tutor took too long to answer. Please try again.'],
  BAD_REQUEST: [400, 'AI_BAD_INPUT', "I couldn't read that. Please try a clearer photo or type your question."],
  UPSTREAM_AUTH: [502, 'AI_UNAVAILABLE', 'The AI tutor is temporarily unavailable. Please try again later.'],
  QUOTA: [429, 'AI_BUSY', 'The AI tutor is very busy right now. Please try again in a minute.'],
  UPSTREAM: [502, 'AI_UNAVAILABLE', 'The AI tutor is temporarily unavailable. Please try again later.'],
  BAD_RESPONSE: [502, 'AI_UNAVAILABLE', 'The AI tutor is temporarily unavailable. Please try again later.'],
  BLOCKED: [422, 'AI_BLOCKED', "I can't help with that one. Please pick a school subject or chapter."],
  ABORTED: [499, 'AI_STOPPED', 'Stopped.'],
};

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message) => new ApiError(400, 'INVALID_PARAMS', message);
export const notFound = (message = 'Not found') => new ApiError(404, 'NOT_FOUND', message);

export const describeError = (err) => {
  if (err instanceof ApiError) return [err.status, err.code, err.message];
  if (err instanceof GeminiError) {
    console.error(`[ai] ${err.kind}${err.status ? ` (upstream ${err.status})` : ''}`);
    return ERROR_MAP[err.kind] || ERROR_MAP.UPSTREAM;
  }
  console.error('[ai] unexpected error:', err?.message);
  return [500, 'INTERNAL_ERROR', 'Something went wrong'];
};

export const sendError = (res, err) => {
  const [status, code, message] = describeError(err);
  if (err instanceof GeminiError && err.kind === 'QUOTA' && err.retryAfter) res.set('Retry-After', String(err.retryAfter));
  return res.status(status).json({ success: false, code, message });
};

// ---- Input readers ----
export const readString = (value, name, max) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw badRequest(`${name} must be a string`);
  const s = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  if (!s) return undefined;
  if (s.length > max) throw badRequest(`${name} must be at most ${max} characters`);
  return s;
};

export const readObjectId = (value, name) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !OBJECT_ID_RE.test(value)) throw badRequest(`Invalid ${name}`);
  return value;
};

// Pages can carry non-database chapter ids (fallback data); those just skip the DB lookup.
export const readChapterId = (value) => (typeof value === 'string' && OBJECT_ID_RE.test(value) ? value : undefined);

export const readEnum = (value, name, allowed, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (!allowed.includes(value)) throw badRequest(`${name} must be one of: ${allowed.join(', ')}`);
  return value;
};

export const isInactive = (user) => ['Inactive', 'Suspended', 'Blocked'].includes(user?.status);

// ---- Daily limit (chat questions + generated quizzes) ----
export const dailyLimit = () => {
  const n = Number(process.env.AI_DAILY_LIMIT_PER_USER ?? 50);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 50;
};

// Start of the current day in India (IST has no DST), as a UTC Date.
export const startOfIstDay = (now = Date.now()) =>
  new Date(Math.floor((now + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS);

/** Student questions sent to the AI since `since` (all time when omitted). */
export const countChatQuestions = async (userId, since) => {
  const match = since ? { user: userId, lastMessageAt: { $gte: since } } : { user: userId };
  const [row] = await AITutorChat.aggregate([
    { $match: match },
    { $unwind: '$messages' },
    { $match: { 'messages.sender': 'user', ...(since && { 'messages.timestamp': { $gte: since } }) } },
    { $count: 'n' },
  ]);
  return row?.n || 0;
};

export const countAiRequestsToday = async (userId) => {
  const since = startOfIstDay();
  const [chat, quizzes] = await Promise.all([
    countChatQuestions(userId, since),
    PracticeQuiz.countDocuments({ user: userId, createdAt: { $gte: since } }),
  ]);
  return chat + quizzes;
};

/** Throws 429 AI_DAILY_LIMIT when the student has used today's allowance. */
export const assertWithinDailyLimit = async (userId) => {
  const perDay = dailyLimit();
  if (perDay && (await countAiRequestsToday(userId)) >= perDay) {
    throw new ApiError(429, 'AI_DAILY_LIMIT', `You've reached today's limit of ${perDay} AI requests. Come back tomorrow!`);
  }
};
