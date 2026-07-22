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
    loading: stateLoading,
    refreshSubjects
  } = useSyllabusState();

  const [currentSubject, setCurrentSubject] = useState(null);
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
    if (!subjectId) return;
    setLoading(true);
    try {
      // First check if subject details are already present in context subjects array
      const localSubj = subjects.find(s => s.id === subjectId || s.name.toLowerCase() === subjectId.toLowerCase());
      if (localSubj && localSubj.chapters && localSubj.chapters.length > 0) {
        setCurrentSubject(localSubj);
        setChapters(localSubj.chapters.map((ch, i) => ({
          id: ch._id || `ch-${i + 1}`,
          title: ch.title,
          description: ch.description || '',
          progress: ch.progress || 0,
          topics: ch.topics || [],
          resources: ch.resources || []
        })));
        return;
      }

      // If not, fetch from backend via API
      const res = await syllabusService.getSyllabusById(subjectId);
      if (res.data) {
        const item = res.data;
        setCurrentSubject({
          id: item._id,
          name: item.subjectName,
          code: item.subjectCode,
          description: item.description,
          color: item.color || '#4F6EF7',
          icon: item.icon || 'BookOpen',
          rawItem: item
        });
        const fetchedChapters = (item.chapters || []).map((ch, i) => ({
          id: ch._id || `ch-${i + 1}`,
          title: ch.title,
          description: ch.description || '',
          progress: ch.progress || 0,
          topics: ch.topics || [],
          resources: ch.resources || []
        }));
        setChapters(fetchedChapters);
      }
    } catch (error) {
      console.error('Error fetching chapters for subject:', error);
    } finally {
      setLoading(false);
    }
  }, [subjects]);

  return {
    selectedBoard,
    selectedClass,
    subjects,
    currentSubject,
    chapters,
    activeChapter,
    setActiveChapter,
    loading: loading || stateLoading,
    selectBoard,
    selectClass,
    fetchChapters,
    refreshSubjects
  };
};

export default useSyllabusController;
