import AISafetyFlag from '../models/AISafetyFlag.js';
import { URGENT_REASONS } from '../utils/aiSafety.js';
import { sendPushToTarget } from './pushService.js';

/**
 * Records a conversation for staff review. Best-effort: never throws, so a logging
 * problem can't break the student's chat.
 *
 * @param {{ userId: object, conversationId: object, messageId?: object, reason: 'self_harm'|'abuse'|'blocked', excerpt?: string }} params
 */
export const recordSafetyFlag = async ({ userId, conversationId, messageId, reason, excerpt = '' }) => {
  try {
    const severity = URGENT_REASONS.includes(reason) ? 'urgent' : 'normal';
    const trimmed = excerpt.slice(0, 500);

    const existing = await AISafetyFlag.findOneAndUpdate(
      { conversation: conversationId, reason, status: 'open' },
      { $inc: { occurrences: 1 }, $set: { lastSeenAt: new Date(), messageId, ...(trimmed && { excerpt: trimmed }) } },
      { new: true }
    );
    if (existing) return existing;

    const flag = await AISafetyFlag.create({ user: userId, conversation: conversationId, messageId, reason, severity, excerpt: trimmed });

    // Lock screens can be seen by anyone nearby: the push names no student and quotes nothing.
    if (severity === 'urgent') {
      sendPushToTarget('Admins', {
        title: 'AI Safety Review: urgent',
        body: 'A student conversation needs review. Open AI Safety Review in the admin panel.',
        data: { type: 'ai_safety_flag', flagId: String(flag._id) },
      });
    }
    return flag;
  } catch (err) {
    console.error('[ai-safety] could not record flag:', err.message);
    return null;
  }
};
