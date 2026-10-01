// DIKSHA integration tests. Run with: npm test
// Builds a fresh express app that mounts only dikshaRoutes (server.js is never imported),
// stubs outbound DIKSHA calls via globalThis.fetch, and uses an in-memory MongoDB.
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import dikshaRoutes from '../routes/dikshaRoutes.js';
import { clearDikshaCache } from '../services/dikshaService.js';
import { resetDikshaRateLimit } from '../middleware/dikshaRateLimit.js';
import { toDikshaBoard, toDikshaGrade, normalizeItem, normalizeHierarchy } from '../utils/dikshaMapper.js';
import User from '../models/User.js';
import DikshaBookmark from '../models/DikshaBookmark.js';
import DikshaRecentlyViewed from '../models/DikshaRecentlyViewed.js';

const BASE = 'https://diksha.example.test';
const API_KEY = 'sk-test-diksha-key-should-never-leak';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'development'; // the global errorHandler would expose stacks here

// ---- Fixtures modelled on real Phase 0 responses ----
const PDF_ID = 'do_31308227401590374419928';
const BOOK_ID = 'do_31310347524809523211409';

const pdfItem = (id = PDF_ID) => ({
  identifier: id,
  name: 'Competency based education',
  primaryCategory: 'Learning Resource',
  mimeType: 'application/pdf',
  board: 'CBSE',
  gradeLevel: ['Class 10'],
  subject: ['Mathematics'],
  medium: ['English'],
  language: ['English'],
  appIcon: `https://obj.diksha.gov.in/ntp-content-production/content/${id}/artifact/cbe12.thumb.png`,
  artifactUrl: `https://obj.diksha.gov.in/ntp-content-production/content/assets/${id}/content-outline-m1.1.pdf`,
  license: 'CC BY 4.0',
  creator: 'Partner Content Creator',
  organisation: ['CBSE'],
});

const textbook = {
  identifier: BOOK_ID,
  name: '(NEW) Contemporary India Part-II',
  primaryCategory: 'Digital Textbook',
  mimeType: 'application/vnd.ekstep.content-collection',
  board: 'CBSE',
  gradeLevel: ['Class 10'],
  license: 'CC BY-SA 4.0',
  organisation: ['CBSE'],
  children: [
    {
      identifier: 'do_31307360983872307212184', name: '2- Forest and Wildlife Resources', index: 2,
      primaryCategory: 'Textbook Unit', mimeType: 'application/vnd.ekstep.content-collection', children: [],
    },
    {
      identifier: 'do_31307360983869849612178', name: '1- Resource and Development', index: 1,
      primaryCategory: 'Textbook Unit', mimeType: 'application/vnd.ekstep.content-collection',
      children: [{
        identifier: 'do_3129911299744563201237', name: 'Chapter 1- Resources and Development',
        primaryCategory: 'eTextbook', mimeType: 'application/pdf', license: 'CC BY-NC-ND 4.0',
        artifactUrl: 'https://obj.diksha.gov.in/ntp-content-production/content/assets/do_3129911299744563201237/jess101.pdf',
      }],
    },
  ],
};

const facets = [
  { name: 'board', values: [{ name: 'cbse', count: 20698 }, { name: 'state (madhya pradesh)', count: 8018 }, { name: 'cisce', count: 49 }, { name: 'other', count: 3 }] },
  { name: 'gradeLevel', values: [{ name: 'class 10', count: 46186 }, { name: 'class 9', count: 42483 }, { name: 'others', count: 1 }] },
  { name: 'subject', values: [{ name: 'mathematics', count: 12 }, { name: 'science', count: 11 }] },
  { name: 'medium', values: [{ name: 'english', count: 53 }] },
  { name: 'primaryCategory', values: [{ name: 'digital textbook', count: 66 }, { name: 'practice question set', count: 1030 }] },
  { name: 'mimeType', values: [{ name: 'application/pdf', count: 1022 }, { name: 'video/mp4', count: 866 }] },
];

// ---- fetch stub ----
const realFetch = globalThis.fetch;
let calls = [];
let upstream;

const json = (result, status = 200) =>
  new Response(JSON.stringify({ id: 'api.test', responseCode: 'OK', params: { status: 'successful' }, result }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const defaultUpstream = (url, init) => {
  const path = new URL(url).pathname;
  if (path === '/api/content/v1/search') {
    const body = JSON.parse(init.body);
    if (body.request.limit === 0) return json({ count: 100, facets });
    return json({ count: 134, content: [pdfItem()] });
  }
  if (path.startsWith('/api/content/v2/read/')) return json({ content: pdfItem(path.split('/').pop()) });
  if (path.startsWith('/api/course/v1/hierarchy/')) return json({ content: textbook });
  return new Response('not found', { status: 404 });
};

globalThis.fetch = async (url, init = {}) => {
  if (String(url).startsWith(BASE)) {
    calls.push({ url: String(url), init, body: init.body ? JSON.parse(init.body) : null });
    return upstream(String(url), init);
  }
  return realFetch(url, init);
};

const searchCalls = () => calls.filter((c) => c.url.endsWith('/api/content/v1/search') && c.body.request.limit !== 0);

// ---- app / db ----
let mongod;
let server;
let baseUrl;
let token;
let userId;

const get = (path, headers = {}) => realFetch(`${baseUrl}${path}`, { headers });
const send = (method, path, body, headers = {}) =>
  realFetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
const auth = () => ({ Authorization: `Bearer ${token}` });

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all([DikshaBookmark.init(), DikshaRecentlyViewed.init()]);

  const user = await User.create({ name: 'Test Student', password: 'secret123', board: 'state-mp', classId: '10' });
  userId = user._id;
  token = jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const app = express();
  app.use(express.json());
  app.use('/api/diksha', dikshaRoutes);
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
  globalThis.fetch = realFetch;
});

beforeEach(() => {
  process.env.DIKSHA_API_BASE_URL = BASE;
  process.env.DIKSHA_TIMEOUT_MS = '2000';
  delete process.env.DIKSHA_API_KEY;
  calls = [];
  upstream = defaultUpstream;
  clearDikshaCache();
  resetDikshaRateLimit();
});

// ---- mapper ----
describe('board / grade mapping', () => {
  const boards = facets[0].values.map((v) => v.name);
  const grades = facets[1].values.map((v) => v.name);

  it('maps app boards to DIKSHA facet values', () => {
    assert.equal(toDikshaBoard('state-mp', boards), 'State (Madhya Pradesh)');
    assert.equal(toDikshaBoard('MP Board', boards), 'State (Madhya Pradesh)');
    assert.equal(toDikshaBoard('cbse', boards), 'CBSE');
    assert.equal(toDikshaBoard('CBSE', boards), 'CBSE');
  });

  it('returns null for boards DIKSHA has no match for', () => {
    assert.equal(toDikshaBoard('icse', boards), null);
    assert.equal(toDikshaBoard('ib', boards), null);
    assert.equal(toDikshaBoard('state-up', boards), null); // not in this facet list
    assert.equal(toDikshaBoard('State Board', boards), null);
    assert.equal(toDikshaBoard('', boards), null);
  });

  it('maps classes and validates against the grade facet', () => {
    assert.equal(toDikshaGrade('10', grades), 'Class 10');
    assert.equal(toDikshaGrade('Class 9', grades), 'Class 9');
    assert.equal(toDikshaGrade('12', grades), null);
    assert.equal(toDikshaGrade('abc', grades), null);
  });

  it('normalizes items and only links allowed licenses on DIKSHA hosts', () => {
    const item = normalizeItem(pdfItem());
    assert.equal(item.id, PDF_ID);
    assert.deepEqual(item.grade, ['Class 10']);
    assert.equal(item.attribution.organisation, 'CBSE');
    assert.match(item.contentUrl, /^https:\/\/obj\.diksha\.gov\.in\//);
    assert.equal(item.playUrl, null);
    assert.equal(item.description, null);
    assert.deepEqual(normalizeItem({ ...pdfItem(), gradeLevel: ['Class 10', 'Class 10'] }).grade, ['Class 10']);

    assert.equal(normalizeItem({ ...pdfItem(), license: 'CC BY-NC 4.0' }).contentUrl, null);
    assert.equal(normalizeItem({ ...pdfItem(), artifactUrl: 'https://evil.example.com/x.pdf' }).contentUrl, null);
    assert.equal(normalizeItem({ ...pdfItem(), appIcon: 'http://obj.diksha.gov.in/a.png' }).thumbnail, null);
  });

  it('normalizes a hierarchy in index order', () => {
    const tree = normalizeHierarchy(textbook);
    assert.equal(tree.children[0].name, '1- Resource and Development');
    assert.equal(tree.children[0].children[0].contentUrl, null); // CC BY-NC-ND
    assert.deepEqual(tree.children[1].children, []);
  });
});

// ---- proxy routes ----
describe('GET /api/diksha/search', () => {
  it('returns normalized items, pagination and translated query', async () => {
    const res = await get('/api/diksha/search?board=cbse&grade=10&subject=Mathematics&type=pdf&q=%20algebra%20&page=2&limit=10');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.source, 'DIKSHA');
    assert.deepEqual(body.pagination, { page: 2, limit: 10, total: 134 });
    assert.equal(body.query.board, 'CBSE');
    assert.equal(body.query.grade, 'Class 10');
    assert.equal(body.data[0].id, PDF_ID);

    const [call] = searchCalls();
    const r = call.body.request;
    assert.equal(r.limit, 10);
    assert.equal(r.offset, 10);
    assert.equal(r.query, 'algebra');
    assert.deepEqual(r.filters.status, ['Live']);
    assert.deepEqual(r.filters.board, ['CBSE']);
    assert.deepEqual(r.filters.gradeLevel, ['Class 10']);
    // strict class: every other class value from the live facet is excluded
    assert.deepEqual(r.filters.se_gradeLevels, { ne: ['class 9', 'others'] });
    assert.deepEqual(r.filters.subject, ['Mathematics']);
    assert.deepEqual(r.filters.mimeType, ['application/pdf']);
  });

  it('rejects invalid params with 400', async () => {
    const bad = [
      'page=0', 'page=101', 'page=abc', 'limit=0', 'limit=51', `q=${'x'.repeat(101)}`, 'type=bogus', 'q=a&q=b',
    ];
    for (const qs of bad) {
      const res = await get(`/api/diksha/search?${qs}`);
      assert.equal(res.status, 400, qs);
      const body = await res.json();
      assert.equal(body.code, 'INVALID_PARAMS');
    }
    assert.equal(calls.length, 0);
  });

  it('handles no results', async () => {
    upstream = (url, init) =>
      JSON.parse(init.body).request.limit === 0 ? json({ count: 0, facets }) : json({ count: 0 });
    const body = await (await get('/api/diksha/search?board=cbse')).json();
    assert.deepEqual(body.data, []);
    assert.equal(body.pagination.total, 0);
  });

  it('returns available:false without searching for boards not on DIKSHA', async () => {
    const body = await (await get('/api/diksha/search?board=icse&grade=10')).json();
    assert.equal(body.success, true);
    assert.equal(body.available, false);
    assert.equal(body.reason, 'BOARD_NOT_ON_DIKSHA');
    assert.equal(searchCalls().length, 0);
  });

  it('maps a state board', async () => {
    const body = await (await get('/api/diksha/search?board=state-mp&grade=Class%2010')).json();
    assert.equal(body.query.board, 'State (Madhya Pradesh)');
    assert.deepEqual(searchCalls()[0].body.request.filters.board, ['State (Madhya Pradesh)']);
  });

  it('serves repeated searches from cache', async () => {
    await get('/api/diksha/search?board=cbse&grade=10');
    await get('/api/diksha/search?board=cbse&grade=10');
    assert.equal(searchCalls().length, 1);
    assert.equal(calls.length, 2); // one facet lookup + one search
  });
});

describe('upstream failures', () => {
  const expectError = async (path, status, code) => {
    const res = await get(path);
    assert.equal(res.status, status);
    const text = await res.text();
    const body = JSON.parse(text);
    assert.equal(body.success, false);
    assert.equal(body.code, code);
    assert.ok(!('stack' in body));
    assert.ok(!text.includes(API_KEY));
    return res;
  };

  it('upstream 500 -> 502', async () => {
    upstream = () => new Response('boom', { status: 500 });
    await expectError('/api/diksha/search', 502, 'DIKSHA_UNAVAILABLE');
  });

  it('bad JSON -> 502', async () => {
    upstream = () => new Response('<html>not json</html>', { status: 200 });
    await expectError(`/api/diksha/content/${PDF_ID}`, 502, 'DIKSHA_UNAVAILABLE');
  });

  it('network error -> 502', async () => {
    upstream = () => { throw new TypeError('fetch failed'); };
    await expectError('/api/diksha/search', 502, 'DIKSHA_UNAVAILABLE');
  });

  it('timeout -> 504', async () => {
    process.env.DIKSHA_TIMEOUT_MS = '50';
    upstream = (url, init) =>
      new Promise((_, reject) => {
        init.signal.addEventListener('abort', () => {
          const e = new Error('aborted');
          e.name = 'AbortError';
          reject(e);
        });
      });
    await expectError(`/api/diksha/content/${PDF_ID}`, 504, 'DIKSHA_TIMEOUT');
  });

  it('upstream 401 / 403 -> 502, never 401', async () => {
    process.env.DIKSHA_API_KEY = API_KEY;
    for (const status of [401, 403]) {
      clearDikshaCache();
      upstream = () => new Response('{"message":"Unauthorized"}', { status });
      await expectError('/api/diksha/search', 502, 'DIKSHA_AUTH_FAILED');
    }
  });

  it('upstream 404 -> 404', async () => {
    upstream = () => new Response('{}', { status: 404 });
    await expectError(`/api/diksha/content/${PDF_ID}`, 404, 'DIKSHA_NOT_FOUND');
  });

  it('upstream 429 -> 429 with Retry-After', async () => {
    upstream = () => new Response('{}', { status: 429, headers: { 'retry-after': '30' } });
    const res = await expectError('/api/diksha/search', 429, 'DIKSHA_RATE_LIMITED');
    assert.equal(res.headers.get('retry-after'), '30');
  });

  it('missing DIKSHA_API_BASE_URL -> 503', async () => {
    delete process.env.DIKSHA_API_BASE_URL;
    await expectError('/api/diksha/filters', 503, 'DIKSHA_NOT_CONFIGURED');
    assert.equal(calls.length, 0);
  });

  it('sends the API key only upstream, as a Bearer header', async () => {
    process.env.DIKSHA_API_KEY = API_KEY;
    const res = await get(`/api/diksha/content/${PDF_ID}`);
    assert.ok(!(await res.text()).includes(API_KEY));
    assert.equal(calls[0].init.headers.Authorization, `Bearer ${API_KEY}`);
  });
});

describe('content, hierarchy, filters, courses', () => {
  it('validates content ids', async () => {
    for (const id of ['abc', 'do_123', 'do_12345678901234567890x', '..%2F..%2Fetc']) {
      const res = await get(`/api/diksha/content/${id}`);
      assert.equal(res.status, 400, id);
    }
    assert.equal((await get('/api/diksha/collections/not-an-id/hierarchy')).status, 400);
    assert.equal(calls.length, 0);
  });

  it('reads content via v2 read', async () => {
    const body = await (await get(`/api/diksha/content/${PDF_ID}`)).json();
    assert.equal(body.data.id, PDF_ID);
    assert.equal(body.data.license, 'CC BY 4.0');
    assert.ok(calls[0].url.endsWith(`/api/content/v2/read/${PDF_ID}`));
  });

  it('returns a chapter tree', async () => {
    const body = await (await get(`/api/diksha/collections/${BOOK_ID}/hierarchy`)).json();
    assert.equal(body.data.root.isCollection, true);
    assert.equal(body.data.children.length, 2);
    assert.ok(calls[0].url.endsWith(`/api/course/v1/hierarchy/${BOOK_ID}`));
  });

  it('returns filter options from facets', async () => {
    const body = await (await get('/api/diksha/filters?board=cbse&grade=10')).json();
    assert.equal(body.success, true);
    assert.deepEqual(body.data.grades, ['Class 9', 'Class 10']);
    assert.ok(body.data.boards.some((b) => b.value === 'State (Madhya Pradesh)'));
    assert.ok(!body.data.boards.some((b) => b.value === 'Other'));
    assert.deepEqual(body.data.subjects.map((s) => s.value), ['Mathematics', 'Science']);
    assert.deepEqual(body.data.types.map((t) => t.key).sort(), ['pdf', 'question_set', 'textbook', 'video']);
  });

  it('applies the strict class filter to facet counts too', async () => {
    await get('/api/diksha/filters?board=cbse&grade=10');
    const scoped = calls.find((c) => c.body?.request.filters.gradeLevel);
    assert.deepEqual(scoped.body.request.filters.se_gradeLevels, { ne: ['class 9', 'others'] });
  });

  it('does not filter classes when no class is selected', async () => {
    await get('/api/diksha/search?board=cbse');
    assert.equal(searchCalls()[0].body.request.filters.se_gradeLevels, undefined);
  });

  it('searches courses with the Course primaryCategory', async () => {
    await get('/api/diksha/courses?board=cbse');
    assert.deepEqual(searchCalls()[0].body.request.filters.primaryCategory, ['Course']);
  });
});

describe('protected routes', () => {
  it('require a token (401 only from our own auth)', async () => {
    assert.equal((await get('/api/diksha/bookmarks')).status, 401);
    assert.equal((await send('POST', '/api/diksha/bookmarks', { contentId: PDF_ID })).status, 401);
    assert.equal((await get('/api/diksha/my-content')).status, 401);
    assert.equal((await get('/api/diksha/recently-viewed', { Authorization: 'Bearer nope' })).status, 401);
  });

  it('my-content uses the user\'s own board and class', async () => {
    const body = await (await get('/api/diksha/my-content?board=cbse', auth())).json();
    assert.equal(body.query.board, 'State (Madhya Pradesh)');
    assert.equal(body.query.grade, 'Class 10');
  });

  it('bookmark add is idempotent, list and delete work', async () => {
    await DikshaBookmark.deleteMany({});
    for (let i = 0; i < 2; i++) {
      const res = await send('POST', '/api/diksha/bookmarks', { contentId: PDF_ID }, auth());
      assert.equal(res.status, 200);
    }
    assert.equal(await DikshaBookmark.countDocuments({ user: userId }), 1);

    const list = await (await get('/api/diksha/bookmarks', auth())).json();
    assert.equal(list.data.length, 1);
    assert.equal(list.data[0].contentId, PDF_ID);
    assert.equal(list.data[0].title, 'Competency based education');
    assert.match(list.data[0].thumbnail, /^https:\/\/obj\.diksha\.gov\.in\//);
    assert.equal(list.data[0].license, 'CC BY 4.0');
    assert.deepEqual(list.data[0].attribution, { creator: 'Partner Content Creator', organisation: 'CBSE' });

    const del = await (await send('DELETE', `/api/diksha/bookmarks/${PDF_ID}`, null, auth())).json();
    assert.equal(del.data.removed, true);
    assert.equal((await (await get('/api/diksha/bookmarks', auth())).json()).data.length, 0);
  });

  it('rejects bad bookmark ids', async () => {
    assert.equal((await send('POST', '/api/diksha/bookmarks', { contentId: 'https://evil' }, auth())).status, 400);
    assert.equal((await send('DELETE', '/api/diksha/bookmarks/abc', null, auth())).status, 400);
  });

  it('recently viewed keeps only the newest 20', async () => {
    await DikshaRecentlyViewed.deleteMany({});
    const ids = Array.from({ length: 22 }, (_, i) => `do_3130822740159037441${String(i).padStart(4, '0')}`);
    for (const id of ids) {
      const res = await send('POST', '/api/diksha/recently-viewed', { contentId: id }, auth());
      assert.equal(res.status, 200);
    }
    // re-viewing an old one moves it to the top instead of duplicating
    await send('POST', '/api/diksha/recently-viewed', { contentId: ids[5] }, auth());

    const body = await (await get('/api/diksha/recently-viewed', auth())).json();
    assert.equal(body.data.length, 20);
    assert.equal(body.data[0].contentId, ids[5]);
    assert.equal(await DikshaRecentlyViewed.countDocuments({ user: userId }), 20);
  });
});

describe('rate limiter', () => {
  it('limits proxy routes to 60 requests per minute per IP', async () => {
    let last;
    for (let i = 0; i < 61; i++) last = await get(`/api/diksha/content/${PDF_ID}`);
    assert.equal(last.status, 429);
    assert.ok(last.headers.get('retry-after'));
  });
});
