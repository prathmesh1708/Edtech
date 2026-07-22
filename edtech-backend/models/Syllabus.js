import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, default: 'PDF' },
  url: { type: String, default: '' },
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  topics: [topicSchema],
  resources: [resourceSchema],
});

const syllabusSchema = new mongoose.Schema(
  {
    board: {
      type: String,
      required: [true, 'Please specify education board (e.g. cbse, icse, state)'],
      lowercase: true,
      trim: true,
    },
    class: {
      type: String,
      required: [true, 'Please specify class (e.g. 9, 10, 11, 12)'],
      trim: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Please specify subject name'],
      trim: true,
    },
    subjectCode: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#4F6EF7',
    },
    icon: {
      type: String,
      default: 'BookOpen',
    },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published',
    },
    chapters: [chapterSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

const Syllabus = mongoose.model('Syllabus', syllabusSchema);

export default Syllabus;
