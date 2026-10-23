// AI tutor integration tests. Run with: npm test
// Builds a fresh express app that mounts only aiTutorRoutes (server.js is never imported),
// stubs outbound Gemini calls via globalThis.fetch, and uses an in-memory MongoDB.
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import aiTutorRoutes from '../routes/aiTutorRoutes.js';
import { resetAiRateLimit } from '../middleware/aiRateLimit.js';
import { parseChunk } from '../services/geminiService.js';
import { parseClassNumber, toGeminiContents, titleFromReply, buildSystemInstruction } from '../utils/aiTutorPrompt.js';
import User from '../models/User.js';
import Chapter from '../models/Chapter.js';
import AITutorChat from '../models/AITutorChat.js';

const BASE = 'https://gemini.example.test';
const API_KEY = 'AIza-test-gemini-key-should-never-leak';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'development'; // the global errorHandler would expose stacks here

// A tiny valid base64 payload standing in for a JPEG.
const IMAGE_B64 = Buffer.from('fake-jpeg-bytes').toString('base64');

// ---- fetch stub ----
const realFetch = globalThis.fetch;
let calls = [];
let upstream;

const sseChunk = (text, extra = {}) => ({ candidates: [{ content: { role: 'model', parts: [{ text }] }, ...extra }] });

const sseResponse = (payloads, { failAfter = false } = {}) => {
  const encoder = new TextEncoder();
  const queue = payloads.map((p) => encoder.encode(`data: ${JSON.stringify(p)}\r\n\r\n`));
  // Pull-based so a failure arrives after the earlier chunks were read, like a dropped connection.
  const body = new ReadableStream({
    pull(controller) {
      if (queue.length) controller.enqueue(queue.shift());
      else if (failAfter) controller.error(new Error('connection reset'));
      else controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
};

const defaultUpstream = () =>
  sseResponse([sseChunk('**Step 1:** Factorise. '), sseChunk('x = 2 or x = 3.', { finishReason: 'STOP' })]);

globalThis.fetch = async (url, init = {}) => {
  if (String(url).startsWith(BASE)) {
    calls.push({ url: String(url), init, body: JSON.parse(init.body) });
    return upstream(String(url), init);
  }
  return realFetch(url, init);
};

// ---- app / db ----
let mongod;
let server;
let baseUrl;
let token;
let otherToken;
let userId;

const send = (method, path, body, headers = {}) =>
  realFetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
const auth = (t = token) => ({ Authorization: `Bearer ${t}` });

// Reads a whole SSE response into [{ event, data }].
const readEvents = async (res) => {
  const text = await res.text();
  return text
    .split('\n\n')
    .filter(Boolean)
    .map((block) => {
      const event = block.match(/^event: (.+)$/m)?.[1];
      const data = block.match(/^data: (.+)$/m)?.[1];
      return { event, data: data ? JSON.parse(data) : null };
    });
};

const chat = (body, t) => send('POST', '/api/ai/chat', body, auth(t));

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await AITutorChat.init();

  const user = await User.create({ name: 'Aarav Sharma', password: 'secret123', board: 'CBSE', classId: '10' });
  const other = await User.create({ name: 'Other Student', password: 'secret123', board: 'CBSE', classId: '4' });
  userId = user._id;
  token = jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: '1h' });
  otherToken = jwt.sign({ id: String(other._id) }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const app = express();
  app.use('/api/ai', express.json({ limit: '10mb' }));
  app.use('/api/ai', aiTutorRoutes);
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
  globalThis.fetch = realFetch;
});

beforeEach(async () => {
  process.env.GEMINI_API_BASE_URL = BASE;
  process.env.GEMINI_API_KEY = API_KEY;
  process.env.GEMINI_MODEL = 'gemini-test-flash';
  process.env.GEMINI_TIMEOUT_MS = '2000';
  process.env.GEMINI_RETRY_DELAY_MS = '0';
  delete process.env.GEMINI_THINKING_LEVEL;
  delete process.env.GEMINI_FALLBACK_MODEL;
  process.env.AI_RATE_LIMIT_PER_MINUTE = '100';
  process.env.AI_DAILY_LIMIT_PER_USER = '0';
  calls = [];
  upstream = defaultUpstream;
  resetAiRateLimit();
  await AITutorChat.deleteMany({});
});

// ---- prompt helpers ----
describe('prompt helpers', () => {
  it('parses class numbers from the formats stored on users', () => {
    assert.equal(parseClassNumber('10'), 10);
    assert.equal(parseClassNumber('Class 7'), 7);
    assert.equal(parseClassNumber('12th'), 12);
    assert.equal(parseClassNumber(''), null);
    assert.equal(parseClassNumber('13'), null);
  });

  it('adapts the instruction to the class level and adds study context', () => {
    const young = buildSystemInstruction({ student: { classId: '2', board: 'CBSE' } });
    const senior = buildSystemInstruction({ student: { classId: '12', board: 'CBSE' }, subject: 'Physics', context: { chapterName: 'Electrostatics' } });
    assert.match(young, /very short sentences/);
    assert.match(senior, /JEE\/NEET/);
    assert.match(senior, /Subject: Physics/);
    assert.match(senior, /Chapter: Electrostatics/);
    assert.doesNotMatch(young, /Current study context/);
  });

  it('builds contents: drops a leading model turn, placeholders for attachment-only turns', () => {
    const contents = toGeminiContents(
      [
        { sender: 'ai', text: 'Welcome!' },
        { sender: 'user', text: '', attachments: [{ kind: 'image' }] },
        { sender: 'ai', text: '> Question in image: 2x = 4' },
      ],
      { text: 'why?' }
    );
    assert.deepEqual(contents.map((c) => c.role), ['user', 'model', 'user']);
    assert.match(contents[0].parts[0].text, /sent a photo/);
    assert.equal(contents[2].parts[0].text, 'why?');
  });

  it('takes a title from the restated image / voice question', () => {
    assert.equal(titleFromReply('> Question in image: Solve **x² − 5x + 6 = 0**\n\nStep 1'), 'Solve x² − 5x + 6 = 0');
    assert.equal(titleFromReply('> You asked: what is osmosis'), 'what is osmosis');
    assert.equal(titleFromReply('Plain answer'), '');
  });

  it('ignores thought parts and flags safety blocks', () => {
    const chunk = parseChunk({ candidates: [{ content: { parts: [{ text: 'hidden', thought: true }, { text: 'shown' }] } }] });
    assert.equal(chunk.text, 'shown');
    assert.equal(parseChunk({ promptFeedback: { blockReason: 'SAFETY' } }).blocked, true);
    assert.equal(parseChunk(sseChunk('', { finishReason: 'SAFETY' })).blocked, true);
  });
});

// ---- POST /chat ----
describe('POST /api/ai/chat', () => {
  it('requires a signed-in user', async () => {
    const res = await send('POST', '/api/ai/chat', { message: 'hi' });
    assert.equal(res.status, 401);
    assert.equal(calls.length, 0);
  });

  it('returns 503 and saves nothing when no API key is configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await chat({ message: 'What is osmosis?' });
    assert.equal(res.status, 503);
    assert.equal((await res.json()).code, 'AI_NOT_CONFIGURED');
    assert.equal(await AITutorChat.countDocuments(), 0);
  });

  it('streams the answer and saves both turns', async () => {
    const res = await chat({ message: 'Solve x² − 5x + 6 = 0', subject: 'Mathematics' });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/event-stream/);
    const events = await readEvents(res);
    assert.deepEqual(events.map((e) => e.event), ['meta', 'delta', 'delta', 'done']);
    assert.equal(events.filter((e) => e.event === 'delta').map((e) => e.data.text).join(''), '**Step 1:** Factorise. x = 2 or x = 3.');

    const done = events.at(-1).data;
    assert.equal(done.message.sender, 'ai');
    assert.equal(done.message.status, 'complete');
    assert.equal(done.conversation.subject, 'Mathematics');
    assert.equal(done.conversation.title, 'Solve x² − 5x + 6 = 0');

    const saved = await AITutorChat.findById(done.conversation.id);
    assert.deepEqual(saved.messages.map((m) => m.sender), ['user', 'ai']);
    assert.equal(String(saved.user), String(userId));
  });

  it('sends the key in a header, strict safety settings, and the student class from the account', async () => {
    const res = await chat({ message: 'hi', context: { topic: 'Quadratics' } });
    await res.text();
    const [call] = calls;
    assert.match(call.url, /\/v1beta\/models\/gemini-test-flash:streamGenerateContent\?alt=sse$/);
    assert.equal(call.init.headers['x-goog-api-key'], API_KEY);
    assert.ok(!call.url.includes(API_KEY));
    assert.ok(call.body.safetySettings.every((s) => s.threshold === 'BLOCK_LOW_AND_ABOVE'));
    const instruction = call.body.systemInstruction.parts[0].text;
    assert.match(instruction, /Class: 10\. Board: CBSE/);
    assert.match(instruction, /Topic: Quadratics/);
  });

  it('never leaks the API key to the client', async () => {
    const res = await chat({ message: 'hi' });
    const body = await res.text();
    assert.ok(!body.includes(API_KEY));
  });

  it('continues a conversation with its history', async () => {
    const first = await readEvents(await chat({ message: 'What is osmosis?' }));
    const conversationId = first.at(-1).data.conversation.id;
    await (await chat({ conversationId, message: 'Give an example' })).text();

    const contents = calls[1].body.contents;
    assert.deepEqual(contents.map((c) => c.role), ['user', 'model', 'user']);
    assert.equal(contents[0].parts[0].text, 'What is osmosis?');
    const saved = await AITutorChat.findById(conversationId);
    assert.equal(saved.messages.length, 4);
  });

  it("refuses to continue another student's conversation", async () => {
    const first = await readEvents(await chat({ message: 'mine' }));
    const res = await chat({ conversationId: first.at(-1).data.conversation.id, message: 'hijack' }, otherToken);
    assert.equal(res.status, 404);
  });

  it('passes a photo inline for that turn only and stores just its type', async () => {
    upstream = () => sseResponse([sseChunk('> Question in image: 2x + 3 = 7\n\nx = 2', { finishReason: 'STOP' })]);
    const events = await readEvents(await chat({ attachment: { mimeType: 'image/jpeg', data: IMAGE_B64 }, inputMode: 'image' }));
    const parts = calls[0].body.contents.at(-1).parts;
    assert.deepEqual(parts[0], { inlineData: { mimeType: 'image/jpeg', data: IMAGE_B64 } });
    assert.ok(parts[1].text);

    const done = events.at(-1).data;
    assert.equal(done.conversation.title, '2x + 3 = 7');
    const saved = await AITutorChat.findById(done.conversation.id).lean();
    assert.deepEqual(saved.messages[0].attachments, [{ kind: 'image', mimeType: 'image/jpeg' }]);
    assert.ok(!JSON.stringify(saved).includes(IMAGE_B64));
  });

  it('rejects empty messages, unsupported files and oversized photos', async () => {
    for (const body of [
      {},
      { message: '   ' },
      { attachment: { mimeType: 'application/pdf', data: IMAGE_B64 } },
      { attachment: { mimeType: 'image/png', data: 'not base64!' } },
      { attachment: { mimeType: 'image/png', data: 'A'.repeat(6 * 1024 * 1024) } },
      { message: 'x'.repeat(4001) },
      { message: 'hi', inputMode: 'telepathy' },
      { message: 'hi', conversationId: 'nope' },
    ]) {
      const res = await chat(body);
      assert.equal(res.status, 400, JSON.stringify(body).slice(0, 80));
    }
    assert.equal(calls.length, 0);
  });

  it('maps upstream auth failures to 502, never 401', async () => {
    upstream = () => new Response('{"error":{}}', { status: 403 });
    const res = await chat({ message: 'hi' });
    assert.equal(res.status, 502);
    assert.equal((await res.json()).code, 'AI_UNAVAILABLE');
  });

  it('retries once when Gemini is briefly overloaded', async () => {
    let n = 0;
    upstream = () => (n++ === 0 ? new Response('{"error":{"status":"UNAVAILABLE"}}', { status: 503 }) : defaultUpstream());
    const res = await chat({ message: 'hi' });
    assert.equal(res.status, 200);
    await res.text();
    assert.equal(calls.length, 2);
  });

  it('gives up after one retry', async () => {
    upstream = () => new Response('{"error":{}}', { status: 503 });
    const res = await chat({ message: 'hi' });
    assert.equal(res.status, 502);
    assert.equal(calls.length, 2);
    assert.equal(await AITutorChat.countDocuments(), 0);
  });

  it('falls back to the second model when the main one is out of quota', async () => {
    process.env.GEMINI_FALLBACK_MODEL = 'gemini-test-lite';
    upstream = (url) => (url.includes('gemini-test-flash') ? new Response('{"error":{}}', { status: 429 }) : defaultUpstream());
    const res = await chat({ message: 'hi' });
    assert.equal(res.status, 200);
    await res.text();
    assert.deepEqual(calls.map((c) => c.url.match(/models\/([^:]+)/)[1]), ['gemini-test-flash', 'gemini-test-lite']);
  });

  it('falls back after the retry when the main model stays overloaded', async () => {
    process.env.GEMINI_FALLBACK_MODEL = 'gemini-test-lite';
    upstream = (url) => (url.includes('gemini-test-flash') ? new Response('{"error":{}}', { status: 503 }) : defaultUpstream());
    const res = await chat({ message: 'hi' });
    assert.equal(res.status, 200);
    await res.text();
    assert.equal(calls.length, 3);
  });

  it('does not fall back on errors another model would not fix', async () => {
    process.env.GEMINI_FALLBACK_MODEL = 'gemini-test-lite';
    upstream = () => new Response('{"error":{}}', { status: 400 });
    assert.equal((await chat({ message: 'hi' })).status, 400);
    assert.equal(calls.length, 1);
  });

  it('sends a thinking level only to Gemini 3 models', async () => {
    process.env.GEMINI_THINKING_LEVEL = 'low';
    process.env.GEMINI_MODEL = 'gemini-3.8-flash';
    await (await chat({ message: 'hi' })).text();
    process.env.GEMINI_MODEL = 'gemini-2.5-flash';
    await (await chat({ message: 'hi' })).text();
    assert.deepEqual(calls[0].body.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
    assert.equal(calls[1].body.generationConfig.thinkingConfig, undefined);
  });

  it('maps upstream quota errors to a friendly 429', async () => {
    upstream = () => new Response('{"error":{}}', { status: 429, headers: { 'retry-after': '30' } });
    const res = await chat({ message: 'hi' });
    assert.equal(res.status, 429);
    assert.equal(res.headers.get('retry-after'), '30');
    assert.equal((await res.json()).code, 'AI_BUSY');
    assert.equal(await AITutorChat.countDocuments(), 0);
  });

  it('replaces a safety-blocked answer with a redirect back to studying', async () => {
    upstream = () => sseResponse([sseChunk('partial', {}), sseChunk('', { finishReason: 'SAFETY' })]);
    const events = await readEvents(await chat({ message: 'something unsafe' }));
    assert.ok(events.some((e) => e.event === 'replace'));
    const done = events.at(-1).data;
    assert.equal(done.message.status, 'blocked');
    assert.match(done.message.text, /back to studying/);
  });

  it('keeps the partial answer and reports an error when the stream breaks', async () => {
    upstream = () => sseResponse([sseChunk('Half an answer')], { failAfter: true });
    const events = await readEvents(await chat({ message: 'hi' }));
    assert.deepEqual(events.map((e) => e.event), ['meta', 'delta', 'error', 'done']);
    assert.equal(events.at(-1).data.message.status, 'error');
    assert.equal(events.at(-1).data.message.text, 'Half an answer');
  });

  it('enforces the per-minute limit per student', async () => {
    process.env.AI_RATE_LIMIT_PER_MINUTE = '2';
    for (let i = 0; i < 2; i += 1) await (await chat({ message: `q${i}` })).text();
    const res = await chat({ message: 'q3' });
    assert.equal(res.status, 429);
    assert.equal((await res.json()).code, 'AI_RATE_LIMITED');
    // A different student has their own bucket.
    const other = await chat({ message: 'q1' }, otherToken);
    assert.equal(other.status, 200);
    await other.text();
  });

  it("enforces the daily limit from stored messages", async () => {
    process.env.AI_DAILY_LIMIT_PER_USER = '2';
    for (let i = 0; i < 2; i += 1) await (await chat({ message: `q${i}` })).text();
    const res = await chat({ message: 'q3' });
    assert.equal(res.status, 429);
    assert.equal((await res.json()).code, 'AI_DAILY_LIMIT');

    const status = await (await send('GET', '/api/ai/status', null, auth())).json();
    assert.deepEqual(status.limits, { perDay: 2, usedToday: 2 });
  });

  it('loads chapter details from the database into the prompt', async () => {
    const chapter = await Chapter.create({
      chapterName: 'Quadratic Equations', subject: 'Mathematics', classId: 'Class 10',
      description: 'Roots of quadratic equations', learningObjectives: 'Use the discriminant',
    });
    const events = await readEvents(await chat({ message: 'help', context: { chapterId: String(chapter._id), chapterName: 'spoofed' } }));
    const instruction = calls[0].body.systemInstruction.parts[0].text;
    assert.match(instruction, /Chapter: Quadratic Equations/);
    assert.match(instruction, /Learning objectives: Use the discriminant/);
    assert.doesNotMatch(instruction, /spoofed/);
    const conv = events.at(-1).data.conversation;
    assert.equal(conv.subject, 'Mathematics');
    assert.equal(conv.context.chapterName, 'Quadratic Equations');
  });

  it('accepts non-database chapter ids by skipping the lookup', async () => {
    const res = await chat({ message: 'help', context: { chapterId: 'mock-chapter-1', chapterName: 'Light' } });
    assert.equal(res.status, 200);
    const events = await readEvents(res);
    assert.match(calls[0].body.systemInstruction.parts[0].text, /Chapter: Light/);
    assert.equal(events.at(-1).data.conversation.context.chapterId, undefined);
  });
});

// ---- conversations CRUD ----
describe('conversations', () => {
  it('lists, opens, renames and deletes only your own chats', async () => {
    const first = await readEvents(await chat({ message: 'Maths doubt', subject: 'Mathematics' }));
    await (await chat({ message: 'Science doubt', subject: 'Science' })).text();
    const id = first.at(-1).data.conversation.id;

    const all = await (await send('GET', '/api/ai/conversations', null, auth())).json();
    assert.equal(all.conversations.length, 2);
    assert.ok(all.conversations.every((c) => !('messages' in c)));

    const maths = await (await send('GET', '/api/ai/conversations?subject=Mathematics', null, auth())).json();
    assert.deepEqual(maths.conversations.map((c) => c.id), [id]);

    const full = await (await send('GET', `/api/ai/conversations/${id}`, null, auth())).json();
    assert.equal(full.conversation.messages.length, 2);

    assert.equal((await send('GET', `/api/ai/conversations/${id}`, null, auth(otherToken))).status, 404);
    assert.equal((await send('DELETE', `/api/ai/conversations/${id}`, null, auth(otherToken))).status, 404);

    const renamed = await (await send('PATCH', `/api/ai/conversations/${id}`, { title: 'Algebra' }, auth())).json();
    assert.equal(renamed.conversation.title, 'Algebra');

    assert.equal((await send('DELETE', `/api/ai/conversations/${id}`, null, auth())).status, 200);
    assert.equal(await AITutorChat.countDocuments({ user: userId }), 1);
  });

  it('reports status without exposing the key', async () => {
    const res = await send('GET', '/api/ai/status', null, auth());
    const body = await res.json();
    assert.equal(body.enabled, true);
    assert.equal(body.limits.perDay, null);
    assert.ok(!JSON.stringify(body).includes(API_KEY));
  });
});
