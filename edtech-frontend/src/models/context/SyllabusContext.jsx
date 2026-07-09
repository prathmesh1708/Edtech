import React, { createContext, useContext, useState, useEffect } from 'react';
import syllabusService from '../services/syllabusService';
import { SUBJECTS } from '../../config/constants';

const SyllabusContext = createContext(null);

export const useSyllabusState = () => {
  const context = useContext(SyllabusContext);
  if (!context) throw new Error('useSyllabusState must be used within a SyllabusProvider');
  return context;
};

export const SyllabusProvider = ({ children }) => {
  const [selectedBoard, setSelectedBoard] = useState('cbse');
  const [selectedClass, setSelectedClass] = useState('10');
  const [subjects, setSubjects] = useState(SUBJECTS);
  const [loading, setLoading] = useState(false);

  // In a real application, we would fetch subjects from the backend dynamically
  useEffect(() => {
    if (selectedBoard && selectedClass) {
      setLoading(true);
      // Simulate API fetch or load from local constant
      const fetchSubjects = async () => {
        try {
          // const res = await syllabusService.getSubjects(selectedBoard, selectedClass);
          // setSubjects(res.data);
        } catch (error) {
          console.error('Error fetching subjects:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubjects();
    }
  }, [selectedBoard, selectedClass]);

  return (
    <SyllabusContext.Provider value={{
      selectedBoard,
      setSelectedBoard,
      selectedClass,
      setSelectedClass,
      subjects,
      loading
    }}>
      {children}
    </SyllabusContext.Provider>
  );
};
