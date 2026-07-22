import api from './api';

export const syllabusService = {
  // Get syllabuses filtered by query parameters (board, class, status, search)
  getAllSyllabus: (params = {}) => api.get('/syllabus', { params }),
  
  // Get subjects for a specific board and class
  getSubjects: (boardId, classId) => 
    api.get('/syllabus', { params: { board: boardId, class: classId, status: 'Published' } }),
  
  // Get a single syllabus item by ID
  getSyllabusById: (id) => api.get(`/syllabus/${id}`),

  // Admin CRUD operations
  createSyllabus: (data) => api.post('/syllabus', data),
  updateSyllabus: (id, data) => api.put(`/syllabus/${id}`, data),
  deleteSyllabus: (id) => api.delete(`/syllabus/${id}`),
};

export default syllabusService;
