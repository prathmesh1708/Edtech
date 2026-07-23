import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a reference to a User'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please add a reference to a Subject'],
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Please add a reference to a Chapter'],
    },
    title: {
      type: String,
      required: [true, 'Please add a note title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add note content'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups of a user's notes for a subject/chapter
noteSchema.index({ user: 1, subject: 1, chapter: 1 });

const Note = mongoose.model('Note', noteSchema);
export default Note;
