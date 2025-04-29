// client/src/pages/BusinessMessagesPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPaperclip } from 'react-icons/fa';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/MessagesPage.module.css';
import axios from 'axios';

export default function BusinessMessagesPage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const isBusiness = token && localStorage.getItem('accountType') === 'business';

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

  const backendUrl = process.env.REACT_APP_BACKEND_URL + '/chat';

  useEffect(() => {
    if (!isBusiness) {
      alert('Please log in as a business');
      navigate('/');
      return;
    }
    fetchConvs();
  }, [isBusiness, filter, searchTerm]);

  const fetchConvs = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/conversations?filter=${filter}&search=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectConv = async (conv) => {
    setSelectedConversation(conv);
    const res = await axios.get(
      `${backendUrl}/conversations/${conv._id}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages(res.data.messages);
    await axios.put(
      `${backendUrl}/conversations/${conv._id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    scrollToBottom();
    fetchConvs();
  };

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const sendMessage = async () => {
    if (!selectedConversation || (!messageText && !attachment)) return;
    const fd = new FormData();
    fd.append('text', messageText);
    if (attachment) fd.append('attachment', attachment);

    const res = await axios.post(
      `${backendUrl}/conversations/${selectedConversation._id}/messages`,
      fd,
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
    scrollToBottom();
    fetchConvs();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={()=>navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={()=>setMenuOpen(o=>!o)}>☰</button>
      </header>

      <SideMenuBusiness
        isOpen={menuOpen}
        toggleMenu={()=>setMenuOpen(o=>!o)}
        closeMenu={()=>setMenuOpen(false)}
      />

      <div className={styles.content}>
        <div className={styles.leftPane}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <div className={styles.filterRow}>
              <button className={`${styles.filterButton} ${filter==='all'?styles.activeFilter:''}`} onClick={()=>setFilter('all')}>All</button>
              <button className={`${styles.filterButton} ${filter==='unread'?styles.activeFilter:''}`} onClick={()=>setFilter('unread')}>Unread</button>
              <button className={styles.searchIconBtn} onClick={()=>setSearchOpen(true)}><FaSearch/></button>
            </div>
            {searchOpen && (
              <div className={styles.searchRow}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)}
                />
                <button className={styles.cancelSearchBtn} onClick={()=>setSearchOpen(false)}>Cancel</button>
              </div>
            )}
          </div>
          <div className={styles.conversationList}>
            {conversations.length===0
              ? <div className={styles.noConversations}>No conversations yet.</div>
              : conversations.map(conv => (
                <div
                  key={conv._id}
                  className={`${styles.conversationItem} ${selectedConversation?._id===conv._id?styles.selectedConv:''}`}
                  onClick={()=>selectConv(conv)}
                >
                  <img src={conv.avatarUrl} className={styles.convAvatar} alt="avatar"/>
                  <div>
                    <div className={styles.conversationTitle}>{conv.displayName}</div>
                    <div className={styles.conversationSnippet}>{conv.lastMessage}</div>
                  </div>
                  {conv.unreadCount>0 && <div className={styles.unreadBadge}>{conv.unreadCount}</div>}
                </div>
              ))
            }
          </div>
        </div>

        <div className={styles.rightPane}>
          <div className={styles.messageThread}>
            {!selectedConversation && <div className={styles.emptyMessages}>Select a conversation to view messages.</div>}
            {selectedConversation && messages.map(msg => {
              const mine = msg.senderModel === 'Business';
              return (
                <div
                  key={msg._id}
                  className={`${styles.messageItem} ${mine?styles.myMessage:styles.theirMessage}`}
                >
                  <img src={msg.senderAvatar} className={styles.msgAvatar} alt="avatar"/>
                  <div>
                    <div className={styles.messageText}>{msg.text}</div>
                    <div className={styles.messageTimestamp}>{new Date(msg.createdAt).toLocaleString()}</div>
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
                placeholder="Type your message…"
                value={messageText}
                onChange={e=>setMessageText(e.target.value)}
              />
              <label>
                <FaPaperclip style={{cursor:'pointer',marginRight:4}}/>
                <input type="file" className={styles.attachmentInput} onChange={e=>setAttachment(e.target.files[0])}/>
              </label>
              <button className={styles.sendButton} onClick={sendMessage}>Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
