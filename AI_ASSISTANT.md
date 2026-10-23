# AI Learning Assistant (AI Chat)

Study Wisely's personal AI tutor for Class 1–12 students, powered by Google Gemini.
Students ask doubts by **text**, **voice**, or **photo**, get step-by-step answers
that stream in live, and can ask follow-up questions in the same chat. They can also
take AI-generated **practice quizzes**. Admins get **AI usage insights** and an
**AI Safety Review** queue. Every Gemini call goes through our backend (`/api/ai/*`);
the React app never calls Gemini and never sees the API key.

## Before launch (read this first)

These are business/legal decisions, not code issues. The feature is safe to build and
test internally, but **do not open it to students until each item is resolved.**

1. **Gemini API terms vs. under-18 users.** The
   [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) say the API
   may not be used in a service "directed towards or likely to be accessed by
   individuals under the age of 18". That describes this platform. This applies to the
   Gemini API (AI Studio keys), free *and* paid. Options:
   - Ask Google for written confirmation for an education use case
     (developers are asking the same thing on the
     [Google AI forum](https://discuss.ai.google.dev/t/gemini-api-18-clause-can-an-education-app-for-students-use-it-where-to-get-a-written-answer/187078),
     with no public answer yet), or
   - Use Gemini through **Vertex AI** (Google Cloud terms) if Google Cloud sales confirm
     it is permitted for K-12 — this was **not** verified from public docs, or
   - Use another provider whose terms allow minors. Only
     `edtech-backend/services/geminiService.js` talks to the provider, so swapping it
     does not touch the controller, database, or UI.
2. **Free tier data use.** On the free tier, Google states prompts and responses are
   "used to improve our products"; on the paid tier they are not
   ([pricing page](https://ai.google.dev/gemini-api/docs/pricing)). Students' questions
   and photos should not go through the free tier in production.
3. **Free tier capacity.** Free quotas are per Google Cloud *project*, not per student
   (see [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits); live values at
   <https://aistudio.google.com/rate-limit>). Community reports suggest roughly 10
   requests/minute for Flash models — about one classroom. Expect `AI_BUSY` errors
   beyond that until billing is enabled.
4. **India DPDP Act 2023.** Processing children's data requires verifiable parental
   consent. Update the privacy policy (`/api/policies`) to name Google as an AI
   processor and describe what is stored (see "Storage and privacy").

## Setup

1. Create a key at <https://aistudio.google.com/apikey>. Both the classic `AIza…` format
   and the newer `AQ.…` format work with this endpoint (verified 2026-10-22).
2. In `edtech-backend/.env` set `GEMINI_API_KEY=...` (see table below).
3. Restart the backend. `GET /api/ai/status` should return `"enabled": true`.

Nothing AI-related goes in the frontend `.env`.

## Environment variables (`edtech-backend/.env`)

| Variable | Default | Notes |
|---|---|---|
| `GEMINI_API_KEY` | empty | Server-side only. If empty, AI routes return **503** and the rest of the app works normally. |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Main model. On the free tier each model has its own daily quota per project (`gemini-3.8-flash` allows only 20 requests/day, which runs out after a few students). 2.5 models are restricted to projects that already used them. |
| `GEMINI_FALLBACK_MODEL` | (empty) | Tried automatically when the main model answers 429 (quota) or stays at 500/503 (overloaded) after one retry. Recommended: `gemini-3.5-flash-lite`. |
| `GEMINI_TIMEOUT_MS` | `60000` | Whole-answer timeout for chat. |
| `GEMINI_QUIZ_TIMEOUT_MS` | `90000` | Quiz generation timeout. Quizzes always use `thinkingLevel: low` on Gemini 3.x (measured: 10 questions in 14–45 s). |
| `GEMINI_THINKING_LEVEL` | empty (model default) | Chat only, Gemini 3.x only: `low` answers faster, `high` reasons more. Ignored for 2.5 models (they reject it). |
| `GEMINI_RETRY_DELAY_MS` | `1500` | Wait before the single automatic retry on Google 500/503 ("high demand") errors. |
| `GEMINI_MAX_OUTPUT_TOKENS` | `4096` | Upper bound per answer. |
| `AI_RATE_LIMIT_PER_MINUTE` | `6` | Per student, in memory. |
| `AI_DAILY_LIMIT_PER_USER` | `50` | Per student per IST day: chat questions + generated quizzes, counted from MongoDB. `0` = unlimited (only sensible on a paid tier). |
| `GEMINI_API_BASE_URL` | `https://generativelanguage.googleapis.com` | Override only for tests. |

These are not in `scripts/check-env.js` `REQUIRED`; the server boots without them.

## Architecture

```
Student page ──"Ask AI"──▶ AI Chat page (React)
                              │  text / voice / photo
                              ▼
                 POST /api/ai/chat  (JWT, rate limit, daily cap)
                              │  system prompt built from the *account's* class & board
                              │  + chapter details loaded from MongoDB
                              ▼
               geminiService ──SSE──▶ Gemini streamGenerateContent
                              │
                 SSE back to browser (tokens appear as generated)
                              │
                 AITutorChat document saved (text only)
```

### Backend files

| File | Role |
|---|---|
| `services/geminiService.js` | REST client for Gemini: streaming chat and JSON (quiz) generation; typed `GeminiError`; strict safety settings. The only provider-specific file. |
| `utils/aiTutorPrompt.js` | Chat system instruction (class-level adaptation, formatting, minor-safety rules, page context), history → Gemini `contents`, quiz prompt + JSON schema. |
| `utils/aiCommon.js` | Shared error mapping, input readers, daily limit. |
| `utils/aiSafety.js` | Self-harm / abuse phrase detection (English, Hinglish, Hindi). |
| `services/aiSafetyService.js` | Records/dedupes safety flags; push to admins for urgent ones. |
| `controllers/aiTutorController.js` | Chat: validation, conversation CRUD, SSE streaming, safety flagging. |
| `controllers/aiPracticeController.js` | Practice quizzes: generate, validate model output, grade. |
| `controllers/aiAdminController.js` | Admin insights aggregation; safety flag list/detail/review. |
| `middleware/aiRateLimit.js` | Per-student per-minute limiter. |
| `routes/aiTutorRoutes.js` | Mounted at `/api/ai`, all routes behind `protect`; `/admin/*` also `authorize('admin')`. |
| `models/AITutorChat.js` | Existing (previously unused) model, extended: title, subject, context, message status/input mode. |
| `models/PracticeQuiz.js` | Quiz questions + answer key, responses, score. |
| `models/AISafetyFlag.js` | Flag: student, conversation, reason, severity, excerpt, occurrences, review status/note. |
| `services/pushService.js` | New `'Admins'` target (admin devices only). |
| `controllers/studentController.js` | Dashboard `aiQueriesCount` is now the real number of AI questions. |
| `server.js` | Mounts the routes; `/api/ai` gets a 10 MB JSON body limit (photos/voice as base64). |

### Frontend files

| File | Role |
|---|---|
| `src/views/pages/student/AIChat/AIChat.jsx` | The AI Chat module page (route `/student/dashboard/ai-chat`, sidebar item "AI Chat"). |
| `.../AIChat/components/ConversationList.jsx` | Chat history with subject filter, rename, delete. Drawer on mobile. |
| `.../AIChat/components/MessageBubble.jsx` | Message with copy, read-aloud, retry, stopped/error states. |
| `.../AIChat/components/ChatComposer.jsx` | Text box, photo (gallery + camera on phones), voice (EN/Hindi), send/stop. |
| `.../AIChat/components/MarkdownMessage.jsx` | Dependency-free Markdown renderer; builds React elements, never `innerHTML`. |
| `.../AIChat/aiChatConfig.js` | Subjects, class-level starter questions. |
| `src/controllers/useAITutorController.js` | Chat state and streaming (replaces the old hard-coded mock). |
| `src/models/services/aiTutorService.js` | API calls; `fetch` + stream reader for SSE (axios cannot stream in browsers). |
| `src/hooks/useSpeechRecognition.js` | Voice → text with the browser's free Web Speech API (Chrome, Edge, Safari). |
| `src/hooks/useAudioRecorder.js` | Fallback (e.g. Firefox): records a clip that Gemini transcribes and answers. |
| `src/hooks/useSpeechSynthesis.js` | Reads answers aloud (Indian English / Hindi voices). |
| `src/utils/aiAttachments.js` | Shrinks photos to ≤1600 px JPEG in the browser before upload. |
| `src/views/components/common/AskAIButton/AskAIButton.jsx` | Opens AI Chat (or, with `practice`, a Practice Quiz) scoped to the current page. |
| `src/views/pages/student/AIPractice/AIPractice.jsx` | Practice Quiz page (`/student/dashboard/ai-practice`): setup, quiz, results, history. |
| `src/controllers/usePracticeQuizController.js` | Quiz state (setup → generating → quiz → results). |
| `admin_panel/admin/views/pages/Analytics/AITutorInsights.jsx` | "AI Tutor Insights" section at the bottom of Admin → Analytics. |
| `admin_panel/admin/views/pages/AISafetyReview/AISafetyReview.jsx` | Admin → AI Safety Review (`/admin/ai-safety`). |
| `src/models/services/aiAdminService.js` | Admin AI API calls. |

The old `/student/dashboard/ai-tutor` URL redirects to AI Chat.

## Integration points ("available throughout the app")

| Page | Entry point | Context passed |
|---|---|---|
| Student dashboard | "Stuck on a doubt?" card: Ask AI / Practice; "AI Doubts Asked" stat | none |
| Sidebar / bottom nav | "AI Chat" | none |
| AI Chat header | "Practice" | the chat's subject / chapter |
| Subject detail | "Ask AI a {subject} doubt", "{subject} practice quiz" | subject |
| Chapter view | "Ask AI about this chapter", "Practice quiz" | subject, chapterId, chapterName |
| Practice results | "Ask AI to explain this" on each wrong answer | quiz scope + pre-filled question |
| Chapter view, each topic | ✨ icon | + topic, pre-filled "Explain {topic} step by step" |
| Study material (DIKSHA) | "Ask AI about this" | subject, materialId, materialTitle |

To add another, render `<AskAIButton subject=... context={{...}} prefill="..." />` or
`navigate(ROUTES.AI_CHAT, { state: { subject, context, prefill } })`.

Chapter details (name, description, learning objectives) are re-read from MongoDB on
the server when `chapterId` is a real id, so the client cannot inject them.

## Our endpoints

All require `Authorization: Bearer <jwt>`.

| Method | Path | Body / query | Response |
|---|---|---|---|
| GET | `/api/ai/status` | – | `{ enabled, model, limits: { perDay, usedToday }, attachments }` |
| POST | `/api/ai/chat` | `{ conversationId?, message?, inputMode?: text\|voice\|image, attachment?: { mimeType, data(base64) }, subject?, context? }` | SSE stream (below) |
| GET | `/api/ai/conversations` | `?subject=&limit=` (≤100) | `{ conversations: [summary] }` (no messages) |
| GET | `/api/ai/conversations/:id` | – | `{ conversation: { ...summary, messages } }` |
| PATCH | `/api/ai/conversations/:id` | `{ title }` | `{ conversation }` |
| DELETE | `/api/ai/conversations/:id` | – | `{ success: true }` |

| POST | `/api/ai/practice/quizzes` | `{ subject?, context?: { chapterId?, chapterName?, topic? }, difficulty?: easy\|medium\|hard, count?: 5\|10 }` | `201 { quiz }` — questions **without** answers |
| GET | `/api/ai/practice/quizzes` | `?limit=` (≤50) | `{ quizzes: [summary] }` |
| GET | `/api/ai/practice/quizzes/:id` | – | `{ quiz }` (answers only once submitted) |
| POST | `/api/ai/practice/quizzes/:id/submit` | `{ answers: [0-3 or null, ...] }` | `{ quiz }` with score, answers, explanations |
| GET | `/api/ai/admin/insights` | `?range=7d\|30d\|90d` | totals, daily series, input modes, subjects, topics, classes, peak hours, quiz stats, open flags |
| GET | `/api/ai/admin/flags` | `?status=open\|resolved\|dismissed\|all&page=&limit=` | `{ flags, total, counts: { open, urgentOpen } }` (urgent first) |
| GET | `/api/ai/admin/flags/:id` | – | `{ flag, conversation: { title, subject, messages } }` (up to 10 messages ending at the flagged one) |
| PATCH | `/api/ai/admin/flags/:id` | `{ status?: open\|resolved\|dismissed, note? }` | `{ flag }` (records reviewer + time) |

Only the owner can read, continue, rename or delete a conversation or quiz (others get
404). `/api/ai/admin/*` needs an admin account (students get 403).

### Streaming protocol (`POST /api/ai/chat`)

Validation, limit, and Gemini set-up failures return normal JSON errors. Once Gemini
accepts the request, the response is `text/event-stream`:

```
event: meta    data: { conversationId, userMessage, title }
event: delta   data: { text }                 (repeated)
event: replace data: { text }                 (safety block: replaces partial text)
event: error   data: { code, message }        (stream failed part-way; partial text kept)
event: done    data: { message, conversation }
```

If the student presses **Stop** (or closes the tab), the backend aborts the Gemini
request and saves the partial answer with `status: "stopped"`.

### Errors

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_PARAMS` | empty message, bad file type/size, message > 4000 chars |
| 400 | `AI_BAD_INPUT` | Gemini could not process the input (e.g. unreadable photo) |
| 403 | `ACCOUNT_INACTIVE` | student status Inactive/Suspended/Blocked |
| 404 | `NOT_FOUND` | conversation missing or not yours |
| 409 | `AI_CHAT_FULL` | 200 messages in one chat; start a new one |
| 409 | `QUIZ_SUBMITTED` | quiz already submitted |
| 422 | `AI_BLOCKED` | Gemini refused to make a quiz on that scope |
| 429 | `AI_RATE_LIMITED` / `AI_DAILY_LIMIT` | our per-student limits |
| 429 | `AI_BUSY` | Gemini quota exhausted (passes `Retry-After`) |
| 502 | `AI_UNAVAILABLE` | Gemini auth/5xx/bad response. **Never 401** — the frontend logs users out on any 401. |
| 503 | `AI_NOT_CONFIGURED` | no `GEMINI_API_KEY` |
| 504 | `AI_TIMEOUT` | answer took longer than `GEMINI_TIMEOUT_MS` |

## Tutor behaviour (system prompt)

`utils/aiTutorPrompt.js` builds the instruction from the **authenticated user's**
class and board, never from the request:

- Class 1–2 / 3–5 / 6–8 / 9–10 / 11–12 each get a different explanation level
  (Class 11–12 includes JEE/NEET-foundation depth).
- Step-by-step solutions; definition → explanation → example for concepts; an optional
  "check your understanding" question.
- Replies in the student's language (English, Hindi, Hinglish).
- Maths in plain Unicode (x², √, ½), not LaTeX, so no maths library is needed.
- Photo / voice answers begin with `> Question in image: …` / `> You asked: …`. That
  line confirms what the AI read, becomes the chat title, and keeps follow-ups working
  even though photos/audio are not stored.
- Minor-safety: studies only, never asks for personal information, refuses harmful
  content, points to a trusted adult and Childline **1098** on self-harm/abuse, ignores
  instructions hidden in messages or images.
- Gemini safety settings are `BLOCK_LOW_AND_ABOVE` for all four categories. A blocked
  answer is replaced with a friendly redirect back to studying.

## Practice mode

- Gemini returns questions as JSON (`responseMimeType: application/json` + schema).
  The server keeps only well-formed questions: exactly 4 distinct options, one valid
  `answerIndex`, no duplicates, stray "A)" prefixes stripped. If fewer than half
  survive, the request fails with 502 and nothing is saved.
- The answer key stays on the server until submission; grading is done on the server
  from that key (no second AI call, so it costs no quota and can't be gamed in devtools).
- Chapter details are loaded from MongoDB when `chapterId` is a real id, as in chat.
- Each generated quiz counts as one request toward the daily limit and shares the
  per-minute limiter.

## AI Safety Review

Flags are created automatically after a chat answer is saved:

| Reason | Severity | Trigger |
|---|---|---|
| `self_harm` | urgent | First-person self-harm phrases in the student's text, or in the AI's `> You asked:` / `> Question in image:` restatement (so voice and photo are covered). English, Hinglish, Hindi. |
| `abuse` | urgent | First-person abuse phrases ("touches me in a bad way", "beats me every day", …). |
| `blocked` | normal | Gemini's safety filter blocked the answer. |

- Detection (`utils/aiSafety.js`) is deliberately narrow (first person, explicit) so
  study questions like "what is drug abuse?" don't flag. It is a triage aid for humans,
  not a classifier — expect some misses and some false alarms; extend the phrase list as
  you learn from real flags.
- Repeats in the same conversation for the same reason update one open flag
  (`occurrences`, latest excerpt) instead of creating many.
- New **urgent** flags send a push to admin devices only (`'Admins'` target). The push
  contains no student name or message text, because lock screens are visible to others.
- Admins review in **AI Safety Review**: urgent first, the conversation around the
  flagged message, recommended action (safeguarding lead, parent/guardian, 112,
  Childline 1098), a review note, and Resolve / Dismiss / Reopen. The reviewer's name
  and time are stored.
- **Decide internally who may open this page.** It shows minors' messages. Today any
  admin account can; restrict it to your designated safeguarding staff if you add
  admin roles later.

## Admin AI insights

Admin → Analytics ends with an **AI Tutor Insights** section that follows the page's
time-range filter (7/30/90 days; "Year to date" shows the last 90 days): questions,
active students, questions per student, practice quizzes and average score, open safety
flags, a daily chart, typed/voice/photo split, questions by class, busiest hours (IST),
top subjects, and the most-asked chapters/topics (from "Ask AI" on chapter pages). All
numbers come from one aggregation over `AITutorChat` plus `PracticeQuiz` and
`AISafetyFlag` counts.

## Storage and privacy

- `AITutorChat` stores question/answer **text**, subject, page context, and for
  attachments only `{ kind, mimeType }`. Photos and recordings are sent to Gemini for
  that single turn and **never saved** by us.
- The last 20 messages are sent to Gemini as context for follow-ups.
- Students can delete any chat (hard delete). A safety flag keeps its excerpt (≤500
  chars) even if the chat is deleted, so a safeguarding concern is not lost.
- Admins can read flagged conversations (see AI Safety Review); mention this in the
  privacy policy.
- The API key never leaves the backend (sent as the `x-goog-api-key` header, never in
  URLs, never in responses — covered by tests).

## Limits

- Text: 4000 characters. Photo: 4 MB after in-browser compression (JPEG/PNG/WEBP/HEIC).
  Voice: 6 MB / 60 seconds.
- Per-minute limit is in memory (fine for the single PM2 instance in
  `ecosystem.config.cjs`; move to Redis if you scale out). The daily limit is counted from
  MongoDB and survives restarts.

## Development

```bash
cd edtech-backend
npm test        # node:test + in-memory MongoDB; Gemini is stubbed via globalThis.fetch
```

`tests/aiTutor.test.js` covers streaming, history, ownership, attachments, validation,
error mapping (incl. never-401), safety blocks, mid-stream failure, both limits, chapter
context from the DB, CRUD, and key-leak checks. `tests/aiExtras.test.js` covers safety
detection (incl. study-question false positives), flag creation/dedupe/voice, admin-only
access, flag review, insights numbers, quiz generation without answer leaks, output
sanitizing, server grading, and quizzes counting toward the daily limit.

Manual check without a key: leave `GEMINI_API_KEY` empty and open AI Chat — it shows
"not available" and the rest of the portal works.

## Phase 2 ideas (not implemented)

- **Grounded answers**: retrieve the chapter's own notes / study material text and add it
  to the prompt, so answers follow the platform's content.
- **Photo follow-ups**: upload images to the Gemini Files API (48 h) so later questions
  can re-read the photo, not just the AI's restatement.
- **Parent view**: weekly summary of topics the child asked about.
- **Short-answer practice**: free-text questions graded by the AI (costs a second call).
- **Safety detection by the model**: ask Gemini to classify risk alongside the answer to
  catch phrasing the phrase list misses.
