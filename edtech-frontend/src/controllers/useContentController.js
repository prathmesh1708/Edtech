import { useState, useCallback, useEffect } from 'react';

const INITIAL_NOTES = [
  { id: 'n-1', title: 'Algebra Equations', content: 'Notes about linear equations and quadratic formulas.', date: '2026-07-01' },
  { id: 'n-2', title: 'Newton laws revision', content: 'Important definitions: Inertia, Force = mass * acceleration, Action & Reaction.', date: '2026-07-05' }
];

const useContentController = () => {
  const [bookmarks, setBookmarks] = useState([]);
  
  // Persistent personal notes state with localStorage backing
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('study_wisely_personal_notes');
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch (e) {
      return INITIAL_NOTES;
    }
  });

  // Sync personal notes to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem('study_wisely_personal_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Could not save personal notes to browser storage:', e);
    }
  }, [notes]);

  const addBookmark = useCallback((item) => {
    setBookmarks(prev => {
      if (prev.find(b => b.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeBookmark = useCallback((itemId) => {
    setBookmarks(prev => prev.filter(b => b.id !== itemId));
  }, []);

  const addNote = useCallback((title, content) => {
    const newNote = {
      id: `n-${Date.now()}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0]
    };
    setNotes(prev => [newNote, ...prev]);
  }, []);

  const deleteNote = useCallback((noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  return {
    bookmarks,
    notes,
    addBookmark,
    removeBookmark,
    addNote,
    deleteNote
  };
};

export default useContentController;
