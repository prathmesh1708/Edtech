import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a subject name'],
      trim: true,
    },
    subjectId: {
      type: String,
      required: [true, 'Please add a subject ID/slug'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#4F6EF7',
    },
    board: {
      type: String,
      required: [true, 'Please add a board name'],
      trim: true,
    },
    classId: {
      type: String,
      required: [true, 'Please add a class ID'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create unique compound index for subject per board and class
subjectSchema.index({ subjectId: 1, board: 1, classId: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
