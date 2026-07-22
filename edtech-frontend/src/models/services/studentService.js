import api from './api';

export const studentService = {
  // Get student dashboard stats, enrolled subjects, todos, activities
  getDashboardData: (params = {}) => api.get('/student/dashboard', { params }),

  // Student To-Do Tasks CRUD
  getTodos: () => api.get('/student/todos'),
  createTodo: (text) => api.post('/student/todos', { text }),
  toggleTodo: (id) => api.put(`/student/todos/${id}`),
  deleteTodo: (id) => api.delete(`/student/todos/${id}`),
};

export default studentService;
