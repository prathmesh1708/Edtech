 /* =============================================
   Study Wisely — Route Constants
   ============================================= */

export const ROUTES = {
  // Public Pages
  HOME: '/',
  ABOUT: '/about',
  FEATURES: '/features',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:courseId',
  SYLLABUS: '/syllabus',
  SYLLABUS_DETAIL: '/syllabus/:boardId/:classId',
  BOARD_INFO: '/boards/:boardId',
  CONTACT: '/contact',
  SUPPORT: '/support',
  SCHOOL_ONBOARDING: '/school-onboarding',

  // Auth Pages
  SELECT_CLASS: '/select-class',
  LOGIN: '/login',
  ADMIN_LOGIN: '/login/admin',
  REGISTER: '/register',
  OTP_VERIFICATION: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE_SETUP: '/profile-setup',

  // Student Dashboard
  STUDENT_DASHBOARD: '/student/dashboard',
  MY_SYLLABUS: '/student/dashboard/syllabus',
  SUBJECT_DETAIL: '/student/dashboard/subject/:subjectId',
  CHAPTER_VIEW: '/student/dashboard/chapter/:chapterId',
  STUDY_MATERIALS: '/student/dashboard/materials',
  AI_TUTOR: '/student/dashboard/ai-tutor',
  BOOKMARKS: '/student/dashboard/bookmarks',
  NOTES: '/student/dashboard/notes',
  STUDENT_PROFILE: '/student/dashboard/profile',
  NOTIFICATIONS: '/student/dashboard/notifications',
  SETTINGS: '/student/dashboard/settings',

  // Admin Panel
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_EDUCATIONAL_INSIGHTS: '/admin/educational-insights',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_SYLLABUS: '/admin/syllabus',
  ADMIN_CONTENT: '/admin/content',
  
  // Syllabus & Content Submodules
  ADMIN_SYLLABUS_GLOBAL: '/admin/syllabus/global',
  ADMIN_SYLLABUS_BOARD: '/admin/syllabus/board-wise',
  ADMIN_SYLLABUS_SUBJECTS: '/admin/syllabus/subjects',
  ADMIN_SYLLABUS_CHAPTERS: '/admin/syllabus/chapters',
  ADMIN_SYLLABUS_APPROVAL: '/admin/syllabus/approval',
  ADMIN_SYLLABUS_MATERIALS: '/admin/syllabus/materials',

  ADMIN_BANNERS: '/admin/banners',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_SYSTEM_SETTINGS: '/admin/system-settings',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ACCESS: '/admin/access',
};

// Helper to generate dynamic routes
export const generateRoute = (path, params) => {
  let route = path;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  return route;
};
