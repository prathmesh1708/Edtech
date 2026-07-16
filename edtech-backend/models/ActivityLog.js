import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a reference to a User'],
    },
    text: {
      type: String,
      required: [true, 'Please specify the activity text'],
      trim: true,
    },
    badge: {
      type: String,
      required: [true, 'Please specify the category/badge for the activity'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ user: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
