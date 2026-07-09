import api from './api';

export const syllabusService = {
  getSyllabusByBoard: (boardId) => api.get(`/syllabus/board/${boardId}`),
  getSyllabusByClass: (classId) => api.get(`/syllabus/class/${classId}`),
  getSubjects: (boardId, classId) => api.get(`/syllabus/${boardId}/${classId}/subjects`),
  getChapters: (subjectId) => api.get(`/syllabus/subject/${subjectId}/chapters`),
  getChapterDetail: (chapterId) => api.get(`/syllabus/chapter/${chapterId}`),
  getTopics: (chapterId) => api.get(`/syllabus/chapter/${chapterId}/topics`),
};

export default syllabusService;
