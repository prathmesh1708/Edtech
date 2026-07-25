import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
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
  ArrowRight,
  Bookmark,
  FileDown,
  Info,
  Clock,
  Filter,
  Check,
  Layers
} from 'lucide-react';
import useContentController from '../../../../controllers/useContentController';
import syllabusManagementService from '../../../../models/services/syllabusManagementService';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';

// Comprehensive Multi-Subject Mock Dataset for Notes & Study Hub
const MOCK_DATA = {
  math: {
    id: 'math',
    name: 'Mathematics',
    color: '#3B82F6',
    chapters: [
      {
        id: 'm-ch-1',
        subjectName: 'Mathematics',
        subjectColor: '#3B82F6',
        title: 'Chapter 1: Real Numbers',
        description: 'Explore the fundamental properties of integers, divisors, algorithms, and irrationality.',
        digitalMaterial: 'Real numbers form the foundation of algebra. In this chapter, we focus on Euclid\'s Division Algorithm, prime factorization representations, and proofs of irrationality.',
        topics: [
          { title: "Euclid's Division Lemma", content: "Given positive integers a and b, there exist unique integers q and r satisfying a = bq + r, where 0 <= r < b. This lemma is heavily used to calculate the Highest Common Factor (HCF) of large numbers." },
          { title: "The Fundamental Theorem of Arithmetic", content: "Every composite number can be expressed (factorized) as a product of prime numbers, and this factorization is unique, apart from the order in which the prime factors occur. Useful for understanding LCM and HCF concepts." },
          { title: "Revisiting Irrational Numbers", content: "Proving numbers like √2, √3, and √5 are irrational by contradiction. A number is irrational if it cannot be expressed in the form p/q, where p and q are integers and q != 0." }
        ]
      },
      {
        id: 'm-ch-2',
        subjectName: 'Mathematics',
        subjectColor: '#3B82F6',
        title: 'Chapter 2: Polynomials',
        description: 'Study expressions containing variables, degree of polynomials, coefficients, and graphical representations.',
        digitalMaterial: 'Polynomial expressions are essential for mathematical modeling. Here, we analyze quadratic expressions, relationship of zeroes, and coefficient division theorems.',
        topics: [
          { title: "Geometrical Meaning of Zeroes", content: "The zeroes of a polynomial p(x) are the x-coordinates of the points where the graph of y = p(x) intersects the x-axis. A polynomial of degree n can have at most n zeroes." },
          { title: "Relation between Zeroes and Coefficients", content: "For a quadratic polynomial ax² + bx + c, if α and β are the zeroes, then: α + β = -b/a (sum of zeroes), and αβ = c/a (product of zeroes)." },
          { title: "Division Algorithm for Polynomials", content: "If p(x) and g(x) are any two polynomials with g(x) != 0, then we can find polynomials q(x) and r(x) such that: p(x) = g(x) × q(x) + r(x), where r(x) = 0 or degree of r(x) < degree of g(x)." }
        ]
      }
    ],
    videos: [
      {
        id: 'm-vid-1',
        subjectName: 'Mathematics',
        title: 'Visualizing Quadratic Equations & Zeroes Graphically',
        duration: '12:45',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        views: '2.5k views',
        author: 'Prof. Rajesh Sharma'
      },
      {
        id: 'm-vid-2',
        subjectName: 'Mathematics',
        title: 'Euclid\'s Division Algorithm Step-by-Step Proof',
        duration: '8:20',
        level: 'Basic',
        thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        views: '1.8k views',
        author: 'Dr. Anita Desai'
      }
    ],
    downloads: [
      {
        id: 'm-dl-1',
        subjectName: 'Mathematics',
        title: 'NCERT Class 10 Mathematics Exemplar Solutions',
        description: 'Complete solved exemplars and practice questions with detailed proofs for CBSE Board prep.',
        fileSize: '4.2 MB',
        fileType: 'PDF Document',
        downloadsCount: 1420
      },
      {
        id: 'm-dl-2',
        subjectName: 'Mathematics',
        title: 'Formula Cheat Sheet & Quick Revision Notes',
        description: 'One-page summary sheet containing all theorems, identities, and equations for quick revision.',
        fileSize: '750 KB',
        fileType: 'PDF Document',
        downloadsCount: 3840
      }
    ]
  },
  science: {
    id: 'science',
    name: 'Science',
    color: '#8B5CF6',
    chapters: [
      {
        id: 's-ch-1',
        subjectName: 'Science',
        subjectColor: '#8B5CF6',
        title: 'Chapter 1: Chemical Reactions and Equations',
        description: 'Understand how substance compositions undergo change, write chemical equations, and classify chemical reactions.',
        digitalMaterial: 'Chemical processes are described using chemical equations. In this chapter, we master the law of conservation of mass, balancing equation coefficients, and reaction conditions.',
        topics: [
          { title: "Writing & Balancing Chemical Equations", content: "A chemical equation shows reactants, products, and physical states. To satisfy the law of conservation of mass, we must balance equations by making the number of atoms of each element equal on both sides." },
          { title: "Types of Chemical Reactions", content: "1. Combination: Two reactants form one product.\n2. Decomposition: One reactant breaks down into multiple products.\n3. Displacement: A reactive element displaces a less reactive one.\n4. Double Displacement: Exchange of ions between compounds." }
        ]
      },
      {
        id: 's-ch-2',
        subjectName: 'Science',
        subjectColor: '#8B5CF6',
        title: 'Chapter 2: Acids, Bases and Salts',
        description: 'Analyze chemical properties, indicators, pH scale strength, and practical significance of household salts.',
        digitalMaterial: 'Acids and bases neutralise each other. We evaluate hydrogen ion concentration (pH scale) and study standard salts like sodium hydroxide and bleaching powder.',
        topics: [
          { title: "Chemical Properties of Acids & Bases", content: "Acids turn blue litmus red, conduct electricity in solution, and react with metals to release Hydrogen gas." },
          { title: "The pH Scale and Importance", content: "A scale for measuring Hydrogen ion concentration (0 to 14). pH < 7 is acidic, pH > 7 is basic, and pH = 7 is neutral." }
        ]
      }
    ],
    videos: [
      {
        id: 's-vid-1',
        subjectName: 'Science',
        title: 'Decomposition and Displacement Reactions Demo',
        duration: '9:15',
        level: 'Basic',
        thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        views: '3.1k views',
        author: 'Prof. Ramesh Sharma'
      }
    ],
    downloads: [
      {
        id: 's-dl-1',
        subjectName: 'Science',
        title: 'Chemical Equations Practice Worksheets with Keys',
        description: 'Contains 50+ balanced/unbalanced chemical equation practice questions with step-by-step solutions.',
        fileSize: '1.2 MB',
        fileType: 'PDF Document',
        downloadsCount: 2950
      }
    ]
  },
  english: {
    id: 'english',
    name: 'English',
    color: '#EC4899',
    chapters: [
      {
        id: 'e-ch-1',
        subjectName: 'English',
        subjectColor: '#EC4899',
        title: 'Chapter 1: A Letter to God & Dust of Snow',
        description: 'Master literary elements, theme analysis, character sketches of Lencho, and poetic devices.',
        digitalMaterial: 'Explore Lencho\'s unshakeable faith in God and how nature\'s small moments can lift human spirits.',
        topics: [
          { title: "Theme & Character Sketch of Lencho", content: "Lencho represents innocent and unwavering faith. The story highlights the irony of human nature when Lencho suspects the post office employees who actually helped him." },
          { title: "Poetic Devices in Dust of Snow", content: "Robert Frost uses symbolism (crow, hemlock tree) to illustrate how negative symbols can bring positive mental transformations." }
        ]
      }
    ],
    videos: [
      {
        id: 'e-vid-1',
        subjectName: 'English',
        title: 'Mastering Formal Letter Writing & Analytical Paragraphs',
        duration: '11:10',
        level: 'Basic',
        thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        views: '4.2k views',
        author: 'Ma\'am Sunita Verma'
      }
    ],
    downloads: [
      {
        id: 'e-dl-1',
        subjectName: 'English',
        title: 'Class 10 English Literature Important Question Bank',
        description: 'Top selected short and long answer questions with marking scheme solutions.',
        fileSize: '2.1 MB',
        fileType: 'PDF Document',
        downloadsCount: 1890
      }
    ]
  },
  social: {
    id: 'social',
    name: 'Social Studies',
    color: '#F59E0B',
    chapters: [
      {
        id: 'sst-ch-1',
        subjectName: 'Social Studies',
        subjectColor: '#F59E0B',
        title: 'Chapter 1: The Rise of Nationalism in Europe',
        description: 'Understand the French Revolution, Liberal Nationalism, Revolutionaries, and Unification of Italy & Germany.',
        digitalMaterial: 'Detailed timeline of European nation-state formations, Frederic Sorrieu vision, Napoleonic Code 1804, and Treaty of Vienna 1815.',
        topics: [
          { title: "The French Revolution and the Idea of the Nation", content: "The French Revolution introduced la patrie (the fatherland) and le citoyen (the citizen), replacing the royal standard with the tricolour flag." },
          { title: "Unification of Italy & Germany", content: "Count Cavour and Giuseppe Garibaldi spearheaded Italian unification. Otto von Bismarck led German unification under Prussian leadership." }
        ]
      }
    ],
    videos: [
      {
        id: 'sst-vid-1',
        subjectName: 'Social Studies',
        title: 'Interactive Map Practice & Geography Location Tricks',
        duration: '15:30',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        views: '5.0k views',
        author: 'Prof. Vikram Singh'
      }
    ],
    downloads: [
      {
        id: 'sst-dl-1',
        subjectName: 'Social Studies',
        title: 'CBSE Class 10 Map Work & Historical Events Booklet',
        description: 'High-resolution maps covering major ports, dams, airports, and freedom movement locations.',
        fileSize: '5.6 MB',
        fileType: 'PDF Document',
        downloadsCount: 4120
      }
    ]
  },
  computer: {
    id: 'computer',
    name: 'Computer Science',
    color: '#10B981',
    chapters: [
      {
        id: 'cs-ch-1',
        subjectName: 'Computer Science',
        subjectColor: '#10B981',
        title: 'Chapter 1: Python Programming Fundamentals',
        description: 'Data types, control structures, loops, functions, lists, dictionaries, and debugging.',
        digitalMaterial: 'Hands-on guide to writing clean Python programs, implementing conditional logic, and handling data collections.',
        topics: [
          { title: "Python Loops & Conditionals", content: "Understand if-elif-else branching, while loops, for loops with range(), and list comprehension syntax." },
          { title: "User-Defined Functions & Modules", content: "Define functions using def, pass parameters, return values, and import built-in math and random modules." }
        ]
      }
    ],
    videos: [
      {
        id: 'cs-vid-1',
        subjectName: 'Computer Science',
        title: 'Building a Full Python Project from Scratch',
        duration: '18:20',
        level: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        views: '6.1k views',
        author: 'Er. Alok Mehta'
      }
    ],
    downloads: [
      {
        id: 'cs-dl-1',
        subjectName: 'Computer Science',
        title: 'Class 10 IT & Computer Science Lab Practical Codebook',
        description: 'Executable Python codes, SQL query cheatsheet, and HTML/CSS web projects.',
        fileSize: '3.8 MB',
        fileType: 'PDF Document',
        downloadsCount: 2780
      }
    ]
  },
  hindi: {
    id: 'hindi',
    name: 'Hindi',
    color: '#EF4444',
    chapters: [
      {
        id: 'h-ch-1',
        subjectName: 'Hindi',
        subjectColor: '#EF4444',
        title: 'अध्याय 1: पदबंध और समास विचार',
        description: 'हिंदी व्याकरण: पदबंध के भेद (संज्ञा, सर्वनाम, विशेषण, क्रिया) एवं समास विग्रह।',
        digitalMaterial: 'हिंदी भाषा के व्याकरण नियम, मुहावरे, अपठित गद्यांश एवं पत्र लेखन का विस्तृत विवरण।',
        topics: [
          { title: "पदबंध की परिभाषा एवं प्रकार", content: "जब दो या दो से अधिक पद मिलकर एक शब्द का कार्य करते हैं, तो उस बंधे हुए पद समूह को पदबंध कहते हैं।" },
          { title: "समास एवं समास विग्रह", content: "तत्पुरुष, द्विगु, द्वंद्व, बहुव्रीहि, कर्मधारय और अव्ययीभाव समास की सरल व्याख्या।" }
        ]
      }
    ],
    videos: [
      {
        id: 'h-vid-1',
        subjectName: 'Hindi',
        title: 'हिंदी व्याकरण: समास और पदबंध आसान उदाहरणों के साथ',
        duration: '10:15',
        level: 'Basic',
        thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        views: '1.9k views',
        author: 'डॉ. मीनाक्षी शर्मा'
      }
    ],
    downloads: [
      {
        id: 'h-dl-1',
        subjectName: 'Hindi',
        title: 'हिंदी स्पर्श एवं संचयन महत्वपूर्ण प्रश्न उत्तर',
        description: 'सीबीएसई बोर्ड परीक्षा हेतु पाठ्यपुस्तक के सभी अध्यायों के हल प्रश्न।',
        fileSize: '2.8 MB',
        fileType: 'PDF Document',
        downloadsCount: 1640
      }
    ]
  }
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
    padding: 'var(--space-4)',
    background: 'var(--color-bg)',
    borderRadius: 'var(--radius-lg)',
    borderLeft: '4px solid var(--color-accent)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
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
  // Existing notes logic hook
  const { notes, addNote, deleteNote } = useContentController();
  
  // Custom interface states
  const [selectedSubjects, setSelectedSubjects] = useState(['math', 'science']); // Multi-subject selection keys
  const [adminSubjects, setAdminSubjects] = useState([]);                       // Subjects from Admin Panel API
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [primaryTab, setPrimaryTab] = useState('materials');  // 'materials' or 'personal'
  const [subTab, setSubTab] = useState('chapters');            // 'chapters', 'videos', or 'downloads'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState({});
  const [playingVideo, setPlayingVideo] = useState(null);
  
  // Download progress states
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Personal Note inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [liveMaterials, setLiveMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

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
        setLoadingMaterials(true);
        // Fetch Subjects from Admin Panel
        const subjRes = await syllabusManagementService.getSubjects();
        if (subjRes.data && subjRes.data.length > 0) {
          setAdminSubjects(subjRes.data);
        }

        // Fetch Educational Materials from Admin Panel
        const matRes = await syllabusManagementService.getEducationalMaterials();
        if (matRes.data) {
          setLiveMaterials(matRes.data);
        }
      } catch (err) {
        console.warn('Using fallback subject and material mock datasets:', err);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchAdminData();
  }, []);

  // Combine Admin Subjects with Default Mock Subjects
  const availableSubjectsList = useMemo(() => {
    const defaultList = [
      { id: 'math', name: 'Mathematics', color: '#3B82F6' },
      { id: 'science', name: 'Science', color: '#8B5CF6' },
      { id: 'english', name: 'English', color: '#EC4899' },
      { id: 'social', name: 'Social Studies', color: '#F59E0B' },
      { id: 'computer', name: 'Computer Science', color: '#10B981' },
      { id: 'hindi', name: 'Hindi', color: '#EF4444' }
    ];

    if (!adminSubjects || adminSubjects.length === 0) return defaultList;

    // Map Admin subjects to list
    const adminMapped = adminSubjects.map(sItem => {
      const sName = sItem.subjectName || sItem.name || 'Subject';
      const sKey = sName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return {
        id: MOCK_DATA[sKey] ? sKey : sName.toLowerCase(),
        name: sName,
        color: MOCK_DATA[sKey]?.color || '#6366F1'
      };
    });

    // Merge uniquely
    const existingKeys = new Set(adminMapped.map(s => s.id));
    defaultList.forEach(d => {
      if (!existingKeys.has(d.id)) {
        adminMapped.push(d);
      }
    });

    return adminMapped;
  }, [adminSubjects]);

  // Handle multi-subject toggle
  const toggleSubjectSelect = (subjId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjId)) {
        if (prev.length === 1) return prev; // Keep at least 1 subject selected
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

  // Aggregate chapters, videos, downloads across all selected subjects
  const aggregatedData = useMemo(() => {
    let chapters = [];
    let videos = [];
    let downloads = [];

    // Collect mock items for selected keys
    selectedSubjects.forEach(key => {
      const dataObj = MOCK_DATA[key];
      if (dataObj) {
        if (dataObj.chapters) chapters.push(...dataObj.chapters);
        if (dataObj.videos) videos.push(...dataObj.videos);
        if (dataObj.downloads) downloads.push(...dataObj.downloads);
      }
    });

    // Merge live Admin-published materials if available
    if (liveMaterials && liveMaterials.length > 0) {
      const liveChapters = liveMaterials
        .filter(m => !m.isDeleted && (m.materialType === 'PDF Notes' || m.materialType === 'Documents'))
        .map(m => ({
          id: m._id || m.id,
          subjectName: m.subject || 'Admin Asset',
          subjectColor: '#2563EB',
          title: m.materialTitle,
          description: `${m.chapter || 'Chapter Material'} • ${m.board} ${m.classId}`,
          digitalMaterial: m.description || 'Verified study document provided by platform admin.',
          topics: [
            { title: m.materialTitle, content: `Format: ${m.materialType}\nFile Size: ${m.fileSize}\nLanguage: ${m.language}` }
          ]
        }));

      const liveVideos = liveMaterials
        .filter(m => !m.isDeleted && m.materialType === 'Videos')
        .map(m => ({
          id: m._id || m.id,
          subjectName: m.subject || 'Admin Asset',
          title: m.materialTitle,
          duration: '10:00',
          level: 'Standard',
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
          videoUrl: m.fileUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
          views: 'Live Admin Upload',
          author: 'Platform Instructor'
        }));

      const liveDownloads = liveMaterials
        .filter(m => !m.isDeleted && (m.materialType === 'Worksheets' || m.materialType === 'Sample Papers' || m.materialType === 'PPT'))
        .map(m => ({
          id: m._id || m.id,
          subjectName: m.subject || 'Admin Asset',
          title: m.materialTitle,
          description: m.description || `Official ${m.materialType} resource`,
          fileSize: m.fileSize || '2.5 MB',
          fileType: m.materialType,
          downloadsCount: 220
        }));

      chapters = [...liveChapters, ...chapters];
      videos = [...liveVideos, ...videos];
      downloads = [...liveDownloads, ...downloads];
    }

    return { chapters, videos, downloads };
  }, [selectedSubjects, liveMaterials]);

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

  // Download PDF / file asset
  const startMockDownload = (file) => {
    if (file?.fileUrl) {
      window.open(file.fileUrl, '_blank');
    }
    if (downloadingFile) return;
    setDownloadingFile(file.id);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingFile(null);
            setDownloadProgress(0);
          }, 800);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const [liveMaterials, setLiveMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Fetch live educational materials published by Admin
  useEffect(() => {
    const fetchLiveMaterials = async () => {
      try {
        setLoadingMaterials(true);
        const res = await syllabusManagementService.getEducationalMaterials();
        if (res.data) {
          setLiveMaterials(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch live educational materials, using fallback mock data:', err);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchLiveMaterials();
  }, []);

  // Merge live items with mock data safely for all subjects
  const rawSubjectData = MOCK_DATA[activeSubject] || { 
    name: activeSubject ? activeSubject.charAt(0).toUpperCase() + activeSubject.slice(1) : 'Subject', 
    color: 'var(--color-primary)', 
    chapters: [], 
    videos: [], 
    downloads: [] 
  };

  const subjectData = React.useMemo(() => {
    const baseChapters = rawSubjectData.chapters || [];
    const baseVideos = rawSubjectData.videos || [];
    const baseDownloads = rawSubjectData.downloads || [];

    if (!liveMaterials || liveMaterials.length === 0) return { ...rawSubjectData, chapters: baseChapters, videos: baseVideos, downloads: baseDownloads };

    // Match live materials for active subject or all subjects
    const relevantLiveItems = liveMaterials.filter(m => {
      if (m.isDeleted) return false;
      if (!activeSubject || activeSubject === 'all') return true;
      const subjLower = m.subject?.toLowerCase() || '';
      const actLower = activeSubject.toLowerCase();
      if (subjLower.includes(actLower)) return true;
      if (actLower === 'math' && subjLower.includes('math')) return true;
      if (actLower === 'science' && (subjLower.includes('sci') || subjLower.includes('phy') || subjLower.includes('chem') || subjLower.includes('bio'))) return true;
      return false;
    });

    if (relevantLiveItems.length === 0) return { ...rawSubjectData, chapters: baseChapters, videos: baseVideos, downloads: baseDownloads };

    // Map live backend items into sub-categories
    const liveChapters = relevantLiveItems
      .filter(m => m.materialType === 'PDF Notes' || m.materialType === 'Documents' || m.materialType === 'PPT' || m.materialType === 'Assignments')
      .map(m => ({
        id: m._id || m.id,
        title: m.materialTitle,
        description: `${m.chapter || 'Chapter Material'} • ${m.board || 'CBSE'} ${m.classId || ''}`,
        digitalMaterial: m.description || 'Verified study document provided by platform admin.',
        fileUrl: m.fileUrl,
        topics: [
          { title: m.materialTitle, content: `${m.description ? m.description + '\n\n' : ''}Format: ${m.materialType}\nFile Size: ${m.fileSize || '2.5 MB'}\nLanguage: ${m.language || 'English'}${m.fileUrl ? '\nFile URL: ' + m.fileUrl : ''}` }
        ]
      }));

    const liveVideos = relevantLiveItems
      .filter(m => m.materialType === 'Videos' || m.materialType === 'External Links' || (m.fileUrl && (m.fileUrl.includes('youtube') || m.fileUrl.includes('youtu') || m.fileUrl.includes('.mp4'))))
      .map(m => ({
        id: m._id || m.id,
        title: m.materialTitle,
        duration: '10:00',
        level: m.classId || 'Standard',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
        videoUrl: m.fileUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
        views: `${m.board || 'CBSE'} ${m.classId || ''}`,
        author: 'Platform Instructor'
      }));

    const liveDownloads = relevantLiveItems
      .filter(m => m.materialType === 'Worksheets' || m.materialType === 'Sample Papers' || m.materialType === 'PDF Notes' || m.materialType === 'Documents' || m.materialType === 'PPT' || m.materialType === 'Previous Year Papers')
      .map(m => ({
        id: m._id || m.id,
        title: m.materialTitle,
        description: m.description || `Official ${m.materialType} resource for ${m.subject}`,
        fileSize: m.fileSize || '2.5 MB',
        fileType: m.materialType,
        fileUrl: m.fileUrl,
        downloadsCount: 150
      }));

    return {
      ...rawSubjectData,
      chapters: [...liveChapters, ...baseChapters],
      videos: [...liveVideos, ...baseVideos],
      downloads: [...liveDownloads, ...baseDownloads]
    };
  }, [liveMaterials, activeSubject, rawSubjectData]);

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

  // Filters items depending on search query
  const filteredChapters = (subjectData.chapters || []).filter(ch => 
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ch.topics && ch.topics.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredVideos = (subjectData.videos || []).filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.author && v.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDownloads = (subjectData.downloads || []).filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={s.container}>
      {/* Immersive Header Banner with Multi-Subject Selection Dropdown */}
      <div style={s.headerBanner}>
        <div style={s.glowEffect} />
        <div style={{ zIndex: 2 }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '900', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
            <Sparkles size={24} color="var(--color-accent)" /> Notes & Study Hub
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
            Access curated syllabus notes, topic highlights, digital study materials, video walkthroughs, and downloads.
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
                          justifyContent: 'center',
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
          <Badge variant="primary">Curated</Badge>
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
                  <h4>No chapter notes found</h4>
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
                          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-heading)' }}>
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
                            <div key={idx} style={s.topicRow}>
                              <span style={{ fontWeight: '700', fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)' }}>{t.title}</span>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5', whitespace: 'pre-line' }}>{t.content}</p>
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
                  <h4>No video tutorials found</h4>
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
                  <h4>No downloadable PDFs found</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Try searching for a different topic or adding subjects.</p>
                </Card>
              ) : (
                filteredDownloads.map(dl => {
                  const isDownloading = downloadingFile === dl.id;
                  return (
                    <div key={dl.id} style={s.downloadCard}>
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
                          onClick={() => startMockDownload(dl)}
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
                placeholder="e.g. Chemical Formulas Cheat Sheet"
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
                  <Badge variant="primary">{playingVideo.level}</Badge>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Duration: {playingVideo.duration} • {playingVideo.views}</span>
                </div>
                {playingVideo.videoUrl && (
                  <Button variant="outline" size="xs" onClick={() => window.open(playingVideo.videoUrl, '_blank')}>
                    Open Link ↗
                  </Button>
                )}
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', color: 'var(--color-text-primary)' }}>{playingVideo.title}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                This educational video explains fundamental concepts and provides step-by-step visual calculations led by <b>{playingVideo.author}</b>. Pause the video anytime to copy notes to your personal scratchpad.
              </p>
            <div style={{ width: '100%', height: '380px', background: '#000' }}>
              <video src={playingVideo.videoUrl} controls autoPlay style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'var(--color-bg)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Instructor: <b>{playingVideo.author}</b> • {playingVideo.views}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
