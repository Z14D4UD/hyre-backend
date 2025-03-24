// client/src/pages/MessagesPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPaperclip } from 'react-icons/fa';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/MessagesPage.module.css';
import axios from 'axios';

export default function MessagesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Filter state: "all" or "unread"
  const [filter, setFilter] = useState('all');

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Conversations & selected conversation
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // New message inputs
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Ref for scrolling to bottom
  const messagesEndRef = useRef(null);

  // Base URL for your backend API
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  // Fetch conversations when component mounts or when filter/search changes
  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view messages.');
      navigate('/');
      return;
    }
    fetchConversations();
    // eslint-disable-next-line
  }, [isCustomer, filter, searchTerm]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/chat/conversations?filter=${filter}&search=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const res = await axios.get(
        `${backendUrl}/chat/conversations/${conv._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
      // Optionally, mark conversation as read
      await axios.put(
        `${backendUrl}/chat/conversations/${conv._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Scroll to bottom after messages load
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || (!messageText && !attachment)) return;

    try {
      const formData = new FormData();
      formData.append('text', messageText);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const res = await axios.post(
        `${backendUrl}/chat/conversations/${selectedConversation._id}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessages((prev) => [...prev, res.data]);
      setMessageText('');
      setAttachment(null);
      // Refresh conversation list to update last message
      fetchConversations();
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    }
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSearchIconClick = () => {
    setSearchOpen(true);
  };

  const handleCancelSearch = () => {
    setSearchOpen(false);
    setSearchTerm('');
  };

  const renderConversationList = () => {
    if (!conversations.length) {
      return <div className={styles.noConversations}>No conversations yet.</div>;
    }
    return conversations.map((conv) => {
      const isSelected = selectedConversation && selectedConversation._id === conv._id;
      return (
        <div
          key={conv._id}
          className={`${styles.conversationItem} ${isSelected ? styles.selectedConv : ''}`}
          onClick={() => handleSelectConversation(conv)}
        >
          <div className={styles.conversationTitle}>
            {conv.name || 'Conversation'}
          </div>
          <div className={styles.conversationSnippet}>
            {conv.lastMessage || 'No messages yet'}
          </div>
          {conv.unreadCount > 0 && (
            <div className={styles.unreadBadge}>{conv.unreadCount}</div>
          )}
        </div>
      );
    });
  };

  const renderMessages = () => {
    if (!selectedConversation) {
      return <div className={styles.emptyMessages}>Select a conversation to view messages.</div>;
    }
    if (!messages.length) {
      return <div className={styles.emptyMessages}>No messages yet.</div>;
    }
    return messages.map((msg) => {
      const myId = localStorage.getItem('userId'); // or use token-decoded id if stored
      const isMine = msg.sender === myId;
      return (
        <div
          key={msg._id}
          className={`${styles.messageItem} ${isMine ? styles.myMessage : styles.theirMessage}`}
        >
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
    });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {/* Side Menu */}
      {isCustomer && (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      )}

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Pane: Conversation List & Search */}
        <div className={styles.leftPane}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <div className={styles.filterRow}>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'unread' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button className={styles.searchIconBtn} onClick={handleSearchIconClick}>
                <FaSearch />
              </button>
            </div>
            {searchOpen && (
              <div className={styles.searchRow}>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className={styles.cancelSearchBtn} onClick={handleCancelSearch}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className={styles.conversationList}>
            {renderConversationList()}
          </div>
        </div>

        {/* Right Pane: Message Thread */}
        <div className={styles.rightPane}>
          <div className={styles.messageThread}>
            {renderMessages()}
            <div ref={messagesEndRef} />
          </div>
          {selectedConversation && (
            <div className={styles.messageInputArea}>
              <textarea
                className={styles.textArea}
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <input
                type="file"
                className={styles.attachmentInput}
                onChange={handleAttachmentChange}
              />
              <button className={styles.sendButton} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
