import api from './api';

export const aiAdminService = {
  getInsights: (range = '30d') => api.get('/ai/admin/insights', { params: { range } }),
  getFlags: (params = {}) => api.get('/ai/admin/flags', { params }),
  getFlag: (id) => api.get(`/ai/admin/flags/${id}`),
  updateFlag: (id, payload) => api.patch(`/ai/admin/flags/${id}`, payload),
};

export default aiAdminService;
