import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sparkles, History, Plus, BookOpen, AlertTriangle, Mic, Camera, Type, ClipboardList } from 'lucide-react';
import { ROUTES } from '../../../../config/routes';
import useAITutorController from '../../../../controllers/useAITutorController';
import useSpeechSynthesis from '../../../../hooks/useSpeechSynthesis';
import { useAuth } from '../../../../models/context/AuthContext';
import ConversationList from './components/ConversationList';
import MessageBubble from './components/MessageBubble';
import ChatComposer from './components/ChatComposer';
import { getSuggestions } from './aiChatConfig';
import styles from './AIChat.module.css';

const contextLabel = (context) => context?.chapterName || context?.materialTitle || context?.topic || null;

/**
 * AI Chat — the student's personal AI tutor. Other pages open it with router state:
 *   navigate(ROUTES.AI_CHAT, { state: { subject, context: { chapterId, chapterName, materialId, materialTitle, topic }, prefill } })
 */
const AIChat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const chat = useAITutorController();
  const { newChat, sendMessage } = chat;
  const tts = useSpeechSynthesis();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const listRef = useRef(null);
  const appliedKeyRef = useRef(null);

  // Start a chat scoped to the page that sent the student here (once per navigation).
  useEffect(() => {
    const state = location.state;
    if (!state || appliedKeyRef.current === location.key) return;
    appliedKeyRef.current = location.key;
    newChat({ subject: state.subject || 'General', context: state.context || null });
    if (state.prefill) setPrefill({ text: state.prefill, key: location.key });
    // Clear the state so a refresh doesn't start another new chat.
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.state, location.pathname, navigate, newChat]);

  // Follow the answer as it streams in, unless the student scrolled up to read.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom || !chat.streaming) el.scrollTop = el.scrollHeight;
  }, [chat.messages, chat.streaming]);

  const handleSend = useCallback(
    async (request) => {
      tts.stop();
      const answer = await sendMessage(request);
      if (answer && request.inputMode === 'voice' && tts.supported) tts.speak(answer.id, answer.text);
    },
    [sendMessage, tts]
  );

  const handleRetry = useCallback(async () => {
    tts.stop();
    await chat.retryLast();
  }, [chat, tts]);

  const startNewChat = () => {
    tts.stop();
    newChat();
    setHistoryOpen(false);
  };

  const openConversation = (id) => {
    tts.stop();
    chat.openConversation(id);
    setHistoryOpen(false);
  };

  const { status, activeMeta, draftContext } = chat;
  const context = activeMeta ? activeMeta.context : draftContext;
  const focus = contextLabel(context);
  const subject = activeMeta ? activeMeta.subject : chat.draftSubject;
  const firstName = (user?.name || '').split(' ')[0];
  const limits = status?.limits;
  const limitReached = Boolean(limits?.perDay && limits.usedToday >= limits.perDay);
  const unavailable = status && !status.enabled;
  const lastAiId = [...chat.messages].reverse().find((m) => m.sender === 'ai')?.id;

  return (
    <div className={styles.shell}>
      <aside className={`${styles.history} ${historyOpen ? styles.historyOpen : ''}`} aria-label="Chat history">
        <ConversationList
          conversations={chat.conversations}
          loading={chat.listLoading}
          activeId={chat.activeId}
          onNewChat={startNewChat}
          onOpen={openConversation}
          onRename={chat.renameConversation}
          onDelete={chat.deleteConversation}
        />
      </aside>
      {historyOpen && <div className={styles.backdrop} onClick={() => setHistoryOpen(false)} aria-hidden="true" />}

      <section className={styles.chat}>
        <header className={styles.chatHeader}>
          <button type="button" className={`${styles.iconButton} ${styles.mobileOnly}`} onClick={() => setHistoryOpen(true)} aria-label="Show chat history">
            <History size={20} />
          </button>

          <div className={styles.headerMain}>
            <h2 className={styles.chatTitle}>
              <Sparkles size={18} className={styles.titleIcon} />
              <span>{activeMeta?.title || 'AI Study Assistant'}</span>
            </h2>
            {(focus || (subject && subject !== 'General')) && (
              <div className={styles.headerMeta}>
                {subject && subject !== 'General' && <span className={styles.subjectBadge}>{subject}</span>}
                {focus && (
                  <span className={styles.contextChip} title={focus}>
                    <BookOpen size={12} /> {focus}
                  </span>
                )}
              </div>
            )}
          </div>

          <Link
            to={ROUTES.AI_PRACTICE}
            state={subject !== 'General' || context ? { subject: subject !== 'General' ? subject : undefined, context } : undefined}
            className={styles.practiceLink}
            title="Practice quiz"
          >
            <ClipboardList size={16} /> <span>Practice</span>
          </Link>
          {limits?.perDay ? (
            <span className={styles.usage} title="Questions asked today">
              {Math.min(limits.usedToday, limits.perDay)}/{limits.perDay} today
            </span>
          ) : null}
          <button type="button" className={`${styles.iconButton} ${styles.mobileOnly}`} onClick={startNewChat} aria-label="New chat">
            <Plus size={20} />
          </button>
        </header>

        {unavailable && (
          <div className={styles.banner} role="status">
            <AlertTriangle size={16} />
            {status.unreachable
              ? "Can't reach the AI tutor right now. Check your internet connection and refresh."
              : 'The AI tutor is not available right now. Please try again later.'}
          </div>
        )}
        {limitReached && !unavailable && (
          <div className={styles.banner} role="status">
            <AlertTriangle size={16} /> You've used all of today's questions. Come back tomorrow — great work studying!
          </div>
        )}

        <div ref={listRef} className={styles.messageList} aria-live="polite">
          {chat.conversationLoading ? (
            <p className={styles.centerNote}>Loading chat...</p>
          ) : chat.messages.length === 0 ? (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}><Sparkles size={28} /></div>
              <h3>{firstName ? `Hi ${firstName}! ` : ''}What would you like to learn today?</h3>
              <p>
                {focus ? <>Ask me anything about <strong>{focus}</strong>.</> : 'Ask any doubt from any subject — I explain step by step.'}
              </p>
              <div className={styles.modes}>
                <span><Type size={14} /> Type</span>
                <span><Mic size={14} /> Speak</span>
                <span><Camera size={14} /> Snap a photo</span>
              </div>
              <div className={styles.suggestions}>
                {getSuggestions({ classId: user?.classId, context, subject }).map((s) => (
                  <button key={s} type="button" className={styles.suggestion} disabled={unavailable || limitReached || chat.streaming} onClick={() => handleSend({ text: s, inputMode: 'text' })}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chat.messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                isLast={m.id === lastAiId}
                canSpeak={tts.supported}
                speaking={tts.speakingId === m.id}
                onSpeak={() => tts.speak(m.id, m.text)}
                onStopSpeaking={tts.stop}
                onRetry={handleRetry}
              />
            ))
          )}
        </div>

        <ChatComposer
          disabled={Boolean(unavailable) || limitReached}
          streaming={chat.streaming}
          onSend={handleSend}
          onStop={chat.stop}
          prefill={prefill}
          placeholder={focus ? `Ask about ${focus}...` : 'Ask any doubt...'}
        />
        <p className={styles.disclaimer}>AI can make mistakes. Check important answers with your textbook or teacher.</p>
      </section>
    </div>
  );
};

export default AIChat;
