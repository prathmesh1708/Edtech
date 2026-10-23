export const AI_SUBJECTS = [
  'General',
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Science',
  'History',
  'Geography',
  'Economics',
  'Computer Science',
  'EVS',
];

const SUGGESTIONS_BY_LEVEL = {
  primary: [
    'What is the difference between a noun and a verb?',
    'Explain addition with carrying using an example',
    'Why do plants need sunlight?',
    'How many days are there in a leap year, and why?',
  ],
  middle: [
    'Explain fractions vs decimals with examples',
    'What is photosynthesis? Explain step by step',
    'What were the main causes of the Revolt of 1857?',
    'Help me understand ratio and proportion',
  ],
  secondary: [
    'Solve x² − 5x + 6 = 0 step by step',
    "Explain Newton's third law with real-life examples",
    'What is the difference between mitosis and meiosis?',
    'Give me 5 important questions on Light — Reflection and Refraction',
  ],
  senior: [
    'Derive the equation of motion v² = u² + 2as',
    'Explain hybridisation in carbon compounds',
    'How do I find the derivative of sin(x)·cos(x)?',
    'Explain the concept of elasticity of demand',
  ],
};

const levelFor = (classId) => {
  const n = Number(String(classId ?? '').match(/\d{1,2}/)?.[0]);
  if (!n || n >= 9) return n >= 11 ? 'senior' : 'secondary';
  return n <= 5 ? 'primary' : 'middle';
};

/** Starter questions: about the page context when there is one, otherwise by class level. */
export const getSuggestions = ({ classId, context, subject }) => {
  const focus = context?.chapterName || context?.materialTitle || context?.topic;
  if (focus) {
    return [
      `Summarise "${focus}" in simple points`,
      `Explain the most important concepts of "${focus}"`,
      `Give me 5 practice questions on "${focus}" with answers`,
      `What mistakes do students commonly make in "${focus}"?`,
    ];
  }
  if (subject && subject !== 'General') {
    return [
      `What are the most important topics in ${subject} for my exams?`,
      `Give me a quick revision plan for ${subject}`,
      `Ask me 3 questions to test my ${subject} basics`,
      `Explain a tricky ${subject} concept simply`,
    ];
  }
  return SUGGESTIONS_BY_LEVEL[levelFor(classId)];
};

export const formatRelativeTime = (iso) => {
  const then = new Date(iso).getTime();
  if (!then) return '';
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
