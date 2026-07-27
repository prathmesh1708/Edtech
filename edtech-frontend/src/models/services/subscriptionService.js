import api from './api';

export const subscriptionService = {
  getPlans: () => api.get('/subscription-plans'),
  createPlan: (data) => api.post('/subscription-plans', data),
  getSubjectPricing: () => api.get('/subscription-plans/subject-pricing'),
  updateSubjectPricing: (data) => api.post('/subscription-plans/subject-pricing', data)
};

export default subscriptionService;
