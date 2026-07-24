import mongoose from 'mongoose';

const globalSyllabusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a syllabus name'],
      trim: true
    },
    academicYear: {
      type: String,
      required: [true, 'Please specify the academic year'],
      default: '2025-2026'
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published'
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const GlobalSyllabus = mongoose.model('GlobalSyllabus', globalSyllabusSchema);

export default GlobalSyllabus;
