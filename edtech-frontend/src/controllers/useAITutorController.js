import { useState, useCallback, useEffect, useRef } from 'react';
import aiTutorService, { AIChatError } from '../models/services/aiTutorService';

let tempSeq = 0;
const tempId = (prefix) => `${prefix}-${Date.now()}-${tempSeq++}`;

const NETWORK_ERROR = 'Could not reach the AI tutor. Check your internet connection and try again.';

const attachmentKind = (mimeType) => (mimeType.startsWith('audio/') ? 'audio' : 'image');

/**
 * State for the AI Chat module: conversation history, the open conversation,
 * and streaming answers from /api/ai/chat.
 */
const useAITutorController = () => {
  const [status, setStatus] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [activeMeta, setActiveMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  // Subject and page context used when the next message starts a new conversation.
  const [draftSubject, setDraftSubject] = useState('General');
  const [draftContext, setDraftContext] = useState(null);

  const activeIdRef = useRef(null);
  const abortRef = useRef(null);
  const lastRequestRef = useRef(null);

  const setActive = (id) => {
    activeIdRef.current = id;
    setActiveId(id);
  };

  const loadStatus = useCallback(async () => {
    try {
      const res = await aiTutorService.getStatus();
      setStatus(res.data);
    } catch {
      setStatus({ enabled: false, unreachable: true });
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await aiTutorService.getConversations(subjectFilter ? { subject: subjectFilter } : {});
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.warn('Could not load AI chat history:', err.message);
    } finally {
      setListLoading(false);
    }
  }, [subjectFilter]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const upsertConversation = useCallback(
    (summary) => {
      setConversations((prev) => {
        const rest = prev.filter((c) => c.id !== summary.id);
        if (subjectFilter && summary.subject !== subjectFilter) return rest;
        return [summary, ...rest];
      });
    },
    [subjectFilter]
  );

  const newChat = useCallback(({ subject = 'General', context = null } = {}) => {
    abortRef.current?.abort();
    setActive(null);
    setActiveMeta(null);
    setMessages([]);
    setDraftSubject(subject);
    setDraftContext(context);
  }, []);

  const openConversation = useCallback(async (id) => {
    if (id === activeIdRef.current) return;
    abortRef.current?.abort();
    setActive(id);
    setConversationLoading(true);
    try {
      const res = await aiTutorService.getConversation(id);
      const { messages: loaded, ...meta } = res.data.conversation;
      if (activeIdRef.current !== id) return;
      setActiveMeta(meta);
      setMessages(loaded);
    } catch (err) {
      console.warn('Could not open AI chat:', err.message);
      setActive(null);
      setMessages([]);
    } finally {
      setConversationLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(
    async (id) => {
      await aiTutorService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeIdRef.current === id) newChat();
    },
    [newChat]
  );

  const renameConversation = useCallback(async (id, title) => {
    const res = await aiTutorService.renameConversation(id, title);
    const summary = res.data.conversation;
    setConversations((prev) => prev.map((c) => (c.id === id ? summary : c)));
    if (activeIdRef.current === id) setActiveMeta(summary);
  }, []);

  /**
   * @param {{ text?: string, attachment?: { mimeType: string, data: string, previewUrl?: string }, inputMode?: string }} request
   * @returns {Promise<object|null>} the saved AI message, or null if it did not complete
   */
  const sendMessage = useCallback(
    async ({ text = '', attachment = null, inputMode = 'text' }) => {
      if (streaming || (!text.trim() && !attachment)) return null;
      lastRequestRef.current = { text, attachment, inputMode };

      const userTempId = tempId('u');
      const aiTempId = tempId('a');
      setMessages((prev) => [
        ...prev,
        {
          id: userTempId,
          sender: 'user',
          text: text.trim(),
          inputMode,
          attachments: attachment ? [{ kind: attachmentKind(attachment.mimeType), mimeType: attachment.mimeType }] : [],
          previewUrl: attachment?.previewUrl,
          timestamp: new Date().toISOString(),
        },
        { id: aiTempId, sender: 'ai', text: '', status: 'streaming' },
      ]);
      setStreaming(true);

      const patchAi = (fn) => setMessages((prev) => prev.map((m) => (m.id === aiTempId ? fn(m) : m)));
      const controller = new AbortController();
      abortRef.current = controller;

      const payload = { message: text.trim(), inputMode };
      if (attachment) payload.attachment = { mimeType: attachment.mimeType, data: attachment.data };
      if (activeIdRef.current) payload.conversationId = activeIdRef.current;
      else {
        payload.subject = draftSubject;
        if (draftContext) payload.context = draftContext;
      }

      let finalMessage = null;
      let started = false;
      try {
        await aiTutorService.streamChat(payload, {
          signal: controller.signal,
          onEvent: (event, data) => {
            if (event === 'meta') {
              started = true;
              setActive(data.conversationId);
              setMessages((prev) => prev.map((m) => (m.id === userTempId ? { ...data.userMessage, previewUrl: m.previewUrl } : m)));
            } else if (event === 'delta') {
              patchAi((m) => ({ ...m, text: m.text + data.text }));
            } else if (event === 'replace') {
              patchAi((m) => ({ ...m, text: data.text }));
            } else if (event === 'error') {
              patchAi((m) => ({ ...m, errorText: data.message }));
            } else if (event === 'done') {
              finalMessage = data.message;
              patchAi((m) => ({ ...data.message, errorText: m.errorText }));
              setActiveMeta(data.conversation);
              upsertConversation(data.conversation);
              setStatus((s) =>
                s?.limits?.perDay ? { ...s, limits: { ...s.limits, usedToday: (s.limits.usedToday || 0) + 1 } } : s
              );
            }
          },
        });
        if (!finalMessage) {
          patchAi((m) => ({ ...m, status: 'error', errorText: m.errorText || 'The answer was cut off. Please try again.' }));
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          patchAi((m) => ({ ...m, status: 'stopped' }));
          if (started) loadConversations();
        } else {
          patchAi((m) => ({ ...m, status: 'error', errorText: err instanceof AIChatError ? err.message : NETWORK_ERROR }));
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStreaming(false);
      }
      return finalMessage && finalMessage.status === 'complete' ? finalMessage : null;
    },
    [streaming, draftSubject, draftContext, upsertConversation, loadConversations]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Drops the failed question/answer pair from view and asks again.
  const retryLast = useCallback(() => {
    const last = lastRequestRef.current;
    if (!last || streaming) return null;
    setMessages((prev) => prev.slice(0, -2));
    return sendMessage(last);
  }, [sendMessage, streaming]);

  return {
    status,
    enabled: Boolean(status?.enabled),
    conversations,
    listLoading,
    subjectFilter,
    setSubjectFilter,
    activeId,
    activeMeta,
    messages,
    conversationLoading,
    streaming,
    draftSubject,
    setDraftSubject,
    draftContext,
    newChat,
    openConversation,
    deleteConversation,
    renameConversation,
    sendMessage,
    stop,
    retryLast,
  };
};

export default useAITutorController;
