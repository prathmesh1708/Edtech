import api from './api';

export const analyticsService = {
  getAnalyticsData: (params = {}) => api.get('/analytics', { params }),
  getEducationalInsights: (params = {}) => api.get('/analytics/educational-insights', { params }),
};

export default analyticsService;
