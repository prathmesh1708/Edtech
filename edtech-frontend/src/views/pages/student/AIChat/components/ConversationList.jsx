import React, { useState } from 'react';
import { Plus, MessageSquare, Pencil, Trash2, Check, X } from 'lucide-react';
import { formatRelativeTime } from '../aiChatConfig';
import styles from '../AIChat.module.css';

const ConversationItem = ({ conversation, active, onOpen, onRename, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [confirming, setConfirming] = useState(false);

  const saveTitle = async () => {
    const next = title.trim();
    setEditing(false);
    if (next && next !== conversation.title) {
      try {
        await onRename(conversation.id, next);
      } catch {
        setTitle(conversation.title);
      }
    } else setTitle(conversation.title);
  };

  if (editing) {
    return (
      <li className={`${styles.convItem} ${styles.convItemActive}`}>
        <input
          className={styles.renameInput}
          value={title}
          maxLength={120}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveTitle();
            if (e.key === 'Escape') {
              setTitle(conversation.title);
              setEditing(false);
            }
          }}
          aria-label="Chat title"
        />
        <button type="button" className={styles.iconAction} onClick={saveTitle} aria-label="Save title"><Check size={14} /></button>
      </li>
    );
  }

  return (
    <li className={`${styles.convItem} ${active ? styles.convItemActive : ''}`}>
      <button type="button" className={styles.convMain} onClick={() => onOpen(conversation.id)}>
        <MessageSquare size={15} className={styles.convIcon} />
        <span className={styles.convText}>
          <span className={styles.convTitle}>{conversation.title}</span>
          <span className={styles.convMeta}>
            {conversation.subject !== 'General' && <span className={styles.convSubject}>{conversation.subject}</span>}
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </span>
      </button>
      {confirming ? (
        <span className={styles.convActions}>
          <button type="button" className={`${styles.iconAction} ${styles.danger}`} onClick={() => onDelete(conversation.id)} aria-label="Confirm delete"><Check size={14} /></button>
          <button type="button" className={styles.iconAction} onClick={() => setConfirming(false)} aria-label="Cancel delete"><X size={14} /></button>
        </span>
      ) : (
        <span className={styles.convActions}>
          <button type="button" className={styles.iconAction} onClick={() => setEditing(true)} aria-label="Rename chat" title="Rename"><Pencil size={13} /></button>
          <button type="button" className={styles.iconAction} onClick={() => setConfirming(true)} aria-label="Delete chat" title="Delete"><Trash2 size={13} /></button>
        </span>
      )}
    </li>
  );
};

const ConversationList = ({ conversations, loading, activeId, onNewChat, onOpen, onRename, onDelete }) => (
  <div className={styles.historyInner}>
    <button type="button" className={styles.newChatButton} onClick={onNewChat}>
      <Plus size={18} /> New chat
    </button>

    <p className={styles.historyHeading}>Your doubts</p>
    {loading && !conversations.length ? (
      <p className={styles.historyEmpty}>Loading...</p>
    ) : conversations.length === 0 ? (
      <p className={styles.historyEmpty}>Your past chats will appear here.</p>
    ) : (
      <ul className={styles.convList}>
        {conversations.map((c) => (
          <ConversationItem
            key={`${c.id}-${c.title}`}
            conversation={c}
            active={c.id === activeId}
            onOpen={onOpen}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>
    )}
  </div>
);

export default ConversationList;
