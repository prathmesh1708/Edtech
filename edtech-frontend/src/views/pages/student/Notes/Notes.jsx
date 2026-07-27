import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  FileText, 
  BookOpen, 
  Video, 
  Download, 
  Search, 
  Play, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  FileDown,
  Info,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import { useAuth } from '../../../../models/context/AuthContext';
import useContentController from '../../../../controllers/useContentController';
import syllabusManagementService from '../../../../models/services/syllabusManagementService';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import { downloadPDF } from '../../../../utils/pdfGenerator';

// Helper function to extract numeric class digit (e.g. "Class 7th", "7th", "7" -> "7")
const normalizeClass = (val) => {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '');
  return digits || String(val).trim().toLowerCase();
};

// Helper to normalize subject names to clean title format (e.g. "math" -> "Mathematics", "sanshkirit" -> "Sanskrit")
const getNormalizedSubjectName = (name) => {
  if (!name) return '';
  const clean = String(name).trim().toLowerCase();
  if (clean === 'math' || clean === 'maths' || clean === 'mathematics') return 'Mathematics';
  if (clean === 'sci' || clean === 'science') return 'Science';
  if (clean === 'phy' || clean === 'physics') return 'Physics';
  if (clean === 'chem' || clean === 'chemistry') return 'Chemistry';
  if (clean === 'bio' || clean === 'biology') return 'Biology';
  if (clean === 'eng' || clean === 'english' || clean === 'english literature') return 'English';
  if (clean === 'hin' || clean === 'hindi') return 'Hindi';
  if (clean === 'san' || clean === 'sanskrit' || clean === 'sanshkirit') return 'Sanskrit';
  if (clean === 'sst' || clean === 'social' || clean === 'social studies' || clean === 'social science') return 'Social Studies';
  if (clean === 'cs' || clean === 'computer' || clean === 'computer science' || clean === 'it') return 'Computer Science';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// Helper function to resolve canonical subject keys
const getCanonicalSubjectKey = (name) => {
  if (!name) return 'other';
  const clean = String(name).toLowerCase().replace(/[^a-z]/g, '');
  if (clean === 'math' || clean === 'maths' || clean === 'mathematics') return 'math';
  if (clean === 'physics') return 'physics';
  if (clean === 'chemistry') return 'chemistry';
  if (clean === 'biology') return 'biology';
  if (clean.includes('sci')) return 'science';
  if (clean.includes('eng')) return 'english';
  if (clean.includes('soc') || clean.includes('hist') || clean.includes('geog') || clean.includes('civ')) return 'social';
  if (clean.includes('comp') || clean.includes('it') || clean.includes('code') || clean.includes('tech')) return 'computer';
  if (clean.includes('hin')) return 'hindi';
  if (clean.includes('san') || clean.includes('sanskrit') || clean.includes('sanshkirit')) return 'sanskrit';
  return clean || 'other';
};

// Class-adaptive Mock Data generator with rich downloadable PDFs across all subjects
const getMockDataForClass = (classNum, boardStr) => {
  const displayClass = `Class ${classNum}`;
  const fullBoardTag = `${boardStr} ${displayClass}`;

  return {
    math: {
      id: 'math',
      name: 'Mathematics',
      color: '#3B82F6',
      chapters: [
        {
          id: `m-ch-1-${classNum}`,
          subjectName: 'Mathematics',
          subjectColor: '#3B82F6',
          title: `Chapter 1: Real Numbers & Integers (${displayClass})`,
          description: `Explore fundamental mathematical properties, number systems, and operations for ${fullBoardTag}.`,
          digitalMaterial: `Comprehensive ${displayClass} Mathematics study notes covering core theorems, solved examples, and textbook exercise solutions.`,
          topics: [
            { title: `${displayClass} Core Number Concepts`, content: `Essential properties, definitions, and identities for ${fullBoardTag} Mathematics curriculum.` },
            { title: "Solved Practice Problems", content: `Step-by-step solved exemplars tailored specifically for ${displayClass} students.` }
          ]
        },
        {
          id: `m-ch-2-${classNum}`,
          subjectName: 'Mathematics',
          subjectColor: '#3B82F6',
          title: `Chapter 2: Algebraic Expressions & Equations (${displayClass})`,
          description: `Master variable operations, polynomial expressions, and linear equations for ${displayClass}.`,
          digitalMaterial: `Interactive formulas and algebraic identities designed for ${fullBoardTag}.`,
          topics: [
            { title: "Linear Equations & Variables", content: `Understanding variable balances, substitution, and graphical solutions in ${displayClass}.` }
          ]
        }
      ],
      videos: [
        {
          id: `m-vid-1-${classNum}`,
          subjectName: 'Mathematics',
          title: `${displayClass} Mathematics Chapter 1 Complete Solution Walkthrough`,
          duration: '12:45',
          level: fullBoardTag,
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          views: `${fullBoardTag} • 2.5k views`,
          author: 'Prof. Rajesh Sharma'
        }
      ],
      downloads: [
        {
          id: `m-dl-1-${classNum}`,
          subjectName: 'Mathematics',
          title: `${fullBoardTag} Mathematics Exemplar Solutions & Formula Sheet`,
          description: `Complete solved chapter notes and practice question bank for ${displayClass} Mathematics.`,
          fileSize: '3.4 MB',
          fileType: 'PDF Document',
          downloadsCount: 1420
        },
        {
          id: `m-dl-2-${classNum}`,
          subjectName: 'Mathematics',
          title: `${fullBoardTag} Integers & Rational Numbers Practice Worksheets`,
          description: `50+ topic-wise practice problems with step-by-step verified answer keys.`,
          fileSize: '2.1 MB',
          fileType: 'PDF Worksheet',
          downloadsCount: 980
        }
      ]
    },
    science: {
      id: 'science',
      name: 'Science',
      color: '#8B5CF6',
      chapters: [
        {
          id: `s-ch-1-${classNum}`,
          subjectName: 'Science',
          subjectColor: '#8B5CF6',
          title: `Chapter 1: Chemical Processes & Living Organisms (${displayClass})`,
          description: `Comprehensive study of scientific principles, physical phenomena, and natural systems for ${fullBoardTag}.`,
          digitalMaterial: `Detailed ${displayClass} Science summary covering key experiments, definitions, and diagrammatic explanations.`,
          topics: [
            { title: `${displayClass} Science Fundamentals`, content: `Core principles and observation techniques in ${fullBoardTag} Science.` },
            { title: "Experiments & Observation Notes", content: `Practical lab activities and activity questions for ${displayClass}.` }
          ]
        }
      ],
      videos: [
        {
          id: `s-vid-1-${classNum}`,
          subjectName: 'Science',
          title: `${displayClass} Science Experiment Demos & Concept Explanations`,
          duration: '14:20',
          level: fullBoardTag,
          thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=400',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          views: `${fullBoardTag} • 3.1k views`,
          author: 'Dr. Anita Desai'
        }
      ],
      downloads: [
        {
          id: `s-dl-1-${classNum}`,
          subjectName: 'Science',
          title: `${fullBoardTag} Science Worksheets & Lab Activity Guide`,
          description: `Practice question worksheets and lab manual notes for ${displayClass} Science.`,
          fileSize: '2.8 MB',
          fileType: 'PDF Document',
          downloadsCount: 2950
        },
        {
          id: `s-dl-2-${classNum}`,
          subjectName: 'Science',
          title: `${fullBoardTag} Physical & Chemical Changes Experiment Summary`,
          description: `Illustrated lab observations, reaction equations, and revision notes.`,
          fileSize: '3.1 MB',
          fileType: 'PDF Lab Guide',
          downloadsCount: 1650
        }
      ]
    },
    physics: {
      id: 'physics',
      name: 'Physics',
      color: '#6366F1',
      chapters: [
        {
          id: `phy-ch-1-${classNum}`,
          subjectName: 'Physics',
          subjectColor: '#6366F1',
          title: `Chapter 1: Heat, Motion & Electric Current (${displayClass})`,
          description: `Fundamental laws of motion, temperature measurement, and electrical circuits for ${fullBoardTag}.`,
          digitalMaterial: `Detailed physics formulas, circuit diagrams, and numerical problems.`,
          topics: [
            { title: "Heat & Temperature Units", content: "Conduction, convection, radiation, and clinical thermometer readings." }
          ]
        }
      ],
      videos: [],
      downloads: [
        {
          id: `phy-dl-1-${classNum}`,
          subjectName: 'Physics',
          title: `${fullBoardTag} Physics Formulas & Solved Numerical Bank`,
          description: `Formula cheatsheet and step-by-step solved physics numericals.`,
          fileSize: '2.9 MB',
          fileType: 'PDF Guide',
          downloadsCount: 1820
        }
      ]
    },
    chemistry: {
      id: 'chemistry',
      name: 'Chemistry',
      color: '#06B6D4',
      chapters: [
        {
          id: `chem-ch-1-${classNum}`,
          subjectName: 'Chemistry',
          subjectColor: '#06B6D4',
          title: `Chapter 1: Acids, Bases & Salts (${displayClass})`,
          description: `Understanding pH indicators, neutralization reactions, and chemical salts for ${fullBoardTag}.`,
          digitalMaterial: `Chemical equations, reaction tables, and lab indicators summary.`,
          topics: [
            { title: "Indicators & Neutralization", content: "Litmus, turmeric, and phenolphthalein test observations." }
          ]
        }
      ],
      videos: [],
      downloads: [
        {
          id: `chem-dl-1-${classNum}`,
          subjectName: 'Chemistry',
          title: `${fullBoardTag} Chemistry Reaction Tables & Solved Exercises`,
          description: `Complete list of chemical reactions and balancing practice sheets.`,
          fileSize: '2.6 MB',
          fileType: 'PDF Resource',
          downloadsCount: 1430
        }
      ]
    },
    english: {
      id: 'english',
      name: 'English',
      color: '#EC4899',
      chapters: [
        {
          id: `e-ch-1-${classNum}`,
          subjectName: 'English',
          subjectColor: '#EC4899',
          title: `Chapter 1: Literature Prose & Grammar Skills (${displayClass})`,
          description: `Master reading comprehension, grammar rules, and prose summaries for ${fullBoardTag}.`,
          digitalMaterial: `Literature summaries, grammar writing rules, and sample letter formats for ${displayClass}.`,
          topics: [
            { title: "Prose & Poetry Summary", content: "Key theme analysis, character traits, and vocabulary lists." }
          ]
        }
      ],
      videos: [
        {
          id: `e-vid-1-${classNum}`,
          subjectName: 'English',
          title: `${displayClass} English Literature & Writing Skills Masterclass`,
          duration: '11:10',
          level: fullBoardTag,
          thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          views: `${fullBoardTag} • 4.2k views`,
          author: 'Ma\'am Sunita Verma'
        }
      ],
      downloads: [
        {
          id: `e-dl-1-${classNum}`,
          subjectName: 'English',
          title: `${fullBoardTag} English Literature & Grammar Practice Booklet`,
          description: `Important short/long questions and model answers for ${displayClass} English.`,
          fileSize: '2.1 MB',
          fileType: 'PDF Document',
          downloadsCount: 1890
        },
        {
          id: `e-dl-2-${classNum}`,
          subjectName: 'English',
          title: `${fullBoardTag} Reading Comprehension & Writing Templates`,
          description: `Unseen passage exercises, formal letter writing formats, and grammar worksheets.`,
          fileSize: '1.7 MB',
          fileType: 'PDF Booklet',
          downloadsCount: 1120
        }
      ]
    },
    social: {
      id: 'social',
      name: 'Social Studies',
      color: '#F59E0B',
      chapters: [
        {
          id: `sst-ch-1-${classNum}`,
          subjectName: 'Social Studies',
          subjectColor: '#F59E0B',
          title: `Chapter 1: History & Environment Studies (${displayClass})`,
          description: `Explore historical timelines, geographical resources, and civics for ${fullBoardTag}.`,
          digitalMaterial: `Timeline charts, map pointers, and chapter summary sheets for ${displayClass} Social Science.`,
          topics: [
            { title: "Historical Developments & Civics", content: `Important events, constitutional concepts, and geography notes for ${displayClass}.` }
          ]
        }
      ],
      videos: [
        {
          id: `sst-vid-1-${classNum}`,
          subjectName: 'Social Studies',
          title: `${displayClass} Social Science Interactive Map & History Walkthrough`,
          duration: '15:30',
          level: fullBoardTag,
          thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=400',
          videoUrl: 'https://www.w3schools.com/html/movie.mp4',
          views: `${fullBoardTag} • 5.0k views`,
          author: 'Prof. Vikram Singh'
        }
      ],
      downloads: [
        {
          id: `sst-dl-1-${classNum}`,
          subjectName: 'Social Studies',
          title: `${fullBoardTag} Social Studies Map Work & Question Bank`,
          description: `High-resolution maps and solved chapter questions for ${displayClass} Social Studies.`,
          fileSize: '4.5 MB',
          fileType: 'PDF Document',
          downloadsCount: 4120
        },
        {
          id: `sst-dl-2-${classNum}`,
          subjectName: 'Social Studies',
          title: `${fullBoardTag} History Timelines & Geography Mind Maps`,
          description: `Visual revision flowcharts and solved exam questions for History & Civics.`,
          fileSize: '3.2 MB',
          fileType: 'PDF Mindmap',
          downloadsCount: 2240
        }
      ]
    },
    computer: {
      id: 'computer',
      name: 'Computer Science',
      color: '#10B981',
      chapters: [
        {
          id: `cs-ch-1-${classNum}`,
          subjectName: 'Computer Science',
          subjectColor: '#10B981',
          title: `Chapter 1: IT Fundamentals & Coding Logic (${displayClass})`,
          description: `Computer fundamentals, cyber safety, and introductory coding concepts for ${displayClass}.`,
          digitalMaterial: `Hands-on practical guide and IT textbook notes for ${displayClass}.`,
          topics: [
            { title: "IT Concepts & Practical Tasks", content: `System software, internet security, and practical code snippets for ${displayClass}.` }
          ]
        }
      ],
      videos: [
        {
          id: `cs-vid-1-${classNum}`,
          subjectName: 'Computer Science',
          title: `${displayClass} Computer Science Practical Tutorial`,
          duration: '18:20',
          level: fullBoardTag,
          thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          views: `${fullBoardTag} • 3.8k views`,
          author: 'Er. Alok Mehta'
        }
      ],
      downloads: [
        {
          id: `cs-dl-1-${classNum}`,
          subjectName: 'Computer Science',
          title: `${fullBoardTag} IT & Computer Lab Workbook`,
          description: `Practical assignments and step-by-step IT exercises for ${displayClass}.`,
          fileSize: '3.2 MB',
          fileType: 'PDF Document',
          downloadsCount: 2780
        },
        {
          id: `cs-dl-2-${classNum}`,
          subjectName: 'Computer Science',
          title: `${fullBoardTag} Cyber Safety Rules & HTML Coding Cheat Sheet`,
          description: `Essential internet security guidelines and practical web development basics.`,
          fileSize: '2.4 MB',
          fileType: 'PDF Cheatsheet',
          downloadsCount: 1950
        }
      ]
    },
    hindi: {
      id: 'hindi',
      name: 'Hindi',
      color: '#EF4444',
      chapters: [
        {
          id: `h-ch-1-${classNum}`,
          subjectName: 'Hindi',
          subjectColor: '#EF4444',
          title: `अध्याय 1: हिंदी साहित्य एवं व्याकरण अभ्यास (${displayClass})`,
          description: `हिंदी पाठ्यपुस्तक व्याख्या, व्याकरण नियम एवं निबंध लेखन (${fullBoardTag}).`,
          digitalMaterial: `हिंदी पाठ्यपुस्तक के अध्यायों का सारांश एवं अभ्यास प्रश्नउत्तर।`,
          topics: [
            { title: "व्याकरण एवं उत्तर व्याख्या", content: "मुख्य व्याकरण नियम, कठिन शब्दार्थ एवं पाठ सारांश।" }
          ]
        }
      ],
      videos: [
        {
          id: `h-vid-1-${classNum}`,
          subjectName: 'Hindi',
          title: `${displayClass} हिंदी पाठ व्याख्या एवं व्याकरण उदाहरण`,
          duration: '10:15',
          level: fullBoardTag,
          thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=400',
          videoUrl: 'https://www.w3schools.com/html/movie.mp4',
          views: `${fullBoardTag} • 2.1k views`,
          author: 'डॉ. मीनाक्षी शर्मा'
        }
      ],
      downloads: [
        {
          id: `h-dl-1-${classNum}`,
          subjectName: 'Hindi',
          title: `${fullBoardTag} हिंदी अभ्यास प्रश्न पत्र`,
          description: `परीक्षा उपयोगी महत्वपूर्ण प्रश्न उत्तर एवं निबंध संग्रह।`,
          fileSize: '2.5 MB',
          fileType: 'PDF Document',
          downloadsCount: 1640
        },
        {
          id: `h-dl-2-${classNum}`,
          subjectName: 'Hindi',
          title: `${fullBoardTag} हिंदी व्याकरण एवं अपठित गद्यांश संग्रह`,
          description: `व्याकरण नियम, पत्र लेखन एवं आदर्श उत्तर कुंजी।`,
          fileSize: '1.8 MB',
          fileType: 'PDF Practice Sheet',
          downloadsCount: 1210
        }
      ]
    },
    sanskrit: {
      id: 'sanskrit',
      name: 'Sanskrit',
      color: '#A855F7',
      chapters: [
        {
          id: `san-ch-1-${classNum}`,
          subjectName: 'Sanskrit',
          subjectColor: '#A855F7',
          title: `अध्याय 1: संस्कृत सुभाषितानि एवं व्याकरणम् (${displayClass})`,
          description: `संस्कृत श्लोक अर्थ, व्याकरण रूप एवं अनुवाद अभ्यास (${fullBoardTag}).`,
          digitalMaterial: `संस्कृत श्लोकों का सरल हिंदी अनुवाद एवं शब्दरूप अभ्यास।`,
          topics: [
            { title: "सुभाषितानि एवं शब्दरूपाणि", content: "श्लोक अर्थ, संधि एवं धातु रूप अभ्यास।" }
          ]
        }
      ],
      videos: [],
      downloads: [
        {
          id: `san-dl-1-${classNum}`,
          subjectName: 'Sanskrit',
          title: `${fullBoardTag} संस्कृत व्याकरण एवं धातु रूप अभ्यास पुस्तक`,
          description: `शब्दरूप, धातुरूप एवं श्लोक अनुवाद अभ्यास प्रश्न संग्रह।`,
          fileSize: '2.2 MB',
          fileType: 'PDF Document',
          downloadsCount: 940
        }
      ]
    }
  };
};

const s = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)'
  },
  headerBanner: {
    background: 'var(--gradient-card)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6) var(--space-8)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
    overflow: 'visible',
    flexWrap: 'wrap',
    gap: 'var(--space-4)'
  },
  glowEffect: {
    position: 'absolute',
    top: '-50%',
    right: '-10%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'var(--shadow-glow)',
    filter: 'blur(80px)',
    opacity: 0.15,
    pointerEvents: 'none'
  },
  primaryTabs: {
    display: 'flex',
    gap: 'var(--space-3)',
    borderBottom: '2px solid var(--color-border-light)',
    paddingBottom: 'var(--space-2)'
  },
  tabButton: (active) => ({
    padding: 'var(--space-3) var(--space-5)',
    border: 'none',
    background: 'transparent',
    color: active ? 'var(--color-primary-dark)' : 'var(--color-text-tertiary)',
    fontWeight: '700',
    fontSize: 'var(--text-base)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    position: 'relative',
    borderBottom: active ? '3px solid var(--color-accent)' : '3px solid transparent',
    transition: 'all 0.2s',
    borderRadius: 'var(--radius-md) var(--radius-md) 0 0'
  }),
  subTabs: {
    display: 'flex',
    gap: 'var(--space-2)',
    background: 'var(--color-bg-alt)',
    padding: '6px',
    borderRadius: 'var(--radius-lg)',
    width: 'fit-content'
  },
  subTabBtn: (active) => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    background: active ? 'var(--color-surface)' : 'transparent',
    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    fontWeight: '600',
    fontSize: 'var(--text-xs)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: active ? 'var(--shadow-xs)' : 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }),
  chapterCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    cursor: 'pointer',
    transition: 'all 0.25s',
    boxShadow: 'var(--shadow-sm)'
  },
  topicRow: {
    padding: 'var(--space-4) var(--space-5)',
    background: 'var(--color-bg)',
    borderRadius: 'var(--radius-lg)',
    borderLeft: '4px solid var(--color-accent)',
    borderTop: '1px solid var(--color-border-light)',
    borderRight: '1px solid var(--color-border-light)',
    borderBottom: '1px solid var(--color-border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-xs)'
  },
  videoCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.25s',
    boxShadow: 'var(--shadow-sm)'
  },
  downloadCard: {
    padding: 'var(--space-5)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    cursor: 'pointer',
    transition: 'all 0.25s',
    boxShadow: 'var(--shadow-sm)'
  },
  personalNotesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 'var(--space-6)'
  },
  noteCard: {
    padding: 'var(--space-5)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 'var(--space-4)',
    backdropFilter: 'blur(8px)'
  },
  modalContent: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    width: '100%',
    maxWidth: '720px',
    boxShadow: 'var(--shadow-2xl)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }
};

const Notes = () => {
  const { user } = useAuth();
  const { notes, addNote, deleteNote } = useContentController();

  // Extract student profile class & board
  const studentClassRaw = user?.classId || user?.grade || '7';
  const studentClassNum = normalizeClass(studentClassRaw) || '7';
  const studentBoardStr = user?.board || 'CBSE';
  
  // Custom interface states
  const [selectedSubjects, setSelectedSubjects] = useState(['math', 'science']);
  const [adminSubjects, setAdminSubjects] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [primaryTab, setPrimaryTab] = useState('materials');
  const [subTab, setSubTab] = useState('chapters');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState({});
  const [playingVideo, setPlayingVideo] = useState(null);
  const [activeTopicModal, setActiveTopicModal] = useState(null);
  
  // Download progress states
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Personal Note inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [liveMaterials, setLiveMaterials] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch subjects & live educational materials from Admin Panel Backend
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const subjRes = await syllabusManagementService.getSubjects();
        if (subjRes.data && subjRes.data.length > 0) {
          setAdminSubjects(subjRes.data);
        }

        const matRes = await syllabusManagementService.getEducationalMaterials();
        if (matRes.data) {
          setLiveMaterials(matRes.data);
        }
      } catch (err) {
        console.warn('Using fallback subject and material mock datasets:', err);
      }
    };
    fetchAdminData();
  }, []);

  // Class-adapted mock data
  const classMockData = useMemo(() => {
    return getMockDataForClass(studentClassNum, studentBoardStr);
  }, [studentClassNum, studentBoardStr]);

  // Combine Admin Subjects with Default Mock Subjects without any duplicate names
  const availableSubjectsList = useMemo(() => {
    const list = [];
    const seenNames = new Set();

    const addSubject = (rawName, customColor) => {
      if (!rawName) return;
      const formattedName = getNormalizedSubjectName(rawName);
      const nameKey = formattedName.toLowerCase();
      if (seenNames.has(nameKey)) return;
      seenNames.add(nameKey);

      const idKey = getCanonicalSubjectKey(formattedName);
      list.push({
        id: idKey,
        name: formattedName,
        color: customColor || classMockData[idKey]?.color || '#6366F1'
      });
    };

    if (adminSubjects && adminSubjects.length > 0) {
      adminSubjects.forEach(sItem => {
        const rawName = sItem.subjectName || sItem.name;
        if (rawName) addSubject(rawName);
      });
    }

    const defaultList = [
      { name: 'Mathematics', color: '#3B82F6' },
      { name: 'Science', color: '#8B5CF6' },
      { name: 'English', color: '#EC4899' },
      { name: 'Social Studies', color: '#F59E0B' },
      { name: 'Computer Science', color: '#10B981' },
      { name: 'Hindi', color: '#EF4444' }
    ];

    defaultList.forEach(d => {
      addSubject(d.name, d.color);
    });

    return list;
  }, [adminSubjects, classMockData]);

  // Handle multi-subject toggle
  const toggleSubjectSelect = (subjId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjId)) {
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== subjId);
      } else {
        return [...prev, subjId];
      }
    });
  };

  const selectAllSubjects = () => {
    setSelectedSubjects(availableSubjectsList.map(s => s.id));
  };

  const clearSubjectSelection = () => {
    if (availableSubjectsList.length > 0) {
      setSelectedSubjects([availableSubjectsList[0].id]);
    }
  };

  // Aggregate chapters, videos, downloads strictly matching student's class and board
  const aggregatedData = useMemo(() => {
    let chapters = [];
    let videos = [];
    let downloads = [];

    // 1. Collect mock items for selected subject keys
    selectedSubjects.forEach(key => {
      const dataObj = classMockData[key] || classMockData['science'] || classMockData['math'];
      if (dataObj) {
        if (dataObj.chapters) chapters.push(...dataObj.chapters);
        if (dataObj.videos) videos.push(...dataObj.videos);
        if (dataObj.downloads) downloads.push(...dataObj.downloads);
      }
    });

    // 2. Filter & merge live Admin-published materials matching student's class & board
    if (liveMaterials && liveMaterials.length > 0) {
      const relevantLiveItems = liveMaterials.filter(m => {
        if (m.isDeleted) return false;

        // Strict Class Filter: match student class or 'all'
        if (m.classId && String(m.classId).toLowerCase() !== 'all') {
          const matClassNorm = normalizeClass(m.classId);
          if (matClassNorm && matClassNorm !== studentClassNum) {
            return false;
          }
        }

        // Strict Board Filter: match student board or 'all'
        if (m.board && String(m.board).toLowerCase() !== 'all') {
          if (String(m.board).toLowerCase() !== studentBoardStr.toLowerCase()) {
            return false;
          }
        }

        // Subject filter
        if (m.subject) {
          const mKey = getCanonicalSubjectKey(m.subject);
          if (!selectedSubjects.includes(mKey) && !selectedSubjects.includes(m.subject.toLowerCase())) {
            return false;
          }
        }

        return true;
      });

      const liveChapters = relevantLiveItems
        .filter(m => m.materialType === 'PDF Notes' || m.materialType === 'Documents' || m.materialType === 'PPT' || m.materialType === 'Assignments')
        .map(m => ({
          id: m._id || m.id,
          subjectName: m.subject || 'Admin Asset',
          subjectColor: '#2563EB',
          title: m.materialTitle,
          description: `${m.chapter || 'Chapter Material'} • ${m.board || studentBoardStr} Class ${m.classId || studentClassNum}`,
          digitalMaterial: m.description || 'Verified study document provided by platform admin.',
          topics: [
            { title: m.materialTitle, content: `Format: ${m.materialType}\nFile Size: ${m.fileSize || '2.5 MB'}\nLanguage: ${m.language || 'English'}` }
          ]
        }));

      const liveVideos = relevantLiveItems
        .filter(m => m.materialType === 'Videos' || m.materialType === 'External Links')
        .map(m => ({
          id: m._id || m.id,
          subjectName: m.subject || 'Admin Asset',
          title: m.materialTitle,
          duration: '10:00',
          level: `${m.board || studentBoardStr} Class ${m.classId || studentClassNum}`,
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
          videoUrl: m.fileUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
          views: `${m.board || studentBoardStr} Class ${m.classId || studentClassNum}`,
          author: 'Platform Instructor'
        }));

      const liveDownloads = relevantLiveItems
        .filter(m => m.materialType === 'Worksheets' || m.materialType === 'Sample Papers' || m.materialType === 'PPT')
        .map(m => ({
          id: m._id || m.id,
          subjectName: m.subject || 'Admin Asset',
          title: m.materialTitle,
          description: m.description || `Official ${m.materialType} resource for ${m.subject}`,
          fileSize: m.fileSize || '2.5 MB',
          fileType: m.materialType,
          downloadsCount: 220
        }));

      chapters = [...liveChapters, ...chapters];
      videos = [...liveVideos, ...videos];
      downloads = [...liveDownloads, ...downloads];
    }

    return { chapters, videos, downloads };
  }, [selectedSubjects, classMockData, liveMaterials, studentClassNum, studentBoardStr]);

  // Filters items depending on search query
  const filteredChapters = aggregatedData.chapters.filter(ch => 
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ch.subjectName && ch.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ch.topics.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVideos = aggregatedData.videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.subjectName && v.subjectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDownloads = aggregatedData.downloads.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.subjectName && d.subjectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle personal notes addition
  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addNote(title, content);
    setTitle('');
    setContent('');
  };

  // Toggle chapter collapse
  const toggleChapter = (chId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chId]: !prev[chId]
    }));
  };

  // Download PDF / file asset with real valid PDF 1.4 binary browser download
  const startMockDownload = (file) => {
    if (file?.fileUrl && file.fileUrl.startsWith('http')) {
      window.open(file.fileUrl, '_blank');
      return;
    }
    if (downloadingFile) return;
    setDownloadingFile(file.id);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const fileName = file.title || 'Study_Resource';
            downloadPDF(
              fileName,
              file.title || 'Study Material',
              file.subjectName || 'Curated Syllabus',
              `${studentBoardStr} Class ${studentClassNum}`,
              file.description || 'Verified educational resource provided for CBSE & State Board curriculum.',
              file.topics || []
            );

            setDownloadingFile(null);
            setDownloadProgress(0);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  // Helper for YouTube embed links
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/').split('&')[0];
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div style={s.container}>
      {/* Immersive Header Banner with Multi-Subject Selection Dropdown */}
      <div style={s.headerBanner}>
        <div style={s.glowEffect} />
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)', margin: 0 }}>
              <Sparkles size={24} color="var(--color-accent)" /> Notes & Study Hub
            </h2>
            <Badge variant="primary" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-primary-dark)', border: '1px solid rgba(99, 102, 241, 0.3)', width: 'fit-content' }}>
              📚 Curated for {studentBoardStr} Class {studentClassNum}
            </Badge>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
            Access curated syllabus notes, topic highlights, digital study materials, video walkthroughs, and downloads for {studentBoardStr} Class {studentClassNum}.
          </p>
        </div>

        {/* Multi-Select Subject Dropdown Component */}
        <div style={{ position: 'relative', zIndex: 20 }} ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-text-primary)',
              fontWeight: '700',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            <Filter size={16} color="var(--color-accent)" />
            <span>
              {selectedSubjects.length === availableSubjectsList.length
                ? 'All Subjects Selected'
                : selectedSubjects.length === 1
                ? (availableSubjectsList.find(s => s.id === selectedSubjects[0])?.name || '1 Subject Selected')
                : `${selectedSubjects.length} Subjects Selected`}
            </span>
            <ChevronDown size={16} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '280px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--space-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 999
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                  Filter Subjects
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={selectAllSubjects}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Select All
                  </button>
                  <span style={{ color: 'var(--color-border-light)' }}>|</span>
                  <button 
                    type="button"
                    onClick={clearSubjectSelection}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Subject Checkbox Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '240px', overflowY: 'auto' }}>
                {availableSubjectsList.map(subj => {
                  const isChecked = selectedSubjects.includes(subj.id);
                  return (
                    <div 
                      key={subj.id}
                      onClick={() => toggleSubjectSelect(subj.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'var(--color-bg-alt)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: `2px solid ${isChecked ? subj.color : 'var(--color-border-light)'}`,
                          background: isChecked ? subj.color : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          color: '#fff',
                          transition: 'all 0.15s'
                        }}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: isChecked ? '700' : '500', color: 'var(--color-text-primary)' }}>
                          {subj.name}
                        </span>
                      </div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subj.color }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Subjects Chips bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Active Filters:</span>
        {selectedSubjects.map(key => {
          const sObj = availableSubjectsList.find(s => s.id === key);
          if (!sObj) return null;
          return (
            <div 
              key={sObj.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: `${sObj.color}15`,
                color: sObj.color,
                border: `1px solid ${sObj.color}30`,
                fontSize: 'var(--text-xs)',
                fontWeight: '700'
              }}
            >
              <span>{sObj.name}</span>
              {selectedSubjects.length > 1 && (
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => toggleSubjectSelect(sObj.id)} />
              )}
            </div>
          );
        })}
      </div>

      {/* Primary Tab Navigation */}
      <div style={s.primaryTabs}>
        <button 
          style={s.tabButton(primaryTab === 'materials')} 
          onClick={() => setPrimaryTab('materials')}
        >
          <BookOpen size={18} />
          <span>Study Materials</span>
          <Badge variant="primary">Class {studentClassNum}</Badge>
        </button>
        <button 
          style={s.tabButton(primaryTab === 'personal')} 
          onClick={() => setPrimaryTab('personal')}
        >
          <FileText size={18} />
          <span>My Personal Notes</span>
          <Badge variant="neutral">{notes.length}</Badge>
        </button>
      </div>

      {/* TAB 1: CURATED STUDY MATERIALS HUB */}
      {primaryTab === 'materials' && (
        <div>
          {/* Sub Tab selection & Search bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={s.subTabs}>
              <button 
                style={s.subTabBtn(subTab === 'chapters')}
                onClick={() => setSubTab('chapters')}
              >
                <BookOpen size={14} />
                <span>Chapter & Topic Notes</span>
              </button>
              <button 
                style={s.subTabBtn(subTab === 'videos')}
                onClick={() => setSubTab('videos')}
              >
                <Video size={14} />
                <span>Video Tutorials</span>
              </button>
              <button 
                style={s.subTabBtn(subTab === 'downloads')}
                onClick={() => setSubTab('downloads')}
              >
                <Download size={14} />
                <span>Educational PDFs & Resources</span>
              </button>
            </div>

            <div style={{ width: '280px' }}>
              <Input 
                placeholder="Search notes, topics, videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconLeft={<Search size={16} />}
              />
            </div>
          </div>

          {/* SECTION A: CHAPTER & TOPIC NOTES */}
          {subTab === 'chapters' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filteredChapters.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <BookOpen size={40} color="var(--color-text-tertiary)" style={{ marginBottom: 'var(--space-2)' }} />
                  <h4>No chapter notes found for Class {studentClassNum}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Try adjusting your search query or selecting additional subjects in the dropdown filter.</p>
                </Card>
              ) : (
                filteredChapters.map(ch => {
                  const isExpanded = expandedChapters[ch.id];
                  return (
                    <div key={ch.id} style={s.chapterCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Badge variant="primary" style={{ background: `${ch.subjectColor || 'var(--color-accent)'}20`, color: ch.subjectColor || 'var(--color-accent)', border: `1px solid ${ch.subjectColor || 'var(--color-accent)'}40` }}>
                              {ch.subjectName || 'Syllabus Note'}
                            </Badge>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: '600' }}>{ch.topics.length} Topic Highlights</span>
                          </div>
                          <h3 
                            onClick={() => setActiveTopicModal({ chapter: ch, topic: ch.topics[0] })}
                            style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-heading)', cursor: 'pointer' }}
                            className="subject-card-hover"
                          >
                            {ch.title}
                          </h3>
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
                            {ch.description}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleChapter(ch.id)}
                          iconRight={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        >
                          {isExpanded ? 'Collapse' : 'Explore Topics'}
                        </Button>
                      </div>

                      {/* Expandable Topic Highlights */}
                      {isExpanded && (
                        <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)' }}>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-accent)', textTransform: 'uppercase' }}>Digital Study Summary:</span>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginTop: '4px', lineHeight: '1.6' }}>
                              {ch.digitalMaterial}
                            </p>
                          </div>

                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginTop: 'var(--space-2)' }}>Key Topic Explanations:</span>
                          {ch.topics.map((t, idx) => (
                            <div 
                              key={idx} 
                              style={s.topicRow}
                              onClick={() => setActiveTopicModal({ chapter: ch, topic: t })}
                              className="subject-card-hover"
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                <span style={{ fontWeight: '700', fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)' }}>{t.title}</span>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5', whitespace: 'pre-line' }}>{t.content}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontWeight: '700', fontSize: 'var(--text-xs)', flexShrink: 0, paddingLeft: '12px' }}>
                                <span>Read Full Topic</span>
                                <Sparkles size={14} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SECTION B: VIDEO TUTORIALS */}
          {subTab === 'videos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
              {filteredVideos.length === 0 ? (
                <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-8)' }}>
                  <Video size={40} color="var(--color-text-tertiary)" style={{ marginBottom: 'var(--space-2)' }} />
                  <h4>No video tutorials found for Class {studentClassNum}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Try adjusting your search query or subject filters.</p>
                </Card>
              ) : (
                filteredVideos.map(vid => (
                  <div key={vid.id} style={s.videoCard} className="subject-card-hover">
                    <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                      <img src={vid.thumbnail} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button 
                          onClick={() => setPlayingVideo(vid)}
                          style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--color-accent)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-lg)', transition: 'transform 0.2s' }}
                        >
                          <Play size={24} fill="white" style={{ marginLeft: '4px' }} />
                        </button>
                      </div>
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0, 0, 0, 0.75)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        {vid.duration}
                      </span>
                    </div>

                    <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge variant="secondary">{vid.subjectName || 'Tutorial'}</Badge>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{vid.views}</span>
                      </div>
                      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--color-primary-dark)', lineHeight: '1.4' }}>
                        {vid.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        <Info size={14} />
                        <span>Instructor: {vid.author}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SECTION C: EDUCATIONAL PDFS & DOWNLOADS */}
          {subTab === 'downloads' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
              {filteredDownloads.length === 0 ? (
                <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-8)' }}>
                  <Download size={40} color="var(--color-text-tertiary)" style={{ marginBottom: 'var(--space-2)' }} />
                  <h4>No downloadable PDFs found for Class {studentClassNum}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Try searching for a different topic or adding subjects.</p>
                </Card>
              ) : (
                filteredDownloads.map(dl => {
                  const isDownloading = downloadingFile === dl.id;
                  return (
                    <div 
                      key={dl.id} 
                      style={s.downloadCard}
                      onClick={() => startMockDownload(dl)}
                      className="subject-card-hover"
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                          <Badge variant="primary">{dl.subjectName || dl.fileType}</Badge>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: '600' }}>{dl.fileSize}</span>
                        </div>
                        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                          {dl.title}
                        </h4>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                          {dl.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {isDownloading && (
                          <div style={{ width: '100%', background: 'var(--color-bg-alt)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${downloadProgress}%`, background: 'var(--color-accent)', height: '100%', transition: 'width 0.15s ease-out' }} />
                          </div>
                        )}

                        <Button 
                          variant="secondary"
                          size="sm"
                          fullWidth
                          loading={isDownloading}
                          onClick={(e) => {
                            e.stopPropagation();
                            startMockDownload(dl);
                          }}
                          iconLeft={<FileDown size={16} />}
                        >
                          {isDownloading ? `Downloading (${downloadProgress}%)...` : `Download Resource PDF`}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY PERSONAL NOTES */}
      {primaryTab === 'personal' && (
        <div style={s.personalNotesGrid}>
          {/* Note Editor */}
          <Card style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="var(--color-accent)" /> Create Personal Note
            </h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Input
                label="Note Title"
                placeholder="e.g. Science Revision Formulas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Note Contents
                </label>
                <textarea
                  placeholder="Write your study takeaways, key formulas, or questions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-light)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                    fontSize: 'var(--text-sm)',
                    outline: 'none'
                  }}
                />
              </div>
              <Button variant="primary" fullWidth type="submit" iconLeft={<Plus size={16} />}>
                Save Note
              </Button>
            </form>
          </Card>

          {/* Personal Notes List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {notes.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <FileText size={40} color="var(--color-text-tertiary)" style={{ marginBottom: 'var(--space-2)' }} />
                <h4>No personal notes created yet</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Create your first personal study note using the form on the left.</p>
              </Card>
            ) : (
              notes.map((note) => (
                <div key={note.id} style={s.noteCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--color-primary-dark)' }}>{note.title}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={12} /> {note.createdAt || 'Just now'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteNote(note.id)}
                      style={{ color: 'var(--color-error)' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5', whitespace: 'pre-line' }}>
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Interactive Topic Notes Reader Modal */}
      {activeTopicModal && (
        <div style={s.modalOverlay} onClick={() => setActiveTopicModal(null)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: 'var(--space-5) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-alt)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge variant="primary">{activeTopicModal.chapter?.subjectName || 'Syllabus Notes'}</Badge>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-text-tertiary)' }}>
                  {studentBoardStr} Class {studentClassNum}
                </span>
              </div>
              <button 
                onClick={() => setActiveTopicModal(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxHeight: '80vh', overflowY: 'auto' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                  {activeTopicModal.chapter?.title}
                </span>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '900', color: 'var(--color-primary-dark)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                  {activeTopicModal.topic?.title || activeTopicModal.chapter?.title}
                </h3>
              </div>

              <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-light)' }}>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-primary-dark)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  📖 Chapter Overview & Syllabus Context
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                  {activeTopicModal.chapter?.digitalMaterial || activeTopicModal.chapter?.description}
                </p>
              </div>

              <div style={{ padding: 'var(--space-5)', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '800', color: 'var(--color-primary-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--color-accent)" /> Detailed Concept & Solution Breakdown
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {activeTopicModal.topic?.content}
                </p>
              </div>

              <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--color-success)' }}>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-text-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  💡 Exam Strategy & Formula Reminder
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  Revise definitions, solve textbook exercises, and memorize key theorems for your {studentBoardStr} Class {studentClassNum} examinations.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)' }}>
                <Button 
                  variant="secondary" 
                  size="sm"
                  iconLeft={<Download size={16} />}
                  onClick={() => startMockDownload({ title: `${activeTopicModal.topic?.title || 'Topic'}_Notes`, fileSize: '1.8 MB', fileType: 'PDF Document', subjectName: activeTopicModal.chapter?.subjectName })}
                >
                  Download Topic PDF
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setActiveTopicModal(null)}
                >
                  Done Reading
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal Player */}
      {playingVideo && (
        <div style={s.modalOverlay} onClick={() => setPlayingVideo(null)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)' }}>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0 }}>{playingVideo.title}</h4>
              <button onClick={() => setPlayingVideo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '0', background: '#000', height: '360px', position: 'relative' }}>
              {playingVideo.videoUrl && (playingVideo.videoUrl.includes('youtube') || playingVideo.videoUrl.includes('youtu.be') || playingVideo.videoUrl.includes('embed')) ? (
                <iframe
                  key={playingVideo.id}
                  src={getEmbedUrl(playingVideo.videoUrl)}
                  title={playingVideo.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  key={playingVideo.id}
                  src={playingVideo.videoUrl}
                  controls 
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant="primary">{playingVideo.level || `${studentBoardStr} Class ${studentClassNum}`}</Badge>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Duration: {playingVideo.duration || '10:00'} • {playingVideo.views || 'Standard'}</span>
                </div>
                {playingVideo.videoUrl && (
                  <Button variant="outline" size="xs" onClick={() => window.open(playingVideo.videoUrl, '_blank')}>
                    Open Link ↗
                  </Button>
                )}
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', color: 'var(--color-text-primary)' }}>{playingVideo.title}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                This educational video explains fundamental concepts for {studentBoardStr} Class {studentClassNum} led by <b>{playingVideo.author || 'Instructor'}</b>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
