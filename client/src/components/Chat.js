import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://hyre-backend.onrender.com");

export default function Chat() {
  const [room, setRoom] = useState("defaultRoom");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Join default room
    socket.emit("joinRoom", room);

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    // Cleanup on unmount
    return () => socket.off("receiveMessage");
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      const data = {
        room,
        message,
        sender: "User"  // You can replace this with the actual user name or id
      };
      socket.emit("sendMessage", data);
      setMessage("");
      setChat((prevChat) => [...prevChat, data]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat</h2>
      <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "scroll", padding: "10px" }}>
        {chat.map((msg, index) => (
          <p key={index}><strong>{msg.sender}:</strong> {msg.message}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
