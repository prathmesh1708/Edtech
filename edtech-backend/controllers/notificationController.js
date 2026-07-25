import Notification from '../models/Notification.js';

// Helper for relative time formatting
const getRelativeTime = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
};

// Default seed data if DB is empty
const initialSeedLogs = [
  { customId: 'NTF001', title: 'System Maintenance Scheduled', message: 'The study platform will undergo scheduled maintenance this Sunday from 2 AM to 4 AM IST. Live classes will not be available.', target: 'All Users', category: 'Warning' },
  { customId: 'NTF002', title: 'Mathematics Exam Postponed', message: 'The mock test for Mathematics Class 10 scheduled for tomorrow has been rescheduled to Friday at 10 AM.', target: 'Students', category: 'Reminder' },
  { customId: 'NTF003', title: 'New Physics Study Material Uploaded', message: 'Chapter 5 Lecture Notes on Electrostatics are now available in the Syllabus & Content portal.', target: 'Students', category: 'Syllabus Update' },
  { customId: 'NTF004', title: 'Faculty Meet Reminder', message: 'Please attend the monthly alignment meeting today at 4:00 PM in Seminar Hall B.', target: 'Teachers', category: 'Announcement' },
];

// @desc    Broadcast a new notification (Admin)
// @route   POST /api/notifications/broadcast
// @access  Public / Admin
export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, target, category } = req.body;

    if (!title || !message) {
      res.status(400);
      throw new Error('Title and message body are required');
    }

    // Generate customId like NTF005
    const existing = await Notification.find().sort({ createdAt: -1 });
    let maxId = 0;
    existing.forEach((n) => {
      if (n.customId && n.customId.startsWith('NTF')) {
        const num = parseInt(n.customId.replace('NTF', ''), 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      }
    });
    const nextIdNum = maxId + 1;
    const customId = `NTF${String(nextIdNum).padStart(3, '0')}`;

    const newNotification = await Notification.create({
      customId,
      title,
      message,
      target: target || 'All Users',
      category: category || 'Announcement',
    });

    res.status(201).json({
      id: newNotification.customId,
      _id: newNotification._id,
      title: newNotification.title,
      message: newNotification.message,
      target: newNotification.target,
      category: newNotification.category,
      time: 'Just now',
      createdAt: newNotification.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications for Admin history log
// @route   GET /api/notifications/admin
// @access  Public / Admin
export const getAdminNotifications = async (req, res, next) => {
  try {
    let notifications = await Notification.find().sort({ createdAt: -1 });

    // Pre-seed default records if database has no notifications
    if (notifications.length === 0) {
      notifications = await Notification.insertMany(initialSeedLogs);
    }

    const formatted = notifications.map((n) => ({
      id: n.customId || n._id.toString(),
      _id: n._id,
      title: n.title,
      message: n.message,
      target: n.target,
      category: n.category,
      time: getRelativeTime(n.createdAt),
      createdAt: n.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification log
// @route   DELETE /api/notifications/:id
// @access  Public / Admin
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    let deleted;

    // Try finding by _id first or customId
    if (id.startsWith('NTF')) {
      deleted = await Notification.findOneAndDelete({ customId: id });
    } else {
      deleted = await Notification.findByIdAndDelete(id);
    }

    if (!deleted) {
      // If not found by customId, try by _id
      deleted = await Notification.findByIdAndDelete(id);
    }

    if (deleted) {
      res.json({ message: 'Notification deleted successfully', id });
    } else {
      res.status(404);
      throw new Error('Notification not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications (filtered by role / targeted group)
// @route   GET /api/notifications/user
// @access  Public / User
export const getUserNotifications = async (req, res, next) => {
  try {
    const roleParam = (req.query.role || req.user?.role || 'student').toLowerCase();
    const userId = req.user?._id || req.query.userId;

    let targetGroups = ['All Users'];
    if (roleParam === 'student') {
      targetGroups.push('Students');
    } else if (roleParam === 'teacher' || roleParam === 'instructor') {
      targetGroups.push('Teachers');
    } else if (roleParam === 'parent') {
      targetGroups.push('Parents');
    }

    // Build query conditions
    const query = {
      $or: [
        { target: { $in: targetGroups } },
      ],
    };

    if (userId) {
      query.$or.push({ user: userId });
    }

    let notifications = await Notification.find(query).sort({ createdAt: -1 });

    // Seed if empty
    if (notifications.length === 0 && (await Notification.countDocuments()) === 0) {
      await Notification.insertMany(initialSeedLogs);
      notifications = await Notification.find(query).sort({ createdAt: -1 });
    }

    const formatted = notifications.map((n) => {
      const isRead = userId && n.readBy
        ? n.readBy.some((id) => id.toString() === userId.toString())
        : n.readStatus;

      return {
        id: n._id.toString(),
        customId: n.customId,
        title: n.title,
        text: `${n.title}: ${n.message}`,
        message: n.message,
        target: n.target,
        category: n.category,
        time: getRelativeTime(n.createdAt),
        read: Boolean(isRead),
        createdAt: n.createdAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Public / User
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.body.userId;

    const notification = await Notification.findById(id) || await Notification.findOne({ customId: id });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (userId) {
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    }
    notification.readStatus = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', id });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read for a user
// @route   PATCH /api/notifications/read-all
// @access  Public / User
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (userId) {
      await Notification.updateMany(
        { readBy: { $ne: userId } },
        { $addToSet: { readBy: userId }, $set: { readStatus: true } }
      );
    } else {
      await Notification.updateMany({}, { $set: { readStatus: true } });
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
