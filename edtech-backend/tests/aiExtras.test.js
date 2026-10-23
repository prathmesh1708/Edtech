// Tests for AI practice quizzes, safety review flags and admin insights. Run with: npm test
// Same harness as aiTutor.test.js: only aiTutorRoutes mounted, Gemini stubbed via
// globalThis.fetch, in-memory MongoDB.
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import aiTutorRoutes from '../routes/aiTutorRoutes.js';
import { resetAiRateLimit } from '../middleware/aiRateLimit.js';
import { detectSafetyConcern } from '../utils/aiSafety.js';
import { sanitizeQuestions } from '../controllers/aiPracticeController.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import AITutorChat from '../models/AITutorChat.js';
import AISafetyFlag from '../models/AISafetyFlag.js';
import PracticeQuiz from '../models/PracticeQuiz.js';

const BASE = 'https://gemini.example.test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'development';

// ---- Gemini stub ----
const realFetch = globalThis.fetch;
let calls = [];
let chatReply;
let quizPayload;
let quizBlocked;

const mcq = (n, extra = {}) => ({
  question: `Question ${n}?`,
  options: [`a${n}`, `b${n}`, `c${n}`, `d${n}`],
  answerIndex: n % 4,
  explanation: `Because ${n}.`,
  ...extra,
});

const sse = (parts) => {
  const encoder = new TextEncoder();
  const queue = parts.map((p) => encoder.encode(`data: ${JSON.stringify(p)}\n\n`));
  return new Response(new ReadableStream({ pull: (c) => (queue.length ? c.enqueue(queue.shift()) : c.close()) }), {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
  });
};

globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (!u.startsWith(BASE)) return realFetch(url, init);
  calls.push({ url: u, body: JSON.parse(init.body) });
  if (u.includes(':streamGenerateContent')) {
    return sse(chatReply());
  }
  if (quizBlocked) return Response.json({ promptFeedback: { blockReason: 'SAFETY' } });
  return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(quizPayload) }] }, finishReason: 'STOP' }] });
};

const textReply = (text, finishReason = 'STOP') => () => [{ candidates: [{ content: { parts: [{ text }] }, finishReason }] }];

// ---- app / db ----
let mongod;
let server;
let baseUrl;
let studentToken;
let otherToken;
let adminToken;
let studentId;

const send = (method, path, body, token) =>
  realFetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });

const chat = async (body, token = studentToken) => {
  const res = await send('POST', '/api/ai/chat', body, token);
  const text = await res.text();
  const done = text.split('\n\n').find((b) => b.startsWith('event: done'));
  return { res, done: done ? JSON.parse(done.split('data: ')[1]) : null };
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const student = await User.create({ name: 'Aarav Sharma', password: 'secret123', board: 'CBSE', classId: '10' });
  const other = await User.create({ name: 'Meera Iyer', password: 'secret123', board: 'CBSE', classId: 'Class 6' });
  const admin = await Admin.create({ name: 'Head Admin', email: 'admin@example.com', password: 'secret123' });
  studentId = student._id;
  const sign = (id) => jwt.sign({ id: String(id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
  studentToken = sign(student._id);
  otherToken = sign(other._id);
  adminToken = sign(admin._id);

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
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GEMINI_TIMEOUT_MS = '2000';
  process.env.GEMINI_RETRY_DELAY_MS = '0';
  process.env.GEMINI_MODEL = 'gemini-3.8-flash';
  process.env.AI_RATE_LIMIT_PER_MINUTE = '100';
  process.env.AI_DAILY_LIMIT_PER_USER = '0';
  calls = [];
  chatReply = textReply('Here is the answer.');
  quizPayload = { questions: [1, 2, 3, 4, 5].map((n) => mcq(n)) };
  quizBlocked = false;
  resetAiRateLimit();
  await Promise.all([AITutorChat.deleteMany({}), AISafetyFlag.deleteMany({}), PracticeQuiz.deleteMany({})]);
});

// ---- Safety detection ----
describe('safety detection', () => {
  it('flags first-person self-harm and abuse in English, Hinglish and Hindi', () => {
    for (const text of ['I want to die', 'sometimes I think about killing myself', 'I feel suicidal', 'main khudkushi kar lunga', 'मैं आत्महत्या करना चाहता हूँ']) {
      assert.equal(detectSafetyConcern(text), 'self_harm', text);
    }
    for (const text of ['my uncle touches me in a bad way', 'my stepfather beats me every day', 'I am being abused at home', 'mujhe maarte hain ghar pe']) {
      assert.equal(detectSafetyConcern(text), 'abuse', text);
    }
  });

  it('does not flag ordinary study questions', () => {
    for (const text of ['What is drug abuse? Class 12 biology', "Explain Durkheim's theory of suicide", 'How do cells die in apoptosis?', 'kill the bacteria with antibiotics', 'Solve x² − 5x + 6 = 0', '']) {
      assert.equal(detectSafetyConcern(text), null, text);
    }
  });
});

describe('safety flags from chat', () => {
  it('creates one urgent flag per conversation and counts repeats', async () => {
    const first = await chat({ message: 'I want to die, nothing matters' });
    assert.equal(first.res.status, 200);
    await chat({ conversationId: first.done.conversation.id, message: 'I really want to die' });

    const flags = await AISafetyFlag.find().lean();
    assert.equal(flags.length, 1);
    assert.equal(flags[0].reason, 'self_harm');
    assert.equal(flags[0].severity, 'urgent');
    assert.equal(flags[0].occurrences, 2);
    assert.equal(flags[0].excerpt, 'I really want to die');
    assert.equal(String(flags[0].user), String(studentId));
  });

  it('flags a voice question through the AI restatement', async () => {
    chatReply = textReply('> You asked: I want to die\n\nI am really sorry you feel this way...');
    await chat({ attachment: { mimeType: 'audio/ogg', data: Buffer.from('ogg').toString('base64') }, inputMode: 'voice' });
    const flag = await AISafetyFlag.findOne().lean();
    assert.equal(flag.reason, 'self_harm');
    assert.equal(flag.excerpt, 'I want to die');
  });

  it('records safety-blocked answers as normal-severity flags', async () => {
    chatReply = () => [{ candidates: [{ content: { parts: [{ text: '' }] }, finishReason: 'SAFETY' }] }];
    await chat({ message: 'write something nasty' });
    const flag = await AISafetyFlag.findOne().lean();
    assert.equal(flag.reason, 'blocked');
    assert.equal(flag.severity, 'normal');
  });

  it('does not flag normal questions', async () => {
    await chat({ message: 'What is drug abuse?' });
    assert.equal(await AISafetyFlag.countDocuments(), 0);
  });
});

// ---- Admin ----
describe('admin endpoints', () => {
  it('are admin-only', async () => {
    for (const path of ['/api/ai/admin/insights', '/api/ai/admin/flags']) {
      assert.equal((await send('GET', path, null, studentToken)).status, 403, path);
      assert.equal((await send('GET', path)).status, 401, path);
    }
  });

  it('lists urgent flags first, shows the conversation, and records the review', async () => {
    chatReply = () => [{ candidates: [{ content: { parts: [{ text: '' }] }, finishReason: 'SAFETY' }] }];
    await chat({ message: 'write something nasty' });
    chatReply = textReply('Please talk to a trusted adult. You can call Childline 1098.');
    const urgent = await chat({ message: 'Hi' });
    await chat({ conversationId: urgent.done.conversation.id, message: 'my uncle touches me in a bad way' });

    const list = await (await send('GET', '/api/ai/admin/flags', null, adminToken)).json();
    assert.deepEqual(list.flags.map((f) => f.reason), ['abuse', 'blocked']);
    assert.deepEqual(list.counts, { open: 2, urgentOpen: 1 });
    assert.equal(list.flags[0].student.name, 'Aarav Sharma');

    const detail = await (await send('GET', `/api/ai/admin/flags/${list.flags[0].id}`, null, adminToken)).json();
    const texts = detail.conversation.messages.map((m) => m.text);
    assert.deepEqual(texts.slice(-2), ['my uncle touches me in a bad way', 'Please talk to a trusted adult. You can call Childline 1098.']);
    assert.equal(detail.conversation.messages.find((m) => m.flagged).text, 'my uncle touches me in a bad way');

    const updated = await (await send('PATCH', `/api/ai/admin/flags/${list.flags[0].id}`, { status: 'resolved', note: 'Informed school counsellor' }, adminToken)).json();
    assert.equal(updated.flag.status, 'resolved');
    assert.equal(updated.flag.reviewedBy, 'Head Admin');
    assert.equal(updated.flag.note, 'Informed school counsellor');

    const open = await (await send('GET', '/api/ai/admin/flags', null, adminToken)).json();
    assert.equal(open.flags.length, 1);
    assert.equal((await send('PATCH', `/api/ai/admin/flags/${list.flags[0].id}`, { status: 'maybe' }, adminToken)).status, 400);
  });

  it('reports usage insights', async () => {
    const a = await chat({ message: 'What is osmosis?', subject: 'Biology', context: { topic: 'Osmosis' } });
    await chat({ conversationId: a.done.conversation.id, message: 'Example?' });
    await chat({ attachment: { mimeType: 'image/jpeg', data: Buffer.from('jpg').toString('base64') } }, otherToken);
    const quiz = (await (await send('POST', '/api/ai/practice/quizzes', { subject: 'Mathematics' }, studentToken)).json()).quiz;
    await send('POST', `/api/ai/practice/quizzes/${quiz.id}/submit`, { answers: [1, 2, 3, 0, 1] }, studentToken); // all correct

    const body = await (await send('GET', '/api/ai/admin/insights?range=7d', null, adminToken)).json();
    assert.equal(body.totals.questions, 3);
    assert.equal(body.totals.students, 2);
    assert.equal(body.totals.conversations, 2);
    assert.equal(body.totals.avgPerStudent, 1.5);
    assert.deepEqual(body.inputModes, { text: 2, voice: 0, image: 1 });
    assert.equal(body.daily.length, 7);
    assert.equal(body.daily.at(-1).questions, 3);
    assert.equal(body.peakHours.length, 24);
    assert.deepEqual(body.subjects[0], { subject: 'Biology', questions: 2 });
    assert.deepEqual(body.topics, [{ topic: 'Osmosis', subject: 'Biology', questions: 2 }]);
    assert.deepEqual(body.classes.map((c) => c.classId), ['Class 6', '10']);
    assert.deepEqual(body.quizzes, { generated: 1, submitted: 1, avgScorePct: 100 });
    assert.deepEqual(body.safety, { open: 0, urgentOpen: 0 });
    assert.equal((await send('GET', '/api/ai/admin/insights?range=1y', null, adminToken)).status, 400);
  });
});

// ---- Practice quizzes ----
describe('practice quizzes', () => {
  it('keeps only well-formed questions and strips option letters', () => {
    const out = sanitizeQuestions({
      questions: [
        mcq(1, { options: ['A) one', 'B) two', 'C) three', 'D) four'] }),
        mcq(2, { options: ['x', 'y', 'z'] }),
        mcq(3, { answerIndex: 4 }),
        mcq(4, { options: ['same', 'same', 'c', 'd'] }),
        mcq(1),
        mcq(5),
      ],
    }, 10);
    assert.deepEqual(out.map((q) => q.question), ['Question 1?', 'Question 5?']);
    assert.deepEqual(out[0].options, ['one', 'two', 'three', 'four']);
  });

  it('generates a quiz without revealing the answers', async () => {
    const res = await send('POST', '/api/ai/practice/quizzes', { subject: 'Science', context: { topic: 'Light' }, difficulty: 'hard' }, studentToken);
    assert.equal(res.status, 201);
    const { quiz } = await res.json();
    assert.equal(quiz.questions.length, 5);
    assert.equal(quiz.status, 'in_progress');
    assert.ok(quiz.questions.every((q) => !('answerIndex' in q) && !('explanation' in q)));

    const [call] = calls;
    assert.match(call.url, /:generateContent$/);
    assert.equal(call.body.generationConfig.responseMimeType, 'application/json');
    assert.deepEqual(call.body.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
    assert.match(call.body.contents[0].parts[0].text, /Topic: Light/);
    assert.match(call.body.contents[0].parts[0].text, /Difficulty: Hard/);
    assert.match(call.body.systemInstruction.parts[0].text, /Class 10 \(CBSE board\)/);

    const reread = await (await send('GET', `/api/ai/practice/quizzes/${quiz.id}`, null, studentToken)).json();
    assert.ok(reread.quiz.questions.every((q) => !('answerIndex' in q)));
  });

  it('grades on the server and reveals answers only after submitting', async () => {
    const { quiz } = await (await send('POST', '/api/ai/practice/quizzes', { subject: 'Science' }, studentToken)).json();
    assert.equal((await send('POST', `/api/ai/practice/quizzes/${quiz.id}/submit`, { answers: [1, 2] }, studentToken)).status, 400);
    assert.equal((await send('POST', `/api/ai/practice/quizzes/${quiz.id}/submit`, { answers: [1, 2, 3, 0, 9] }, studentToken)).status, 400);
    assert.equal((await send('POST', `/api/ai/practice/quizzes/${quiz.id}/submit`, { answers: [1, 1, 1, 1, 1] }, otherToken)).status, 404);

    // Correct answers are 1, 2, 3, 0, 1 (n % 4).
    const res = await send('POST', `/api/ai/practice/quizzes/${quiz.id}/submit`, { answers: [1, 0, 3, null, 1] }, studentToken);
    const graded = (await res.json()).quiz;
    assert.equal(graded.score, 3);
    assert.deepEqual(graded.questions.map((q) => q.correct), [true, false, true, false, true]);
    assert.equal(graded.questions[1].answerIndex, 2);
    assert.equal(graded.questions[1].chosenIndex, 0);
    assert.equal(graded.questions[1].explanation, 'Because 2.');

    assert.equal((await send('POST', `/api/ai/practice/quizzes/${quiz.id}/submit`, { answers: [1, 2, 3, 0, 1] }, studentToken)).status, 409);

    const list = await (await send('GET', '/api/ai/practice/quizzes', null, studentToken)).json();
    assert.deepEqual(list.quizzes.map((q) => [q.score, q.total]), [[3, 5]]);
  });

  it('needs something to quiz on and a valid size', async () => {
    assert.equal((await send('POST', '/api/ai/practice/quizzes', {}, studentToken)).status, 400);
    assert.equal((await send('POST', '/api/ai/practice/quizzes', { subject: 'General' }, studentToken)).status, 400);
    assert.equal((await send('POST', '/api/ai/practice/quizzes', { subject: 'Science', count: 7 }, studentToken)).status, 400);
    assert.equal((await send('POST', '/api/ai/practice/quizzes', { subject: 'Science', difficulty: 'insane' }, studentToken)).status, 400);
    assert.equal(calls.length, 0);
  });

  it('rejects unusable or blocked model output without saving', async () => {
    quizPayload = { questions: [mcq(1), mcq(2, { options: ['only one'] })] };
    const bad = await send('POST', '/api/ai/practice/quizzes', { subject: 'Science' }, studentToken);
    assert.equal(bad.status, 502);

    quizBlocked = true;
    const blocked = await send('POST', '/api/ai/practice/quizzes', { subject: 'Science' }, studentToken);
    assert.equal(blocked.status, 422);
    assert.equal((await blocked.json()).code, 'AI_BLOCKED');
    assert.equal(await PracticeQuiz.countDocuments(), 0);
  });

  it('counts quizzes toward the daily limit', async () => {
    process.env.AI_DAILY_LIMIT_PER_USER = '1';
    assert.equal((await send('POST', '/api/ai/practice/quizzes', { subject: 'Science' }, studentToken)).status, 201);
    const res = await send('POST', '/api/ai/chat', { message: 'hi' }, studentToken);
    assert.equal(res.status, 429);
    assert.equal((await res.json()).code, 'AI_DAILY_LIMIT');
  });
});
