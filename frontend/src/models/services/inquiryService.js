import api from './api';

export const inquiryService = {
  submitContact: (data) => api.post('/inquiries/contact', data),
  submitStudentInquiry: (data) => api.post('/inquiries/student', data),
  submitSchoolOnboarding: (data) => api.post('/inquiries/school-onboarding', data),
  submitSupport: (data) => api.post('/inquiries/support', data),
};

export default inquiryService;
