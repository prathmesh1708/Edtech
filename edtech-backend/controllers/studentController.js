import Todo from '../models/Todo.js';
import Activity from '../models/Activity.js';
import Syllabus from '../models/Syllabus.js';

const DEFAULT_TODOS = [
  { id: 'todo-1', text: 'Complete Math Quiz on Real Numbers', completed: true },
  { id: 'todo-2', text: 'Read Biology Chapter 3 summary notes', completed: false },
  { id: 'todo-3', text: 'Solve 3 chemistry doubts with AI Tutor', completed: false },
  { id: 'todo-4', text: 'Revise English grammar notes', completed: false }
];

const DEFAULT_ACTIVITIES = [
  { id: 'act-1', text: 'Completed: real numbers test quiz', badge: 'Practice' },
  { id: 'act-2', text: 'Asked AI Tutor about "osmosis"', badge: 'AI Doubts' },
  { id: 'act-3', text: 'Created chemistry notes on carbon', badge: 'Notes' },
  { id: 'act-4', text: 'Completed 12m Mathematics Video lesson', badge: 'Video' }
];

// Helper to seed initial student todos if collection is empty
const seedTodosIfEmpty = async (userId) => {
  try {
    const filter = userId ? { user: userId } : {};
    const count = await Todo.countDocuments(filter).maxTimeMS(3000);
    if (count === 0) {
      const todosToInsert = DEFAULT_TODOS.map(t => ({ text: t.text, completed: t.completed, user: userId || null }));
      await Todo.insertMany(todosToInsert);
    }
  } catch (err) {
    console.warn('Skipping todo seed due to DB timeout:', err.message);
  }
};

// Helper to seed initial activities if collection is empty
const seedActivitiesIfEmpty = async (userId) => {
  try {
    const filter = userId ? { user: userId } : {};
    const count = await Activity.countDocuments(filter).maxTimeMS(3000);
    if (count === 0) {
      const actsToInsert = DEFAULT_ACTIVITIES.map(a => ({ text: a.text, badge: a.badge, user: userId || null }));
      await Activity.insertMany(actsToInsert);
    }
  } catch (err) {
    console.warn('Skipping activity seed due to DB timeout:', err.message);
  }
};

/**
 * @desc    Get student dashboard data (stats, enrolled subjects, todos, activities)
 * @route   GET /api/student/dashboard
 * @access  Public / Student
 */
export const getDashboardData = async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const board = (req.query.board || req.user?.board || 'cbse').toLowerCase();
  const classVal = String(req.query.class || req.user?.classId || '10');

  try {
    await seedTodosIfEmpty(userId);
    await seedActivitiesIfEmpty(userId);

    // Fetch subjects from Syllabus collection
    const syllabuses = await Syllabus.find({ board, class: classVal, status: 'Published' }).maxTimeMS(3000);

    let totalChapters = 0;
    let totalProgressSum = 0;

    const subjects = syllabuses.map(item => {
      const chapterCount = item.chapters ? item.chapters.length : 0;
      let subjectAvgProgress = 0;
      if (chapterCount > 0) {
        const sumProg = item.chapters.reduce((acc, ch) => acc + (ch.progress || 0), 0);
        subjectAvgProgress = Math.round(sumProg / chapterCount);
      }
      totalChapters += chapterCount;
      totalProgressSum += subjectAvgProgress;

      return {
        id: item._id,
        name: item.subjectName,
        code: item.subjectCode,
        color: item.color || '#4F6EF7',
        chapters: `${chapterCount} ${chapterCount === 1 ? 'Chapter' : 'Chapters'}`,
        chapterCount,
        progress: subjectAvgProgress
      };
    });

    const overallSyllabusProgress = subjects.length > 0 ? Math.round(totalProgressSum / subjects.length) : 64;

    const todoFilter = userId ? { user: userId } : {};
    const todos = await Todo.find(todoFilter).sort({ createdAt: -1 }).maxTimeMS(3000);

    const activityFilter = userId ? { user: userId } : {};
    const activities = await Activity.find(activityFilter).sort({ createdAt: -1 }).limit(6).maxTimeMS(3000);

    res.json({
      stats: {
        overallSyllabusProgress,
        aiQueriesCount: 42,
        studyHours: 18.5,
        classRank: '#3',
        streak: 5
      },
      subjects,
      todos: todos.map(t => ({ id: t._id, text: t.text, completed: t.completed })),
      activities: activities.map(a => ({ id: a._id, text: a.text, badge: a.badge, createdAt: a.createdAt }))
    });
  } catch (error) {
    console.warn('MongoDB query timed out in getDashboardData, returning fallback response:', error.message);
    res.json({
      stats: {
        overallSyllabusProgress: 50,
        aiQueriesCount: 42,
        studyHours: 18.5,
        classRank: '#3',
        streak: 5
      },
      subjects: [
        { id: 'sub-1', name: 'Mathematics', code: 'MATH-10', color: '#4F6EF7', chapters: '4 Chapters', chapterCount: 4, progress: 75 },
        { id: 'sub-2', name: 'Science', code: 'SCI-10', color: '#22C55E', chapters: '3 Chapters', chapterCount: 3, progress: 50 }
      ],
      todos: DEFAULT_TODOS,
      activities: DEFAULT_ACTIVITIES
    });
  }
};

/**
 * @desc    Get student todos
 * @route   GET /api/student/todos
 * @access  Public / Student
 */
export const getTodos = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    await seedTodosIfEmpty(userId);
    const filter = userId ? { user: userId } : {};
    const todos = await Todo.find(filter).sort({ createdAt: -1 }).maxTimeMS(3000);
    res.json(todos.map(t => ({ id: t._id, text: t.text, completed: t.completed })));
  } catch (error) {
    console.warn('MongoDB query timed out in getTodos, returning default todos:', error.message);
    res.json(DEFAULT_TODOS);
  }
};

/**
 * @desc    Create new todo task
 * @route   POST /api/student/todos
 * @access  Public / Student
 */
export const createTodo = async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Task text is required' });
  }

  const todoObj = {
    id: `td-${Date.now()}`,
    text: text.trim(),
    completed: false
  };

  try {
    const todo = new Todo({
      user: req.user ? req.user._id : null,
      text: text.trim(),
      completed: false
    });
    const savedTodo = await todo.save();
    res.status(201).json({ id: savedTodo._id, text: savedTodo.text, completed: savedTodo.completed });
  } catch (error) {
    console.warn('MongoDB save timed out in createTodo, returning memory item:', error.message);
    res.status(201).json(todoObj);
  }
};

/**
 * @desc    Toggle todo completion status
 * @route   PUT /api/student/todos/:id
 * @access  Public / Student
 */
export const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id).maxTimeMS(3000);
    if (todo) {
      todo.completed = !todo.completed;
      const updatedTodo = await todo.save();
      return res.json({ id: updatedTodo._id, text: updatedTodo.text, completed: updatedTodo.completed });
    }
  } catch (error) {
    console.warn('MongoDB query failed in toggleTodo:', error.message);
  }
  res.json({ id: req.params.id, completed: true });
};

/**
 * @desc    Delete todo task
 * @route   DELETE /api/student/todos/:id
 * @access  Public / Student
 */
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id).maxTimeMS(3000);
    if (todo) {
      await todo.deleteOne();
    }
  } catch (error) {
    console.warn('MongoDB delete failed in deleteTodo:', error.message);
  }
  res.json({ message: 'Task removed successfully', id: req.params.id });
};
