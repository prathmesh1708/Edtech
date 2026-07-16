import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a reference to a User'],
    },
    text: {
      type: String,
      required: [true, 'Please add task text'],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

todoSchema.index({ user: 1, completed: 1 });

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;
