import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ROUTES } from './config/routes';
import { AuthProvider } from './models/context/AuthContext';
import { SyllabusProvider } from './models/context/SyllabusContext';
import { ToastProvider } from './views/components/common/Toast/Toast';
import PublicLayout from './views/components/layout/PublicLayout';
import StudentLayout from '../admin panel /student/views/components/Layout/StudentLayout';
import AdminLayout from '../admin panel /admin/views/components/Layout/MasterAdminLayout';
import Loader from './views/components/common/Loader/Loader';

// Lazy load pages for code splitting
const Home = lazy(() => import('./views/pages/public/Home/Home'));
const About = lazy(() => import('./views/pages/public/About/About'));
const Features = lazy(() => import('./views/pages/public/Features/Features'));
const Courses = lazy(() => import('./views/pages/public/Courses/Courses'));
const CourseDetail = lazy(() => import('./views/pages/public/CourseDetail/CourseDetail'));
const Syllabus = lazy(() => import('./views/pages/public/Syllabus/Syllabus'));
const SyllabusDetail = lazy(() => import('./views/pages/public/SyllabusDetail/SyllabusDetail'));
const Contact = lazy(() => import('./views/pages/public/Contact/Contact'));
const NotFound = lazy(() => import('./views/pages/public/NotFound/NotFound'));

// Auth Pages
const Login = lazy(() => import('./views/pages/auth/Login/Login'));
const Register = lazy(() => import('./views/pages/auth/Register/Register'));
const OTPVerification = lazy(() => import('./views/pages/auth/OTPVerification/OTPVerification'));

// Student Pages
const StudentDashboard = lazy(() => import('../admin panel /student/views/pages/Dashboard/StudentDashboard'));
const MySyllabus = lazy(() => import('./views/pages/student/MySyllabus/MySyllabus'));
const SubjectDetail = lazy(() => import('./views/pages/student/SubjectDetail/SubjectDetail'));
const ChapterView = lazy(() => import('./views/pages/student/ChapterView/ChapterView'));
const AITutor = lazy(() => import('./views/pages/student/AITutor/AITutor'));
const Notes = lazy(() => import('./views/pages/student/Notes/Notes'));
const Settings = lazy(() => import('./views/pages/student/Settings/Settings'));

// Admin Pages
const AdminDashboard = lazy(() => import('../admin panel /admin/views/pages/Dashboard/Dashboard'));
const StudentManagement = lazy(() => import('../admin panel /admin/views/pages/StudentManagement/StudentManagement'));
const SyllabusManagement = lazy(() => import('./views/pages/admin/SyllabusManagement/SyllabusManagement')); // Assuming this one remains unchanged for now, or point to ContentManagement if combined
const ContentManagement = lazy(() => import('../admin panel /admin/views/pages/ContentManagement/ContentManagement'));
const PlatformSettings = lazy(() => import('../admin panel /admin/views/pages/PlatformManagement/PlatformManagement'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <SyllabusProvider>
          <ToastProvider>
            <Suspense fallback={<Loader fullScreen text="Loading Study Wisely..." />}>
              <Routes>
                {/* Public Pages with Navbar & Footer */}
                <Route element={<PublicLayout />}>
                  <Route path={ROUTES.HOME} element={<Home />} />
                  <Route path={ROUTES.ABOUT} element={<About />} />
                  <Route path={ROUTES.FEATURES} element={<Features />} />
                  <Route path={ROUTES.COURSES} element={<Courses />} />
                  <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetail />} />
                  <Route path={ROUTES.SYLLABUS} element={<Syllabus />} />
                  <Route path={ROUTES.SYLLABUS_DETAIL} element={<SyllabusDetail />} />
                  <Route path={ROUTES.CONTACT} element={<Contact />} />
                </Route>

                {/* Auth Pages (no Navbar/Footer) */}
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                <Route path={ROUTES.OTP_VERIFICATION} element={<OTPVerification />} />

                {/* Student Dashboard Portal */}
                <Route element={<StudentLayout />}>
                  <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboard />} />
                  <Route path={ROUTES.MY_SYLLABUS} element={<MySyllabus />} />
                  <Route path={ROUTES.SUBJECT_DETAIL} element={<SubjectDetail />} />
                  <Route path={ROUTES.CHAPTER_VIEW} element={<ChapterView />} />
                  <Route path={ROUTES.AI_TUTOR} element={<AITutor />} />
                  <Route path={ROUTES.NOTES} element={<Notes />} />
                  <Route path={ROUTES.SETTINGS} element={<Settings />} />
                </Route>

                {/* Master Admin Portal */}
                <Route element={<AdminLayout />}>
                  <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
                  <Route path={ROUTES.ADMIN_STUDENTS} element={<StudentManagement />} />
                  <Route path={ROUTES.ADMIN_SYLLABUS} element={<SyllabusManagement />} />
                  <Route path={ROUTES.ADMIN_CONTENT} element={<ContentManagement />} />
                  <Route path={ROUTES.ADMIN_SETTINGS} element={<PlatformSettings />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </SyllabusProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
