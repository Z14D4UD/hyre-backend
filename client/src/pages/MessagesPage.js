import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/MessagesPage.module.css';

export default function MessagesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';
  const isBusiness = token && accountType === 'business';

  // Side menu
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Filter: "all" or "unread"
  const [filter, setFilter] = useState('all');

  // List of conversations
  const [conversations, setConversations] = useState([]);
  // Selected conversation
  const [selectedConversation, setSelectedConversation] = useState(null);
  // Messages for selected conversation
  const [messages, setMessages] = useState([]);
  // New message text
  const [newMessageText, setNewMessageText] = useState('');
  // File attachment
  const [attachmentFile, setAttachmentFile] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  // Check if user is logged in
  useEffect(() => {
    if (!token) {
      alert('Please log in to view messages.');
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch conversations on mount
  useEffect(() => {
    if (token) {
      axios
        .get(`${backendUrl}/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setConversations(res.data);
        })
        .catch((err) => {
          console.error('Error fetching conversations:', err);
          alert('Failed to load conversations.');
        });
    }
  }, [token, backendUrl]);

  // When conversation is selected, fetch messages
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    // Mark conversation as read
    markConversationRead(selectedConversation._id);

    // Fetch messages
    axios
      .get(`${backendUrl}/chat/conversations/${selectedConversation._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error('Error fetching messages:', err);
        alert('Failed to load messages.');
      });
  }, [selectedConversation, backendUrl, token]);

  // Mark as read
  const markConversationRead = async (conversationId) => {
    try {
      await axios.put(
        `${backendUrl}/chat/conversations/${conversationId}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // set unreadCount=0 in local state
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  // Filter the conversation list
  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'unread') {
      return conv.unreadCount && conv.unreadCount > 0;
    }
    return true;
  });

  // Select conversation
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
  };

  // Send new message
  const handleSendMessage = async () => {
    if (!selectedConversation) {
      return alert('No conversation selected.');
    }
    if (!newMessageText && !attachmentFile) {
      return alert('Type a message or attach a file.');
    }
    try {
      const formData = new FormData();
      formData.append('text', newMessageText);
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
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

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setNewMessageText('');
      setAttachmentFile(null);

      // Also, we might want to update the conversation’s lastMessage in local state
      setConversations((prev) =>
        prev.map((c) =>
          c._id === selectedConversation._id
            ? { ...c, lastMessage: newMsg.text || 'Attachment', updatedAt: new Date() }
            : c
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message.');
    }
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFile(e.target.files[0]);
    }
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
      {(isCustomer || isBusiness) && (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      )}

      <div className={styles.main}>
        {/* Left: conversation list */}
        <div className={styles.conversationsPanel}>
          <div className={styles.filterRow}>
            <button
              className={filter === 'all' ? styles.filterActive : styles.filterButton}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={filter === 'unread' ? styles.filterActive : styles.filterButton}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>

          {filteredConversations.length === 0 ? (
            <div className={styles.noConversations}>No conversations yet.</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                className={
                  conv._id === selectedConversation?._id
                    ? styles.conversationItemActive
                    : styles.conversationItem
                }
                onClick={() => handleSelectConversation(conv)}
              >
                <div className={styles.conversationTop}>
                  <div className={styles.conversationName}>
                    {conv.name || 'Conversation'}
                  </div>
                  <div className={styles.conversationDate}>
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.lastMessage}>
                  {conv.lastMessage || 'No messages yet.'}
                </div>
                {conv.unreadCount > 0 && (
                  <div className={styles.unreadBadge}>{conv.unreadCount}</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right: chat area */}
        <div className={styles.chatArea}>
          {selectedConversation ? (
            <>
              <div className={styles.chatHeader}>
                <h2>{selectedConversation.name || 'Conversation'}</h2>
                {/* Show reservation button if relevant */}
                <button
                  className={styles.reservationButton}
                  onClick={() => alert('Show reservation details (not yet implemented).')}
                >
                  Show reservation
                </button>
              </div>

              <div className={styles.messagesList}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>No messages yet.</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={
                        msg.sender === (/* your user id if you store it */ '???')
                          ? styles.myMessage
                          : styles.otherMessage
                      }
                    >
                      <div className={styles.messageContent}>
                        {msg.attachment && (
                          <div className={styles.attachment}>
                            {/\.(gif|jpe?g|tiff|png|webp|bmp)$/i.test(msg.attachment) ? (
                              <img
                                src={`${backendUrl.replace('/api', '')}/${msg.attachment}`}
                                alt="attachment"
                              />
                            ) : (
                              <a
                                href={`${backendUrl.replace('/api', '')}/${msg.attachment}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Download Attachment
                              </a>
                            )}
                          </div>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      <div className={styles.messageMeta}>
                        <span className={styles.messageDate}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.inputRow}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Type your message..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                />
                <input
                  type="file"
                  onChange={handleAttachmentChange}
                  className={styles.fileInput}
                />
                <button className={styles.sendButton} onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className={styles.selectConversation}>
              Select a conversation to view messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
