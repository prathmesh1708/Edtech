import { useCallback, useState } from 'react';
import { useSyllabusState } from '../models/context/SyllabusContext';
import syllabusService from '../models/services/syllabusService';

const useSyllabusController = () => {
  const {
    selectedBoard,
    setSelectedBoard,
    selectedClass,
    setSelectedClass,
    subjects,
    loading: stateLoading
  } = useSyllabusState();

  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectBoard = useCallback((board) => {
    setSelectedBoard(board);
  }, [setSelectedBoard]);

  const selectClass = useCallback((cls) => {
    setSelectedClass(cls);
  }, [setSelectedClass]);

  const fetchChapters = useCallback(async (subjectId) => {
    setLoading(true);
    try {
      // Fetch chapters for the given subject
      // const res = await syllabusService.getChapters(subjectId);
      // setChapters(res.data);
      
      // For mock purposes:
      const mockChapters = [
        { id: 'ch-1', title: 'Chapter 1: Real Numbers', description: 'Concepts of HCF, LCM, and Fundamental Theorem of Arithmetic', progress: 80 },
        { id: 'ch-2', title: 'Chapter 2: Polynomials', description: 'Geometrical meaning of zeroes, relationship between zeroes and coefficients', progress: 40 },
        { id: 'ch-3', title: 'Chapter 3: Quadratic Equations', description: 'Standard form, solution by factorization and quadratic formula', progress: 0 },
        { id: 'ch-4', title: 'Chapter 4: Arithmetic Progressions', description: 'Derivation of the nth term and sum of first n terms', progress: 0 },
      ];
      setChapters(mockChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    selectedBoard,
    selectedClass,
    subjects,
    chapters,
    activeChapter,
    setActiveChapter,
    loading: loading || stateLoading,
    selectBoard,
    selectClass,
    fetchChapters
  };
};

export default useSyllabusController;
