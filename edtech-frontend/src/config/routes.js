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
  REGISTER: '/register',
  OTP_VERIFICATION: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE_SETUP: '/profile-setup',

  // Student Dashboard
  STUDENT_DASHBOARD: '/dashboard',
  MY_SYLLABUS: '/dashboard/syllabus',
  SUBJECT_DETAIL: '/dashboard/subject/:subjectId',
  CHAPTER_VIEW: '/dashboard/chapter/:chapterId',
  STUDY_MATERIALS: '/dashboard/materials',
  AI_TUTOR: '/dashboard/ai-tutor',
  BOOKMARKS: '/dashboard/bookmarks',
  NOTES: '/dashboard/notes',
  STUDENT_PROFILE: '/dashboard/profile',
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',

  // Admin Panel
  ADMIN_DASHBOARD: '/admin',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_SYLLABUS: '/admin/syllabus',
  ADMIN_CONTENT: '/admin/content',
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
