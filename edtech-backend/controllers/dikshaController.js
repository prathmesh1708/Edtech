import {
  DikshaError,
  getFilterOptions,
  searchContent,
  getCourses as fetchCourses,
  getContentById,
  getCollectionHierarchy,
  strictGradeFilter,
} from '../services/dikshaService.js';
import {
  CONTENT_ID_RE,
  TYPE_GROUPS,
  toDikshaBoard,
  toDikshaGrade,
  normalizeItem,
  displayFacetValue,
} from '../utils/dikshaMapper.js';
import DikshaBookmark from '../models/DikshaBookmark.js';
import DikshaRecentlyViewed from '../models/DikshaRecentlyViewed.js';

const SOURCE = 'DIKSHA';
const RECENT_LIMIT = 20;

// DIKSHA failures are answered here and never reach the global errorHandler
// (which returns stack traces outside production). An upstream 401/403 must never
// become a 401: the frontend logs the user out on any 401.
const ERROR_MAP = {
  NOT_CONFIGURED: [503, 'DIKSHA_NOT_CONFIGURED', 'DIKSHA integration is not configured'],
  TIMEOUT: [504, 'DIKSHA_TIMEOUT', 'DIKSHA took too long to respond. Please try again.'],
  UPSTREAM_AUTH: [502, 'DIKSHA_AUTH_FAILED', 'DIKSHA service is temporarily unavailable'],
  NOT_FOUND: [404, 'DIKSHA_NOT_FOUND', 'This resource was not found on DIKSHA'],
  RATE_LIMITED: [429, 'DIKSHA_RATE_LIMITED', 'DIKSHA is busy right now. Please try again shortly.'],
  UPSTREAM: [502, 'DIKSHA_UNAVAILABLE', 'DIKSHA service is temporarily unavailable'],
  BAD_RESPONSE: [502, 'DIKSHA_UNAVAILABLE', 'DIKSHA service is temporarily unavailable'],
};

class BadRequest extends Error {}

const sendError = (res, err) => {
  if (err instanceof BadRequest) {
    return res.status(400).json({ success: false, code: 'INVALID_PARAMS', message: err.message });
  }
  if (err instanceof DikshaError) {
    const [status, code, message] = ERROR_MAP[err.kind] || ERROR_MAP.UPSTREAM;
    console.error(`[diksha] ${err.kind}${err.status ? ` (upstream ${err.status})` : ''}`);
    if (status === 429 && err.retryAfter) res.set('Retry-After', String(err.retryAfter));
    return res.status(status).json({ success: false, code, message });
  }
  console.error('[diksha] unexpected error:', err?.message);
  return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Something went wrong' });
};

// ---- Query validation ----
const readString = (value, name, max) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new BadRequest(`${name} must be a single value`);
  const s = value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!s) return undefined;
  if (s.length > max) throw new BadRequest(`${name} must be at most ${max} characters`);
  return s;
};

const readInt = (value, name, min, max, fallback) => {
  if (value === undefined || value === '') return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new BadRequest(`${name} must be an integer`);
  const n = Number(value);
  if (n < min || n > max) throw new BadRequest(`${name} must be between ${min} and ${max}`);
  return n;
};

const readType = (value) => {
  const t = readString(value, 'type', 30);
  if (t === undefined) return undefined;
  if (!Object.hasOwn(TYPE_GROUPS, t)) {
    throw new BadRequest(`type must be one of: ${Object.keys(TYPE_GROUPS).join(', ')}`);
  }
  return t;
};

const readContentId = (value) => {
  if (typeof value !== 'string' || !CONTENT_ID_RE.test(value)) throw new BadRequest('Invalid content id');
  return value;
};

const readListParams = (query) => ({
  board: readString(query.board, 'board', 50),
  grade: readString(query.grade, 'grade', 20),
  subject: readString(query.subject, 'subject', 100),
  medium: readString(query.medium, 'medium', 50),
  type: readType(query.type),
  q: readString(query.q, 'q', 100),
  page: readInt(query.page, 'page', 1, 100, 1),
  limit: readInt(query.limit, 'limit', 1, 50, 20),
});

// ---- Board / grade translation against live facets ----
const resolveScope = async ({ board, grade }) => {
  if (!board && !grade) return { dikshaBoard: undefined, dikshaGrade: undefined, reason: null };
  const global = await getFilterOptions();
  const boards = (global.board || []).map((v) => v.name);
  const grades = (global.gradeLevel || []).map((v) => v.name);

  let dikshaBoard;
  let dikshaGrade;
  if (board) {
    dikshaBoard = toDikshaBoard(board, boards);
    if (!dikshaBoard) return { dikshaBoard: null, dikshaGrade: undefined, reason: 'BOARD_NOT_ON_DIKSHA' };
  }
  if (grade) {
    dikshaGrade = toDikshaGrade(grade, grades);
    if (!dikshaGrade) return { dikshaBoard, dikshaGrade: null, reason: 'GRADE_NOT_ON_DIKSHA' };
  }
  // Every other class value DIKSHA knows (incl. "KG", "CPD", "Others"...), for the strict filter.
  const excludeGrades = dikshaGrade ? grades.filter((g) => g.toLowerCase() !== dikshaGrade.toLowerCase()) : [];
  return { dikshaBoard, dikshaGrade, excludeGrades, reason: null };
};

const typeFilter = (type) => {
  if (!type) return {};
  const group = TYPE_GROUPS[type];
  return { [group.field]: group.values };
};

const listResponse = (res, { items, page, limit, total, scope, extra = {} }) =>
  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total },
    source: SOURCE,
    query: { board: scope.dikshaBoard ?? null, grade: scope.dikshaGrade ?? null, ...extra },
    available: !scope.reason,
    ...(scope.reason ? { reason: scope.reason } : {}),
  });

const runSearch = async (res, params, { courses = false } = {}) => {
  const scope = await resolveScope(params);
  const extra = { subject: params.subject ?? null, type: courses ? 'course' : params.type ?? null, q: params.q ?? null };
  if (scope.reason) {
    return listResponse(res, { items: [], page: params.page, limit: params.limit, total: 0, scope, extra });
  }
  const filters = {
    board: scope.dikshaBoard,
    gradeLevel: scope.dikshaGrade,
    ...strictGradeFilter(scope.excludeGrades),
    subject: params.subject,
    medium: params.medium,
    ...(courses ? {} : typeFilter(params.type)),
  };
  const fetcher = courses ? fetchCourses : searchContent;
  const result = await fetcher({ filters, query: params.q, page: params.page, limit: params.limit });
  const items = result.content.map(normalizeItem).filter((i) => i && i.id);
  return listResponse(res, { items, page: params.page, limit: params.limit, total: result.count, scope, extra });
};

const facetList = (facet = []) =>
  facet
    .map((v) => ({ value: displayFacetValue(v.name), count: v.count }))
    .sort((a, b) => b.count - a.count);

// @desc    Boards / grades / subjects / mediums / content types available on DIKSHA
// @route   GET /api/diksha/filters?board=&grade=
// @access  Public
export const getFilters = async (req, res) => {
  try {
    const board = readString(req.query.board, 'board', 50);
    const grade = readString(req.query.grade, 'grade', 20);
    const global = await getFilterOptions();
    const scope = await resolveScope({ board, grade });

    const boards = facetList(global.board).filter((b) => b.value.toLowerCase() !== 'other' && b.value.toLowerCase() !== 'others');
    const grades = (global.gradeLevel || [])
      .map((v) => v.name.match(/^class (\d{1,2})$/i)?.[1])
      .filter(Boolean)
      .map(Number)
      .sort((a, b) => a - b)
      .map((n) => `Class ${n}`);

    let subjects = [];
    let mediums = [];
    let types = [];
    if (!scope.reason) {
      const scoped = await getFilterOptions({
        board: scope.dikshaBoard,
        gradeLevel: scope.dikshaGrade,
        excludeGrades: scope.excludeGrades,
      });
      subjects = facetList(scoped.subject);
      mediums = facetList(scoped.medium);
      types = Object.entries(TYPE_GROUPS)
        .map(([key, group]) => {
          const wanted = group.values.map((v) => v.toLowerCase());
          const count = (scoped[group.field] || [])
            .filter((v) => wanted.includes(v.name.toLowerCase()))
            .reduce((sum, v) => sum + v.count, 0);
          return { key, label: group.label, count };
        })
        .filter((t) => t.count > 0);
    }

    res.json({
      success: true,
      data: { boards, grades, subjects, mediums, types },
      source: SOURCE,
      query: { board: scope.dikshaBoard ?? null, grade: scope.dikshaGrade ?? null },
      available: !scope.reason,
      ...(scope.reason ? { reason: scope.reason } : {}),
    });
  } catch (err) {
    sendError(res, err);
  }
};

// @route   GET /api/diksha/search?board=&grade=&subject=&medium=&type=&q=&page=&limit=
// @access  Public
export const search = async (req, res) => {
  try {
    await runSearch(res, readListParams(req.query));
  } catch (err) {
    sendError(res, err);
  }
};

// @desc    Search scoped to the logged-in user's own board and class
// @route   GET /api/diksha/my-content?subject=&type=&q=&page=&limit=
// @access  Private
export const getMyContent = async (req, res) => {
  try {
    const params = readListParams({ ...req.query, board: undefined, grade: undefined });
    params.board = typeof req.user?.board === 'string' ? req.user.board : undefined;
    params.grade = req.user?.classId ? String(req.user.classId) : undefined;
    await runSearch(res, params);
  } catch (err) {
    sendError(res, err);
  }
};

// @route   GET /api/diksha/courses?board=&grade=&subject=&page=&limit=
// @access  Public
export const getCourses = async (req, res) => {
  try {
    await runSearch(res, readListParams({ ...req.query, type: undefined }), { courses: true });
  } catch (err) {
    sendError(res, err);
  }
};

// @route   GET /api/diksha/content/:id
// @access  Public
export const getContent = async (req, res) => {
  try {
    const id = readContentId(req.params.id);
    const item = normalizeItem(await getContentById(id));
    res.json({ success: true, data: item, source: SOURCE });
  } catch (err) {
    sendError(res, err);
  }
};

// @desc    Textbook chapters / course units
// @route   GET /api/diksha/collections/:id/hierarchy
// @access  Public
export const getHierarchy = async (req, res) => {
  try {
    const id = readContentId(req.params.id);
    const { root, tree } = await getCollectionHierarchy(id);
    res.json({ success: true, data: { root, children: tree?.children || [] }, source: SOURCE });
  } catch (err) {
    sendError(res, err);
  }
};

// ---- Bookmarks / recently viewed (metadata only) ----
// Metadata is read from DIKSHA server-side so no client-supplied URL or text is stored.
const joinList = (v) => (Array.isArray(v) ? v.join(', ') : v) || undefined;

const bookmarkView = (b) => ({
  contentId: b.contentId,
  title: b.title ?? null,
  type: b.type ?? null,
  mimeType: b.mimeType ?? null,
  board: b.board ?? null,
  grade: b.grade ?? null,
  subject: b.subject ?? null,
  thumbnail: b.thumbnail ?? null,
  license: b.license ?? null,
  attribution: { creator: b.creator ?? null, organisation: b.organisation ?? null },
  createdAt: b.createdAt,
});

const recentView = (r) => ({
  contentId: r.contentId,
  title: r.title ?? null,
  type: r.type ?? null,
  viewedAt: r.viewedAt,
});

// Upsert that tolerates the duplicate-key race between two concurrent first writes.
const upsert = async (Model, filter, update) => {
  const opts = { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true };
  try {
    return await Model.findOneAndUpdate(filter, update, opts);
  } catch (err) {
    if (err?.code === 11000) return Model.findOneAndUpdate(filter, update, { ...opts, upsert: false });
    throw err;
  }
};

// @route   POST /api/diksha/bookmarks   body: { contentId }
// @access  Private
export const addBookmark = async (req, res) => {
  try {
    const contentId = readContentId(req.body?.contentId);
    const item = normalizeItem(await getContentById(contentId));
    const doc = await upsert(
      DikshaBookmark,
      { user: req.user._id, contentId },
      {
        $set: {
          title: item.name || undefined,
          type: item.type || undefined,
          mimeType: item.mimeType || undefined,
          board: item.board || undefined,
          grade: joinList(item.grade),
          subject: joinList(item.subject),
          thumbnail: item.thumbnail || undefined,
          license: item.license || undefined,
          creator: item.attribution.creator || undefined,
          organisation: item.attribution.organisation || undefined,
        },
      }
    );
    res.json({ success: true, data: bookmarkView(doc) });
  } catch (err) {
    sendError(res, err);
  }
};

// @route   GET /api/diksha/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
  try {
    const docs = await DikshaBookmark.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, data: docs.map(bookmarkView) });
  } catch (err) {
    sendError(res, err);
  }
};

// @route   DELETE /api/diksha/bookmarks/:contentId
// @access  Private
export const removeBookmark = async (req, res) => {
  try {
    const contentId = readContentId(req.params.contentId);
    const result = await DikshaBookmark.deleteOne({ user: req.user._id, contentId });
    res.json({ success: true, data: { contentId, removed: result.deletedCount > 0 } });
  } catch (err) {
    sendError(res, err);
  }
};

// @route   POST /api/diksha/recently-viewed   body: { contentId }
// @access  Private
export const addRecentlyViewed = async (req, res) => {
  try {
    const contentId = readContentId(req.body?.contentId);
    const item = normalizeItem(await getContentById(contentId));
    const doc = await upsert(
      DikshaRecentlyViewed,
      { user: req.user._id, contentId },
      { $set: { title: item.name || undefined, type: item.type || undefined, viewedAt: new Date() } }
    );

    const stale = await DikshaRecentlyViewed.find({ user: req.user._id })
      .sort({ viewedAt: -1 })
      .skip(RECENT_LIMIT)
      .select('_id')
      .lean();
    if (stale.length) await DikshaRecentlyViewed.deleteMany({ _id: { $in: stale.map((s) => s._id) } });

    res.json({ success: true, data: recentView(doc) });
  } catch (err) {
    sendError(res, err);
  }
};

// @route   GET /api/diksha/recently-viewed
// @access  Private
export const getRecentlyViewed = async (req, res) => {
  try {
    const docs = await DikshaRecentlyViewed.find({ user: req.user._id }).sort({ viewedAt: -1 }).limit(RECENT_LIMIT).lean();
    res.json({ success: true, data: docs.map(recentView) });
  } catch (err) {
    sendError(res, err);
  }
};
