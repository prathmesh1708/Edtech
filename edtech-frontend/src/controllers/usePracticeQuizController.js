import { useState, useCallback, useEffect, useRef } from 'react';
import aiTutorService from '../models/services/aiTutorService';

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

/**
 * State for AI practice quizzes: setup -> generating -> quiz -> results.
 */
const usePracticeQuizController = () => {
  const [phase, setPhase] = useState('setup');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const lastParamsRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await aiTutorService.getQuizzes({ limit: 10 });
      setHistory(res.data.quizzes || []);
    } catch (err) {
      console.warn('Could not load practice history:', err.message);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const showQuiz = useCallback((q) => {
    setQuiz(q);
    setAnswers(q.status === 'submitted' ? q.questions.map((x) => x.chosenIndex ?? null) : q.questions.map(() => null));
    setPhase(q.status === 'submitted' ? 'results' : 'quiz');
  }, []);

  /** @param {{ subject?: string, context?: object, difficulty: string, count: number }} params */
  const generate = useCallback(async (params) => {
    lastParamsRef.current = params;
    setError(null);
    setPhase('generating');
    try {
      const res = await aiTutorService.createQuiz(params);
      showQuiz(res.data.quiz);
      loadHistory();
    } catch (err) {
      setError(errorMessage(err, 'Could not create a quiz right now. Please try again.'));
      setPhase('setup');
    }
  }, [loadHistory, showQuiz]);

  const regenerate = useCallback(() => {
    if (lastParamsRef.current) generate(lastParamsRef.current);
  }, [generate]);

  const choose = useCallback((questionIndex, optionIndex) => {
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
  }, []);

  const submit = useCallback(async () => {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await aiTutorService.submitQuiz(quiz.id, answers);
      showQuiz(res.data.quiz);
      loadHistory();
    } catch (err) {
      setError(errorMessage(err, 'Could not submit your answers. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers, loadHistory, showQuiz]);

  const openQuiz = useCallback(async (id) => {
    setError(null);
    try {
      const res = await aiTutorService.getQuiz(id);
      const q = res.data.quiz;
      lastParamsRef.current = {
        subject: q.subject,
        context: { chapterName: q.context?.chapterName, topic: q.context?.topic },
        difficulty: q.difficulty,
        count: q.total >= 10 ? 10 : 5,
      };
      showQuiz(q);
    } catch (err) {
      setError(errorMessage(err, 'Could not open that quiz.'));
    }
  }, [showQuiz]);

  const reset = useCallback(() => {
    setQuiz(null);
    setAnswers([]);
    setError(null);
    setPhase('setup');
  }, []);

  return { phase, quiz, answers, error, submitting, history, generate, regenerate, choose, submit, openQuiz, reset };
};

export default usePracticeQuizController;
