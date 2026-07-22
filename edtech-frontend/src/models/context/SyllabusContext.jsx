import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import syllabusService from '../services/syllabusService';
import { useAuth } from './AuthContext';
import { SUBJECTS } from '../../config/constants';

const SyllabusContext = createContext(null);

export const useSyllabusState = () => {
  const context = useContext(SyllabusContext);
  if (!context) throw new Error('useSyllabusState must be used within a SyllabusProvider');
  return context;
};

export const SyllabusProvider = ({ children }) => {
  const { user } = useAuth();

  const [selectedBoard, setSelectedBoard] = useState(() => {
    return user?.board ? user.board.toLowerCase() : 'cbse';
  });
  const [selectedClass, setSelectedClass] = useState(() => {
    return user?.classId ? String(user.classId) : '10';
  });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize selected class and board whenever logged in user profile updates
  useEffect(() => {
    if (user?.classId) {
      setSelectedClass(String(user.classId));
    }
    if (user?.board) {
      setSelectedBoard(user.board.toLowerCase());
    }
  }, [user?.classId, user?.board]);

  const fetchSubjects = useCallback(async () => {
    if (!selectedBoard || !selectedClass) return;
    setLoading(true);
    setError(null);
    try {
      const res = await syllabusService.getSubjects(selectedBoard, selectedClass);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const formattedSubjects = res.data.map(item => ({
          id: item._id,
          name: item.subjectName,
          code: item.subjectCode,
          description: item.description,
          color: item.color || '#4F6EF7',
          icon: item.icon || 'BookOpen',
          chapters: item.chapters || [],
          chapterCount: item.chapters ? item.chapters.length : 0,
          rawItem: item
        }));
        setSubjects(formattedSubjects);
      } else {
        // If no subjects found in backend for this specific board/class combination, fallback to empty or default constants
        setSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching subjects from backend:', err);
      setError(err.message || 'Failed to fetch syllabus data');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBoard, selectedClass]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return (
    <SyllabusContext.Provider value={{
      selectedBoard,
      setSelectedBoard,
      selectedClass,
      setSelectedClass,
      subjects,
      loading,
      error,
      refreshSubjects: fetchSubjects
    }}>
      {children}
    </SyllabusContext.Provider>
  );
};
