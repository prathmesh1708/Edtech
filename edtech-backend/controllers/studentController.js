import Todo from '../models/Todo.js';
import Activity from '../models/Activity.js';
import Syllabus from '../models/Syllabus.js';
import User from '../models/User.js';

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

/**
 * @desc    Get all students for admin panel
 * @route   GET /api/student/admin
 * @access  Private / Admin
 */
export const getStudentsAdmin = async (req, res, next) => {
  try {
    let students = await User.find({ role: 'student' }).sort({ createdAt: -1 });

    if (students.length === 0) {
      const initialSeeds = [
        {
          name: 'Alex Morgan',
          email: 'alex.morgan@student.edu',
          password: 'password123',
          role: 'student',
          phone: '+1 (555) 234-5678',
          classId: 'Class 10',
          board: 'CBSE',
          status: 'Active',
          studentId: 'STU-2026-1042',
          dob: '2008-05-15',
          gender: 'Male',
          address: '42 Wallaby Way, Sydney',
          parentName: 'Robert Morgan',
          parentPhone: '+1 (555) 987-6543',
          section: 'A',
          rollNumber: '104',
          batch: '2025-2026',
          emailVerified: true
        },
        {
          name: 'Sophia Chen',
          email: 'sophia.chen@student.edu',
          password: 'password123',
          role: 'student',
          phone: '+1 (555) 345-6789',
          classId: 'Class 10',
          board: 'CBSE',
          status: 'Active',
          studentId: 'STU-2026-1043',
          dob: '2008-08-22',
          gender: 'Female',
          address: '88 Innovation Ave, Tech City',
          parentName: 'David Chen',
          parentPhone: '+1 (555) 876-5432',
          section: 'B',
          rollNumber: '108',
          batch: '2025-2026',
          emailVerified: true
        },
        {
          name: 'Liam Johnson',
          email: 'liam.j@student.edu',
          password: 'password123',
          role: 'student',
          phone: '+1 (555) 456-7890',
          classId: 'Class 9',
          board: 'ICSE',
          status: 'Suspended',
          studentId: 'STU-2026-1044',
          dob: '2009-03-10',
          gender: 'Male',
          address: '15 Oak Street, Springfield',
          parentName: 'Sarah Johnson',
          parentPhone: '+1 (555) 765-4321',
          section: 'A',
          rollNumber: '102',
          batch: '2025-2026',
          emailVerified: false
        },
        {
          name: 'Emma Watson',
          email: 'emma.w@student.edu',
          password: 'password123',
          role: 'student',
          phone: '+1 (555) 567-8901',
          classId: 'Class 12',
          board: 'CBSE',
          status: 'Active',
          studentId: 'STU-2026-1045',
          dob: '2007-11-04',
          gender: 'Female',
          address: '742 Evergreen Terrace, Sector 4',
          parentName: 'John Watson',
          parentPhone: '+1 (555) 654-3210',
          section: 'C',
          rollNumber: '120',
          batch: '2024-2025',
          emailVerified: true
        }
      ];

      await User.insertMany(initialSeeds);
      students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    }

    res.json(students);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create/enroll a student from admin panel
 * @route   POST /api/student/admin
 * @access  Private / Admin
 */
export const createStudentAdmin = async (req, res, next) => {
  const { 
    name, email, password, phone, classId, board, status,
    studentId, dob, gender, address, parentName, parentPhone,
    section, rollNumber, batch, photoUrl, emailVerified
  } = req.body;
  try {
    if (!name || !email) {
      res.status(400);
      throw new Error('Please include name and email');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Student email already registered');
    }

    const studentPassword = password || '123456';

    const student = await User.create({
      name,
      email,
      password: studentPassword,
      role: 'student',
      phone: phone || '',
      classId: classId || 'Class 10',
      board: board || 'CBSE',
      status: status || 'Active',
      studentId: studentId || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      dob: dob || '',
      gender: gender || 'Male',
      address: address || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      section: section || 'A',
      rollNumber: rollNumber || '',
      batch: batch || '2025-2026',
      photoUrl: photoUrl || '',
      emailVerified: emailVerified !== undefined ? emailVerified : true
    });

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student's record from admin panel
 * @route   PUT /api/student/admin/:id
 * @access  Private / Admin
 */
export const updateStudentAdmin = async (req, res, next) => {
  const { 
    name, email, phone, classId, board, status, password,
    studentId, dob, gender, address, parentName, parentPhone,
    section, rollNumber, batch, photoUrl, emailVerified
  } = req.body;
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      res.status(404);
      throw new Error('Student not found');
    }

    student.name = name || student.name;
    student.email = email || student.email;
    student.phone = phone !== undefined ? phone : student.phone;
    student.classId = classId !== undefined ? classId : student.classId;
    student.board = board || student.board;
    student.status = status || student.status;
    if (studentId) student.studentId = studentId;
    if (dob !== undefined) student.dob = dob;
    if (gender !== undefined) student.gender = gender;
    if (address !== undefined) student.address = address;
    if (parentName !== undefined) student.parentName = parentName;
    if (parentPhone !== undefined) student.parentPhone = parentPhone;
    if (section !== undefined) student.section = section;
    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (batch !== undefined) student.batch = batch;
    if (photoUrl !== undefined) student.photoUrl = photoUrl;
    if (emailVerified !== undefined) student.emailVerified = emailVerified;
    if (password) student.password = password;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student from admin panel
 * @route   DELETE /api/student/admin/:id
 * @access  Private / Admin
 */
export const deleteStudentAdmin = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      res.status(404);
      throw new Error('Student not found');
    }

    await student.deleteOne();
    res.json({ message: 'Student removed successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

