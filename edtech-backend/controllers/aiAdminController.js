import AITutorChat from '../models/AITutorChat.js';
import AISafetyFlag from '../models/AISafetyFlag.js';
import PracticeQuiz from '../models/PracticeQuiz.js';
import { DAY_MS, badRequest, notFound, readEnum, readObjectId, readString, sendError, startOfIstDay } from '../utils/aiCommon.js';

const TZ = 'Asia/Kolkata';
const RANGES = { '7d': 7, '30d': 30, '90d': 90 };
const FLAG_STATUSES = ['open', 'resolved', 'dismissed'];
const isUserMsg = { $eq: ['$messages.sender', 'user'] };

const istDateKey = (date) => new Date(date.getTime() + 330 * 60 * 1000).toISOString().slice(0, 10);

// @route GET /api/ai/admin/insights?range=7d|30d|90d
export const getInsights = async (req, res) => {
  try {
    const range = readEnum(req.query.range, 'range', Object.keys(RANGES), '30d');
    const days = RANGES[range];
    const since = new Date(startOfIstDay().getTime() - (days - 1) * DAY_MS);
    const userOnly = { $match: { 'messages.sender': 'user' } };

    const [[facets], [quizRow], openFlags, urgentFlags] = await Promise.all([
      AITutorChat.aggregate([
        { $match: { lastMessageAt: { $gte: since } } },
        { $unwind: '$messages' },
        { $match: { 'messages.timestamp': { $gte: since } } },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  questions: { $sum: { $cond: [isUserMsg, 1, 0] } },
                  blocked: { $sum: { $cond: [{ $eq: ['$messages.status', 'blocked'] }, 1, 0] } },
                  errors: { $sum: { $cond: [{ $eq: ['$messages.status', 'error'] }, 1, 0] } },
                  students: { $addToSet: '$user' },
                  conversations: { $addToSet: '$_id' },
                },
              },
              { $project: { _id: 0, questions: 1, blocked: 1, errors: 1, students: { $size: '$students' }, conversations: { $size: '$conversations' } } },
            ],
            daily: [
              userOnly,
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$messages.timestamp', timezone: TZ } },
                  questions: { $sum: 1 },
                  students: { $addToSet: '$user' },
                },
              },
              { $project: { _id: 0, date: '$_id', questions: 1, students: { $size: '$students' } } },
            ],
            modes: [userOnly, { $group: { _id: '$messages.inputMode', count: { $sum: 1 } } }],
            subjects: [
              userOnly,
              { $group: { _id: '$subject', questions: { $sum: 1 } } },
              { $sort: { questions: -1 } },
              { $limit: 10 },
            ],
            topics: [
              userOnly,
              { $project: { subject: 1, topic: { $ifNull: ['$context.topic', '$context.chapterName'] } } },
              { $match: { topic: { $nin: [null, ''] } } },
              { $group: { _id: { topic: '$topic', subject: '$subject' }, questions: { $sum: 1 } } },
              { $sort: { questions: -1 } },
              { $limit: 10 },
            ],
            hours: [userOnly, { $group: { _id: { $hour: { date: '$messages.timestamp', timezone: TZ } }, questions: { $sum: 1 } } }],
            classes: [
              userOnly,
              { $group: { _id: '$user', questions: { $sum: 1 } } },
              { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u', pipeline: [{ $project: { classId: 1 } }] } },
              { $group: { _id: { $ifNull: [{ $first: '$u.classId' }, 'Unknown'] }, questions: { $sum: '$questions' }, students: { $sum: 1 } } },
            ],
          },
        },
      ]),
      PracticeQuiz.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            generated: { $sum: 1 },
            submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
            avgScore: {
              $avg: {
                $cond: [{ $eq: ['$status', 'submitted'] }, { $divide: ['$score', { $max: [{ $size: '$questions' }, 1] }] }, '$$REMOVE'],
              },
            },
          },
        },
      ]),
      AISafetyFlag.countDocuments({ status: 'open' }),
      AISafetyFlag.countDocuments({ status: 'open', severity: 'urgent' }),
    ]);

    const totals = facets.totals[0] || { questions: 0, blocked: 0, errors: 0, students: 0, conversations: 0 };

    // Every day in the range, including days with no questions.
    const byDate = new Map(facets.daily.map((d) => [d.date, d]));
    const daily = Array.from({ length: days }, (_, i) => {
      const date = istDateKey(new Date(since.getTime() + i * DAY_MS));
      return { date, questions: byDate.get(date)?.questions || 0, students: byDate.get(date)?.students || 0 };
    });

    const byHour = new Map(facets.hours.map((h) => [h._id, h.questions]));
    const modes = Object.fromEntries(facets.modes.map((m) => [m._id || 'text', m.count]));

    res.json({
      success: true,
      range,
      since,
      totals: {
        ...totals,
        avgPerStudent: totals.students ? Math.round((totals.questions / totals.students) * 10) / 10 : 0,
      },
      daily,
      inputModes: { text: modes.text || 0, voice: modes.voice || 0, image: modes.image || 0 },
      subjects: facets.subjects.map((s) => ({ subject: s._id || 'General', questions: s.questions })),
      topics: facets.topics.map((t) => ({ topic: t._id.topic, subject: t._id.subject, questions: t.questions })),
      classes: facets.classes
        .map((c) => ({ classId: String(c._id), questions: c.questions, students: c.students }))
        .sort((a, b) => (parseInt(a.classId.match(/\d+/)?.[0], 10) || 99) - (parseInt(b.classId.match(/\d+/)?.[0], 10) || 99)),
      peakHours: Array.from({ length: 24 }, (_, hour) => ({ hour, questions: byHour.get(hour) || 0 })),
      quizzes: {
        generated: quizRow?.generated || 0,
        submitted: quizRow?.submitted || 0,
        avgScorePct: quizRow?.avgScore == null ? null : Math.round(quizRow.avgScore * 100),
      },
      safety: { open: openFlags, urgentOpen: urgentFlags },
    });
  } catch (err) {
    sendError(res, err);
  }
};

// ---- Safety review ----

const serializeFlag = (flag) => ({
  id: String(flag._id),
  reason: flag.reason,
  severity: flag.severity,
  status: flag.status,
  excerpt: flag.excerpt,
  occurrences: flag.occurrences,
  createdAt: flag.createdAt,
  lastSeenAt: flag.lastSeenAt,
  reviewedBy: flag.reviewedBy,
  reviewedAt: flag.reviewedAt,
  note: flag.note,
  conversationId: String(flag.conversation),
  student: flag.user && typeof flag.user === 'object' && flag.user.name !== undefined
    ? { id: String(flag.user._id), name: flag.user.name, classId: flag.user.classId, board: flag.user.board, studentId: flag.user.studentId }
    : null,
});

const STUDENT_FIELDS = 'name classId board studentId';

// @route GET /api/ai/admin/flags?status=open|resolved|dismissed|all&page=&limit=
export const listFlags = async (req, res) => {
  try {
    const status = readEnum(req.query.status, 'status', [...FLAG_STATUSES, 'all'], 'open');
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = status === 'all' ? {} : { status };

    const [flags, total, open, urgentOpen] = await Promise.all([
      AISafetyFlag.find(filter)
        .sort({ severity: -1, lastSeenAt: -1 }) // 'urgent' sorts before 'normal'
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', STUDENT_FIELDS)
        .lean(),
      AISafetyFlag.countDocuments(filter),
      AISafetyFlag.countDocuments({ status: 'open' }),
      AISafetyFlag.countDocuments({ status: 'open', severity: 'urgent' }),
    ]);
    res.json({ success: true, flags: flags.map(serializeFlag), total, page, limit, counts: { open, urgentOpen } });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/ai/admin/flags/:id — the flag plus the surrounding conversation
export const getFlag = async (req, res) => {
  try {
    const id = readObjectId(req.params.id, 'flag id');
    const flag = await AISafetyFlag.findById(id).populate('user', STUDENT_FIELDS).lean();
    if (!flag) throw notFound('Flag not found');

    const chat = await AITutorChat.findById(flag.conversation).select('title subject messages').lean();
    let messages = [];
    if (chat) {
      const idx = flag.messageId ? chat.messages.findIndex((m) => String(m._id) === String(flag.messageId)) : -1;
      const end = idx >= 0 ? idx + 2 : chat.messages.length;
      messages = chat.messages.slice(Math.max(0, end - 10), end).map((m) => ({
        id: String(m._id),
        sender: m.sender,
        text: m.text,
        inputMode: m.inputMode,
        status: m.status,
        timestamp: m.timestamp,
        flagged: String(m._id) === String(flag.messageId),
      }));
    }

    res.json({
      success: true,
      flag: serializeFlag(flag),
      conversation: chat ? { title: chat.title, subject: chat.subject, messages } : null,
    });
  } catch (err) {
    sendError(res, err);
  }
};

// @route PATCH /api/ai/admin/flags/:id   body: { status, note? }
export const updateFlag = async (req, res) => {
  try {
    const id = readObjectId(req.params.id, 'flag id');
    const status = readEnum(req.body?.status, 'status', FLAG_STATUSES, undefined);
    const note = readString(req.body?.note, 'note', 1000);
    if (!status && note === undefined) throw badRequest('Nothing to update');

    const update = { reviewedBy: req.user.name || req.user.email || 'Admin', reviewedAt: new Date() };
    if (status) update.status = status;
    if (note !== undefined) update.note = note;

    const flag = await AISafetyFlag.findByIdAndUpdate(id, { $set: update }, { new: true }).populate('user', STUDENT_FIELDS).lean();
    if (!flag) throw notFound('Flag not found');
    res.json({ success: true, flag: serializeFlag(flag) });
  } catch (err) {
    sendError(res, err);
  }
};
