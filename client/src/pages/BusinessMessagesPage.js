// client/src/pages/BusinessMessagesPage.js

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate }                  from 'react-router-dom';
import { FaSearch, FaPaperclip }        from 'react-icons/fa';
import SideMenuBusiness                 from '../components/SideMenuBusiness';
import styles                           from '../styles/MessagesPage.module.css';
import axios                            from 'axios';

export default function BusinessMessagesPage() {
  const navigate    = useNavigate();
  const token       = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isBusiness  = token && accountType==='business';

  const [menuOpen, setMenuOpen] = useState(false);
  const [filter,   setFilter]   = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment]   = useState(null);
  const messagesEndRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isBusiness) {
      alert('Please log in as a business to view messages.');
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
      console.error('Error fetching conversations:', err);
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const res = await axios.get(
        `${backendUrl}/chat/conversations/${conv._id}/messages`,
        { headers: { Authorization:`Bearer ${token}` } }
      );
      setMessages(res.data.messages);
      await axios.put(
        `${backendUrl}/chat/conversations/${conv._id}/read`,
        {},
        { headers: { Authorization:`Bearer ${token}` } }
      );
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
  };

  const handleSendMessage = async () => {
    if (!selectedConversation) return;
    if (!messageText && !attachment) return;
    try {
      const formData = new FormData();
      formData.append('text', messageText);
      if (attachment) formData.append('attachment', attachment);
      const res = await axios.post(
        `${backendUrl}/chat/conversations/${selectedConversation._id}/messages`,
        formData,
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
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message.');
    }
  };

  const handleAttachmentChange = e => {
    if (e.target.files?.[0]) setAttachment(e.target.files[0]);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={()=>navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={()=>setMenuOpen(o=>!o)}>☰</button>
      </header>

      {/* Side Menu */}
      <SideMenuBusiness isOpen={menuOpen} toggleMenu={()=>setMenuOpen(o=>!o)} closeMenu={()=>setMenuOpen(false)}/>

      {/* Main */}
      <div className={styles.content}>
        <div className={styles.leftPane}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <div className={styles.filterRow}>
              {['all','unread'].map(f => (
                <button
                  key={f}
                  className={`${styles.filterButton} ${filter===f ? styles.activeFilter : ''}`}
                  onClick={()=>setFilter(f)}
                >
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
              <button className={styles.searchIconBtn} onClick={()=>setSearchOpen(o=>!o)}>
                <FaSearch/>
              </button>
            </div>
            {searchOpen && (
              <div className={styles.searchRow}>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)}
                />
                <button className={styles.cancelSearchBtn} onClick={()=>{setSearchTerm('');setSearchOpen(false);}}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className={styles.conversationList}>
            {conversations.length===0
              ? <div className={styles.noConversations}>No conversations yet.</div>
              : conversations.map(conv => {
                  const selected = selectedConversation?._id===conv._id;
                  return (
                    <div
                      key={conv._id}
                      className={`${styles.conversationItem} ${selected?styles.selectedConv:''}`}
                      onClick={()=>handleSelectConversation(conv)}
                    >
                      <div className={styles.conversationTitle}>{conv.name||'Conversation'}</div>
                      <div className={styles.conversationSnippet}>{conv.lastMessage||'No messages yet'}</div>
                      {conv.unreadCount>0 && <div className={styles.unreadBadge}>{conv.unreadCount}</div>}
                    </div>
                  );
                })
            }
          </div>
        </div>

        <div className={styles.rightPane}>
          <div className={styles.messageThread}>
            {selectedConversation ? (
              messages.map(msg => {
                const mine  = msg.sender===localStorage.getItem('businessId');
                return (
                  <div key={msg._id} className={`${styles.messageItem} ${mine?styles.myMessage:styles.theirMessage}`}>
                    <div className={styles.messageText}>{msg.text}</div>
                    {msg.attachment && (
                      <div className={styles.attachmentWrapper}>
                        <a href={`${backendUrl}/${msg.attachment}`} target="_blank" rel="noopener noreferrer">
                          View Attachment
                        </a>
                      </div>
                    )}
                    <div className={styles.messageTimestamp}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyMessages}>Select a conversation to view messages.</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedConversation && (
            <div className={styles.messageInputArea}>
              <textarea
                className={styles.textArea}
                placeholder="Type your message..."
                value={messageText}
                onChange={e=>setMessageText(e.target.value)}
              />
              <input type="file" className={styles.attachmentInput} onChange={handleAttachmentChange} />
              <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
