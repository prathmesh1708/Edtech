import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: [(v) => v.length === 4, 'A question needs exactly 4 options'],
    },
    // Kept server-side until the quiz is submitted.
    answerIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const practiceQuizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    context: {
      chapterId: { type: String },
      chapterName: { type: String },
      topic: { type: String },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [questionSchema],
    status: {
      type: String,
      enum: ['in_progress', 'submitted'],
      default: 'in_progress',
    },
    // Chosen option per question (null = skipped), set on submit.
    responses: [{ type: Number, default: null }],
    score: { type: Number },
    submittedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

practiceQuizSchema.index({ user: 1, createdAt: -1 });

const PracticeQuiz = mongoose.model('PracticeQuiz', practiceQuizSchema);
export default PracticeQuiz;
