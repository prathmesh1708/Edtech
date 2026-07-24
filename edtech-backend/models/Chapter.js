import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    chapterName: {
      type: String,
      required: [true, 'Please add a chapter name'],
      trim: true
    },
    chapterNumber: {
      type: Number,
      required: [true, 'Please add a chapter number'],
      default: 1
    },
    subject: {
      type: String,
      required: [true, 'Please select a subject'],
      default: 'Mathematics'
    },
    board: {
      type: String,
      required: [true, 'Please select a board'],
      default: 'CBSE'
    },
    classId: {
      type: String,
      required: [true, 'Please select a class'],
      default: 'Class 10'
    },
    description: {
      type: String,
      default: ''
    },
    learningObjectives: {
      type: String,
      default: ''
    },
    estimatedStudyTime: {
      type: String,
      default: '4 Hours'
    },
    orderIndex: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Chapter = mongoose.model('Chapter', chapterSchema);

export default Chapter;
