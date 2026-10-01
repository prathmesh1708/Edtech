import api from './api';

// All DIKSHA data goes through our backend (/api/diksha/*); React never calls DIKSHA directly.
// DIKSHA lookups can take a few seconds on a cold cache, so they get a longer timeout
// than the app-wide default.
const DIKSHA_TIMEOUT = 20000;

export const dikshaService = {
  getFilters: (params = {}) => api.get('/diksha/filters', { params, timeout: DIKSHA_TIMEOUT }),
  search: (params = {}, config = {}) => api.get('/diksha/search', { params, timeout: DIKSHA_TIMEOUT, ...config }),
  getMyContent: (params = {}, config = {}) => api.get('/diksha/my-content', { params, timeout: DIKSHA_TIMEOUT, ...config }),
  getContent: (id) => api.get(`/diksha/content/${encodeURIComponent(id)}`, { timeout: DIKSHA_TIMEOUT }),
  getHierarchy: (id) => api.get(`/diksha/collections/${encodeURIComponent(id)}/hierarchy`, { timeout: DIKSHA_TIMEOUT }),
  getCourses: (params = {}) => api.get('/diksha/courses', { params, timeout: DIKSHA_TIMEOUT }),

  getBookmarks: () => api.get('/diksha/bookmarks'),
  addBookmark: (contentId) => api.post('/diksha/bookmarks', { contentId }, { timeout: DIKSHA_TIMEOUT }),
  removeBookmark: (contentId) => api.delete(`/diksha/bookmarks/${encodeURIComponent(contentId)}`),
  getRecent: () => api.get('/diksha/recently-viewed'),
  addRecent: (contentId) => api.post('/diksha/recently-viewed', { contentId }, { timeout: DIKSHA_TIMEOUT }),
};

export default dikshaService;
