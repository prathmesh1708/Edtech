import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please add a reference to a Subject'],
    },
    title: {
      type: String,
      required: [true, 'Please add a chapter title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Please add an order index for chapter sorting'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of chapter orders within a subject
chapterSchema.index({ subject: 1, order: 1 });

const Chapter = mongoose.model('Chapter', chapterSchema);
export default Chapter;
