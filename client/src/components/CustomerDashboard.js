import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CustomerDashboard() {
  const [idDocument, setIdDocument] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/bookings/my`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/invoices/my`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Fetch chat messages
  const fetchChatMessages = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chat/messages`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setChatMessages(res.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchInvoices();
    fetchChatMessages();
  }, []);

  // Handle ID upload
  const handleIdUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (idDocument) formData.append('idDocument', idDocument);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/customer/verify-id`, formData, {
        headers: { 'x-auth-token': localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' },
      });
      alert('ID uploaded successfully');
    } catch (error) {
      console.error('Error uploading ID:', error.response?.data || error);
      alert('ID upload failed');
    }
  };

  // Handle sending chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chat/send`, { message: newMessage }, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setChatMessages([...chatMessages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
      alert('Failed to send message');
    }
  };

  return (
    <div>
      <h2>Customer Dashboard</h2>
      
      {/* ID Upload Section */}
      <section>
        <h3>ID Verification</h3>
        <form onSubmit={handleIdUpload}>
          <input type="file" accept="image/*" onChange={(e) => setIdDocument(e.target.files[0])} required />
          <button type="submit">Upload ID Document</button>
        </form>
      </section>

      {/* Bookings Section */}
      <section>
        <h3>Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <ul>
            {bookings.map((booking) => (
              <li key={booking._id}>
                Booking ID: {booking._id} | Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Invoices Section */}
      <section>
        <h3>Invoices</h3>
        {invoices.length === 0 ? (
          <p>No invoices available.</p>
        ) : (
          <ul>
            {invoices.map((invoice) => (
              <li key={invoice._id}>
                <a href={`${process.env.REACT_APP_BACKEND_URL}/invoices/download/${invoice._id}`} target="_blank" rel="noopener noreferrer">
                  Download Invoice for Booking {invoice.bookingId}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Chat Section */}
      <section>
        <h3>Chat</h3>
        <div style={{ border: '1px solid #ccc', padding: '1em', height: '200px', overflowY: 'scroll' }}>
          {chatMessages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx}>
                <strong>{msg.sender}</strong>: {msg.message}
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
      </section>
    </div>
  );
}
