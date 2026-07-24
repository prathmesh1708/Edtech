import GlobalSyllabus from '../models/GlobalSyllabus.js';
import Board from '../models/Board.js';
import Subject from '../models/Subject.js';
import Chapter from '../models/Chapter.js';
import EducationalMaterial from '../models/EducationalMaterial.js';
import ContentApproval from '../models/ContentApproval.js';
import Syllabus from '../models/Syllabus.js';
import { normBoard, normClass } from './syllabusController.js';

// ==========================================
// 1. GLOBAL SYLLABUS MANAGEMENT CONTROLLER
// ==========================================
export const getGlobalSyllabuses = async (req, res, next) => {
  try {
    let list = await GlobalSyllabus.find({ isDeleted: false }).sort({ createdAt: -1 });

    if (list.length === 0) {
      const seeds = [
        { name: 'CBSE Master Syllabus 2025-2026', academicYear: '2025-2026', description: 'National Secondary Education Curriculum Framework', status: 'Published', effectiveDate: new Date('2025-04-01') },
        { name: 'ICSE Comprehensive Academic Framework', academicYear: '2025-2026', description: 'Council for the Indian School Certificate Examinations Master Plan', status: 'Published', effectiveDate: new Date('2025-04-01') },
        { name: 'State Board Core Curriculum Standard', academicYear: '2025-2026', description: 'State Higher Secondary Education Board Framework', status: 'Draft', effectiveDate: new Date('2025-06-01') },
        { name: 'IB Diploma International Baccalaureate', academicYear: '2024-2025', description: 'Global IB Standardized Syllabus', status: 'Archived', effectiveDate: new Date('2024-09-01') }
      ];
      await GlobalSyllabus.insertMany(seeds);
      list = await GlobalSyllabus.find({ isDeleted: false }).sort({ createdAt: -1 });
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createGlobalSyllabus = async (req, res, next) => {
  try {
    const { name, academicYear, description, status, effectiveDate } = req.body;
    if (!name) {
      res.status(400);
      throw new Error('Syllabus Name is required');
    }
    const item = await GlobalSyllabus.create({
      name,
      academicYear: academicYear || '2025-2026',
      description: description || '',
      status: status || 'Published',
      effectiveDate: effectiveDate || new Date()
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateGlobalSyllabus = async (req, res, next) => {
  try {
    const item = await GlobalSyllabus.findById(req.params.id);
    if (!item || item.isDeleted) {
      res.status(404);
      throw new Error('Syllabus record not found');
    }
    const { name, academicYear, description, status, effectiveDate } = req.body;
    if (name) item.name = name;
    if (academicYear) item.academicYear = academicYear;
    if (description !== undefined) item.description = description;
    if (status) item.status = status;
    if (effectiveDate) item.effectiveDate = effectiveDate;

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteGlobalSyllabus = async (req, res, next) => {
  try {
    const item = await GlobalSyllabus.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Syllabus record not found');
    }
    item.isDeleted = true;
    await item.save();
    res.json({ message: 'Syllabus archived successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
};


// ==========================================
// 2. BOARD-WISE SYLLABUS MANAGEMENT CONTROLLER
// ==========================================
export const getBoards = async (req, res, next) => {
  try {
    let list = await Board.find({ isDeleted: false }).sort({ createdAt: -1 });

    if (list.length === 0) {
      const seeds = [
        { boardName: 'CBSE', code: 'CBSE-IND', description: 'Central Board of Secondary Education', status: 'Active', logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=150&q=80' },
        { boardName: 'ICSE', code: 'CISCE-IND', description: 'Indian Certificate of Secondary Education', status: 'Active', logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=150&q=80' },
        { boardName: 'State Board', code: 'STATE-EDU', description: 'State Higher Secondary Education Board', status: 'Active', logoUrl: '' },
        { boardName: 'IB', code: 'IB-INT', description: 'International Baccalaureate Organization', status: 'Active', logoUrl: '' },
        { boardName: 'Cambridge', code: 'CIE-UK', description: 'Cambridge Assessment International Education', status: 'Active', logoUrl: '' }
      ];
      await Board.insertMany(seeds);
      list = await Board.find({ isDeleted: false }).sort({ createdAt: -1 });
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const { boardName, code, description, logoUrl, status, assignedSyllabus } = req.body;
    if (!boardName) {
      res.status(400);
      throw new Error('Board Name is required');
    }
    const item = await Board.create({
      boardName,
      code: code || '',
      description: description || '',
      logoUrl: logoUrl || '',
      status: status || 'Active',
      assignedSyllabus: assignedSyllabus || null
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateBoard = async (req, res, next) => {
  try {
    const item = await Board.findById(req.params.id);
    if (!item || item.isDeleted) {
      res.status(404);
      throw new Error('Board not found');
    }
    const { boardName, code, description, logoUrl, status, assignedSyllabus } = req.body;
    if (boardName) item.boardName = boardName;
    if (code !== undefined) item.code = code;
    if (description !== undefined) item.description = description;
    if (logoUrl !== undefined) item.logoUrl = logoUrl;
    if (status) item.status = status;
    if (assignedSyllabus !== undefined) item.assignedSyllabus = assignedSyllabus;

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const item = await Board.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Board not found');
    }
    item.isDeleted = true;
    await item.save();
    res.json({ message: 'Board removed successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
};


// ==========================================
// 3. SUBJECT MANAGEMENT CONTROLLER
// ==========================================
export const getSubjects = async (req, res, next) => {
  try {
    let list = await Subject.find({ isDeleted: false }).sort({ createdAt: -1 });

    if (list.length === 0) {
      const seeds = [
        { subjectName: 'Mathematics', subjectCode: 'MATH-101', board: 'CBSE', classId: 'Class 10', description: 'Core Class 10 Algebra, Geometry & Trigonometry', color: '#1A73E8', status: 'Active' },
        { subjectName: 'Physics', subjectCode: 'PHY-102', board: 'CBSE', classId: 'Class 10', description: 'Light, Electricity & Magnetic Effects', color: '#4F6EF7', status: 'Active' },
        { subjectName: 'Chemistry', subjectCode: 'CHEM-103', board: 'CBSE', classId: 'Class 10', description: 'Chemical Reactions, Acids & Carbon Compounds', color: '#A855F7', status: 'Active' },
        { subjectName: 'Biology', subjectCode: 'BIO-104', board: 'ICSE', classId: 'Class 9', description: 'Cellular Structures & Plant Physiology', color: '#22C55E', status: 'Active' },
        { subjectName: 'English Literature', subjectCode: 'ENG-105', board: 'CBSE', classId: 'Class 10', description: 'First Flight & Footprints Prose Literature', color: '#EC4899', status: 'Active' }
      ];
      await Subject.insertMany(seeds);
      list = await Subject.find({ isDeleted: false }).sort({ createdAt: -1 });
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectCode, board, classId, description, color, status } = req.body;
    if (!subjectName || !subjectCode) {
      res.status(400);
      throw new Error('Subject Name and Code are required');
    }
    const item = await Subject.create({
      subjectName: subjectName.trim(),
      subjectCode: subjectCode.trim(),
      board: board || 'CBSE',
      classId: classId || 'Class 10',
      description: description || '',
      color: color || '#1A73E8',
      status: status || 'Active'
    });

    // Also sync/create a document in Syllabus collection for Student & Admin Syllabus Views
    try {
      const nb = normBoard(board);
      const nc = normClass(classId);
      await Syllabus.create({
        board: nb,
        class: nc,
        subjectName: subjectName.trim(),
        subjectCode: subjectCode.trim(),
        description: description || '',
        color: color || '#1A73E8',
        status: status === 'Inactive' ? 'Draft' : 'Published',
        chapters: [
          {
            title: `Chapter 1: ${subjectName} Overview`,
            description: `Core concepts and fundamental topics for ${subjectName}`,
            progress: 0,
            topics: [{ name: 'Introduction', completed: false }]
          }
        ]
      });
    } catch (e) {
      console.warn('Sync to Syllabus collection warning:', e.message);
    }

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const item = await Subject.findById(req.params.id);
    if (!item || item.isDeleted) {
      res.status(404);
      throw new Error('Subject not found');
    }
    const { subjectName, subjectCode, board, classId, description, color, status } = req.body;
    if (subjectName) item.subjectName = subjectName;
    if (subjectCode) item.subjectCode = subjectCode;
    if (board) item.board = board;
    if (classId) item.classId = classId;
    if (description !== undefined) item.description = description;
    if (color) item.color = color;
    if (status) item.status = status;

    const updated = await item.save();

    // Sync updates to Syllabus collection
    try {
      const nb = normBoard(item.board);
      const nc = normClass(item.classId);
      await Syllabus.updateMany(
        { subjectName: item.subjectName },
        { 
          board: nb, 
          class: nc, 
          subjectCode: item.subjectCode,
          description: item.description,
          color: item.color,
          status: item.status === 'Inactive' ? 'Draft' : 'Published'
        }
      );
    } catch (e) {
      console.warn('Sync update warning:', e.message);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const item = await Subject.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Subject not found');
    }
    item.isDeleted = true;
    await item.save();

    try {
      await Syllabus.deleteMany({ subjectName: item.subjectName });
    } catch (e) {
      console.warn('Sync delete warning:', e.message);
    }

    res.json({ message: 'Subject deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
};


// ==========================================
// 4. CHAPTER MANAGEMENT CONTROLLER
// ==========================================
export const getChapters = async (req, res, next) => {
  try {
    let list = await Chapter.find({ isDeleted: false }).sort({ orderIndex: 1, createdAt: -1 });

    if (list.length === 0) {
      const seeds = [
        { chapterName: 'Real Numbers', chapterNumber: 1, subject: 'Mathematics', board: 'CBSE', classId: 'Class 10', description: 'Euclid Division Lemma, Fundamental Theorem of Arithmetic', learningObjectives: 'Understand prime factorization & irrational proof', estimatedStudyTime: '4 Hours', orderIndex: 1, status: 'Active' },
        { chapterName: 'Polynomials', chapterNumber: 2, subject: 'Mathematics', board: 'CBSE', classId: 'Class 10', description: 'Zeros of a polynomial & division algorithm', learningObjectives: 'Find quadratic zeroes & relationship between coefficients', estimatedStudyTime: '5 Hours', orderIndex: 2, status: 'Active' },
        { chapterName: 'Light - Reflection and Refraction', chapterNumber: 10, subject: 'Physics', board: 'CBSE', classId: 'Class 10', description: 'Spherical mirrors, ray diagrams & refractive index', learningObjectives: 'Solve lens formula & mirror formula numericals', estimatedStudyTime: '6 Hours', orderIndex: 1, status: 'Active' },
        { chapterName: 'Chemical Reactions and Equations', chapterNumber: 1, subject: 'Chemistry', board: 'CBSE', classId: 'Class 10', description: 'Types of chemical reactions & balancing equations', learningObjectives: 'Balance redox, displacement & combination reactions', estimatedStudyTime: '4 Hours', orderIndex: 1, status: 'Active' }
      ];
      await Chapter.insertMany(seeds);
      list = await Chapter.find({ isDeleted: false }).sort({ orderIndex: 1, createdAt: -1 });
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createChapter = async (req, res, next) => {
  try {
    const { chapterName, chapterNumber, subject, board, classId, description, learningObjectives, estimatedStudyTime, orderIndex, status } = req.body;
    if (!chapterName) {
      res.status(400);
      throw new Error('Chapter Name is required');
    }
    const item = await Chapter.create({
      chapterName,
      chapterNumber: chapterNumber || 1,
      subject: subject || 'Mathematics',
      board: board || 'CBSE',
      classId: classId || 'Class 10',
      description: description || '',
      learningObjectives: learningObjectives || '',
      estimatedStudyTime: estimatedStudyTime || '4 Hours',
      orderIndex: orderIndex || 1,
      status: status || 'Active'
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateChapter = async (req, res, next) => {
  try {
    const item = await Chapter.findById(req.params.id);
    if (!item || item.isDeleted) {
      res.status(404);
      throw new Error('Chapter not found');
    }
    const { chapterName, chapterNumber, subject, board, classId, description, learningObjectives, estimatedStudyTime, orderIndex, status } = req.body;
    if (chapterName) item.chapterName = chapterName;
    if (chapterNumber !== undefined) item.chapterNumber = chapterNumber;
    if (subject) item.subject = subject;
    if (board) item.board = board;
    if (classId) item.classId = classId;
    if (description !== undefined) item.description = description;
    if (learningObjectives !== undefined) item.learningObjectives = learningObjectives;
    if (estimatedStudyTime) item.estimatedStudyTime = estimatedStudyTime;
    if (orderIndex !== undefined) item.orderIndex = orderIndex;
    if (status) item.status = status;

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteChapter = async (req, res, next) => {
  try {
    const item = await Chapter.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Chapter not found');
    }
    item.isDeleted = true;
    await item.save();
    res.json({ message: 'Chapter deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
};


// ==========================================
// 5. CONTENT APPROVAL SYSTEM CONTROLLER
// ==========================================
export const getContentApprovals = async (req, res, next) => {
  try {
    let list = await ContentApproval.find({ isDeleted: false }).sort({ createdAt: -1 });

    if (list.length === 0) {
      const seeds = [
        { 
          materialTitle: 'Class 10 Real Numbers Handwritten Master Notes', 
          materialType: 'PDF Notes', 
          board: 'CBSE', 
          classId: 'Class 10', 
          subject: 'Mathematics', 
          submittedBy: 'Prof. Ramesh Sharma', 
          reviewer: 'Master Admin', 
          status: 'Pending Review', 
          reviewComments: 'Awaiting syllabus accuracy check',
          history: [{ status: 'Submitted', reviewer: 'Prof. Ramesh Sharma', remarks: 'Initial draft upload', date: new Date() }] 
        },
        { 
          materialTitle: 'Light Reflection Ray Diagram Video Tutorial', 
          materialType: 'Videos', 
          board: 'CBSE', 
          classId: 'Class 10', 
          subject: 'Physics', 
          submittedBy: 'Dr. Anita Verma', 
          reviewer: 'Master Admin', 
          status: 'Approved', 
          reviewComments: 'Audio & HD video verified cleanly',
          history: [
            { status: 'Submitted', reviewer: 'Dr. Anita Verma', remarks: 'Uploaded HD MP4 video link', date: new Date('2026-07-20') },
            { status: 'Approved', reviewer: 'Master Admin', remarks: 'Approved for production publishing', date: new Date('2026-07-21') }
          ] 
        },
        { 
          materialTitle: 'Chemical Equations Practice Worksheet 2026', 
          materialType: 'Worksheets', 
          board: 'CBSE', 
          classId: 'Class 10', 
          subject: 'Chemistry', 
          submittedBy: 'Vikram Mehta', 
          reviewer: 'Master Admin', 
          status: 'Changes Requested', 
          reviewComments: 'Please fix typo in Question 8 balancing equation',
          history: [
            { status: 'Submitted', reviewer: 'Vikram Mehta', remarks: 'First draft worksheet', date: new Date('2026-07-22') },
            { status: 'Changes Requested', reviewer: 'Master Admin', remarks: 'Requested fix for Question 8', date: new Date('2026-07-23') }
          ] 
        }
      ];
      await ContentApproval.insertMany(seeds);
      list = await ContentApproval.find({ isDeleted: false }).sort({ createdAt: -1 });
    }

    const pendingCount = list.filter(i => i.status === 'Pending Review').length;
    res.json({ list, pendingCount });
  } catch (err) {
    next(err);
  }
};

export const updateApprovalStatus = async (req, res, next) => {
  try {
    const { status, reviewComments, reviewer } = req.body;
    const approval = await ContentApproval.findById(req.params.id);
    if (!approval || approval.isDeleted) {
      res.status(404);
      throw new Error('Approval item not found');
    }

    approval.status = status || approval.status;
    if (reviewComments !== undefined) approval.reviewComments = reviewComments;
    if (reviewer) approval.reviewer = reviewer;

    approval.history.push({
      status: status || approval.status,
      reviewer: reviewer || 'Master Admin',
      remarks: reviewComments || `Status updated to ${status}`,
      date: new Date()
    });

    const updated = await approval.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};


// ==========================================
// 6. EDUCATIONAL MATERIAL ORGANIZATION CONTROLLER
// ==========================================
export const getEducationalMaterials = async (req, res, next) => {
  try {
    let list = await EducationalMaterial.find({ isDeleted: false }).sort({ createdAt: -1 });

    if (list.length === 0) {
      const seeds = [
        { 
          materialTitle: 'Class 10 Real Numbers Complete Solutions', 
          materialType: 'PDF Notes', 
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
          fileSize: '3.4 MB', 
          description: 'Step-by-step solved NCERT textbook problems for Real Numbers.', 
          board: 'CBSE', 
          classId: 'Class 10', 
          subject: 'Mathematics', 
          chapter: 'Chapter 1: Real Numbers', 
          tags: ['NCERT', 'Solutions', 'Exam Prep'], 
          language: 'English', 
          status: 'Published', 
          visibility: 'Public', 
          version: 'v1.2', 
          versionHistory: [
            { version: 'v1.0', fileUrl: '', updatedBy: 'Admin', notes: 'Initial upload' },
            { version: 'v1.2', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', updatedBy: 'Admin', notes: 'Added 2026 exam solutions' }
          ] 
        },
        { 
          materialTitle: 'Light Reflection and Spherical Lenses Video Lesson', 
          materialType: 'Videos', 
          fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
          fileSize: '45.0 MB', 
          description: 'Animated 3D visual explanation of ray diagrams and mirror formulas.', 
          board: 'CBSE', 
          classId: 'Class 10', 
          subject: 'Physics', 
          chapter: 'Chapter 10: Light Reflection & Refraction', 
          tags: ['Video', '3D Visual', 'Ray Diagrams'], 
          language: 'English', 
          status: 'Published', 
          visibility: 'Student Only', 
          version: 'v1.0', 
          versionHistory: [{ version: 'v1.0', fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', updatedBy: 'Physics Dept', notes: 'Initial video release' }] 
        },
        { 
          materialTitle: 'Chemical Reactions Diagnostic Quiz Paper', 
          materialType: 'Quizzes', 
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
          fileSize: '1.2 MB', 
          description: '25 Multiple Choice Questions with answer key & hints.', 
          board: 'CBSE', 
          classId: 'Class 10', 
          subject: 'Chemistry', 
          chapter: 'Chapter 1: Chemical Reactions', 
          tags: ['Quiz', 'MCQ', 'Self Assessment'], 
          language: 'English', 
          status: 'Approved', 
          visibility: 'Public', 
          version: 'v1.0', 
          versionHistory: [{ version: 'v1.0', fileUrl: '', updatedBy: 'Chem Faculty', notes: 'First draft quiz' }] 
        }
      ];
      await EducationalMaterial.insertMany(seeds);
      list = await EducationalMaterial.find({ isDeleted: false }).sort({ createdAt: -1 });
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createEducationalMaterial = async (req, res, next) => {
  try {
    const { materialTitle, materialType, fileUrl, fileSize, description, board, classId, subject, chapter, tags, language, status, visibility } = req.body;
    if (!materialTitle) {
      res.status(400);
      throw new Error('Material Title is required');
    }

    const item = await EducationalMaterial.create({
      materialTitle,
      materialType: materialType || 'PDF Notes',
      fileUrl: fileUrl || '',
      fileSize: fileSize || '2.0 MB',
      description: description || '',
      board: board || 'CBSE',
      classId: classId || 'Class 10',
      subject: subject || 'Mathematics',
      chapter: chapter || 'Chapter 1: Real Numbers',
      tags: tags || ['General'],
      language: language || 'English',
      status: status || 'Pending Review',
      visibility: visibility || 'Public',
      version: 'v1.0',
      versionHistory: [
        { version: 'v1.0', fileUrl: fileUrl || '', updatedBy: 'Admin', notes: 'Initial creation', updatedAt: new Date() }
      ]
    });

    // Also auto-add to Content Approval queue if status is Pending Review
    if (item.status === 'Pending Review') {
      await ContentApproval.create({
        materialTitle: item.materialTitle,
        materialType: item.materialType,
        materialRef: item._id,
        board: item.board,
        classId: item.classId,
        subject: item.subject,
        status: 'Pending Review',
        history: [{ status: 'Submitted', reviewer: 'Content Author', remarks: 'New material submitted for review', date: new Date() }]
      });
    }

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateEducationalMaterial = async (req, res, next) => {
  try {
    const item = await EducationalMaterial.findById(req.params.id);
    if (!item || item.isDeleted) {
      res.status(404);
      throw new Error('Material not found');
    }

    const { materialTitle, materialType, fileUrl, fileSize, description, board, classId, subject, chapter, tags, language, status, visibility, updateNotes } = req.body;

    let isFileChanged = fileUrl && fileUrl !== item.fileUrl;

    if (materialTitle) item.materialTitle = materialTitle;
    if (materialType) item.materialType = materialType;
    if (fileUrl) item.fileUrl = fileUrl;
    if (fileSize) item.fileSize = fileSize;
    if (description !== undefined) item.description = description;
    if (board) item.board = board;
    if (classId) item.classId = classId;
    if (subject) item.subject = subject;
    if (chapter) item.chapter = chapter;
    if (tags) item.tags = tags;
    if (language) item.language = language;
    if (status) item.status = status;
    if (visibility) item.visibility = visibility;

    if (isFileChanged) {
      const vNum = parseFloat(item.version.replace('v', '')) + 0.1;
      item.version = `v${vNum.toFixed(1)}`;
      item.versionHistory.push({
        version: item.version,
        fileUrl: fileUrl,
        updatedBy: 'Admin',
        notes: updateNotes || 'File updated to new version',
        updatedAt: new Date()
      });
    }

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteEducationalMaterial = async (req, res, next) => {
  try {
    const item = await EducationalMaterial.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Material not found');
    }
    item.isDeleted = true;
    await item.save();
    res.json({ message: 'Material deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
};
