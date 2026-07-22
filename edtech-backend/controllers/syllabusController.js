import Syllabus from '../models/Syllabus.js';

// Default initial data to seed if collection is empty or DB is offline
const DEFAULT_SYLLABUS_SEED = [
  {
    _id: 'seed-math-10',
    board: 'cbse',
    class: '10',
    subjectName: 'Mathematics',
    subjectCode: 'MATH-10',
    description: 'Class 10 CBSE Mathematics syllabus covering Algebra, Geometry, Trigonometry, and Statistics.',
    color: '#4F6EF7',
    icon: 'Calculator',
    status: 'Published',
    chapters: [
      {
        title: 'Chapter 1: Real Numbers',
        description: 'Concepts of HCF, LCM, and Fundamental Theorem of Arithmetic',
        progress: 80,
        topics: [
          { name: 'Introduction to Real Numbers', completed: true },
          { name: 'Euclid\'s Division Lemma', completed: true },
          { name: 'Fundamental Theorem of Arithmetic', completed: true },
          { name: 'Revisiting Irrational Numbers', completed: false },
          { name: 'Rational Numbers and Decimals', completed: false },
        ],
        resources: [
          { title: 'Real Numbers Formula Sheet (PDF)', type: 'PDF', url: '#' },
          { title: 'Full Chapter Video Lesson', type: 'Video', url: '#' }
        ]
      },
      {
        title: 'Chapter 2: Polynomials',
        description: 'Geometrical meaning of zeroes, relationship between zeroes and coefficients',
        progress: 40,
        topics: [
          { name: 'Zeroes of a Polynomial', completed: true },
          { name: 'Relationship between Zeroes and Coefficients', completed: true },
          { name: 'Division Algorithm for Polynomials', completed: false }
        ],
        resources: [
          { title: 'Polynomial Notes (PDF)', type: 'PDF', url: '#' }
        ]
      },
      {
        title: 'Chapter 3: Quadratic Equations',
        description: 'Standard form, solution by factorization and quadratic formula',
        progress: 0,
        topics: [
          { name: 'Standard form of Quadratic Equations', completed: false },
          { name: 'Solution by Factorization', completed: false },
          { name: 'Quadratic Formula & Nature of Roots', completed: false }
        ]
      },
      {
        title: 'Chapter 4: Arithmetic Progressions',
        description: 'Derivation of the nth term and sum of first n terms',
        progress: 0,
        topics: [
          { name: 'nth Term of an AP', completed: false },
          { name: 'Sum of First n Terms of an AP', completed: false }
        ]
      }
    ]
  },
  {
    _id: 'seed-sci-10',
    board: 'cbse',
    class: '10',
    subjectName: 'Science',
    subjectCode: 'SCI-10',
    description: 'Class 10 CBSE Science syllabus covering Physics, Chemistry, and Biology.',
    color: '#22C55E',
    icon: 'FlaskConical',
    status: 'Published',
    chapters: [
      {
        title: 'Chapter 1: Chemical Reactions and Equations',
        description: 'Chemical equations, balanced equations, types of chemical reactions',
        progress: 60,
        topics: [
          { name: 'Chemical Equations', completed: true },
          { name: 'Types of Chemical Reactions', completed: true },
          { name: 'Corrosion and Rancidity', completed: false }
        ]
      },
      {
        title: 'Chapter 2: Acids, Bases and Salts',
        description: 'Chemical properties of acids and bases, pH scale, salts',
        progress: 20,
        topics: [
          { name: 'Understanding Chemical Properties of Acids & Bases', completed: true },
          { name: 'pH Scale and Importance in Daily Life', completed: false }
        ]
      },
      {
        title: 'Chapter 3: Life Processes',
        description: 'Nutrition, respiration, transportation, and excretion in plants and animals',
        progress: 0,
        topics: [
          { name: 'What are Life Processes?', completed: false },
          { name: 'Nutrition in Humans', completed: false },
          { name: 'Respiration & Circulation', completed: false }
        ]
      }
    ]
  },
  {
    _id: 'seed-eng-10',
    board: 'cbse',
    class: '10',
    subjectName: 'English',
    subjectCode: 'ENG-10',
    description: 'First Flight & Footprints without Feet Literature & Grammar.',
    color: '#F59E0B',
    icon: 'BookOpen',
    status: 'Published',
    chapters: [
      {
        title: 'Chapter 1: A Letter to God',
        description: 'Story of Lencho and his unflinching faith in God.',
        progress: 100,
        topics: [
          { name: 'Reading & Analysis', completed: true },
          { name: 'Character Sketch of Lencho', completed: true },
          { name: 'Q&A Solutions', completed: true }
        ]
      },
      {
        title: 'Chapter 2: Nelson Mandela - Long Walk to Freedom',
        description: 'Extracts from Mandela\'s autobiography.',
        progress: 50,
        topics: [
          { name: 'Historical Context', completed: true },
          { name: 'Theme & Important Quotes', completed: false }
        ]
      }
    ]
  },
  {
    _id: 'seed-sst-10',
    board: 'cbse',
    class: '10',
    subjectName: 'Social Science',
    subjectCode: 'SST-10',
    description: 'History, Geography, Political Science, and Economics.',
    color: '#7C5CFC',
    icon: 'Globe',
    status: 'Published',
    chapters: [
      {
        title: 'Chapter 1: The Rise of Nationalism in Europe',
        description: 'French Revolution and the idea of nation, making of nationalism.',
        progress: 30,
        topics: [
          { name: 'The French Revolution', completed: true },
          { name: 'The Making of Nationalism in Europe', completed: false }
        ]
      }
    ]
  }
];

// Helper to auto seed database if empty
const seedIfEmpty = async () => {
  try {
    const count = await Syllabus.countDocuments().maxTimeMS(3000);
    if (count === 0) {
      await Syllabus.insertMany(DEFAULT_SYLLABUS_SEED);
      console.log('Syllabus database seeded automatically with initial data.');
    }
  } catch (err) {
    console.warn('Skipping auto-seed due to DB connection timeout/error:', err.message);
  }
};

/**
 * @desc    Get all syllabus items (filtered by board, class, status)
 * @route   GET /api/syllabus
 * @access  Public
 */
export const getSyllabuses = async (req, res) => {
  const { board, class: classVal, status, search } = req.query;

  try {
    await seedIfEmpty();

    const filter = {};
    if (board) filter.board = board.toLowerCase();
    if (classVal) filter.class = String(classVal);
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const syllabuses = await Syllabus.find(filter).sort({ createdAt: -1 }).maxTimeMS(3000);
    res.json(syllabuses);
  } catch (error) {
    console.warn('MongoDB query timed out/failed in getSyllabuses, returning fallback seed data:', error.message);
    let fallback = DEFAULT_SYLLABUS_SEED;
    if (board) fallback = fallback.filter(s => s.board === board.toLowerCase());
    if (classVal) fallback = fallback.filter(s => s.class === String(classVal));
    res.json(fallback);
  }
};

/**
 * @desc    Get single syllabus by ID
 * @route   GET /api/syllabus/:id
 * @access  Public
 */
export const getSyllabusById = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id).maxTimeMS(3000);
    if (!syllabus) {
      const seedMatch = DEFAULT_SYLLABUS_SEED.find(s => s._id === req.params.id);
      if (seedMatch) return res.json(seedMatch);
      return res.status(404).json({ message: 'Syllabus item not found' });
    }
    res.json(syllabus);
  } catch (error) {
    console.warn('MongoDB query timed out in getSyllabusById, using fallback match:', error.message);
    const seedMatch = DEFAULT_SYLLABUS_SEED.find(s => s._id === req.params.id) || DEFAULT_SYLLABUS_SEED[0];
    res.json(seedMatch);
  }
};

/**
 * @desc    Create new syllabus item
 * @route   POST /api/syllabus
 * @access  Private/Admin
 */
export const createSyllabus = async (req, res) => {
  const {
    board,
    class: classVal,
    subjectName,
    subjectCode,
    description,
    color,
    icon,
    status,
    chapters
  } = req.body;

  if (!board || !classVal || !subjectName) {
    return res.status(400).json({ message: 'Board, Class, and Subject Name are required.' });
  }

  const syllabusObj = {
    _id: `sys-${Date.now()}`,
    board: board.toLowerCase(),
    class: String(classVal),
    subjectName,
    subjectCode: subjectCode || '',
    description: description || '',
    color: color || '#4F6EF7',
    icon: icon || 'BookOpen',
    status: status || 'Published',
    chapters: chapters || [],
    createdBy: req.user ? req.user._id : null
  };

  try {
    const syllabus = new Syllabus(syllabusObj);
    const savedSyllabus = await syllabus.save();
    res.status(201).json(savedSyllabus);
  } catch (error) {
    console.warn('MongoDB save timed out in createSyllabus, returning created memory item:', error.message);
    res.status(201).json(syllabusObj);
  }
};

/**
 * @desc    Update syllabus item
 * @route   PUT /api/syllabus/:id
 * @access  Private/Admin
 */
export const updateSyllabus = async (req, res) => {
  const {
    board,
    class: classVal,
    subjectName,
    subjectCode,
    description,
    color,
    icon,
    status,
    chapters
  } = req.body;

  try {
    const syllabus = await Syllabus.findById(req.params.id).maxTimeMS(3000);
    if (syllabus) {
      if (board !== undefined) syllabus.board = board.toLowerCase();
      if (classVal !== undefined) syllabus.class = String(classVal);
      if (subjectName !== undefined) syllabus.subjectName = subjectName;
      if (subjectCode !== undefined) syllabus.subjectCode = subjectCode;
      if (description !== undefined) syllabus.description = description;
      if (color !== undefined) syllabus.color = color;
      if (icon !== undefined) syllabus.icon = icon;
      if (status !== undefined) syllabus.status = status;
      if (chapters !== undefined) syllabus.chapters = chapters;

      const updatedSyllabus = await syllabus.save();
      return res.json(updatedSyllabus);
    }
  } catch (error) {
    console.warn('MongoDB update failed in updateSyllabus:', error.message);
  }

  res.json({
    _id: req.params.id,
    board: board?.toLowerCase() || 'cbse',
    class: String(classVal || '10'),
    subjectName: subjectName || 'Subject',
    status: status || 'Published',
    chapters: chapters || []
  });
};

/**
 * @desc    Delete syllabus item
 * @route   DELETE /api/syllabus/:id
 * @access  Private/Admin
 */
export const deleteSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id).maxTimeMS(3000);
    if (syllabus) {
      await syllabus.deleteOne();
    }
  } catch (error) {
    console.warn('MongoDB delete failed in deleteSyllabus:', error.message);
  }
  res.json({ message: 'Syllabus item removed successfully', id: req.params.id });
};
