import AITutorChat from '../models/AITutorChat.js';
import Chapter from '../models/Chapter.js';
import { GeminiError, openChatStream, isGeminiConfigured, getGeminiModel } from '../services/geminiService.js';
import { recordSafetyFlag } from '../services/aiSafetyService.js';
import { buildSystemInstruction, toGeminiContents, titleFromReply } from '../utils/aiTutorPrompt.js';
import { detectSafetyConcern } from '../utils/aiSafety.js';
import {
  ApiError,
  badRequest,
  notFound,
  describeError,
  sendError,
  readString,
  readObjectId,
  readChapterId,
  isInactive,
  dailyLimit,
  countAiRequestsToday,
  assertWithinDailyLimit,
} from '../utils/aiCommon.js';

const MAX_MESSAGE_CHARS = 4000;
const MAX_MESSAGES_PER_CHAT = 200;
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const AUDIO_MAX_BYTES = 6 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const AUDIO_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac'];
const INPUT_MODES = ['text', 'voice', 'image'];
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const BLOCKED_REPLY =
  "I can't help with that one. Let's get back to studying — ask me anything from your subjects, and I'll explain it step by step!";

// ---- Input validation ----
const readAttachment = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) throw badRequest('attachment must be an object');
  const mimeType = typeof value.mimeType === 'string' ? value.mimeType.split(';')[0].trim().toLowerCase() : '';
  const kind = IMAGE_TYPES.includes(mimeType) ? 'image' : AUDIO_TYPES.includes(mimeType) ? 'audio' : null;
  if (!kind) throw badRequest('Only photos (JPG, PNG, WEBP, HEIC) and voice recordings are supported');
  if (typeof value.data !== 'string' || !value.data || !BASE64_RE.test(value.data)) {
    throw badRequest('attachment data must be base64');
  }
  const bytes = Math.floor((value.data.length * 3) / 4);
  const max = kind === 'image' ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
  if (bytes > max) throw badRequest(`${kind === 'image' ? 'Photo' : 'Recording'} is too large (max ${max / 1024 / 1024} MB)`);
  return { kind, mimeType, data: value.data };
};

const readContext = (value) => {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) throw badRequest('context must be an object');
  return {
    chapterId: readChapterId(value.chapterId),
    chapterName: readString(value.chapterName, 'context.chapterName', 150),
    materialId: readString(value.materialId, 'context.materialId', 100),
    materialTitle: readString(value.materialTitle, 'context.materialTitle', 200),
    topic: readString(value.topic, 'context.topic', 150),
  };
};

const readChatBody = (body = {}) => {
  const text = readString(body.message, 'message', MAX_MESSAGE_CHARS) || '';
  const attachment = readAttachment(body.attachment);
  if (!text && !attachment) throw badRequest('Please type a question, record one, or add a photo');
  const inputMode = body.inputMode === undefined ? (attachment?.kind === 'image' ? 'image' : 'text') : body.inputMode;
  if (!INPUT_MODES.includes(inputMode)) throw badRequest(`inputMode must be one of: ${INPUT_MODES.join(', ')}`);
  return {
    conversationId: readObjectId(body.conversationId, 'conversationId'),
    text,
    attachment,
    inputMode,
    subject: readString(body.subject, 'subject', 60),
    context: readContext(body.context),
  };
};

// ---- Serialization ----
const serializeMessage = (m) => ({
  id: String(m._id),
  sender: m.sender,
  text: m.text,
  inputMode: m.inputMode,
  attachments: (m.attachments || []).map((a) => ({ kind: a.kind, mimeType: a.mimeType })),
  status: m.status,
  timestamp: m.timestamp,
});

const contextOf = (chat) => {
  const c = chat.context || {};
  const out = {};
  for (const key of ['chapterId', 'chapterName', 'materialId', 'materialTitle', 'topic']) if (c[key]) out[key] = c[key];
  return out;
};

const serializeSummary = (chat) => ({
  id: String(chat._id),
  title: chat.title,
  subject: chat.subject,
  context: contextOf(chat),
  lastMessageAt: chat.lastMessageAt,
  createdAt: chat.createdAt,
});

const initialTitle = (text, attachment) => {
  if (text) return text.length > 60 ? `${text.slice(0, 57).trimEnd()}...` : text;
  return attachment?.kind === 'audio' ? 'Voice question' : 'Photo question';
};

// Chapter details are read from the database rather than trusted from the request.
const loadPromptContext = async (stored) => {
  const context = { ...stored };
  if (stored.chapterId) {
    const chapter = await Chapter.findOne({ _id: stored.chapterId, isDeleted: { $ne: true } })
      .select('chapterName subject description learningObjectives')
      .lean();
    if (chapter) {
      context.chapterName = chapter.chapterName;
      context.chapterDescription = chapter.description;
      context.learningObjectives = chapter.learningObjectives;
      context.chapterSubject = chapter.subject;
    }
  }
  return context;
};

// ---- SSE helpers ----
const startSse = (res) => {
  res.status(200);
  res.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx buffering so tokens arrive as they are generated
  });
  res.flushHeaders();
};

const sendEvent = (res, event, data) => {
  if (res.writableEnded || res.destroyed) return;
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

// ---- Handlers ----

// @route GET /api/ai/status
export const getStatus = async (req, res) => {
  try {
    const perDay = dailyLimit();
    const usedToday = perDay ? await countAiRequestsToday(req.user._id) : null;
    res.json({
      success: true,
      enabled: isGeminiConfigured(),
      model: getGeminiModel(),
      limits: { perDay: perDay || null, usedToday },
      attachments: {
        imageTypes: IMAGE_TYPES,
        audioTypes: AUDIO_TYPES,
        imageMaxBytes: IMAGE_MAX_BYTES,
        audioMaxBytes: AUDIO_MAX_BYTES,
      },
    });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/ai/conversations?subject=&limit=
export const listConversations = async (req, res) => {
  try {
    const subject = readString(req.query.subject, 'subject', 60);
    const rawLimit = Number(req.query.limit);
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 30;
    const filter = { user: req.user._id };
    if (subject) filter.subject = subject;
    const chats = await AITutorChat.find(filter).select('-messages').sort({ lastMessageAt: -1 }).limit(limit).lean();
    res.json({ success: true, conversations: chats.map(serializeSummary) });
  } catch (err) {
    sendError(res, err);
  }
};

const findOwnChat = async (req, projection) => {
  const id = readObjectId(req.params.id, 'conversation id');
  const query = AITutorChat.findOne({ _id: id, user: req.user._id });
  if (projection) query.select(projection);
  const chat = await query;
  if (!chat) throw notFound('Chat not found');
  return chat;
};

// @route GET /api/ai/conversations/:id
export const getConversation = async (req, res) => {
  try {
    const chat = await findOwnChat(req);
    res.json({ success: true, conversation: { ...serializeSummary(chat), messages: chat.messages.map(serializeMessage) } });
  } catch (err) {
    sendError(res, err);
  }
};

// @route PATCH /api/ai/conversations/:id   body: { title }
export const renameConversation = async (req, res) => {
  try {
    const title = readString(req.body?.title, 'title', 120);
    if (!title) throw badRequest('title is required');
    const chat = await findOwnChat(req, '-messages');
    chat.title = title;
    await chat.save();
    res.json({ success: true, conversation: serializeSummary(chat) });
  } catch (err) {
    sendError(res, err);
  }
};

// @route DELETE /api/ai/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    const id = readObjectId(req.params.id, 'conversation id');
    const { deletedCount } = await AITutorChat.deleteOne({ _id: id, user: req.user._id });
    if (!deletedCount) throw notFound('Chat not found');
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * @route POST /api/ai/chat
 * body: { conversationId?, message?, inputMode?, attachment?: { mimeType, data }, subject?, context? }
 *
 * Validation, limit and Gemini setup errors are plain JSON responses. Once Gemini has
 * accepted the request the response becomes an SSE stream:
 *   event: meta   { conversationId, userMessage, title }
 *   event: delta  { text }                       (repeated)
 *   event: error  { code, message }              (only if the stream fails part-way)
 *   event: done   { message, conversation }
 */
export const sendMessage = async (req, res) => {
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) abort.abort();
  });

  try {
    if (isInactive(req.user)) throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Your account is not active.');
    const input = readChatBody(req.body);
    await assertWithinDailyLimit(req.user._id);

    let chat;
    if (input.conversationId) {
      chat = await AITutorChat.findOne({ _id: input.conversationId, user: req.user._id });
      if (!chat) throw notFound('Chat not found');
      if (chat.messages.length >= MAX_MESSAGES_PER_CHAT) {
        throw new ApiError(409, 'AI_CHAT_FULL', 'This chat is full. Please start a new chat to keep going.');
      }
    } else {
      chat = new AITutorChat({
        user: req.user._id,
        title: initialTitle(input.text, input.attachment),
        context: input.context,
      });
    }

    const promptContext = await loadPromptContext(contextOf(chat));
    if (chat.isNew) {
      chat.subject = input.subject || promptContext.chapterSubject || 'General';
      if (promptContext.chapterName) chat.context.chapterName = promptContext.chapterName;
    }

    const stream = await openChatStream({
      systemInstruction: buildSystemInstruction({ student: req.user, subject: chat.subject, context: promptContext }),
      contents: toGeminiContents(chat.messages, { text: input.text, attachment: input.attachment }),
      signal: abort.signal,
    });

    chat.messages.push({
      sender: 'user',
      text: input.text,
      inputMode: input.inputMode,
      attachments: input.attachment ? [{ kind: input.attachment.kind, mimeType: input.attachment.mimeType }] : [],
    });
    const userMessage = chat.messages[chat.messages.length - 1];

    startSse(res);
    sendEvent(res, 'meta', { conversationId: String(chat._id), userMessage: serializeMessage(userMessage), title: chat.title });

    let reply = '';
    let status = 'complete';
    let streamError = null;
    try {
      for await (const chunk of stream) {
        if (chunk.blocked) {
          status = 'blocked';
          break;
        }
        if (chunk.text) {
          reply += chunk.text;
          sendEvent(res, 'delta', { text: chunk.text });
        }
      }
    } catch (err) {
      if (err instanceof GeminiError && err.kind === 'ABORTED') status = 'stopped';
      else {
        status = 'error';
        streamError = err;
      }
    }

    if (status === 'blocked') {
      reply = BLOCKED_REPLY;
      sendEvent(res, 'replace', { text: reply });
    } else if (status === 'complete' && !reply.trim()) {
      status = 'error';
      streamError = new GeminiError('BAD_RESPONSE');
    }

    chat.messages.push({ sender: 'ai', text: reply, status });
    if (chat.isNew && input.attachment) chat.title = titleFromReply(reply) || chat.title;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Safeguarding: the student's words, or the AI's restatement of a photo / recording.
    const concern = detectSafetyConcern(input.text) || detectSafetyConcern(titleFromReply(reply));
    if (concern || status === 'blocked') {
      await recordSafetyFlag({
        userId: req.user._id,
        conversationId: chat._id,
        messageId: userMessage._id,
        reason: concern || 'blocked',
        excerpt: input.text || titleFromReply(reply) || `[${input.attachment?.kind === 'audio' ? 'voice question' : 'photo'}]`,
      });
    }

    if (streamError) {
      const [, code, message] = describeError(streamError);
      sendEvent(res, 'error', { code, message });
    }
    sendEvent(res, 'done', {
      message: serializeMessage(chat.messages[chat.messages.length - 1]),
      conversation: serializeSummary(chat),
    });
    if (!res.writableEnded) res.end();
  } catch (err) {
    if (res.headersSent) {
      const [, code, message] = describeError(err);
      sendEvent(res, 'error', { code, message });
      if (!res.writableEnded) res.end();
      return;
    }
    if (err instanceof GeminiError && err.kind === 'ABORTED') return; // client already left
    sendError(res, err);
  }
};
