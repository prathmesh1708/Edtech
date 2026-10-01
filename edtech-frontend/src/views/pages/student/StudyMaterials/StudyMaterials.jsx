import React, { useState } from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import { BOARDS, STATE_BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import { useAuth } from '../../../../models/context/AuthContext';
import { useSyllabusState } from '../../../../models/context/SyllabusContext';
import useDikshaController, { useDikshaFilters } from '../../../../controllers/useDikshaController';
import CustomSelect from '../../../components/common/CustomSelect/CustomSelect';
import Input from '../../../components/common/Input/Input';
import DikshaFilters from '../../../components/diksha/DikshaFilters/DikshaFilters';
import DikshaResourceGrid from '../../../components/diksha/DikshaResourceGrid/DikshaResourceGrid';
import styles from './StudyMaterials.module.css';

const BOARD_OPTIONS = [
  ...BOARDS.filter((b) => b.id !== 'state').map((b) => ({ id: b.id, name: b.name, subtitle: b.fullName })),
  ...STATE_BOARDS.map((sb) => ({ id: sb.id, name: sb.name, state: sb.state, code: sb.code })),
];

const CLASS_OPTIONS = CLASSES.map((c) => ({ id: String(c.id), name: c.name }));

/**
 * Maps the stored profile board ('CBSE', 'state-mp', 'MP Board', 'State Board'...) to a
 * board option id. A generic "State Board" falls back to the state picked in SyllabusContext.
 */
const resolveUserBoard = (userBoard, fallbackStateBoard) => {
  const v = String(userBoard || '').trim().toLowerCase();
  if (BOARD_OPTIONS.some((o) => o.id === v)) return v;
  const state = STATE_BOARDS.find(
    (sb) => v === sb.name.toLowerCase() || v === sb.code.toLowerCase() || (v && v.includes(sb.state.toLowerCase()))
  );
  if (state) return state.id;
  if (v.startsWith('state')) return fallbackStateBoard || 'state-mp';
  return 'cbse';
};

const resolveUserClass = (classId, fallbackClass) => {
  const n = String(classId || '').match(/\d+/)?.[0];
  if (n && CLASS_OPTIONS.some((c) => c.id === String(Number(n)))) return String(Number(n));
  const f = String(fallbackClass || '').match(/\d+/)?.[0];
  return f && CLASS_OPTIONS.some((c) => c.id === f) ? f : '10';
};

const StudyMaterials = () => {
  const { user } = useAuth();
  const { selectedStateBoard, selectedClass } = useSyllabusState();

  const [initial] = useState(() => ({
    board: resolveUserBoard(user?.board, selectedStateBoard),
    grade: resolveUserClass(user?.classId, selectedClass),
  }));

  // Results always use exactly the board + class shown in the selectors (strict on the server).
  const [board, setBoard] = useState(initial.board);
  const [grade, setGrade] = useState(initial.grade);
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const filters = useDikshaFilters({ board, grade });
  const list = useDikshaController({ board, grade, subject, type, q, page });

  const boardName = BOARD_OPTIONS.find((o) => o.id === board)?.name || board;
  const isDefaultScope = board === initial.board && grade === initial.grade;

  const changeScope = (nextBoard, nextGrade) => {
    setBoard(nextBoard);
    setGrade(nextGrade);
    setSubject('');
    setType('');
    setPage(1);
  };

  const getLink = (item) => generateRoute(ROUTES.STUDY_MATERIAL_DETAIL, { contentId: item.id });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.headerTitle}>Study Materials</h1>
            <p className={styles.headerSubtitle}>
              Free, openly licensed resources from DIKSHA for <strong>{boardName}</strong> · <strong>Class {grade}</strong> only
            </p>
          </div>
          {!isDefaultScope && (
            <button type="button" className={styles.resetButton} onClick={() => changeScope(initial.board, initial.grade)}>
              <RotateCcw size={14} /> My board &amp; class
            </button>
          )}
        </div>

        <div className={styles.controls}>
          <CustomSelect
            label="Board"
            value={board}
            options={BOARD_OPTIONS}
            onChange={(id) => changeScope(id, grade)}
            searchable
            className={styles.select}
          />
          <CustomSelect
            label="Class"
            value={grade}
            options={CLASS_OPTIONS}
            onChange={(id) => changeScope(board, id)}
            className={styles.select}
          />
          <Input
            label="Search"
            name="diksha-search"
            placeholder="Search DIKSHA (e.g. polynomials, photosynthesis)"
            value={q}
            maxLength={100}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            iconLeft={<Search size={16} />}
            iconRight={
              q ? (
                <button type="button" className={styles.clearSearch} aria-label="Clear search" onClick={() => setQ('')}>
                  <X size={14} />
                </button>
              ) : null
            }
            className={styles.search}
          />
        </div>

        {filters.available && !filters.error && (
          <DikshaFilters
            types={filters.types}
            subjects={filters.subjects}
            activeType={type}
            activeSubject={subject}
            onTypeChange={(t) => {
              setType(t);
              setPage(1);
            }}
            onSubjectChange={(s) => {
              setSubject(s);
              setPage(1);
            }}
          />
        )}
      </header>

      <DikshaResourceGrid
        items={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.retry}
        available={list.available}
        unavailableText={`DIKSHA doesn't have resources for ${boardName} · Class ${grade}. Try CBSE or a state board.`}
        emptyText={q ? `No DIKSHA resources match "${q.trim()}".` : 'No DIKSHA resources match these filters.'}
        pagination={list.pagination}
        onPageChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        getLink={getLink}
      />
    </div>
  );
};

export default StudyMaterials;
