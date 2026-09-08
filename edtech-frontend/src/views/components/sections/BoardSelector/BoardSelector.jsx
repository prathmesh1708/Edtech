import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Search, MapPin, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { BOARDS, STATE_BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import styles from './BoardSelector.module.css';

const BoardSelector = () => {
  const [activeBoard, setActiveBoard] = useState('cbse');
  const [selectedStateBoard, setSelectedStateBoard] = useState('state-mp'); // default MP Board
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const navigate = useNavigate();
  const headerRef = useScrollAnimation('fadeUp');
  const gridRef = useScrollAnimation('stagger', { stagger: 0.05 });

  const isStateBoardActive = activeBoard === 'state';

  const filteredStateBoards = STATE_BOARDS.filter(
    (sb) =>
      sb.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      sb.state.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      sb.code.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  const activeStateObj = STATE_BOARDS.find((sb) => sb.id === selectedStateBoard) || STATE_BOARDS[1]; // MP Board default

  const handleClassClick = (classId) => {
    const targetBoardId = isStateBoardActive ? selectedStateBoard : activeBoard;
    navigate(generateRoute(ROUTES.SYLLABUS_DETAIL, { boardId: targetBoardId, classId }));
  };

  return (
    <section className={styles.section} id="board-selector">
      <div className={styles.container}>
        <div className={styles.header} ref={headerRef}>
          <span className={styles.tag}>📚 Browse Syllabus</span>
          <h2 className={styles.title}>Choose Your Board & Class</h2>
          <p className={styles.subtitle}>
            Access comprehensive syllabus and study materials tailored to your specific education board and class.
          </p>
        </div>

        {/* Top-Level Board Cards: CBSE, ICSE, State Board, IB */}
        <div className={styles.boards}>
          {BOARDS.map((board) => (
            <div
              key={board.id}
              className={`${styles.boardCard} ${activeBoard === board.id ? styles.active : ''}`}
              onClick={() => setActiveBoard(board.id)}
            >
              <div className={styles.boardIcon}><Award size={24} /></div>
              <h3 className={styles.boardName}>{board.name}</h3>
              <span className={styles.boardFull}>{board.fullName}</span>
            </div>
          ))}
        </div>

        {/* State Board Sub-Selection Interface */}
        {isStateBoardActive && (
          <div className={styles.stateBoardSection}>
            <div className={styles.stateBoardHeader}>
              <div className={styles.stateBoardTitle}>
                <MapPin size={20} color="#4F6EF7" />
                <span>Select Your State Board:</span>
              </div>
              <div className={styles.stateSearchWrap}>
                <Search size={16} color="var(--color-text-tertiary)" />
                <input
                  type="text"
                  placeholder="Search state (e.g. MP, UP, Bihar, Maharashtra)..."
                  className={styles.stateSearchInput}
                  value={stateSearchTerm}
                  onChange={(e) => setStateSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.stateGrid}>
              {filteredStateBoards.map((sb) => {
                const isSelected = selectedStateBoard === sb.id;
                return (
                  <div
                    key={sb.id}
                    className={`${styles.stateCard} ${isSelected ? styles.stateCardActive : ''}`}
                    onClick={() => setSelectedStateBoard(sb.id)}
                  >
                    <div className={styles.stateCardLeft}>
                      <span className={styles.stateName}>{sb.name}</span>
                      <span className={styles.stateRegion}>{sb.state}</span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 size={18} color="#4F6EF7" />
                    ) : (
                      <span className={styles.stateBadge}>{sb.code}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Board Selection Notification */}
        <div className={styles.activeSelectionNotice}>
          <BookOpen size={16} color="#4F6EF7" />
          <span>
            {isStateBoardActive
              ? `Selected: ${activeStateObj.name} (${activeStateObj.state}) • Now select your class:`
              : `Selected: ${BOARDS.find(b => b.id === activeBoard)?.name} • Now select your class:`}
          </span>
        </div>

        {/* Class Grid */}
        <div className={styles.classGrid} ref={gridRef}>
          {CLASSES.map((cls) => (
            <div
              key={cls.id}
              className={styles.classCard}
              onClick={() => handleClassClick(cls.id)}
            >
              <div className={styles.classNum}>{cls.id}</div>
              <div className={styles.classLabel}>Class {cls.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoardSelector;
