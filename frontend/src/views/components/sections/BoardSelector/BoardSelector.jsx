import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award } from 'lucide-react';
import { BOARDS, CLASSES } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import styles from './BoardSelector.module.css';

const BoardSelector = () => {
  const [activeBoard, setActiveBoard] = useState('cbse');
  const navigate = useNavigate();
  const headerRef = useScrollAnimation('fadeUp');
  const gridRef = useScrollAnimation('stagger', { stagger: 0.05 });

  const handleClassClick = (classId) => {
    navigate(generateRoute(ROUTES.SYLLABUS_DETAIL, { boardId: activeBoard, classId }));
  };

  return (
    <section className={styles.section} id="board-selector">
      <div className={styles.container}>
        <div className={styles.header} ref={headerRef}>
          <span className={styles.tag}>📚 Browse Syllabus</span>
          <h2 className={styles.title}>Choose Your Board & Class</h2>
          <p className={styles.subtitle}>
            Access comprehensive syllabus and study materials tailored to your board and class.
          </p>
        </div>

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
