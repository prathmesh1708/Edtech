import api from './api';

export const bannerService = {
  // Get all banners for Admin panel
  getBanners: () => api.get('/banners'),
  
  // Get active banners for Student dashboard
  getActiveBanners: () => api.get('/banners/active'),
  
  // Admin banner CRUD
  createBanner: (bannerData) => api.post('/banners', bannerData),
  updateBanner: (id, bannerData) => api.put(`/banners/${id}`, bannerData),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
};

export default bannerService;
