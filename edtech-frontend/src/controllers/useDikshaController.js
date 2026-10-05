import { useState, useEffect, useRef, useCallback } from 'react';
import dikshaService from '../models/services/dikshaService';

const SEARCH_DEBOUNCE_MS = 400;
const FALLBACK_ERROR = 'DIKSHA service is temporarily unavailable';

export const getDikshaErrorMessage = (err) => err?.response?.data?.message || FALLBACK_ERROR;

/**
 * Runs `load()` whenever `key` changes; ignores responses from superseded requests.
 * When `debounceValue` changed since the last run, the request waits SEARCH_DEBOUNCE_MS.
 * Returns { data, loading, error, retry }.
 */
const useLatestRequest = (load, key, { debounceValue, enabled = true } = {}) => {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(0);
  const lastDebounceValue = useRef(debounceValue);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    const id = ++requestId.current;
    const delay = lastDebounceValue.current !== debounceValue ? SEARCH_DEBOUNCE_MS : 0;
    lastDebounceValue.current = debounceValue;
    setState((s) => ({ ...s, loading: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const res = await loadRef.current();
        if (id === requestId.current) setState({ data: res.data, loading: false, error: null });
      } catch (err) {
        if (id === requestId.current) setState((s) => ({ ...s, loading: false, error: getDikshaErrorMessage(err) }));
      }
    }, delay);
    return () => clearTimeout(timer);
    // `key` captures every input of `load`; `debounceValue` is part of `key`.
  }, [key, attempt, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, retry };
};

/**
 * DIKSHA resource listing with pagination and debounced search.
 * @param {object} params { mine, board, grade, subject, type, q, page, limit }
 *   mine=true uses /my-content (board/class taken from the logged-in user on the server).
 */
const useDikshaController = ({ mine = false, board, grade, subject, type, q = '', page = 1, limit = 20, enabled = true }) => {
  const query = q.trim();
  const params = {
    ...(mine ? {} : { board: board || undefined, grade: grade || undefined }),
    subject: subject || undefined,
    type: type || undefined,
    q: query || undefined,
    page,
    limit,
  };
  const key = JSON.stringify({ mine, ...params });

  // Debounced only while the search text is changing.
  const { data, loading, error, retry } = useLatestRequest(
    () => (mine ? dikshaService.getMyContent(params) : dikshaService.search(params)),
    key,
    { debounceValue: query, enabled }
  );

  const items = data?.data || [];
  return {
    items,
    pagination: data?.pagination || { page, limit, total: 0 },
    query: data?.query || null,
    available: data ? data.available !== false : true,
    loading,
    error,
    isEmpty: !loading && !error && !!data && items.length === 0,
    retry,
  };
};

/** Subjects / content types / grades available on DIKSHA for a board + class. */
export const useDikshaFilters = ({ board, grade, enabled = true }) => {
  const key = JSON.stringify({ board, grade });
  const { data, loading, error, retry } = useLatestRequest(
    () => dikshaService.getFilters({ board: board || undefined, grade: grade || undefined }),
    key,
    { enabled }
  );
  return {
    subjects: data?.data?.subjects || [],
    types: data?.data?.types || [],
    grades: data?.data?.grades || [],
    query: data?.query || null,
    available: data ? data.available !== false : true,
    loading,
    error,
    retry,
  };
};

/** One DIKSHA item plus, for textbooks/courses, its chapter tree. */
export const useDikshaItem = (contentId) => {
  const { data, loading, error, retry } = useLatestRequest(async () => {
    const res = await dikshaService.getContent(contentId);
    const item = res.data.data;
    let children = null;
    if (item?.isCollection) {
      try {
        const tree = await dikshaService.getHierarchy(contentId);
        children = tree.data.data.children;
      } catch {
        children = null; // metadata still shows; chapter tree is optional
      }
    }
    return { data: { item, children } };
  }, contentId, { enabled: !!contentId });

  return { item: data?.item || null, children: data?.children || null, loading, error, retry };
};

/** Server-persisted DIKSHA bookmarks for the logged-in user. */
export const useDikshaBookmarks = ({ enabled = true } = {}) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await dikshaService.getBookmarks();
      setBookmarks(res.data.data || []);
    } catch (err) {
      setError(getDikshaErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const isBookmarked = useCallback((id) => bookmarks.some((b) => b.contentId === id), [bookmarks]);

  const toggle = useCallback(async (id) => {
    setPending(id);
    try {
      if (bookmarks.some((b) => b.contentId === id)) {
        await dikshaService.removeBookmark(id);
        setBookmarks((prev) => prev.filter((b) => b.contentId !== id));
        return false;
      }
      const res = await dikshaService.addBookmark(id);
      setBookmarks((prev) => [res.data.data, ...prev.filter((b) => b.contentId !== id)]);
      return true;
    } finally {
      setPending(null);
    }
  }, [bookmarks]);

  return { bookmarks, loading, error, pending, isBookmarked, toggle, reload: load };
};

/** Recently viewed DIKSHA items (newest 20). */
export const useDikshaRecent = ({ enabled = true } = {}) => {
  const { data, loading, error, retry } = useLatestRequest(() => dikshaService.getRecent(), 'recent', { enabled });
  return { recent: data?.data || [], loading, error, retry };
};

export default useDikshaController;
