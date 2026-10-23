import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Loader2, RotateCcw, Sparkles, Trophy, ClipboardList } from 'lucide-react';
import usePracticeQuizController from '../../../../controllers/usePracticeQuizController';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import { AI_SUBJECTS, formatRelativeTime } from '../AIChat/aiChatConfig';
import styles from './AIPractice.module.css';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];
const SUBJECTS = AI_SUBJECTS.filter((s) => s !== 'General');

const scoreMessage = (pct) => {
  if (pct === 100) return 'Perfect score! Outstanding work.';
  if (pct >= 80) return 'Excellent! You know this well.';
  if (pct >= 50) return 'Good effort! Review the explanations below to improve.';
  return "Keep going! Read each explanation and try another quiz — you'll get there.";
};

const focusOf = (context) => context?.topic || context?.chapterName || null;

/**
 * Practice mode: AI-generated multiple-choice quizzes, graded on the server.
 * Other pages open it with router state: { subject, context: { chapterId, chapterName, topic } }.
 */
const AIPractice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const practice = usePracticeQuizController();
  const [scope, setScope] = useState({ subject: 'Mathematics', context: null });
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const topRef = useRef(null);
  const appliedKeyRef = useRef(null);

  // Scope passed from a chapter / subject page (applied once per navigation).
  useEffect(() => {
    const state = location.state;
    if (!state || appliedKeyRef.current === location.key) return;
    appliedKeyRef.current = location.key;
    const c = state.context || {};
    // Quizzes are scoped by chapter or topic; a study material's title serves as the topic.
    const topicName = c.topic || c.materialTitle;
    const context = c.chapterId || c.chapterName || topicName
      ? { chapterId: c.chapterId, chapterName: c.chapterName, topic: topicName }
      : null;
    setScope({ subject: state.subject || 'Mathematics', context });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.state, location.pathname, navigate]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [practice.phase]);

  const fixedFocus = focusOf(scope.context);

  const startQuiz = (e) => {
    e?.preventDefault();
    const context = scope.context ? { ...scope.context } : topic.trim() ? { topic: topic.trim() } : undefined;
    practice.generate({ subject: scope.subject, context, difficulty, count });
  };

  const askAiAbout = (q) => {
    const chosen = q.chosenIndex === null ? 'nothing (I skipped it)' : `"${q.options[q.chosenIndex]}"`;
    navigate(ROUTES.AI_CHAT, {
      state: {
        subject: practice.quiz?.subject,
        context: { chapterName: practice.quiz?.context?.chapterName, topic: practice.quiz?.context?.topic },
        prefill: `I got this practice question wrong:\n\n${q.question}\n\nI chose ${chosen}, but the correct answer is "${q.options[q.answerIndex]}". Can you explain why, step by step?`,
      },
    });
  };

  const { phase, quiz, answers } = practice;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className={styles.page} ref={topRef}>
      <Link to={ROUTES.AI_CHAT} className={styles.back}>
        <ArrowLeft size={16} /> AI Chat
      </Link>

      <header className={styles.header}>
        <div className={styles.headerIcon}><ClipboardList size={22} /></div>
        <div>
          <h1 className={styles.title}>Practice Quiz</h1>
          <p className={styles.subtitle}>The AI tutor makes a quiz for you, marks it, and explains every answer.</p>
        </div>
      </header>

      {practice.error && <p className={styles.error} role="alert">{practice.error}</p>}

      {phase === 'setup' && (
        <>
          <form className={styles.card} onSubmit={startQuiz}>
            {fixedFocus ? (
              <div className={styles.field}>
                <span className={styles.label}>Quiz on</span>
                <div className={styles.scopeRow}>
                  <span className={styles.scopeChip}><BookOpen size={14} /> {fixedFocus}</span>
                  <button type="button" className={styles.linkButton} onClick={() => setScope({ subject: scope.subject, context: null })}>
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.label}>Subject</span>
                  <select className={styles.input} value={scope.subject} onChange={(e) => setScope({ subject: e.target.value, context: null })}>
                    {(SUBJECTS.includes(scope.subject) ? SUBJECTS : [scope.subject, ...SUBJECTS]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Topic or chapter (optional)</span>
                  <input
                    className={styles.input}
                    value={topic}
                    maxLength={150}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Quadratic equations"
                  />
                </label>
              </div>
            )}

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <span className={styles.label}>Difficulty</span>
                <div className={styles.segmented} role="radiogroup" aria-label="Difficulty">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      role="radio"
                      aria-checked={difficulty === d.id}
                      className={`${styles.segment} ${difficulty === d.id ? styles.segmentActive : ''}`}
                      onClick={() => setDifficulty(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Questions</span>
                <div className={styles.segmented} role="radiogroup" aria-label="Number of questions">
                  {[5, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={count === n}
                      className={`${styles.segment} ${count === n ? styles.segmentActive : ''}`}
                      onClick={() => setCount(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" iconLeft={<Sparkles size={16} />}>
              Create my quiz
            </Button>
          </form>

          {practice.history.length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Recent quizzes</h2>
              <ul className={styles.historyList}>
                {practice.history.map((h) => (
                  <li key={h.id}>
                    <button type="button" className={styles.historyItem} onClick={() => practice.openQuiz(h.id)}>
                      <span className={styles.historyMain}>
                        <span className={styles.historyTitle}>{focusOf(h.context) || h.subject}</span>
                        <span className={styles.historyMeta}>
                          {h.subject} · {h.difficulty} · {formatRelativeTime(h.createdAt)}
                        </span>
                      </span>
                      <span className={styles.historyScore}>
                        {h.status === 'submitted' ? `${h.score}/${h.total}` : 'Continue'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {phase === 'generating' && (
        <div className={`${styles.card} ${styles.center}`}>
          <Loader2 size={28} className={styles.spin} />
          <p>Creating your quiz... this takes a few seconds.</p>
        </div>
      )}

      {phase === 'quiz' && quiz && (
        <>
          <div className={styles.quizMeta}>
            <span className={styles.capitalize}>{focusOf(quiz.context) || quiz.subject} · {quiz.difficulty}</span>
            <span>{answeredCount}/{quiz.questions.length} answered</span>
          </div>
          {quiz.questions.map((q, qi) => (
            <div key={qi} className={styles.questionCard}>
              <p id={`q${qi}-label`} className={styles.question}><span className={styles.qNum}>{qi + 1}.</span> {q.question}</p>
              <div className={styles.options} role="radiogroup" aria-labelledby={`q${qi}-label`}>
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`${styles.option} ${answers[qi] === oi ? styles.optionChosen : ''}`}>
                    <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => practice.choose(qi, oi)} />
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + oi)}</span>
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className={styles.submitRow}>
            {answeredCount < quiz.questions.length && (
              <span className={styles.hint}>{quiz.questions.length - answeredCount} unanswered — they'll count as wrong.</span>
            )}
            <Button variant="primary" loading={practice.submitting} disabled={answeredCount === 0} onClick={practice.submit}>
              Submit answers
            </Button>
          </div>
        </>
      )}

      {phase === 'results' && quiz && (
        <>
          <div className={`${styles.card} ${styles.scoreCard}`}>
            <Trophy size={32} className={styles.trophy} />
            <p className={styles.score}>{quiz.score}<span>/{quiz.total}</span></p>
            <p className={styles.scoreMessage}>{scoreMessage(Math.round((quiz.score / quiz.total) * 100))}</p>
            <div className={styles.scoreActions}>
              <Button variant="primary" iconLeft={<RotateCcw size={16} />} onClick={practice.regenerate}>New quiz, same topic</Button>
              <Button variant="outline" onClick={practice.reset}>Change topic</Button>
            </div>
          </div>

          {quiz.questions.map((q, qi) => (
            <div key={qi} className={`${styles.questionCard} ${q.correct ? styles.cardCorrect : styles.cardWrong}`}>
              <p className={styles.question}>
                {q.correct ? <CheckCircle2 size={18} className={styles.iconCorrect} /> : <XCircle size={18} className={styles.iconWrong} />}
                <span><span className={styles.qNum}>{qi + 1}.</span> {q.question}</span>
              </p>
              <div className={styles.options}>
                {q.options.map((opt, oi) => {
                  const isAnswer = oi === q.answerIndex;
                  const isChosenWrong = oi === q.chosenIndex && !isAnswer;
                  return (
                    <div key={oi} className={`${styles.option} ${styles.optionStatic} ${isAnswer ? styles.optionCorrect : ''} ${isChosenWrong ? styles.optionWrong : ''}`}>
                      <span className={styles.optionLetter}>{String.fromCharCode(65 + oi)}</span>
                      <span>{opt}</span>
                      {isAnswer && <span className={styles.tag}>Correct answer</span>}
                      {isChosenWrong && <span className={styles.tag}>Your answer</span>}
                    </div>
                  );
                })}
              </div>
              {q.chosenIndex === null && <p className={styles.hint}>You skipped this one.</p>}
              {q.explanation && <p className={styles.explanation}>{q.explanation}</p>}
              {!q.correct && (
                <button type="button" className={styles.askAi} onClick={() => askAiAbout(q)}>
                  <Sparkles size={14} /> Ask AI to explain this
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AIPractice;
