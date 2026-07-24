import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    boardName: {
      type: String,
      required: [true, 'Please add a board name'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    logoUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    assignedSyllabus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GlobalSyllabus',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Board = mongoose.model('Board', boardSchema);

export default Board;
