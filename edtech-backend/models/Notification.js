import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a reference to a User'],
    },
    text: {
      type: String,
      required: [true, 'Please specify notification message text'],
      trim: true,
    },
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

notificationSchema.index({ user: 1, readStatus: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
