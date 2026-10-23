import React, { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, Square, Image as ImageIcon, Mic, RotateCcw, AlertCircle } from 'lucide-react';
import MarkdownMessage from './MarkdownMessage';
import styles from '../AIChat.module.css';

const AttachmentChip = ({ kind }) => (
  <span className={styles.attachmentChip}>
    {kind === 'audio' ? <Mic size={13} /> : <ImageIcon size={13} />}
    {kind === 'audio' ? 'Voice question' : 'Photo'}
  </span>
);

const MessageBubble = ({ message, speaking, canSpeak, onSpeak, onStopSpeaking, onRetry, isLast }) => {
  const [copied, setCopied] = useState(false);
  const isAi = message.sender === 'ai';
  const isStreaming = message.status === 'streaming';
  const attachment = message.attachments?.[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context); nothing to do
    }
  };

  return (
    <div className={`${styles.messageRow} ${isAi ? styles.aiRow : styles.userRow}`}>
      <div className={`${styles.avatar} ${isAi ? styles.aiAvatar : styles.userAvatar}`} aria-hidden="true">
        {isAi ? <Bot size={18} /> : <User size={18} />}
      </div>

      <div className={styles.bubbleColumn}>
        <div className={`${styles.bubble} ${isAi ? styles.aiBubble : styles.userBubble}`}>
          {!isAi && message.previewUrl && <img src={message.previewUrl} alt="Your uploaded question" className={styles.bubbleImage} />}
          {!isAi && attachment && !message.previewUrl && <AttachmentChip kind={attachment.kind} />}

          {isAi ? (
            isStreaming && !message.text ? (
              <span className={styles.typing} aria-label="AI tutor is thinking">
                <span /><span /><span />
              </span>
            ) : (
              <>
                <MarkdownMessage text={message.text} />
                {isStreaming && <span className={styles.cursor} aria-hidden="true" />}
              </>
            )
          ) : (
            message.text && <p className={styles.userText}>{message.text}</p>
          )}

          {isAi && message.status === 'stopped' && <p className={styles.statusNote}>Stopped</p>}
          {isAi && (message.status === 'error' || message.errorText) && (
            <p className={`${styles.statusNote} ${styles.statusError}`}>
              <AlertCircle size={13} /> {message.errorText || 'Something went wrong.'}
            </p>
          )}
        </div>

        {isAi && !isStreaming && (
          <div className={styles.messageActions}>
            {message.text && (
              <button type="button" onClick={copy} className={styles.iconAction} aria-label="Copy answer" title="Copy">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
            {canSpeak && message.text && (
              <button
                type="button"
                onClick={speaking ? onStopSpeaking : onSpeak}
                className={styles.iconAction}
                aria-label={speaking ? 'Stop reading aloud' : 'Read answer aloud'}
                title={speaking ? 'Stop' : 'Read aloud'}
              >
                {speaking ? <Square size={14} /> : <Volume2 size={14} />}
              </button>
            )}
            {isLast && message.status === 'error' && onRetry && (
              <button type="button" onClick={onRetry} className={styles.textAction}>
                <RotateCcw size={13} /> Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MessageBubble);
