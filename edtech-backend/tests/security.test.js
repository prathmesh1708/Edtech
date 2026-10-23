// Access-control and abuse-protection tests. Run with: npm test
// Mounts the real route files on a fresh express app with an in-memory MongoDB.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import studentRoutes from '../routes/studentRoutes.js';
import syllabusManagementRoutes from '../routes/syllabusManagementRoutes.js';
import syllabusRoutes from '../routes/syllabusRoutes.js';
import bannerRoutes from '../routes/bannerRoutes.js';
import subscriptionPlanRoutes from '../routes/subscriptionPlanRoutes.js';
import analyticsRoutes from '../routes/analyticsRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import aiTutorRoutes from '../routes/aiTutorRoutes.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Notification from '../models/Notification.js';

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';

let mongod;
let server;
let baseUrl;
let studentToken;
let adminToken;
let student;
let other;

const send = (method, path, body, token) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  student = await User.create({ name: 'Aarav', email: 'aarav@example.com', password: 'secret123', role: 'student', classId: '10' });
  other = await User.create({ name: 'Meera', email: 'meera@example.com', password: 'secret123', role: 'student', classId: '9' });
  const admin = await Admin.create({ name: 'Admin', email: 'admin@example.com', password: 'secret123' });
  const sign = (id) => jwt.sign({ id: String(id) }, process.env.JWT_SECRET, { expiresIn: '1h' });
  studentToken = sign(student._id);
  adminToken = sign(admin._id);

  const app = express();
  app.use('/api/ai', express.json({ limit: '10mb' }));
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/syllabus-management', syllabusManagementRoutes);
  app.use('/api/syllabus', syllabusRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/subscription-plans', subscriptionPlanRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/ai', aiTutorRoutes);
  app.use((err, req, res, next) => res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: err.message }));
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongod.stop();
});

const ADMIN_ROUTES = [
  ['GET', '/api/student/admin'],
  ['POST', '/api/student/admin', { name: 'X', email: 'x@example.com' }],
  ['PUT', '/api/student/admin/000000000000000000000000', { password: 'hacked1' }],
  ['DELETE', '/api/student/admin/000000000000000000000000'],
  ['POST', '/api/syllabus-management/subjects', { subjectName: 'X', subjectCode: 'X' }],
  ['DELETE', '/api/syllabus-management/chapters/000000000000000000000000'],
  ['GET', '/api/syllabus-management/content-approvals'],
  ['POST', '/api/syllabus', {}],
  ['DELETE', '/api/syllabus/000000000000000000000000'],
  ['GET', '/api/banners'],
  ['POST', '/api/banners', {}],
  ['DELETE', '/api/banners/000000000000000000000000'],
  ['POST', '/api/subscription-plans', {}],
  ['POST', '/api/subscription-plans/subject-pricing', {}],
  ['GET', '/api/analytics'],
  ['GET', '/api/analytics/educational-insights'],
  ['GET', '/api/ai/admin/flags'],
];

describe('admin routes', () => {
  it('refuse anonymous requests (401)', async () => {
    for (const [method, path, body] of ADMIN_ROUTES) {
      assert.equal((await send(method, path, body)).status, 401, `${method} ${path}`);
    }
  });

  it('refuse signed-in students (403)', async () => {
    for (const [method, path, body] of ADMIN_ROUTES) {
      assert.equal((await send(method, path, body, studentToken)).status, 403, `${method} ${path}`);
    }
  });

  it('reject tokens signed with the old default secret', async () => {
    const forged = jwt.sign({ id: String(student._id) }, 'secret');
    assert.equal((await send('GET', '/api/student/admin', null, forged)).status, 401);
  });

  it('let admins in, without leaking password hashes or push tokens', async () => {
    await User.updateOne({ _id: student._id }, { fcmTokens: [{ token: 'device-token' }] });
    const res = await send('GET', '/api/student/admin', null, adminToken);
    assert.equal(res.status, 200);
    const list = await res.json();
    assert.equal(list.length, 2);
    assert.ok(list.every((s) => !('password' in s) && !('fcmTokens' in s)));
    assert.equal(await User.countDocuments({ email: /student\.edu$/ }), 0, 'no demo accounts seeded');
  });

  it('create students with a one-time password instead of a fixed default', async () => {
    const res = await send('POST', '/api/student/admin', { name: 'New', email: 'new@example.com' }, adminToken);
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.temporaryPassword && body.temporaryPassword !== '123456');
    assert.ok(!('password' in body));
    const created = await User.findOne({ email: 'new@example.com' });
    assert.ok(await created.matchPassword(body.temporaryPassword));
    assert.equal(await created.matchPassword('123456'), false);
  });
});

describe('public reads stay public', () => {
  it('serve students and visitors without a token', async () => {
    for (const path of ['/api/syllabus-management/subjects', '/api/syllabus-management/chapters', '/api/syllabus', '/api/banners/active', '/api/subscription-plans']) {
      assert.notEqual((await send('GET', path)).status, 401, path);
    }
  });

  it('student dashboard and todos need a login', async () => {
    assert.equal((await send('GET', '/api/student/dashboard')).status, 401);
    assert.equal((await send('GET', '/api/student/todos')).status, 401);
    assert.equal((await send('GET', '/api/student/dashboard', null, studentToken)).status, 200);
  });
});

describe('notifications', () => {
  it('need a login and ignore client-supplied user ids', async () => {
    const note = await Notification.create({ title: 'Private', message: 'For Meera only', target: 'Parents', user: other._id });
    assert.equal((await send('GET', `/api/notifications/user?userId=${other._id}`)).status, 401);

    const res = await send('GET', `/api/notifications/user?userId=${other._id}&role=parent`, null, studentToken);
    assert.equal(res.status, 200);
    const list = await res.json();
    assert.ok(!JSON.stringify(list).includes('For Meera only'), "another student's notification leaked");

    assert.equal((await send('PATCH', `/api/notifications/${note._id}/read`, { userId: String(other._id) })).status, 401);
  });
});

describe('sign-in rate limiting', () => {
  it('locks an account out after 10 attempts from one network', async () => {
    let last;
    for (let i = 0; i < 11; i += 1) last = await send('POST', '/api/auth/login', { email: 'aarav@example.com', password: `wrong${i}` });
    assert.equal(last.status, 429);
    assert.equal((await last.json()).code, 'TOO_MANY_ATTEMPTS');
    // A different account from the same network still gets its own attempts.
    const otherAccount = await send('POST', '/api/auth/login', { email: 'meera@example.com', password: 'wrong' });
    assert.notEqual(otherAccount.status, 429);
  });
});

describe('Gemini silence timeout', () => {
  it('stops waiting when Gemini sends nothing', async () => {
    const realFetch = globalThis.fetch;
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.GEMINI_API_BASE_URL = 'https://gemini.example.test';
    process.env.GEMINI_FIRST_BYTE_TIMEOUT_MS = '300';
    globalThis.fetch = (url, init) => {
      if (!String(url).startsWith('https://gemini.example.test')) return realFetch(url, init);
      // Never answers; only the abort signal ends it.
      return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))));
    };
    try {
      const t0 = Date.now();
      const res = await send('POST', '/api/ai/chat', { message: 'hi' }, studentToken);
      assert.equal(res.status, 504);
      assert.equal((await res.json()).code, 'AI_TIMEOUT');
      assert.ok(Date.now() - t0 < 3000, 'gave up quickly');
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
