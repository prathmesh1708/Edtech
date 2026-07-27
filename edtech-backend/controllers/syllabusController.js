import Syllabus from '../models/Syllabus.js';
import Subject from '../models/Subject.js';

// Normalization Helpers
export const normBoard = (b) => {
  if (!b) return 'cbse';
  const s = String(b).toLowerCase().trim();
  if (s.includes('state')) return 'state';
  if (s.includes('icse') || s.includes('cisce')) return 'icse';
  if (s.includes('ib') || s.includes('international')) return 'ib';
  if (s.includes('cambridge') || s.includes('cie')) return 'cambridge';
  return s;
};

export const normClass = (c) => {
  if (!c) return '10';
  const match = String(c).match(/\d+/);
  return match ? match[0] : String(c).replace(/class/i, '').trim();
};

// Default initial seed data for popular boards
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
      }
    ]
  },
  {
    _id: 'seed-state-math-12',
    board: 'state',
    class: '12',
    subjectName: 'Mathematics',
    subjectCode: 'MATH-12',
    description: 'Class 12 Higher Secondary Mathematics (Calculus, Vectors & 3D Geometry)',
    color: '#1A73E8',
    icon: 'Calculator',
    status: 'Published',
    chapters: [
      {
        title: 'Chapter 1: Relations and Functions',
        description: 'Types of relations, reflexivity, symmetry, and transitivity.',
        progress: 0,
        topics: [
          { name: 'Types of Relations', completed: false },
          { name: 'One to One and Onto Functions', completed: false }
        ]
      },
      {
        title: 'Chapter 2: Derivatives & Continuity',
        description: 'Calculus derivatives of composite and implicit functions.',
        progress: 0,
        topics: [
          { name: 'Continuity & Differentiability', completed: false },
          { name: 'Chain Rule Derivatives', completed: false }
        ]
      }
    ]
  },
  {
    _id: 'seed-state-phy-12',
    board: 'state',
    class: '12',
    subjectName: 'Physics',
    subjectCode: 'PHY-12',
    description: 'Class 12 State Board Physics (Electrostatics, Current Electricity & Optics)',
    color: '#3B82F6',
    icon: 'Atom',
    status: 'Published',
    chapters: [
      {
        title: 'Chapter 1: Electrostatics',
        description: 'Electric charges, Coulomb\'s Law, and Electric Dipole.',
        progress: 0,
        topics: [
          { name: 'Electric Charge & Conservation', completed: false },
          { name: 'Coulomb\'s Law & Field Lines', completed: false }
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

    const nb = normBoard(board);
    const nc = normClass(classVal);

    const filter = {};
    if (board) filter.board = { $regex: nb, $options: 'i' };
    if (classVal) filter.class = { $regex: nc, $options: 'i' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 1. Fetch from Syllabus collection
    const syllabuses = await Syllabus.find(filter).sort({ createdAt: -1 }).maxTimeMS(3000);

    // 2. Fetch from Subject collection (set by Admin)
    const subjectFilter = { isDeleted: false };
    if (board) subjectFilter.board = { $regex: nb, $options: 'i' };
    if (classVal) subjectFilter.classId = { $regex: nc, $options: 'i' };
    const adminSubjects = await Subject.find(subjectFilter).sort({ createdAt: -1 }).maxTimeMS(3000);

    // Merge and deduplicate by subject name
    const subjectMap = new Map();

    syllabuses.forEach(s => {
      const key = String(s.subjectName).trim().toLowerCase();
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          _id: s._id,
          board: s.board,
          class: s.class,
          subjectName: s.subjectName,
          subjectCode: s.subjectCode || 'SUB-101',
          description: s.description || `Official ${s.subjectName} syllabus curated by Admin.`,
          color: s.color || '#4F6EF7',
          icon: s.icon || 'BookOpen',
          status: s.status || 'Published',
          chapters: s.chapters || [],
          adminCurated: true,
          adminName: 'Academic Admin Council'
        });
      }
    });

    adminSubjects.forEach(sub => {
      const key = String(sub.subjectName).trim().toLowerCase();
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          _id: sub._id,
          board: sub.board || nb.toUpperCase(),
          class: sub.classId || nc,
          subjectName: sub.subjectName,
          subjectCode: sub.subjectCode || 'SUB-101',
          description: sub.description || `Official ${sub.subjectName} syllabus set by Admin.`,
          color: sub.color || '#4F6EF7',
          icon: 'BookOpen',
          status: sub.status === 'Inactive' ? 'Draft' : 'Published',
          chapters: [
            { title: `Chapter 1: ${sub.subjectName} Core Fundamentals`, description: 'Key concepts and topics', progress: 0 }
          ],
          adminCurated: true,
          adminName: 'Academic Admin Council'
        });
      }
    });

    let results = Array.from(subjectMap.values());

    // If no subjects found for this specific class & board, generate default Admin curriculum subjects
    if (results.length === 0) {
      const defaultSubjects = [
        { name: 'Mathematics', code: `MATH-${nc}`, color: '#4F6EF7', desc: 'Numbers, Algebra, Geometry, and Mensuration' },
        { name: 'Science', code: `SCI-${nc}`, color: '#22C55E', desc: 'Physics, Chemistry, and Biology fundamentals' },
        { name: 'English', code: `ENG-${nc}`, color: '#EC4899', desc: 'Grammar, Literature, and Reading Comprehension' },
        { name: 'Social Studies', code: `SST-${nc}`, color: '#F59E0B', desc: 'History, Geography, and Civics' },
        { name: 'Hindi', code: `HIN-${nc}`, color: '#8B5CF6', desc: 'Hindi Vyakaran and Sahitya' }
      ];

      results = defaultSubjects.map((d, i) => ({
        _id: `admin-sub-${nc}-${i}`,
        board: nb.toUpperCase(),
        class: nc,
        subjectName: d.name,
        subjectCode: d.code,
        description: `Official ${nb.toUpperCase()} Class ${nc} ${d.name} syllabus set by Admin. ${d.desc}.`,
        color: d.color,
        icon: 'BookOpen',
        status: 'Published',
        chapters: [
          { title: `Chapter 1: ${d.name} Overview`, description: 'Core topics and concepts', progress: 0 },
          { title: `Chapter 2: Advanced ${d.name} Practice`, description: 'Exemplar exercises', progress: 0 }
        ],
        adminCurated: true,
        adminName: 'Academic Admin Council'
      }));
    }

    res.json(results);
  } catch (error) {
    console.warn('MongoDB query failed in getSyllabuses, returning fallback seed data:', error.message);
    let fallback = DEFAULT_SYLLABUS_SEED;
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

  const normalizedB = normBoard(board);
  const normalizedC = normClass(classVal);

  const syllabusObj = {
    _id: `sys-${Date.now()}`,
    board: normalizedB,
    class: normalizedC,
    subjectName: subjectName.trim(),
    subjectCode: subjectCode || '',
    description: description || '',
    color: color || '#4F6EF7',
    icon: icon || 'BookOpen',
    status: status || 'Published',
    chapters: chapters || [
      {
        title: `Chapter 1: ${subjectName} Fundamentals`,
        description: `Introductory concepts and topics for ${subjectName}`,
        progress: 0,
        topics: [{ name: 'Overview & Basics', completed: false }]
      }
    ],
    createdBy: req.user ? req.user._id : null
  };

  try {
    const syllabus = new Syllabus(syllabusObj);
    const savedSyllabus = await syllabus.save();

    // Always keep in-memory seed updated for fallbacks
    const existingSeedIdx = DEFAULT_SYLLABUS_SEED.findIndex(s => s._id === syllabusObj._id);
    if (existingSeedIdx !== -1) {
      DEFAULT_SYLLABUS_SEED[existingSeedIdx] = savedSyllabus.toObject ? savedSyllabus.toObject() : savedSyllabus;
    } else {
      DEFAULT_SYLLABUS_SEED.unshift(savedSyllabus.toObject ? savedSyllabus.toObject() : savedSyllabus);
    }

    // Sync to Subject Model for SubjectManagement module
    try {
      await Subject.create({
        subjectName: subjectName.trim(),
        subjectCode: subjectCode || `SUB-${Date.now().toString().slice(-4)}`,
        board: board,
        classId: `Class ${normalizedC}`,
        description: description || '',
        color: color || '#4F6EF7',
        status: status === 'Draft' ? 'Inactive' : 'Active'
      });
    } catch (e) {
      console.warn('Subject sync notice:', e.message);
    }

    res.status(201).json(savedSyllabus);
  } catch (error) {
    console.warn('MongoDB save timed out in createSyllabus, returning created memory item:', error.message);
    const existingSeedIdx = DEFAULT_SYLLABUS_SEED.findIndex(s => s._id === syllabusObj._id);
    if (existingSeedIdx !== -1) {
      DEFAULT_SYLLABUS_SEED[existingSeedIdx] = syllabusObj;
    } else {
      DEFAULT_SYLLABUS_SEED.unshift(syllabusObj);
    }
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

  let updatedObj = null;

  try {
    const syllabus = await Syllabus.findById(req.params.id).maxTimeMS(3000);
    if (syllabus) {
      if (board !== undefined) syllabus.board = normBoard(board);
      if (classVal !== undefined) syllabus.class = normClass(classVal);
      if (subjectName !== undefined) syllabus.subjectName = subjectName;
      if (subjectCode !== undefined) syllabus.subjectCode = subjectCode;
      if (description !== undefined) syllabus.description = description;
      if (color !== undefined) syllabus.color = color;
      if (icon !== undefined) syllabus.icon = icon;
      if (status !== undefined) syllabus.status = status;
      if (chapters !== undefined) {
        syllabus.chapters = chapters;
        syllabus.markModified('chapters');
      }

      const savedSyllabus = await syllabus.save();
      updatedObj = savedSyllabus.toObject ? savedSyllabus.toObject() : savedSyllabus;
    }
  } catch (error) {
    console.warn('MongoDB update failed in updateSyllabus:', error.message);
  }

  // Fallback for seed / in-memory objects if MongoDB fails or item not in DB
  if (!updatedObj) {
    const seedMatch = DEFAULT_SYLLABUS_SEED.find(s => s._id === req.params.id);
    updatedObj = {
      _id: req.params.id,
      board: board !== undefined ? normBoard(board) : (seedMatch?.board || 'cbse'),
      class: classVal !== undefined ? normClass(classVal) : (seedMatch?.class || '10'),
      subjectName: subjectName !== undefined ? subjectName : (seedMatch?.subjectName || 'Subject'),
      subjectCode: subjectCode !== undefined ? subjectCode : (seedMatch?.subjectCode || ''),
      description: description !== undefined ? description : (seedMatch?.description || ''),
      color: color !== undefined ? color : (seedMatch?.color || '#4F6EF7'),
      icon: icon !== undefined ? icon : (seedMatch?.icon || 'BookOpen'),
      status: status !== undefined ? status : (seedMatch?.status || 'Published'),
      chapters: chapters !== undefined ? chapters : (seedMatch?.chapters || [])
    };
  }

  // Sync with in-memory seed list so re-fetching immediately reflects the updated chapters
  const seedIdx = DEFAULT_SYLLABUS_SEED.findIndex(s => s._id === req.params.id);
  if (seedIdx !== -1) {
    DEFAULT_SYLLABUS_SEED[seedIdx] = { ...DEFAULT_SYLLABUS_SEED[seedIdx], ...updatedObj };
  } else {
    DEFAULT_SYLLABUS_SEED.unshift(updatedObj);
  }

  res.json(updatedObj);
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

  // Also remove from in-memory seed array
  const seedIdx = DEFAULT_SYLLABUS_SEED.findIndex(s => s._id === req.params.id);
  if (seedIdx !== -1) {
    DEFAULT_SYLLABUS_SEED.splice(seedIdx, 1);
  }

  res.json({ message: 'Syllabus item removed successfully', id: req.params.id });
};
