import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles, AlertCircle, FileText } from 'lucide-react';
import useAITutorController from '../../../../controllers/useAITutorController';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Card from '../../../components/common/Card/Card';
import styles from './AITutor.module.css';

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
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--color-accent)" />
          <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>Personalized Study Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} style={{ color: 'var(--color-error)' }}>
          <Trash2 size={16} /> Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div className={styles.messageList}>
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${isAssistant ? styles.assistantRow : styles.userRow}`}
            >
              <div
                className={styles.avatar}
                style={{
                  background: isAssistant ? 'var(--gradient-accent)' : 'var(--color-bg-alt)',
                  color: isAssistant ? 'white' : 'var(--color-primary)'
                }}
              >
                {isAssistant ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div
                className={`${styles.bubble} ${isAssistant ? styles.assistantBubble : styles.userBubble}`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className={`${styles.messageRow} ${styles.assistantRow}`}>
            <div className={styles.avatar} style={{ background: 'var(--gradient-accent)', color: 'white' }}>
              <Bot size={18} />
            </div>
            <div className={`${styles.bubble} ${styles.assistantBubble}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className={styles.promptPills}>
        {SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            className={`${styles.promptPill} suggestion-pill-hover`}
            onClick={() => setInputValue(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className={styles.inputArea}>
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
