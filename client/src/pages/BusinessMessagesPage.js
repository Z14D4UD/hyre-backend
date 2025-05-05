import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/BusinessMessagesPage.module.css';
import { FaBars } from 'react-icons/fa';
const jwtDecode = require('jwt-decode');

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
  const [filter, setFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const endRef = useRef(null);

  const backend =
    process.env.REACT_APP_BACKEND_URL ||
    'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isBiz) {
      navigate('/');
      return;
    }
    fetchConversations();
  }, [isBiz, filter, searchTerm]);

  const fetchConversations = async () => {
    const { data } = await axios.get(
      `${backend}/chat/conversations?filter=${filter}&search=${encodeURIComponent(
        searchTerm
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setConversations(data);
  };

  const selectConversation = async (conv) => {
    setSelectedConv(conv);
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
  };

  const sendMessage = async () => {
    if (!selectedConv || (!messageText && !attachment)) return;

    const form = new FormData();
    form.append('text', messageText);
    if (attachment) form.append('attachment', attachment);

    const { data } = await axios.post(
      `${backend}/chat/conversations/${selectedConv._id}/messages`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    setMessages((prev) => [...prev, data]);
    setMessageText('');
    setAttachment(null);
    fetchConversations();
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fullAvatar = (u) => (u ? `${backend}/${u}` : '/default-avatar.png');

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {selectedConv && (
            <button
              className={styles.backBtn}
              onClick={() => setSelectedConv(null)}
            >
              ←
            </button>
          )}
          <span className={styles.headerTitle}>
            {selectedConv ? selectedConv.name : 'Messages'}
          </span>
        </div>
        <button
          className={styles.menuIcon}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <FaBars />
        </button>
      </header>

      {/* SIDE MENU */}
      <SideMenuBusiness
        isOpen={menuOpen}
        toggleMenu={() => setMenuOpen((o) => !o)}
        closeMenu={() => setMenuOpen(false)}
      />

      {/* CONTENT */}
      <div className={styles.content}>
        {/* LEFT PANE */}
        <div className={styles.leftPane}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <div className={styles.filterRow}>
              <button
                className={`${styles.filterButton} ${
                  filter === 'all' ? styles.activeFilter : ''
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`${styles.filterButton} ${
                  filter === 'unread' ? styles.activeFilter : ''
                }`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
            </div>
            {searchOpen && (
              <div className={styles.searchRow}>
                <input
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className={styles.cancelSearchBtn}
                  onClick={() => setSearchOpen(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className={styles.conversationList}>
            {conversations.map((c) => {
              const sel = selectedConv?._id === c._id;
              return (
                <div
                  key={c._id}
                  className={`${styles.conversationItem} ${
                    sel ? styles.selectedConv : ''
                  }`}
                  onClick={() => selectConversation(c)}
                >
                  <img
                    src={fullAvatar(c.avatarUrl)}
                    alt=""
                    className={styles.convAvatar}
                  />
                  <div className={styles.convoText}>
                    <div className={styles.conversationTitle}>{c.name}</div>
                    <div className={styles.conversationSnippet}>
                      {c.lastMessage || '—'}
                    </div>
                  </div>
                  {c.unreadCount > 0 && (
                    <div className={styles.unreadBadge}>{c.unreadCount}</div>
                  )}
                </div>
              );
            })}
            {!conversations.length && (
              <div className={styles.noConversations}>
                No conversations yet.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE */}
        <div className={styles.rightPane}>
          <div className={styles.messageThread}>
            {messages.map((m) => {
              const mine = m.sender._id === myBizId;
              const bubble = mine
                ? styles.myMessage
                : styles.theirMessage;
              return (
                <div
                  key={m._id}
                  className={`${styles.messageItem} ${bubble}`}
                >
                  <img
                    src={fullAvatar(m.sender.avatarUrl)}
                    alt=""
                    className={styles.msgAvatar}
                  />
                  <div className={styles.messageBubble}>
                    <div className={styles.msgName}>
                      {m.sender.name}
                    </div>
                    <div className={styles.messageText}>{m.text}</div>
                    {m.attachment && (
                      <div className={styles.attachmentWrapper}>
                        <a
                          href={`${backend}/${m.attachment}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Attachment
                        </a>
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

          {selectedConv && (
            <div className={styles.messageInputArea}>
              <textarea
                className={styles.textArea}
                placeholder="Type your message…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <input
                type="file"
                className={styles.attachmentInput}
                onChange={(e) => setAttachment(e.target.files[0])}
              />
              <button
                className={styles.sendButton}
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
