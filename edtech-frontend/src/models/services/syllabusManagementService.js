import api from './api';

export const syllabusManagementService = {
  // 1. Global Syllabus Management
  getGlobalSyllabuses: () => api.get('/syllabus-management/global-syllabus'),
  createGlobalSyllabus: (data) => api.post('/syllabus-management/global-syllabus', data),
  updateGlobalSyllabus: (id, data) => api.put(`/syllabus-management/global-syllabus/${id}`, data),
  deleteGlobalSyllabus: (id) => api.delete(`/syllabus-management/global-syllabus/${id}`),

  // 2. Board-wise Syllabus Management
  getBoards: () => api.get('/syllabus-management/boards'),
  createBoard: (data) => api.post('/syllabus-management/boards', data),
  updateBoard: (id, data) => api.put(`/syllabus-management/boards/${id}`, data),
  deleteBoard: (id) => api.delete(`/syllabus-management/boards/${id}`),

  // 3. Subject Management
  getSubjects: () => api.get('/syllabus-management/subjects'),
  createSubject: (data) => api.post('/syllabus-management/subjects', data),
  updateSubject: (id, data) => api.put(`/syllabus-management/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/syllabus-management/subjects/${id}`),

  // 4. Chapter Management
  getChapters: () => api.get('/syllabus-management/chapters'),
  createChapter: (data) => api.post('/syllabus-management/chapters', data),
  updateChapter: (id, data) => api.put(`/syllabus-management/chapters/${id}`, data),
  deleteChapter: (id) => api.delete(`/syllabus-management/chapters/${id}`),

  // 5. Content Approval System
  getContentApprovals: () => api.get('/syllabus-management/content-approvals'),
  updateApprovalStatus: (id, data) => api.put(`/syllabus-management/content-approvals/${id}`, data),

  // 6. Educational Material Organization
  getEducationalMaterials: () => api.get('/syllabus-management/educational-materials'),
  createEducationalMaterial: (data) => api.post('/syllabus-management/educational-materials', data),
  updateEducationalMaterial: (id, data) => api.put(`/syllabus-management/educational-materials/${id}`, data),
  deleteEducationalMaterial: (id) => api.delete(`/syllabus-management/educational-materials/${id}`),
};

export default syllabusManagementService;
