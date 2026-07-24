import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, 'Please add a subject name'],
      trim: true
    },
    subjectCode: {
      type: String,
      required: [true, 'Please add a subject code'],
      trim: true
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
    color: {
      type: String,
      default: '#1A73E8'
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

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
