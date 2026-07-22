/* =============================================
   Study Wisely — App Constants
   ============================================= */

export const APP_NAME = 'Study Wisely';
export const APP_TAGLINE = 'Your Ultimate AI Tutor';
export const APP_DOMAIN = 'www.studywisely.in';
export const APP_DESCRIPTION = 'All-in-One Companion for Top Grades — Class 1 to 12';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 8000;

// Classes
export const CLASSES = [
  { id: 1, name: 'Class 1', label: '1st' },
  { id: 2, name: 'Class 2', label: '2nd' },
  { id: 3, name: 'Class 3', label: '3rd' },
  { id: 4, name: 'Class 4', label: '4th' },
  { id: 5, name: 'Class 5', label: '5th' },
  { id: 6, name: 'Class 6', label: '6th' },
  { id: 7, name: 'Class 7', label: '7th' },
  { id: 8, name: 'Class 8', label: '8th' },
  { id: 9, name: 'Class 9', label: '9th' },
  { id: 10, name: 'Class 10', label: '10th' },
  { id: 11, name: 'Class 11', label: '11th' },
  { id: 12, name: 'Class 12', label: '12th' },
];

// Education Boards
export const BOARDS = [
  { id: 'cbse', name: 'CBSE', fullName: 'Central Board of Secondary Education' },
  { id: 'icse', name: 'ICSE', fullName: 'Indian Certificate of Secondary Education' },
  { id: 'state', name: 'State Board', fullName: 'State Board of Education' },
  { id: 'ib', name: 'IB', fullName: 'International Baccalaureate' },
];

// Subjects
export const SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', icon: 'Calculator', color: '#4F6EF7' },
  { id: 'science', name: 'Science', icon: 'FlaskConical', color: '#22C55E' },
  { id: 'english', name: 'English', icon: 'BookOpen', color: '#F59E0B' },
  { id: 'hindi', name: 'Hindi', icon: 'Languages', color: '#EF4444' },
  { id: 'social-science', name: 'Social Science', icon: 'Globe', color: '#7C5CFC' },
  { id: 'physics', name: 'Physics', icon: 'Atom', color: '#3B82F6' },
  { id: 'chemistry', name: 'Chemistry', icon: 'TestTubes', color: '#10B981' },
  { id: 'biology', name: 'Biology', icon: 'Dna', color: '#EC4899' },
  { id: 'computer-science', name: 'Computer Science', icon: 'Monitor', color: '#6366F1' },
  { id: 'economics', name: 'Economics', icon: 'TrendingUp', color: '#14B8A6' },
];

// Features for marketing pages
export const FEATURES = [
  {
    id: 'ai-tutor',
    title: 'AI Doubt Solver',
    description: 'Stuck on a question? Snap, solve, understand it.',
    icon: 'BotMessageSquare',
    color: '#7C5CFC',
    gradient: 'linear-gradient(135deg, #7C5CFC 0%, #4F6EF7 100%)',
  },
  {
    id: 'pdf-study',
    title: 'PDF Study',
    description: 'Chat with books and study materials interactively.',
    icon: 'FileText',
    color: '#EF4444',
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Find best study materials and learning resources.',
    icon: 'Zap',
    color: '#4F6EF7',
  },
  {
    id: 'audio-notes',
    title: 'Audio Notes',
    description: 'Record & Summarize lectures and study sessions.',
    icon: 'Mic',
    color: '#F59E0B',
  },
  {
    id: 'smart-notes',
    title: 'Smart Notes',
    description: 'Organize thoughts with intelligent note-taking.',
    icon: 'StickyNote',
    color: '#22C55E',
  },
  {
    id: 'focus-mode',
    title: 'Focus Mode',
    description: 'AI doubt solver and more for distraction-free study.',
    icon: 'Target',
    color: '#3B82F6',
  },
];

// Stats for homepage
export const PLATFORM_STATS = [
  { label: 'Active Students', value: 10000, suffix: '+', icon: 'Users' },
  { label: 'Chapters Covered', value: 500, suffix: '+', icon: 'BookOpen' },
  { label: 'Classes', value: 12, suffix: '', icon: 'GraduationCap' },
  { label: 'Boards Supported', value: 4, suffix: '+', icon: 'Award' },
];

// Testimonials
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Aarav Sharma',
    class: 'Class 10',
    board: 'CBSE',
    avatar: null,
    rating: 5,
    text: 'Study Wisely helped me score 95% in my board exams. The AI tutor explains concepts better than any coaching class!',
  },
  {
    id: 2,
    name: 'Priya Patel',
    class: 'Class 12',
    board: 'ICSE',
    avatar: null,
    rating: 5,
    text: 'The chapter-wise notes and smart study features are amazing. I improved my grades significantly in just 3 months.',
  },
  {
    id: 3,
    name: 'Rahul Kumar',
    class: 'Class 8',
    board: 'State Board',
    avatar: null,
    rating: 5,
    text: 'Love the doubt solver feature! Whenever I get stuck, the AI explains step by step. It feels like having a personal tutor.',
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    class: 'Class 11',
    board: 'CBSE',
    avatar: null,
    rating: 5,
    text: 'The PDF study tool is a game changer. I can ask questions directly about my textbook chapters. Highly recommended!',
  },
];

// Navigation Links
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Features', path: '/features' },
  { label: 'Courses', path: '/courses' },
  { label: 'Syllabus', path: '/syllabus' },
  { label: 'Contact', path: '/contact' },
];

// Footer Links
export const FOOTER_LINKS = {
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Features', path: '/features' },
    { label: 'Contact', path: '/contact' },
    { label: 'Support', path: '/support' },
  ],
  resources: [
    { label: 'Courses', path: '/courses' },
    { label: 'Syllabus', path: '/syllabus' },
    { label: 'Study Materials', path: '/courses' },
    { label: 'AI Tutor', path: '/features' },
  ],
  boards: [
    { label: 'CBSE', path: '/syllabus?board=cbse' },
    { label: 'ICSE', path: '/syllabus?board=icse' },
    { label: 'State Board', path: '/syllabus?board=state' },
    { label: 'IB', path: '/syllabus?board=ib' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Refund Policy', path: '/refund' },
  ],
};

// Social Media Links
export const SOCIAL_LINKS = [
  { name: 'Instagram', url: '#', icon: 'Instagram' },
  { name: 'YouTube', url: '#', icon: 'Youtube' },
  { name: 'Twitter', url: '#', icon: 'Twitter' },
  { name: 'LinkedIn', url: '#', icon: 'Linkedin' },
];
