import { useState, useCallback } from 'react';

const useContentController = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([
    { id: 'n-1', title: 'Algebra Equations', content: 'Notes about linear equations and quadratic formulas.', date: '2026-07-01' },
    { id: 'n-2', title: 'Newton laws revision', content: 'Important definitions: Inertia, Force = mass * acceleration, Action & Reaction.', date: '2026-07-05' }
  ]);

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
