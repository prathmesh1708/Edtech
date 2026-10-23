import PracticeQuiz from '../models/PracticeQuiz.js';
import Chapter from '../models/Chapter.js';
import { GeminiError, generateJson } from '../services/geminiService.js';
import { buildQuizPrompt, QUIZ_SCHEMA } from '../utils/aiTutorPrompt.js';
import {
  ApiError,
  badRequest,
  notFound,
  sendError,
  readString,
  readObjectId,
  readChapterId,
  readEnum,
  isInactive,
  assertWithinDailyLimit,
} from '../utils/aiCommon.js';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COUNTS = [5, 10];

// ---- Validation of the model's output ----
const cleanText = (value, max) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max) : '';

// Strips "A) ", "1. " style prefixes the model sometimes adds despite instructions.
const stripOptionPrefix = (s) => s.replace(/^\s*(?:[A-Da-d]|[1-4])[.):]\s+/, '');

/** Keeps only well-formed questions; returns [] if the payload is unusable. */
export const sanitizeQuestions = (payload, max) => {
  const raw = Array.isArray(payload?.questions) ? payload.questions : [];
  const seen = new Set();
  const out = [];
  for (const q of raw) {
    const question = cleanText(q?.question, 500);
    const options = Array.isArray(q?.options) ? q.options.map((o) => stripOptionPrefix(cleanText(o, 200))) : [];
    const answerIndex = q?.answerIndex;
    if (!question || seen.has(question.toLowerCase())) continue;
    if (options.length !== 4 || options.some((o) => !o) || new Set(options.map((o) => o.toLowerCase())).size !== 4) continue;
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) continue;
    seen.add(question.toLowerCase());
    out.push({ question, options, answerIndex, explanation: cleanText(q?.explanation, 1000) });
    if (out.length === max) break;
  }
  return out;
};

// ---- Serialization ----
const serializeQuiz = (quiz) => {
  const submitted = quiz.status === 'submitted';
  return {
    id: String(quiz._id),
    subject: quiz.subject,
    context: { chapterName: quiz.context?.chapterName, topic: quiz.context?.topic },
    difficulty: quiz.difficulty,
    status: quiz.status,
    createdAt: quiz.createdAt,
    submittedAt: quiz.submittedAt,
    score: submitted ? quiz.score : undefined,
    total: quiz.questions.length,
    // The answer key is only revealed after submission.
    questions: quiz.questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      ...(submitted && {
        answerIndex: q.answerIndex,
        explanation: q.explanation,
        chosenIndex: quiz.responses?.[i] ?? null,
        correct: quiz.responses?.[i] === q.answerIndex,
      }),
    })),
  };
};

const serializeSummary = (quiz) => ({
  id: String(quiz._id),
  subject: quiz.subject,
  context: { chapterName: quiz.context?.chapterName, topic: quiz.context?.topic },
  difficulty: quiz.difficulty,
  status: quiz.status,
  score: quiz.status === 'submitted' ? quiz.score : undefined,
  total: quiz.questions?.length ?? 0,
  createdAt: quiz.createdAt,
});

// ---- Handlers ----

/**
 * @route POST /api/ai/practice/quizzes
 * body: { subject?, context?: { chapterId?, chapterName?, topic? }, difficulty?, count? }
 */
export const createQuiz = async (req, res) => {
  try {
    if (isInactive(req.user)) throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Your account is not active.');
    const body = req.body || {};
    const rawContext = body.context && typeof body.context === 'object' && !Array.isArray(body.context) ? body.context : {};
    const difficulty = readEnum(body.difficulty, 'difficulty', DIFFICULTIES, 'medium');
    const count = body.count === undefined ? 5 : Number(body.count);
    if (!COUNTS.includes(count)) throw badRequest(`count must be one of: ${COUNTS.join(', ')}`);

    const context = {
      chapterId: readChapterId(rawContext.chapterId),
      chapterName: readString(rawContext.chapterName, 'context.chapterName', 150),
      topic: readString(rawContext.topic, 'context.topic', 150),
    };
    let subject = readString(body.subject, 'subject', 60);

    const promptContext = { ...context };
    if (context.chapterId) {
      const chapter = await Chapter.findOne({ _id: context.chapterId, isDeleted: { $ne: true } })
        .select('chapterName subject description learningObjectives')
        .lean();
      if (chapter) {
        context.chapterName = promptContext.chapterName = chapter.chapterName;
        promptContext.chapterDescription = chapter.description;
        promptContext.learningObjectives = chapter.learningObjectives;
        subject = subject || chapter.subject;
      }
    }
    if ((!subject || subject === 'General') && !context.chapterName && !context.topic) {
      throw badRequest('Choose a subject, chapter, or topic for the quiz');
    }

    await assertWithinDailyLimit(req.user._id);

    const { systemInstruction, prompt } = buildQuizPrompt({ student: req.user, subject, context: promptContext, difficulty, count });
    const payload = await generateJson({ systemInstruction, prompt, responseSchema: QUIZ_SCHEMA });
    const questions = sanitizeQuestions(payload, count);
    if (questions.length < Math.ceil(count / 2)) throw new GeminiError('BAD_RESPONSE');

    const quiz = await PracticeQuiz.create({
      user: req.user._id,
      subject: subject || 'General',
      context,
      difficulty,
      questions,
    });
    res.status(201).json({ success: true, quiz: serializeQuiz(quiz) });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/ai/practice/quizzes?limit=
export const listQuizzes = async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit);
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 20;
    const quizzes = await PracticeQuiz.find({ user: req.user._id })
      .select('-questions.explanation -questions.answerIndex -responses')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, quizzes: quizzes.map(serializeSummary) });
  } catch (err) {
    sendError(res, err);
  }
};

const findOwnQuiz = async (req) => {
  const id = readObjectId(req.params.id, 'quiz id');
  const quiz = await PracticeQuiz.findOne({ _id: id, user: req.user._id });
  if (!quiz) throw notFound('Quiz not found');
  return quiz;
};

// @route GET /api/ai/practice/quizzes/:id
export const getQuiz = async (req, res) => {
  try {
    res.json({ success: true, quiz: serializeQuiz(await findOwnQuiz(req)) });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * @route POST /api/ai/practice/quizzes/:id/submit
 * body: { answers: Array<0|1|2|3|null> } — one entry per question, null = skipped
 * Graded on the server from the stored answer key; no AI call.
 */
export const submitQuiz = async (req, res) => {
  try {
    const quiz = await findOwnQuiz(req);
    if (quiz.status === 'submitted') throw new ApiError(409, 'QUIZ_SUBMITTED', 'This quiz has already been submitted.');

    const answers = req.body?.answers;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      throw badRequest(`answers must be an array of ${quiz.questions.length} entries`);
    }
    const responses = answers.map((a) => {
      if (a === null || a === undefined) return null;
      if (!Number.isInteger(a) || a < 0 || a > 3) throw badRequest('Each answer must be 0-3 or null');
      return a;
    });

    quiz.responses = responses;
    quiz.score = quiz.questions.reduce((sum, q, i) => sum + (responses[i] === q.answerIndex ? 1 : 0), 0);
    quiz.status = 'submitted';
    quiz.submittedAt = new Date();
    await quiz.save();
    res.json({ success: true, quiz: serializeQuiz(quiz) });
  } catch (err) {
    sendError(res, err);
  }
};
