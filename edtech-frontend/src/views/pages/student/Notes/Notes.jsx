import React, { useState, useCallback, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import useContentController from '../../../../controllers/useContentController';
import syllabusManagementService from '../../../../models/services/syllabusManagementService';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';

// Robust mock dataset containing syllabus material, videos, and PDFs
const MOCK_DATA = {
  math: {
    name: 'Mathematics',
    color: 'var(--color-accent)',
    chapters: [
      {
        id: 'm-ch-1',
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
        title: 'NCERT Class 10 Mathematics Exemplar Solutions',
        description: 'Complete solved exemplars and practice questions with detailed proofs for CBSE Board prep.',
        fileSize: '4.2 MB',
        fileType: 'PDF Document',
        downloadsCount: 1420
      },
      {
        id: 'm-dl-2',
        title: 'Formula Cheat Sheet & Quick Revision Notes',
        description: 'One-page summary sheet containing all theorems, identities, and equations for quick revision.',
        fileSize: '750 KB',
        fileType: 'PDF Document',
        downloadsCount: 3840
      }
    ]
  },
  science: {
    name: 'Science',
    color: 'var(--color-secondary)',
    chapters: [
      {
        id: 's-ch-1',
        title: 'Chapter 1: Chemical Reactions and Equations',
        description: 'Understand how substance compositions undergo change, write chemical equations, and classify chemical reactions.',
        digitalMaterial: 'Chemical processes are described using chemical equations. In this chapter, we master the law of conservation of mass, balancing equation coefficients, and reaction conditions.',
        topics: [
          { title: "Writing & Balancing Chemical Equations", content: "A chemical equation shows reactants, products, and physical states. To satisfy the law of conservation of mass, we must balance equations by making the number of atoms of each element equal on both sides." },
          { title: "Types of Chemical Reactions", content: "1. Combination: Two reactants form one product.\n2. Decomposition: One reactant breaks down into multiple products.\n3. Displacement: A reactive element displaces a less reactive one.\n4. Double Displacement: Exchange of ions between compounds.\n5. Oxidation and Reduction (Redox): Involves transfer of oxygen/hydrogen or electrons." },
          { title: "Effects of Oxidation in Everyday Life", content: "1. Corrosion: Damage to metals caused by air, moisture, or chemical reactions (e.g. rusting of iron).\n2. Rancidity: Oxidation of fats and oils in food materials causing bad smell and taste." }
        ]
      },
      {
        id: 's-ch-2',
        title: 'Chapter 2: Acids, Bases and Salts',
        description: 'Analyze chemical properties, indicators, pH scale strength, and practical significance of household salts.',
        digitalMaterial: 'Acids and bases neutralise each other. We evaluate hydrogen ion concentration (pH scale) and study standard salts like sodium hydroxide, bleaching powder, baking soda, and plaster of Paris.',
        topics: [
          { title: "Chemical Properties of Acids & Bases", content: "Acids turn blue litmus red, conduct electricity in solution, and react with metals to release Hydrogen gas. Bases turn red litmus blue, feel soapy, and neutralise acids to form salt and water." },
          { title: "The pH Scale and Importance", content: "A scale for measuring Hydrogen ion concentration (0 to 14). pH < 7 is acidic, pH > 7 is basic, and pH = 7 is neutral. pH values govern digestive systems, soil quality, tooth decay prevention, and self-defense of organisms." },
          { title: "Common Salts Chemistry & Uses", content: "We study chemical formulas and preparation of:\n1. Sodium Hydroxide (Chlor-alkali process)\n2. Bleaching Powder (CaOCl₂)\n3. Baking Soda (NaHCO₃)\n4. Washing Soda (Na₂CO₃·10H₂O)\n5. Plaster of Paris (CaSO₄·½H₂O)" }
        ]
      }
    ],
    videos: [
      {
        id: 's-vid-1',
        title: 'Decomposition and Displacement Reactions Demo',
        duration: '9:15',
        level: 'Basic',
        thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        views: '3.1k views',
        author: 'Prof. Ramesh Sharma'
      },
      {
        id: 's-vid-2',
        title: 'Understanding pH scale & Acid-Base Titration Graph',
        duration: '14:50',
        level: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        views: '2.2k views',
        author: 'Dr. Anita Desai'
      }
    ],
    downloads: [
      {
        id: 's-dl-1',
        title: 'Chemical Equations Practice Worksheets with Keys',
        description: 'Contains 50+ balanced/unbalanced chemical equation practice questions with step-by-step solutions.',
        fileSize: '1.2 MB',
        fileType: 'PDF Document',
        downloadsCount: 2950
      },
      {
        id: 's-dl-2',
        title: 'Science Lab Manual & Practical Activities Guide',
        description: 'Complete board experiment guide with procedures, observations, and safety measures.',
        fileSize: '3.1 MB',
        fileType: 'PDF Document',
        downloadsCount: 1590
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
    overflow: 'hidden'
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
  subjectFilters: {
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'center'
  },
  filterPill: (active, color) => ({
    padding: '8px 18px',
    borderRadius: 'var(--radius-full)',
    border: active ? `2px solid ${color || 'var(--color-primary)'}` : '1px solid var(--color-border)',
    background: active ? `${color || 'var(--color-primary)'}14` : 'var(--color-surface)',
    color: active ? (color || 'var(--color-primary)') : 'var(--color-text-secondary)',
    fontWeight: '700',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }),
  primaryTabs: {
    display: 'flex',
    borderBottom: '1px solid var(--color-border)',
    gap: 'var(--space-6)',
    marginBottom: 'var(--space-4)'
  },
  tabButton: (active) => ({
    padding: 'var(--space-3) 0',
    background: 'none',
    border: 'none',
    borderBottom: active ? '3px solid var(--color-primary)' : '3px solid transparent',
    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    fontWeight: '700',
    fontSize: 'var(--text-base)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }),
  subTabs: {
    display: 'flex',
    gap: 'var(--space-2)',
    margin: 'var(--space-2) 0 var(--space-6)',
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
    boxShadow: 'var(--shadow-sm)',
    position: 'relative'
  },
  videoThumbnailWrapper: {
    position: 'relative',
    height: '180px',
    width: '100%',
    overflow: 'hidden',
    background: 'var(--color-bg-alt)'
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
    transition: 'opacity 0.2s'
  },
  downloadCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-5)',
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
  noteList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
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
  const [activeSubject, setActiveSubject] = useState('math'); // 'math' or 'science'
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

  // Simulate file downloading progress bar
  const startMockDownload = (file) => {
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

  // Merge live items with mock data
  const rawSubjectData = MOCK_DATA[activeSubject];

  const subjectData = React.useMemo(() => {
    if (!liveMaterials || liveMaterials.length === 0) return rawSubjectData;

    const currentSubjName = activeSubject === 'math' ? 'mathematics' : 'science';
    const relevantLiveItems = liveMaterials.filter(m => 
      !m.isDeleted && 
      (m.subject?.toLowerCase().includes(currentSubjName) || m.subject?.toLowerCase().includes(activeSubject))
    );

    if (relevantLiveItems.length === 0) return rawSubjectData;

    // Map live backend items into sub-categories
    const liveChapters = relevantLiveItems
      .filter(m => m.materialType === 'PDF Notes' || m.materialType === 'Documents')
      .map(m => ({
        id: m._id || m.id,
        title: m.materialTitle,
        description: `${m.chapter || 'Chapter Material'} • ${m.board} ${m.classId}`,
        digitalMaterial: m.description || 'Verified study document provided by platform admin.',
        topics: [
          { title: m.materialTitle, content: `Format: ${m.materialType}\nFile Size: ${m.fileSize}\nLanguage: ${m.language}\nTags: ${m.tags?.join(', ') || 'NCERT'}` }
        ]
      }));

    const liveVideos = relevantLiveItems
      .filter(m => m.materialType === 'Videos')
      .map(m => ({
        id: m._id || m.id,
        title: m.materialTitle,
        duration: '10:00',
        level: 'Standard',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
        videoUrl: m.fileUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
        views: 'Live Admin Upload',
        author: 'Platform Instructor'
      }));

    const liveDownloads = relevantLiveItems
      .filter(m => m.materialType === 'Worksheets' || m.materialType === 'Sample Papers' || m.materialType === 'PDF Notes' || m.materialType === 'PPT')
      .map(m => ({
        id: m._id || m.id,
        title: m.materialTitle,
        description: m.description || `Official ${m.materialType} resource for ${m.subject}`,
        fileSize: m.fileSize || '2.5 MB',
        fileType: m.materialType,
        downloadsCount: 150
      }));

    return {
      ...rawSubjectData,
      chapters: liveChapters.length > 0 ? [...liveChapters, ...rawSubjectData.chapters] : rawSubjectData.chapters,
      videos: liveVideos.length > 0 ? [...liveVideos, ...rawSubjectData.videos] : rawSubjectData.videos,
      downloads: liveDownloads.length > 0 ? [...liveDownloads, ...rawSubjectData.downloads] : rawSubjectData.downloads
    };
  }, [liveMaterials, activeSubject, rawSubjectData]);

  // Filters items depending on search query
  const filteredChapters = subjectData.chapters.filter(ch => 
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.topics.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVideos = subjectData.videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDownloads = subjectData.downloads.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={s.container}>
      {/* Immersive Header Banner */}
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

        {/* Dynamic Subject Switchers */}
        <div style={{ ...s.subjectFilters, zIndex: 2 }}>
          <button 
            style={s.filterPill(activeSubject === 'math', 'var(--color-accent)')}
            onClick={() => { setActiveSubject('math'); setSearchQuery(''); }}
          >
            <BookOpen size={16} />
            <span>Mathematics</span>
          </button>
          <button 
            style={s.filterPill(activeSubject === 'science', 'var(--color-secondary)')}
            onClick={() => { setActiveSubject('science'); setSearchQuery(''); }}
          >
            <Sparkles size={16} />
            <span>Science</span>
          </button>
        </div>
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
                <span>PDFs & Worksheets</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '6px 12px', width: '300px' }}>
              <Search size={16} color="var(--color-text-tertiary)" style={{ marginRight: '8px' }} />
              <input 
                type="text" 
                placeholder="Search material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}
              />
              {searchQuery && (
                <X size={16} color="var(--color-text-tertiary)" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
              )}
            </div>
          </div>

          {/* Sub-tab 1: Chapter Wise & Topic Wise Notes */}
          {subTab === 'chapters' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filteredChapters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
                  <BookOpen size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>No chapter notes match your search term.</p>
                </div>
              ) : (
                filteredChapters.map(ch => {
                  const isOpen = !!expandedChapters[ch.id];
                  return (
                    <div 
                      key={ch.id} 
                      style={s.chapterCard} 
                      className="subject-card-hover"
                      onClick={() => toggleChapter(ch.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-lg)', background: `${subjectData.color}12`, color: subjectData.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--color-text-primary)' }}>{ch.title}</h4>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{ch.description}</p>
                          </div>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>

                      {isOpen && (
                        <div 
                          style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                          onClick={(e) => e.stopPropagation()} // Prevent collapse toggling when reading content
                        >
                          {/* Digital Study Material Guide Banner */}
                          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Info size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>Digital Study Material Summary</span>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                                {ch.digitalMaterial}
                              </p>
                            </div>
                          </div>

                          {/* Topic-Based Educational Content */}
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>Topic Based Content:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                              {ch.topics.map((t, idx) => (
                                <div key={idx} style={s.topicRow}>
                                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--color-primary-dark)' }}>{t.title}</span>
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{t.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Sub-tab 2: Video Tutorials */}
          {subTab === 'videos' && (
            <div className="responsive-grid-3" style={{ gap: 'var(--space-5)' }}>
              {filteredVideos.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
                  <Video size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>No video tutorials match your search term.</p>
                </div>
              ) : (
                filteredVideos.map(v => (
                  <div key={v.id} style={s.videoCard} className="subject-card-hover">
                    <div style={s.videoThumbnailWrapper}>
                      <img 
                        src={v.thumbnail} 
                        alt={v.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={s.playOverlay} onClick={() => setPlayingVideo(v)}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-lg)' }}>
                          <Play size={20} color="var(--color-primary)" fill="var(--color-primary)" style={{ marginLeft: '2px' }} />
                        </div>
                      </div>
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {v.duration}
                      </span>
                    </div>

                    <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge variant={v.level === 'Basic' ? 'neutral' : v.level === 'Advanced' ? 'primary' : 'neutral'}>
                          {v.level}
                        </Badge>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{v.views}</span>
                      </div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: '1.4', margin: '2px 0 6px' }}>
                        {v.title}
                      </h4>
                      <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '6px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{v.author}</span>
                        <Button variant="ghost" size="xs" iconRight={<ArrowRight size={12} />} onClick={() => setPlayingVideo(v)}>
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sub-tab 3: PDFs & Worksheets Downloads */}
          {subTab === 'downloads' && (
            <div className="responsive-grid-2" style={{ gap: 'var(--space-5)' }}>
              {filteredDownloads.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
                  <Download size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>No worksheets or solutions match your search term.</p>
                </div>
              ) : (
                filteredDownloads.map(d => {
                  const isDownloading = downloadingFile === d.id;
                  return (
                    <div key={d.id} style={s.downloadCard} className="subject-card-hover">
                      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                        <div style={{ padding: '12px', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', color: 'var(--color-error)' }}>
                          <FileDown size={24} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Badge variant="neutral">{d.fileType}</Badge>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{d.fileSize}</span>
                          </div>
                          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--color-text-primary)' }}>{d.title}</h4>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{d.description}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Downloads: <b>{d.downloadsCount}</b></span>
                        
                        {isDownloading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '120px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: '700', color: 'var(--color-primary)' }}>
                              <span>Downloading...</span>
                              <span>{downloadProgress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: 'var(--color-bg-alt)', borderRadius: '9px', overflow: 'hidden' }}>
                              <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'var(--color-success)', transition: 'width 0.15s ease' }} />
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            iconLeft={<Download size={14} />}
                            onClick={() => startMockDownload(d)}
                          >
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERSONAL SCRATCHPAD / NOTES LIST */}
      {primaryTab === 'personal' && (
        <div style={s.personalNotesGrid} className="responsive-grid-1-2">
          {/* Create Note Form Card */}
          <div>
            <Card>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
                Create Study Note
              </h3>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input
                  label="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Science formula"
                  required
                />
                <Input
                  label="Note Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write summaries or equations..."
                  textarea
                  required
                />
                <Button variant="primary" size="lg" fullWidth iconLeft={<Plus size={18} />} type="submit">
                  Save Note
                </Button>
              </form>
            </Card>
          </div>

          {/* Saved Study Notes List */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
              Saved Study Notes
            </h3>
            
            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--color-border)' }}>
                <FileText size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} />
                <p>No notes saved yet. Create one to get started!</p>
              </div>
            ) : (
              <div style={s.noteList}>
                {notes.map((note) => (
                  <div key={note.id} style={s.noteCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{note.title}</h4>
                      <button
                        onClick={() => deleteNote(note.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {note.content}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'var(--space-2)', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                      <Calendar size={12} />
                      <span>Saved on: {note.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIDEO LEARNING DIALOG / OVERLAY MODAL */}
      {playingVideo && (
        <div style={s.modalOverlay} onClick={() => setPlayingVideo(null)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                Learning Walkthrough Support
              </span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setPlayingVideo(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '0', background: '#000', height: '360px', position: 'relative' }}>
              {/* HTML5 video element with default controls */}
              <video 
                key={playingVideo.id}
                src={playingVideo.videoUrl}
                controls 
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Badge variant="primary">{playingVideo.level}</Badge>
                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Duration: {playingVideo.duration} • {playingVideo.views}</span>
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '800', color: 'var(--color-text-primary)' }}>{playingVideo.title}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                This educational video explains fundamental concepts and provides step-by-step visual calculations led by <b>{playingVideo.author}</b>. Pause the video anytime to copy notes to your personal scratchpad.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
