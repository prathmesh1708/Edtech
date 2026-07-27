import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, Play, CheckCircle2, Circle, X, FileDown, Info } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import Button from '../../../components/common/Button/Button';
import Card from '../../../components/common/Card/Card';
import { downloadPDF } from '../../../../utils/pdfGenerator';

const s = {
  grid: {
    width: '100%'
  },
  header: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-light)',
    marginBottom: 'var(--space-8)'
  },
  topicRow: {
    display: 'flex',
    alignItems: 'center',
    justify: 'space-between',
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border-light)',
    cursor: 'pointer'
  },
  sidebarCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    marginBottom: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)'
  },
  resourceBtn: {
    display: 'flex',
    alignItems: 'center',
    justify: 'space-between',
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    background: 'var(--color-surface)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 'var(--space-3)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 'var(--space-4)',
    backdropFilter: 'blur(8px)'
  },
  modalContent: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    width: '100%',
    maxWidth: '720px',
    boxShadow: 'var(--shadow-2xl)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }
};

const MOCK_TOPICS = [
  { id: 't-1', name: 'Introduction to Real Numbers', completed: true },
  { id: 't-2', name: 'Euclid\'s Division Lemma', completed: true },
  { id: 't-3', name: 'Fundamental Theorem of Arithmetic', completed: false },
  { id: 't-4', name: 'Revisiting Irrational Numbers', completed: false },
  { id: 't-5', name: 'Rational Numbers and Decimals', completed: false },
];

const ChapterView = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState(MOCK_TOPICS);

  // Download & Video states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const toggleTopic = (id) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Trigger simulated file download with progress
  const startDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress(0);

            downloadPDF(
              'Real_Numbers_Chapter_1_Notes',
              'Chapter 1: Real Numbers Study Notes',
              'Mathematics',
              'CBSE Curriculum',
              'Official Chapter 1 Real Numbers notes, Euclid Division Lemma proofs, and practice question bank.'
            );
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  return (
    <div>
      <Link to={ROUTES.MY_SYLLABUS} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Subject
      </Link>

      <div style={s.header}>
        <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>Chapter 1</Badge>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)' }}>
          Real Numbers
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Explore basic mathematical properties of rational and irrational numbers.
        </p>
      </div>

      <div style={s.grid} className="responsive-grid-2-1">
        {/* Left Side: Topic Flow */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-border-light)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700' }}>Topic-wise Learning Flow</h3>
          </div>
          <div>
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                style={s.topicRow}
                onClick={() => toggleTopic(topic.id)}
                className="subject-card-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {topic.completed ? (
                    <CheckCircle2 size={20} color="var(--color-success)" />
                  ) : (
                    <Circle size={20} color="var(--color-text-tertiary)" />
                  )}
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '500',
                    color: topic.completed ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                    textDecoration: topic.completed ? 'line-through' : 'none'
                  }}>
                    {index + 1}. {topic.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Side: Chapter Study Resources */}
        <div>
          <div style={s.sidebarCard}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>Downloadable Resources</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                style={s.resourceBtn} 
                className="subject-card-hover" 
                onClick={startDownload}
                disabled={isDownloading}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileDown size={16} color="var(--color-accent)" />
                  <span>{isDownloading ? `Downloading (${downloadProgress}%)...` : 'Chapter Notes (PDF)'}</span>
                </div>
                <Badge variant={isDownloading ? "warning" : "success"} size="sm">
                  {isDownloading ? `${downloadProgress}%` : 'Available'}
                </Badge>
              </button>

              {isDownloading && (
                <div style={{ width: '100%', background: 'var(--color-bg-alt)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: 'var(--space-2)' }}>
                  <div style={{ width: `${downloadProgress}%`, background: 'var(--color-accent)', height: '100%', transition: 'width 0.15s ease-out' }} />
                </div>
              )}

              <button 
                style={s.resourceBtn} 
                className="subject-card-hover" 
                onClick={() => setIsPlayingVideo(true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={16} color="var(--color-warning)" />
                  <span>Video Lesson</span>
                </div>
                <Badge variant="primary" size="sm">12 Mins</Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      {isPlayingVideo && (
        <div style={s.modalOverlay} onClick={() => setIsPlayingVideo(false)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)' }}>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0 }}>Chapter 1: Real Numbers — Video Lesson Walkthrough</h4>
              <button onClick={() => setIsPlayingVideo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ width: '100%', height: '380px', background: '#000' }}>
              <video 
                src="https://www.w3schools.com/html/mov_bbb.mp4" 
                controls 
                autoPlay 
                style={{ width: '100%', height: '100%' }} 
              />
            </div>
            <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'var(--color-bg)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} /> Instructor: <b>Prof. Rajesh Sharma</b> • 2.5k Student Views
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterView;
