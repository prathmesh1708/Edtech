import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles, AlertCircle, FileText } from 'lucide-react';
import useAITutorController from '../../../../controllers/useAITutorController';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';

const s = {
  chatContainer: {
    height: 'calc(100vh - var(--navbar-height) - 150px)',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    border: '1px solid var(--color-border-light)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)'
  },
  header: {
    padding: 'var(--space-4) var(--space-6)',
    borderBottom: '1px solid var(--color-border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(79, 110, 247, 0.02)'
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  messageRow: {
    display: 'flex',
    gap: 'var(--space-3)',
    maxWidth: '80%'
  },
  assistantRow: {
    alignSelf: 'flex-start'
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bubble: {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-xl)',
    fontSize: 'var(--text-sm)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  assistantBubble: {
    background: 'var(--color-bg)',
    color: 'var(--color-text-primary)',
    borderTopLeftRadius: '2px'
  },
  userBubble: {
    background: 'var(--gradient-accent)',
    color: 'var(--color-white)',
    borderTopRightRadius: '2px'
  },
  inputArea: {
    padding: 'var(--space-4)',
    borderTop: '1px solid var(--color-border-light)',
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'center'
  },
  promptPills: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '8px var(--space-6)',
    background: 'rgba(255, 255, 255, 0.5)',
    borderTop: '1px solid var(--color-border-light)'
  },
  promptPill: {
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--color-border)',
    background: 'white',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  }
};

const SUGGESTIONS = [
  'Solve quadratic equation: x^2 - 5x + 6 = 0',
  'Explain Newton\'s Third Law of Motion',
  'Give me a summary of Chapter 1 Chemistry',
  'What is the structure of a cell?'
];

const AITutor = () => {
  const { messages, loading, sendMessage, clearChat } = useAITutorController();
  const [inputValue, setInputValue] = useState('');
  const listEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div style={s.chatContainer}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--color-accent)" />
          <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>Personalized Study Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} style={{ color: 'var(--color-error)' }}>
          <Trash2 size={16} /> Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div style={s.messageList}>
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              style={{ ...s.messageRow, ...(isAssistant ? s.assistantRow : s.userRow) }}
            >
              <div
                style={{
                  ...s.avatar,
                  background: isAssistant ? 'var(--gradient-accent)' : 'var(--color-bg-alt)',
                  color: isAssistant ? 'white' : 'var(--color-primary)'
                }}
              >
                {isAssistant ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div
                style={{
                  ...s.bubble,
                  ...(isAssistant ? s.assistantBubble : s.userBubble)
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ ...s.messageRow, ...s.assistantRow }}>
            <div style={{ ...s.avatar, background: 'var(--gradient-accent)', color: 'white' }}>
              <Bot size={18} />
            </div>
            <div style={{ ...s.bubble, ...s.assistantBubble, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      {/* Suggested prompts */}
      <div style={s.promptPills}>
        {SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            style={s.promptPill}
            onClick={() => setInputValue(prompt)}
            className="suggestion-pill-hover"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={s.inputArea}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Ask your tutor any question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            iconLeft={<FileText size={18} />}
          />
        </div>
        <Button variant="primary" size="lg" type="submit" disabled={loading} iconLeft={<Send size={18} />}>
          Ask
        </Button>
      </form>
    </div>
  );
};

export default AITutor;
