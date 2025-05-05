/* eslint-disable */
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/BusinessMessagesPage.module.css';

export default function BusinessMessagesPage() {
  const navigate = useNavigate();
  const token   = localStorage.getItem('token') || '';
  const acct    = localStorage.getItem('accountType');
  const isBiz   = token && acct === 'business';

  /* my business id (decoded from JWT) */
  const myBizId = useMemo(() => {
    try { return jwtDecode(token).id; }
    catch { return null; }
  }, [token]);

  /* ---------- state ---------- */
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [filter,        setFilter]        = useState('all');
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConv,  setSelectedConv]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [messageText,   setMessageText]   = useState('');
  const [attachment,    setAttachment]    = useState(null);
  const [ctx,           setCtx]           = useState({ visible:false,x:0,y:0,id:null,type:null });
  const endRef = useRef(null);

  const backend =
    process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  /* ---------- helpers ---------- */
  const fullAvatar = (u) => (u ? `${backend}/${u}` : '/default-avatar.png');

  const fetchConversations = async () => {
    const { data } = await axios.get(
      `${backend}/chat/conversations?filter=${filter}&search=${encodeURIComponent(searchTerm)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setConversations(data);
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!isBiz) { navigate('/'); return; }
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBiz, filter, searchTerm]);

  const selectConversation = (conv) => {
    setSelectedConv(conv);
    setCtx({ visible:false,x:0,y:0,id:null,type:null });
    Promise.all([
      axios.get(`${backend}/chat/conversations/${conv._id}/messages`,
                { headers:{ Authorization:`Bearer ${token}` }}),
      axios.put(`${backend}/chat/conversations/${conv._id}/read`,{},
                { headers:{ Authorization:`Bearer ${token}` }})
    ]).then(([msgsRes])=>{
      setMessages(msgsRes.data.messages);
      endRef.current?.scrollIntoView({behavior:'smooth'});
    });
  };

  const sendMessage = async () => {
    if (!selectedConv || (!messageText && !attachment)) return;
    const form = new FormData();
    form.append('text', messageText);
    if (attachment) form.append('attachment', attachment);
    const { data:newMsg } = await axios.post(
      `${backend}/chat/conversations/${selectedConv._id}/messages`,
      form,
      { headers:{ Authorization:`Bearer ${token}`,'Content-Type':'multipart/form-data' } }
    );
    setMessages((m) => [...m, newMsg]);
    setMessageText(''); setAttachment(null);
    fetchConversations();
    endRef.current?.scrollIntoView({behavior:'smooth'});
  };

  const handleDelete = async () => {
    if (!ctx.id) return;
    if (ctx.type === 'message') {
      await axios.delete(
        `${backend}/chat/conversations/${selectedConv._id}/messages/${ctx.id}`,
        { headers:{ Authorization:`Bearer ${token}` }});
      setMessages(ms => ms.filter(m => m._id !== ctx.id));
    } else {
      await axios.delete(`${backend}/chat/conversations/${ctx.id}`,
                         { headers:{ Authorization:`Bearer ${token}` }});
      setConversations(cs => cs.filter(c => c._id !== ctx.id));
      if (selectedConv?._id === ctx.id) { setSelectedConv(null); setMessages([]); }
    }
    setCtx({ visible:false,x:0,y:0,id:null,type:null });
  };

  if (!isBiz) return null;

  /* ---------- render ---------- */
  return (
    <div className={styles.container}>

      {/* header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
           <button className={styles.backBtn}onClick={() => { setSelectedConv(null); setMessages([]); }}>←</button>          
<div className={styles.headerTitle}>{selectedConv?.name || 'Messages'}</div>
        </div>
        <button className={styles.menuIcon} onClick={() => setMenuOpen(o=>!o)}>☰</button>
      </header>

      {/* side-menu */}
      <SideMenuBusiness
        isOpen={menuOpen}
        toggleMenu={() => setMenuOpen(o=>!o)}
        closeMenu={() => setMenuOpen(false)}
      />

      {/* two-pane layout */}
      <div className={`${styles.content} ${selectedConv ? styles.hideLeft : ''}`}
           onClick={() => setCtx({visible:false,x:0,y:0,id:null,type:null})}>

        {/* inbox pane */}
        <div className={styles.leftPane}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <div className={styles.filterRow}>
              <button className={`${styles.filterButton} ${filter==='all'&&styles.activeFilter}`}
                      onClick={()=>setFilter('all')}>All</button>
              <button className={`${styles.filterButton} ${filter==='unread'&&styles.activeFilter}`}
                      onClick={()=>setFilter('unread')}>Unread</button>
              <button className={styles.menuIcon} onClick={()=>setSearchOpen(o=>!o)}><FaSearch/></button>
            </div>
            {searchOpen && (
              <div className={styles.searchRow}>
                <input className={styles.searchInput} placeholder="Search..."
                       value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                <button className={styles.cancelSearchBtn} onClick={()=>setSearchOpen(false)}>Cancel</button>
              </div>
            )}
          </div>

          <div className={styles.conversationList}>
            {conversations.map(c => (
              <div key={c._id}
                   className={`${styles.conversationItem} ${selectedConv?._id===c._id&&styles.selectedConv}`}
                   onClick={()=>selectConversation(c)}
                   onContextMenu={e=>{e.preventDefault();setCtx({visible:true,x:e.pageX,y:e.pageY,id:c._id,type:'conversation'});}}>
                <img src={fullAvatar(c.avatarUrl)} className={styles.convAvatar} alt="avatar"/>
                <div className={styles.convoText}>
                  <div className={styles.conversationTitle}>{c.name}</div>
                  <div className={styles.conversationSnippet}>{c.lastMessage||'—'}</div>
                </div>
                {c.unreadCount>0 && <div className={styles.unreadBadge}>{c.unreadCount}</div>}
              </div>
            ))}
            {!conversations.length && <div className={styles.noConversations}>No conversations.</div>}
          </div>
        </div>

        {/* chat pane */}
        <div className={styles.rightPane}>
          <div className={styles.messageThread}>
            {messages.map(m => {
              const senderId = m.sender?._id ?? m.sender?.id ?? m.sender;
              const isBizMsg = senderId === myBizId;
              return (
                <div key={m._id}
                     className={styles.messageItem}
                     data-biz={isBizMsg}
                     onContextMenu={e=>{e.preventDefault();setCtx({visible:true,x:e.pageX,y:e.pageY,id:m._id,type:'message'});}}>
                  <img src={fullAvatar(m.sender.avatarUrl)} className={styles.msgAvatar} alt="avatar"/>
                  <div className={styles.messageBubble}>
                    <div className={styles.msgName}>{m.sender.name}</div>
                    <div className={styles.messageText}>{m.text}</div>
                    {m.attachment && (
                      <div className={styles.attachmentWrapper}>
                        <a href={`${backend}/${m.attachment}`} target="_blank" rel="noreferrer">View Attachment</a>
                      </div>
                    )}
                    <div className={styles.messageTimestamp}>{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef}/>
          </div>

          {ctx.visible && (
            <div className={styles.contextMenu} style={{top:ctx.y,left:ctx.x}}>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}

          {selectedConv && (
            <div className={styles.messageInputArea}>
              <textarea className={styles.textArea} placeholder="Type your message…"
                        value={messageText} onChange={e=>setMessageText(e.target.value)}/>
              <input type="file" className={styles.attachmentInput}
                     onChange={e=>setAttachment(e.target.files[0])}/>
              <button className={styles.sendButton} onClick={sendMessage}>Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
