import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  BookOpen, 
  Layers, 
  Sparkles,
  ChevronDown 
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { SUBJECTS, BOARDS, STATE_BOARDS, CLASSES, resolveBoardInfo } from '../../../../config/constants';
import { ROUTES, generateRoute } from '../../../../config/routes';
import Badge from '../../../components/common/Badge/Badge';
import useScrollAnimation from '../../../../hooks/useScrollAnimation';
import styles from './Courses.module.css';

const Courses = () => {
  const [activeBoard, setActiveBoard] = useState('all');
  const [selectedStateBoard, setSelectedStateBoard] = useState('state-mp'); // Default MP Board
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [activeClass, setActiveClass] = useState('all');
  const [isStateDrawerOpen, setIsStateDrawerOpen] = useState(false);
  const gridRef = useScrollAnimation('stagger');

  const isStateBoardActive = activeBoard === 'state';

  const filteredStateBoards = STATE_BOARDS.filter(
    (sb) =>
      sb.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      sb.state.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      sb.code.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  const activeStateObj = STATE_BOARDS.find((sb) => sb.id === selectedStateBoard) || STATE_BOARDS[1]; // MP Board fallback

  const handleBoardClick = (boardId) => {
    if (boardId === 'state') {
      setActiveBoard('state');
      setIsStateDrawerOpen((prev) => !prev);
    } else {
      setActiveBoard(boardId);
      setIsStateDrawerOpen(false);
    }
  };

  const handleStateSelect = (stateId) => {
    setSelectedStateBoard(stateId);
    setActiveBoard('state');
    setIsStateDrawerOpen(false); // Auto close drawer so user sees updated subjects immediately
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Explore <span className="text-gradient">Courses & Subjects</span>
          </h1>
          <p className={styles.subtitle}>
            Browse our comprehensive curriculum subjects across national, international, and state education boards.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.filterSection}>
          {/* Top-Level Board Filter Pills */}
          <div className={styles.filtersRow}>
            <button
              className={`${styles.filterBtn} ${activeBoard === 'all' ? styles.filterActive : ''}`}
              onClick={() => handleBoardClick('all')}
            >
              <Layers size={14} /> All Boards
            </button>

            {BOARDS.map((b) => {
              const isSelected = activeBoard === b.id;
              const isState = b.id === 'state';
              return (
                <button
                  key={b.id}
                  className={`${styles.filterBtn} ${isSelected ? styles.filterActive : ''}`}
                  onClick={() => handleBoardClick(b.id)}
                >
                  {isState && <MapPin size={13} />}
                  <span>{isState && isSelected ? `State Board (${activeStateObj.code || activeStateObj.name})` : b.name}</span>
                  {isState && <ChevronDown size={13} style={{ transform: isStateDrawerOpen && isSelected ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
                </button>
              );
            })}
          </div>

          {/* Interactive State Board Selection Drawer */}
          {isStateBoardActive && isStateDrawerOpen && (
            <div className={styles.stateBoardDrawer}>
              <div className={styles.stateBoardHeader}>
                <div className={styles.stateBoardTitleWrap}>
                  <div className={styles.stateIconWrap}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className={styles.stateBoardTitle}>Select Your State Board</h3>
                    <p className={styles.stateBoardSub}>
                      Choose from 19+ state education boards (Class 1 to 12)
                    </p>
                  </div>
                </div>

                <div className={styles.stateSearchWrap}>
                  <Search size={15} color="var(--color-text-tertiary)" />
                  <input
                    type="text"
                    placeholder="Search state (e.g. MP, UP, Bihar, Maharashtra)..."
                    className={styles.stateSearchInput}
                    value={stateSearchTerm}
                    onChange={(e) => setStateSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {stateSearchTerm && (
                    <button className={styles.clearBtn} onClick={() => setStateSearchTerm('')}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.stateGridScroll}>
                <div className={styles.stateGrid}>
                  {filteredStateBoards.map((sb) => {
                    const isSelected = selectedStateBoard === sb.id;
                    return (
                      <div
                        key={sb.id}
                        className={`${styles.stateCard} ${isSelected ? styles.stateCardActive : ''}`}
                        onClick={() => handleStateSelect(sb.id)}
                      >
                        <div className={styles.stateCardInfo}>
                          <span className={styles.stateName}>{sb.name}</span>
                          <span className={styles.stateRegion}>{sb.state}</span>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 size={16} color="var(--color-primary)" />
                        ) : (
                          <span className={styles.stateBadge}>{sb.code}</span>
                        )}
                      </div>
                    );
                  })}

                  {filteredStateBoards.length === 0 && (
                    <div className={styles.noStatesFound}>
                      No state boards found matching "{stateSearchTerm}".
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Class Quick-Filter Pills */}
          <div className={styles.classFiltersRow}>
            <button
              type="button"
              className={`${styles.classBtn} ${activeClass === 'all' ? styles.classBtnActive : ''}`}
              onClick={() => setActiveClass('all')}
            >
              All Classes
            </button>
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                type="button"
                className={`${styles.classBtn} ${activeClass === String(cls.id) ? styles.classBtnActive : ''}`}
                onClick={() => setActiveClass(String(cls.id))}
              >
                Class {cls.id}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className={styles.grid} ref={gridRef}>
          {SUBJECTS.map((subject) => {
            const Icon = Icons[subject.icon] || Icons.BookOpen;

            return (
              <Link
                key={subject.id}
                to={generateRoute(ROUTES.COURSE_DETAIL, { courseId: subject.id })}
                style={{ textDecoration: 'none' }}
              >
                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <div
                      className={styles.icon}
                      style={{ background: `${subject.color}14`, color: subject.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <Badge variant="primary" size="sm">
                      {isStateBoardActive
                        ? activeStateObj.code
                        : activeBoard === 'all'
                        ? 'All Boards'
                        : activeBoard.toUpperCase()}
                    </Badge>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{subject.name}</h3>
                    <div className={styles.cardMeta}>
                      <span>
                        {activeClass === 'all' ? 'Class 1–12' : `Class ${activeClass}`}
                      </span>
                      <span>•</span>
                      <span>50+ Chapters</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.cardActionText}>Explore Subject</span>
                    <ArrowRight size={16} color="var(--color-primary)" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Courses;
