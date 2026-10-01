# DIKSHA integration

Study Wisely shows free DIKSHA learning resources (textbooks, chapter PDFs, videos,
question sets, courses) matched to the student's own board and class. Every DIKSHA
call goes through our backend (`/api/diksha/*`); the React app never calls DIKSHA
directly.

DIKSHA runs on Sunbird ED, so the API contract is Sunbird Knowlg's
(<https://knowlg.sunbird.org>). Everything below was verified against
`https://diksha.gov.in` with `edtech-backend/scripts/diksha-probe.js` on 2026-10-01.

## Access status (read this first)

- The three endpoints we use answer **without any API key**.
- DIKSHA's Terms of Use (v15) do **not** explicitly grant third-party programmatic
  access to these endpoints, and no developer portal or key registration exists.
  Written permission should be requested from NCERT at
  `diksha17@ncert.nic.in`, covering:
  1. Server-side, cached, read-only use of `POST /api/content/v1/search`,
     `GET /api/content/v2/read/{id}`, `GET /api/course/v1/hierarchy/{id}`, or an
     API key / partner channel instead.
  2. The rate limit that applies to us.
  3. The official public link for a content id (see "Unsupported" below).
  4. Whether a paid app may link to CC BY-NC / CC BY-NC-ND items.
- If NCERT issues a key, put it in `DIKSHA_API_KEY`; it is then sent as
  `Authorization: Bearer <key>` (the Sunbird convention). No code change needed.

## Environment variables (`edtech-backend/.env`)

| Variable | Default | Notes |
|---|---|---|
| `DIKSHA_API_BASE_URL` | none | `https://diksha.gov.in`. Must be `https://`. If empty, all DIKSHA routes return **503** and the rest of the app works normally. |
| `DIKSHA_API_KEY` | empty | Only if NCERT issues one. Server-side only. Never in `VITE_*` vars. |
| `DIKSHA_TIMEOUT_MS` | `10000` | Per upstream request. DIKSHA latency varied from 0.5 s to 9 s during testing. |
| `DIKSHA_CACHE_TTL_SECONDS` | `600` | In-memory cache TTL. |

These are **not** in `scripts/check-env.js` `REQUIRED`; the server boots without
them. Nothing DIKSHA-related goes in the frontend `.env`.

## Our endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/diksha/filters?board=&grade=` | public | Boards, grades, subjects, mediums, content types (from facets) |
| GET | `/api/diksha/search?board=&grade=&subject=&medium=&type=&q=&page=&limit=` | public | Resource search |
| GET | `/api/diksha/my-content?subject=&type=&q=&page=&limit=` | student JWT | Search using the logged-in user's `board` + `classId` |
| GET | `/api/diksha/courses?board=&grade=&subject=&page=&limit=` | public | Courses (primaryCategory `Course`) |
| GET | `/api/diksha/content/:id` | public | One item |
| GET | `/api/diksha/collections/:id/hierarchy` | public | Textbook chapters / course units |
| POST | `/api/diksha/bookmarks` `{ contentId }` | student JWT | Add bookmark (idempotent upsert) |
| GET | `/api/diksha/bookmarks` | student JWT | List bookmarks |
| DELETE | `/api/diksha/bookmarks/:contentId` | student JWT | Remove bookmark |
| POST | `/api/diksha/recently-viewed` `{ contentId }` | student JWT | Record a view (keeps newest 20) |
| GET | `/api/diksha/recently-viewed` | student JWT | List recently viewed |

**Parameters**

- `board` and `grade` take this app's values (`cbse`, `CBSE`, `state-mp`, `MP Board`, `10`, `Class 10`).
- `type` is one of `textbook`, `video`, `pdf`, `course`, `question_set`.
- `q` is trimmed, max 100 chars.
- `page` is 1–100 and `limit` is 1–50 (default 20).
- Content ids must match `^do_\d{10,30}$`.

Anything else gets a **400** `INVALID_PARAMS`. The client never sends a URL: the
backend only calls `DIKSHA_API_BASE_URL` plus the fixed paths below.

**Rate limit:** the six proxy routes allow 60 requests per minute per IP
(`middleware/dikshaRateLimit.js`). Over the limit they return 429 with `Retry-After`.

## Mapping: our API → DIKSHA API → transformation

| Our endpoint | DIKSHA call(s) | Transformation |
|---|---|---|
| `/filters` | `POST /api/content/v1/search` with `limit: 0`, facets `board, gradeLevel, subject, medium, primaryCategory, mimeType`. One global call, plus one scoped to the board and grade. | Facets are turned into display-cased lists sorted by count. Grades keep only `Class 1`–`Class 12`. Type counts are summed from the primaryCategory/mimeType facets for each type group. |
| `/search`, `/my-content` | Global facet call (cached) to translate board/grade, then `POST /api/content/v1/search` with `filters`, `query`, `limit`, `offset = (page-1)*limit`, `fields`, `sort_by: { lastPublishedOn: 'desc' }` | Each `result.content[]` item goes through `normalizeItem`; `result.count` becomes `pagination.total`. |
| `/courses` | Same as search, with `primaryCategory: ['Course']` | Same |
| `/content/:id` | `GET /api/content/v2/read/{id}` | `result.content` goes through `normalizeItem` |
| `/collections/:id/hierarchy` | `GET /api/course/v1/hierarchy/{id}` (works for Digital Textbooks too) | Root goes through `normalizeItem`; `children` goes through recursive `normalizeHierarchy`, sorted by `index` |
| `POST /bookmarks`, `POST /recently-viewed` | `GET /api/content/v2/read/{id}` (usually cached) | Metadata is read server-side and stored in MongoDB. Never trusted from the client. |

Every search sends `status: ["Live"]` and `license: ["CC BY 4.0", "CC BY-SA 4.0"]`.
DIKSHA filters are case-insensitive. Facet values come back lower-case, while item
fields keep their original case.

**Endpoints tried and not used:**

| Endpoint | Probe result |
|---|---|
| `GET /api/collection/v1/read/{id}` | 401 |
| `GET /api/collection/v1/hierarchy/{id}` | 401 |
| `GET /api/content/v1/hierarchy/{id}` | 404 |
| `GET /api/content/v1/read/{id}` | 200, but Sunbird marks it for deprecation |

### Type groups

| `type` | DIKSHA filter |
|---|---|
| `textbook` | `primaryCategory: Digital Textbook` |
| `video` | `mimeType: video/mp4, video/webm, video/x-youtube` |
| `pdf` | `mimeType: application/pdf` |
| `course` | `primaryCategory: Course` |
| `question_set` | `primaryCategory: Practice Question Set, Exam Question Set, Exam Question, Question Paper` |

### Normalized item

Fields DIKSHA doesn't send are `null`, and multi-valued fields stay arrays. Example
from a real `GET /api/diksha/content/do_31308615245999308812975` response:

```json
{
  "success": true,
  "data": {
    "id": "do_31308615245999308812975",
    "name": "ANITA SHAW",
    "description": null,
    "type": "Explanation Content",
    "mimeType": "application/pdf",
    "board": "CBSE",
    "grade": ["Class 10"],
    "subject": ["Science"],
    "medium": ["English"],
    "language": ["English"],
    "thumbnail": "https://obj.diksha.gov.in/ntp-content-production/content/do_31308615245999308812975/artifact/do_31396700095333171213697_1704956171198_sssvv.thumb.thumb.thumb.png",
    "contentUrl": "https://obj.diksha.gov.in/ntp-content-production/content/do_31308615245999308812975/artifact/endocrine-system_1597430720283.pdf",
    "playUrl": null,
    "license": "CC BY 4.0",
    "attribution": { "creator": "Anita Shaw ASIAN INTERNATIONAL SCHOOL , HOWRAH", "organisation": null },
    "isCollection": false
  },
  "source": "DIKSHA"
}
```

A list response, for example `GET /api/diksha/search?board=state-ap&grade=9&limit=2`:

```json
{
  "success": true,
  "data": ["...normalized items..."],
  "pagination": { "page": 1, "limit": 2, "total": 2385 },
  "source": "DIKSHA",
  "query": { "board": "State (Andhra Pradesh)", "grade": "Class 9", "subject": null, "type": null, "q": null },
  "available": true
}
```

**Field sources**

| Our field | DIKSHA field |
|---|---|
| `id` | `identifier` |
| `type` | `primaryCategory` |
| `grade` | `gradeLevel` |
| `thumbnail` | `appIcon` |
| `license` | `license` |
| `attribution.creator` | `creator` |
| `attribution.organisation` | `organisation[]`, joined with `, ` |

`contentUrl` is set only when all of these hold:
- `artifactUrl` uses https on `*.diksha.gov.in`, or on YouTube for `video/x-youtube`.
- The mimeType is a directly openable file: pdf, mp4, webm, youtube or epub.
- The license is CC BY 4.0 or CC BY-SA 4.0.

Archive types (ecml / html / h5p `.zip`) and `.ecar` packages only open in the DIKSHA
app, so they get no link. Thumbnails must also be https on `*.diksha.gov.in`.

### Errors

DIKSHA errors are handled inside the controller and never reach the global
`errorHandler`, which would leak stack traces outside production. They come back as
`{ "success": false, "code": "...", "message": "..." }`:

| Condition | Status | `code` |
|---|---|---|
| `DIKSHA_API_BASE_URL` unset | 503 | `DIKSHA_NOT_CONFIGURED` |
| Upstream timeout | 504 | `DIKSHA_TIMEOUT` |
| Upstream 401 / 403 | **502** | `DIKSHA_AUTH_FAILED` |
| Upstream 404 | 404 | `DIKSHA_NOT_FOUND` |
| Upstream 429 | 429 (+ `Retry-After`) | `DIKSHA_RATE_LIMITED` |
| Upstream 5xx, network error, bad JSON | 502 | `DIKSHA_UNAVAILABLE` |

An upstream 401 must never become a 401. The frontend axios interceptor logs the user
out on **any** 401, so the only 401s come from our own `protect` middleware.

## Board / grade mapping

Implemented in `edtech-backend/utils/dikshaMapper.js`:

- **Board.** The app value goes through the existing `normBoard()`.
  - `cbse` maps to `CBSE`.
  - A state code maps to `State (<state name>)`.
  - The result must exist in the live `board` facet; otherwise the board is "not on DIKSHA".
  - `normBoard()` has its own codes for 10 states. The other 9 `STATE_BOARDS` ids
    (`state-ap`, `state-ts`, `state-kl`, `state-od`, `state-jh`, `state-cg`,
    `state-hr`, `state-uk`, `state-as`) come back as bare codes, so the mapper keeps a
    code → state-name table for all 19.
  - **Not mapped:** ICSE, IB, Cambridge and `Other`. DIKSHA has no IB or Cambridge,
    and its CISCE corpus had 0 Class 10 items. A generic profile value `State Board`
    has no state either, so it isn't mapped.
- **Grade.** The app value goes through `normClass()` to `Class N`, which must exist in
  the live `gradeLevel` facet.
- **No match.** `200 { success: true, data: [], available: false, reason: 'BOARD_NOT_ON_DIKSHA' | 'GRADE_NOT_ON_DIKSHA' }`.
  DIKSHA is not called, and the UI shows "Not available on DIKSHA for this board".
- **Study Materials page.** It starts from the profile's `board` and `classId`. When
  those resolve exactly, it uses `/my-content`. A generic `State Board` profile falls
  back to `selectedStateBoard` from `SyllabusContext`.

## Caching and limits

- In-memory TTL cache in `services/dikshaService.js`:
  - Up to 500 entries, LRU-ish eviction.
  - Keyed on method + path + request body.
  - Concurrent identical requests share one upstream call.
- Only transformed results are cached. A textbook hierarchy is ~640 KB raw but is
  trimmed before caching.
- The cache is per process, so pm2 cluster mode or restarts start cold. No Redis.
- DIKSHA returns `x-ratelimit-limit-hour: 500000`, which looks like a gateway-wide
  limit, not a per-client one.
- **Reverse proxy caveat.** The limiter keys on `req.ip`. If the API runs behind
  nginx or a load balancer without Express `trust proxy`, every user shares one
  60 req/min bucket. Enable `app.set('trust proxy', 1)` when deploying behind a proxy.

## Licensing and attribution rules

- **Attribution.** Every DIKSHA card and detail page renders `DikshaAttribution`:
  "Source: DIKSHA", the creator/organisation, and the item's license. Bookmarks store
  the license and attribution so saved cards show them too.
- **License filter.** Search and listings only return CC BY 4.0 and CC BY-SA 4.0
  items. The Phase 0 data also contained CC BY-NC-SA, CC BY-NC-ND and "Standard
  YouTube License" items. To change the allowed set, edit `ALLOWED_LICENSES` in
  `utils/dikshaMapper.js`; do that only after NCERT confirms what a paid app may show.
- **Chapter trees.** These show every chapter title and its own license. Direct links
  appear only for allowed licenses. Many NCERT chapter PDFs inside CC BY-SA textbooks
  are themselves CC BY-NC-ND, so they are listed but not linked.
- **No copying or re-hosting.** We store metadata only (ids, titles, types,
  thumbnail URL, license, attribution) and never file bodies.
- **External links.** These open in a new tab with `rel="noopener noreferrer"`.

## MongoDB

New collections, with no changes to existing schemas:

| Model | Fields | Indexes |
|---|---|---|
| `DikshaBookmark` | user, contentId, title, type, mimeType, board, grade, subject, thumbnail, license, creator, organisation, timestamps | unique `{ user, contentId }` |
| `DikshaRecentlyViewed` | user, contentId, title, type, viewedAt, timestamps | unique `{ user, contentId }`, `{ user, viewedAt: -1 }`; trimmed to 20 per user |

## Unsupported / not implemented

- **"Open on DIKSHA" play-page links.** `https://diksha.gov.in/play/content/{id}`
  returns the same SPA shell for any id, including fake ones, so the pattern couldn't
  be verified. `playUrl` is always `null` until DIKSHA confirms it. Items without a
  direct file link show "Find it in the DIKSHA app by its name".
- **Embedding or playing DIKSHA content inside Study Wisely.** No embeddable player
  has been confirmed.
- **"Other" content-type tab.** No verified negative filter exists. Use the "All" tab.
- **Authenticated Sunbird APIs** (`/api/collection/v1/*`): these return 401 without
  credentials.
- **Courses.** Few courses carry an allowed license (CBSE had one, for Class 7), so
  `/courses` often returns empty.

## Development

```bash
# probe the live contract (prints statuses, keys and facet values; never the key)
cd edtech-backend && DIKSHA_API_BASE_URL=https://diksha.gov.in node scripts/diksha-probe.js

# tests: node's built-in runner + in-memory MongoDB, DIKSHA calls stubbed
cd edtech-backend && npm test
```

**Files**

| Area | Files |
|---|---|
| Backend | `services/dikshaService.js`, `utils/dikshaMapper.js`, `controllers/dikshaController.js`, `routes/dikshaRoutes.js`, `middleware/dikshaRateLimit.js`, `models/DikshaBookmark.js`, `models/DikshaRecentlyViewed.js`, `tests/diksha.test.js` |
| Frontend | `src/models/services/dikshaService.js`, `src/controllers/useDikshaController.js`, `src/views/components/diksha/*` |
| Frontend pages | `src/views/pages/student/{StudyMaterials,StudyMaterialDetail,Bookmarks}` |
