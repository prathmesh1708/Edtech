import api from './api';

export const studentService = {
  // Get student dashboard stats, enrolled subjects, todos, activities
  getDashboardData: (params = {}) => api.get('/student/dashboard', { params }),

  // Student To-Do Tasks CRUD
  getTodos: () => api.get('/student/todos'),
  createTodo: (text) => api.post('/student/todos', { text }),
  toggleTodo: (id) => api.put(`/student/todos/${id}`),
  deleteTodo: (id) => api.delete(`/student/todos/${id}`),

  // Admin Student CRUD
  getStudentsAdmin: () => api.get('/student/admin'),
  createStudentAdmin: (studentData) => api.post('/student/admin', studentData),
  updateStudentAdmin: (id, studentData) => api.put(`/student/admin/${id}`, studentData),
  deleteStudentAdmin: (id) => api.delete(`/student/admin/${id}`),
  
  // Access Control & Quick Actions
  updateStudentStatus: (id, status) => api.put(`/student/admin/${id}`, { status }),
  resetStudentPassword: (id, newPassword) => api.put(`/student/admin/${id}`, { password: newPassword }),
  verifyStudentEmail: (id) => api.put(`/student/admin/${id}`, { emailVerified: true }),
  changeClassBatch: (id, classId, batch) => api.put(`/student/admin/${id}`, { classId, batch }),
};

export default studentService;
