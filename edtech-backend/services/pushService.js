import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { getMessaging } from '../config/firebase.js';

const BATCH_SIZE = 500; // FCM multicast limit

const TARGET_ROLES = {
  Students: ['student'],
  Teachers: ['instructor'],
  Parents: ['parent'],
};

const INVALID_TOKEN_CODES = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
];

const collectTokens = async (target) => {
  const roles = TARGET_ROLES[target];
  const userFilter = { 'fcmTokens.0': { $exists: true }, ...(roles && { role: { $in: roles } }) };

  const users = await User.find(userFilter).select('fcmTokens');
  const admins = roles ? [] : await Admin.find({ 'fcmTokens.0': { $exists: true } }).select('fcmTokens');

  return [...users, ...admins].flatMap((u) => u.fcmTokens.map((t) => t.token));
};

const pruneTokens = async (tokens) => {
  if (!tokens.length) return;
  await Promise.all([User, Admin].map((Model) =>
    Model.updateMany({ 'fcmTokens.token': { $in: tokens } }, { $pull: { fcmTokens: { token: { $in: tokens } } } })
  ));
};

/**
 * Sends a push notification to every saved device of the targeted audience
 * ('All Users' | 'Students' | 'Teachers' | 'Parents'). Never throws — push is best-effort.
 */
export const sendPushToTarget = async (target, { title, body, data = {} }) => {
  try {
    const messaging = getMessaging();
    if (!messaging) {
      console.warn('Push skipped: Firebase credentials are not configured');
      return { sent: 0, failed: 0 };
    }

    const tokens = [...new Set(await collectTokens(target))];
    let sent = 0;
    const invalid = [];

    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
        data,
      });
      sent += response.successCount;
      response.responses.forEach((r, idx) => {
        if (!r.success && INVALID_TOKEN_CODES.includes(r.error?.code)) invalid.push(batch[idx]);
      });
    }

    await pruneTokens(invalid);
    return { sent, failed: tokens.length - sent };
  } catch (error) {
    console.error('Push notification failed:', error.message);
    return { sent: 0, failed: 0 };
  }
};
