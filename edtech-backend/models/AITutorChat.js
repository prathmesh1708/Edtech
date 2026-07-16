import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: [true, 'Please specify who sent this message'],
  },
  text: {
    type: String,
    required: [true, 'Message text cannot be empty'],
    trim: true,
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
    subjectId: {
      type: String,
      required: [true, 'Please add a subjectId associated with the chat'],
      trim: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

aiTutorChatSchema.index({ user: 1, subjectId: 1 });

const AITutorChat = mongoose.model('AITutorChat', aiTutorChatSchema);
export default AITutorChat;
