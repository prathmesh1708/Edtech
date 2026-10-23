import mongoose from 'mongoose';

// Only the kind/type of an attachment is stored. The image or audio itself is sent to
// Gemini for that one turn and never persisted.
const attachmentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['image', 'audio'], required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: [true, 'Please specify who sent this message'],
  },
  text: {
    type: String,
    default: '',
    trim: true,
  },
  inputMode: {
    type: String,
    enum: ['text', 'voice', 'image'],
    default: 'text',
  },
  attachments: [attachmentSchema],
  // complete: full answer; stopped: student pressed Stop or disconnected;
  // blocked: safety filter; error: the stream failed part-way.
  status: {
    type: String,
    enum: ['complete', 'stopped', 'blocked', 'error'],
    default: 'complete',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const aiTutorChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a reference to a User'],
    },
    title: {
      type: String,
      default: 'New chat',
      trim: true,
      maxlength: 120,
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    // Where the chat was started from (chapter page, study material, ...).
    context: {
      chapterId: { type: String },
      chapterName: { type: String },
      materialId: { type: String },
      materialTitle: { type: String },
      topic: { type: String },
    },
    messages: [messageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

aiTutorChatSchema.index({ user: 1, lastMessageAt: -1 });
aiTutorChatSchema.index({ user: 1, subject: 1, lastMessageAt: -1 });

const AITutorChat = mongoose.model('AITutorChat', aiTutorChatSchema);
export default AITutorChat;
