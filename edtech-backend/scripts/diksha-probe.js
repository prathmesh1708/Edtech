// Phase 0 probe for the DIKSHA (Sunbird Knowlg) API contract.
// Usage: node scripts/diksha-probe.js
// Reads DIKSHA_API_BASE_URL and optional DIKSHA_API_KEY from .env / environment.
// Never prints the API key. Makes a handful of small requests only.
import dotenv from 'dotenv';

dotenv.config();

const BASE = (process.env.DIKSHA_API_BASE_URL || '').replace(/\/+$/, '');
const KEY = process.env.DIKSHA_API_KEY || '';
const TIMEOUT_MS = Number(process.env.DIKSHA_TIMEOUT_MS) || 15000;

if (!BASE) {
  console.error('DIKSHA_API_BASE_URL is not set.');
  process.exit(1);
}

const RATE_HEADER = /rate|limit|retry-after|quota/i;

const call = async (label, method, path, { body, auth = false } = {}) => {
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'StudyWisely-DikshaProbe/1.0 (+https://studywisely.in)',
  };
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && KEY) headers.Authorization = `Bearer ${KEY}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      redirect: 'manual',
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not JSON */ }

    const rateHeaders = {};
    res.headers.forEach((v, k) => { if (RATE_HEADER.test(k)) rateHeaders[k] = v; });

    console.log(`\n=== ${label} ===`);
    console.log(`${method} ${path}  auth=${auth && KEY ? 'bearer' : 'none'}`);
    console.log(`status=${res.status}  content-type=${res.headers.get('content-type')}  ${Date.now() - started}ms  bytes=${text.length}`);
    if (res.headers.get('location')) console.log(`location=${res.headers.get('location')}`);
    if (Object.keys(rateHeaders).length) console.log('rate headers:', rateHeaders);
    if (json) {
      console.log('top-level keys:', Object.keys(json));
      if (json.params) console.log('params:', json.params);
      if (json.result) console.log('result keys:', Object.keys(json.result));
    } else {
      console.log('body (first 200 chars):', text.slice(0, 200).replace(/\s+/g, ' '));
    }
    return { status: res.status, json, text };
  } catch (err) {
    console.log(`\n=== ${label} ===\n${method} ${path}  ERROR ${err.name}: ${err.message}`);
    return { status: 0, json: null, text: '' };
  } finally {
    clearTimeout(timer);
  }
};

const searchBody = {
  request: {
    filters: {
      status: ['Live'],
      primaryCategory: ['Digital Textbook'],
      board: ['CBSE'],
      gradeLevel: ['Class 10'],
    },
    limit: 3,
    facets: ['board', 'gradeLevel', 'subject', 'medium', 'primaryCategory'],
  },
};

const printFacets = (result) => {
  for (const f of result?.facets || []) {
    const values = (f.values || []).map((v) => `${v.name} (${v.count})`);
    console.log(`facet ${f.name} [${values.length}]: ${values.join(' | ')}`);
  }
};

const run = async (auth) => {
  console.log(`\n################ auth=${auth ? 'bearer' : 'none'} ################`);
  const search = await call('Composite search (textbook)', 'POST', '/api/content/v1/search', { body: searchBody, auth });
  const result = search.json?.result;
  if (!result) return;

  console.log('count:', result.count);
  const items = result.content || [];
  if (items[0]) {
    console.log('sample item keys:', Object.keys(items[0]).sort());
    const s = items[0];
    const pick = ['identifier', 'name', 'primaryCategory', 'contentType', 'mimeType', 'board', 'gradeLevel',
      'subject', 'medium', 'appIcon', 'posterImage', 'artifactUrl', 'streamingUrl', 'previewUrl', 'downloadUrl',
      'license', 'creator', 'organisation', 'channel', 'objectType'];
    for (const k of pick) if (k in s) console.log(`  ${k}:`, JSON.stringify(s[k]));
  }
  printFacets(result);

  // Wider facet sweep: no board/grade filter, so we see all board/grade strings.
  const all = await call('Facet sweep (no board/grade filter)', 'POST', '/api/content/v1/search', {
    auth,
    body: { request: { filters: { status: ['Live'] }, limit: 0, facets: searchBody.request.facets } },
  });
  printFacets(all.json?.result);

  // A non-collection resource, to see file URL fields.
  const leaf = await call('Composite search (PDF / video resources)', 'POST', '/api/content/v1/search', {
    auth,
    body: {
      request: {
        filters: { status: ['Live'], board: ['CBSE'], gradeLevel: ['Class 10'], mimeType: ['application/pdf', 'video/mp4', 'video/x-youtube'] },
        limit: 3,
      },
    },
  });
  const leafItem = leaf.json?.result?.content?.[0];
  if (leafItem) {
    console.log('leaf sample keys:', Object.keys(leafItem).sort());
    for (const k of ['identifier', 'mimeType', 'artifactUrl', 'streamingUrl', 'previewUrl', 'downloadUrl', 'license', 'creator', 'organisation', 'appIcon'])
      if (k in leafItem) console.log(`  ${k}:`, JSON.stringify(leafItem[k]));
  }

  const textbookId = items[0]?.identifier;
  const leafId = leafItem?.identifier;
  if (textbookId) console.log('\ntextbook id:', textbookId, ' leaf id:', leafId);

  for (const id of [leafId, textbookId].filter(Boolean)) {
    await call(`content v2 read ${id}`, 'GET', `/api/content/v2/read/${id}`, { auth });
    await call(`content v1 read ${id}`, 'GET', `/api/content/v1/read/${id}`, { auth });
  }
  if (textbookId) {
    await call('collection v1 read', 'GET', `/api/collection/v1/read/${textbookId}`, { auth });
    for (const p of ['/api/collection/v1/hierarchy/', '/api/course/v1/hierarchy/', '/api/content/v1/hierarchy/']) {
      const r = await call(`hierarchy ${p}`, 'GET', `${p}${textbookId}`, { auth });
      const h = r.json?.result?.content;
      if (h) {
        console.log('  hierarchy root keys:', Object.keys(h).sort());
        console.log('  children:', (h.children || []).length, 'first child keys:', h.children?.[0] && Object.keys(h.children[0]).sort());
      }
    }
  }

  // Candidate public play pages. A SPA returns 200 for any path, so compare with a fake id.
  if (!auth) {
    for (const [kind, id] of [['content', leafId], ['collection', textbookId], ['content', 'do_00000000000000000000']]) {
      if (id) await call(`play page /play/${kind}/${id}`, 'GET', `/play/${kind}/${id}`);
    }
  }
};

await run(false);
if (KEY) await run(true);
else console.log('\n(DIKSHA_API_KEY not set — skipped authenticated run)');
