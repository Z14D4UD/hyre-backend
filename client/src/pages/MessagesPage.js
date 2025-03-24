// client/src/pages/MessagesPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/MessagesPage.module.css';

export default function MessagesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Redirect if not a customer
  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view your messages.');
      navigate('/');
    }
  }, [isCustomer, navigate]);

  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Conversations and messages
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);

  // Replace with your backend URL from .env
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  // Fetch conversations on mount
  useEffect(() => {
    axios
      .get(`${backendUrl}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setConversations(res.data);
        if (res.data.length > 0) {
          selectConversation(res.data[0]._id);
        }
      })
      .catch((err) => {
        console.error('Error fetching conversations:', err);
        alert('Failed to load conversations.');
      });
  }, [backendUrl, token]);

  // Fetch messages when a conversation is selected
  const selectConversation = (conversationId) => {
    setSelectedConv(conversationId);
    axios
      .get(`${backendUrl}/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data);
        scrollToBottom();
      })
      .catch((err) => {
        console.error('Error fetching messages:', err);
        alert('Failed to load messages.');
      });
  };

  // Scroll chat window to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage && !attachment) return alert('Please enter a message or attach a file.');
    const formData = new FormData();
    formData.append('text', newMessage);
    if (attachment) {
      formData.append('attachment', attachment);
    }
    axios
      .post(`${backendUrl}/chat/conversations/${selectedConv}/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage('');
        setAttachment(null);
      })
      .catch((err) => {
        console.error('Error sending message:', err);
        alert('Failed to send message.');
      });
  };

  // Handle file change
  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // Render each conversation with unread count and "Show Reservation" if available
  const renderConversationItem = (conv) => (
    <div
      key={conv._id}
      className={`${styles.conversationItem} ${selectedConv === conv._id ? styles.activeConv : ''}`}
      onClick={() => selectConversation(conv._id)}
    >
      <div className={styles.convTitle}>
        {conv.name || conv.participants.join(', ')}
      </div>
      {conv.unreadCount > 0 && (
        <div className={styles.unreadBadge}>{conv.unreadCount}</div>
      )}
      {conv.reservationId && (
        <button className={styles.showReservationBtn} onClick={() => navigate(`/reservation/${conv.reservationId}`)}>
          Show Reservation
        </button>
      )}
      {conv.lastMessage && (
        <div className={styles.lastMessage}>
          {conv.lastMessage.length > 40 ? conv.lastMessage.substring(0, 40) + '...' : conv.lastMessage}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      {/* Side Menu */}
      {isCustomer && (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <h2>Conversations</h2>
          {conversations.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            conversations.map(renderConversationItem)
          )}
        </div>

        <div className={styles.chatWindow}>
          {selectedConv ? (
            <>
              <div className={styles.messagesContainer}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`${styles.messageItem} ${msg.senderModel === 'Customer' ? styles.sent : styles.received}`}
                  >
                    {msg.attachment && (
                      <div className={styles.attachmentPreview}>
                        <a href={`${backendUrl}/${msg.attachment}`} target="_blank" rel="noopener noreferrer">
                          View Attachment
                        </a>
                      </div>
                    )}
                    {msg.text && <p>{msg.text}</p>}
                    <span className={styles.timestamp}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.messageInputContainer}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <input type="file" className={styles.fileInput} onChange={handleAttachmentChange} />
                <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className={styles.emptyChat}>
              <p>Select a conversation to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
