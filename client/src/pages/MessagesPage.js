/* eslint-disable */
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/MessagesPage.module.css';

export default function MessagesPage() {
  const navigate = useNavigate();
  const token   = localStorage.getItem('token') || '';
  const acct    = localStorage.getItem('accountType');
  const isCust  = token && acct === 'customer';

  /* my customer id */
  const myId = useMemo(() => {
    try { return jwtDecode(token).id; }
    catch { return null; }
  }, [token]);

  /* state */
  const [menuOpen, setMenuOpen]        = useState(false);
  const [filter,   setFilter]          = useState('all');
  const [searchOpen, setSearchOpen]    = useState(false);
  const [searchTerm, setSearchTerm]    = useState('');
  const [conversations,setConversations] = useState([]);
  const [selectedConv, setSelectedConv]  = useState(null);
  const [messages, setMessages]        = useState([]);
  const [messageText, setMessageText]  = useState('');
  const [attachment, setAttachment]    = useState(null);
  const [ctx, setCtx]                  = useState({visible:false,x:0,y:0,id:null,type:null});
  const endRef = useRef(null);

  /* ✨ NEW: ref to hold long-press timer */
  const touchTimerRef = useRef(null);

  const backend = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';
  const fullAvatar = (u) => (u ? `${backend}/${u}` : '/default-avatar.png');

  /* load conversations */
  useEffect(()=>{
    if(!isCust){ navigate('/'); return; }
    axios.get(
      `${backend}/chat/conversations?filter=${filter}&search=${encodeURIComponent(searchTerm)}`,
      { headers:{ Authorization:`Bearer ${token}` } }
    ).then(res=>setConversations(res.data));
  },[isCust,filter,searchTerm,backend,token,navigate]);

  /* open convo */
  const selectConversation = conv =>{
    setSelectedConv(conv); setCtx({visible:false,x:0,y:0,id:null,type:null});
    Promise.all([
      axios.get(`${backend}/chat/conversations/${conv._id}/messages`,{headers:{Authorization:`Bearer ${token}`}}),
      axios.put(`${backend}/chat/conversations/${conv._id}/read`,{},   {headers:{Authorization:`Bearer ${token}`}})
    ]).then(([msgsRes])=>{
      setMessages(msgsRes.data.messages);
      endRef.current?.scrollIntoView({behavior:'smooth'});
    });
  };

  /* send */
  const handleSend = async()=>{
    if(!selectedConv || (!messageText && !attachment))return;
    const form=new FormData(); form.append('text',messageText); if(attachment)form.append('attachment',attachment);
    const {data:newMsg}=await axios.post(
      `${backend}/chat/conversations/${selectedConv._id}/messages`,form,
      {headers:{ Authorization:`Bearer ${token}`,'Content-Type':'multipart/form-data' }}
    );
    setMessages(ms=>[...ms,newMsg]); setMessageText(''); setAttachment(null);
    endRef.current?.scrollIntoView({behavior:'smooth'});
  };

  /* delete (message or conversation) */
  const handleDelete = async()=>{
    if(ctx.type==='message'){
      await axios.delete(`${backend}/chat/conversations/${selectedConv._id}/messages/${ctx.id}`,
                         {headers:{Authorization:`Bearer ${token}` }});
      setMessages(ms=>ms.filter(m=>m._id!==ctx.id));
    } else {
      await axios.delete(`${backend}/chat/conversations/${ctx.id}`,
                         {headers:{Authorization:`Bearer ${token}` }});
      setConversations(cs=>cs.filter(c=>c._id!==ctx.id));
      if(selectedConv?._id===ctx.id){ setSelectedConv(null); setMessages([]); }
    }
    setCtx({visible:false,x:0,y:0,id:null,type:null});
  };

  /* ✨ helpers for long-press on touch devices */
  const startHold = (e,type,id)=>{
    const { pageX, pageY } = e.touches ? e.touches[0] : e;
    touchTimerRef.current = setTimeout(()=>{
      setCtx({visible:true,x:pageX,y:pageY,id,type});
    },600);                                  // 600 ms = “hold”
  };
  const cancelHold = ()=> clearTimeout(touchTimerRef.current);

  if(!isCust) return null;

  /* render */
  return (
    <div className={styles.container}>

      {/* header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {selectedConv && <button className={styles.backBtn}
                                   onClick={()=>{setSelectedConv(null);setMessages([]);}}>←</button>}
          <div className={styles.headerTitle}>{selectedConv?.name || 'Messages'}</div>
        </div>
        <button className={styles.menuIcon} onClick={()=>setMenuOpen(o=>!o)}>☰</button>
      </header>

      {/* side-menu */}
      <SideMenuCustomer isOpen={menuOpen}
                        toggleMenu={()=>setMenuOpen(o=>!o)}
                        closeMenu={()=>setMenuOpen(false)}/>

      {/* main layout */}
      <div className={`${styles.content} ${selectedConv?styles.hideLeft:''}`}
           onClick={()=>setCtx({visible:false,x:0,y:0,id:null,type:null})}>

        {/* inbox left */}
        {!selectedConv && (
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
              {conversations.map(c=>(
                <div key={c._id}
                     className={`${styles.conversationItem} ${selectedConv?._id===c._id&&styles.selectedConv}`}
                     onClick={()=>selectConversation(c)}
                     onContextMenu={e=>{e.preventDefault();setCtx({visible:true,x:e.pageX,y:e.pageY,id:c._id,type:'conversation'});}}
                     onTouchStart={e=>startHold(e,'conversation',c._id)}   /* ✨ */
                     onTouchEnd={cancelHold}>
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
        )}

        {/* chat right */}
        {selectedConv && (
          <div className={styles.rightPane}>
            <div className={styles.messageThread}>
              {messages.map(m=>{
                const senderId  = m.sender?._id ?? m.sender?.id ?? m.sender;
                const isCustMsg = senderId === myId;
                return (
                  <div key={m._id} className={styles.messageItem}
                       data-cust={isCustMsg}
                       onContextMenu={e=>{e.preventDefault();setCtx({visible:true,x:e.pageX,y:e.pageY,id:m._id,type:'message'});}}
                       onTouchStart={e=>startHold(e,'message',m._id)}   /* ✨ */
                       onTouchEnd={cancelHold}>
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

            <div className={styles.messageInputArea}>
              <textarea className={styles.textArea} placeholder="Type your message…"
                        value={messageText} onChange={e=>setMessageText(e.target.value)}/>
              <input type="file" className={styles.attachmentInput}
                     onChange={e=>setAttachment(e.target.files[0])}/>
              <button className={styles.sendButton} onClick={handleSend}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
