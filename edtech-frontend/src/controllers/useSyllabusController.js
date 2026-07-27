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
    allSubjects,
    plans,
    selectedPlanId,
    currentPlan,
    subjectPricing,
    cycleSettings,
    userSubscriptionStatus,
    paymentMessage,
    updatePricingByAdmin,
    selectPlan,
    createCustomPlan,
    initiateRazorpayPayment,
    loading: stateLoading,
    refreshSubjects,
    refreshPlans
  } = useSyllabusState();

  const [currentSubject, setCurrentSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
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
      const localSubj = (allSubjects || subjects).find(s => s.id === subjectId || s._id === subjectId || s.name?.toLowerCase() === subjectId?.toLowerCase());
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

      const res = await syllabusService.getSyllabusById(subjectId);
      if (res.data) {
        const item = res.data;
        const sName = item.subjectName || localSubj?.name || 'Subject';
        setCurrentSubject({
          id: item._id || subjectId,
          name: sName,
          code: item.subjectCode || localSubj?.code || 'SUB-101',
          description: item.description || localSubj?.description || '',
          color: item.color || localSubj?.color || '#4F6EF7',
          icon: item.icon || localSubj?.icon || 'BookOpen',
          rawItem: item
        });
        
        let fetchedChapters = (item.chapters || []).map((ch, i) => ({
          id: ch._id || `ch-${i + 1}`,
          title: ch.title,
          description: ch.description || '',
          progress: ch.progress || 0,
          topics: ch.topics || [],
          resources: ch.resources || []
        }));

        if (fetchedChapters.length === 0) {
          fetchedChapters = [
            {
              id: `ch-def-${subjectId}-1`,
              title: `Chapter 1: ${sName} Core Fundamentals`,
              description: `Foundational concepts, theorems, and definitions in ${sName}`,
              progress: 45,
              topics: [{ name: 'Core Concepts & Terminology', completed: true }],
              resources: []
            },
            {
              id: `ch-def-${subjectId}-2`,
              title: `Chapter 2: Advanced ${sName} Practice & Applications`,
              description: `Exemplar problems and step-by-step exercise solutions`,
              progress: 0,
              topics: [{ name: 'Practice Questions & Exemplars', completed: false }],
              resources: []
            }
          ];
        }

        setChapters(fetchedChapters);
      }
    } catch (error) {
      console.error('Error fetching chapters for subject:', error);
    } finally {
      setLoading(false);
    }
  }, [subjects, allSubjects]);

  return {
    selectedBoard,
    selectedClass,
    subjects,
    allSubjects,
    plans,
    selectedPlanId,
    currentPlan,
    subjectPricing,
    cycleSettings,
    userSubscriptionStatus,
    paymentMessage,
    updatePricingByAdmin,
    selectPlan,
    createCustomPlan,
    initiateRazorpayPayment,
    loading: loading || stateLoading,
    currentSubject,
    chapters,
    selectBoard,
    selectClass,
    fetchChapters,
    refreshSubjects,
    refreshPlans
  };
};

export default useSyllabusController;
