// Server-side client for the DIKSHA (Sunbird Knowlg) public API.
// Only endpoints verified by scripts/diksha-probe.js are used:
//   POST /api/content/v1/search
//   GET  /api/content/v2/read/{id}
//   GET  /api/course/v1/hierarchy/{id}   (works for textbooks as well as courses)
// /api/collection/v1/read and /api/collection/v1/hierarchy returned 401 without auth -> not used.
import { ALLOWED_LICENSES, normalizeHierarchy, normalizeItem } from '../utils/dikshaMapper.js';

export class DikshaError extends Error {
  /**
   * @param {'NOT_CONFIGURED'|'TIMEOUT'|'UPSTREAM_AUTH'|'NOT_FOUND'|'RATE_LIMITED'|'UPSTREAM'|'BAD_RESPONSE'} kind
   * @param {number|null} status upstream HTTP status, when there was one
   */
  constructor(kind, status = null, retryAfter = null) {
    super(`DIKSHA request failed: ${kind}`);
    this.name = 'DikshaError';
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

// Read lazily: server.js loads dotenv after its imports are evaluated.
const config = () => {
  const raw = (process.env.DIKSHA_API_BASE_URL || 'https://diksha.gov.in').trim().replace(/\/+$/, '');
  let base = null;
  try {
    if (raw && new URL(raw).protocol === 'https:') base = raw;
  } catch {
    base = 'https://diksha.gov.in';
  }
  return {
    base,
    key: (process.env.DIKSHA_API_KEY || '').trim(),
    timeoutMs: Number(process.env.DIKSHA_TIMEOUT_MS) || 10000,
    ttlMs: (Number(process.env.DIKSHA_CACHE_TTL_SECONDS) || 600) * 1000,
  };
};

// ---- Small in-memory TTL cache with LRU-ish eviction ----
const CACHE_MAX = 500;
const cache = new Map();
const inflight = new Map();

const cacheGet = (key) => {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expires <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  cache.delete(key);
  cache.set(key, hit); // move to most-recent
  return hit.value;
};

const cacheSet = (key, value, ttlMs) => {
  if (ttlMs <= 0) return;
  cache.set(key, { value, expires: Date.now() + ttlMs });
  while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
};

export const clearDikshaCache = () => {
  cache.clear();
  inflight.clear();
};

const send = async (method, path, body) => {
  const { base, key, timeoutMs } = config();
  if (!base) throw new DikshaError('NOT_CONFIGURED');

  const headers = { Accept: 'application/json', 'User-Agent': 'StudyWisely/1.0 (+https://studywisely.in)' };
  if (body) headers['Content-Type'] = 'application/json';
  // Not required for the endpoints above (Phase 0); Sunbird documents a Bearer API key,
  // so it is sent only if one has been issued and configured.
  if (key) headers.Authorization = `Bearer ${key}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      redirect: 'error',
    });
  } catch (err) {
    throw new DikshaError(err?.name === 'AbortError' ? 'TIMEOUT' : 'UPSTREAM');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 || res.status === 403) throw new DikshaError('UPSTREAM_AUTH', res.status);
  if (res.status === 404) throw new DikshaError('NOT_FOUND', 404);
  if (res.status === 429) throw new DikshaError('RATE_LIMITED', 429, res.headers.get('retry-after'));
  if (!res.ok) throw new DikshaError('UPSTREAM', res.status);

  let json;
  try {
    json = await res.json();
  } catch {
    throw new DikshaError('BAD_RESPONSE', res.status);
  }
  if (!json || typeof json.result !== 'object' || json.result === null) {
    throw new DikshaError('BAD_RESPONSE', res.status);
  }
  return json.result;
};

// Cached + de-duplicated request. `transform` runs before caching so large raw
// payloads (a textbook hierarchy is ~640 KB) are never kept in memory.
const request = async (method, path, body, transform = (r) => r) => {
  const cacheKey = `${method} ${path} ${body ? JSON.stringify(body) : ''}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;
  if (inflight.has(cacheKey)) return inflight.get(cacheKey);

  const p = send(method, path, body)
    .then((result) => {
      const value = transform(result);
      cacheSet(cacheKey, value, config().ttlMs);
      return value;
    })
    .finally(() => inflight.delete(cacheKey));
  inflight.set(cacheKey, p);
  return p;
};

export const SEARCH_FIELDS = [
  'identifier', 'name', 'description', 'primaryCategory', 'mimeType', 'board', 'gradeLevel',
  'subject', 'medium', 'language', 'appIcon', 'artifactUrl', 'license', 'creator', 'organisation',
];

const FACETS = ['board', 'gradeLevel', 'subject', 'medium', 'primaryCategory', 'mimeType'];

export const clampLimit = (limit) => Math.min(50, Math.max(1, Math.trunc(Number(limit)) || 20));
export const clampPage = (page) => Math.max(1, Math.trunc(Number(page)) || 1);

// Builds { field: [values] } from optional scalars; skips empty ones.
// Plain objects are Sunbird operator filters (e.g. { ne: [...] }) and pass through as-is.
const buildFilters = (extra = {}) => {
  const filters = { status: ['Live'], license: ALLOWED_LICENSES };
  for (const [k, v] of Object.entries(extra)) {
    if (v === undefined || v === null || v === '') continue;
    filters[k] = Array.isArray(v) || typeof v === 'object' ? v : [v];
  }
  return filters;
};

/**
 * Strict class filter. DIKSHA items carry several classes (e.g. Class 7–10) and a
 * gradeLevel filter matches any of them; excluding every other class via
 * se_gradeLevels { ne } keeps only items tagged with the selected class alone.
 * Verified against DIKSHA (CBSE Class 10: 3327 -> 2982, no mixed-class items left).
 */
export const strictGradeFilter = (excludeGrades) =>
  excludeGrades?.length ? { se_gradeLevels: { ne: excludeGrades } } : {};

const facetsToMap = (facets) => {
  const out = {};
  for (const f of Array.isArray(facets) ? facets : []) {
    if (!f || typeof f.name !== 'string') continue;
    out[f.name] = (Array.isArray(f.values) ? f.values : [])
      .filter((v) => v && typeof v.name === 'string')
      .map((v) => ({ name: v.name, count: Number(v.count) || 0 }));
  }
  return out;
};

/** Facet counts (board / gradeLevel / subject / medium / primaryCategory / mimeType). */
export const getFilterOptions = ({ board, gradeLevel, excludeGrades } = {}) =>
  request('POST', '/api/content/v1/search', {
    request: { filters: buildFilters({ board, gradeLevel, ...strictGradeFilter(excludeGrades) }), limit: 0, facets: FACETS },
  }, (result) => facetsToMap(result.facets));

/**
 * @param {{ filters?: object, query?: string, page?: number, limit?: number }} params
 * filters: { board, gradeLevel, subject, medium, primaryCategory, mimeType } (DIKSHA values)
 */
export const searchContent = ({ filters = {}, query, page = 1, limit = 20 } = {}) => {
  const l = clampLimit(limit);
  const p = clampPage(page);
  const reqBody = {
    filters: buildFilters(filters),
    limit: l,
    offset: (p - 1) * l,
    fields: SEARCH_FIELDS,
    sort_by: { lastPublishedOn: 'desc' },
  };
  if (query) reqBody.query = query;
  return request('POST', '/api/content/v1/search', { request: reqBody }, (result) => ({
    count: Number(result.count) || 0,
    content: Array.isArray(result.content) ? result.content : [],
  }));
};

export const getCourses = ({ filters = {}, ...rest } = {}) =>
  searchContent({ ...rest, filters: { ...filters, primaryCategory: 'Course', mimeType: undefined } });

export const getContentById = (id) =>
  request('GET', `/api/content/v2/read/${encodeURIComponent(id)}`, null, (result) => {
    if (!result.content || typeof result.content !== 'object') throw new DikshaError('BAD_RESPONSE');
    return result.content;
  });

/** Returns the normalized root item plus its normalized chapter tree. */
export const getCollectionHierarchy = (id) =>
  request('GET', `/api/course/v1/hierarchy/${encodeURIComponent(id)}`, null, (result) => {
    const root = result.content;
    if (!root || typeof root !== 'object') throw new DikshaError('BAD_RESPONSE');
    return { root: normalizeItem(root), tree: normalizeHierarchy(root) };
  });
