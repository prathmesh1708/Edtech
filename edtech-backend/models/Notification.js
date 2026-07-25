import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a notification title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please specify notification message text'],
      trim: true,
    },
    target: {
      type: String,
      enum: ['All Users', 'Students', 'Teachers', 'Parents'],
      default: 'All Users',
    },
    category: {
      type: String,
      enum: ['Announcement', 'Reminder', 'Warning', 'Syllabus Update'],
      default: 'Announcement',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    readStatus: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'info',
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ target: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
