import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/MessagesPage.module.css';

export default function MessagesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isUser = token && (accountType === 'customer' || accountType === 'business');

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);

  const chatThreadRef = useRef(null);

  useEffect(() => {
    if (!isUser) {
      alert('Please log in to view messages.');
      navigate('/');
      return;
    }
    axios
      .get(`${backendUrl}/chat/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setConversations(res.data);
        if (res.data.length > 0) {
          handleSelectConversation(res.data[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching conversations:', err);
        alert('Failed to fetch conversations.');
      });
  }, [isUser, backendUrl, token, navigate]);

  const handleSelectConversation = (convo) => {
    setActiveConversation(convo);
    axios
      .get(`${backendUrl}/chat/conversations/${convo._id}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error('Error fetching messages:', err);
        alert('Failed to fetch messages.');
      });
  };

  const handleAttachment = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSendMessage = () => {
    if (!messageText && !attachment) return;
    const formData = new FormData();
    formData.append('text', messageText);
    if (attachment) {
      formData.append('attachment', attachment);
    }
    axios
      .post(`${backendUrl}/chat/conversations/${activeConversation._id}/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setMessages((prev) => [...prev, res.data]);
        setMessageText('');
        setAttachment(null);
      })
      .catch((err) => {
        console.error('Error sending message:', err);
        alert('Failed to send message.');
      });
  };

  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isUser) return null;

  return (
    <div className={styles.messagesContainer}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>
      {(accountType === 'customer' || accountType === 'business') && (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      )}
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.conversationsHeader}>
            <h2>Messages</h2>
          </div>
          <div className={styles.conversationList}>
            {conversations.map((convo) => (
              <div
                key={convo._id}
                className={activeConversation && convo._id === activeConversation._id ? styles.conversationActive : styles.conversationItem}
                onClick={() => handleSelectConversation(convo)}
              >
                <div className={styles.conversationName}>{convo.name || 'Conversation'}</div>
                <div className={styles.conversationLastMessage}>{convo.lastMessage}</div>
                <div className={styles.conversationDate}>{new Date(convo.updatedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.centerColumn}>
          {activeConversation ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderName}>{activeConversation.name || 'Chat'}</div>
              </div>
              <div className={styles.chatThread} ref={chatThreadRef}>
                {messages.map((msg) => (
                  <div key={msg._id} className={msg.sender === token ? styles.messageRowRight : styles.messageRowLeft}>
                    <div className={styles.messageBubble}>
                      <div className={styles.messageText}>{msg.text}</div>
                      {msg.attachment && (
                        <div className={styles.attachment}>Attachment: {msg.attachment}</div>
                      )}
                      <div className={styles.messageMeta}>
                        {msg.senderName || 'Sender'} • {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.chatInputRow}>
                <input type="file" className={styles.fileInput} onChange={handleAttachment} />
                <input
                  type="text"
                  className={styles.chatInput}
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className={styles.noConversationSelected}>Select a conversation to start messaging.</div>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.reservationHeader}>
            <h3>Reservation</h3>
          </div>
          <div className={styles.reservationBody}>
            <img src={require('../assets/car.jpg')} alt="Booking preview" className={styles.reservationImage} />
            <div className={styles.reservationDetails}>
              <h4>Your dates are no longer available</h4>
              <p>The listing you were looking for is not available for your selected dates. Please keep searching for other options.</p>
              <button className={styles.keepSearchingBtn} onClick={() => navigate('/search')}>Keep searching</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
