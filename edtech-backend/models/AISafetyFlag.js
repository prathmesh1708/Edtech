import mongoose from 'mongoose';

// A student AI conversation that staff should review: a Gemini safety block, or a
// message mentioning self-harm or abuse. Repeats in the same conversation for the same
// reason update one open flag instead of creating many.
const aiSafetyFlagSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AITutorChat',
      required: true,
    },
    // The student message that triggered the (latest) flag.
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    reason: {
      type: String,
      enum: ['self_harm', 'abuse', 'blocked'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['urgent', 'normal'],
      default: 'normal',
    },
    excerpt: {
      type: String,
      default: '',
      maxlength: 500,
    },
    occurrences: {
      type: Number,
      default: 1,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'dismissed'],
      default: 'open',
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    note: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

aiSafetyFlagSchema.index({ status: 1, severity: 1, lastSeenAt: -1 });
aiSafetyFlagSchema.index({ conversation: 1, reason: 1, status: 1 });

const AISafetyFlag = mongoose.model('AISafetyFlag', aiSafetyFlagSchema);
export default AISafetyFlag;
