// client/src/pages/BusinessMessagesPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/MessagesPage.module.css';
import axios from 'axios';

export default function BusinessMessagesPage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const acct     = localStorage.getItem('accountType');
  const isBusiness = token && acct === 'business';

  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter]     = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment]   = useState(null);
  const endRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!isBusiness) {
      alert('Please log in as a business');
      navigate('/');
      return;
    }
    fetchConversations();
  }, [isBusiness, filter, searchTerm]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/chat/conversations?filter=${filter}&search=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const res = await axios.get(
        `${backendUrl}/chat/conversations/${conv._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
      await axios.put(
        `${backendUrl}/chat/conversations/${conv._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || (!messageText && !attachment)) return;
    const form = new FormData();
    form.append('text', messageText);
    if (attachment) form.append('attachment', attachment);

    try {
      const res = await axios.post(
        `${backendUrl}/chat/conversations/${selectedConversation._id}/messages`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setMessages(msgs => [...msgs, res.data]);
      setMessageText('');
      setAttachment(null);
      fetchConversations();
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={() => setMenuOpen(o => !o)}>☰</button>
      </header>

      <SideMenuBusiness isOpen={menuOpen} toggleMenu={()=>setMenuOpen(o=>!o)} closeMenu={()=>setMenuOpen(false)} />

      <div className={styles.content}>
        <div className={styles.leftPane}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <div className={styles.filterRow}>
              <button
                className={`${styles.filterButton} ${filter==='all' ? styles.activeFilter:''}`}
                onClick={()=>setFilter('all')}
              >All</button>
              <button
                className={`${styles.filterButton} ${filter==='unread' ? styles.activeFilter:''}`}
                onClick={()=>setFilter('unread')}
              >Unread</button>
              <button className={styles.searchIconBtn} onClick={()=>setSearchOpen(true)}><FaSearch/></button>
            </div>
            {searchOpen && (
              <div className={styles.searchRow}>
                <input
                  type="text"
                  placeholder="Search..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)}
                />
                <button onClick={()=>setSearchOpen(false)} className={styles.cancelSearchBtn}>Cancel</button>
              </div>
            )}
          </div>

          <div className={styles.conversationList}>
            {conversations.map(conv => (
              <div
                key={conv._id}
                className={`${styles.conversationItem} ${selectedConversation?._id===conv._id?styles.selectedConv:''}`}
                onClick={() => selectConversation(conv)}
              >
                <div className={styles.conversationTitle}>{conv.name || 'Conversation'}</div>
                <div className={styles.conversationSnippet}>{conv.lastMessage || '—'}</div>
                {conv.unreadCount>0 && <div className={styles.unreadBadge}>{conv.unreadCount}</div>}
              </div>
            ))}
            {conversations.length===0 && <div className={styles.noConversations}>No conversations yet.</div>}
          </div>
        </div>

        <div className={styles.rightPane}>
          <div className={styles.messageThread}>
            {messages.map(msg => {
              const myId = localStorage.getItem('businessId');
              const mine = msg.sender === myId;
              return (
                <div key={msg._id} className={`${styles.messageItem} ${mine?styles.myMessage:styles.theirMessage}`}>
                  <div className={styles.messageText}>{msg.text}</div>
                  {msg.attachment && (
                    <div className={styles.attachmentWrapper}>
                      <a href={`${backendUrl}/${msg.attachment}`} target="_blank" rel="noreferrer">
                        View Attachment
                      </a>
                    </div>
                  )}
                  <div className={styles.messageTimestamp}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
            <div ref={endRef}/>
          </div>
          {selectedConversation && (
            <div className={styles.messageInputArea}>
              <textarea
                className={styles.textArea}
                placeholder="Type your message..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <input type="file" className={styles.attachmentInput} onChange={e=>setAttachment(e.target.files[0])} />
              <button className={styles.sendButton} onClick={sendMessage}>Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
