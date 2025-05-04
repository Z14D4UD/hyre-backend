// client/src/pages/BusinessMessagesPage.js
import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/BusinessMessagesPage.module.css';
import { FaSearch } from 'react-icons/fa';

export default function BusinessMessagesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const acct = localStorage.getItem('accountType');
  const isBiz = token && acct === 'business';

  const myBizId = useMemo(() => {
    try { return jwtDecode(token).id; }
    catch { return null; }
  }, [token]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const endRef = useRef(null);

  const backend = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isBiz) { navigate('/'); return; }
    fetchConversations();
  }, [isBiz]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(
        `${backend}/chat/conversations?filter=all&search=`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(data);
    } catch (err) {
      console.error('Error fetching convos', err);
      alert('Failed to load conversations.');
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      const { data } = await axios.get(
        `${backend}/chat/conversations/${conv._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(data.messages);
      await axios.put(
        `${backend}/chat/conversations/${conv._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error loading messages', err);
      alert('Failed to load messages.');
    }
  };

  const sendMessage = async () => {
    if (!selectedConv || (!messageText && !attachment)) return;
    const form = new FormData();
    form.append('text', messageText);
    if (attachment) form.append('attachment', attachment);
    try {
      const { data } = await axios.post(
        `${backend}/chat/conversations/${selectedConv._id}/messages`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setMessages(prev => [...prev, data]);
      setMessageText('');
      setAttachment(null);
      fetchConversations();
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error sending message', err);
      alert('Failed to send message.');
    }
  };

  const deleteConversation = async (convId) => {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await axios.delete(
        `${backend}/chat/conversations/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (selectedConv?._id === convId) setSelectedConv(null);
      fetchConversations();
    } catch (err) {
      console.error('Error deleting conversation', err);
      alert('Failed to delete conversation.');
    }
  };

  const fullAvatar = (u) => u ? `${backend}/${u}` : '/default-avatar.png';

  // -- CHAT VIEW --
  if (selectedConv) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => setSelectedConv(null)}
          >←</button>
          <div className={styles.chatTitle}>{selectedConv.name}</div>
        </header>
        <div className={styles.chatOnlyContent}>
          <div className={styles.messageThread}>
            {messages.map(m => {
              const mine = m.sender._id === myBizId;
              const bubble = mine ? styles.myMessage : styles.theirMessage;
              return (
                <div key={m._id} className={`${styles.messageItem} ${bubble}`}>
                  <img
                    src={fullAvatar(m.sender.avatarUrl)}
                    alt=""
                    className={styles.msgAvatar}
                  />
                  <div className={styles.messageBubble}>
                    <div className={styles.msgName}>{m.sender.name}</div>
                    <div className={styles.messageText}>{m.text}</div>
                    {m.attachment && (
                      <div className={styles.attachmentWrapper}>
                        <a
                          href={`${backend}/${m.attachment}`}
                          target="_blank"
                          rel="noreferrer"
                        >View Attachment</a>
                      </div>
                    )}
                    <div className={styles.messageTimestamp}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <div className={styles.messageInputArea}>
            <textarea
              className={styles.textArea}
              placeholder="Type your message…"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
            />
            <input
              type="file"
              className={styles.attachmentInput}
              onChange={e => setAttachment(e.target.files[0])}
            />
            <button className={styles.sendButton} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- INBOX VIEW --
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>Messages</div>
        <button
          className={styles.menuIcon}
          onClick={() => setMenuOpen(o => !o)}
        >☰</button>
      </header>

      <SideMenuBusiness
        isOpen={menuOpen}
        toggleMenu={() => setMenuOpen(o => !o)}
        closeMenu={() => setMenuOpen(false)}
      />

      <div className={styles.inboxContent}>
        {conversations.map(c => (
          <div
            key={c._id}
            className={styles.conversationItem}
            onClick={() => selectConversation(c)}
            onContextMenu={e => {
              e.preventDefault();
              deleteConversation(c._id);
            }}
          >
            <img
              src={fullAvatar(c.avatarUrl)}
              alt=""
              className={styles.convAvatar}
            />
            <div className={styles.convoText}>
              <div className={styles.conversationTitle}>{c.name}</div>
              <div className={styles.conversationSnippet}>{c.lastMessage || '—'}</div>
            </div>
            {c.unreadCount > 0 && (
              <div className={styles.unreadBadge}>{c.unreadCount}</div>
            )}
          </div>
        ))}
        {!conversations.length && (
          <div className={styles.noConversations}>No conversations yet.</div>
        )}
      </div>
    </div>
  );
}
