// client/src/pages/MessagesPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/MessagesPage.module.css';
import axios from 'axios';

export default function MessagesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Side menu
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Filter for conversations: “all” or “unread”
  const [filter, setFilter] = useState('all');

  // Conversations + selected conversation
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Messages in the selected conversation
  const [messages, setMessages] = useState([]);

  // For sending a message
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Reservation details (if conversation has booking)
  const [bookingDetails, setBookingDetails] = useState(null);

  // Endpoint base
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view messages.');
      navigate('/');
      return;
    }
    fetchConversations(filter);
    // eslint-disable-next-line
  }, [isCustomer, filter]);

  // Fetch conversations with given filter
  const fetchConversations = async (filterVal) => {
    try {
      const res = await axios.get(`${backendUrl}/chat/conversations?filter=${filterVal}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // Select a conversation
  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
    setBookingDetails(null);
    // Fetch messages for this conversation
    try {
      const res = await axios.get(`${backendUrl}/chat/conversations/${conv._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
      if (res.data.bookingDetails) {
        setBookingDetails(res.data.bookingDetails);
      }
      // Optionally mark all as read
      await axios.put(`${backendUrl}/chat/conversations/${conv._id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Re-fetch conversations to update unread counts
      fetchConversations(filter);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!selectedConversation) return;
    if (!messageText && !attachment) return;

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

      // Add the new message to the state
      setMessages([...messages, res.data]);
      setMessageText('');
      setAttachment(null);

      // Re-fetch conversations to update last message + unread
      fetchConversations(filter);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message.');
    }
  };

  // On file attach
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // Render conversation list on the left
  const renderConversationList = () => {
    if (!conversations.length) {
      return <div className={styles.noConversations}>No conversations yet.</div>;
    }
    return conversations.map((conv) => {
      const isSelected = selectedConversation && selectedConversation._id === conv._id;
      const unreadLabel = conv.unreadCount > 0 ? ` (${conv.unreadCount} unread)` : '';
      return (
        <div
          key={conv._id}
          className={`${styles.conversationItem} ${isSelected ? styles.selectedConv : ''}`}
          onClick={() => handleSelectConversation(conv)}
        >
          <div className={styles.conversationTitle}>
            {conv.name || 'Conversation'}{unreadLabel}
          </div>
          <div className={styles.conversationSnippet}>
            {conv.lastMessage || 'No messages yet'}
          </div>
        </div>
      );
    });
  };

  // Render messages on the right
  const renderMessages = () => {
    if (!selectedConversation) {
      return <div className={styles.emptyMessages}>Select a conversation to view messages.</div>;
    }
    if (!messages.length) {
      return <div className={styles.emptyMessages}>No messages yet.</div>;
    }
    return messages.map((msg) => {
      const isMine = msg.senderModel === 'Customer' && msg.sender === localStorage.getItem('userId');
      return (
        <div
          key={msg._id}
          className={`${styles.messageItem} ${isMine ? styles.myMessage : styles.theirMessage}`}
        >
          <div className={styles.messageText}>{msg.text}</div>
          {msg.attachment && (
            <div className={styles.attachmentWrapper}>
              {/* Could handle images vs. docs, etc. */}
              <a href={`/${msg.attachment}`} target="_blank" rel="noopener noreferrer">
                Attachment
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
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      )}

      {/* Main content area */}
      <div className={styles.content}>
        {/* Left sidebar for conversation list */}
        <div className={styles.leftPane}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            {/* Filter: All / Unread */}
            <div className={styles.filterRow}>
              <button
                className={filter === 'all' ? styles.activeFilter : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'unread' ? styles.activeFilter : ''}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
            </div>
          </div>
          <div className={styles.conversationList}>
            {renderConversationList()}
          </div>
        </div>

        {/* Right pane for messages */}
        <div className={styles.rightPane}>
          {selectedConversation && bookingDetails && (
            <div className={styles.reservationBanner}>
              <button
                onClick={() => {
                  // Example: navigate to a reservation page
                  navigate(`/reservation/${bookingDetails._id}`);
                }}
              >
                Show reservation
              </button>
            </div>
          )}

          <div className={styles.messageThread}>
            {renderMessages()}
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
                onChange={handleFileChange}
              />
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
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
