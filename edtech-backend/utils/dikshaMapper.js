// Translates between this app's board/class values and DIKSHA (Sunbird) values,
// and normalizes DIKSHA records into the small shape the frontend consumes.
// Every field read here was observed in the Phase 0 probe (scripts/diksha-probe.js).
import { normBoard, normClass } from '../controllers/syllabusController.js';

// Only these licenses are shown with a direct "open" link. Phase 0 found
// CC BY-NC / BY-NC-ND / BY-NC-SA and "Standard YouTube License" items too; until
// NCERT/DIKSHA confirm what a paid app may surface, search is restricted to these.
export const ALLOWED_LICENSES = ['CC BY 4.0', 'CC BY-SA 4.0'];

const COLLECTION_MIME = 'application/vnd.ekstep.content-collection';

// mimeTypes whose artifactUrl is a directly openable file / video page.
// Archive types (ecml / html / h5p .zip) and .ecar packages are app-only.
const DIRECT_MIME_TYPES = ['application/pdf', 'video/mp4', 'video/webm', 'video/x-youtube', 'application/epub'];

// Content ids seen in Phase 0: "do_" + 20-26 digits.
export const CONTENT_ID_RE = /^do_\d{10,30}$/;

// Type tabs exposed by our API, built from primaryCategory / mimeType facet values seen in Phase 0.
export const TYPE_GROUPS = {
  textbook: { label: 'Textbooks', field: 'primaryCategory', values: ['Digital Textbook'] },
  video: { label: 'Videos', field: 'mimeType', values: ['video/mp4', 'video/webm', 'video/x-youtube'] },
  pdf: { label: 'PDFs', field: 'mimeType', values: ['application/pdf'] },
  course: { label: 'Courses', field: 'primaryCategory', values: ['Course'] },
  question_set: {
    label: 'Question sets',
    field: 'primaryCategory',
    values: ['Practice Question Set', 'Exam Question Set', 'Exam Question', 'Question Paper'],
  },
};

// normBoard() code -> state name used in DIKSHA's "State (<name>)" board values.
// normBoard() returns its own codes for 10 states and the bare suffix ("ap", "kl"...)
// for the other state-* ids in the frontend's STATE_BOARDS list.
const STATE_NAMES = {
  mp: 'madhya pradesh',
  up: 'uttar pradesh',
  maharashtra: 'maharashtra',
  bihar: 'bihar',
  rajasthan: 'rajasthan',
  gujarat: 'gujarat',
  karnataka: 'karnataka',
  tamilnadu: 'tamil nadu',
  westbengal: 'west bengal',
  punjab: 'punjab',
  ap: 'andhra pradesh',
  ts: 'telangana',
  kl: 'kerala',
  od: 'odisha',
  jh: 'jharkhand',
  cg: 'chhattisgarh',
  hr: 'haryana',
  uk: 'uttarakhand',
  as: 'assam',
};

const titleCase = (s) => String(s).replace(/(^|[\s(/-])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());

// Facet values come back lower-cased; DIKSHA filters are case-insensitive, so this is display-only.
export const displayFacetValue = (v) => {
  const s = String(v);
  if (/^(cbse|ncert|nios|cisce|icse|ncte|bosem)$/i.test(s)) return s.toUpperCase();
  return titleCase(s);
};

/**
 * App board ('cbse', 'state-mp', 'MP Board', 'CBSE' ...) -> DIKSHA board value, or null.
 * Only CBSE and state boards are mapped; ICSE / IB / Cambridge / "Other" return null
 * (DIKSHA has no IB/Cambridge and its CISCE corpus had 0 Class 10 items in Phase 0).
 * @param {string} appBoard
 * @param {string[]} boardFacetValues live "board" facet values from DIKSHA
 */
export const toDikshaBoard = (appBoard, boardFacetValues = []) => {
  if (!appBoard || typeof appBoard !== 'string') return null;
  const nb = normBoard(appBoard);
  let target = null;
  if (nb === 'cbse') {
    target = 'cbse';
  } else {
    const state = STATE_NAMES[nb] || Object.values(STATE_NAMES).find((name) => nb.includes(name));
    if (state) target = `state (${state})`;
  }
  if (!target) return null;
  const hit = boardFacetValues.find((v) => String(v).toLowerCase() === target);
  return hit ? displayFacetValue(hit) : null;
};

/**
 * App class ('10', 'Class 10', 10) -> 'Class 10', validated against the gradeLevel facet.
 */
export const toDikshaGrade = (appClass, gradeFacetValues = []) => {
  if (appClass === undefined || appClass === null || String(appClass).trim() === '') return null;
  const n = normClass(appClass);
  if (!/^\d{1,2}$/.test(n)) return null;
  const target = `class ${Number(n)}`;
  return gradeFacetValues.some((v) => String(v).toLowerCase() === target) ? `Class ${Number(n)}` : null;
};

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

const arr = (v) => {
  if (Array.isArray(v)) {
    const out = [...new Set(v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()))];
    return out.length ? out : null;
  }
  return str(v) ? [v.trim()] : null;
};

const isDikshaHost = (host) => host === 'diksha.gov.in' || host.endsWith('.diksha.gov.in');
const YOUTUBE_HOSTS = ['youtu.be', 'youtube.com', 'www.youtube.com', 'm.youtube.com'];

// Only https URLs on DIKSHA's own hosts (or YouTube for x-youtube items) pass.
const safeUrl = (value, { allowYoutube = false } = {}) => {
  const s = str(value);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return null;
    if (isDikshaHost(u.hostname)) return u.href;
    if (allowYoutube && YOUTUBE_HOSTS.includes(u.hostname)) return u.href;
  } catch {
    // not a URL
  }
  return null;
};

export const isLicenseAllowed = (license) => ALLOWED_LICENSES.includes(str(license));

const directUrl = (raw) => {
  const mime = str(raw.mimeType);
  if (!DIRECT_MIME_TYPES.includes(mime) || !isLicenseAllowed(raw.license)) return null;
  return safeUrl(raw.artifactUrl, { allowYoutube: mime === 'video/x-youtube' });
};

export const normalizeItem = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const organisation = arr(raw.organisation);
  return {
    id: str(raw.identifier),
    name: str(raw.name),
    description: str(raw.description),
    type: str(raw.primaryCategory),
    mimeType: str(raw.mimeType),
    board: str(raw.board),
    grade: arr(raw.gradeLevel),
    subject: arr(raw.subject),
    medium: arr(raw.medium),
    language: arr(raw.language),
    thumbnail: safeUrl(raw.appIcon),
    contentUrl: directUrl(raw),
    // No official public play-page URL could be verified in Phase 0 (the portal returns the
    // same SPA shell for any id), so playUrl stays null until DIKSHA confirms one.
    playUrl: null,
    license: str(raw.license),
    attribution: {
      creator: str(raw.creator),
      organisation: organisation ? organisation.join(', ') : null,
    },
    isCollection: str(raw.mimeType) === COLLECTION_MIME,
  };
};

const MAX_DEPTH = 8;

/** Recursive textbook -> chapter -> resource tree from /api/course/v1/hierarchy. */
export const normalizeHierarchy = (node, depth = 0) => {
  if (!node || typeof node !== 'object') return null;
  const children = Array.isArray(node.children) && depth < MAX_DEPTH
    ? [...node.children]
        .sort((a, b) => (Number(a?.index) || 0) - (Number(b?.index) || 0))
        .map((c) => normalizeHierarchy(c, depth + 1))
        .filter(Boolean)
    : [];
  return {
    id: str(node.identifier),
    name: str(node.name),
    type: str(node.primaryCategory),
    mimeType: str(node.mimeType),
    license: str(node.license),
    contentUrl: directUrl(node),
    children,
  };
};
